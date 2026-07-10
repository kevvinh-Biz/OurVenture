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
 * The client is created lazily on first query, NOT at import time. Next.js
 * imports page modules during `next build` ("Collecting page data"), and an
 * invalid or missing DATABASE_URL must not crash the build — only actual
 * queries at request time should need it.
 *
 * NOTE: This bypasses RLS by using the connection-pool user. Member-scoped
 * reads should go through the Supabase JS client (`lib/supabase/server.ts`)
 * so the user's JWT is forwarded and RLS is enforced. Use the Drizzle client
 * for admin/cron jobs and service-role logic only.
 */

type Db = ReturnType<typeof drizzle<typeof schema>>;

// Reuse the connection across hot reloads in dev.
const globalForDb = globalThis as unknown as { _db?: Db };

function createDb(): Db {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      '[lib/db] DATABASE_URL is not set. Add it to .env.local (or Vercel env vars). ' +
        'If the password contains special characters, they must be percent-encoded.',
    );
  }
  const client = postgres(databaseUrl, { prepare: false, max: 1 });
  return drizzle(client, { schema });
}

function getDb(): Db {
  if (!globalForDb._db) {
    globalForDb._db = createDb();
  }
  return globalForDb._db;
}

/**
 * Lazy proxy: touching any property (db.select, db.insert, ...) initializes
 * the real client on first use. Importing this module never connects.
 */
export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

export { schema };
