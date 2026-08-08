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
  gte,
  riskProfiles,
} from '@parakh/db';

import { route } from '@/lib/http';
import { requireOfficer } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Everything the O2 Dashboard needs, in one round trip.
 *
 * Requirement 6 of the brief: volume, risk distribution, the EDD queue, and how
 * case status changes over time.
 */
export const GET = route('GET /api/dashboard', async () => {
  const auth = await requireOfficer();
  if (!auth.ok) return auth.response;

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 3_600_000);

  const rows = await db
    .select({ case: cases, meta: applicationMeta, risk: riskProfiles })
    .from(cases)
    .innerJoin(applications, eq(cases.applicationId, applications.id))
    .innerJoin(applicationMeta, eq(applicationMeta.applicationId, applications.id))
    .leftJoin(riskProfiles, eq(riskProfiles.applicationId, applications.id));

  const today = rows.filter((r) => r.meta.submittedAt >= dayAgo);

  const distribution = { low: 0, medium: 0, high: 0 };
  for (const r of today) {
    const level = r.risk?.riskLevel;
    if (level) distribution[level]++;
  }

  const resolved = await db
    .select({ decision: decisions })
    .from(decisions)
    .where(gte(decisions.decidedAt, dayAgo));

  const activeClusters = await db
    .select()
    .from(clusters)
    .where(gte(clusters.detectedAt, dayAgo))
    .orderBy(desc(clusters.detectedAt));

  const eddQueue = rows.filter((r) => r.case.status === 'edd_queue');

  // Median rather than mean — one case left open over lunch should not move it.
  const decisionTimes = rows
    .filter((r) => r.case.resolvedAt && r.case.queuedAt)
    .map((r) => r.case.resolvedAt!.getTime() - r.case.queuedAt!.getTime())
    .sort((a, b) => a - b);
  const medianMs = decisionTimes.length
    ? decisionTimes[Math.floor(decisionTimes.length / 2)]!
    : null;

  return NextResponse.json({
    stats: {
      applicationsToday: today.length,
      inEddQueue: eddQueue.length,
      resolvedToday: resolved.length,
      medianDecisionMinutes: medianMs === null ? null : Math.round(medianMs / 60_000),
    },
    distribution,
    clusters: activeClusters.map((c) => ({
      ref: c.ref,
      kind: c.kind,
      summary: c.summary,
      applicationCount: c.applicationIds.length,
      detectedAt: c.detectedAt.toISOString(),
    })),
  });
});
