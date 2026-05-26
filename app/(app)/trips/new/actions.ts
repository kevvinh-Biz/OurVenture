'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { trips, tripMembers } from '@/db/schema';

const createTripSchema = z.object({
  name: z.string().min(1, 'Trip name is required').max(200),
  destination: z.string().min(1, 'Destination is required').max(200),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
  defaultCurrency: z.string().length(3, 'Currency must be 3 characters').toUpperCase(),
  voteThreshold: z.number().int().min(1).max(100).default(60),
});

type CreateTripInput = z.infer<typeof createTripSchema>;

/**
 * Create a new trip.
 * 1. Validate input
 * 2. Get current user
 * 3. Generate invite code
 * 4. Insert trip
 * 5. Insert organizer membership
 * 6. Redirect to trip dashboard
 */
export async function createTripAction(input: unknown) {
  const data = createTripSchema.parse(input);

  // Get current user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Validate date order
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (endDate < startDate) {
    throw new Error('End date must be after start date');
  }

  // Generate a unique invite code (6 alphanumeric characters)
  const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

  try {
    // Create trip
    const tripId = crypto.randomUUID();

    await db.insert(trips).values({
      id: tripId,
      name: data.name,
      destination: data.destination,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      createdBy: user.id,
      defaultCurrency: data.defaultCurrency,
      inviteCode,
      voteThreshold: data.voteThreshold,
    });

    // Add organizer as member
    await db.insert(tripMembers).values({
      tripId,
      userId: user.id,
      role: 'organizer',
      status: 'active',
    });

    // Redirect to trip dashboard
    redirect(`/trips/${tripId}`);
  } catch (error) {
    console.error('Trip creation failed:', error);
    throw new Error('Failed to create trip. Please try again.');
  }
}
