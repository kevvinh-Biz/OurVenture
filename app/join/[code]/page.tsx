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

function ErrorCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="container flex min-h-dvh items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
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

export default async function JoinTripPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login, then back to this page after auth
    redirect(`/login?redirectTo=/join/${encodeURIComponent(code)}`);
  }

  // NOTE: redirect() works by throwing, so it must NOT run inside try/catch —
  // the catch would swallow it. Compute the destination in the try block and
  // redirect after.
  let destination: string | null = null;

  try {
    // Find trip by invite code
    const tripResult = await db
      .select()
      .from(trips)
      .where(eq(trips.inviteCode, code.toUpperCase()));

    if (tripResult.length === 0) {
      return (
        <ErrorCard
          title="Invalid invite link"
          description="The trip you're trying to join doesn't exist or the link has expired."
        />
      );
    }

    const trip = tripResult[0];

    // Check if user is already a member
    const existingMembership = await db
      .select()
      .from(tripMembers)
      .where(and(eq(tripMembers.tripId, trip.id), eq(tripMembers.userId, user.id)));

    if (existingMembership.length === 0) {
      // Add user as member
      await db.insert(tripMembers).values({
        tripId: trip.id,
        userId: user.id,
        role: 'member',
        status: 'active',
      });
    }

    destination = `/trips/${trip.id}`;
  } catch (error) {
    console.error('Error joining trip:', error);
    return (
      <ErrorCard
        title="Something went wrong"
        description="We couldn't add you to the trip. Please try again later."
      />
    );
  }

  redirect(destination);
}
