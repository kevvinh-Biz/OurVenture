import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@/components/auth/sign-out-button';

/**
 * Auth-gate for everything under `(app)`. If there's no session, we redirect
 * to `/login`. Real Supabase env keys are required for this check to succeed;
 * see `.env.example`.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            OurVenture
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
