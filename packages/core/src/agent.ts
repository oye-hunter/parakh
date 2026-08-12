import Groq from 'groq-sdk';

import { buildPrompt, SYSTEM_PROMPT } from './prompt';
import { RiskProfileSchema, type RiskProfileOutput } from './risk';
import { fallbackRiskLevel } from './signals';
import type {
  ApplicationInput,
  ContributingSignal,
  RiskProfileResult,
  Signal,
} from './types';

/**
 * Groq model id.
 *
 * Configurable because Groq rotates model availability — verify against
 * https://console.groq.com/docs/models before the demo. Must support JSON
 * output mode.
 */
export function groqModel(): string {
  return process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';
}

let _client: Groq | undefined;

function client(): Groq {
  if (!_client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set. Copy .env.example to .env and add your key.');
    }
    _client = new Groq({
      apiKey,
      // An onboarding request must not hang on a slow inference provider. Twelve
      // seconds is generous for a 900-token completion; past that the
      // deterministic scorer is a better answer than a spinner.
      timeout: 12_000,
      // We run our own retry loop with validation, so the SDK should not also
      // retry underneath us and multiply the worst-case latency.
      maxRetries: 0,
    });
  }
  return _client;
}

/**
 * Map the model's ranked signal names back onto real signals.
 *
 * The model may only *rank* what the engine produced. Anything it invents is
 * dropped here rather than shown to an officer — evidence comes from the
 * engine, never from generation.
 */
function reconcile(output: RiskProfileOutput, signals: Signal[]): ContributingSignal[] {
  const bySignalName = new Map(signals.map((s) => [s.name, s]));

  const ranked = output.contributing_signals
    .map((c) => {
      const match = bySignalName.get(c.name);
      if (!match) return null;
      bySignalName.delete(c.name);
      return {
        name: match.name,
        label: match.label,
        weight: c.weight,
        evidence: match.evidence,
      };
    })
    .filter((c): c is ContributingSignal => c !== null);

  // Anything the engine found but the model did not rank still belongs on the
  // case file — an unranked signal is not an absent one.
  const severityWeight = { high: 0.2, medium: 0.1, low: 0.05 } as const;
  for (const leftover of bySignalName.values()) {
    ranked.push({
      name: leftover.name,
      label: leftover.label,
      weight: severityWeight[leftover.severity],
      evidence: leftover.evidence,
    });
  }

  return ranked;
}

/** Deterministic result, used when the model is unreachable or keeps drifting. */
function fallbackResult(signals: Signal[], startedAt: number, reason: string): RiskProfileResult {
  const { riskLevel, confidence } = fallbackRiskLevel(signals);

  const top = signals.slice(0, 3).map((s) => s.evidence);
  const reasoning =
    signals.length === 0
      ? 'No cross-field checks tripped. The declared income, employment type, account purpose and expected activity are consistent with each other, and no pattern was found across recent applications.'
      : `Automated review flagged ${signals.length} signal${signals.length === 1 ? '' : 's'}: ${top.join('; ')}. This assessment was produced by the deterministic scorer because the reasoning model was unavailable (${reason}), so the explanation is limited to the evidence itself.`;

  return {
    riskLevel,
    confidence,
    reasoning,
    contributingSignals: signals.map((s) => ({
      name: s.name,
      label: s.label,
      weight: s.severity === 'high' ? 0.3 : s.severity === 'medium' ? 0.15 : 0.05,
      evidence: s.evidence,
    })),
    recommendedAction:
      riskLevel === 'high' ? 'edd_queue' : riskLevel === 'medium' ? 'manual_review' : 'auto_approve',
    model: 'deterministic-fallback',
    latencyMs: Date.now() - startedAt,
    fallback: true,
  };
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Some models wrap JSON in prose or a fenced block despite instructions.
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced?.[1]) return JSON.parse(fenced[1].trim());
    const braced = trimmed.slice(trimmed.indexOf('{'), trimmed.lastIndexOf('}') + 1);
    return JSON.parse(braced);
  }
}

/**
 * Produce a risk profile for one application.
 *
 * Never throws. A model failure degrades to the deterministic scorer rather
 * than taking down onboarding — a bank that cannot open accounts because an
 * inference provider is slow is worse than one scoring conservatively.
 */
export async function profileRisk(
  application: ApplicationInput,
  signals: Signal[],
  options: { maxAttempts?: number } = {},
): Promise<RiskProfileResult> {
  const startedAt = Date.now();
  const model = groqModel();
  const maxAttempts = options.maxAttempts ?? 2;

  let lastError = 'unknown error';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const completion = await client().chat.completions.create({
        model,
        temperature: 0.2,
        max_tokens: 900,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildPrompt(application, signals) },
        ],
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) throw new Error('empty completion');

      const parsed = RiskProfileSchema.parse(extractJson(raw));

      return {
        riskLevel: parsed.risk_level,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning.trim(),
        contributingSignals: reconcile(parsed, signals),
        recommendedAction: parsed.recommended_action,
        model,
        latencyMs: Date.now() - startedAt,
        fallback: false,
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt === maxAttempts) break;
    }
  }

  return fallbackResult(signals, startedAt, lastError);
}
