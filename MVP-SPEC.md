# OurVenture — MVP Product Specification

**Working name:** OurVenture
**Owner:** kev.vinh.biz@gmail.com
**Spec date:** 2026-05-25
**Target MVP launch:** 8–12 weeks from build start
**Status:** Draft — pending user confirmation on 3 lock-in questions (see §0)

---

## 0. Open Questions (Confirm Before Build)

These default assumptions are baked into this spec. Override any of them and I will revise:

1. **Build resource:** Solo founder building, with Claude + agents as collaborator. *(default: solo)*
2. **Timeline:** 8–12 week MVP, not 4 weeks. *(default: 8–12 weeks)*
3. **Form factor:** Web-first responsive PWA. No native iOS/Android in MVP. *(default: PWA)*
4. **Infra budget:** $25–100/mo acceptable. *(default: yes)*
5. **Working name:** "OurVenture" placeholder. *(default: rename anytime)*

---

## 1. Product Category & Positioning

**Category:** Collaborative Trip Management Platform
**Not:** Itinerary planner, social travel network, booking marketplace, AI travel agent

**Locked positioning:**
> "The group trip command center that turns messy group chats into approved itineraries, paid reservations, ready travelers, and shared memories."

**Wedge vs. Wanderlog:**

| Wanderlog | OurVenture |
| --- | --- |
| Solo + lightweight collab | Group-first, accountability-driven |
| Itinerary first | Decisions + accountability first |
| Static notes | Voting + thresholds + status tracking |
| Personal album | Shared Memory Pins (basic in MVP, deep in P3) |
| Manual sharing | Trusted-network reviews + recap export |
| Strangers' reviews | Friends/family reviews |

**Anti-positioning:** Avoid "AI itinerary planner" framing. Saturated and undifferentiated.

---

## 2. User Personas

| Persona | Age/Role | Pain | Win With OurVenture |
| --- | --- | --- | --- |
| **P1 Organizer Olivia** | 28–40, primary planner | Chasing votes, payments, prep | Dashboard shows every person/item status |
| **P2 Casual Mark** | Friend, low engagement | Group chat overload | Votes in 30s, sees what he owes/needs |
| **P3 Family Fiona** | Parent/relative | Doesn't want another app | Read-only shared link |
| **P4 Future Tina** | Inspired traveler | Scattered trip blogs | Clone friend's route + see notes/photos |
| **P5 Creator Casey** *(P3+)* | Travel content creator | Manual post creation | Auto carousel with map + cost slides |

Primary persona for MVP design decisions: **P1 Organizer Olivia**. If Olivia loves it, the rest follow.

---

## 3. MVP Scope (Phase 1) — 14 Capabilities

**KEEP in MVP:**

| # | Feature | Rationale |
| --- | --- | --- |
| 1 | Auth (email + Google OAuth) | Required floor |
| 2 | Create trip + invite via link | Core entry point |
| 3 | Add itinerary stops (date/time/notes/cost) | Core |
| 4 | Place search (Google Places API) | Differentiator vs. paper |
| 5 | Map route view (Mapbox) | Visual must-have |
| 6 | Hours display + conflict warnings | Real pain point |
| 7 | Activity voting with org-set threshold | **Wedge feature** |
| 8 | Reservation timeline ("Trip Command Center") | **Wedge feature** |
| 9 | Expense tracker + per-person splits | Real pain |
| 10 | Multi-currency display (cached daily rate) | Easy win |
| 11 | Shared photo album, attached to stops | Memory foundation |
| 12 | Per-stop notes/reviews (private/group) | Trust foundation |
| 13 | Travel checklist (template + custom) | Easy win |
| 14 | Basic recap PDF export | Shareable artifact |

**CUT from MVP (deferred to Phase 2–4):**

| Cut Feature | Reason |
| --- | --- |
| Live currency rates | Use cached daily rate; live = scope creep |
| Weather/packing AI | Needs API + AI logic |
| Local laws/customs alerts | Legal liability, data sourcing |
| ATM/exchange guidance | Needs sourced data + disclaimers |
| Public itinerary pages | Phase 2 — needs SEO + sharing infra |
| Memory Pin compare/overlay | Phase 3 — complex UX |
| Auto carousel generator | Phase 3 — design intensive |
| Trip fund contributions | Phase 3 — payment compliance |
| Direct social posting | Phase 4 — API approvals |
| Native mobile app | Phase 4 — PWA is enough |
| Affiliate booking marketplace | Phase 4 — needs traction first |

