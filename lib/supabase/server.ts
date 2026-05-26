import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase client for use inside Server Components, Server Actions, and Route
 * Handlers. Cookies are read/written via `next/headers`, which keeps the user's
 * session in sync across SSR + client navigations.
 *
 * Always create a fresh client per request; do not cache across requests.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as CookieOptions);
            });
          } catch {
            // The `setAll` call inside a Server Component throws — that's fine,
            // the middleware will refresh the session on the next request.
          }
        },
      },
    },
  );
}
