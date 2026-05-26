import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { trips, tripMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Join trip' };

export default async function JoinTripPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login, then back to this page after auth
    redirect(`/login?redirectTo=/join/${code}`);
  }

  try {
    // Find trip by invite code
    const tripResult = await db
      .select()
      .from(trips)
      .where(eq(trips.inviteCode, code.toUpperCase()));

    if (tripResult.length === 0) {
      return (
        <div className="container flex min-h-dvh items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Invalid invite link</CardTitle>
              <CardDescription>
                The trip you're trying to join doesn't exist or the link has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/dashboard">Back to my trips</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    const trip = tripResult[0];

    // Check if user is already a member
    const existingMembership = await db
      .select()
      .from(tripMembers)
      .where(and(eq(tripMembers.tripId, trip.id), eq(tripMembers.userId, user.id)));

    if (existingMembership.length > 0) {
      // Already a member, redirect to trip
      redirect(`/trips/${trip.id}`);
    }

    // Add user as member
    await db.insert(tripMembers).values({
      tripId: trip.id,
      userId: user.id,
      role: 'member',
      status: 'active',
    });

    // Redirect to trip dashboard
    redirect(`/trips/${trip.id}`);
  } catch (error) {
    console.error('Error joining trip:', error);

    return (
      <div className="container flex min-h-dvh items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              We couldn't add you to the trip. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/dashboard">Back to my trips</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
