# Screen 02 — Trip Timeline (HERO / Command Center)

**Purpose:** The single screen that earns OurVenture's positioning line — chronological reservations + approved activities with status bars per item. This is what Olivia screenshots and shows her group chat to say "this is why I use this app".

**Route:** `/trips/[tripId]/timeline`
**Primary user:** P1 Organizer Olivia (deep daily use). P2 Mark visits to know what's happening today.
**Wedge contribution:** ★★★★★ — the differentiator vs. Wanderlog.

---

## Components
- Day grouping headers (sticky)
- Time rail (vertical line + dots)
- Reservation cards (full pattern from `component-patterns.md §2.2`)
- Approved stop cards (lighter visual weight — they're not "booked", they're "approved")
- Status badges + dual progress bars (tickets, paid)
- Filter bar (All | Reservations | Activities | Mine)
- Jump-to-day chip row at top
- Map sidekick on desktop (sticky right rail with route + current day highlighted)

---

## Mobile layout

```
┌─────────────────────────────────────────┐
│ [◀] Timeline           [Filter] [+]    │  app bar
├─────────────────────────────────────────┤
│ Day  1  2 *3* 4  5  6  7  8  9 10 11    │  horizontal chip scroller, active=3
├─────────────────────────────────────────┤
│ [All] [Reservations] [Activities] [Mine]│  filter chips
├─────────────────────────────────────────┤
│                                         │
│ ═══ FRI · APR 14 · DAY 3 ═══════════════│  sticky day header h2, bg-app
│                                         │
│ ●  9:00 AM                              │  time dot on rail
│ │  ┌───────────────────────────────────┐│
│ │  │ [thumb] Tsukiji Outer Market     ││  stop card (approved, lighter)
│ │  │ Activity · APPROVED · 5/7 yes    ││  status badge success
│ │  │ ~2 hrs · free                    ││
│ │  └───────────────────────────────────┘│
│ │                                       │
│ ●  12:30 PM                             │
│ │  ┌───────────────────────────────────┐│
│ │  │ [Ticket icon] Sushi Dai           ││  reservation card (heavier)
│ │  │ RESERVATION · CONFIRMED          ││  badge success
│ │  │ Conf #SD-93421                    ││  caption mono
│ │  │ tickets: ●●●●●●● 7/7              ││  progress bar 100% success
│ │  │ paid:    ●●●●●○○ 5/7  ⚠           ││  warning tint at right
│ │  │ ¥21,000 / ~$140 · paid by Olivia ││
│ │  │ ( O )( M )( T )( F )(+3)         ││  included avatars
│ │  │ [View confirmation]  [···]        ││
│ │  └───────────────────────────────────┘│
│ │                                       │
│ ●  3:00 PM                              │
│ │  ┌───────────────────────────────────┐│
│ │  │ [Ticket] Hotel Granbell Kyoto    ││
│ │  │ NEXT UP · in 4h    [accent ring] ││  highlighted: current
│ │  │ tickets: ●●●●●●● 7/7              ││
│ │  │ paid:    ●●●●●○○ 5/7              ││
│ │  │ ¥48,000 / ~$320                   ││
│ │  └───────────────────────────────────┘│
│ │                                       │
│ ●  7:00 PM                              │
│ │  ┌───────────────────────────────────┐│
│ │  │ [thumb] Fushimi Inari Night Walk ││
│ │  │ Activity · APPROVED · 6/7 yes    ││
│ │  │ ~1.5 hrs · free · optional        ││  optional chip neutral
│ │  │ ( O )( M )( T ) 3 opted in        ││  opt-in avatars
│ │  └───────────────────────────────────┘│
│ │                                       │
│ ═══ SAT · APR 15 · DAY 4 ═══════════════│  next day header
│ ●  ...                                  │
│                                         │
└─────────────────────────────────────────┘
```

### Mobile interactions
- Tap reservation card → reservation detail (QR/PDF view).
- Tap stop card → stop detail.
- Long-press / "···" menu → mark needs-booking, edit, remove from timeline.
- Jump-to-day chip scrolls smoothly to that day section.
- Filter "Mine" shows only items the user is included in (helpful for Casual Mark).

---

