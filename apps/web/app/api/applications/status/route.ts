import { NextResponse } from 'next/server';
import { db, applications } from '@parakh/db';
import { eq } from 'drizzle-orm';

/**
 * GET /api/applications/status?reference=PK-4471 OR ?cnic=37405-1234567-1
 *
 * Public endpoint allowing applicants to check application status.
 *
 * PRIVACY BOUNDARY: Returns ONLY reference, status, and submittedAt.
 * NEVER returns riskLevel, confidence, signals, or AI reasoning to prevent
 * bad actors from probing which declarations pass.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get('reference');
  const cnic = searchParams.get('cnic');

  if (!reference && !cnic) {
    return NextResponse.json(
      { error: 'Provide reference or cnic parameter' },
      { status: 400 }
    );
  }

  const query = reference
    ? eq(applications.reference, reference.trim().toUpperCase())
    : eq(applications.cnic, cnic!.trim());

  const appRecord = await db.query.applications.findFirst({
    where: query,
    with: { case: true },
  });

  if (!appRecord) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    application: {
      reference: appRecord.reference,
      status: appRecord.case?.status ?? 'pending',
      submittedAt: appRecord.createdAt,
    },
  });
}
