import { NextResponse } from 'next/server';

import { route } from '@/lib/http';
import { requireOfficer } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Who am I?
 *
 * The console calls this after sign-in to render the officer's name and gate
 * senior-only actions. It returns the *session's* officer and nobody else —
 * there is no reason for a compliance console to expose a roster of colleagues,
 * and the old version of this endpoint listing every officer with their id was
 * exactly what made body-supplied `officerId` exploitable.
 */
export const GET = route('GET /api/officers', async () => {
  const auth = await requireOfficer();
  if (!auth.ok) return auth.response;

  return NextResponse.json({ officer: auth.officer });
});
