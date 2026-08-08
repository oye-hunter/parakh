import { config } from 'dotenv';

/**
 * Load the root `.env` before anything reads `process.env`.
 *
 * This is its own module on purpose. ES module imports are hoisted and
 * evaluated before any statement in the importing file's body, so calling
 * `config()` inside a script runs *after* `@parakh/db` has already been
 * evaluated — and the client throws on a missing DATABASE_URL at import time.
 * Importing this module first makes the load an import too, which keeps the
 * ordering correct.
 *
 * Secrets live in exactly one file at the repo root; the paths below cover the
 * different working directories a script can be launched from. Under Next.js
 * the variables are already present and dotenv leaves them alone.
 */
config({ path: ['.env', '../.env', '../../.env', '../../../.env'], quiet: true });
