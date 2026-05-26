# Screen 01 — Trip Dashboard

**Purpose:** At-a-glance command surface for one trip. Olivia lands here daily — she needs to know in 3 seconds: what's next, who needs nudging, what's the money picture, who's not ready.

**Route:** `/trips/[tripId]`
**Primary user:** P1 Organizer Olivia
**Wedge contribution:** "command center" promise begins here; deeper detail lives in Trip Timeline (screen 02).

---

## Components on this screen
- Top app bar with trip name, dates, member avatars, settings menu
- Tab nav: Dashboard | Timeline | Itinerary | Expenses | Memories | Checklist
- 4 overview cards: Next reservation, Pending votes, Expense balance, Checklist readiness
- "Today" mini-feed (3–5 most recent activity items)
- Quick actions row (Add stop, Add expense, Invite)
- Mobile FAB for primary add (accent + Plus)

---

## Mobile layout (375 wide)

```
┌─────────────────────────────────────────┐
│ [≡]  Tokyo & Kyoto         [bell] [⚙]  │  app bar, h-14, bg-surface, border-b
├─────────────────────────────────────────┤
│ Apr 12 – Apr 22  ·  Day 2 of 11         │  caption neutral-500
│ ( O )( M )( T )( F )(+3)  7 travelers    │  AvatarGroup sm
├─────────────────────────────────────────┤
│ [Dashboard][Timeline][Itin][$][📷][✓]   │  scrollable tabs, active=Dashboard
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ NEXT UP             in 4h           │ │  overline neutral-500 | caption accent-500
│ │ Hotel Granbell check-in    [Ticket] │ │  h3 + lucide icon
│ │ 3:00 PM · Kyoto                     │ │  body-sm tertiary
│ │ status: 5/7 paid · 7/7 ticketed     │ │  caption
│ │ ━━━━━━━━━●○                         │ │  progress bar, primary fill
│ │                       [View →]      │ │  ghost button
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ PENDING VOTES                       │ │
│ │  [3]  activities need your vote     │ │  h2 numeric tabular + body
│ │ • Tsukiji breakfast    4/7 yes      │ │  list of titles + count
│ │ • Nara day trip        2/7 yes      │ │
│ │ • teamLab Planets      6/7 yes ✓    │ │  approved (success icon)
│ │                       [Vote now]    │ │  accent-500 primary cta
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ YOUR BALANCE                        │ │
│ │  You are owed   $124    [↓ success] │ │  h2 + balance pill
│ │  You owe         $42    [↑ error]   │ │
│ │  ─────────────                      │ │
│ │  Net: +$82                          │ │  bold tabular
│ │                       [Settle up]   │ │  accent button md
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ TRAVEL READINESS                    │ │
│ │ 5 of 7 travelers ready              │ │  body
│ │ ━━━━━━━━━━━━━━━━━━━○○               │ │  bar fill 71%
│ │ Missing:                            │ │
│ │  ( M ) Mark — passport scan         │ │  avatar sm + name + item
│ │  ( T ) Tess — eSIM activation       │ │
│ │                  [Nudge missing]    │ │  outline button
│ └─────────────────────────────────────┘ │
│                                         │
│ ─── Today's activity ───                │  separator + overline
│ • Mark added "Tsukiji breakfast" (5m)   │  feed items, neutral-500 caption
│ • Olivia booked Hotel Granbell  (2h)    │
│ • Tess marked checklist: visa  (5h)     │
│                  [See all activity →]   │
│                                         │
│                            [+ FAB ]    │  bottom-right, accent-500, shadow-lg
└─────────────────────────────────────────┘
```

### Mobile interactions
- Tab bar is horizontally scrollable; active tab underlined `border-b-2 border-primary-500`.
- Each overview card is tappable → deep link (Next Up → reservation detail, Pending Votes → first pending vote modal, Balance → settle up screen, Readiness → checklist).
- FAB opens a small action menu: Add stop / Add expense / Add reservation / Add photo.
- Pull-to-refresh re-syncs data; show toast on success.

---

