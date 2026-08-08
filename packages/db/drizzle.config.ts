import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // strict:true makes `push` prompt for confirmation, which hangs in CI and in
  // any non-TTY shell. This is a dev database that gets reseeded constantly —
  // turn it back on if this schema ever fronts real customer data.
  strict: false,
  verbose: false,
});
