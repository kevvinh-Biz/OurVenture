# OurVenture — API Contract (MVP)

Source: MVP-SPEC.md §3 (locked scope), §6 (user flows), §7 (data model).
Stack: Next.js 15 App Router, Server Actions (`"use server"`), API routes
(`app/api/**/route.ts`), Supabase Postgres + RLS, Supabase Auth, Supabase
Storage, Drizzle ORM.

## Conventions

- **Server Action (SA)** — typed function invoked from React components.
  Default for any mutation or member-only read used by a server component.
- **API Route (API)** — used when an external system or webhook calls us,
  when a non-JSON response is needed (PDF download, file stream), or for
  third-party callbacks (OAuth, webhooks).
- **Auth** — Supabase Auth session cookie; resolved via
  `createServerClient()` from `@supabase/ssr`. All policies below assume
  `auth.uid()` is non-null unless marked `anon`.
- **RLS** — every database call goes through PostgREST or Drizzle using the
  user's JWT. The RLS predicate is shown per endpoint (matching
  `db/rls-policies.sql`).
- **Validation** — Zod schemas at the action boundary (`actionSchema.parse(input)`).
  Schemas shown below are pseudocode; real definitions live next to each action.
- **Realtime** — endpoints flagged `[realtime]` publish via Supabase
  Realtime channels (`channel:trip:{tripId}`). Clients subscribe in the
  matching screen.
- **Errors** — Server Actions return `{ ok: true, data } | { ok: false, code, message }`.
  Standard error codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`,
  `VALIDATION`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL`.

---

## 1. Auth

Most auth lives in Supabase Auth + the Next.js `@supabase/ssr` helpers. We
expose two endpoints on top.

### `POST /api/auth/callback` — OAuth + email confirm callback
- **Type:** API route
- **Purpose:** Exchanges `?code` query param for a session cookie (Google
  OAuth, magic link, email confirmation).
- **Input:** `?code: string`, `?next?: string`
- **Output:** 302 redirect to `next || /trips`
- **Auth:** Public
- **RLS:** N/A — runs with service role on server
- **Errors:** redirect to `/login?error=...` on invalid code

### `bootstrapProfile()` — Server Action
- **Type:** SA (runs on first sign-in)
- **Purpose:** Idempotently create `profiles` row for the new `auth.users.id`.
  Should also be wired as a Supabase Auth trigger (`handle_new_user`) as a
  backstop.
- **Input:** `{ displayName: string(min:1, max:80), homeCurrency?: 'USD'|... }`
- **Output:** `Profile`
- **Auth:** authenticated
- **RLS:** `profiles_insert` (id = auth.uid())
- **Errors:** `CONFLICT` if profile already exists (returns existing).

### `updateProfile(input)` — Server Action
- **Input:** `{ displayName?, avatarUrl?, homeCurrency? }`
- **Output:** `Profile`
- **Auth:** authenticated
- **RLS:** `profiles_update`
- **Errors:** `VALIDATION` on bad currency code.

### `deleteAccount()` — Server Action
- **Purpose:** GDPR/CCPA hard-delete (spec §9). Triggers
  `auth.users` cascade → `profiles` cascade → all trip data the user owned.
  For trips where the user is a member (not creator), only their `trip_members`
  row + their personal data is removed.
- **Input:** `{ confirmEmail: string }`
- **Output:** `{ ok: true }` then forced sign-out.
- **Auth:** authenticated
- **Errors:** `FORBIDDEN` on email mismatch, `CONFLICT` if user is the sole
  organizer of an active trip (must transfer first).

---

## 2. Trips

### `createTrip(input)` — SA
- **Input:** `{ name, destination, startDate, endDate, defaultCurrency, voteThreshold? }`
- **Output:** `{ trip: Trip, inviteUrl: string }`
- **Auth:** authenticated
- **RLS:** `trips_insert`, then `trip_members_insert` (self as organizer)
- **Side effects:** generates `invite_code` (nanoid 10), inserts caller
  into `trip_members` as `organizer` + `active`.
- **Errors:** `VALIDATION` if `endDate < startDate`.

### `listMyTrips()` — SA
- **Output:** `Array<Trip & { memberCount, role, nextReservationAt? }>`
- **RLS:** `trips_select` (caller is a member or creator).

### `getTrip(tripId)` — SA
- **Output:** `Trip & { members: TripMember[], myRole }`
- **RLS:** `trips_select`.
- **Errors:** `NOT_FOUND` if not a member.

### `updateTripSettings(tripId, input)` — SA
- **Input:** `{ name?, destination?, startDate?, endDate?, voteThreshold?, defaultCurrency?, coverPhotoUrl?, settings? }`
- **Output:** `Trip`
- **RLS:** `trips_update` (organizer-only)
- **Realtime:** publishes `trip.updated` to `channel:trip:{tripId}`.

