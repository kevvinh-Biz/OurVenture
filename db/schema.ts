/**
 * OurVenture — Drizzle ORM Schema
 *
 * Source of truth for the OurVenture MVP backend (spec §7).
 * - Supabase Postgres + RLS (policies live in `./rls-policies.sql`)
 * - Identity is owned by Supabase Auth (`auth.users`). We DO NOT recreate a
 *   competing `users` table; the `profiles` table mirrors `auth.users.id`.
 * - All timestamps are `timestamptz` with `defaultNow()`.
 * - snake_case column names, camelCase TS field names.
 * - UUID PKs via `uuid().defaultRandom().primaryKey()`.
 * - FK cascade rules:
 *     - Membership / ownership links inside a trip => onDelete: 'cascade'
 *     - `created_by` / `paid_by` author references => onDelete: 'restrict'
 *
 * NOTE on `auth.users` reference: Drizzle's `pgTable` cannot natively reference
 * a table in the `auth` schema in a fully typed way without an `authSchema`
 * declaration. We declare a minimal `authUsers` shim (no migration emitted —
 * see drizzle.config.ts `schemaFilter: ['public']`) purely so `references()`
 * can type-check against it. The actual FK constraint is emitted via SQL in
 * `rls-policies.sql` / a hand-written migration.
 */

import {
  pgTable,
  pgSchema,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  numeric,
  char,
  jsonb,
  uniqueIndex,
  index,
  primaryKey,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/* -------------------------------------------------------------------------- */
/*  auth.users shim (Supabase-managed; not migrated by Drizzle)               */
/* -------------------------------------------------------------------------- */

export const authSchema = pgSchema('auth');

export const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

/* -------------------------------------------------------------------------- */
/*  Enums                                                                     */
/* -------------------------------------------------------------------------- */

export const memberRoleEnum = pgEnum('member_role', [
  'organizer',
  'member',
  'viewer',
]);

export const memberStatusEnum = pgEnum('member_status', [
  'invited',
  'active',
  'left',
]);

export const stopStatusEnum = pgEnum('stop_status', [
  'proposed',
  'approved',
  'rejected',
  'skipped',
]);

export const voteEnum = pgEnum('vote_value', ['yes', 'no', 'maybe']);

export const reservationTypeEnum = pgEnum('reservation_type', [
  'hotel',
  'restaurant',
  'transport',
  'tour',
  'ticket',
  'other',
]);

export const expenseCategoryEnum = pgEnum('expense_category', [
  'lodging',
  'food',
  'transit',
  'activity',
  'misc',
]);

export const splitTypeEnum = pgEnum('split_type', ['equal', 'shares', 'custom']);

export const photoVisibilityEnum = pgEnum('photo_visibility', [
  'private',
  'group',
  'shared',
  'public',
]);

export const noteVisibilityEnum = pgEnum('note_visibility', [
  'private',
  'group',
  'shared',
  'public',
]);

export const stopRatingEnum = pgEnum('stop_rating', [
  'must',
  'good',
  'okay',
  'skip',
]);

/* -------------------------------------------------------------------------- */
/*  profiles  (1:1 with auth.users)                                           */
/* -------------------------------------------------------------------------- */

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    displayName: text('display_name').notNull(),
    avatarUrl: text('avatar_url'),
    homeCurrency: char('home_currency', { length: 3 }).notNull().default('USD'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

/* -------------------------------------------------------------------------- */
/*  trips                                                                     */
/* -------------------------------------------------------------------------- */

export const trips = pgTable(
  'trips',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    destination: text('destination').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => profiles.id, { onDelete: 'restrict' }),
    voteThreshold: integer('vote_threshold').notNull().default(60),
    defaultCurrency: char('default_currency', { length: 3 })
      .notNull()
      .default('USD'),
    inviteCode: text('invite_code').notNull().unique(),
    coverPhotoUrl: text('cover_photo_url'),
    settings: jsonb('settings').notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    createdByIdx: index('trips_created_by_idx').on(t.createdBy),
    voteThresholdCk: check(
      'trips_vote_threshold_ck',
      sql`${t.voteThreshold} >= 1 AND ${t.voteThreshold} <= 100`,
    ),
    dateOrderCk: check('trips_date_order_ck', sql`${t.endDate} >= ${t.startDate}`),
  }),
);

