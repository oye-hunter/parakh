/**
 * Provision the officer accounts.
 *
 *   pnpm provision:officers
 *
 * Sign-up is disabled on the live auth instance — a compliance console where
 * anyone can self-register as a reviewer is worse than no auth at all. So this
 * script builds its own Better Auth instance with sign-up enabled, pointed at
 * the same database and the same secret, and uses the public sign-up API. That
 * way password hashing and account rows are produced by the library rather than
 * hand-rolled, and stay correct if Better Auth changes its hashing.
 *
 * Safe to re-run: existing accounts are left alone.
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db, eq, user } from '@parakh/db';
import * as schema from '@parakh/db/schema';

const OFFICERS = [
  {
    name: 'Sana Rehman',
    email: 'sana.rehman@parakh.pk',
    password: 'parakh-demo-2026',
    role: 'compliance_officer',
  },
  {
    name: 'Faisal Qureshi',
    email: 'faisal.qureshi@parakh.pk',
    password: 'parakh-demo-2026',
    role: 'senior_officer',
  },
];

const provisioning = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  user: {
    additionalFields: {
      role: { type: 'string', required: false, defaultValue: 'compliance_officer', input: false },
    },
  },
});

async function main() {
  if (!process.env.BETTER_AUTH_SECRET) {
    console.error('BETTER_AUTH_SECRET is not set. Copy .env.example to .env first.');
    process.exit(1);
  }

  for (const officer of OFFICERS) {
    const existing = await db.select().from(user).where(eq(user.email, officer.email)).limit(1);

    if (existing.length > 0) {
      // Keep the role in sync even if the account already exists.
      await db.update(user).set({ role: officer.role }).where(eq(user.email, officer.email));
      console.log(`  = ${officer.email.padEnd(30)} already exists (role: ${officer.role})`);
      continue;
    }

    await provisioning.api.signUpEmail({
      body: { name: officer.name, email: officer.email, password: officer.password },
    });

    // `input: false` on the role field means sign-up cannot set it — deliberate,
    // so nobody can self-assign seniority through the API.
    await db.update(user).set({ role: officer.role }).where(eq(user.email, officer.email));

    console.log(`  + ${officer.email.padEnd(30)} created (role: ${officer.role})`);
  }

  console.log('\nSign in with either address and password: parakh-demo-2026');
  console.log('Change these before this is ever deployed anywhere real.\n');
}

main().catch((err) => {
  console.error('\nProvisioning failed:', err);
  process.exit(1);
});
