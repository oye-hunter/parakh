import { NextResponse } from 'next/server';

import {
  applicationMeta,
  applications,
  cases,
  clusters,
  db,
  decisions,
  desc,
  eq,
  user,
  riskProfiles,
  signals as signalsTable,
} from '@parakh/db';

import { fail, isUuid, route } from '@/lib/http';
import { requireOfficer } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * One case, fully loaded — the O4 Case Detail screen.
 *
 * Returns everything the officer needs to form a defensible view: the raw
 * declaration, the tripped signals with their evidence, the model's reasoning,
 * any cluster it belongs to, and the decision history.
 */
export const GET = route(
  'GET /api/cases/[id]',
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const auth = await requireOfficer();
    if (!auth.ok) return auth.response;

    const { id } = await context.params;

    // Postgres throws on a malformed uuid, which would surface as a 500. A bad
    // id in the URL is the caller's mistake.
    if (!isUuid(id)) {
      return fail('invalid_case_id', 400, { message: 'Case id must be a UUID.' });
    }

    const [found] = await db
    .select({
      case: cases,
      application: applications,
      meta: applicationMeta,
      risk: riskProfiles,
    })
    .from(cases)
    .innerJoin(applications, eq(cases.applicationId, applications.id))
    .innerJoin(applicationMeta, eq(applicationMeta.applicationId, applications.id))
    .leftJoin(riskProfiles, eq(riskProfiles.applicationId, applications.id))
    .where(eq(cases.id, id))
    .limit(1);

  if (!found) {
    return NextResponse.json({ error: 'case_not_found' }, { status: 404 });
  }

  const sigs = await db
    .select()
    .from(signalsTable)
    .where(eq(signalsTable.applicationId, found.application.id));

  const clusterRef = sigs.find((s) => s.clusterRef)?.clusterRef;
  const cluster = clusterRef
    ? ((await db.select().from(clusters).where(eq(clusters.ref, clusterRef)).limit(1))[0] ?? null)
    : null;

  const history = await db
    .select({ decision: decisions, officer: user })
    .from(decisions)
    .innerJoin(user, eq(decisions.officerId, user.id))
    .where(eq(decisions.caseId, id))
    .orderBy(desc(decisions.decidedAt));

  const severityRank = { high: 0, medium: 1, low: 2 } as const;

  return NextResponse.json({
    caseId: found.case.id,
    status: found.case.status,
    queuedAt: found.case.queuedAt?.toISOString() ?? null,
    resolvedAt: found.case.resolvedAt?.toISOString() ?? null,

    applicant: {
      reference: found.application.reference,
      fullName: found.application.fullName,
      cnic: found.application.cnic,
      dob: found.application.dob,
      cnicExpiry: found.application.cnicExpiry,
      city: found.application.city,
      area: found.application.area,
      residenceType: found.application.residenceType,
      yearsAtAddress: found.application.yearsAtAddress,
      employmentType: found.application.employmentType,
      employerName: found.application.employerName,
      incomeSource: found.application.incomeSource,
      declaredIncomePkr: Number(found.application.declaredIncomePkr),
      accountPurpose: found.application.accountPurpose,
      expectedVolumePkr: Number(found.application.expectedVolumePkr),
      expectedTxnCount: found.application.expectedTxnCount,
      counterparties: found.application.counterparties,
      isPep: found.application.isPep,
      existingBankRelationship: found.application.existingBankRelationship,
      submittedAt: found.meta.submittedAt.toISOString(),
      agentPointId: found.meta.agentPointId,
    },

    risk: found.risk
      ? {
          level: found.risk.riskLevel,
          confidence: found.risk.confidence,
          reasoning: found.risk.reasoning,
          recommendedAction: found.risk.recommendedAction,
          model: found.risk.model,
          latencyMs: found.risk.latencyMs,
        }
      : null,

    // Highest severity first — the order the evidence rows render in.
    signals: sigs
      .sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
      .map((s) => ({
        name: s.name,
        label: s.label,
        severity: s.severity,
        evidence: s.evidence,
        fields: s.fields,
        clusterRef: s.clusterRef,
      })),

    cluster: cluster
      ? {
          ref: cluster.ref,
          kind: cluster.kind,
          summary: cluster.summary,
          applicationCount: cluster.applicationIds.length,
        }
      : null,

    history: history.map((h) => ({
      action: h.decision.action,
      justification: h.decision.justification,
      officer: h.officer.name,
      riskSnapshot: h.decision.riskSnapshot,
      confidenceSnapshot: h.decision.confidenceSnapshot,
      reasoningSnapshot: h.decision.reasoningSnapshot,
      decidedAt: h.decision.decidedAt.toISOString(),
    })),
  });
},
);
