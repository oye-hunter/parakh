import { NextResponse } from 'next/server';

import {
  applicationMeta,
  applications,
  cases,
  db,
  desc,
  eq,
  inArray,
  riskProfiles,
  signals as signalsTable,
} from '@parakh/db';

import { route } from '@/lib/http';
import { requireOfficer } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RISK_ORDER = { high: 0, medium: 1, low: 2 } as const;

/**
 * The officer's queue.
 *
 *   GET /api/cases                  everything, highest risk first
 *   GET /api/cases?status=edd_queue only the EDD queue
 *   GET /api/cases?risk=high        filter by risk level
 *   GET /api/cases?cluster=CLU-1234 one cluster — the O7 screen
 */
export const GET = route('GET /api/cases', async (request: Request) => {
  const auth = await requireOfficer();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const risk = url.searchParams.get('risk');
  const cluster = url.searchParams.get('cluster');

  const rows = await db
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
    .orderBy(desc(applicationMeta.submittedAt));

  const applicationIds = rows.map((r) => r.application.id);
  const allSignals = applicationIds.length
    ? await db.select().from(signalsTable).where(inArray(signalsTable.applicationId, applicationIds))
    : [];

  const signalsByApplication = new Map<string, typeof allSignals>();
  for (const s of allSignals) {
    const list = signalsByApplication.get(s.applicationId) ?? [];
    list.push(s);
    signalsByApplication.set(s.applicationId, list);
  }

  let items = rows.map((r) => {
    const sigs = signalsByApplication.get(r.application.id) ?? [];
    const top = sigs.find((s) => s.severity === 'high') ?? sigs[0];

    return {
      caseId: r.case.id,
      applicationId: r.application.id,
      reference: r.application.reference,
      fullName: r.application.fullName,
      cnic: r.application.cnic,
      agentPointId: r.meta.agentPointId,
      status: r.case.status,
      riskLevel: r.risk?.riskLevel ?? null,
      confidence: r.risk?.confidence ?? null,
      topSignal: top ? { label: top.label, evidence: top.evidence } : null,
      signalCount: sigs.length,
      clusterRef: sigs.find((s) => s.clusterRef)?.clusterRef ?? null,
      submittedAt: r.meta.submittedAt.toISOString(),
    };
  });

  if (status) items = items.filter((i) => i.status === status);
  if (risk) items = items.filter((i) => i.riskLevel === risk);
  if (cluster) items = items.filter((i) => i.clusterRef === cluster);

  // Highest risk first, then longest waiting — the order an officer works in.
  items.sort((a, b) => {
    const ra = RISK_ORDER[a.riskLevel ?? 'low'];
    const rb = RISK_ORDER[b.riskLevel ?? 'low'];
    if (ra !== rb) return ra - rb;
    return a.submittedAt.localeCompare(b.submittedAt);
  });

  return NextResponse.json({ count: items.length, items });
});
