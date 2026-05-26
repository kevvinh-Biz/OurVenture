import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { itineraryStops, votes, tripMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const metadata: Metadata = { title: 'Timeline' };

export default async function TripTimelinePage({
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

  // Fetch approved stops in chronological order
  const approvedStops = await db
    .select()
    .from(itineraryStops)
    .where(
      and(
        eq(itineraryStops.tripId, id),
        eq(itineraryStops.status, 'approved'),
      ),
    )
    .orderBy(itineraryStops.scheduledAt);

  // Get member count for context
  const members = await db.select().from(tripMembers).where(eq(tripMembers.tripId, id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Timeline</h2>
        <p className="text-sm text-muted-foreground">
          Approved stops in chronological order. This is your trip at a glance.
        </p>
      </div>

      {approvedStops.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <CardTitle>No approved stops yet</CardTitle>
            <CardDescription>
              Add stops in the Itinerary and vote to approve them. Approved stops will appear here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvedStops.map((stop, index) => {
            const scheduledTime = stop.scheduledAt
              ? new Date(stop.scheduledAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : null;

            const scheduledDate = stop.scheduledAt
              ? new Date(stop.scheduledAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  weekday: 'short',
                })
              : null;

            // Calculate time until next stop (rough estimate)
            const nextStop = approvedStops[index + 1];
            let timeWarning = null;

            if (nextStop && stop.scheduledAt && nextStop.scheduledAt) {
              const currentTime = new Date(stop.scheduledAt);
              const nextTime = new Date(nextStop.scheduledAt);
              const bufferMinutes = (stop.durationMin || 60) + 120; // duration + 2 hour buffer
              const bufferMs = bufferMinutes * 60 * 1000;

              if (currentTime.getTime() + bufferMs > nextTime.getTime()) {
                timeWarning = 'Tight schedule: may not have enough travel time';
              }
            }

            return (
              <Card key={stop.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground font-medium">
                        {scheduledDate} • {scheduledTime}
                      </div>
                      <CardTitle className="mt-1">{stop.title}</CardTitle>
                      {stop.address && (
                        <CardDescription className="mt-1">{stop.address}</CardDescription>
                      )}
                    </div>
                    <Badge>Approved</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {stop.description && (
                    <p className="text-sm text-muted-foreground">{stop.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm">
                    {stop.durationMin && (
                      <div className="text-muted-foreground">
                        Duration: {stop.durationMin} min
                      </div>
                    )}
                    {stop.costEstimate && (
                      <div className="text-muted-foreground">
                        Cost: {stop.costEstimate} {stop.currency}
                      </div>
                    )}
                  </div>

                  {timeWarning && (
                    <div className="rounded-lg bg-yellow-50 p-2 text-sm text-yellow-800">
                      ⚠️ {timeWarning}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
