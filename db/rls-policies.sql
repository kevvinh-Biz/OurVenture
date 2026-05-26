-- =============================================================================
--  OurVenture — Row-Level Security Policies (Supabase Postgres)
-- =============================================================================
--  Apply via Supabase SQL editor AFTER `drizzle-kit push` has created tables.
--  Re-runnable: every DROP POLICY IF EXISTS / CREATE POLICY pair is idempotent.
--
--  Identity model:
--    - `auth.uid()` returns the calling user's auth.users.id (== profiles.id).
--    - We treat `profiles.id` as the canonical user identifier everywhere.
--
--  Membership predicate:
--    - `is_trip_member(trip_id)`   — TRUE iff caller is an ACTIVE member.
--    - `is_trip_organizer(trip_id)` — TRUE iff caller is ACTIVE + role=organizer.
--    Both are SECURITY DEFINER so they bypass RLS on `trip_members` itself
--    (otherwise the policies on `trip_members` would recurse into themselves).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. FK to auth.users (Drizzle can't emit this — apply once, by hand)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_auth_users_fk'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_id_auth_users_fk
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END$$;

-- -----------------------------------------------------------------------------
-- 1. Membership helper functions
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_trip_member(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trip_members tm
    WHERE tm.trip_id = p_trip_id
      AND tm.user_id = auth.uid()
      AND tm.status  = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_trip_organizer(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trip_members tm
    WHERE tm.trip_id = p_trip_id
      AND tm.user_id = auth.uid()
      AND tm.status  = 'active'
      AND tm.role    = 'organizer'
  );
$$;

REVOKE ALL ON FUNCTION public.is_trip_member(uuid)    FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_trip_organizer(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_trip_member(uuid)    TO authenticated;
GRANT  EXECUTE ON FUNCTION public.is_trip_organizer(uuid) TO authenticated;

-- =============================================================================
-- 2. profiles
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT TO authenticated
  USING (
    -- Self
    id = auth.uid()
    -- Or another profile that shares ANY active trip with caller
    OR EXISTS (
      SELECT 1
      FROM public.trip_members me
      JOIN public.trip_members them
        ON them.trip_id = me.trip_id
      WHERE me.user_id   = auth.uid()
        AND me.status    = 'active'
        AND them.user_id = profiles.id
        AND them.status  = 'active'
    )
  );

DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update ON public.profiles
  FOR UPDATE TO authenticated
  USING      (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_delete ON public.profiles;
CREATE POLICY profiles_delete ON public.profiles
  FOR DELETE TO authenticated
  USING (id = auth.uid());

-- =============================================================================
-- 3. trips
-- =============================================================================
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trips_select ON public.trips;
CREATE POLICY trips_select ON public.trips
  FOR SELECT TO authenticated
  USING (public.is_trip_member(id) OR created_by = auth.uid());

DROP POLICY IF EXISTS trips_insert ON public.trips;
CREATE POLICY trips_insert ON public.trips
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS trips_update ON public.trips;
-- Organizer-only mutations (incl. vote_threshold, settings, dates, etc.)
CREATE POLICY trips_update ON public.trips
  FOR UPDATE TO authenticated
  USING      (public.is_trip_organizer(id))
  WITH CHECK (public.is_trip_organizer(id));

DROP POLICY IF EXISTS trips_delete ON public.trips;
CREATE POLICY trips_delete ON public.trips
  FOR DELETE TO authenticated
  USING (public.is_trip_organizer(id));

-- =============================================================================
-- 4. trip_members
-- =============================================================================
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trip_members_select ON public.trip_members;
CREATE POLICY trip_members_select ON public.trip_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_trip_member(trip_id)
  );

DROP POLICY IF EXISTS trip_members_insert ON public.trip_members;
-- Two paths:
--   (a) An organizer adds a member to their trip, OR
--   (b) The caller adds themselves (e.g. accepting an invite link).
CREATE POLICY trip_members_insert ON public.trip_members
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_trip_organizer(trip_id)
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS trip_members_update ON public.trip_members;
-- Organizer can change role/status of anyone.
-- Member can update their OWN status (e.g. accept invite -> active, leave).
-- Members can NEVER change their own role.
CREATE POLICY trip_members_update ON public.trip_members
  FOR UPDATE TO authenticated
  USING (
    public.is_trip_organizer(trip_id)
    OR user_id = auth.uid()
  )
  WITH CHECK (
    public.is_trip_organizer(trip_id)
    OR (
      user_id = auth.uid()
      AND role = (SELECT tm.role FROM public.trip_members tm WHERE tm.id = trip_members.id)
    )
  );

DROP POLICY IF EXISTS trip_members_delete ON public.trip_members;
CREATE POLICY trip_members_delete ON public.trip_members
  FOR DELETE TO authenticated
  USING (
    public.is_trip_organizer(trip_id)
    OR user_id = auth.uid()
  );

-- =============================================================================
-- 5. itinerary_stops
-- =============================================================================
ALTER TABLE public.itinerary_stops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS itinerary_stops_select ON public.itinerary_stops;
CREATE POLICY itinerary_stops_select ON public.itinerary_stops
  FOR SELECT TO authenticated
  USING (public.is_trip_member(trip_id));

DROP POLICY IF EXISTS itinerary_stops_insert ON public.itinerary_stops;
CREATE POLICY itinerary_stops_insert ON public.itinerary_stops
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_trip_member(trip_id)
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS itinerary_stops_update ON public.itinerary_stops;
-- Any active member can edit any stop (collaborative spec). Organizers can too.
CREATE POLICY itinerary_stops_update ON public.itinerary_stops
  FOR UPDATE TO authenticated
  USING      (public.is_trip_member(trip_id))
  WITH CHECK (public.is_trip_member(trip_id));

DROP POLICY IF EXISTS itinerary_stops_delete ON public.itinerary_stops;
-- Creator or organizer can delete.
CREATE POLICY itinerary_stops_delete ON public.itinerary_stops
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_trip_organizer(trip_id)
  );

-- =============================================================================
-- 6. place_hours_cache  (global cache; safe to read for any logged-in user)
-- =============================================================================
ALTER TABLE public.place_hours_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS place_hours_cache_select ON public.place_hours_cache;
CREATE POLICY place_hours_cache_select ON public.place_hours_cache
  FOR SELECT TO authenticated USING (true);

-- Writes restricted to service role only (cron / server route uses service key).
DROP POLICY IF EXISTS place_hours_cache_insert ON public.place_hours_cache;
CREATE POLICY place_hours_cache_insert ON public.place_hours_cache
  FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS place_hours_cache_update ON public.place_hours_cache;
CREATE POLICY place_hours_cache_update ON public.place_hours_cache
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS place_hours_cache_delete ON public.place_hours_cache;
CREATE POLICY place_hours_cache_delete ON public.place_hours_cache
  FOR DELETE TO authenticated USING (false);

-- =============================================================================
-- 7. votes
-- =============================================================================
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS votes_select ON public.votes;
CREATE POLICY votes_select ON public.votes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.itinerary_stops s
      WHERE s.id = votes.stop_id
        AND public.is_trip_member(s.trip_id)
    )
  );

