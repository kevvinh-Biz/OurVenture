/**
 * OurVenture — Development Seed
 *
 * Re-runnable. Wipes the deterministic seed rows (by fixed UUIDs) and
 * re-inserts them. Safe to run repeatedly; does NOT touch any rows not
 * matching the seed UUIDs.
 *
 * Usage:
 *   pnpm tsx db/seed.ts
 *
 * Required env:
 *   SUPABASE_URL                — your project URL
 *   SUPABASE_SERVICE_ROLE_KEY   — service role key (bypasses RLS for seeding)
 *   DATABASE_URL                — direct Postgres URL (drizzle)
 *
 * The script:
 *   1. Creates 3 auth.users via Supabase Admin API (idempotent).
 *   2. Inserts matching profiles.
 *   3. Inserts trip "Tokyo October 2026" + memberships.
 *   4. Inserts 5 itinerary stops, votes, 2 reservations, 4 expenses,
 *      2 photos, 2 notes, checklist items.
 *
 * IMPORTANT: This bypasses RLS. Never run against production.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, inArray } from 'drizzle-orm';
import * as schema from './schema';

// ─── Fixed UUIDs for idempotent seeding ──────────────────────────────────────
const U = {
  olivia:  '00000000-0000-0000-0000-000000000001',
  mark:    '00000000-0000-0000-0000-000000000002',
  fiona:   '00000000-0000-0000-0000-000000000003',
};
const TRIP_ID = '11111111-1111-1111-1111-111111111111';
const STOP = {
  shibuya:   '22222222-2222-2222-2222-222222222201',
  teamlab:   '22222222-2222-2222-2222-222222222202',
  tsukiji:   '22222222-2222-2222-2222-222222222203',
  fuji:      '22222222-2222-2222-2222-222222222204',
  jiroRamen: '22222222-2222-2222-2222-222222222205',
};
const RES = {
  hotel: '33333333-3333-3333-3333-333333333301',
  teamlabTicket: '33333333-3333-3333-3333-333333333302',
};
const EXP = {
  hotel:   '44444444-4444-4444-4444-444444444401',
  dinner:  '44444444-4444-4444-4444-444444444402',
  jrPass:  '44444444-4444-4444-4444-444444444403',
  taxi:    '44444444-4444-4444-4444-444444444404',
};
const PHOTO = {
  shibuya: '55555555-5555-5555-5555-555555555501',
  teamlab: '55555555-5555-5555-5555-555555555502',
};

// ─── Clients ────────────────────────────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl       = process.env.DATABASE_URL;

if (!supabaseUrl || !serviceKey || !dbUrl) {
  console.error(
    'Missing env. Need SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL',
  );
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const sqlClient = postgres(dbUrl, { max: 1 });
const db = drizzle(sqlClient, { schema });

// ─── Auth user upsert helper ────────────────────────────────────────────────
async function upsertAuthUser(
  id: string,
  email: string,
  displayName: string,
) {
  // Try create; on duplicate, ignore.
  const { error } = await admin.auth.admin.createUser({
    id,
    email,
    email_confirm: true,
    password: 'devpassword123!',
    user_metadata: { display_name: displayName },
  });
  if (error && !/already (been )?registered|exists/i.test(error.message)) {
    throw error;
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('Seeding OurVenture dev data…');

  // 1. Auth users (Supabase admin API)
  await upsertAuthUser(U.olivia, 'olivia@example.com', 'Olivia');
  await upsertAuthUser(U.mark,   'mark@example.com',   'Mark');
  await upsertAuthUser(U.fiona,  'fiona@example.com',  'Fiona');

  // 2. Wipe prior seed rows (cascade handles dependents)
  await db.delete(schema.trips).where(eq(schema.trips.id, TRIP_ID));
  await db
    .delete(schema.profiles)
    .where(inArray(schema.profiles.id, [U.olivia, U.mark, U.fiona]));

  // 3. Profiles
  await db.insert(schema.profiles).values([
    { id: U.olivia, displayName: 'Olivia',   homeCurrency: 'USD' },
    { id: U.mark,   displayName: 'Mark',     homeCurrency: 'USD' },
    { id: U.fiona,  displayName: 'Fiona',    homeCurrency: 'CAD' },
  ]);

  // 4. Trip
  await db.insert(schema.trips).values({
    id: TRIP_ID,
    name: 'Tokyo October 2026',
    destination: 'Tokyo, Japan',
    startDate: '2026-10-10',
    endDate:   '2026-10-18',
    createdBy: U.olivia,
    voteThreshold: 60,
    defaultCurrency: 'JPY',
    inviteCode: 'TOKYO2026',
    settings: {},
  });

  // 5. Members
  await db.insert(schema.tripMembers).values([
    { tripId: TRIP_ID, userId: U.olivia, role: 'organizer', status: 'active' },
    { tripId: TRIP_ID, userId: U.mark,   role: 'member',    status: 'active' },
    { tripId: TRIP_ID, userId: U.fiona,  role: 'member',    status: 'active' },
  ]);

  // 6. Itinerary stops (mix of proposed + approved)
  await db.insert(schema.itineraryStops).values([
    {
      id: STOP.shibuya,
      tripId: TRIP_ID,
      title: 'Shibuya Crossing',
      description: 'World-famous scramble crossing at golden hour.',
      googlePlaceId: 'ChIJK9EM68aLGGAR9vCMBs2x9_E',
      lat: '35.6595',
      lng: '139.7005',
      address: '2 Chome Dogenzaka, Shibuya City, Tokyo',
      scheduledAt: new Date('2026-10-11T09:00:00Z'),
      durationMin: 60,
      status: 'approved',
      costEstimate: '0',
      currency: 'JPY',
      createdBy: U.olivia,
      sortOrder: 1,
    },
    {
      id: STOP.teamlab,
      tripId: TRIP_ID,
      title: 'teamLab Planets',
      description: 'Immersive digital art museum (timed entry).',
      googlePlaceId: 'ChIJl5YQF3-OGGARWnYa4kIBtRk',
      lat: '35.6483',
      lng: '139.7901',
      address: '6 Chome-1-16 Toyosu, Koto City, Tokyo',
      scheduledAt: new Date('2026-10-12T05:00:00Z'),
      durationMin: 150,
      status: 'approved',
      costEstimate: '3800',
      currency: 'JPY',
      createdBy: U.mark,
      sortOrder: 2,
    },
    {
      id: STOP.tsukiji,
      tripId: TRIP_ID,
      title: 'Tsukiji Outer Market',
      description: 'Breakfast sushi crawl.',
      googlePlaceId: 'ChIJ51ZjEd6LGGARj9SJDLBNkVM',
      lat: '35.6655',
      lng: '139.7706',
      address: '4 Chome Tsukiji, Chuo City, Tokyo',
      scheduledAt: new Date('2026-10-13T22:00:00Z'),
      durationMin: 120,
      status: 'proposed',
      costEstimate: '4000',
      currency: 'JPY',
      createdBy: U.fiona,
      sortOrder: 3,
    },
    {
      id: STOP.fuji,
      tripId: TRIP_ID,
      title: 'Mt. Fuji Day Trip (Hakone)',
      description: 'Optional — long travel day; Hakone Free Pass route.',
      googlePlaceId: 'ChIJh43NWBVMGGARS-jJF4_TmuA',
      lat: '35.3606',
      lng: '138.7274',
      address: 'Hakone, Kanagawa',
      scheduledAt: new Date('2026-10-14T22:00:00Z'),
      durationMin: 600,
      status: 'proposed',
      costEstimate: '9000',
      currency: 'JPY',
      isOptional: true,
      createdBy: U.olivia,
      sortOrder: 4,
    },
    {
      id: STOP.jiroRamen,
      tripId: TRIP_ID,
      title: 'Jiro Ramen — Mita',
      description: 'Iconic tonkotsu; expect long queue.',
      lat: '35.6494',
      lng: '139.7361',
      address: '2 Chome-16-4 Mita, Minato City, Tokyo',
      scheduledAt: new Date('2026-10-15T03:00:00Z'),
      durationMin: 90,
      status: 'proposed',
      costEstimate: '1200',
      currency: 'JPY',
      createdBy: U.mark,
      sortOrder: 5,
    },
  ]);

  // 7. Votes
  await db.insert(schema.votes).values([
    // Shibuya — unanimous yes (approved)
    { stopId: STOP.shibuya, userId: U.olivia, vote: 'yes' },
    { stopId: STOP.shibuya, userId: U.mark,   vote: 'yes' },
    { stopId: STOP.shibuya, userId: U.fiona,  vote: 'yes' },
    // teamLab — 2 yes 1 maybe (approved at 60% threshold w/ 3 active)
    { stopId: STOP.teamlab, userId: U.olivia, vote: 'yes' },
    { stopId: STOP.teamlab, userId: U.mark,   vote: 'yes' },
    { stopId: STOP.teamlab, userId: U.fiona,  vote: 'maybe' },
    // Tsukiji — 1 yes 1 maybe (still proposed)
    { stopId: STOP.tsukiji, userId: U.fiona,  vote: 'yes' },
    { stopId: STOP.tsukiji, userId: U.olivia, vote: 'maybe' },
    // Fuji — split (proposed, optional)
    { stopId: STOP.fuji, userId: U.olivia, vote: 'yes' },
    { stopId: STOP.fuji, userId: U.mark,   vote: 'no' },
    // Jiro — 1 yes only
    { stopId: STOP.jiroRamen, userId: U.mark, vote: 'yes' },
  ]);

  // Optional opt-ins for the Fuji day trip
  await db.insert(schema.optionalOptIns).values([
    { stopId: STOP.fuji, userId: U.olivia },
    { stopId: STOP.fuji, userId: U.fiona },
  ]);

  // 8. Reservations
  await db.insert(schema.reservations).values([
    {
      id: RES.hotel,
      tripId: TRIP_ID,
      type: 'hotel',
      title: 'Park Hyatt Tokyo — 8 nights',
      confirmationNumber: 'PH-TYO-77821',
      scheduledAt: new Date('2026-10-10T07:00:00Z'),
      address: '3-7-1-2 Nishi Shinjuku, Shinjuku City, Tokyo',
      externalLink: 'https://www.hyatt.com/park-hyatt/tyoph',
      cancellationDeadline: new Date('2026-10-03T00:00:00Z'),
      totalCost: '720000',
      currency: 'JPY',
      paidBy: U.olivia,
    },
    {
      id: RES.teamlabTicket,
      tripId: TRIP_ID,
      stopId: STOP.teamlab,
      type: 'ticket',
      title: 'teamLab Planets — 3 tickets, 14:00 slot',
      confirmationNumber: 'TLP-2026-10-12-A4421',
      scheduledAt: new Date('2026-10-12T05:00:00Z'),
      address: '6 Chome-1-16 Toyosu, Koto City, Tokyo',
      externalLink: 'https://planets.teamlab.art',
      totalCost: '11400',
      currency: 'JPY',
      paidBy: U.mark,
    },
  ]);

  await db.insert(schema.reservationParticipants).values([
    // Hotel: 3 people, all tickets/paid TBD
    { reservationId: RES.hotel, userId: U.olivia, hasTicket: true,  hasPaid: true,  amountOwed: '240000', currency: 'JPY' },
    { reservationId: RES.hotel, userId: U.mark,   hasTicket: true,  hasPaid: false, amountOwed: '240000', currency: 'JPY' },
    { reservationId: RES.hotel, userId: U.fiona,  hasTicket: true,  hasPaid: false, amountOwed: '240000', currency: 'JPY' },
    // teamLab tickets
    { reservationId: RES.teamlabTicket, userId: U.olivia, hasTicket: true, hasPaid: true,  amountOwed: '3800', currency: 'JPY' },
    { reservationId: RES.teamlabTicket, userId: U.mark,   hasTicket: true, hasPaid: true,  amountOwed: '3800', currency: 'JPY' },
    { reservationId: RES.teamlabTicket, userId: U.fiona,  hasTicket: true, hasPaid: false, amountOwed: '3800', currency: 'JPY' },
  ]);

  // 9. Expenses (across all 4 in-MVP categories: lodging, food, transit, activity, misc)
  await db.insert(schema.expenses).values([
    {
      id: EXP.hotel,
      tripId: TRIP_ID,
      paidBy: U.olivia,
      amount: '720000',
      currency: 'JPY',
      category: 'lodging',
      description: 'Park Hyatt Tokyo full stay',
      expenseDate: '2026-10-10',
      splitType: 'equal',
    },
    {
      id: EXP.dinner,
      tripId: TRIP_ID,
      paidBy: U.mark,
      amount: '24500',
      currency: 'JPY',
      category: 'food',
      description: 'Group dinner — Ichiran Shibuya',
      expenseDate: '2026-10-11',
      splitType: 'equal',
    },
    {
      id: EXP.jrPass,
      tripId: TRIP_ID,
      paidBy: U.fiona,
      amount: '150000',
      currency: 'JPY',
      category: 'transit',
      description: '3× 7-day JR Pass',
      expenseDate: '2026-10-10',
      splitType: 'equal',
    },
    {
      id: EXP.taxi,
      tripId: TRIP_ID,
      paidBy: U.olivia,
      amount: '4200',
      currency: 'JPY',
      category: 'misc',
      description: 'Airport taxi back',
      expenseDate: '2026-10-18',
      splitType: 'equal',
    },
  ]);

  await db.insert(schema.expenseSplits).values([
    // Hotel (equal × 3)
    { expenseId: EXP.hotel, userId: U.olivia, amountOwed: '240000', settled: true,  settledAt: new Date() },
    { expenseId: EXP.hotel, userId: U.mark,   amountOwed: '240000', settled: false },
    { expenseId: EXP.hotel, userId: U.fiona,  amountOwed: '240000', settled: false },
    // Dinner
    { expenseId: EXP.dinner, userId: U.olivia, amountOwed: '8167', settled: false },
    { expenseId: EXP.dinner, userId: U.mark,   amountOwed: '8166', settled: true, settledAt: new Date() },
    { expenseId: EXP.dinner, userId: U.fiona,  amountOwed: '8167', settled: false },
    // JR Pass
    { expenseId: EXP.jrPass, userId: U.olivia, amountOwed: '50000', settled: false },
    { expenseId: EXP.jrPass, userId: U.mark,   amountOwed: '50000', settled: false },
    { expenseId: EXP.jrPass, userId: U.fiona,  amountOwed: '50000', settled: true, settledAt: new Date() },
    // Taxi
    { expenseId: EXP.taxi, userId: U.olivia, amountOwed: '1400', settled: true, settledAt: new Date() },
    { expenseId: EXP.taxi, userId: U.mark,   amountOwed: '1400', settled: false },
    { expenseId: EXP.taxi, userId: U.fiona,  amountOwed: '1400', settled: false },
  ]);

  // 10. Photos (storage paths are seed placeholders — real uploads write
  // through /api/photos/upload which enforces EXIF strip).
  await db.insert(schema.photos).values([
    {
      id: PHOTO.shibuya,
      tripId: TRIP_ID,
      stopId: STOP.shibuya,
      uploadedBy: U.mark,
      storagePath: `trip/${TRIP_ID}/photos/shibuya-crossing.jpg`,
      thumbnailPath: `trip/${TRIP_ID}/thumbs/shibuya-crossing.webp`,
      caption: 'Golden hour at the scramble.',
      visibility: 'group',
      exifStripped: true,
    },
    {
      id: PHOTO.teamlab,
      tripId: TRIP_ID,
      stopId: STOP.teamlab,
      uploadedBy: U.fiona,
      storagePath: `trip/${TRIP_ID}/photos/teamlab-planets.jpg`,
      thumbnailPath: `trip/${TRIP_ID}/thumbs/teamlab-planets.webp`,
      caption: 'Infinite mirror room.',
      visibility: 'shared',
      exifStripped: true,
    },
  ]);

  // 11. Notes (paired with the photos' stops)
  await db.insert(schema.stopNotes).values([
    {
      stopId: STOP.shibuya,
      userId: U.mark,
      content: 'Best vantage point: Starbucks 2F facing the crossing.',
      rating: 'must',
      tips: 'Avoid Saturday nights — wall of phones.',
      waitTimeMin: 0,
      bestTimeToGo: 'Weekday 17:00–18:30',
      visibility: 'group',
    },
    {
      stopId: STOP.teamlab,
      userId: U.fiona,
      content: 'Wear shorts — you walk through water.',
      rating: 'must',
      tips: 'Book the 14:00 slot, it is the least busy.',
      waitTimeMin: 15,
      bestTimeToGo: 'Weekday afternoon',
      visibility: 'group',
    },
  ]);

  // 12. Checklist (mix of group + personal + template items)
  await db.insert(schema.checklistItems).values([
    // Group items (organizer-created, user_id NULL)
    { tripId: TRIP_ID, userId: null, title: 'Confirm JR Pass shipping address', category: 'logistics', templateKey: 'jr_pass', completed: true },
    { tripId: TRIP_ID, userId: null, title: 'Lock the Hakone day trip',          category: 'planning',  completed: false },
    // Personal — Olivia
    { tripId: TRIP_ID, userId: U.olivia, title: 'Renew passport',     category: 'documents', templateKey: 'passport', completed: true,  dueDate: '2026-09-01' },
    { tripId: TRIP_ID, userId: U.olivia, title: 'Buy travel adapter', category: 'gear',      completed: false },
    // Personal — Mark
    { tripId: TRIP_ID, userId: U.mark, title: 'Renew passport',  category: 'documents', templateKey: 'passport', completed: false, dueDate: '2026-09-15' },
    { tripId: TRIP_ID, userId: U.mark, title: 'Set up eSIM',     category: 'connectivity', templateKey: 'esim', completed: false },
    // Personal — Fiona
    { tripId: TRIP_ID, userId: U.fiona, title: 'Renew passport', category: 'documents', templateKey: 'passport', completed: true, dueDate: '2026-09-01' },
    { tripId: TRIP_ID, userId: U.fiona, title: 'Notify bank of travel dates', category: 'finance', completed: false },
  ]);

  console.log('Seed complete.');
  console.log(`  Users:   ${U.olivia}, ${U.mark}, ${U.fiona}`);
  console.log(`  Trip:    ${TRIP_ID}  (invite code: TOKYO2026)`);
  console.log(`  Login as olivia@example.com / devpassword123!`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await sqlClient.end({ timeout: 5 });
  });
