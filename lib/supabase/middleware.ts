import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase auth session on every request and forwards the
 * updated auth cookies to the response. Called from the root `middleware.ts`.
 *
 * Per @supabase/ssr docs, this MUST run before any code that relies on
 * `auth.uid()` (e.g. RLS-aware queries). Without it, server-side reads will
 * see a stale or missing session and silently return empty results.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do NOT remove this `getUser()` call. It triggers session
  // refresh + cookie rotation. The route layout will re-check auth itself.
  await supabase.auth.getUser();

  return supabaseResponse;
}