**Rule applied:** anything requiring third-party data sourcing, payment processing, AI generation, or platform API approvals is OUT of MVP.

---

## 4. Phased Roadmap

| Phase | Timeframe | Theme | Headline Features |
| --- | --- | --- | --- |
| **P1 MVP** | Now → Wk 12 | Decide, plan, prep, remember | 14 features above |
| **P2 Enhance** | Wk 12–24 | Smarter prep + public sharing | Weather/packing, laws/customs, recap studio, public itinerary pages, copy/remix, caption generator |
| **P3 Network** | Wk 24–40 | Memory + trust + monetize | Memory Pins compare, public spot gallery, trip fund (Stripe links), affiliate bookings, premium tier |
| **P4 Scale** | Wk 40+ | Native + social + AI | Native iOS/Android, scheduled social posting, multi-currency settlement, creator profiles, AI assistant |

---

## 5. Tech Stack Recommendation

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend framework | **Next.js 15 (App Router)** | SSR for share links, PWA-ready, fast iteration |
| UI library | **Tailwind + shadcn/ui** | Polished components, fast build |
| State / forms | React Server Components + React Hook Form + Zod | Type-safe forms |
| Backend | **Next.js API routes + Server Actions** | One codebase, one deploy |
| Database | **Supabase Postgres** | Auth + DB + storage + realtime + RLS in one |
| ORM | **Drizzle** | TS-first, lighter than Prisma |
| Auth | **Supabase Auth** (email + Google OAuth) | Free, hosted, OAuth ready |
| File storage | **Supabase Storage** | Photos, PDFs, attachments |
| Map rendering | **Mapbox GL JS** | Cheaper at scale, better UI than Google Maps |
| Place search | **Google Places API (New)** | Best data globally |
| Currency | **exchangerate.host** | Free, cached daily |
| Email | **Resend** | Cheap, dev-friendly, React Email templates |
| PDF generation | **react-pdf** or Puppeteer | Recap export |
| Hosting | **Vercel** | Zero-config Next.js, edge functions |
| Image processing | **sharp** (server-side) | EXIF strip, thumbnails |
| Payments | **None in MVP** (Stripe in P3) | Avoid money transmitter complexity |

**Estimated MVP infra cost:** $25–60/month
- Supabase Pro: $25/mo
- Vercel Hobby or Pro: $0–20/mo
- Mapbox: free <50K loads/mo
- Google Places: $200/mo free credit (likely $0 in MVP)
- Resend: free <100 emails/day

**Alternatives considered:**
- **Firebase + Firestore:** rejected — relational data (votes, expense splits) is awkward in Firestore. Better for chat apps.
- **Remix + Cloudflare D1:** rejected — smaller ecosystem, harder to hire help.
- **React Native first:** rejected — slower MVP, worse for share links. PWA covers 90% of mobile need.

**Confidence: 85%** on Supabase + Next.js as best fit.
**Trade-off:** Vendor lock-in on Supabase. Mitigated by standard Postgres schema (portable to any host).

---

## 6. Core User Flows

### Flow 1 — Create Trip & Invite
1. User signs up (email or Google)
2. Clicks "New Trip" → enters name, dates, destination, default currency
3. App generates trip + unique invite link
4. User sends link via email/copy paste
5. Invitee clicks link → signs up or logs in → joins trip
6. Both see trip dashboard

### Flow 2 — Propose & Vote on Activity
1. Member clicks "Add Activity" on a date
2. Searches Google Places → selects place (e.g., "Eiffel Tower")
3. App pre-fills name, address, hours, photo
4. Member sets proposed time, est. cost, notes
5. App auto-flags: closed that day, conflicts with prior stop's travel time
6. Saved as "Proposed" — all members notified
7. Members vote Yes/No/Maybe
8. When yes votes ≥ threshold (e.g., 60% of active members) → status flips to "Approved"
9. Approved activities appear on the day's itinerary + route map

### Flow 3 — Track Reservation
1. From approved activity, organizer clicks "Mark needs booking"
2. After booking, adds: confirmation #, time, address, link, cost, who's included, attaches PDF/QR
3. Reservation appears in "Trip Timeline" (chronological)
4. Per-reservation status bar: "5/7 tickets purchased, 4/7 paid"
5. Organizer dashboard rolls up: "12 reservations, 3 pending payment, 1 missing tickets"

