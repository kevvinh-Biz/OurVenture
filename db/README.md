# `db/` — OurVenture Data Layer

Drizzle schema, RLS policies, and seed for the OurVenture MVP backend.

## Files

| File | Purpose |
| --- | --- |
| `schema.ts` | Drizzle ORM TypeScript schema (single source of truth) |
| `rls-policies.sql` | Supabase Row-Level Security policies + helper functions |
| `seed.ts` | Idempotent dev seed (3 users + "Tokyo October 2026" trip) |

## Prerequisites

```bash
pnpm add drizzle-orm postgres @supabase/supabase-js @supabase/ssr
pnpm add -D drizzle-kit tsx dotenv
```

Required env vars (`.env.local`):

```env
# Direct Postgres connection (Drizzle migrations + seed)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres

# Supabase (runtime)
NEXT_PUBLIC_SUPABASE_URL=https://[REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_URL=https://[REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server-only, never expose to client
```

## Drizzle config

Create `drizzle.config.ts` at the repo root:

```ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
  // We declare the `auth.users` shim only for typing — never migrate it.
  schemaFilter: ['public'],
} satisfies Config;
```

## Workflow

### First-time setup

```bash
# 1. Generate the initial migration from schema.ts
pnpm drizzle-kit generate

# 2. Apply migrations to Supabase
pnpm drizzle-kit migrate

# 3. Apply RLS policies + auth.users FK (Supabase SQL editor)
#    Paste the contents of db/rls-policies.sql and Run.
#    Re-runnable: every CREATE POLICY is wrapped in DROP POLICY IF EXISTS.

# 4. Seed dev data (uses service role key; never run against prod)
pnpm tsx db/seed.ts
```

### Day-to-day schema changes

```bash
# After editing schema.ts:
pnpm drizzle-kit generate     # creates a new SQL migration in db/migrations/
pnpm drizzle-kit migrate      # applies it

# If the change touches RLS surface area (new table, new visibility rule,
# new ownership column), re-paste rls-policies.sql into the Supabase SQL
# editor. The file is idempotent.
```

### Push vs. migrate

- **`drizzle-kit push`** — direct sync, no migration file. Use this only
  for very early prototyping. **Do not push to production.**
- **`drizzle-kit generate` + `migrate`** — produces a checked-in SQL
  migration. **Use this from week 2 onward.**

### Applying RLS policies

`db/rls-policies.sql` is the canonical RLS file. To apply:

1. Open Supabase dashboard → SQL editor → New query.
2. Paste the entire file.
3. Run. Every block uses `DROP POLICY IF EXISTS` + `CREATE POLICY`, so
   re-running is safe.

For CI-style automation later, run via `psql`:

```bash
psql "$DATABASE_URL" -f db/rls-policies.sql
```

> The file also creates two SECURITY DEFINER helper functions
> (`is_trip_member`, `is_trip_organizer`) and the `profiles → auth.users`
> FK that Drizzle cannot emit.

### Seeding

```bash
pnpm tsx db/seed.ts
```

Creates:

- 3 auth users (Olivia / Mark / Fiona) with password `devpassword123!`
- Trip "Tokyo October 2026" (invite code `TOKYO2026`)
- 5 stops (2 approved, 3 proposed, 1 optional)
- Votes across all stops
- 2 reservations (hotel + teamLab tickets) with participants
- 4 expenses across categories with equal splits + some settled
- 2 photos + 2 stop notes
- Group + personal checklist items

The seed wipes only the rows with its fixed UUIDs, so it's safe to run
repeatedly. It uses the **service role key** to bypass RLS — never point
it at production.

## Storage buckets (manual setup)

Create two buckets in Supabase Storage:

| Bucket | Public? | Purpose |
| --- | --- | --- |
| `photos` | No | Trip photos (use signed URLs) |
| `reservations` | No | PDF/QR attachments |

Bucket-level RLS policies should mirror the table policies (e.g. only
trip members can read objects under `trip/{tripId}/...`). The upload API
route at `/api/photos/upload` is the only writer for `photos` — it runs
the EXIF strip step before insert. The `photos.exif_stripped` CHECK
constraint guarantees the DB rejects any row claiming an unstripped
upload.

## Conventions

- snake_case columns, camelCase TS fields.
- UUID PKs everywhere; never expose sequential IDs.
- All timestamps are `timestamptz`.
- Cascade hard deletes — MVP does not implement soft delete.
- New tables MUST get RLS enabled + at least SELECT/INSERT/UPDATE/DELETE
  policies before merging.
- Add an index for any FK that is queried in a list view, plus
  `scheduled_at` / `expense_date` for chronological feeds.
