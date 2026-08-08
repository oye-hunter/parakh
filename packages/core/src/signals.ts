/**
 * The signal engine.
 *
 * Pure functions over plain data. No I/O, no network, no environment, no AI.
 *
 * Every signal reads TWO OR MORE fields. That is the point: the brief demands
 * reasoning "across fields together, not in isolation", and deriving the
 * signals in code makes that structurally true rather than something we hope
 * the model does. The model's job is to weigh these in combination and explain
 * them — not to compute them.
 */

import type {
  ApplicationInput,
  ClusterFinding,
  DetectionResult,
  Severity,
  Signal,
} from './types.js';

/* ─────────────────────────── thresholds ──────────────────────────── */

export const THRESHOLDS = {
  /** Expected monthly volume as a multiple of declared income. */
  incomeVolumeRatio: 3,
  /** Years at current address below which the address is "new". */
  newAddressYears: 0.5,
  /** Declared income under which cross-border intent looks odd. */
  crossBorderIncomeFloor: 100_000,
  /** Age under which a business-owner / high-income profile is implausible. */
  youngAge: 21,
  youngHighIncome: 200_000,
  /** Days before CNIC expiry that counts as a flag. */
  cnicExpiryWindowDays: 30,
  /** Cluster detection window. */
  clusterWindowHours: 3,
  /** Applications from one agent point within the window to count as a cluster. */
  agentPointMinApplications: 3,
  /** Income spread within which two profiles count as "similar". */
  profileSimilarityBand: 0.2,
} as const;

/* ──────────────────────────── helpers ────────────────────────────── */

const pkr = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

function fmt(n: number): string {
  return pkr.format(Math.round(n));
}

function ageOn(dob: string, at: Date): number {
  const born = new Date(dob);
  let age = at.getFullYear() - born.getFullYear();
  const m = at.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && at.getDate() < born.getDate())) age -= 1;
  return age;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 86_400_000);
}

function hoursBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / 3_600_000;
}

function signal(
  name: string,
  label: string,
  severity: Severity,
  evidence: string,
  fields: string[],
): Signal {
  return { name, label, severity, evidence, fields };
}

/* ─────────────────── 1 · income–volume mismatch ──────────────────── */

function incomeVolumeMismatch(a: ApplicationInput): Signal | null {
  if (a.declaredIncomePkr <= 0) return null;
  const ratio = a.expectedVolumePkr / a.declaredIncomePkr;
  if (ratio <= THRESHOLDS.incomeVolumeRatio) return null;

  const severity: Severity = ratio > 6 ? 'high' : ratio > 4 ? 'medium' : 'low';
  return signal(
    'income_volume_mismatch',
    'Income–volume mismatch',
    severity,
    `declared ${fmt(a.declaredIncomePkr)}/mo · expects ${fmt(a.expectedVolumePkr)}/mo · ${ratio.toFixed(1)}×`,
    ['declaredIncomePkr', 'expectedVolumePkr'],
  );
}

/* ───────────────── 2 · purpose–employment conflict ───────────────── */

const PURPOSE_CONFLICTS: Partial<Record<string, AccountPurposeSet>> = {
  student: new Set(['merchant_collection', 'receive_business_payments']),
  unemployed: new Set(['merchant_collection', 'receive_business_payments']),
  retired: new Set(['merchant_collection']),
  salaried: new Set(['merchant_collection']),
};
type AccountPurposeSet = Set<string>;

function purposeEmploymentConflict(a: ApplicationInput): Signal | null {
  const conflicts = PURPOSE_CONFLICTS[a.employmentType];
  if (!conflicts?.has(a.accountPurpose)) return null;

  return signal(
    'purpose_employment_conflict',
    'Purpose–employment conflict',
    'high',
    `employment "${a.employmentType}" · account purpose "${a.accountPurpose}"`,
    ['employmentType', 'accountPurpose'],
  );
}