### Flow 4 — Log Expense & Split
1. Member logs expense: amount + currency + category + who paid
2. Selects split: equal among all / equal among subset / custom shares
3. App calculates balances per person
4. "Settlement" view shows minimum transactions (e.g., "Mark pays Olivia $42")
5. Members mark "paid" to clear lines

### Flow 5 — Document Stop with Photo + Note
1. From any stop, member taps "Add memory"
2. Uploads photo(s) — server strips EXIF, generates thumbnail
3. Adds note (text), rating (must/good/okay/skip), tips, wait time
4. Sets visibility: Private / Group / Shared with copiers / Public
5. Photo/note attaches to stop, visible per rules

### Flow 6 — Generate Recap PDF
1. After trip end, user clicks "Export Recap" on trip dashboard
2. Modal lets user select: include photos? include costs? cover photo?
3. PDF generates with cover, route map image, day-by-day with photos + notes, cost summary by category, traveler list
4. User downloads or copies share link

### Flow 7 — Travel Readiness
1. Each member sees personal checklist with template items (passport, visa, tickets, eSIM, etc.)
2. Adds custom items
3. Checks items off as ready
4. Organizer dashboard shows: "5/7 travelers ready, 2 missing passport scan"

---

## 7. Data Model (Postgres / Supabase)

```sql
-- USERS & AUTH
users (
  id uuid PK,
  email text UNIQUE,
  name text,
  avatar_url text,
  home_currency char(3) DEFAULT 'USD',
  created_at timestamptz
)

-- TRIPS
trips (
  id uuid PK,
  name text,
  destination text,
  start_date date,
  end_date date,
  created_by uuid FK→users,
  vote_threshold int DEFAULT 60,         -- percent
  default_currency char(3),
  invite_code text UNIQUE,
  cover_photo_url text,
  settings jsonb,
  created_at timestamptz
)

trip_members (
  id uuid PK,
  trip_id uuid FK→trips,
  user_id uuid FK→users,
  role text CHECK (role IN ('organizer','member','viewer')),
  status text CHECK (status IN ('invited','active','left')),
  joined_at timestamptz,
  UNIQUE(trip_id, user_id)
)

-- ITINERARY
itinerary_stops (
  id uuid PK,
  trip_id uuid FK→trips,
  title text,
  description text,
  google_place_id text,
  lat decimal,
  lng decimal,
  address text,
  scheduled_at timestamptz,
  duration_min int,
  status text CHECK (status IN ('proposed','approved','rejected','skipped')),
  cost_estimate decimal,
  currency char(3),
  is_optional boolean DEFAULT false,
  created_by uuid FK→users,
  sort_order int,
  created_at timestamptz
)

place_hours_cache (
  google_place_id text PK,
  hours jsonb,                            -- per day open/close
  closed_days jsonb,
  last_synced timestamptz
)

votes (
  id uuid PK,
  stop_id uuid FK→itinerary_stops,
  user_id uuid FK→users,
  vote text CHECK (vote IN ('yes','no','maybe')),
  voted_at timestamptz,
  UNIQUE(stop_id, user_id)
)

optional_opt_ins (
  stop_id uuid FK→itinerary_stops,
  user_id uuid FK→users,
  opted_in_at timestamptz,
  PRIMARY KEY (stop_id, user_id)
)

-- RESERVATIONS
reservations (
  id uuid PK,
  trip_id uuid FK→trips,
  stop_id uuid FK→itinerary_stops NULLABLE,
  type text CHECK (type IN ('hotel','restaurant','transport','tour','ticket','other')),
  title text,
  confirmation_number text,
  scheduled_at timestamptz,
  address text,
  external_link text,
  cancellation_deadline timestamptz,
  total_cost decimal,
  currency char(3),
  attachment_url text,
  paid_by uuid FK→users NULLABLE,
  created_at timestamptz
)

reservation_participants (
  reservation_id uuid FK→reservations,
  user_id uuid FK→users,
  has_ticket boolean DEFAULT false,
  has_paid boolean DEFAULT false,
  amount_owed decimal,
  currency char(3),
  PRIMARY KEY (reservation_id, user_id)
)

-- EXPENSES
expenses (
  id uuid PK,
  trip_id uuid FK→trips,
  paid_by uuid FK→users,
  amount decimal,
  currency char(3),
  category text,                          -- lodging,food,transit,activity,misc
  description text,
  expense_date date,
  receipt_url text,
  split_type text CHECK (split_type IN ('equal','shares','custom')),
  created_at timestamptz
)

expense_splits (
  expense_id uuid FK→expenses,
  user_id uuid FK→users,
  amount_owed decimal,
  settled boolean DEFAULT false,
  settled_at timestamptz,
  PRIMARY KEY (expense_id, user_id)
)

currency_rates_cache (
  base char(3),
  quote char(3),
  rate decimal,
  fetched_at timestamptz,
  PRIMARY KEY (base, quote)
)

-- MEMORIES
photos (
  id uuid PK,
  trip_id uuid FK→trips,
  stop_id uuid FK→itinerary_stops NULLABLE,
  uploaded_by uuid FK→users,
  storage_path text,
  thumbnail_path text,
  caption text,
  visibility text CHECK (visibility IN ('private','group','shared','public')),
  exif_stripped boolean DEFAULT true,
  created_at timestamptz
)

stop_notes (
  id uuid PK,
  stop_id uuid FK→itinerary_stops,
  user_id uuid FK→users,
  content text,
  rating text CHECK (rating IN ('must','good','okay','skip')) NULLABLE,
  tips text,
  wait_time_min int,
  best_time_to_go text,
  visibility text,
  created_at timestamptz
)

-- CHECKLIST
checklist_items (
  id uuid PK,
  trip_id uuid FK→trips,
  user_id uuid FK→users NULLABLE,         -- null = group-wide
  title text,
  category text,
  template_key text,
  completed boolean DEFAULT false,
  due_date date,
  created_at timestamptz
)
```