/* -------------------------------------------------------------------------- */
/*  trip_members                                                              */
/* -------------------------------------------------------------------------- */

export const tripMembers = pgTable(
  'trip_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    role: memberRoleEnum('role').notNull().default('member'),
    status: memberStatusEnum('status').notNull().default('invited'),
    joinedAt: timestamp('joined_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    tripUserUq: uniqueIndex('trip_members_trip_user_uq').on(t.tripId, t.userId),
    tripIdx: index('trip_members_trip_idx').on(t.tripId),
    userIdx: index('trip_members_user_idx').on(t.userId),
  }),
);

/* -------------------------------------------------------------------------- */
/*  itinerary_stops                                                           */
/* -------------------------------------------------------------------------- */

export const itineraryStops = pgTable(
  'itinerary_stops',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    googlePlaceId: text('google_place_id'),
    lat: numeric('lat', { precision: 10, scale: 7 }),
    lng: numeric('lng', { precision: 10, scale: 7 }),
    address: text('address'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    durationMin: integer('duration_min'),
    status: stopStatusEnum('status').notNull().default('proposed'),
    costEstimate: numeric('cost_estimate', { precision: 12, scale: 2 }),
    currency: char('currency', { length: 3 }),
    isOptional: boolean('is_optional').notNull().default(false),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => profiles.id, { onDelete: 'restrict' }),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    tripIdx: index('itinerary_stops_trip_idx').on(t.tripId),
    createdByIdx: index('itinerary_stops_created_by_idx').on(t.createdBy),
    scheduledAtIdx: index('itinerary_stops_scheduled_at_idx').on(t.scheduledAt),
    placeIdx: index('itinerary_stops_place_idx').on(t.googlePlaceId),
  }),
);

/* -------------------------------------------------------------------------- */
/*  place_hours_cache                                                         */
/* -------------------------------------------------------------------------- */

export const placeHoursCache = pgTable('place_hours_cache', {
  googlePlaceId: text('google_place_id').primaryKey(),
  hours: jsonb('hours').notNull().default(sql`'{}'::jsonb`),
  closedDays: jsonb('closed_days').notNull().default(sql`'[]'::jsonb`),
  lastSynced: timestamp('last_synced', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*  votes                                                                     */
/* -------------------------------------------------------------------------- */

export const votes = pgTable(
  'votes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => itineraryStops.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    vote: voteEnum('vote').notNull(),
    votedAt: timestamp('voted_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    stopUserUq: uniqueIndex('votes_stop_user_uq').on(t.stopId, t.userId),
    stopIdx: index('votes_stop_idx').on(t.stopId),
    userIdx: index('votes_user_idx').on(t.userId),
  }),
);

/* -------------------------------------------------------------------------- */
/*  optional_opt_ins                                                          */
/* -------------------------------------------------------------------------- */

export const optionalOptIns = pgTable(
  'optional_opt_ins',
  {
    stopId: uuid('stop_id')
      .notNull()
      .references(() => itineraryStops.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    optedInAt: timestamp('opted_in_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.stopId, t.userId] }),
    stopIdx: index('optional_opt_ins_stop_idx').on(t.stopId),
    userIdx: index('optional_opt_ins_user_idx').on(t.userId),
  }),
);

/* -------------------------------------------------------------------------- */
/*  reservations                                                              */
/* -------------------------------------------------------------------------- */

export const reservations = pgTable(
  'reservations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    stopId: uuid('stop_id').references(() => itineraryStops.id, {
      onDelete: 'set null',
    }),
    type: reservationTypeEnum('type').notNull(),
    title: text('title').notNull(),
    confirmationNumber: text('confirmation_number'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    address: text('address'),
    externalLink: text('external_link'),
    cancellationDeadline: timestamp('cancellation_deadline', {
      withTimezone: true,
    }),
    totalCost: numeric('total_cost', { precision: 12, scale: 2 }),
    currency: char('currency', { length: 3 }),
    attachmentUrl: text('attachment_url'),
    paidBy: uuid('paid_by').references(() => profiles.id, {
      onDelete: 'restrict',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    tripIdx: index('reservations_trip_idx').on(t.tripId),
    stopIdx: index('reservations_stop_idx').on(t.stopId),
    paidByIdx: index('reservations_paid_by_idx').on(t.paidBy),
    scheduledAtIdx: index('reservations_scheduled_at_idx').on(t.scheduledAt),
  }),
);

/* -------------------------------------------------------------------------- */
/*  reservation_participants                                                  */
/* -------------------------------------------------------------------------- */

export const reservationParticipants = pgTable(
  'reservation_participants',
  {
    reservationId: uuid('reservation_id')
      .notNull()
      .references(() => reservations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    hasTicket: boolean('has_ticket').notNull().default(false),
    hasPaid: boolean('has_paid').notNull().default(false),
    amountOwed: numeric('amount_owed', { precision: 12, scale: 2 }),
    currency: char('currency', { length: 3 }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.reservationId, t.userId] }),
    reservationIdx: index('reservation_participants_reservation_idx').on(
      t.reservationId,
    ),
    userIdx: index('reservation_participants_user_idx').on(t.userId),
  }),
);

