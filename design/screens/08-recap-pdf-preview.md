# Screen 08 — Recap PDF Preview

**Purpose:** Pre-export preview of the trip recap PDF, with toggleable sections. After export, downloads or shows a share link. This is the shareable artifact — directly tied to a wedge success metric (≥30% of completed trips export).

**Route:** `/trips/[tripId]/recap` (and a modal-style "Export Recap" entry from dashboard).

The "PDF" rendered in the browser preview mirrors the final react-pdf output 1:1 so users feel confident before exporting.

---

## Components
- Options panel (which sections to include, cover photo selector)
- Live preview (page-by-page scroll of the would-be PDF)
- Export controls (Download PDF, Copy share link)
- Each page in preview is a constrained-width card (`max-w-2xl`, light shadow, white surface, page break implied by gap-12)

---

## PDF layout pages (used both in preview and final output)

### Page 1 — Cover

```
┌─────────────────────────────────────────┐
│                                         │
│         [cover photo full-bleed]        │  user-chosen, 16:9 area top
│                                         │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│      TOKYO & KYOTO WITH THE CREW        │  display 36px serif/sans bold, centered
│           Apr 12 – Apr 22 · 11 days     │  body-lg neutral-700
│                                         │
│       ( O )( M )( T )( F )(+3)          │  avatar group lg centered
│       7 travelers                       │  caption
│                                         │
│                  • • •                  │  divider dots
│                                         │
│       "Where to first?"                 │  italic body, neutral-500
│       — Olivia, the planner             │
│                                         │
│                                         │
│             OurVenture                  │  small logo bottom
└─────────────────────────────────────────┘
```

### Page 2 — At a glance

```
┌─────────────────────────────────────────┐
│ AT A GLANCE                       Day 0 │  overline + page index
├─────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐         │  stats grid 2x2
│ │  11 days    │ │  24 stops   │         │  h1 + caption each
│ │  travelled  │ │  visited    │         │
│ └─────────────┘ └─────────────┘         │
│ ┌─────────────┐ ┌─────────────┐         │
│ │  18 photos  │ │  12 notes   │         │
│ │  captured   │ │  shared     │         │
│ └─────────────┘ └─────────────┘         │
│                                         │
│ ROUTE                                    │  overline
│ [   static Mapbox image of full route   ]│  16:9 area, rendered at export time
│                                         │
│ TRAVELERS                                │
│ ( O ) Olivia Chen   organizer            │  list row 24-row
│ ( M ) Mark Davis                         │
│ ( T ) Tess Park                          │
│ ( F ) Fiona Reilly                       │
│ ( J ) Joey Lin                           │
│ ( A ) Adi Patel                          │
│ ( P ) Pat Singh                          │
└─────────────────────────────────────────┘
```

### Page 3+ — Day-by-day (one or more pages per day)

```
┌─────────────────────────────────────────┐
│ DAY 3 · FRI APR 14 · KYOTO        Page 5│  h2 + page index
├─────────────────────────────────────────┤
│ ─── 9:00 AM ───                          │
│ Tsukiji Outer Market                h3   │
│ Activity · ~2h · free                    │
│ ┌──────────┐ ┌──────────┐               │  photo strip, 2 photos this stop
│ │  [photo] │ │  [photo] │               │
│ └──────────┘ └──────────┘               │
│ Note (Tess): "Best raw tuna of my life.  │
│  Get the tuna rice bowl from the         │
│  corner stall."                          │
│ Tips: arrive by 8:30                     │
│                                          │
│ ─── 12:30 PM ───                         │
│ Sushi Dai · Reservation                  │
│ ¥21,000 / ~$140 · paid by Olivia         │
│ Conf #SD-93421                           │
│ Note (Olivia): "Worth the wait."         │
│                                          │
│ ─── 3:00 PM ───                          │
│ Hotel Granbell Kyoto · Reservation       │
│ ¥48,000 / ~$320                          │
│                                          │
│ ─── 7:00 PM ───                          │
│ Fushimi Inari Night Walk                 │
│ Activity · ~1.5h                         │
│ ┌──────────┐                             │
│ │  [photo] │                             │
│ └──────────┘                             │
└─────────────────────────────────────────┘
```

### Penultimate page — Cost summary

```
┌─────────────────────────────────────────┐
│ COST SUMMARY                      Page X│
├─────────────────────────────────────────┤
│ By category                              │
│ Lodging          ¥186,000  ~$1,240  67% │  table-ish, tabular nums
│ Food              ¥48,000   ~$320   17% │
│ Transit           ¥22,000   ~$147    8% │
│ Activities        ¥18,000   ~$120    6% │
│ Misc               ¥6,000    ~$40    2% │
│ ─────────────────────────────────       │
│ Total            ¥280,000  ~$1,867 100% │  bold, border-t
│                                          │
│ Per person                               │
│ ( O ) Olivia            ~$267            │
│ ( M ) Mark              ~$267            │
│ ( T ) Tess              ~$267            │
│ ( F ) Fiona             ~$267            │
│ ( J ) Joey              ~$267            │
│ ( A ) Adi               ~$267            │
│ ( P ) Pat               ~$265            │  rounding diff explained in fineprint
│                                          │
│ Rate as of Apr 12, 2026 (cached daily)  │  caption
└─────────────────────────────────────────┘
```