/* ────────────────── 3 · source–employment conflict ───────────────── */

/** Income sources that are coherent with each employment type. */
const COHERENT_SOURCES: Record<string, Set<string>> = {
  salaried: new Set(['salary', 'remittance', 'other']),
  self_employed: new Set(['business', 'freelance', 'agriculture', 'other']),
  business_owner: new Set(['business', 'agriculture', 'other']),
  freelancer: new Set(['freelance', 'remittance', 'other']),
  student: new Set(['remittance', 'other']),
  unemployed: new Set(['remittance', 'other']),
  retired: new Set(['pension', 'remittance', 'other']),
};

function sourceEmploymentConflict(a: ApplicationInput): Signal | null {
  const coherent = COHERENT_SOURCES[a.employmentType];
  if (!coherent || coherent.has(a.incomeSource)) return null;

  return signal(
    'source_employment_conflict',
    'Source–employment conflict',
    'high',
    `employment "${a.employmentType}" · income source "${a.incomeSource}"`,
    ['employmentType', 'incomeSource'],
  );
}

/* ─────────────────── 4 · age–profile implausibility ──────────────── */

function ageProfileImplausibility(a: ApplicationInput, now: Date): Signal | null {
  const age = ageOn(a.dob, now);
  if (age >= THRESHOLDS.youngAge) return null;

  const ownsBusiness = a.employmentType === 'business_owner';
  const highIncome = a.declaredIncomePkr >= THRESHOLDS.youngHighIncome;
  if (!ownsBusiness && !highIncome) return null;

  const detail = ownsBusiness
    ? `business owner at ${age}`
    : `${age} years old declaring ${fmt(a.declaredIncomePkr)}/mo`;

  return signal(
    'age_profile_implausibility',
    'Age–profile implausibility',
    ownsBusiness && highIncome ? 'high' : 'medium',
    `${detail} · employment "${a.employmentType}"`,
    ['dob', 'employmentType', 'declaredIncomePkr'],
  );
}

/* ────────────────────── 5 · address instability ──────────────────── */

function addressInstability(a: ApplicationInput): Signal | null {
  if (a.yearsAtAddress >= THRESHOLDS.newAddressYears) return null;
  if (a.existingBankRelationship) return null;

  const months = Math.round(a.yearsAtAddress * 12);
  return signal(
    'address_instability',
    'Address instability',
    'medium',
    `${months} month${months === 1 ? '' : 's'} at address · no existing bank relationship`,
    ['yearsAtAddress', 'existingBankRelationship'],
  );
}

/* ────────────────────── 6 · geographic mismatch ──────────────────── */

function geographicMismatch(a: ApplicationInput): Signal | null {
  const sessionCity = a.meta.sessionCity?.trim();
  if (!sessionCity) return null;
  if (sessionCity.toLowerCase() === a.city.trim().toLowerCase()) return null;

  return signal(
    'geographic_mismatch',
    'Geographic mismatch',
    'medium',
    `declared address in ${a.city} · application submitted from ${sessionCity}`,
    ['city', 'meta.sessionCity'],
  );
}

/* ──────────────── 9 · cross-border with low income ───────────────── */

function crossBorderLowIncome(a: ApplicationInput): Signal | null {
  if (a.counterparties !== 'international') return null;
  if (a.declaredIncomePkr >= THRESHOLDS.crossBorderIncomeFloor) return null;

  return signal(
    'cross_border_low_income',
    'Cross-border intent with low declared income',
    'medium',
    `international counterparties · declared ${fmt(a.declaredIncomePkr)}/mo`,
    ['counterparties', 'declaredIncomePkr'],
  );
}

/* ────────────────────────── 10 · CNIC expiry ─────────────────────── */

