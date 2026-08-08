import { z } from 'zod';

/**
 * The contract for what the model must return.
 *
 * Validated on every response. If the model drifts — extra prose, a missing
 * field, a signal it invented — validation fails and we retry once, then fall
 * back to the deterministic scorer. The product never shows an unvalidated
 * judgment to an officer.
 */
export const RiskProfileSchema = z.object({
  risk_level: z.enum(['low', 'medium', 'high']),

  confidence: z.number().min(0).max(1),

  /**
   * Ranked, most influential first. `name` must match a signal the engine
   * actually produced — checked separately in the agent, because the model
   * cannot be trusted to invent evidence.
   */
  contributing_signals: z
    .array(
      z.object({
        name: z.string().min(1),
        weight: z.number().min(0).max(1),
      }),
    )
    .max(12),

  /**
   * Written for a human. Plain language, no field names, no JSON, no bullets —
   * this is the paragraph the officer reads and the sentence the judges hear.
   */
  reasoning: z.string().min(40).max(1200),

  recommended_action: z.enum(['auto_approve', 'manual_review', 'edd_queue']),
});

export type RiskProfileOutput = z.infer<typeof RiskProfileSchema>;

/** JSON Schema form, for models that support structured output natively. */
export const RISK_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['risk_level', 'confidence', 'contributing_signals', 'reasoning', 'recommended_action'],
  properties: {
    risk_level: { type: 'string', enum: ['low', 'medium', 'high'] },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    contributing_signals: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'weight'],
        properties: {
          name: { type: 'string' },
          weight: { type: 'number', minimum: 0, maximum: 1 },
        },
      },
    },
    reasoning: { type: 'string' },
    recommended_action: {
      type: 'string',
      enum: ['auto_approve', 'manual_review', 'edd_queue'],
    },
  },
} as const;
