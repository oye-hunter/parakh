'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/* ────────────────────────── Types ────────────────────────── */

type RiskLevel = 'low' | 'medium' | 'high';
type CaseStatus = 'pending' | 'edd_queue' | 'escalated' | 'auto_approved' | 'approved' | 'rejected' | 'under_review';

interface DashboardStats {
  applicationsToday: number;
  inEddQueue: number;
  resolvedToday: number;
  medianDecisionMinutes: number | null;
}

interface ClusterInfo {
  ref: string;
  summary: string;
  count: number;
}

interface DashboardData {
  stats: DashboardStats;
  distribution: Record<RiskLevel, number>;
  clusters: ClusterInfo[];
}

interface TopSignal {
  id: string;
  label: string;
  severity: RiskLevel;
  evidence: string;
}

interface CaseListItem {
  caseId: string;
  applicationId: string;
  reference: string;
  fullName: string;
  cnic: string;
  submittedAt: string;
  riskLevel: RiskLevel | null;
  confidence: number | null;
  status: CaseStatus;
  topSignal: TopSignal | null;
  signalCount: number;
  clusterRef: string | null;
}

interface DecisionHistoryItem {
  id: string;
  caseId: string;
  action: 'approve' | 'reject' | 'escalate';
  justification: string;
  riskSnapshot: string;
  confidenceSnapshot: number;
  reasoningSnapshot: string;
  decidedAt: string;
  officer?: { id: string; name: string; email: string; role: string };
  case?: {
    application?: {
      reference: string;
      fullName: string;
      cnic: string;
    };
  };
}

/* ────────────────────────── API Helpers ────────────────────────── */

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error('Failed to load dashboard');
  return res.json();
}

async function fetchCases(params?: { status?: string; risk?: string }): Promise<{ items: CaseListItem[] }> {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.risk) q.set('risk', params.risk);
  const res = await fetch(`/api/cases${q.toString() ? `?${q.toString()}` : ''}`);
  if (!res.ok) throw new Error('Failed to load cases');
  return res.json();
}

async function fetchDecisions(): Promise<{ decisions: DecisionHistoryItem[] }> {
  const res = await fetch('/api/decisions?limit=100');
  if (!res.ok) throw new Error('Failed to load decisions');
  return res.json();
}

async function submitDecision(payload: { caseId: string; action: 'approve' | 'reject' | 'escalate'; justification: string }) {
  const res = await fetch('/api/decisions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit decision');
  }
  return res.json();
}

/* ────────────────────────── Relative Time Helper ────────────────────────── */

