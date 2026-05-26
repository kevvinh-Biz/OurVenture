import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Supabase OAuth + magic-link callback.
 *
 * Flow:
 *   1. Supabase redirects to `/callback?code=...&next=/dashboard` after the
 *      user authenticates with Google (or clicks a magic-link email).
 *   2. We exchange the one-time `code` for a session cookie.
 *   3. We redirect to `next` (defaulting to `/dashboard`) or to `/login?error=...`
 *      if the exchange failed.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