### `deleteTrip(tripId)` — SA
- **RLS:** `trips_delete` (organizer-only)
- **Cascades:** members, stops, votes, reservations, expenses, photos, notes,
  checklist.

### `regenerateInviteCode(tripId)` — SA
- **Output:** `{ inviteCode, inviteUrl }`
- **RLS:** organizer-only.

---

## 3. Members

### `joinTripByInvite(inviteCode)` — SA
- **Input:** `{ inviteCode: string }`
- **Output:** `{ trip: Trip }`
- **Auth:** authenticated
- **Behavior:** server resolves invite_code → trip_id, then INSERT
  `trip_members(user_id=auth.uid(), role='member', status='active')`.
  Idempotent: re-joining returns existing membership.
- **RLS:** `trip_members_insert` (self-add path)
- **Errors:** `NOT_FOUND` on bad code.

### `listMembers(tripId)` — SA
- **Output:** `Array<TripMember & { profile: Profile }>`
- **RLS:** `trip_members_select`.

### `updateMemberRole(tripId, memberId, role)` — SA
- **Input:** `{ memberId: uuid, role: 'organizer'|'member'|'viewer' }`
- **RLS:** `trip_members_update` (organizer path; the WITH CHECK clause
  forbids self-promoting role changes).
- **Realtime:** `member.updated`.

### `removeMember(tripId, memberId)` — SA
- **RLS:** `trip_members_delete` (organizer or self).
- **Note:** if removing self and caller is the only organizer of an active
  trip with other members, action returns `CONFLICT` and prompts transfer.

### `leaveTrip(tripId)` — SA
- Convenience wrapper around `removeMember(tripId, myMemberId)`.

---

## 4. Itinerary

### `createStop(tripId, input)` — SA
- **Input:** `{ title, description?, googlePlaceId?, lat?, lng?, address?, scheduledAt?, durationMin?, costEstimate?, currency?, isOptional?, sortOrder? }`
- **Output:** `ItineraryStop`
- **RLS:** `itinerary_stops_insert` (active member; created_by = self).
- **Side effects:** if `googlePlaceId` present and not in `place_hours_cache`,
  enqueues background fetch.
- **Realtime:** `stop.created`.

### `updateStop(stopId, input)` — SA
- **RLS:** `itinerary_stops_update`.
- **Realtime:** `stop.updated`.

### `deleteStop(stopId)` — SA
- **RLS:** `itinerary_stops_delete` (creator or organizer).
- **Realtime:** `stop.deleted`.

### `listStops(tripId, dayFilter?)` — SA
- **Output:** `Array<ItineraryStop & { votes: VoteSummary, photoCount, noteCount }>`
- **RLS:** `itinerary_stops_select`.

### `getStop(stopId)` — SA
- **Output:** full stop detail incl. nested votes, opt-ins, photos, notes.

### `recomputeStopStatus(stopId)` — SA  *(internal, called after vote insert)*
- **Behavior:** counts `yes` votes vs `trips.vote_threshold * active_members`,
  flips `status` to `approved` if threshold met. Idempotent.
- **Realtime:** `stop.status_changed`.

### `GET /api/places/search?q=...&near=lat,lng` — API
- **Type:** API route (server-side proxy for Google Places API)
- **Purpose:** Hide our Google API key, normalize the response.
- **Auth:** authenticated (rate-limited per user via upstash or in-memory).
- **Output:** `Array<{ placeId, name, address, lat, lng, photoRef? }>`.
- **Errors:** `RATE_LIMITED` after N req/min.

### `GET /api/places/[placeId]/hours` — API
- **Purpose:** Returns cached hours from `place_hours_cache`. Fetches from
  Google + upserts cache if stale (>7 days).
- **Auth:** authenticated.
- **Output:** `{ hours, closedDays, lastSynced }`.

---

## 5. Votes  `[realtime]`

### `castVote(stopId, vote)` — SA
- **Input:** `{ vote: 'yes'|'no'|'maybe' }`
- **Output:** `{ vote: Vote, newStatus: StopStatus }`
- **RLS:** `votes_insert` / `votes_update` (UPSERT on (stop_id, user_id)).
- **Side effects:** calls `recomputeStopStatus(stopId)`.
- **Realtime:** `vote.cast` + possible `stop.status_changed` on
  `channel:trip:{tripId}`.

### `clearVote(stopId)` — SA
- **RLS:** `votes_delete` (self only).
- **Realtime:** `vote.cleared`.

### `listStopVotes(stopId)` — SA
- **Output:** `Array<Vote & { profile: Pick<Profile, 'id'|'displayName'|'avatarUrl'> }>`
- **RLS:** `votes_select`.