DROP POLICY IF EXISTS votes_insert ON public.votes;
CREATE POLICY votes_insert ON public.votes
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.itinerary_stops s
      WHERE s.id = votes.stop_id
        AND public.is_trip_member(s.trip_id)
    )
  );

DROP POLICY IF EXISTS votes_update ON public.votes;
CREATE POLICY votes_update ON public.votes
  FOR UPDATE TO authenticated
  USING      (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS votes_delete ON public.votes;
CREATE POLICY votes_delete ON public.votes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- =============================================================================
-- 8. optional_opt_ins
-- =============================================================================
ALTER TABLE public.optional_opt_ins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS optional_opt_ins_select ON public.optional_opt_ins;
CREATE POLICY optional_opt_ins_select ON public.optional_opt_ins
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.itinerary_stops s
      WHERE s.id = optional_opt_ins.stop_id
        AND public.is_trip_member(s.trip_id)
    )
  );

DROP POLICY IF EXISTS optional_opt_ins_insert ON public.optional_opt_ins;
CREATE POLICY optional_opt_ins_insert ON public.optional_opt_ins
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.itinerary_stops s
      WHERE s.id = optional_opt_ins.stop_id
        AND public.is_trip_member(s.trip_id)
    )
  );

DROP POLICY IF EXISTS optional_opt_ins_delete ON public.optional_opt_ins;
CREATE POLICY optional_opt_ins_delete ON public.optional_opt_ins
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- (No update policy — toggling an opt-in is delete+insert.)

