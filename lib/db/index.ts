import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

/**
 * Server-only Drizzle client.
 *
 * Uses the `postgres` driver against Supabase Postgres. For Vercel deployments
 * point DATABASE_URL at the *pooler* connection string (port 6543) with
 * `?pgbouncer=true&connection_limit=1`. For drizzle-kit migrations use the
 * direct connection (port 5432).
 *
 * NOTE: This bypasses RLS by using the connection-pool user. Member-scoped
 * reads should go through the Supabase JS client (`lib/supabase/server.ts`)
 * so the user's JWT is forwarded and RLS is enforced. Use the Drizzle client
 * for admin/cron jobs and service-role logic only.
 */

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.warn(
    '[lib/db] DATABASE_URL is not set. Drizzle queries will fail at runtime.',
  );
}

// Reuse the connection across hot reloads in dev.
const globalForDb = globalThis as unknown as {
  _pg?: ReturnType<typeof postgres>;
};

const client =
  globalForDb._pg ??
  postgres(databaseUrl ?? 'postgresql://placeholder:placeholder@localhost:5432/postgres', {
    prepare: false,
    max: 1,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb._pg = client;
}

export const db = drizzle(client, { schema });
export { schema };