## Desktop layout (≥1024)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ [OV] OurVenture          Trips ▾    [bell]    ( Olivia )                       │  global nav, h-16
├───────────────────────────────────────────────────────────────────────────────┤
│ ◀ Trips / Tokyo & Kyoto with the Crew         [Invite]  [Export Recap]  [⚙]  │  breadcrumb row
│ Apr 12 – Apr 22 · 11 days · Day 2 · ( O )( M )( T )( F )(+3)  7 travelers     │
├───────────────────────────────────────────────────────────────────────────────┤
│ [Dashboard] [Timeline] [Itinerary] [Expenses] [Memories] [Checklist]          │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│ ┌────────────── NEXT UP (col-span-2) ──────────────┐ ┌─── PENDING VOTES ───┐ │
│ │ Hotel Granbell check-in           in 4h          │ │  [ 3 ]              │ │
│ │ 3:00 PM · Kyoto                    [Ticket]      │ │  activities need    │ │
│ │ status: 5/7 paid · 7/7 ticketed                  │ │  your vote          │ │
│ │ ━━━━━━━━━●○                                       │ │ • Tsukiji  4/7 yes  │ │
│ │ ¥48,000 / ~$320 · paid by Olivia                 │ │ • Nara     2/7 yes  │ │
│ │ ( O )( M )( T )( F )(+3) included                │ │ • teamLab  6/7 yes✓ │ │
│ │                              [View detail →]     │ │     [Vote now]      │ │
│ └──────────────────────────────────────────────────┘ └─────────────────────┘ │
│                                                                               │
│ ┌─── YOUR BALANCE ───┐ ┌─── READINESS ───────┐ ┌─── ROUTE PREVIEW ───────┐  │
│ │ Owed:   $124       │ │ 5/7 ready           │ │  [small Mapbox map      │  │
│ │ Owe:    $42        │ │ ━━━━━━━━━━━○○       │ │   showing route]        │  │
│ │ Net:    +$82       │ │ Missing:            │ │  Day 2 highlighted      │  │
│ │  [Settle up]       │ │  ( M ) Mark passport│ │  3 stops · 2 reservs    │  │
│ │                    │ │  ( T ) Tess eSIM    │ │   [Open map view →]     │  │
│ │                    │ │  [Nudge missing]    │ │                         │  │
│ └────────────────────┘ └─────────────────────┘ └─────────────────────────┘  │
│                                                                               │
│ ┌─────────────────── TODAY'S ACTIVITY (col-span-2) ──────┐ ┌── QUICK ─────┐ │
│ │ • Mark added "Tsukiji breakfast"             5m ago    │ │ [+ Add stop ]│ │
│ │ • Olivia booked Hotel Granbell               2h ago    │ │ [+ Expense  ]│ │
│ │ • Tess marked checklist: visa                5h ago    │ │ [+ Reservatn]│ │
│ │ • Vote threshold reached: teamLab Planets    1d ago    │ │ [📷 Upload  ]│ │
│ │ • Fiona joined the trip                      1d ago    │ │              │ │
│ │                        [See all activity →]            │ │              │ │
│ └────────────────────────────────────────────────────────┘ └──────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Desktop interactions
- 12-col grid. Next Up spans 8 cols (top-left), Pending Votes 4 cols (top-right). Second row: 3 cards × 4 cols each. Third row: Activity feed 8 cols + Quick actions 4 cols.
- Sticky top bar; tab nav scrolls with page.
- Hover on any overview card lifts `shadow-md`.
- Quick actions panel is always visible on desktop — replaces the FAB.
- "View detail →" links deep into Timeline screen with the reservation prescrolled.

---

## States to design
- **Empty (just-created trip):** Replace all cards with one large "Let's get this trip rolling" card with 3 starter actions: Add first stop, Invite travelers, Set vote threshold.
- **Trip in past:** Cards swap — Next Up becomes "Trip complete · 11 days, 24 stops, 18 photos"; Balance shows final settled state; CTA becomes "Export Recap PDF" (accent lg button).
- **No pending votes / no missing readiness:** Card shows success state with check icon + "All caught up".
- **Single traveler (just Olivia so far):** Inline banner above cards: "Invite travelers to unlock votes and splits." [Invite] button.

---

## Notes for developer
- This screen reads from `trips`, `reservations`, `votes`, `expense_splits`, `checklist_items` — use a single Server Component that queries in parallel.
- Pending vote count and balance figures should be derived server-side; don't ship full vote/expense lists to the client.
- Realtime: subscribe to changes on these tables so the dashboard updates without refresh (Supabase realtime).
- Avoid jank: skeleton each card independently while its query resolves.