-- =============================================================================
-- 9. reservations
-- =============================================================================
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reservations_select ON public.reservations;
CREATE POLICY reservations_select ON public.reservations
  FOR SELECT TO authenticated
  USING (public.is_trip_member(trip_id));

DROP POLICY IF EXISTS reservations_insert ON public.reservations;
CREATE POLICY reservations_insert ON public.reservations
  FOR INSERT TO authenticated
  WITH CHECK (public.is_trip_member(trip_id));

DROP POLICY IF EXISTS reservations_update ON public.reservations;
CREATE POLICY reservations_update ON public.reservations
  FOR UPDATE TO authenticated
  USING      (public.is_trip_member(trip_id))
  WITH CHECK (public.is_trip_member(trip_id));

DROP POLICY IF EXISTS reservations_delete ON public.reservations;
CREATE POLICY reservations_delete ON public.reservations
  FOR DELETE TO authenticated
  USING (
    paid_by = auth.uid()
    OR public.is_trip_organizer(trip_id)
  );

-- =============================================================================
-- 10. reservation_participants
-- =============================================================================
ALTER TABLE public.reservation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reservation_participants_select ON public.reservation_participants;
CREATE POLICY reservation_participants_select ON public.reservation_participants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.id = reservation_participants.reservation_id
        AND public.is_trip_member(r.trip_id)
    )
  );

DROP POLICY IF EXISTS reservation_participants_insert ON public.reservation_participants;
CREATE POLICY reservation_participants_insert ON public.reservation_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.id = reservation_participants.reservation_id
        AND public.is_trip_member(r.trip_id)
    )
  );

DROP POLICY IF EXISTS reservation_participants_update ON public.reservation_participants;
-- Self can toggle has_ticket / has_paid for their own row.
-- Organizers or the reservation payer can update anyone's row.
CREATE POLICY reservation_participants_update ON public.reservation_participants
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.id = reservation_participants.reservation_id
        AND (r.paid_by = auth.uid() OR public.is_trip_organizer(r.trip_id))
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.id = reservation_participants.reservation_id
        AND (r.paid_by = auth.uid() OR public.is_trip_organizer(r.trip_id))
    )
  );

DROP POLICY IF EXISTS reservation_participants_delete ON public.reservation_participants;
CREATE POLICY reservation_participants_delete ON public.reservation_participants
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.id = reservation_participants.reservation_id
        AND (r.paid_by = auth.uid() OR public.is_trip_organizer(r.trip_id))
    )
  );

-- =============================================================================
-- 11. expenses
-- =============================================================================
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS expenses_select ON public.expenses;
CREATE POLICY expenses_select ON public.expenses
  FOR SELECT TO authenticated
  USING (public.is_trip_member(trip_id));

DROP POLICY IF EXISTS expenses_insert ON public.expenses;
CREATE POLICY expenses_insert ON public.expenses
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_trip_member(trip_id)
    AND paid_by = auth.uid()
  );