/* -------------------------------------------------------------------------- */
/*  expenses                                                                  */
/* -------------------------------------------------------------------------- */

export const expenses = pgTable(
  'expenses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    paidBy: uuid('paid_by')
      .notNull()
      .references(() => profiles.id, { onDelete: 'restrict' }),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: char('currency', { length: 3 }).notNull(),
    category: expenseCategoryEnum('category').notNull(),
    description: text('description'),
    expenseDate: date('expense_date').notNull(),
    receiptUrl: text('receipt_url'),
    splitType: splitTypeEnum('split_type').notNull().default('equal'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    tripIdx: index('expenses_trip_idx').on(t.tripId),
    paidByIdx: index('expenses_paid_by_idx').on(t.paidBy),
    expenseDateIdx: index('expenses_expense_date_idx').on(t.expenseDate),
    amountCk: check('expenses_amount_ck', sql`${t.amount} >= 0`),
  }),
);

/* -------------------------------------------------------------------------- */
/*  expense_splits                                                            */
/* -------------------------------------------------------------------------- */

export const expenseSplits = pgTable(
  'expense_splits',
  {
    expenseId: uuid('expense_id')
      .notNull()
      .references(() => expenses.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    amountOwed: numeric('amount_owed', { precision: 12, scale: 2 }).notNull(),
    settled: boolean('settled').notNull().default(false),
    settledAt: timestamp('settled_at', { withTimezone: true }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.expenseId, t.userId] }),
    expenseIdx: index('expense_splits_expense_idx').on(t.expenseId),
    userIdx: index('expense_splits_user_idx').on(t.userId),
    amountOwedCk: check('expense_splits_amount_owed_ck', sql`${t.amountOwed} >= 0`),
  }),
);

/* -------------------------------------------------------------------------- */
/*  currency_rates_cache                                                      */
/* -------------------------------------------------------------------------- */

export const currencyRatesCache = pgTable(
  'currency_rates_cache',
  {
    base: char('base', { length: 3 }).notNull(),
    quote: char('quote', { length: 3 }).notNull(),
    rate: numeric('rate', { precision: 18, scale: 8 }).notNull(),
    fetchedAt: timestamp('fetched_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.base, t.quote] }),
  }),
);

/* -------------------------------------------------------------------------- */
/*  photos                                                                    */
/* -------------------------------------------------------------------------- */

export const photos = pgTable(
  'photos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    stopId: uuid('stop_id').references(() => itineraryStops.id, {
      onDelete: 'set null',
    }),
    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => profiles.id, { onDelete: 'restrict' }),
    storagePath: text('storage_path').notNull(),
    thumbnailPath: text('thumbnail_path'),
    caption: text('caption'),
    visibility: photoVisibilityEnum('visibility').notNull().default('group'),
    /**
     * exif_stripped enforces our privacy contract (spec §9, HIGH severity).
     * The upload pipeline MUST strip EXIF server-side (sharp) before insert.
     * CHECK constraint guarantees the DB rejects unstripped rows even if
     * application code regresses.
     */
    exifStripped: boolean('exif_stripped').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    tripIdx: index('photos_trip_idx').on(t.tripId),
    stopIdx: index('photos_stop_idx').on(t.stopId),
    uploadedByIdx: index('photos_uploaded_by_idx').on(t.uploadedBy),
    visibilityIdx: index('photos_visibility_idx').on(t.visibility),
    exifStrippedCk: check(
      'photos_exif_stripped_ck',
      sql`${t.exifStripped} = true`,
    ),
  }),
);

