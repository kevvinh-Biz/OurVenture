/**
 * Placeholder for the generated Supabase Database types.
 *
 * Once the DB is provisioned, run:
 *   npx supabase gen types typescript --project-id <REF> --schema public > lib/supabase/database.types.ts
 *
 * Then re-export from here so the rest of the app can consume a single import:
 *   export type { Database } from './database.types';
 */

// Until generation is wired up, expose a permissive shim so callers can type
// `SupabaseClient<Database>` without breaking the build.
export type Database = Record<string, unknown>;

export type Tables<T extends string> = Record<string, unknown> & { __table: T };