DROP POLICY IF EXISTS expenses_update ON public.expenses;
-- Only the payer or organizer can edit core expense fields.
CREATE POLICY expenses_update ON public.expenses
  FOR UPDATE TO authenticated
  USING (
    paid_by = auth.uid()
    OR public.is_trip_organizer(trip_id)
  )
  WITH CHECK (
    paid_by = auth.uid()
    OR public.is_trip_organizer(trip_id)
  );

DROP POLICY IF EXISTS expenses_delete ON public.expenses;
CREATE POLICY expenses_delete ON public.expenses
  FOR DELETE TO authenticated
  USING (
    paid_by = auth.uid()
    OR public.is_trip_organizer(trip_id)
  );

-- =============================================================================
-- 12. expense_splits
-- =============================================================================
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS expense_splits_select ON public.expense_splits;
CREATE POLICY expense_splits_select ON public.expense_splits
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_splits.expense_id
        AND public.is_trip_member(e.trip_id)
    )
  );

DROP POLICY IF EXISTS expense_splits_insert ON public.expense_splits;
-- Splits are created alongside the expense by the payer or organizer.
CREATE POLICY expense_splits_insert ON public.expense_splits
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_splits.expense_id
        AND (e.paid_by = auth.uid() OR public.is_trip_organizer(e.trip_id))
    )
  );

DROP POLICY IF EXISTS expense_splits_update ON public.expense_splits;
-- The split owner may ONLY flip `settled` (+ settled_at). Amount changes are
-- gated to payer/organizer. We allow both classes; column-level enforcement
-- of "owner can only change settled" should be enforced in the Server Action.
CREATE POLICY expense_splits_update ON public.expense_splits
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_splits.expense_id
        AND (e.paid_by = auth.uid() OR public.is_trip_organizer(e.trip_id))
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_splits.expense_id
        AND (e.paid_by = auth.uid() OR public.is_trip_organizer(e.trip_id))
    )
  );

DROP POLICY IF EXISTS expense_splits_delete ON public.expense_splits;
CREATE POLICY expense_splits_delete ON public.expense_splits
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_splits.expense_id
        AND (e.paid_by = auth.uid() OR public.is_trip_organizer(e.trip_id))
    )
  );

-- =============================================================================
-- 13. currency_rates_cache  (global; service-role writes only)
-- =============================================================================
ALTER TABLE public.currency_rates_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS currency_rates_cache_select ON public.currency_rates_cache;
CREATE POLICY currency_rates_cache_select ON public.currency_rates_cache
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS currency_rates_cache_insert ON public.currency_rates_cache;
CREATE POLICY currency_rates_cache_insert ON public.currency_rates_cache
  FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS currency_rates_cache_update ON public.currency_rates_cache;
CREATE POLICY currency_rates_cache_update ON public.currency_rates_cache
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS currency_rates_cache_delete ON public.currency_rates_cache;
CREATE POLICY currency_rates_cache_delete ON public.currency_rates_cache
  FOR DELETE TO authenticated USING (false);

-- =============================================================================
-- 14. photos  (spec §9 visibility rules)
-- =============================================================================
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS photos_select ON public.photos;
-- Visibility ladder:
--   private  — only the uploader
--   group    — any active trip member
--   shared   — any active trip member (P2 will expand to "trusted copiers")
--   public   — any authenticated user (note: anonymous public requires anon role policy)
CREATE POLICY photos_select ON public.photos
  FOR SELECT TO authenticated
  USING (
    (visibility = 'private' AND uploaded_by = auth.uid())
    OR (visibility IN ('group','shared') AND public.is_trip_member(trip_id))
    OR  visibility = 'public'
  );

-- Optional: read access for anonymous users when visibility = 'public'.
-- Disabled by default — public itinerary pages are explicitly DEFERRED (spec §14).
-- Uncomment ONLY when P2 public sharing ships.
-- DROP POLICY IF EXISTS photos_select_anon ON public.photos;
-- CREATE POLICY photos_select_anon ON public.photos
--   FOR SELECT TO anon USING (visibility = 'public');

