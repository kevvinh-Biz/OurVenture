CREATE TYPE "public"."expense_category" AS ENUM('lodging', 'food', 'transit', 'activity', 'misc');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('organizer', 'member', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('invited', 'active', 'left');--> statement-breakpoint
CREATE TYPE "public"."note_visibility" AS ENUM('private', 'group', 'shared', 'public');--> statement-breakpoint
CREATE TYPE "public"."photo_visibility" AS ENUM('private', 'group', 'shared', 'public');--> statement-breakpoint
CREATE TYPE "public"."reservation_type" AS ENUM('hotel', 'restaurant', 'transport', 'tour', 'ticket', 'other');--> statement-breakpoint
CREATE TYPE "public"."split_type" AS ENUM('equal', 'shares', 'custom');--> statement-breakpoint
CREATE TYPE "public"."stop_rating" AS ENUM('must', 'good', 'okay', 'skip');--> statement-breakpoint
CREATE TYPE "public"."stop_status" AS ENUM('proposed', 'approved', 'rejected', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."vote_value" AS ENUM('yes', 'no', 'maybe');--> statement-breakpoint
CREATE TABLE "checklist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"user_id" uuid,
	"title" text NOT NULL,
	"category" text,
	"template_key" text,
	"completed" boolean DEFAULT false NOT NULL,
	"due_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currency_rates_cache" (
	"base" char(3) NOT NULL,
	"quote" char(3) NOT NULL,
	"rate" numeric(18, 8) NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "currency_rates_cache_base_quote_pk" PRIMARY KEY("base","quote")
);
--> statement-breakpoint
CREATE TABLE "expense_splits" (
	"expense_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"amount_owed" numeric(12, 2) NOT NULL,
	"settled" boolean DEFAULT false NOT NULL,
	"settled_at" timestamp with time zone,
	CONSTRAINT "expense_splits_expense_id_user_id_pk" PRIMARY KEY("expense_id","user_id"),
	CONSTRAINT "expense_splits_amount_owed_ck" CHECK ("expense_splits"."amount_owed" >= 0)
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"paid_by" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" char(3) NOT NULL,
	"category" "expense_category" NOT NULL,
	"description" text,
	"expense_date" date NOT NULL,
	"receipt_url" text,
	"split_type" "split_type" DEFAULT 'equal' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "expenses_amount_ck" CHECK ("expenses"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "itinerary_stops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"google_place_id" text,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"address" text,
	"scheduled_at" timestamp with time zone,
	"duration_min" integer,
	"status" "stop_status" DEFAULT 'proposed' NOT NULL,
	"cost_estimate" numeric(12, 2),
	"currency" char(3),
	"is_optional" boolean DEFAULT false NOT NULL,
	"created_by" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "optional_opt_ins" (
	"stop_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"opted_in_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "optional_opt_ins_stop_id_user_id_pk" PRIMARY KEY("stop_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"stop_id" uuid,
	"uploaded_by" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"thumbnail_path" text,
	"caption" text,
	"visibility" "photo_visibility" DEFAULT 'group' NOT NULL,
	"exif_stripped" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "photos_exif_stripped_ck" CHECK ("photos"."exif_stripped" = true)
);
--> statement-breakpoint
CREATE TABLE "place_hours_cache" (
	"google_place_id" text PRIMARY KEY NOT NULL,
	"hours" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"closed_days" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_synced" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"home_currency" char(3) DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservation_participants" (
	"reservation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"has_ticket" boolean DEFAULT false NOT NULL,
	"has_paid" boolean DEFAULT false NOT NULL,
	"amount_owed" numeric(12, 2),
	"currency" char(3),
	CONSTRAINT "reservation_participants_reservation_id_user_id_pk" PRIMARY KEY("reservation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"stop_id" uuid,
	"type" "reservation_type" NOT NULL,
	"title" text NOT NULL,
	"confirmation_number" text,
	"scheduled_at" timestamp with time zone,
	"address" text,
	"external_link" text,
	"cancellation_deadline" timestamp with time zone,
	"total_cost" numeric(12, 2),
	"currency" char(3),
	"attachment_url" text,
	"paid_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stop_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"rating" "stop_rating",
	"tips" text,
	"wait_time_min" integer,
	"best_time_to_go" text,
	"visibility" "note_visibility" DEFAULT 'group' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"status" "member_status" DEFAULT 'invited' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"destination" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"created_by" uuid NOT NULL,
	"vote_threshold" integer DEFAULT 60 NOT NULL,
	"default_currency" char(3) DEFAULT 'USD' NOT NULL,
	"invite_code" text NOT NULL,
	"cover_photo_url" text,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trips_invite_code_unique" UNIQUE("invite_code"),
	CONSTRAINT "trips_vote_threshold_ck" CHECK ("trips"."vote_threshold" >= 1 AND "trips"."vote_threshold" <= 100),
	CONSTRAINT "trips_date_order_ck" CHECK ("trips"."end_date" >= "trips"."start_date")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"vote" "vote_value" NOT NULL,
	"voted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_splits" ADD CONSTRAINT "expense_splits_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_splits" ADD CONSTRAINT "expense_splits_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_paid_by_profiles_id_fk" FOREIGN KEY ("paid_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_stops" ADD CONSTRAINT "itinerary_stops_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_stops" ADD CONSTRAINT "itinerary_stops_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "optional_opt_ins" ADD CONSTRAINT "optional_opt_ins_stop_id_itinerary_stops_id_fk" FOREIGN KEY ("stop_id") REFERENCES "public"."itinerary_stops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "optional_opt_ins" ADD CONSTRAINT "optional_opt_ins_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_stop_id_itinerary_stops_id_fk" FOREIGN KEY ("stop_id") REFERENCES "public"."itinerary_stops"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_uploaded_by_profiles_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_participants" ADD CONSTRAINT "reservation_participants_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_participants" ADD CONSTRAINT "reservation_participants_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_stop_id_itinerary_stops_id_fk" FOREIGN KEY ("stop_id") REFERENCES "public"."itinerary_stops"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_paid_by_profiles_id_fk" FOREIGN KEY ("paid_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stop_notes" ADD CONSTRAINT "stop_notes_stop_id_itinerary_stops_id_fk" FOREIGN KEY ("stop_id") REFERENCES "public"."itinerary_stops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stop_notes" ADD CONSTRAINT "stop_notes_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_members" ADD CONSTRAINT "trip_members_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_members" ADD CONSTRAINT "trip_members_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_stop_id_itinerary_stops_id_fk" FOREIGN KEY ("stop_id") REFERENCES "public"."itinerary_stops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "checklist_items_trip_idx" ON "checklist_items" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "checklist_items_user_idx" ON "checklist_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "expense_splits_expense_idx" ON "expense_splits" USING btree ("expense_id");--> statement-breakpoint
CREATE INDEX "expense_splits_user_idx" ON "expense_splits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "expenses_trip_idx" ON "expenses" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "expenses_paid_by_idx" ON "expenses" USING btree ("paid_by");--> statement-breakpoint
CREATE INDEX "expenses_expense_date_idx" ON "expenses" USING btree ("expense_date");--> statement-breakpoint
CREATE INDEX "itinerary_stops_trip_idx" ON "itinerary_stops" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "itinerary_stops_created_by_idx" ON "itinerary_stops" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "itinerary_stops_scheduled_at_idx" ON "itinerary_stops" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "itinerary_stops_place_idx" ON "itinerary_stops" USING btree ("google_place_id");--> statement-breakpoint
CREATE INDEX "optional_opt_ins_stop_idx" ON "optional_opt_ins" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "optional_opt_ins_user_idx" ON "optional_opt_ins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "photos_trip_idx" ON "photos" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "photos_stop_idx" ON "photos" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "photos_uploaded_by_idx" ON "photos" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "photos_visibility_idx" ON "photos" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "reservation_participants_reservation_idx" ON "reservation_participants" USING btree ("reservation_id");--> statement-breakpoint
CREATE INDEX "reservation_participants_user_idx" ON "reservation_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reservations_trip_idx" ON "reservations" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "reservations_stop_idx" ON "reservations" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "reservations_paid_by_idx" ON "reservations" USING btree ("paid_by");--> statement-breakpoint
CREATE INDEX "reservations_scheduled_at_idx" ON "reservations" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "stop_notes_stop_idx" ON "stop_notes" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "stop_notes_user_idx" ON "stop_notes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "stop_notes_visibility_idx" ON "stop_notes" USING btree ("visibility");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_members_trip_user_uq" ON "trip_members" USING btree ("trip_id","user_id");--> statement-breakpoint
CREATE INDEX "trip_members_trip_idx" ON "trip_members" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_members_user_idx" ON "trip_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trips_created_by_idx" ON "trips" USING btree ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "votes_stop_user_uq" ON "votes" USING btree ("stop_id","user_id");--> statement-breakpoint
CREATE INDEX "votes_stop_idx" ON "votes" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "votes_user_idx" ON "votes" USING btree ("user_id");