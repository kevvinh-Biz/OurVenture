# Screen 03 — Itinerary Day View

**Purpose:** Plan and explore one day at a time. Two visible sections: APPROVED (what we're doing) and PROPOSED (what we're considering). Map preview shows the day's route. This is where Olivia adds stops and where Mark quickly votes.

**Route:** `/trips/[tripId]/itinerary?day=YYYY-MM-DD`
**Primary user:** P1 Olivia (proposing), P2 Mark (voting fast).

---

## Components
- Day navigator (prev/next day arrows + date header + day-of-week)
- Day strip (all days as chips, current bold)
- Map preview (small card on mobile, large on desktop)
- Section: Approved stops (chronological)
- Section: Proposed stops (separated, with vote pills)
- Section: Optional (opt-in style, separated)
- Add stop CTA (per section + FAB)

---

## Mobile layout

```
┌─────────────────────────────────────────┐
│ [◀] Itinerary           [Map] [+]      │  Map toggles map full-screen
├─────────────────────────────────────────┤
│ Day 1 2 *3* 4 5 6 7 8 9 10 11           │  chip strip
├─────────────────────────────────────────┤
│  ◀  Fri · Apr 14 · Day 3  ▶             │  day header h2 centered
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ [Mapbox preview — 16:9]             │ │  rounded-lg, shows day's route
│ │  pins ●1 ●2 ●3 ●4 + route line     │ │
│ │                          [Expand ↗]│ │  open full map
│ └─────────────────────────────────────┘ │
│                                         │
│ APPROVED · 3 stops                      │  overline
│ ┌─────────────────────────────────────┐ │
│ │  9:00 AM  ●1                        │ │
│ │ [thumb] Tsukiji Outer Market        │ │  stop card with left border success
│ │ ★ — 5/7 yes · ~2h · free            │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 12:30 PM  ●2                        │ │
│ │ [thumb] Sushi Dai     [reservation] │ │  badge: reservation linked
│ │ ★ — 7/7 yes · ¥21,000               │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │  7:00 PM  ●3                        │ │
│ │ [thumb] Fushimi Inari Night Walk    │ │
│ │ ★ — 6/7 yes · ~1.5h · free          │ │
│ └─────────────────────────────────────┘ │
│                  [+ Add approved stop]  │  outline button full-width
│                                         │
│ PROPOSED · 2 awaiting vote              │  overline info color
│ ┌─────────────────────────────────────┐ │
│ │  8:00 AM  ◌                         │ │  hollow dot (not on map yet)
│ │ [thumb] Tsukiji breakfast counter   │ │  left border info-500
│ │ proposed by Mark · ~1h · ¥2,000      │ │
│ │ Votes: [✓ 4] [? 1] [✗ 0]            │ │  vote pills (compact)
│ │ Threshold 5/7 needed                │ │  caption
│ │ ━━━━━━━━━━━━━━○○ 4/7                │ │  progress info color
│ │                  [Vote] [Details]   │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │  All day  ◌                         │ │
│ │ [thumb] Nara day trip               │ │
│ │ proposed by Tess · ~8h · ¥3,500     │ │
│ │ Votes: [✓ 2] [? 2] [✗ 1]            │ │
│ │ ━━━━━○○○○○ 2/7                       │ │
│ │                  [Vote] [Details]   │ │
│ └─────────────────────────────────────┘ │
│                  [+ Propose stop]       │
│                                         │
│ OPTIONAL · 1 stop                       │
│ ┌─────────────────────────────────────┐ │
│ │ Late night ramen — Ichiran          │ │
│ │ optional · opt-in if interested     │ │
│ │ ( O )( M ) opted in   [I'm in]      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│                            [+ FAB]      │  add stop quick action
└─────────────────────────────────────────┘
```

### Mobile interactions
- Day chips horizontal-scroll; tap to switch day.
- Map preview tap → full-screen map (Screen 03 alt).
- Stop card tap → stop detail (Screen 05 for proposed; reservation detail for booked).
- Vote pills are *display* only on this screen — Vote button opens the vote modal.
- Sections collapse-by-tap on overlines (saves space on long days).

---

