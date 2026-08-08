import { randomInt } from 'node:crypto';

import { applications, db, eq } from '@parakh/db';

/**
 * Generate a unique application reference.
 *
 * The first version of this used `Math.random()` over a 9,000-value space. With
 * only 25 seeded rows the birthday probability of a collision was already
 * meaningful, and a collision hits the UNIQUE constraint and 500s the
 * submission — on stage, mid-demo.
 *
 * Now: a 900,000-value space, crypto-grade randomness, and an explicit
 * existence check with retries. Still short enough for someone to read a
 * reference number aloud over a phone.
 */
export async function generateReference(maxAttempts = 6): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = `PK-${randomInt(100_000, 1_000_000)}`;

    const existing = await db
      .select({ id: applications.id })
      .from(applications)
      .where(eq(applications.reference, candidate))
      .limit(1);

    if (existing.length === 0) return candidate;
  }

  // Astronomically unlikely. Fall back to something guaranteed unique rather
  // than throwing — a slightly uglier reference beats a failed application.
  return `PK-${Date.now().toString(36).toUpperCase()}`;
}
