import { NextResponse } from 'next/server';
import { z } from 'zod';

import { detectSignals, fallbackRiskLevel, profileRisk } from '@parakh/core';
import type { ApplicationInput, ClusterFinding } from '@parakh/core';
import {
  applicationMeta,
  applications,
  cases,
  clusters,
  db,
  eq,
  gte,
  inArray,
  riskProfiles,
  signals as signalsTable,
} from '@parakh/db';

import { fail, parseBody, route } from '@/lib/http';
import { toApplicationInput } from '@/lib/mapping';
import { generateReference } from '@/lib/reference';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  cnic: z.string().regex(/^\d{5}-\d{7}-\d$/, 'CNIC must be formatted 00000-0000000-0'),
  fullName: z.string().trim().min(2, 'Full name is required'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD'),
  cnicExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'CNIC expiry must be YYYY-MM-DD'),

  city: z.string().trim().min(1, 'City is required'),
  area: z.string().trim().min(1, 'Area is required'),
  residenceType: z.enum(['owned', 'rented', 'family']),
  yearsAtAddress: z.number().min(0).max(90),

  employmentType: z.enum([
    'salaried',
    'self_employed',
    'business_owner',
    'freelancer',
    'student',
    'unemployed',
    'retired',
  ]),
  employerName: z.string().trim().nullable().optional(),
  incomeSource: z.enum([
    'salary',
    'business',
    'freelance',
    'remittance',
    'agriculture',
    'pension',
    'other',
  ]),
  declaredIncomePkr: z.number().min(0).max(1_000_000_000),

  accountPurpose: z.enum([
    'personal_use',
    'receive_business_payments',
    'receive_remittance',
    'savings',
    'merchant_collection',
  ]),
  expectedVolumePkr: z.number().min(0).max(1_000_000_000),
  expectedTxnCount: z.number().int().min(0).max(100_000),
  counterparties: z.enum(['domestic', 'international']),
  isPep: z.boolean().default(false),
  existingBankRelationship: z.boolean().default(false),

  meta: z.object({
    deviceFingerprint: z.string().trim().min(1, 'Device fingerprint is required'),
    agentPointId: z.string().trim().min(1, 'Agent point is required'),
    sessionCity: z.string().trim().nullable().optional(),
    secondsPerStep: z.array(z.number()).max(20).optional(),
  }),
});

const CLUSTER_WINDOW_MS = 24 * 3_600_000;

/**
 * Where a freshly scored application lands.
 *
 * **Nothing is ever approved automatically.** The AI produces a recommendation
 * and the evidence behind it; a compliance officer makes the decision. An
 * account that opens because a model said so is a decision nobody signed, and
 * the audit trail would have a gap exactly where the accountability should be.
 *
 * Risk decides *urgency*, not outcome:
 *   high          -> edd_queue, reviewed first
 *   low / medium  -> pending, routine review
 */
function statusFor(level: 'low' | 'medium' | 'high') {
  return level === 'high' ? 'edd_queue' : 'pending';
}

/**
 * Re-score the other members of a newly detected cluster.
 *
 * The first application in a fraud ring is invisible — there is nothing to
 * compare it against yet. Without this, it stays approved forever while its
 * three identical siblings sit in the EDD queue, which is exactly the hole a
 * ring would drive through.
 *
 * Only ever escalates. An officer's decision is never overwritten.
 */
async function reflagClusterPeers(
  cluster: ClusterFinding,
  currentApplicationId: string,
  detectedAt: Date,
): Promise<string[]> {
  const peerIds = cluster.applicationIds.filter((id) => id !== currentApplicationId);
  if (peerIds.length === 0) return [];

  const reflagged: string[] = [];

  const peerCases = await db
    .select({ case: cases, application: applications })
    .from(cases)
    .innerJoin(applications, eq(cases.applicationId, applications.id))
    .where(inArray(cases.applicationId, peerIds));

  for (const peer of peerCases) {
    /**
     * Never overwrite a human decision. Once an officer has approved, declined
     * or escalated a case, a later pattern is new information for them to act
     * on — not licence for the system to silently reverse them.
     *
     * Only cases still awaiting review get pulled into the EDD queue.
     */
    if (peer.case.status !== 'pending' && peer.case.status !== 'edd_queue') continue;

    const existingSignals = await db
      .select()
      .from(signalsTable)
      .where(eq(signalsTable.applicationId, peer.application.id));

    // Already carries this cluster — nothing to do.
    if (existingSignals.some((s) => s.clusterRef === cluster.ref)) continue;

    const label =
      cluster.kind === 'device_reuse' ? 'Device reused across identities' : 'Agent-point clustering';

    await db.insert(signalsTable).values({
      applicationId: peer.application.id,
      name: cluster.kind === 'device_reuse' ? 'device_reuse' : 'agent_point_clustering',
      label,
      severity: 'high',
      evidence: `${cluster.summary} — detected after this application was filed`,
      fields:
        cluster.kind === 'device_reuse'
          ? ['meta.deviceFingerprint', 'cnic']
          : ['meta.agentPointId', 'employmentType', 'accountPurpose'],
      clusterRef: cluster.ref,
      createdAt: detectedAt,
    });

    const updatedSignals = [
      ...existingSignals.map((s) => ({
        name: s.name,
        label: s.label,
        severity: s.severity,
        evidence: s.evidence,
        fields: s.fields,
      })),
      { name: 'cluster', label, severity: 'high' as const, evidence: cluster.summary, fields: [] },
    ];

    const { riskLevel, confidence } = fallbackRiskLevel(updatedSignals);

    await db
      .update(riskProfiles)
      .set({
        riskLevel,
        confidence,
        reasoning: `Re-assessed after a later application revealed a pattern. ${cluster.summary}. This application was filed before the pattern was visible and looked ordinary on its own.`,
      })
      .where(eq(riskProfiles.applicationId, peer.application.id));

    await db
      .update(cases)
      .set({ status: 'edd_queue', queuedAt: detectedAt, resolvedAt: null, updatedAt: detectedAt })
      .where(eq(cases.id, peer.case.id));

    reflagged.push(peer.application.reference);
  }

  return reflagged;
}

