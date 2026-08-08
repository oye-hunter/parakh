import { NextResponse } from 'next/server';
import { z } from 'zod';

import { cases, db, dbTx, decisions, eq, riskProfiles } from '@parakh/db';

import { fail, parseBody, route } from '@/lib/http';
import { requireOfficer } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  caseId: z.string().uuid('caseId must be a UUID'),
  // NOTE: there is deliberately no `officerId` here. Identity comes from the
  // session cookie. Accepting it from the body would let any caller attribute
  // a decision to any officer, and the audit trail would record the lie as
  // fact.
  action: z.enum(['approve', 'reject', 'escalate']),
  // Mandatory, not optional. An audit trail without a stated reason is not an
  // audit trail — it is a log of button presses.
  justification: z
    .string()
    .trim()
    .min(10, 'Justification must be at least 10 characters')
    .max(2000, 'Justification must be under 2000 characters'),
});

const NEXT_STATUS = {
  approve: 'approved',
  reject: 'declined',
  escalate: 'escalated',
} as const;

const TERMINAL = new Set(['approved', 'declined']);

/**
 * Record an officer decision.
 *
 * Runs in a transaction, which is why this route uses the WebSocket driver: it
 * updates `cases` and inserts into `decisions` together, and a half-applied
 * decision would leave a case resolved with no recorded reason.
 *
 * The risk level, confidence and reasoning are SNAPSHOTTED into the decision
 * row rather than referenced. Re-deriving them when someone reopens the case
 * months later would show today's model output against yesterday's decision.
 */
export const POST = route('POST /api/decisions', async (request: Request) => {
  const auth = await requireOfficer();
  if (!auth.ok) return auth.response;
  const officer = auth.officer;

  const parsed = await parseBody(request, Body);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const [existing] = await db.select().from(cases).where(eq(cases.id, body.caseId)).limit(1);
  if (!existing) {
    return fail('case_not_found', 404, { message: `No case with id ${body.caseId}.` });
  }
  if (TERMINAL.has(existing.status)) {
    return fail('case_already_resolved', 409, {
      message: `This case was already ${existing.status}. Re-deciding would overwrite the audit trail.`,
    });
  }

  const [profile] = await db
    .select()
    .from(riskProfiles)
    .where(eq(riskProfiles.applicationId, existing.applicationId))
    .limit(1);

  if (!profile) {
    return fail('risk_profile_missing', 409, {
      message: 'This application has not been scored yet, so there is nothing to snapshot.',
    });
  }

  const decidedAt = new Date();
  const nextStatus = NEXT_STATUS[body.action];

  await dbTx().transaction(async (tx) => {
    await tx
      .update(cases)
      .set({
        status: nextStatus,
        assignedTo: officer.id,
        resolvedAt: body.action === 'escalate' ? null : decidedAt,
        updatedAt: decidedAt,
      })
      .where(eq(cases.id, body.caseId));

    await tx.insert(decisions).values({
      caseId: body.caseId,
      officerId: officer.id,
      action: body.action,
      justification: body.justification,
      riskSnapshot: profile.riskLevel,
      confidenceSnapshot: profile.confidence,
      reasoningSnapshot: profile.reasoning,
      signalsSnapshot: profile.contributingSignals,
      decidedAt,
    });
  });

  return NextResponse.json({
    caseId: body.caseId,
    status: nextStatus,
    decidedBy: officer.name,
    decidedAt: decidedAt.toISOString(),
  });
});