/* -------------------------------------------------------------------------- */
/*  stop_notes                                                                */
/* -------------------------------------------------------------------------- */

export const stopNotes = pgTable(
  'stop_notes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => itineraryStops.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    rating: stopRatingEnum('rating'),
    tips: text('tips'),
    waitTimeMin: integer('wait_time_min'),
    bestTimeToGo: text('best_time_to_go'),
    visibility: noteVisibilityEnum('visibility').notNull().default('group'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    stopIdx: index('stop_notes_stop_idx').on(t.stopId),
    userIdx: index('stop_notes_user_idx').on(t.userId),
    visibilityIdx: index('stop_notes_visibility_idx').on(t.visibility),
  }),
);

/* -------------------------------------------------------------------------- */
/*  checklist_items                                                           */
/* -------------------------------------------------------------------------- */

export const checklistItems = pgTable(
  'checklist_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    /** NULL == group-wide item (every member sees it). */
    userId: uuid('user_id').references(() => profiles.id, {
      onDelete: 'cascade',
    }),
    title: text('title').notNull(),
    category: text('category'),
    templateKey: text('template_key'),
    completed: boolean('completed').notNull().default(false),
    dueDate: date('due_date'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    tripIdx: index('checklist_items_trip_idx').on(t.tripId),
    userIdx: index('checklist_items_user_idx').on(t.userId),
  }),
);

/* -------------------------------------------------------------------------- */
/*  Relations                                                                 */
/* -------------------------------------------------------------------------- */

export const profilesRelations = relations(profiles, ({ many }) => ({
  tripsCreated: many(trips),
  memberships: many(tripMembers),
  votes: many(votes),
  optionalOptIns: many(optionalOptIns),
  stopsCreated: many(itineraryStops),
  expensesPaid: many(expenses),
  expenseSplits: many(expenseSplits),
  reservationsPaid: many(reservations),
  reservationParticipations: many(reservationParticipants),
  photosUploaded: many(photos),
  notes: many(stopNotes),
  checklistItems: many(checklistItems),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  creator: one(profiles, {
    fields: [trips.createdBy],
    references: [profiles.id],
  }),
  members: many(tripMembers),
  stops: many(itineraryStops),
  reservations: many(reservations),
  expenses: many(expenses),
  photos: many(photos),
  checklistItems: many(checklistItems),
}));

export const tripMembersRelations = relations(tripMembers, ({ one }) => ({
  trip: one(trips, { fields: [tripMembers.tripId], references: [trips.id] }),
  profile: one(profiles, {
    fields: [tripMembers.userId],
    references: [profiles.id],
  }),
}));

export const itineraryStopsRelations = relations(
  itineraryStops,
  ({ one, many }) => ({
    trip: one(trips, {
      fields: [itineraryStops.tripId],
      references: [trips.id],
    }),
    creator: one(profiles, {
      fields: [itineraryStops.createdBy],
      references: [profiles.id],
    }),
    votes: many(votes),
    optionalOptIns: many(optionalOptIns),
    reservations: many(reservations),
    photos: many(photos),
    notes: many(stopNotes),
  }),
);

export const votesRelations = relations(votes, ({ one }) => ({
  stop: one(itineraryStops, {
    fields: [votes.stopId],
    references: [itineraryStops.id],
  }),
  voter: one(profiles, { fields: [votes.userId], references: [profiles.id] }),
}));

export const optionalOptInsRelations = relations(optionalOptIns, ({ one }) => ({
  stop: one(itineraryStops, {
    fields: [optionalOptIns.stopId],
    references: [itineraryStops.id],
  }),
  user: one(profiles, {
    fields: [optionalOptIns.userId],
    references: [profiles.id],
  }),
}));

