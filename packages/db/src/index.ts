// schema.ts already re-exports the Better Auth tables, so exporting
// auth-schema here too would be a duplicate-export error.
export * from './schema.js';
export { db, dbTx } from './client.js';
export { and, asc, desc, eq, gte, inArray, isNull, lte, ne, or, sql } from 'drizzle-orm';
