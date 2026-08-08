// Must be first: loads the root .env before anything below reads process.env.
import './env.js';

import { neon, Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzleWs } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

import * as schema from './schema.js';

function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env and paste your Neon connection string.',
    );
  }
  return url;
}

/**
 * HTTP driver — reads and single-statement writes.
 *
 * One round trip per statement, no connection to hold open. This is the right
 * default inside a serverless route handler. It CANNOT run a transaction that
 * spans statements — use `dbTx` for that.
 */
export const db = drizzle(neon(connectionString()), { schema });

/**
 * WebSocket driver — multi-statement transactions only.
 *
 * The decision write updates `cases` and inserts into `decisions` together. A
 * half-applied decision would corrupt the audit trail, so that path needs a
 * real transaction and therefore this driver.
 *
 * Lazily constructed: opening a pool costs a socket, and most requests never
 * need one.
 */
let _dbTx: ReturnType<typeof drizzleWs<typeof schema>> | undefined;

export function dbTx() {
  if (!_dbTx) {
    // Node has no global WebSocket before 22; the Neon driver needs one.
    if (typeof globalThis.WebSocket === 'undefined') {
      neonConfig.webSocketConstructor = ws;
    }
    _dbTx = drizzleWs(new Pool({ connectionString: connectionString() }), { schema });
  }
  return _dbTx;
}