### `toggleOptionalOptIn(stopId)` — SA
- **Behavior:** if row exists → delete, else insert.
- **RLS:** `optional_opt_ins_insert` / `optional_opt_ins_delete`.

---

## 6. Reservations  `[realtime]`

### `createReservation(tripId, input)` — SA
- **Input:** `{ stopId?, type, title, confirmationNumber?, scheduledAt?, address?, externalLink?, cancellationDeadline?, totalCost?, currency?, attachmentUrl?, paidBy?, participants: Array<{ userId, amountOwed?, currency? }> }`
- **Output:** `Reservation & { participants: ReservationParticipant[] }`
- **RLS:** `reservations_insert` + `reservation_participants_insert`.
- **Realtime:** `reservation.created`.

### `updateReservation(reservationId, input)` — SA
- **RLS:** `reservations_update`.
- **Realtime:** `reservation.updated`.

### `deleteReservation(reservationId)` — SA
- **RLS:** `reservations_delete` (payer or organizer).

### `listReservations(tripId)` — SA
- **Output:** sorted by `scheduled_at`, with participant rollup
  (`{ totalCount, ticketCount, paidCount }`).

### `getReservation(reservationId)` — SA
- **Output:** detail + participants + signed attachment URL (1h).

### `setParticipantStatus(reservationId, userId, patch)` — SA  `[realtime]`
- **Input:** `{ hasTicket?, hasPaid?, amountOwed?, currency? }`
- **RLS:** `reservation_participants_update` (self-row OR payer/organizer).
- **Realtime:** `reservation.participant_updated`.

### `GET /api/reservations/[id]/attachment` — API
- **Purpose:** stream attachment via signed URL.
- **Auth:** authenticated + RLS check on parent reservation.
- **Output:** 302 to signed Supabase Storage URL.

---

## 7. Expenses  `[realtime]`

### `createExpense(tripId, input)` — SA
- **Input:** `{ paidBy?, amount, currency, category, description?, expenseDate, receiptUrl?, splitType, splits: Array<{ userId, amountOwed }> }`
- **Behavior:** `paidBy` defaults to caller. Server validates
  `sum(splits.amountOwed) == amount` (within rounding tolerance) and that
  every `userId` is an active trip member.
- **Output:** `Expense & { splits: ExpenseSplit[] }`
- **RLS:** `expenses_insert` (paid_by must equal auth.uid()) +
  `expense_splits_insert`.
- **Realtime:** `expense.created`.

### `updateExpense(expenseId, input)` — SA
- **RLS:** `expenses_update` (payer or organizer). Replaces splits atomically.
- **Realtime:** `expense.updated`.

### `deleteExpense(expenseId)` — SA
- **RLS:** `expenses_delete`. Cascades splits.

### `listExpenses(tripId, filter?)` — SA
- **Output:** array sorted by `expense_date desc`, with split summary.

### `markSplitSettled(expenseId, settled: boolean)` — SA  `[realtime]`
- **Behavior:** UPDATE row where `expense_id=:e AND user_id=auth.uid()`.
  Sets `settled` and `settled_at`.
- **RLS:** `expense_splits_update` (self path).
- **Realtime:** `expense.split_settled`.
- **Errors:** `NOT_FOUND` if caller isn't on that split.

### `getSettlementPlan(tripId)` — SA
- **Purpose:** Run min-cashflow algorithm across all unsettled splits +
  cached FX rates to produce the "who pays whom" list.
- **Output:** `Array<{ fromUserId, toUserId, amount, currency }>`
- **RLS:** must be active member (server filters via
  `is_trip_member(tripId)` before querying).

### `GET /api/fx/rate?base=USD&quote=JPY` — API
- **Purpose:** read-through to `currency_rates_cache`. If stale (>24h),
  hit exchangerate.host and upsert. Service-role write.
- **Auth:** authenticated.

---

## 8. Photos  `[realtime]`

### `POST /api/photos/upload` — API
- **Purpose:** multipart upload endpoint. Server-side EXIF strip via
  `sharp`, thumbnail generation, write original + thumb to Supabase
  Storage, then INSERT `photos` row with `exif_stripped=true`.
  **The CHECK constraint on the table guarantees we never persist a row
  claiming the image is unstripped.**
- **Input (multipart):** `tripId`, `stopId?`, `visibility`, `caption?`,
  `file` (image/jpeg|png|webp, max 15MB).
- **Output:** `Photo`
- **Auth:** authenticated.
- **RLS:** `photos_insert` (active member, uploaded_by = self).
- **Errors:** `VALIDATION` on file type/size, `INTERNAL` on EXIF/sharp
  failure (no DB write happens).

### `listPhotos(tripId, stopId?)` — SA  `[realtime]`
- **Output:** `Array<Photo & { signedUrl, thumbnailSignedUrl, uploader }>`
- **RLS:** `photos_select` (visibility ladder).
- **Realtime:** subscribe to `photo.created` / `photo.deleted` for live
  album updates.

