import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for use inside Client Components. Reads the session from
 * the cookies set by the SSR client + middleware.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
