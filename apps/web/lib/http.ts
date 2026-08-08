import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * One error shape for the whole API.
 *
 * Without this, an unhandled throw inside a route handler renders Next's HTML
 * error page — a mobile client parsing JSON gets a SyntaxError and shows
 * nothing useful. Every failure here comes back as JSON with a stable
 * machine-readable `error` code.
 */
export type ApiError = {
  error: string;
  message?: string;
  issues?: { field: string; message: string }[];
};

export function fail(error: string, status: number, extra?: Omit<ApiError, 'error'>) {
  return NextResponse.json({ error, ...extra }, { status });
}

export function validationFailed(err: z.ZodError) {
  return fail('validation_failed', 400, {
    message: 'One or more fields are invalid.',
    issues: err.issues.map((i) => ({
      field: i.path.join('.') || '(root)',
      message: i.message,
    })),
  });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Postgres throws `invalid input syntax for type uuid` on a malformed id, which
 * surfaces as a 500. A bad id in the URL is the client's mistake, not ours.
 */
export function isUuid(value: string): boolean {
  return UUID.test(value);
}

/** Parse a JSON body, returning a typed result rather than throwing. */
export async function parseBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      ok: false,
      response: fail('invalid_json', 400, { message: 'Request body must be valid JSON.' }),
    };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, response: validationFailed(parsed.error) };
  }
  return { ok: true, data: parsed.data };
}

/**
 * Wrap a route handler so nothing escapes as HTML.
 *
 * Also logs, because on a demo stage the difference between "the API is broken"
 * and "Neon went to sleep" is the difference between recovering and not.
 */
export function route<A extends unknown[]>(
  name: string,
  handler: (...args: A) => Promise<NextResponse>,
) {
  return async (...args: A): Promise<NextResponse> => {
    const startedAt = Date.now();
    try {
      const response = await handler(...args);
      console.log(`[${name}] ${response.status} ${Date.now() - startedAt}ms`);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${name}] 500 ${Date.now() - startedAt}ms — ${message}`);
      if (err instanceof Error && err.stack) console.error(err.stack);

      // Surface the most common operational failure specifically — a sleeping
      // or misconfigured Neon branch looks identical to a code bug otherwise.
      const isDbError =
        /DATABASE_URL|ECONNREFUSED|ENOTFOUND|terminating connection|password authentication/i.test(
          message,
        );

      return fail(isDbError ? 'database_unavailable' : 'internal_error', isDbError ? 503 : 500, {
        message:
          process.env.NODE_ENV === 'production'
            ? 'Something went wrong.'
            : message.slice(0, 400),
      });
    }
  };
}
