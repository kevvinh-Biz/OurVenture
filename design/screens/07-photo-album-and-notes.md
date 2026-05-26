# Screen 07 — Photo Album & Notes

**Purpose:** Show all trip photos and member notes, attached to stops, with visibility controls. The memory layer — wedge proof per MVP success metric (≥1 photo per stop, ≥1 note per trip).

**Route:** `/trips/[tripId]/memories` with three view modes: All / By stop / Notes.

---

## Components
- View mode tabs (All | By stop | Notes)
- Filter row (member chips, visibility filter, rating filter for notes)
- Photo grid (masonry)
- Note cards (text + rating + tips)
- Photo upload entry (button + drag-drop on desktop)
- Visibility selector (Private / Group / Shared / Public)
- Lightbox for viewing single photo

---

## Mobile layout — All view

```
┌─────────────────────────────────────────┐
│ [◀] Memories                  [+ Add]   │
├─────────────────────────────────────────┤
│ [*All*] [By stop] [Notes]               │  tabs
├─────────────────────────────────────────┤
│ Filter: All members ▾ · Group+ ▾         │  filter chips
├─────────────────────────────────────────┤
│ ┌──────────┐  ┌──────────┐               │
│ │  [photo] │  │  [photo] │              │  2-col masonry
│ │          │  │          │              │  rounded-lg
│ │ ( O )    │  │ ( M )    │              │  uploader avatar bottom-left
│ │ Tsukiji  │  │ Sushi Dai│              │  stop name caption
│ │ 👁 group  │  │ 👁 group  │              │  visibility chip
│ └──────────┘  └──────────┘               │
│ ┌──────────┐  ┌──────────┐               │
│ │  [photo] │  │  [photo] │               │
│ │ taller   │  │          │              │  masonry honors ratio
│ │          │  │          │              │
│ │          │  │ ( T )    │              │
│ │ ( F )    │  │ Hotel    │              │
│ │ Fushimi  │  │ 👁 private│              │
│ │ 👁 shared │  │          │              │
│ └──────────┘  └──────────┘               │
│   ...                                    │
│                                          │
│              [+ FAB upload]              │
└─────────────────────────────────────────┘
```

---

## Mobile layout — By stop view

```
┌─────────────────────────────────────────┐
│ [◀] Memories                  [+ Add]   │
├─────────────────────────────────────────┤
│ [All] [*By stop*] [Notes]               │
├─────────────────────────────────────────┤
│ Day 3 · Fri Apr 14                       │  overline
│                                          │
│ ─── Tsukiji Outer Market (5 items) ───   │  h3 + count
│ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  scrollable row
│ │  [photo] │ │  [photo] │ │  [photo] │  │
│ └──────────┘ └──────────┘ └──────────┘  │
│ Notes (2):                               │
│ • Tess ★ must — "Best raw tuna of life." │  note line
│ • Mark ★ good — "Crowded but worth it."  │
│ [Add memory →]                            │
│                                          │
│ ─── Sushi Dai (3 items) ───              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ │ ...      │ │ ...      │ │ ...      │  │
│ └──────────┘ └──────────┘ └──────────┘  │
│ Notes (1):                               │
│ • Olivia ★ must — "Worth the wait."      │
│                                          │
│ ─── Hotel Granbell (1 item, private) ─── │
│ ...                                      │
└─────────────────────────────────────────┘
```

---

## Mobile layout — Notes view

```
┌─────────────────────────────────────────┐
│ [◀] Memories                  [+ Note]  │
├─────────────────────────────────────────┤
│ [All] [By stop] [*Notes*]               │
├─────────────────────────────────────────┤
│ Filter: All ratings ▾                    │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ ★ MUST   Tsukiji Outer Market        │ │  rating chip + stop link
│ │ ( T ) Tess · Day 3                   │ │
│ │ "Best raw tuna of my life. Get the   │ │  body
│ │  tuna rice bowl from the corner     │ │
│ │  stall — no line at 9 AM sharp."    │ │
│ │ Tips: arrive by 8:30                 │ │
│ │ Wait: 0 min                          │ │
│ │ 👁 group                              │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ★ GOOD   Sushi Dai                   │ │
│ │ ( O ) Olivia · Day 3                  │ │
│ │ "Worth the wait. Order the omakase." │ │
│ │ Wait: 45 min                          │ │
│ │ 👁 shared                              │ │
│ └─────────────────────────────────────┘ │
│ ...                                      │
└─────────────────────────────────────────┘
```