## Desktop layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ◀ Trips / Tokyo & Kyoto / Itinerary                       [+ Add stop]       │
├──────────────────────────────────────────────────────────────────────────────┤
│ Day 1 2 *3* 4 5 6 7 8 9 10 11                                                │
├─────────────────────────────────────────────────┬────────────────────────────┤
│  ◀  Fri · Apr 14 · Day 3  ▶                     │                            │
│                                                 │  ┌──────────────────────┐  │
│ APPROVED · 3 stops              [+ Add stop]    │  │  [Mapbox map]        │  │
│ ┌─────────────────────────────────────────────┐ │  │   Day 3 route        │  │
│ │  9:00 AM  ●1                                │ │  │   ●1 ●2 ●3 ●4        │  │
│ │ [thumb] Tsukiji Outer Market                │ │  │   route line         │  │
│ │ ★ 5/7 yes · ~2h · free                      │ │  │                      │  │
│ │ ( O )( M )( T )( F )(+3)        [Details]   │ │  │                      │  │
│ └─────────────────────────────────────────────┘ │  └──────────────────────┘  │
│ ┌─────────────────────────────────────────────┐ │   [Layers] [Recenter]      │
│ │ 12:30 PM  ●2                                │ │                            │
│ │ [thumb] Sushi Dai    [reservation]          │ │  ┌── DAY SUMMARY ────┐    │
│ │ ★ 7/7 yes · ¥21,000                         │ │  │  3 approved        │    │
│ │ ( O )( M )( T )( F )(+3)        [Details]   │ │  │  2 proposed        │    │
│ └─────────────────────────────────────────────┘ │  │  1 optional        │    │
│ ┌─────────────────────────────────────────────┐ │  │  Est: ¥23,000      │    │
│ │  7:00 PM  ●3                                │ │  │  ~$153 USD         │    │
│ │ [thumb] Fushimi Inari Night Walk            │ │  │  Travel time:      │    │
│ │ ★ 6/7 yes · ~1.5h · free                    │ │  │  ~2h between stops │    │
│ │ ( O )( M )( T )                  [Details]  │ │  └────────────────────┘    │
│ └─────────────────────────────────────────────┘ │                            │
│                                                 │  ┌── CONFLICTS ──────┐    │
│ PROPOSED · 2 awaiting   [+ Propose stop]        │  │ ⚠ Tsukiji breakfst │    │
│ ┌─────────────────────────────────────────────┐ │  │   8:00 AM may not  │    │
│ │  8:00 AM  ◌  Tsukiji breakfast counter      │ │  │   leave time to    │    │
│ │ proposed by Mark · ~1h · ¥2,000              │ │  │   Tsukiji Mkt 9AM  │    │
│ │ Votes [✓4][?1][✗0]  4/7 — need 5             │ │  └────────────────────┘    │
│ │ ━━━━━━━━━━━━━━○○                              │ │                            │
│ │                          [Vote] [Details]   │ │                            │
│ └─────────────────────────────────────────────┘ │                            │
│ ┌─────────────────────────────────────────────┐ │                            │
│ │  All day  ◌  Nara day trip                  │ │                            │
│ │ ...                                         │ │                            │
│ └─────────────────────────────────────────────┘ │                            │
│                                                 │                            │
│ OPTIONAL · 1                                    │                            │
│ ┌─────────────────────────────────────────────┐ │                            │
│ │ Late night ramen — Ichiran                  │ │                            │
│ │ ( O )( M ) opted in              [I'm in]   │ │                            │
│ └─────────────────────────────────────────────┘ │                            │
└─────────────────────────────────────────────────┴────────────────────────────┘
```

### Desktop interactions
- Map sticky right rail. Day summary + conflicts below the map.
- Conflict items link to the conflicting card (scroll + ring flash).
- Section "+ Propose stop" opens the Add Stop modal pre-filled with the proposed status.
- Hover on a stop card highlights its pin on the map (and vice versa).

---

## States

- **Empty day:** centered illustration + "Day 3 is wide open." [Add a stop] [Propose ideas]
- **All approved, no proposed:** "Nothing pending — you're locked and loaded for Day 3." Hide Proposed section header entirely.
- **All proposed, none approved yet:** Big info banner: "Day 3 is still being planned. Voting closes when threshold is hit (60%)." [Vote on all]
- **Closed-day warning** (place fetched as closed on this day): warning badge `Closed on Mondays` inline on card.
- **Travel-time conflict:** warning shown both on the source card and in the right-rail Conflicts panel.

---

## Notes for developer
- Day URL param keeps direct-link sharing working ("look at Day 3").
- Map preview uses Mapbox static image API (cheaper, faster) until user taps Expand → switches to interactive Mapbox GL.
- Conflict logic: compare `scheduled_at + duration_min` of one stop against next; rough travel time from place coords (haversine + 15min buffer). Cheap heuristic for MVP.
