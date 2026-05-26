import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { itineraryStops, votes, tripMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { StopCard } from '@/components/trips/stop-card';

export const metadata: Metadata = { title: 'Itinerary' };

export default async function TripItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch all stops for this trip
  const stops = await db
    .select()
    .from(itineraryStops)
    .where(eq(itineraryStops.tripId, id))
    .orderBy(itineraryStops.scheduledAt);

  // Fetch vote counts and current user votes
  const stopVotes = await Promise.all(
    stops.map(async (stop) => {
      const stopVoteList = await db.select().from(votes).where(eq(votes.stopId, stop.id));

      const yesCount = stopVoteList.filter((v) => v.vote === 'yes').length;
      const noCount = stopVoteList.filter((v) => v.vote === 'no').length;
      const maybeCount = stopVoteList.filter((v) => v.vote === 'maybe').length;

      const userVote = stopVoteList.find((v) => v.userId === user.id)?.vote;

      return {
        stopId: stop.id,
        yesCount,
        noCount,
        maybeCount,
        userVote,
      };
    }),
  );

  const votesMap = new Map(stopVotes.map((v) => [v.stopId, v]));

  // Get trip threshold and member count
  const members = await db.select().from(tripMembers).where(eq(tripMembers.tripId, id));
  const totalMembers = members.length;
  // TODO: fetch actual threshold from trips table
  const threshold = 60;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Stops</h2>
          <p className="text-sm text-muted-foreground">
            All planned stops. Members can vote to approve or skip each one.
          </p>
        </div>
        <Button asChild>
          <Link href={`/trips/${id}/itinerary/add-stop`}>
            <Plus className="mr-2 h-4 w-4" />
            Add stop
          </Link>
        </Button>
      </div>

      {stops.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <CardTitle>No stops yet</CardTitle>
            <CardDescription>Add your first stop to get started with the itinerary.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href={`/trips/${id}/itinerary/add-stop`}>Add a stop</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {stops.map((stop) => {
            const voteData = votesMap.get(stop.id);
            return (
              <StopCard
                key={stop.id}
                stopId={stop.id}
                tripId={id}
                title={stop.title}
                address={stop.address || undefined}
                scheduledAt={stop.scheduledAt?.toISOString()}
                costEstimate={stop.costEstimate ? String(stop.costEstimate) : undefined}
                currency={stop.currency || undefined}
                status={stop.status as any}
                description={stop.description || undefined}
                yesVotes={voteData?.yesCount || 0}
                noVotes={voteData?.noCount || 0}
                maybeVotes={voteData?.maybeCount || 0}
                currentUserVote={voteData?.userVote as any}
                threshold={threshold}
                totalMembers={totalMembers}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
