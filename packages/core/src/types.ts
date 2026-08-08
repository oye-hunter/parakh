/**
 * Core types.
 *
 * Deliberately independent of the database layer: the signal engine is a pure
 * function over plain data so it can be unit-tested with no Neon connection and
 * no environment. The API maps Drizzle rows into these shapes.
 */

export type EmploymentType =
  | 'salaried'
  | 'self_employed'
  | 'business_owner'
  | 'freelancer'
  | 'student'
  | 'unemployed'
  | 'retired';

export type IncomeSource =
  | 'salary'
  | 'business'
  | 'freelance'
  | 'remittance'
  | 'agriculture'
  | 'pension'
  | 'other';

export type ResidenceType = 'owned' | 'rented' | 'family';

export type AccountPurpose =
  | 'personal_use'
  | 'receive_business_payments'
  | 'receive_remittance'
  | 'savings'
  | 'merchant_collection';

export type Counterparties = 'domestic' | 'international';

export type Severity = 'low' | 'medium' | 'high';

export type RiskLevel = 'low' | 'medium' | 'high';

export type RecommendedAction = 'auto_approve' | 'manual_review' | 'edd_queue';

/** What the applicant declared, plus what the system observed. */
export interface ApplicationInput {
  id: string;
  reference: string;

  // identity
  cnic: string;
  fullName: string;
  /** ISO date, e.g. "1994-03-12" */
  dob: string;
  /** ISO date */
  cnicExpiry: string;

  // address
  city: string;
  area: string;
  residenceType: ResidenceType;
  yearsAtAddress: number;

  // work & income
  employmentType: EmploymentType;
  employerName?: string | null;
  incomeSource: IncomeSource;
  declaredIncomePkr: number;

  // account purpose & expected activity
  accountPurpose: AccountPurpose;
  expectedVolumePkr: number;
  expectedTxnCount: number;
  counterparties: Counterparties;
  isPep: boolean;
  existingBankRelationship: boolean;

  submittedAt: Date;

  /** Observed, not declared. */
  meta: {
    deviceFingerprint: string;
    agentPointId: string;
    sessionCity?: string | null;
  };
}

/**
 * One tripped signal.
 *
 * `evidence` is not decoration — it renders directly in the officer's evidence
 * row and is what proves "never a silent score". It must always contain the
 * real figures, never a restatement of the label.
 */
export interface Signal {
  name: string;
  label: string;
  severity: Severity;
  evidence: string;
  /** Which input fields this signal read. Two or more, always. */
  fields: string[];
  /** Set only by the cross-application signals. */
  clusterRef?: string;
}

/** A cross-application pattern, invisible within any single form. */
export interface ClusterFinding {
  ref: string;
  kind: 'device_reuse' | 'agent_point';
  agentPointId?: string;
  deviceFingerprint?: string;
  applicationIds: string[];
  summary: string;
}

export interface DetectionResult {
  signals: Signal[];
  clusters: ClusterFinding[];
}

export interface ContributingSignal {
  name: string;
  label: string;
  weight: number;
  evidence: string;
}

export interface RiskProfileResult {
  riskLevel: RiskLevel;
  confidence: number;
  reasoning: string;
  contributingSignals: ContributingSignal[];
  recommendedAction: RecommendedAction;
  model: string;
  latencyMs: number;
  /** True when the model failed and the deterministic fallback produced this. */
  fallback: boolean;
}