**Row-Level Security policies (Supabase RLS):**
- Trip data visible only to active `trip_members`
- Photos filtered by `visibility` + membership
- Only `organizer` role can mutate `vote_threshold`, member roles
- Users can only mutate their own `votes`, `expense_splits.settled`, etc.

---

## 8. Third-Party APIs

| API | Purpose | Cost | MVP Critical? |
| --- | --- | --- | --- |
| Google Places API (New) | Place search, hours, photos | $200/mo free credit | YES |
| Mapbox GL JS | Map rendering | Free <50K loads/mo | YES |
| exchangerate.host | Currency conversion | Free | YES |
| Resend | Transactional email (invites) | Free <100/day | YES |
| Supabase | Auth + DB + storage | $25/mo Pro | YES |
| Vercel | Hosting | Free or $20/mo | YES |
| OpenWeather One Call | Forecast for packing | Free tier | NO (P2) |
| Stripe Connect | Trip fund contributions | 2.9% + 30¢ | NO (P3) |
| Sherpa or VisaHQ | Visa/passport requirements | Paid tiers | NO (P2) |

---

## 9. Privacy & Compliance Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Photo EXIF leaks GPS | HIGH | Server-side EXIF strip on every upload (`sharp`) |
| Children's photos exposed | HIGH | Default visibility = group only; warn on public toggle |
| Hotel/lodging address public | HIGH | Lodging always private by default; "Hide exact location" toggle |
| Real-time location | HIGH | Not collected in MVP |
| GDPR (EU users) | MED | Supabase DPA in place; delete-account flow that hard-deletes user data |
| CCPA (CA users) | MED | Same as GDPR flow |
| Photo consent within group | MED | "Hide me from exports" per-user toggle |
| Trip fund = money transmission | HIGH (P3) | Use Stripe Connect or external links — NEVER hold funds in-app |
| Visa/laws info accuracy | MED (P2) | Source-link every claim, disclaimer "verify with consulate" |
| User-uploaded copyrighted media | LOW | Terms of Service + DMCA flow |
| Children under 13 (COPPA) | MED | Age gate at signup; under-13 not allowed without parent consent |

**Critical:** EXIF strip is non-negotiable in MVP. Build into upload pipeline before launch.

---

## 10. Screen / Wireframe Inventory (~29 screens)

**Auth & Onboarding (3)**
- Sign up / Log in
- Profile setup (name, home currency, avatar)
- Empty state (create or join trip)

**Trip Management (8)**
- Trip list ("My Trips")
- Trip dashboard (overview cards: next reservation, pending votes, expense balance, checklist %)
- Create trip wizard
- Invite members modal
- Trip settings (threshold, currency, dates)
- Member list + roles
- **Trip Timeline view** (chronological reservations + approved activities — the "Command Center" hero screen)
- Map view (full route)

