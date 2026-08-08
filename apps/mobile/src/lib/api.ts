import { authClient } from './auth-client';
import { API_URL } from './config';

/**
 * Typed client for the Parakh API.
 *
 * Officer requests carry the session that the Expo auth plugin stores in
 * SecureStore, plus an `Origin` header — Better Auth's CSRF protection rejects
 * any cookie-bearing request without one (403 MISSING_OR_NULL_ORIGIN), and
 * React Native does not set it the way a browser does.
 */

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly issues?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { authenticated?: boolean } = {},
): Promise<T> {
  const { authenticated = true, ...rest } = init;

  const headers: Record<string, string> = {
    origin: API_URL,
    ...(rest.body ? { 'content-type': 'application/json' } : {}),
    ...((rest.headers as Record<string, string>) ?? {}),
  };

  if (authenticated) {
    const cookie = authClient.getCookie();
    if (cookie) headers.cookie = cookie;
  }

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers });

  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError('bad_response', 'The server returned something unreadable.', res.status);
  }

  if (!res.ok) {
    const e = body as { error?: string; message?: string; issues?: { field: string; message: string }[] };
    throw new ApiError(
      e?.error ?? 'request_failed',
      e?.message ?? `Request failed (${res.status})`,
      res.status,
      e?.issues,
    );
  }

  return body as T;
}

/* ───────────────────────────── applicant ─────────────────────────── */

export interface ApplicationPayload {
  cnic: string;
  fullName: string;
  dob: string;
  cnicExpiry: string;
  city: string;
  area: string;
  residenceType: 'owned' | 'rented' | 'family';
  yearsAtAddress: number;
  employmentType:
    | 'salaried'
    | 'self_employed'
    | 'business_owner'
    | 'freelancer'
    | 'student'
    | 'unemployed'
    | 'retired';
  employerName?: string | null;
  incomeSource: 'salary' | 'business' | 'freelance' | 'remittance' | 'agriculture' | 'pension' | 'other';
  declaredIncomePkr: number;
  accountPurpose:
    | 'personal_use'
    | 'receive_business_payments'
    | 'receive_remittance'
    | 'savings'
    | 'merchant_collection';
  expectedVolumePkr: number;
  expectedTxnCount: number;
  counterparties: 'domestic' | 'international';
  isPep: boolean;
  existingBankRelationship: boolean;
  meta: {
    deviceFingerprint: string;
    agentPointId: string;
    sessionCity?: string | null;
    secondsPerStep?: number[];
  };
}

export interface SubmissionReceipt {
  reference: string;
  status: 'approved' | 'under_review';
  submittedAt: string;
}

/** Public — an applicant has no account yet. That is the entire point. */
export function submitApplication(payload: ApplicationPayload) {
  return request<SubmissionReceipt>('/api/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
    authenticated: false,
  });
}

/* ────────────────────────────── officer ──────────────────────────── */

export type RiskLevel = 'low' | 'medium' | 'high';

export interface CaseListItem {
  caseId: string;
  applicationId: string;
  reference: string;
  fullName: string;
  cnic: string;
  agentPointId: string;
  status: 'pending' | 'edd_queue' | 'approved' | 'declined' | 'escalated';
  riskLevel: RiskLevel | null;
  confidence: number | null;
  topSignal: { label: string; evidence: string } | null;
  signalCount: number;
  clusterRef: string | null;
  submittedAt: string;
}

export interface CaseDetail {
  caseId: string;
  status: CaseListItem['status'];
  queuedAt: string | null;
  resolvedAt: string | null;
  applicant: {
    reference: string;
    fullName: string;
    cnic: string;
    dob: string;
    cnicExpiry: string;
    city: string;
    area: string;
    residenceType: string;
    yearsAtAddress: number;
    employmentType: string;
    employerName: string | null;
    incomeSource: string;
    declaredIncomePkr: number;
    accountPurpose: string;
    expectedVolumePkr: number;
    expectedTxnCount: number;
    counterparties: string;
    isPep: boolean;
    existingBankRelationship: boolean;
    submittedAt: string;
    agentPointId: string;
  };
  risk: {
    level: RiskLevel;
    confidence: number;
    reasoning: string;
    recommendedAction: string;
    model: string;
    latencyMs: number | null;
  } | null;
  signals: {
    name: string;
    label: string;
    severity: RiskLevel;
    evidence: string;
    fields: string[];
    clusterRef: string | null;
  }[];
  cluster: { ref: string; kind: string; summary: string; applicationCount: number } | null;
  history: {
    action: 'approve' | 'reject' | 'escalate';
    justification: string;
    officer: string;
    riskSnapshot: RiskLevel;
    confidenceSnapshot: number;
    reasoningSnapshot: string;
    decidedAt: string;
  }[];
}

export interface DashboardData {
  stats: {
    applicationsToday: number;
    inEddQueue: number;
    resolvedToday: number;
    medianDecisionMinutes: number | null;
  };
  distribution: { low: number; medium: number; high: number };
  clusters: {
    ref: string;
    kind: string;
    summary: string;
    applicationCount: number;
    detectedAt: string;
  }[];
}

export function getDashboard() {
  return request<DashboardData>('/api/dashboard');
}

export function getCases(params: { status?: string; risk?: string; cluster?: string } = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const qs = q.toString();
  return request<{ count: number; items: CaseListItem[] }>(`/api/cases${qs ? `?${qs}` : ''}`);
}

export function getCase(id: string) {
  return request<CaseDetail>(`/api/cases/${id}`);
}

export function getMe() {
  return request<{ officer: { id: string; name: string; email: string; role: string } }>(
    '/api/officers',
  );
}

/** No officerId — identity comes from the session, never the body. */
export function decide(input: {
  caseId: string;
  action: 'approve' | 'reject' | 'escalate';
  justification: string;
}) {
  return request<{ caseId: string; status: string; decidedBy: string; decidedAt: string }>(
    '/api/decisions',
    { method: 'POST', body: JSON.stringify(input) },
  );
}

export function getHealth() {
  return request<{ ok: boolean; checks: Record<string, { ok: boolean; detail: string; ms: number }> }>(
    '/api/health',
    { authenticated: false },
  );
}
