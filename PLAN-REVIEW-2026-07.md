# OurVenture — Plan Review & Course Correction (2026-07-09)

Reviewer: Claude (Fable 5). Companion to `MVP-SPEC.md` — the spec stays the
source of truth for scope; this doc records what changed, what we learned,
and the adjusted build order. Bring both files to any future LLM session.

---

## 1. Where the project actually stands (week ~6.5 of 12)

**Built (exists in repo, mostly unverified end-to-end):**
- Auth pages (email signup/login, OAuth callback route)
- Trip create wizard + dashboard + trip detail layout
- Invite modal + `/join/[code]` flow
- Itinerary: day view, add-stop form, voting actions, stop cards
- Page shells for timeline, expenses, checklist, photos
- Drizzle schema for all 14 tables, RLS policies written (`db/rls-policies.sql`)
- shadcn/ui component set, dark mode

**NOT yet done:**
- RLS policies never applied to Supabase (blocked on SQL editor step)
- No verified end-to-end flow in production (deploy went green 2026-07-09)
- Google Places integration, Mapbox map view, hours/conflict warnings
- Expense split logic, settlement algorithm, currency cache
- Photo upload + EXIF strip, recap PDF, PWA manifest
- Any tests

**Verdict:** roughly at the Week 3–4 milestone of the 12-week plan at week 6.5.
Not a crisis, but the remaining plan must be re-cut (see §4).

---

## 2. Root-cause postmortem of the lost week (2026-07-02 → 07-09)

The Vercel deploy failed ~8 times. Final root cause: the Supabase password
inside `DATABASE_URL` contained unencoded special characters (`%` etc.),
which crashed the `postgres` driver at import time during `next build`
("Collecting page data" → `URIError: URI malformed`).

**Process rules adopted (non-negotiable going forward):**
1. **Always `npm run build` locally before pushing.** Every Vercel failure
   this week was reproducible locally in under 60 seconds.
2. **DB clients are lazy** — never parse env/connect at module import
   (`lib/db/index.ts` now enforces this via Proxy).
3. **Secrets with special characters must be percent-encoded** in any URL.
4. **One Vercel project only.** Four duplicates existed; delete down to one.
5. **`redirect()` never inside `try/catch`** — Next.js redirects throw.

---

## 3. Architecture correction (highest-value change)

**Problem:** App pages currently query Postgres through Drizzle using the
connection-string user. This (a) **bypasses RLS entirely** — the policies we
wrote are decorative on these paths, (b) depends on raw Postgres ports
(5432/6543), which the local network blocks — the reason local dev against
the real DB has been impossible, and (c) made the whole deploy hostage to
connection-string parsing.

**Decision:** Split the data layer by trust boundary:

| Path | Client | Why |
| --- | --- | --- |
| All user-scoped reads/writes (trips, stops, votes, expenses, photos) | **supabase-js** (`lib/supabase/server.ts`) | Runs over HTTPS 443 (works on the blocked local network!), forwards the user JWT, RLS actually enforced |
| Schema management / migrations | **drizzle-kit** | Keep schema as TS source of truth |
| Admin/cron/service-role jobs (rate cache, cleanup) | Drizzle client | Legit RLS-bypass cases only |

**Migration approach:** incremental — new features use supabase-js from the
start; existing Drizzle page queries get converted as each page is finished
to feature-complete. `/join/[code]` first (it does a privileged insert that
should be an RLS-checked insert or an RPC).

This one change simultaneously fixes local dev, enforces security, and
removes the most fragile dependency from the request path.

---

## 4. Re-cut milestone plan (from 2026-07-09)

The 14-feature scope stays, but sequenced so a **real trip can dogfood the
app as early as possible** — the spec's own success metrics are per-trip and
unmeasurable until one trip runs through it.

| Milestone | Target | Contents | Exit criterion |
| --- | --- | --- | --- |
| **M1 "It's alive"** | Wk 7 | Apply RLS in Supabase SQL editor; set Vercel env vars (pooler DATABASE_URL, Supabase keys); verify signup → create trip → invite → join → add stop → vote **in production** | You + 1 friend complete the loop on phones |
| **M2 "Trip Zero"** | Wk 8–9 | Google Places in add-stop, hours display + conflict warnings, Trip Timeline (Command Center) real data, expenses + equal split + settlement view | A real upcoming trip is planned in the app |
| **M3 "Memories"** | Wk 10–11 | Photo upload + server-side EXIF strip (sharp) + thumbnails, per-stop notes, checklist with template, Mapbox route view | Photos attach to stops; EXIF verified stripped |
| **M4 "Launch-able"** | Wk 12–13 | Multi-currency display + daily rate cron, recap PDF, PWA manifest, onboarding polish, delete-account flow, soft launch 3–5 trips | Spec §12 metrics being collected |

Slipped ~1–2 weeks vs. original plan — acceptable; do not cut EXIF strip or
RLS to recover time (both are launch blockers per spec §9).

**Deliberately still OUT (unchanged from spec §14).** One addition to the
P2 list: **route optimization** (order stops by travel time + opening hours
+ estimated visit duration). Owner cares about this feature; MVP ships only
conflict *warnings*. Note for P2: Google Places API does not expose average
visit duration — plan on heuristics per place category, editable by users.

---

## 5. Spec corrections (facts that changed or were wrong)

1. **exchangerate.host is no longer keyless/free** — switch to
   **frankfurter.app** (free, no key, ECB daily rates). Update spec §5/§8.
2. **Supabase direct connections (`db.*.supabase.co:5432`) are IPv6-only.**
   Vercel functions require the **pooler** string
   (`*.pooler.supabase.com:6543`, transaction mode). Direct string is only
   for drizzle-kit from IPv4-capable networks.
3. **Recap PDF:** use `@react-pdf/renderer`, not Puppeteer — Puppeteer is
   too heavy for Vercel serverless. If PDF quality disappoints, revisit.
4. **Supabase free tier is fine until real users** — defer the $25/mo Pro
   upgrade until storage/egress demands it. Current infra cost: ~$0/mo.
5. ESLint is currently **disabled during builds** (`next.config.ts`).
   Acceptable for MVP velocity. Before soft launch: re-enable with the
   relaxed `.eslintrc.json` rules and fix remaining errors.

---

## 6. Current deployment state & immediate next actions

- GitHub: https://github.com/kevvinh-Biz/OurVenture (branch `main`)
- Vercel: multiple duplicate projects — **delete all but one**
- `.env.local` is correct locally (password now percent-encoded)

**Owner to-do (in order):**
1. Redeploy latest commit on Vercel → confirm green
2. Supabase dashboard → Settings → Database → copy **Transaction pooler**
   connection string → paste into `.env.local`, have Claude encode it →
   set as `DATABASE_URL` in Vercel env vars (plus
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`)
3. Supabase SQL editor → run `db/rls-policies.sql`
4. Delete duplicate Vercel projects
5. Run the M1 end-to-end test on the live URL