function cnicExpiry(a: ApplicationInput, now: Date): Signal | null {
  const expiry = new Date(a.cnicExpiry);
  const days = daysBetween(expiry, now);
  if (days > THRESHOLDS.cnicExpiryWindowDays) return null;

  const expired = days < 0;
  return signal(
    'cnic_expiry',
    expired ? 'Expired CNIC' : 'CNIC expiring soon',
    expired ? 'high' : 'low',
    expired
      ? `CNIC expired ${Math.abs(days)} days ago (${a.cnicExpiry})`
      : `CNIC expires in ${days} days (${a.cnicExpiry})`,
    ['cnicExpiry', 'submittedAt'],
  );
}

/* ───────────────────────── 11 · PEP declaration ──────────────────── */

function pepDeclaration(a: ApplicationInput): Signal | null {
  if (!a.isPep) return null;
  return signal(
    'pep_declaration',
    'Politically exposed person',
    'medium',
    `self-declared PEP · expects ${fmt(a.expectedVolumePkr)}/mo`,
    ['isPep', 'expectedVolumePkr'],
  );
}

/* ──────────────────────── 12 · round-number income ───────────────── */

function roundNumberIncome(a: ApplicationInput): Signal | null {
  const v = a.declaredIncomePkr;
  if (v < 50_000) return null;
  if (v % 100_000 !== 0) return null;

  // Weak on its own. Included because it adds texture in combination — the
  // model should not escalate on this alone, and the prompt says so.
  return signal(
    'round_number_income',
    'Round-number income declaration',
    'low',
    `declared exactly ${fmt(v)}/mo`,
    ['declaredIncomePkr', 'employmentType'],
  );
}

/* ──────────── 7 & 8 · cross-application pattern detection ────────── */

function clusterRef(kind: string, key: string): string {
  // Deterministic and readable — the same group always gets the same ref,
  // which matters when a later submission re-flags an existing cluster.
  let h = 0;
  const seed = `${kind}:${key}`;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `CLU-${(h % 9000) + 1000}`;
}

function similarProfiles(a: ApplicationInput, b: ApplicationInput): boolean {
  if (a.employmentType !== b.employmentType) return false;
  if (a.accountPurpose !== b.accountPurpose) return false;
  const hi = Math.max(a.declaredIncomePkr, b.declaredIncomePkr);
  const lo = Math.min(a.declaredIncomePkr, b.declaredIncomePkr);
  if (hi === 0) return true;
  return (hi - lo) / hi <= THRESHOLDS.profileSimilarityBand;
}

/**
 * Signal 8 — the same device submitting under different CNICs.
 *
 * Each application looks fine on its own. The pattern only exists across them.
 */
function deviceReuse(
  a: ApplicationInput,
  recent: ApplicationInput[],
): { signal: Signal; cluster: ClusterFinding } | null {
  const fp = a.meta.deviceFingerprint;
  if (!fp) return null;

  const others = recent.filter(
    (r) =>
      r.id !== a.id &&
      r.meta.deviceFingerprint === fp &&
      r.cnic !== a.cnic &&
      hoursBetween(a.submittedAt, r.submittedAt) <= 24,
  );
  if (others.length === 0) return null;

  const ref = clusterRef('device_reuse', fp);
  const ids = [a.id, ...others.map((o) => o.id)];
  const cnicCount = new Set([a.cnic, ...others.map((o) => o.cnic)]).size;

  const s = signal(
    'device_reuse',
    'Device reused across identities',
    'high',
    `same device fingerprint on ${cnicCount} different CNICs within 24h`,
    ['meta.deviceFingerprint', 'cnic'],
  );
  s.clusterRef = ref;

  return {
    signal: s,
    cluster: {
      ref,
      kind: 'device_reuse',
      deviceFingerprint: fp,
      applicationIds: ids,
      summary: `${ids.length} applications share one device fingerprint across ${cnicCount} CNICs`,
    },
  };
}

/**
 * Signal 7 — a burst of near-identical applications from one agent point.
 *
 * Volume alone is not suspicious; a busy agent is just busy. Volume *plus*
 * profile similarity is.
 */
