import { headers } from 'next/headers';

import { fail } from '@/lib/http';
import { auth } from '@/lib/auth';

export type Officer = {
  id: string;
  name: string;
  email: string;
  role: string;
};

/**
 * Resolve the signed-in officer, or return a 401.
 *
 * This is the whole point of adding auth. Before it, `POST /api/decisions`
 * accepted an `officerId` in the request body — meaning anyone who could reach
 * the API could attribute an approval to any officer they liked, and the audit
 * trail would faithfully record the lie. Officer identity now comes from the
 * session cookie and nowhere else.
 */
export async function requireOfficer(): Promise<
  { ok: true; officer: Officer } | { ok: false; response: ReturnType<typeof fail> }
> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return {
      ok: false,
      response: fail('unauthenticated', 401, {
        message: 'Sign in to access the compliance console.',
      }),
    };
  }

  const user = session.user as typeof session.user & { role?: string | null };

  return {
    ok: true,
    officer: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ?? 'compliance_officer',
    },
  };
}

/** Some actions should require seniority. Escalation review is the obvious one. */
export function requireSenior(officer: Officer) {
  if (officer.role !== 'senior_officer') {
    return fail('insufficient_role', 403, {
      message: 'This action requires a senior officer.',
    });
  }
  return null;
}