---

## Add photo / note flow (bottom sheet)

```
┌─────────────────────────────────────────┐
│ Add memory                       [×]    │
├─────────────────────────────────────────┤
│ Attach to:                               │
│ [ Tsukiji Outer Market — Day 3 ▾ ]      │  searchable select, pre-filled if from stop
│                                          │
│ ─── Photo ───                            │
│ ┌─────────────────────────────────────┐ │
│ │ Drag photos or tap to choose         │ │  drop zone, dashed border
│ │     [Camera icon]                    │ │
│ └─────────────────────────────────────┘ │
│ (preview thumbs once added, × remove)    │
│                                          │
│ Caption                                  │
│ [                                     ] │
│                                          │
│ ─── Note (optional) ───                  │
│ Rating                                   │
│ [★ Must] [Good] [Okay] [Skip]            │  4-button chip group
│ Tips                                     │
│ [                                     ] │
│ Wait time   [   ] min                    │
│ Best time   [   ]                        │
│ Note text                                │
│ [                                     ] │  textarea
│                                          │
│ ─── Who can see this? ───                │
│ ( ) Private — just me                    │
│ (●) Group — trip members                 │
│ ( ) Shared — group + people who copy     │
│ ( ) Public — anyone with the link        │  warning bg if selected
│ ⚠ Public removes location from photo     │  shown when Public chosen
├─────────────────────────────────────────┤
│ [Cancel]                       [Save]    │
└─────────────────────────────────────────┘
```

### Mobile interactions
- Photo upload: client-side resize to ~2000px max long edge (saves Supabase storage); EXIF strip happens server-side via sharp on upload.
- Visibility default is **Group** always — never Public by default. Picking Public shows a warning explaining what gets stripped.
- Lightbox swipe-down to dismiss, pinch to zoom, swipe left/right for next/prev.
- Note-only: leave photo zone empty, save creates a `stop_notes` row only.

---

## Desktop layout — All view

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ◀ Trips / Tokyo & Kyoto / Memories                          [+ Add memory]   │
├──────────────────────────────────────────────────────────────────────────────┤
│ [*All*] [By stop] [Notes]    Member: All ▾   Visibility: Group+ ▾            │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                              │  4-col masonry
│ │ [photo] │ │ [photo] │ │ [photo] │ │ [photo] │                              │
│ │ ( O )   │ │ ( M )   │ │ ( F )   │ │ ( T )   │                              │
│ │ Tsukiji │ │ Sushi   │ │ Fushimi │ │ Hotel   │                              │
│ │ 👁 group │ │ 👁 group │ │ 👁 shared│ │ 👁 priv  │                              │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                              │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                              │
│ │  ...    │ │ ...     │ │ ...     │ │ ...     │                              │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                              │
│                                                                              │
│ Drop photos anywhere on this page to upload      [zone hint, ghost border]   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Desktop interactions
- Drag-drop anywhere on the page triggers upload; overlay appears with "Drop to upload to [Stop selector]".
- Click photo → lightbox modal (centered, dark backdrop, caption + visibility + uploader + delete-if-yours).

---

## States

- **Empty:** big card "First memory goes here. Tap upload to start." with Camera icon, single CTA.
- **No photos in stop (By stop view):** stop section shows "No memories yet — [Add one]" inline.
- **Private filtered out:** when viewing "Group+" filter, private photos are hidden with caption "3 private items not shown" linking to a private-only view (your own).
- **Upload in progress:** thumbnail shows with overlay progress bar.
- **Upload failed:** error tint thumb + retry button.

---

## Notes for developer
- Storage path: `trips/{tripId}/photos/{photoId}.{ext}`, thumbnail at `…/_thumb.webp`.
- Server-side processing pipeline (sharp): strip EXIF → generate 400px thumb (webp, q=80) → store full-resolution stripped-EXIF original.
- RLS on `photos` table: select where (`uploaded_by=auth.uid()`) OR (`visibility IN ('group','shared','public')` AND user is `trip_member` active) OR (`visibility='public'`).
- Masonry layout: CSS `column-count` works fine without a library for MVP. Alternatively `react-photo-album`.
- Lazy-load images with `loading="lazy"` + `next/image` if compatible with Supabase storage URLs.
- Notes don't have storage cost concerns; primary indexing on `stop_id` + `created_at desc`.
