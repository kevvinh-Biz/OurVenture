import Link from 'next/link';
import type { Metadata } from 'next';
import { Compass, Plus, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { trips, tripMembers, profiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const metadata: Metadata = { title: 'My Trips' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // Layout will redirect
  }

  // Fetch all trips where user is a member
  const userTrips = await db
    .select({
      trip: trips,
      role: tripMembers.role,
    })
    .from(trips)
    .innerJoin(
      tripMembers,
      and(eq(tripMembers.tripId, trips.id), eq(tripMembers.userId, user.id)),
    )
    .orderBy(trips.startDate);

  // Count members per trip
  const tripMemberCounts = await Promise.all(
    userTrips.map(async (t) => {
      const members = await db
        .select({ id: tripMembers.id })
        .from(tripMembers)
        .where(eq(tripMembers.tripId, t.trip.id));
      return { tripId: t.trip.id, memberCount: members.length };
    }),
  );

  const memberCountMap = new Map(tripMemberCounts.map((x) => [x.tripId, x.memberCount]));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Trips</h1>
          <p className="text-sm text-muted-foreground">
            All the trips you&apos;re organizing or invited to.
          </p>
        </div>
        <Button asChild>
          <Link href="/trips/new">
            <Plus className="mr-2 h-4 w-4" />
            New trip
          </Link>
        </Button>
      </div>

      {userTrips.length === 0 ? (
        // Empty state
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <div className="mb-2 rounded-full bg-muted p-3">
              <Compass className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <CardTitle>No trips yet</CardTitle>
            <CardDescription>
              Create your first trip and invite the crew. Everything else flows from there.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/trips/new">Create your first trip</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Trip list
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userTrips.map(({ trip, role }) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">{trip.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {trip.destination}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <div>
                      {new Date(trip.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      -{' '}
                      {new Date(trip.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {memberCountMap.get(trip.id) || 0} member
                    {(memberCountMap.get(trip.id) || 0) !== 1 ? 's' : ''}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <span className="inline-block rounded bg-muted px-2 py-1">{role}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
