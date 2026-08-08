import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Better Auth mounts its whole surface here — sign-in, sign-out, session.
 * Sign-up is disabled in the config; officers are provisioned by
 * `pnpm provision:officers`.
 */
export const { GET, POST } = toNextJsHandler(auth);
