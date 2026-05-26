import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { trips, tripMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const TABS = [
  { href: '', label: 'Overview' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/itinerary', label: 'Itinerary' },
] as const;

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const base = `/trips/${id}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify user is a member of this trip
  const membership = await db
    .select()
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, id), eq(tripMembers.userId, user.id)));

  if (membership.length === 0) {
    redirect('/dashboard');
  }

  // Fetch trip details
  const tripResult = await db.select().from(trips).where(eq(trips.id, id));

  if (tripResult.length === 0) {
    redirect('/dashboard');
  }

  const trip = tripResult[0];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Trip</p>
        <h1 className="text-2xl font-bold tracking-tight">{trip.name}</h1>
        <p className="text-sm text-muted-foreground">
          {trip.destination} •{' '}
          {new Date(trip.startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}{' '}
          -{' '}
          {new Date(trip.endDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </header>

      <Card className="overflow-x-auto p-1">
        <nav aria-label="Trip sections" className="flex gap-1">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={`${base}${tab.href}`}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </Card>

      <div>{children}</div>
    </div>
  );
}