### `updatePhoto(photoId, input)` — SA
- **Input:** `{ caption?, visibility?, stopId? }`
- **RLS:** `photos_update` (uploader or organizer).

### `deletePhoto(photoId)` — SA
- **Behavior:** delete row → Storage object cleanup via DB trigger or
  follow-up call to Supabase Storage API.
- **RLS:** `photos_delete`.

---

## 9. Notes

### `createStopNote(stopId, input)` — SA
- **Input:** `{ content, rating?, tips?, waitTimeMin?, bestTimeToGo?, visibility }`
- **Output:** `StopNote`
- **RLS:** `stop_notes_insert` (active member of the stop's trip).

### `updateStopNote(noteId, input)` — SA
- **RLS:** `stop_notes_update` (author only).

### `deleteStopNote(noteId)` — SA
- **RLS:** `stop_notes_delete` (author or organizer).

### `listStopNotes(stopId)` — SA
- **Output:** `Array<StopNote & { author: PublicProfile }>`
- **RLS:** `stop_notes_select` (visibility ladder).

---

## 10. Checklist

### `listMyChecklist(tripId)` — SA
- **Output:** caller's personal items + all group-wide items.
- **RLS:** `checklist_items_select`.

### `getReadinessRollup(tripId)` — SA (organizer-only)
- **Output:** `Array<{ userId, displayName, total, completed, percent }>`
- **Auth:** server checks `is_trip_organizer(tripId)` before query.
- **RLS:** `checklist_items_select` (organizer branch).

### `createChecklistItem(tripId, input)` — SA
- **Input:** `{ title, category?, templateKey?, dueDate?, scope: 'me'|'group' }`
- **Behavior:** scope='me' → `user_id=auth.uid()`; scope='group' →
  `user_id=null` (organizer-only via RLS).
- **RLS:** `checklist_items_insert`.

### `applyChecklistTemplate(tripId, templateKey)` — SA
- **Behavior:** bulk-inserts personal items from a server-defined template
  (passport, eSIM, etc.). Idempotent on `(tripId, user_id, template_key)`.

### `toggleChecklistItem(itemId, completed)` — SA
- **RLS:** `checklist_items_update` (owner or organizer for group items).

### `deleteChecklistItem(itemId)` — SA
- **RLS:** `checklist_items_delete`.

---

## 11. Export

### `GET /api/trips/[tripId]/recap.pdf` — API
- **Purpose:** Generate recap PDF (cover, route map image, day-by-day,
  cost summary, traveler list). Built with `react-pdf` or Puppeteer.
- **Query params:** `?includePhotos=1&includeCosts=1&coverPhotoId=...`
- **Auth:** authenticated.
- **RLS:** server resolves caller membership via
  `is_trip_member(tripId)`; if false → 403.
- **Output:** `Content-Type: application/pdf`, `Content-Disposition:
  attachment; filename="ourventure-<trip-slug>.pdf"`.
- **Notes:** respects per-user "Hide me from exports" toggle stored in
  `trips.settings` (spec §9 photo consent).

### `requestRecapShareLink(tripId)` — SA
- **Output:** `{ url: string, expiresAt: timestamptz }`
- **Behavior:** generates short-lived signed URL pointing at the
  recap.pdf route (token validated server-side via `trips.settings`).

---

## Realtime channel summary

| Channel | Events | Subscribed by |
| --- | --- | --- |
| `trip:{tripId}` | `trip.updated`, `member.*`, `stop.*`, `vote.*` | Trip dashboard, itinerary view |
| `trip:{tripId}:reservations` | `reservation.*` | Trip timeline, reservation list |
| `trip:{tripId}:expenses` | `expense.*` | Expenses screen, settlement view |
| `trip:{tripId}:photos` | `photo.*` | Album screen |

All channels gated by Supabase Realtime RLS — clients only receive events
for trips where `is_trip_member(tripId)` evaluates true.

---

## Rate limits (recommended, enforced in middleware)

| Endpoint | Limit |
| --- | --- |
| `GET /api/places/search` | 30/min per user |
| `GET /api/fx/rate` | 60/min per user |
| `POST /api/photos/upload` | 20/min per user, 200/day per trip |
| `POST /api/auth/callback` | 10/min per IP |
| All Server Actions | 120/min per user (global) |

---

## Open items for later agents

- Storage bucket setup (`photos/`, `reservations/`) with per-bucket RLS
  matching the table policies.
- Supabase Auth trigger `handle_new_user` calling `bootstrapProfile()` as
  a backstop in case the client-side bootstrap is missed.
- Background job (Vercel Cron) for `currency_rates_cache` daily refresh +
  `place_hours_cache` weekly refresh.
- Storage object cleanup trigger on `photos` DELETE.
