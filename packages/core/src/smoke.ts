/**
 * Live check against Groq.
 *
 *   pnpm --filter @parakh/core smoke
 *
 * Run this before the demo. Groq rotates model availability, and a 404 on the
 * model id is the kind of thing you want to find on Tuesday, not on stage.
 */
import 'dotenv/config';

import { profileRisk } from './agent.js';
import { detectSignals } from './signals.js';
import type { ApplicationInput } from './types.js';

const NOW = new Date();

const kamran: ApplicationInput = {
  id: 'smoke-kamran',
  reference: 'PK-0001',
  cnic: '37405-1234567-1',
  fullName: 'Kamran Iqbal',
  dob: '1994-06-02',
  cnicExpiry: '2031-06-02',
  city: 'Rawalpindi',
  area: 'Liaquat Bazaar',
  residenceType: 'owned',
  yearsAtAddress: 4,
  employmentType: 'business_owner',
  employerName: 'Iqbal General Store',
  incomeSource: 'business',
  declaredIncomePkr: 85_000,
  accountPurpose: 'receive_business_payments',
  expectedVolumePkr: 150_000,
  expectedTxnCount: 60,
  counterparties: 'domestic',
  isPep: false,
  existingBankRelationship: true,
  submittedAt: NOW,
  meta: { deviceFingerprint: 'fp-kamran', agentPointId: 'RWP-114', sessionCity: 'Rawalpindi' },
};

const bilal: ApplicationInput = {
  ...kamran,
  id: 'smoke-bilal',
  reference: 'PK-0002',
  cnic: '61101-7654321-3',
  fullName: 'Bilal Ahmed',
  dob: '2004-02-11',
  employmentType: 'salaried',
  employerName: 'Northline Traders',
  incomeSource: 'business',
  declaredIncomePkr: 45_000,
  expectedVolumePkr: 400_000,
  counterparties: 'international',
  yearsAtAddress: 0.25,
  existingBankRelationship: false,
  meta: { deviceFingerprint: 'fp-bilal', agentPointId: 'RWP-114', sessionCity: 'Rawalpindi' },
};

async function run(label: string, app: ApplicationInput) {
  const { signals } = detectSignals(app, [], NOW);
  const profile = await profileRisk(app, signals);

  console.log(`\n${'─'.repeat(72)}`);
  console.log(`${label}  →  ${profile.riskLevel.toUpperCase()}  (confidence ${profile.confidence})`);
  console.log(`model: ${profile.model} · ${profile.latencyMs}ms${profile.fallback ? '  ⚠️  FALLBACK' : ''}`);
  console.log(`action: ${profile.recommendedAction}`);
  console.log(`\nsignals (${signals.length}):`);
  for (const s of signals) console.log(`  · [${s.severity}] ${s.label} — ${s.evidence}`);
  console.log(`\nreasoning:\n  ${profile.reasoning.replace(/\n/g, '\n  ')}`);

  return profile;
}

const results = [await run('Kamran — expect LOW', kamran), await run('Bilal — expect HIGH', bilal)];

console.log(`\n${'─'.repeat(72)}`);
if (results.some((r) => r.fallback)) {
  console.error('\n❌ At least one call fell back. Check GROQ_API_KEY and GROQ_MODEL.');
  console.error('   Valid model ids: https://console.groq.com/docs/models');
  process.exit(1);
}
console.log('\n✅ Groq reachable, model valid, output schema satisfied.');
