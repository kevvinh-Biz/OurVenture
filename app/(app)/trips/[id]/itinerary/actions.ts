'use server';

import { z } from 'zod';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { itineraryStops, votes, tripMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const createStopSchema = z.object({
  tripId: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  googlePlaceId: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  address: z.string().max(500).optional(),
  scheduledAt: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  durationMin: z.number().int().positive().optional(),
  costEstimate: z.string().optional(),
  currency: z.string().length(3).toUpperCase().optional(),
  notes: z.string().max(2000).optional(),
});

type CreateStopInput = z.infer<typeof createStopSchema>;

/**
 * Create a new itinerary stop.
 * - Validate user is member of trip
 * - Insert stop with status='proposed'
 */
export async function createStopAction(input: unknown) {
  const data = createStopSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Verify user is trip member
  const membership = await db
    .select()
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, data.tripId), eq(tripMembers.userId, user.id)));

  if (membership.length === 0) {
    throw new Error('Not a member of this trip');
  }

  try {
    const stopId = crypto.randomUUID();

    // Parse numeric fields
    const costEstimate = data.costEstimate ? parseFloat(data.costEstimate) : undefined;
    const lat = data.lat ? parseFloat(data.lat) : undefined;
    const lng = data.lng ? parseFloat(data.lng) : undefined;

    await db.insert(itineraryStops).values({
      id: stopId,
      tripId: data.tripId,
      title: data.title,
      description: data.description,
      googlePlaceId: data.googlePlaceId,
      lat: lat ? lat.toString() : undefined,
      lng: lng ? lng.toString() : undefined,
      address: data.address,
      scheduledAt: new Date(data.scheduledAt),
      durationMin: data.durationMin,
      costEstimate: costEstimate ? costEstimate.toString() : undefined,
      currency: data.currency,
      createdBy: user.id,
      status: 'proposed',
    });

    return { stopId };
  } catch (error) {
    console.error('Stop creation failed:', error);
    throw new Error('Failed to create stop. Please try again.');
  }
}

const voteSchema = z.object({
  stopId: z.string().uuid(),
  tripId: z.string().uuid(),
  vote: z.enum(['yes', 'no', 'maybe']),
});

type VoteInput = z.infer<typeof voteSchema>;

/**
 * Vote on a stop (yes/no/maybe).
 * - Validate user is trip member
 * - Upsert vote
 * - Recalculate approval status
 */
export async function voteOnStopAction(input: unknown) {
  const data = voteSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Verify user is trip member
  const membership = await db
    .select()
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, data.tripId), eq(tripMembers.userId, user.id)));

  if (membership.length === 0) {
    throw new Error('Not a member of this trip');
  }

  try {
    // Find or create vote
    const existingVote = await db
      .select()
      .from(votes)
      .where(and(eq(votes.stopId, data.stopId), eq(votes.userId, user.id)));

    if (existingVote.length > 0) {
      // Update existing vote
      await db
        .update(votes)
        .set({ vote: data.vote, votedAt: new Date() })
        .where(eq(votes.id, existingVote[0].id));
    } else {
      // Create new vote
      await db.insert(votes).values({
        stopId: data.stopId,
        userId: user.id,
        vote: data.vote,
      });
    }

    // Get vote counts and check approval threshold
    const allVotes = await db
      .select()
      .from(votes)
      .where(eq(votes.stopId, data.stopId));

    // Get trip vote threshold
    const stop = await db
      .select({ tripId: itineraryStops.tripId })
      .from(itineraryStops)
      .where(eq(itineraryStops.id, data.stopId));

    if (stop.length === 0) {
      throw new Error('Stop not found');
    }

    // Count votes by type
    const yesVotes = allVotes.filter((v) => v.vote === 'yes').length;
    const totalMembers = (
      await db
        .select()
        .from(tripMembers)
        .where(eq(tripMembers.tripId, data.tripId))
    ).length;

    // For MVP: simple 60% threshold (or trip's configured threshold)
    // TODO: fetch actual trip threshold from trips table
    const threshold = 60;
    const votesNeeded = Math.ceil((threshold / 100) * totalMembers);

    let newStatus = 'proposed';
    if (yesVotes >= votesNeeded) {
      newStatus = 'approved';
    }

    // Update stop status if needed
    const currentStop = await db
      .select({ status: itineraryStops.status })
      .from(itineraryStops)
      .where(eq(itineraryStops.id, data.stopId));

    if (currentStop[0].status !== newStatus) {
      await db
        .update(itineraryStops)
        .set({ status: newStatus as any })
        .where(eq(itineraryStops.id, data.stopId));
    }

    return { status: newStatus, yesVotes, votesNeeded, totalMembers };
  } catch (error) {
    console.error('Vote failed:', error);
    throw new Error('Failed to record vote. Please try again.');
  }
}
