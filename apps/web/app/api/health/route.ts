import { NextResponse } from 'next/server';

import { groqModel } from '@parakh/core';
import { applications, db, sql } from '@parakh/db';

import { route } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Check = { ok: boolean; detail: string; ms: number };

async function timed(fn: () => Promise<string>): Promise<Check> {
  const t = Date.now();
  try {
    return { ok: true, detail: await fn(), ms: Date.now() - t };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message.slice(0, 200) : String(err),
      ms: Date.now() - t,
    };
  }
}

/**
 * Pre-flight check. Run this before the demo.
 *
 * A Neon free-tier branch suspends after inactivity and the first query pays a
 * cold start; Groq rotates model availability without notice. Both failures
 * look identical from the app — a spinner that never resolves — so it is worth
 * being able to ask directly.
 */
export const GET = route('GET /api/health', async () => {
  const database = await timed(async () => {
    const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(applications);
    return `${row?.n ?? 0} applications`;
  });

  const groq = await timed(async () => {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('GROQ_API_KEY is not set');

    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Groq returned ${res.status}`);

    const body = (await res.json()) as { data?: { id: string }[] };
    const wanted = groqModel();
    const available = body.data?.some((m) => m.id === wanted);
    if (!available) {
      throw new Error(
        `GROQ_MODEL "${wanted}" is not in the account's model list. Pick one from https://console.groq.com/docs/models`,
      );
    }
    return `${wanted} available`;
  });

  const ok = database.ok && groq.ok;

  return NextResponse.json(
    { ok, checks: { database, groq }, checkedAt: new Date().toISOString() },
    { status: ok ? 200 : 503 },
  );
});