**Itinerary (5)**
- Day-by-day itinerary view
- Add stop modal (Google Places search)
- Stop detail (hours, address, photos, notes, votes, opt-ins)
- Vote on activity modal
- Proposed activities list (pending vote)

**Expenses (4)**
- Expenses list
- Add expense
- Settlement view (who owes whom)
- Per-member balance breakdown

**Reservations (3)**
- Reservation list
- Add/edit reservation (file upload)
- Reservation detail (QR/PDF viewer)

**Memories (3)**
- Trip photo album
- Photo upload (visibility selector)
- Stop notes view

**Checklist (2)**
- My personal checklist
- Group readiness dashboard (organizer-only)

**Export (1)**
- Recap PDF preview + download

---

## 11. Build Milestones (12-Week Plan)

| Weeks | Theme | Deliverables |
| --- | --- | --- |
| 1–2 | **Foundation** | Next.js scaffold, Supabase setup, Drizzle schema, auth (email + Google), trip + members + invites, shadcn/ui base |
| 3–4 | **Itinerary Core** | Google Places search, Mapbox render, stops CRUD, day-by-day view, hours fetch, conflict warnings |
| 5–6 | **Voting + Reservations** | Voting logic + thresholds, proposed→approved flow, reservation tracker, Trip Timeline view, file uploads |
| 7–8 | **Expenses + Currency** | Expense logging, split logic (equal/shares/custom), settlement algorithm, multi-currency display, daily rate cache cron |
| 9–10 | **Memories + Checklist** | Photo upload + EXIF strip + thumbnails, per-stop notes, visibility/RLS rules, checklist templates |
| 11–12 | **Polish + Launch** | Recap PDF (react-pdf), trip dashboard polish, PWA manifest + offline read, onboarding flow, bug bash, soft launch to 3–5 test trips |

---

## 12. Success Metrics for MVP

**Activation (per trip):**
- ≥3 members join trip within 7 days of creation
- ≥1 activity proposed + voted on
- ≥1 reservation logged
- ≥1 expense logged

**Retention:**
- Organizer returns within 24h of creation
- Members return within 48h of invite

**Wedge proof (the hard one):**
- ≥1 photo attached to a stop per trip
- ≥1 stop note left per trip
- Recap PDF exported on ≥30% of completed trips

If these numbers hit, the wedge works. If photos/notes/exports stay at zero, the differentiation is weak and pivot needed.

---

## 13. Recommended Build Agents (Sequence)

Once you confirm scope, I'll engage these in order:

| Order | Agent | Job |
| --- | --- | --- |
| 1 | **Backend Architect** | Finalize Postgres schema + RLS policies + API contract |
| 2 | **UI Designer** | Design system (colors, typography, dashboard layout, key screens) |
| 3 | **Frontend Developer** | Next.js app shell, routing, shadcn/ui setup, auth pages |
| 4 | **Rapid Prototyper** | First end-to-end vertical slice: create trip → invite → add stop → vote → see on timeline |
| 5 | **Database Optimizer** | Index strategy + RLS performance pass before launch |

Optional later:
- **Security Engineer** — pre-launch audit (auth, RLS, EXIF, file upload)
- **Brand Guardian** — name validation, logo, brand voice once "OurVenture" is replaced

---

## 14. What I Am NOT Building in MVP (Explicit)

So we don't drift:
- ❌ Live currency rates (cached daily only)
- ❌ Weather forecasts / packing AI
- ❌ Local laws / customs / scams content
- ❌ ATM and currency exchange guidance
- ❌ Public itinerary pages (private/group sharing only)
- ❌ Memory Pin overlay / side-by-side compare
- ❌ Auto-generated social carousels
- ❌ Caption / hashtag generator
- ❌ Trip fund contributions / payment processing
- ❌ Direct social posting (Instagram/TikTok APIs)
- ❌ Affiliate booking integrations
- ❌ Hotel/airline sponsorships
- ❌ Native iOS / Android app
- ❌ Multi-currency wallet / settlement
- ❌ Public review marketplace
- ❌ AR photo angle matching

Every one of these is a Phase 2/3/4 candidate. If we touch any in MVP, scope is broken.

---

## END OF MVP SPEC