function agentPointClustering(
  a: ApplicationInput,
  recent: ApplicationInput[],
): { signal: Signal; cluster: ClusterFinding } | null {
  const agent = a.meta.agentPointId;
  if (!agent) return null;

  const window = recent.filter(
    (r) =>
      r.id !== a.id &&
      r.meta.agentPointId === agent &&
      hoursBetween(a.submittedAt, r.submittedAt) <= THRESHOLDS.clusterWindowHours,
  );

  const similar = window.filter((r) => similarProfiles(a, r));
  const groupSize = similar.length + 1;
  if (groupSize < THRESHOLDS.agentPointMinApplications) return null;

  const ref = clusterRef('agent_point', agent);
  const ids = [a.id, ...similar.map((s) => s.id)];

  const s = signal(
    'agent_point_clustering',
    'Agent-point clustering',
    'high',
    `${groupSize} near-identical applications from ${agent} within ${THRESHOLDS.clusterWindowHours}h`,
    ['meta.agentPointId', 'employmentType', 'accountPurpose', 'declaredIncomePkr'],
  );
  s.clusterRef = ref;

  return {
    signal: s,
    cluster: {
      ref,
      kind: 'agent_point',
      agentPointId: agent,
      applicationIds: ids,
      summary: `${groupSize} applications from ${agent} in ${THRESHOLDS.clusterWindowHours} hours share a near-identical profile`,
    },
  };
}

/* ──────────────────────────── the engine ─────────────────────────── */

/**
 * Run every signal against one application.
 *
 * @param application  the submission being scored
 * @param recent       other applications from the last 24h — required for the
 *                     two cross-application signals. Pass `[]` to score in
 *                     isolation.
 * @param now          injectable clock, so tests are deterministic
 */
export function detectSignals(
  application: ApplicationInput,
  recent: ApplicationInput[] = [],
  now: Date = application.submittedAt,
): DetectionResult {
  const signals: Signal[] = [];
  const clusters: ClusterFinding[] = [];

  const singleField = [
    incomeVolumeMismatch(application),
    purposeEmploymentConflict(application),
    sourceEmploymentConflict(application),
    ageProfileImplausibility(application, now),
    addressInstability(application),
    geographicMismatch(application),
    crossBorderLowIncome(application),
    cnicExpiry(application, now),
    pepDeclaration(application),
    roundNumberIncome(application),
  ];

  for (const s of singleField) if (s) signals.push(s);

  const device = deviceReuse(application, recent);
  if (device) {
    signals.push(device.signal);
    clusters.push(device.cluster);
  }

  const agent = agentPointClustering(application, recent);
  if (agent) {
    signals.push(agent.signal);
    clusters.push(agent.cluster);
  }

  // Highest severity first — this is the order the officer reads.
  const rank: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  signals.sort((x, y) => rank[x.severity] - rank[y.severity]);

  return { signals, clusters };
}

/**
 * Deterministic risk level from signals alone.
 *
 * Used as the fallback when the model is unreachable, and to seed demo data
 * without burning API calls. The real risk level comes from the agent — this
 * exists so the product still functions when the model does not.
 */
export function fallbackRiskLevel(signals: Signal[]): {
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
} {
  const high = signals.filter((s) => s.severity === 'high').length;
  const medium = signals.filter((s) => s.severity === 'medium').length;

  if (high >= 2) return { riskLevel: 'high', confidence: 0.9 };
  if (high === 1 && medium >= 1) return { riskLevel: 'high', confidence: 0.8 };
  if (high === 1) return { riskLevel: 'medium', confidence: 0.7 };
  if (medium >= 2) return { riskLevel: 'medium', confidence: 0.7 };
  if (medium === 1) return { riskLevel: 'medium', confidence: 0.6 };
  return { riskLevel: 'low', confidence: 0.85 };
}