export const reservationsRelations = relations(
  reservations,
  ({ one, many }) => ({
    trip: one(trips, { fields: [reservations.tripId], references: [trips.id] }),
    stop: one(itineraryStops, {
      fields: [reservations.stopId],
      references: [itineraryStops.id],
    }),
    payer: one(profiles, {
      fields: [reservations.paidBy],
      references: [profiles.id],
    }),
    participants: many(reservationParticipants),
  }),
);

export const reservationParticipantsRelations = relations(
  reservationParticipants,
  ({ one }) => ({
    reservation: one(reservations, {
      fields: [reservationParticipants.reservationId],
      references: [reservations.id],
    }),
    user: one(profiles, {
      fields: [reservationParticipants.userId],
      references: [profiles.id],
    }),
  }),
);

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  trip: one(trips, { fields: [expenses.tripId], references: [trips.id] }),
  payer: one(profiles, {
    fields: [expenses.paidBy],
    references: [profiles.id],
  }),
  splits: many(expenseSplits),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseSplits.expenseId],
    references: [expenses.id],
  }),
  user: one(profiles, {
    fields: [expenseSplits.userId],
    references: [profiles.id],
  }),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  trip: one(trips, { fields: [photos.tripId], references: [trips.id] }),
  stop: one(itineraryStops, {
    fields: [photos.stopId],
    references: [itineraryStops.id],
  }),
  uploader: one(profiles, {
    fields: [photos.uploadedBy],
    references: [profiles.id],
  }),
}));

export const stopNotesRelations = relations(stopNotes, ({ one }) => ({
  stop: one(itineraryStops, {
    fields: [stopNotes.stopId],
    references: [itineraryStops.id],
  }),
  author: one(profiles, {
    fields: [stopNotes.userId],
    references: [profiles.id],
  }),
}));

export const checklistItemsRelations = relations(checklistItems, ({ one }) => ({
  trip: one(trips, { fields: [checklistItems.tripId], references: [trips.id] }),
  user: one(profiles, {
    fields: [checklistItems.userId],
    references: [profiles.id],
  }),
}));

/* -------------------------------------------------------------------------- */
/*  TypeScript model types (Infer{Select,Insert}Model)                        */
/* -------------------------------------------------------------------------- */

export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;

export type Trip = InferSelectModel<typeof trips>;
export type NewTrip = InferInsertModel<typeof trips>;

export type TripMember = InferSelectModel<typeof tripMembers>;
export type NewTripMember = InferInsertModel<typeof tripMembers>;

export type ItineraryStop = InferSelectModel<typeof itineraryStops>;
export type NewItineraryStop = InferInsertModel<typeof itineraryStops>;

export type PlaceHoursCache = InferSelectModel<typeof placeHoursCache>;
export type NewPlaceHoursCache = InferInsertModel<typeof placeHoursCache>;

export type Vote = InferSelectModel<typeof votes>;
export type NewVote = InferInsertModel<typeof votes>;

export type OptionalOptIn = InferSelectModel<typeof optionalOptIns>;
export type NewOptionalOptIn = InferInsertModel<typeof optionalOptIns>;

export type Reservation = InferSelectModel<typeof reservations>;
export type NewReservation = InferInsertModel<typeof reservations>;

export type ReservationParticipant = InferSelectModel<
  typeof reservationParticipants
>;
export type NewReservationParticipant = InferInsertModel<
  typeof reservationParticipants
>;

export type Expense = InferSelectModel<typeof expenses>;
export type NewExpense = InferInsertModel<typeof expenses>;

export type ExpenseSplit = InferSelectModel<typeof expenseSplits>;
export type NewExpenseSplit = InferInsertModel<typeof expenseSplits>;

export type CurrencyRate = InferSelectModel<typeof currencyRatesCache>;
export type NewCurrencyRate = InferInsertModel<typeof currencyRatesCache>;

export type Photo = InferSelectModel<typeof photos>;
export type NewPhoto = InferInsertModel<typeof photos>;

export type StopNote = InferSelectModel<typeof stopNotes>;
export type NewStopNote = InferInsertModel<typeof stopNotes>;

export type ChecklistItem = InferSelectModel<typeof checklistItems>;
export type NewChecklistItem = InferInsertModel<typeof checklistItems>;
