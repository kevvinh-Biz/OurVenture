import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { trips, tripMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { InviteModal } from '@/components/trips/invite-modal';

export const metadata: Metadata = { title: 'Trip Overview' };

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch trip
  const tripResult = await db.select().from(trips).where(eq(trips.id, id));
  if (tripResult.length === 0) {
    return <div>Trip not found</div>;
  }

  const trip = tripResult[0];

  // Check if user is organizer
  const membershipResult = await db
    .select()
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, id), eq(tripMembers.userId, user.id)));

  const isOrganizer = membershipResult.length > 0 && membershipResult[0].role === 'organizer';

  // Fetch members
  const members = await db.select().from(tripMembers).where(eq(tripMembers.tripId, id));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Duration</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {new Date(trip.startDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}{' '}
            -{' '}
            {new Date(trip.endDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Members ({members.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="text-sm">
                  <span className="capitalize">{m.role}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Currency</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{trip.defaultCurrency}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vote Threshold</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{trip.voteThreshold}%</CardContent>
        </Card>
      </div>

      {isOrganizer && (
        <Card>
          <CardHeader>
            <CardTitle>Organizer Controls</CardTitle>
            <CardDescription>Manage trip membership and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InviteModal tripId={id} inviteCode={trip.inviteCode} />

            <Button asChild className="w-full">
              <Link href={`/trips/${id}/itinerary/add-stop`}>
                <Plus className="mr-2 h-4 w-4" />
                Add a stop
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
