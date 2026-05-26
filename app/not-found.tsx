import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="container flex min-h-dvh flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          404
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Looks like that trip doesn&apos;t exist.
        </h1>
        <p className="text-muted-foreground">
          The page you were looking for has moved, was deleted, or never existed.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to the homepage</Link>
      </Button>
    </main>
  );
}
