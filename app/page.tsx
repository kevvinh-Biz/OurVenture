import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-dvh">
      <section className="container flex min-h-dvh flex-col items-center justify-center gap-8 py-16 text-center">
        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            OurVenture · MVP scaffold
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Plan group trips without the group chat chaos.
          </h1>
          <p className="text-balance text-lg text-muted-foreground sm:text-xl">
            Decide together, track every reservation, and remember it all in one place.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup">Create an account</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Log in</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Scaffold only — landing copy will be replaced by the marketing pass.
        </p>
      </section>
    </main>
  );
}