function relativeTime(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/* ────────────────────────── Main Page Component ────────────────────────── */

export default function AdminPortal() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'escalations' | 'audit' | 'overview'>('escalations');
  const [auditFilter, setAuditFilter] = useState<'all' | 'approve' | 'reject' | 'escalate'>('all');
  const [selectedCase, setSelectedCase] = useState<CaseListItem | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);
  const [justification, setJustification] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  /* Queries */
  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  const { data: casesData, isLoading: casesLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: () => fetchCases(),
  });

  const { data: decisionsData, isLoading: decisionsLoading } = useQuery({
    queryKey: ['decisions'],
    queryFn: fetchDecisions,
  });

  /* Decision Mutation */
  const decideMutation = useMutation({
    mutationFn: submitDecision,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['cases'] });
      void queryClient.invalidateQueries({ queryKey: ['decisions'] });
      setSelectedCase(null);
      setModalAction(null);
      setJustification('');
      setModalError(null);
    },
    onError: (err: Error) => {
      setModalError(err.message);
    },
  });

  const stats = dashData?.stats;
  const distribution = dashData?.distribution ?? { low: 0, medium: 0, high: 0 };
  const totalRiskCount = distribution.low + distribution.medium + distribution.high;

  const allCases = casesData?.items ?? [];
  const escalatedCases = allCases.filter((c) => c.status === 'escalated' || c.status === 'edd_queue');

  const decisions = decisionsData?.decisions ?? [];
  const filteredDecisions =
    auditFilter === 'all' ? decisions : decisions.filter((d) => d.action === auditFilter);

  /* Officer Performance Breakdown */
  const officerStats = decisions.reduce((acc, d) => {
    const name = d.officer?.name || 'Unknown Officer';
    if (!acc[name]) acc[name] = { total: 0, approve: 0, reject: 0, escalate: 0 };
    acc[name].total += 1;
    acc[name][d.action] += 1;
    return acc;
  }, {} as Record<string, { total: number; approve: number; reject: number; escalate: number }>);

  const handleCommitVerdict = () => {
    if (!selectedCase || !modalAction) return;
    if (justification.trim().length < 10) {
      setModalError('Audit justification must be at least 10 characters.');
      return;
    }
    setModalError(null);
    decideMutation.mutate({
      caseId: selectedCase.caseId,
      action: modalAction,
      justification: justification.trim(),
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f2efdc', color: '#1a1a1a' }}>
      {/* ── Header Band ── */}
      <header
        style={{
          backgroundColor: '#1a1a1a',
          color: '#ffffeb',
          padding: '16px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #1a1a1a',
        }}
      >
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a8a80' }}>
            PARAKH · COMPLIANCE ADMIN
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, margin: '2px 0 0', fontWeight: 600 }}>
            Senior Officer Audit & Triage Console
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 9999,
              border: '1.5px solid #034f46',
              backgroundColor: '#034f46',
              color: '#ffffeb',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Senior Officer Active
          </span>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 60px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Cluster Alert Banner */}
        {dashData?.clusters && dashData.clusters.length > 0 && (
          <div
            style={{
              backgroundColor: '#ffa946',
              border: '2px solid #1a1a1a',
              borderRadius: 16,
              padding: '14px 20px',
              color: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ACTIVE AGENT CLUSTER ALERT
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>
                  {dashData.clusters[0]?.summary}
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                backgroundColor: '#1a1a1a',
                color: '#ffffeb',
                padding: '4px 10px',
                borderRadius: 9999,
              }}
            >
              REF: {dashData.clusters[0]?.ref}
            </span>
          </div>
        )}

        {/* ── Stat Cards Grid ── */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div style={cardStyle}>
            <span style={statLabelStyle}>Applications Today</span>
            <div style={statValueStyle}>{dashLoading ? '—' : stats?.applicationsToday ?? 0}</div>
            <span style={statHintStyle}>Total customer submissions</span>
          </div>

          <div style={cardStyle}>
            <span style={statLabelStyle}>In EDD Queue</span>
            <div style={statValueStyle}>{dashLoading ? '—' : stats?.inEddQueue ?? 0}</div>
            <span style={statHintStyle}>Awaiting review</span>
          </div>

          <div style={{ ...cardStyle, borderColor: escalatedCases.length > 0 ? '#a8322a' : '#1a1a1a' }}>
            <span style={{ ...statLabelStyle, color: escalatedCases.length > 0 ? '#a8322a' : '#8a8a80' }}>
              Pending Escalations
            </span>
            <div style={{ ...statValueStyle, color: escalatedCases.length > 0 ? '#a8322a' : '#1a1a1a' }}>
              {dashLoading ? '—' : escalatedCases.length}
            </div>
            <span style={statHintStyle}>Requires senior verdict</span>
          </div>

          <div style={cardStyle}>
            <span style={statLabelStyle}>Resolved (24h)</span>
            <div style={statValueStyle}>{dashLoading ? '—' : stats?.resolvedToday ?? 0}</div>
            <span style={statHintStyle}>Cleared by officers</span>
          </div>
        </section>

        {/* ── Visual Data Distribution Chart & Officer Metrics ── */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Risk Distribution Progress Bar */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={statLabelStyle}>Risk Distribution Visualizer</span>
              <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: '#8a8a80' }}>
                {totalRiskCount} scored
              </span>
            </div>

            {/* Segmented Bar Chart */}
            <div
              style={{
                height: 18,
                borderRadius: 9999,
                overflow: 'hidden',
                display: 'flex',
                border: '1.5px solid #1a1a1a',
                backgroundColor: '#e4e4d0',
              }}
            >
              {totalRiskCount > 0 ? (
                <>
                  <div
                    style={{
                      width: `${(distribution.high / totalRiskCount) * 100}%`,
                      backgroundColor: '#a8322a',
                      transition: 'width 0.4s ease',
                    }}
                    title={`High Risk: ${distribution.high}`}
                  />
                  <div
                    style={{
                      width: `${(distribution.medium / totalRiskCount) * 100}%`,
                      backgroundColor: '#b06a0c',
                      transition: 'width 0.4s ease',
                    }}
                    title={`Medium Risk: ${distribution.medium}`}
                  />
                  <div
                    style={{
                      width: `${(distribution.low / totalRiskCount) * 100}%`,
                      backgroundColor: '#034f46',
                      transition: 'width 0.4s ease',
                    }}
                    title={`Low Risk: ${distribution.low}`}
                  />
                </>
              ) : (
                <div style={{ width: '100%', backgroundColor: '#e4e4d0' }} />
              )}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#a8322a', display: 'inline-block' }} />
                <span>High ({distribution.high})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#b06a0c', display: 'inline-block' }} />
                <span>Medium ({distribution.medium})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#034f46', display: 'inline-block' }} />
                <span>Low ({distribution.low})</span>
              </div>
            </div>
          </div>

          {/* Officer Work Performance Summary */}
          <div style={cardStyle}>
            <span style={statLabelStyle}>Junior Agent Work Breakdown</span>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.keys(officerStats).length === 0 ? (
                <span style={{ fontSize: 13, color: '#8a8a80' }}>No officer activity recorded yet today.</span>
              ) : (
                Object.entries(officerStats).map(([name, data]) => (
                  <div
                    key={name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 13,
                      padding: '6px 10px',
                      backgroundColor: '#e4e4d0',
                      borderRadius: 8,
                      border: '1px solid #1a1a1a',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{name}</span>
                    <div style={{ display: 'flex', gap: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                      <span style={{ color: '#034f46' }}>✓ {data.approve}</span>
                      <span style={{ color: '#a8322a' }}>✕ {data.reject}</span>
                      <span style={{ color: '#1a1a1a' }}>⚡ {data.escalate}</span>
                      <span style={{ color: '#8a8a80', fontWeight: 600 }}>Total: {data.total}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ── Navigation Tabs ── */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '2px solid #1a1a1a', paddingBottom: 2 }}>
          <button
            onClick={() => setActiveTab('escalations')}
            style={tabButtonStyle(activeTab === 'escalations')}
          >
            Pending Escalations ({escalatedCases.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            style={tabButtonStyle(activeTab === 'audit')}
          >
            Agent Work Audit Log ({decisions.length})
          </button>
        </div>

        {/* ── TAB 1: Escalations Triage Queue ── */}
        {activeTab === 'escalations' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {casesLoading ? (
              <div style={cardStyle}>Loading escalated cases…</div>
            ) : escalatedCases.length === 0 ? (
              <div style={cardStyle}>
                <span style={{ color: '#8a8a80', fontSize: 14 }}>
                  No escalated applications pending. All compliance cases are resolved.
                </span>
              </div>
            ) : (
              escalatedCases.map((c) => (
                <div key={c.caseId} style={{ ...cardStyle, borderLeft: '6px solid #a8322a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600 }}>
                          {c.fullName}
                        </span>
                        <span style={riskBadgeStyle(c.riskLevel)}>
                          {c.riskLevel ? c.riskLevel.toUpperCase() : 'UNKNOWN'} ({((c.confidence ?? 0) * 100).toFixed(0)}%)
                        </span>
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#8a8a80', marginTop: 2 }}>
                        CNIC: {c.cnic} · Ref: {c.reference} · {relativeTime(c.submittedAt)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => {
                          setSelectedCase(c);
                          setModalAction('approve');
                        }}
                        style={btnApproveStyle}
                      >
                        Approve Case
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCase(c);
                          setModalAction('reject');
                        }}
                        style={btnRejectStyle}
                      >
                        Reject Case
                      </button>
                    </div>
                  </div>

                  {c.topSignal && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: '10px 14px',
                        backgroundColor: '#e4e4d0',
                        borderRadius: 8,
                        border: '1px solid #1a1a1a',
                        fontSize: 13,
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#a8322a' }}>TRIPPED SIGNAL:</span>{' '}
                      <span style={{ fontWeight: 600 }}>{c.topSignal.label}</span> — {c.topSignal.evidence}
                    </div>
                  )}
                </div>
              ))
            )}
          </section>
        )}

        {/* ── TAB 2: Agent Work Audit Log ── */}
        {activeTab === 'audit' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Filter Chips */}
            <div style={{ display: 'flex', gap: 8 }}>
              {(['all', 'approve', 'reject', 'escalate'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setAuditFilter(f)}
                  style={chipStyle(auditFilter === f)}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Audit Table */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              {decisionsLoading ? (
                <div style={{ padding: 20 }}>Loading agent work audit trail…</div>
              ) : filteredDecisions.length === 0 ? (
                <div style={{ padding: 20, color: '#8a8a80' }}>No officer decision records match filter.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e4e4d0', borderBottom: '2px solid #1a1a1a', textAlign: 'left' }}>
                      <th style={thStyle}>Officer</th>
                      <th style={thStyle}>Applicant</th>
                      <th style={thStyle}>Verdict</th>
                      <th style={thStyle}>Audit Justification</th>
                      <th style={thStyle}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDecisions.map((d) => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #e4e4d0' }}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600 }}>{d.officer?.name || 'Officer'}</div>
                          <div style={{ fontSize: 12, color: '#8a8a80' }}>{d.officer?.email}</div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 500 }}>{d.case?.application?.fullName || 'Applicant'}</div>
                          <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: '#8a8a80' }}>
                            {d.case?.application?.cnic}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={actionPillStyle(d.action)}>{d.action.toUpperCase()}</span>
                        </td>
                        <td style={{ ...tdStyle, maxWidth: 360 }}>
                          <div style={{ fontSize: 13, lineHeight: 1.4 }}>{d.justification}</div>
                        </td>
                        <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#8a8a80' }}>
                          {relativeTime(d.decidedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ── Centered Floating Senior Verdict Modal ── */}
      {selectedCase && modalAction && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26, 26, 26, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              backgroundColor: '#ffffeb',
              borderRadius: 24,
              border: `3px solid ${modalAction === 'approve' ? '#034f46' : '#a8322a'}`,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#8a8a80' }}>
                SENIOR OFFICER VERDICT
              </span>
              <span style={actionPillStyle(modalAction)}>{modalAction.toUpperCase()}</span>
            </div>

            <div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, margin: '0 0 4px', fontWeight: 600 }}>
                {modalAction === 'approve' ? 'Approve Escalated Application?' : 'Reject Escalated Application?'}
              </h2>
              <div style={{ fontSize: 13, color: '#8a8a80' }}>
                Applicant: <strong>{selectedCase.fullName}</strong> ({selectedCase.cnic})
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Senior Audit Justification
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="What did you verify, and why are you overriding/confirming this decision?"
                rows={3}
                style={{
                  backgroundColor: '#e4e4d0',
                  borderRadius: 12,
                  border: '1.5px solid #1a1a1a',
                  padding: 12,
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: 14,
                  color: '#1a1a1a',
                  resize: 'none',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8a8a80' }}>
                <span>Recorded in immutable audit trail.</span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: justification.trim().length >= 10 ? '#034f46' : '#8a8a80',
                    fontWeight: 600,
                  }}
                >
                  {justification.trim().length}/10 min
                </span>
              </div>
            </div>

            {modalError && (
              <div style={{ color: '#a8322a', fontSize: 13, fontWeight: 500 }}>{modalError}</div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={() => {
                  setSelectedCase(null);
                  setModalAction(null);
                  setJustification('');
                  setModalError(null);
                }}
                disabled={decideMutation.isPending}
                style={btnCancelStyle}
              >
                Cancel
              </button>
              <button
                onClick={handleCommitVerdict}
                disabled={decideMutation.isPending || justification.trim().length < 10}
                style={modalAction === 'approve' ? btnApproveStyle : btnRejectStyle}
              >
                {decideMutation.isPending ? 'Committing…' : `Confirm ${modalAction.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────── Inline Styles (DESIGN.md Tokens) ────────────────────────── */

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffeb',
  borderRadius: 20,
  border: '2px solid #1a1a1a',
  padding: 18,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#8a8a80',
};

const statValueStyle: React.CSSProperties = {
  fontFamily: 'Fraunces, serif',
  fontSize: 32,
  fontWeight: 600,
  margin: '4px 0',
  color: '#1a1a1a',
};

const statHintStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#8a8a80',
};

function tabButtonStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 16px',
    borderRadius: '12px 12px 0 0',
    border: '2px solid #1a1a1a',
    borderBottom: active ? '2px solid #ffffeb' : '2px solid #1a1a1a',
    backgroundColor: active ? '#ffffeb' : '#e4e4d0',
    color: '#1a1a1a',
    fontWeight: active ? 700 : 500,
    fontSize: 14,
    cursor: 'pointer',
  };
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 14px',
    borderRadius: 9999,
    border: '1.5px solid #1a1a1a',
    backgroundColor: active ? '#1a1a1a' : '#ffffeb',
    color: active ? '#ffffeb' : '#1a1a1a',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  };
}

function riskBadgeStyle(level: RiskLevel | null): React.CSSProperties {
  const bg = level === 'high' ? '#a8322a' : level === 'medium' ? '#b06a0c' : '#034f46';
  return {
    padding: '3px 10px',
    borderRadius: 9999,
    backgroundColor: bg,
    color: '#ffffeb',
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
  };
}

function actionPillStyle(action: string): React.CSSProperties {
  const bg = action === 'approve' ? '#034f46' : action === 'reject' ? '#a8322a' : '#1a1a1a';
  return {
    padding: '4px 10px',
    borderRadius: 9999,
    backgroundColor: bg,
    color: '#ffffeb',
    fontSize: 11,
    fontWeight: 700,
    display: 'inline-block',
  };
}

const btnApproveStyle: React.CSSProperties = {
  backgroundColor: '#034f46',
  color: '#ffffeb',
  border: '2px solid #1a1a1a',
  borderRadius: 12,
  padding: '8px 16px',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  flex: 1,
};

const btnRejectStyle: React.CSSProperties = {
  backgroundColor: '#a8322a',
  color: '#ffffeb',
  border: '2px solid #1a1a1a',
  borderRadius: 12,
  padding: '8px 16px',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  flex: 1,
};

const btnCancelStyle: React.CSSProperties = {
  backgroundColor: '#ffffeb',
  color: '#1a1a1a',
  border: '2px solid #1a1a1a',
  borderRadius: 12,
  padding: '8px 16px',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  flex: 1,
};

const thStyle: React.CSSProperties = {
  padding: '12px 14px',
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 14px',
  verticalAlign: 'top',
};