DROP POLICY IF EXISTS photos_insert ON public.photos;
CREATE POLICY photos_insert ON public.photos
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_trip_member(trip_id)
    AND uploaded_by = auth.uid()
    -- CHECK constraint on exif_stripped enforces the privacy contract.
  );

DROP POLICY IF EXISTS photos_update ON public.photos;
-- Uploader can edit caption/visibility. Organizer can also moderate.
CREATE POLICY photos_update ON public.photos
  FOR UPDATE TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR public.is_trip_organizer(trip_id)
  )
  WITH CHECK (
    uploaded_by = auth.uid()
    OR public.is_trip_organizer(trip_id)
  );

DROP POLICY IF EXISTS photos_delete ON public.photos;
CREATE POLICY photos_delete ON public.photos
  FOR DELETE TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR public.is_trip_organizer(trip_id)
  );

-- =============================================================================
-- 15. stop_notes
-- =============================================================================
ALTER TABLE public.stop_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stop_notes_select ON public.stop_notes;
CREATE POLICY stop_notes_select ON public.stop_notes
  FOR SELECT TO authenticated
  USING (
    (visibility = 'private' AND user_id = auth.uid())
    OR (
      visibility IN ('group','shared')
      AND EXISTS (
        SELECT 1 FROM public.itinerary_stops s
        WHERE s.id = stop_notes.stop_id
          AND public.is_trip_member(s.trip_id)
      )
    )
    OR visibility = 'public'
  );

DROP POLICY IF EXISTS stop_notes_insert ON public.stop_notes;
CREATE POLICY stop_notes_insert ON public.stop_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.itinerary_stops s
      WHERE s.id = stop_notes.stop_id
        AND public.is_trip_member(s.trip_id)
    )
  );

DROP POLICY IF EXISTS stop_notes_update ON public.stop_notes;
CREATE POLICY stop_notes_update ON public.stop_notes
  FOR UPDATE TO authenticated
  USING      (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS stop_notes_delete ON public.stop_notes;
CREATE POLICY stop_notes_delete ON public.stop_notes
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.itinerary_stops s
      WHERE s.id = stop_notes.stop_id
        AND public.is_trip_organizer(s.trip_id)
    )
  );

-- =============================================================================
-- 16. checklist_items
-- =============================================================================
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS checklist_items_select ON public.checklist_items;
-- Group-wide items (user_id IS NULL) visible to all members.
-- Personal items visible only to owner.
CREATE POLICY checklist_items_select ON public.checklist_items
  FOR SELECT TO authenticated
  USING (
    public.is_trip_member(trip_id)
    AND (user_id IS NULL OR user_id = auth.uid() OR public.is_trip_organizer(trip_id))
  );

DROP POLICY IF EXISTS checklist_items_insert ON public.checklist_items;
CREATE POLICY checklist_items_insert ON public.checklist_items
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_trip_member(trip_id)
    AND (
      user_id = auth.uid()
      OR (user_id IS NULL AND public.is_trip_organizer(trip_id))
    )
  );

DROP POLICY IF EXISTS checklist_items_update ON public.checklist_items;
CREATE POLICY checklist_items_update ON public.checklist_items
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND public.is_trip_organizer(trip_id))
  )
  WITH CHECK (
    user_id = auth.uid()
    OR (user_id IS NULL AND public.is_trip_organizer(trip_id))
  );

DROP POLICY IF EXISTS checklist_items_delete ON public.checklist_items;
CREATE POLICY checklist_items_delete ON public.checklist_items
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND public.is_trip_organizer(trip_id))
  );

-- =============================================================================
-- 17. Default grants (authenticated role needs base table privileges; RLS
--     does the actual gating). Supabase grants these by default but we
--     restate them so the file is self-contained on fresh projects.
-- =============================================================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- END OF RLS POLICIES