## Desktop layout

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ◀ Trips / Tokyo & Kyoto / Timeline           [Filter ▾] [Export day] [+ Add]  │
├────────────────────────────────────────────────────────────────────────────────┤
│ Day 1 2 *3* 4 5 6 7 8 9 10 11    [All][Reservations][Activities][Mine]        │
├──────────────────────────────────────────────────────┬─────────────────────────┤
│                                                      │                         │
│ ═══ FRI · APR 14 · DAY 3 ═══════════                 │  ┌───────────────────┐ │
│                                                      │  │  [Mapbox map]     │ │
│ ●  9:00 AM                                           │  │   Day 3 route     │ │
│ │  ┌────────────────────────────────────────────┐    │  │   highlighted     │ │
│ │  │ [thumb] Tsukiji Outer Market               │    │  │                   │ │
│ │  │ Activity · APPROVED · 5/7 yes              │    │  │   ●(1) Tsukiji    │ │
│ │  │ ~2 hrs · free                              │    │  │   ▢(2) Sushi Dai  │ │
│ │  │ ( O )( M )( T )( F )(+3)                  │    │  │   ▢(3) Hotel      │ │
│ │  └────────────────────────────────────────────┘    │  │   ●(4) Fushimi    │ │
│ │                                                    │  │                   │ │
│ ●  12:30 PM                                          │  │  ────────────     │ │
│ │  ┌────────────────────────────────────────────┐    │  │  Day 3 totals     │ │
│ │  │ [Ticket] Sushi Dai                          │    │  │  4 stops          │ │
│ │  │ RESERVATION · CONFIRMED   #SD-93421         │    │  │  2 reservations   │ │
│ │  │ tickets ●●●●●●● 7/7 · paid ●●●●●○○ 5/7      │    │  │  ¥69,000 booked   │ │
│ │  │ ¥21,000 / ~$140 · paid by Olivia           │    │  │  ~$460 USD        │ │
│ │  │ ( O )( M )( T )( F )(+3)                  │    │  └───────────────────┘ │
│ │  │ [View confirmation]  [Edit]  [···]         │    │                         │
│ │  └────────────────────────────────────────────┘    │  ┌── PROPOSED ───────┐ │
│ │                                                    │  │ Not on timeline    │ │
│ ●  3:00 PM     [NEXT UP · in 4h]                     │  │ yet (need votes)   │ │
│ │  ┌────────────────────────────────────────────┐    │  │                    │ │
│ │  │ [Ticket] Hotel Granbell Kyoto              │    │  │ • Tsukiji breakfst │ │
│ │  │  ...                                       │    │  │   4/7 yes — needs 5│ │
│ │  └────────────────────────────────────────────┘    │  │   [Vote]           │ │
│ │                                                    │  │ • Nara day trip    │ │
│ ●  7:00 PM                                           │  │   2/7 yes — needs 5│ │
│ │  ┌────────────────────────────────────────────┐    │  │   [Vote]           │ │
│ │  │ [thumb] Fushimi Inari Night Walk           │    │  └────────────────────┘ │
│ │  │  ... optional                              │    │                         │
│ │  └────────────────────────────────────────────┘    │  (sticky as you scroll) │
│ │                                                    │                         │
│ ═══ SAT · APR 15 · DAY 4 ═══════════                 │                         │
│                                                      │                         │
└──────────────────────────────────────────────────────┴─────────────────────────┘
```

### Desktop interactions
- 2-col split: timeline left (8 cols), sticky map+context right (4 cols).
- Map highlights current visible day as user scrolls; clicking a pin scrolls timeline to that item.
- "Proposed" sidebar at bottom of map sticky shows what's NOT on the timeline yet, with quick vote action.
- Hover on reservation card lifts shadow; selected (via click) gets `ring-2 ring-primary-500`.

---

## States to design

- **Empty (no items yet):** Big card centered: "Your trip command center starts here. Add an activity to propose it; the group votes; approved items show up on your timeline." [Add stop] [Add reservation]
- **Mostly empty (1 reservation, no activities yet):** Show the one reservation + a soft prompt card: "Propose activities and they'll appear here once approved."
- **Mid-trip (today highlighted):** Current item gets an accent left border + "in Xh" pill in accent color.
- **Past day collapsed by default:** Past days fold into a single row "Apr 12 · Day 1 (collapsed — 4 items) [expand]"; user expands as needed. Always expand current and future days.
- **Conflict detected** (item overlaps another in time): warning badge on the affected card + tooltip "Overlaps with Sushi Dai (12:30 PM)".

---

## Notes for developer
- This is the highest-attention screen — performance matters. Virtualize the day list if a trip has >40 items.
- Map state syncs to scroll position via IntersectionObserver on day headers.
- Status badges are derived from `reservation_participants` aggregations; cache on the server.
- The "Proposed" sidebar pulls from `itinerary_stops WHERE status='proposed'` — same query as the dashboard's pending votes card, deduplicate by component.