/**
 * Submit an application and score it.
 *
 * The response deliberately carries NO risk information. The applicant sees a
 * reference and a status, nothing else — showing someone their own risk score
 * teaches them how to re-file and pass.
 */
export const POST = route('POST /api/applications', async (request: Request) => {
  const parsed = await parseBody(request, Body);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const submittedAt = new Date();

  // A resubmission under the same CNIC is almost always a duplicate tap, and
  // silently creating a second application corrupts the cluster maths.
  const duplicate = await db
    .select({ reference: applications.reference, createdAt: applications.createdAt })
    .from(applications)
    .where(eq(applications.cnic, body.cnic))
    .limit(1);

  if (duplicate[0] && submittedAt.getTime() - duplicate[0].createdAt.getTime() < 60_000) {
    return fail('duplicate_submission', 409, {
      message: `An application for this CNIC was submitted moments ago (${duplicate[0].reference}).`,
    });
  }

  const reference = await generateReference();

  const [row] = await db
    .insert(applications)
    .values({
      reference,
      cnic: body.cnic,
      fullName: body.fullName,
      dob: body.dob,
      cnicExpiry: body.cnicExpiry,
      city: body.city,
      area: body.area,
      residenceType: body.residenceType,
      yearsAtAddress: body.yearsAtAddress,
      employmentType: body.employmentType,
      employerName: body.employerName ?? null,
      incomeSource: body.incomeSource,
      declaredIncomePkr: String(body.declaredIncomePkr),
      accountPurpose: body.accountPurpose,
      expectedVolumePkr: String(body.expectedVolumePkr),
      expectedTxnCount: body.expectedTxnCount,
      counterparties: body.counterparties,
      isPep: body.isPep,
      existingBankRelationship: body.existingBankRelationship,
      createdAt: submittedAt,
    })
    .returning();

  if (!row) return fail('insert_failed', 500);

  const [meta] = await db
    .insert(applicationMeta)
    .values({
      applicationId: row.id,
      deviceFingerprint: body.meta.deviceFingerprint,
      agentPointId: body.meta.agentPointId,
      sessionCity: body.meta.sessionCity ?? null,
      secondsPerStep: body.meta.secondsPerStep ?? null,
      submittedAt,
    })
    .returning();

  if (!meta) return fail('insert_failed', 500);

  const input = toApplicationInput(row, meta);

  // The 24-hour window the cross-application signals need. Without it the
  // engine sees one form at a time and device reuse becomes undetectable.
  const since = new Date(submittedAt.getTime() - CLUSTER_WINDOW_MS);
  const recentRows = await db
    .select({ application: applications, meta: applicationMeta })
    .from(applications)
    .innerJoin(applicationMeta, eq(applicationMeta.applicationId, applications.id))
    .where(gte(applicationMeta.submittedAt, since));

  const recent: ApplicationInput[] = recentRows
    .filter((r) => r.application.id !== row.id)
    .map((r) => toApplicationInput(r.application, r.meta));

  const { signals, clusters: found } = detectSignals(input, recent, submittedAt);

  if (signals.length > 0) {
    await db.insert(signalsTable).values(
      signals.map((s) => ({
        applicationId: row.id,
        name: s.name,
        label: s.label,
        severity: s.severity,
        evidence: s.evidence,
        fields: s.fields,
        clusterRef: s.clusterRef ?? null,
        createdAt: submittedAt,
      })),
    );
  }

  const reflagged: string[] = [];

  for (const c of found) {
    const existing = await db.select().from(clusters).where(eq(clusters.ref, c.ref)).limit(1);
    if (existing.length > 0) {
      await db
        .update(clusters)
        .set({ applicationIds: c.applicationIds, summary: c.summary })
        .where(eq(clusters.ref, c.ref));
    } else {
      await db.insert(clusters).values({
        ref: c.ref,
        kind: c.kind,
        agentPointId: c.agentPointId ?? null,
        deviceFingerprint: c.deviceFingerprint ?? null,
        applicationIds: c.applicationIds,
        summary: c.summary,
        detectedAt: submittedAt,
      });
    }

    reflagged.push(...(await reflagClusterPeers(c, row.id, submittedAt)));
  }

  const profile = await profileRisk(input, signals);

  await db.insert(riskProfiles).values({
    applicationId: row.id,
    riskLevel: profile.riskLevel,
    confidence: profile.confidence,
    reasoning: profile.reasoning,
    contributingSignals: profile.contributingSignals,
    recommendedAction: profile.recommendedAction,
    model: profile.model,
    latencyMs: profile.latencyMs,
    createdAt: submittedAt,
  });

  const status = statusFor(profile.riskLevel);

  await db.insert(cases).values({
    applicationId: row.id,
    status,
    // Every case is queued the moment it is scored, because every case now
    // waits for a human. `resolvedAt` stays null until an officer decides.
    queuedAt: submittedAt,
    resolvedAt: null,
    createdAt: submittedAt,
    updatedAt: submittedAt,
  });

  if (reflagged.length > 0) {
    console.log(`[cluster] re-flagged ${reflagged.length} earlier application(s): ${reflagged.join(', ')}`);
  }

  return NextResponse.json(
    {
      reference: row.reference,
      // Always under review — an applicant is never told they passed before an
      // officer has actually said so.
      status: 'under_review',
      submittedAt: submittedAt.toISOString(),
    },
    { status: 201 },
  );
});