### Last page — Closing

```
┌─────────────────────────────────────────┐
│                                         │
│             Until next venture          │  display centered
│                                         │
│         ( O )( M )( T )( F )(+3)        │
│                                         │
│        Made with OurVenture             │  caption
│        ourventure.app                   │  link
│                                         │
└─────────────────────────────────────────┘
```

---

## Mobile preview screen

```
┌─────────────────────────────────────────┐
│ [◀] Recap                       [···]   │
├─────────────────────────────────────────┤
│ ─── Options ─── [collapse ▾]            │
│ [ ] Photos (group + shared only)        │
│ [✓] Cost summary                         │
│ [✓] Route map                            │
│ [ ] Private notes excluded by default    │  caption + checkbox
│ Cover photo: [Hotel pool — Olivia ▾]    │  thumbnail select
├─────────────────────────────────────────┤
│ Preview                                  │
│ ┌─────────────────────────────────────┐ │
│ │  [page 1 — cover at 60% scale]      │ │  miniaturized previews
│ │                                     │ │  scrollable
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │  [page 2 — at a glance]             │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │  [page 3+ — days...]                │ │
│ └─────────────────────────────────────┘ │
│ ...                                     │
├─────────────────────────────────────────┤
│                       [Download PDF]    │  accent lg sticky bottom
│                       [Copy share link] │  outline
└─────────────────────────────────────────┘
```

---

## Desktop preview screen

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ◀ Trips / Tokyo & Kyoto / Recap                              [Share] [Print] │
├─────────────────────────────────┬────────────────────────────────────────────┤
│ OPTIONS                          │ PREVIEW                                    │
│                                  │                                            │
│ Include in recap                 │ ┌──────────────────────────────────────┐   │
│ [✓] Cover photo                  │ │                                      │   │
│ [✓] At a glance + route map      │ │     [Page 1 — Cover]                │   │
│ [✓] Day-by-day                   │ │                                      │   │
│ [✓] Photos                       │ └──────────────────────────────────────┘   │
│   ( ) all photos                 │                                            │
│   (●) group + shared only        │ ┌──────────────────────────────────────┐   │
│   ( ) only photos I uploaded     │ │     [Page 2 — At a glance]          │   │
│ [✓] Notes                        │ │                                      │   │
│   [ ] Include private notes      │ └──────────────────────────────────────┘   │
│ [✓] Cost summary                 │                                            │
│ [✓] Per-person costs             │ ┌──────────────────────────────────────┐   │
│ [✓] Member list                  │ │     [Page 3 — Day 1]                │   │
│                                  │ │                                      │   │
│ Cover photo                      │ └──────────────────────────────────────┘   │
│ [Hotel pool — Olivia ▾]          │                                            │
│                                  │ ... (scrollable)                          │
│ Hide me from exports             │                                            │
│ [ ] Mark · [ ] Tess · [ ] Adi    │                                            │
│ (per privacy preference)         │                                            │
│                                  │                                            │
│ ─── Export ───                   │                                            │
│ [Download PDF]   accent lg       │                                            │
│ [Copy share link] outline        │                                            │
│ [Email to group]  ghost          │                                            │
│                                  │                                            │
│ File size estimate: 4.2 MB       │                                            │
└──────────────────────────────────┴────────────────────────────────────────────┘
```

### Desktop interactions
- Options panel sticky-left (4 cols), preview scrolls right (8 cols).
- Toggling an option re-renders preview live (debounce 300ms).
- "Email to group" sends Resend templated email with attached PDF.
- "Hide me from exports" honors `users.settings.hide_in_exports` — anyone who set this is not shown in member list/avatars.

---

## States

- **Mid-trip recap (before end_date):** banner at top — "Trip isn't over yet — you'll get better recaps after the trip ends. Continue?" with Continue / Cancel.
- **No photos:** Photos toggle disabled with caption "No group-visible photos yet."
- **Generating:** when Download tapped, button shows "Generating…" with Loader2; full-screen non-blocking loader optional. On complete, browser download fires + success toast "Recap exported · share link copied."
- **Generation failed:** error toast + "Try again" — common cause: a single large photo. Catch + offer to disable photos.
- **Share link visibility:** show link with a small `Copy` button + caption "Anyone with this link can view the recap. [Manage]" linking to settings.

---

## Notes for developer
- Use react-pdf for PDF generation server-side via API route (avoids client-side font/image issues).
- Render the same data with a `<RecapPreview />` React component for the web preview; share data props with the PDF renderer for parity.
- Pre-fetch all photos at thumbnail quality for preview; full-res for PDF.
- Route map: server-rendered Mapbox static image at export time, embedded in PDF.
- Generation should be backgroundable for big trips — if >50 photos, queue and email when done.
- Share link backed by a signed URL on Supabase storage; expires in 90 days; revocable from settings.
