import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

import { db } from '@parakh/db';
import * as schema from '@parakh/db/schema';

/**
 * Officer authentication.
 *
 * Only compliance officers authenticate. Applicants deliberately do not — they
 * are applying *for* an account and have none yet, so `POST /api/applications`
 * stays public. Everything that reads case data or writes a decision requires a
 * session.
 *
 * Sign-up is disabled. Officers are provisioned by the seed script, because a
 * compliance console where anyone can self-register as a reviewer is worse than
 * no auth at all.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 10,
  },

  user: {
    additionalFields: {
      // compliance_officer | senior_officer. Escalation is meant to reach a
      // human with more authority, so the distinction has to be persisted.
      role: {
        type: 'string',
        required: false,
        defaultValue: 'compliance_officer',
        input: false,
      },
    },
  },

  session: {
    // A shared review terminal should not stay signed in overnight.
    expiresIn: 60 * 60 * 8,
    updateAge: 60 * 60,
  },

  /**
   * The mobile app is not a browser: it has no cookie jar and no same-origin
   * concept, so its requests arrive with the app's custom scheme as their
   * origin. Both have to be trusted or every officer request from the phone is
   * rejected as cross-site.
   */
  trustedOrigins: [
    'parakh://',
    'parakh://*',
    process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    // Expo dev serves over the LAN, so the host varies by network.
    'http://localhost:8081',
    'http://192.168.*.*:3000',
    'http://10.*.*.*:3000',
    'http://172.*.*.*:3000',
  ],

  advanced: {
    defaultCookieAttributes: {
      sameSite: 'lax',
    },
  },

  // Order matters: expo() rewrites the session cookie for native clients,
  // nextCookies() must stay last so it can set cookies on the Next response.
  plugins: [expo(), nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
