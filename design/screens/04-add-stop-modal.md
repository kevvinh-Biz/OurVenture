# Screen 04 — Add Stop Modal

**Purpose:** 3-step flow to add an itinerary stop. Step 1 search Google Places. Step 2 review selection + place metadata. Step 3 set time/cost/notes/visibility and submit.

**Route:** Triggered from any "Add stop" CTA (Dashboard, Itinerary day view, Timeline) — `<ResponsiveModal>` (bottom sheet mobile, centered dialog desktop).

---

## Components
- Stepper at top (`1 · 2 · 3` with labels Search / Confirm / Details)
- Step 1: Search input + result list
- Step 2: Selected place preview card + back/forward
- Step 3: Form (date/time, duration, cost, notes, optional toggle)
- Sticky footer: Back / Continue (or Save)

---

## Mobile layout — Step 1 (Search)

```
┌─────────────────────────────────────────┐
│ [drag handle]                           │  bottom sheet handle
├─────────────────────────────────────────┤
│ Add stop · Day 3, Apr 14         [×]    │  h3 + close
├─────────────────────────────────────────┤
│ ●━━━━━○━━━━━○   Search · Confirm · Detail│  stepper
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 🔍 Search a place...                │ │  input h-12, autofocus
│ └─────────────────────────────────────┘ │
│                                         │
│ Recent in Tokyo                          │  caption neutral-500
│ ┌─────────────────────────────────────┐ │
│ │ [icon] Tsukiji Outer Market          │ │  result row, h-14
│ │        Tsukiji 4-chome, Chuo, Tokyo  │ │  caption tertiary
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [icon] Sushi Dai                     │ │
│ │        Toyosu Market, Tokyo          │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [icon] teamLab Planets               │ │
│ │        Toyosu, Tokyo                 │ │
│ └─────────────────────────────────────┘ │
│ ...                                     │
│                                         │
│ Can't find it? [Add manually →]          │  link
├─────────────────────────────────────────┤
│ [Cancel]                  [Continue ▶]  │  sticky footer — disabled until select
└─────────────────────────────────────────┘
```

---

## Mobile layout — Step 2 (Confirm)

```
┌─────────────────────────────────────────┐
│ [drag handle]                           │
├─────────────────────────────────────────┤
│ Add stop · Day 3, Apr 14         [×]    │
├─────────────────────────────────────────┤
│ ●━━━━━●━━━━━○   Search · Confirm · Detail│  step 2 active
├─────────────────────────────────────────┤
│ [   place photo  16:9   ]                │  google place photo
│                                          │
│ Tsukiji Outer Market               h3    │
│ Tsukiji 4-chome, Chuo, Tokyo       body-sm
│                                          │
│ ★ 4.6 · ¥¥ · Market                      │  meta from Places API
│                                          │
│ Today's hours: 5:00 AM – 2:00 PM         │
│ ⚠ Closes Sundays                         │  warning badge
│                                          │
│ [Open in Google Maps ↗]                  │  link button outline
│                                          │
│ Not the right place?  [← Search again]   │  link
├─────────────────────────────────────────┤
│ [◀ Back]                  [Continue ▶]  │
└─────────────────────────────────────────┘
```

---

## Mobile layout — Step 3 (Details)

```
┌─────────────────────────────────────────┐
│ [drag handle]                           │
├─────────────────────────────────────────┤
│ Add stop · Day 3, Apr 14         [×]    │
├─────────────────────────────────────────┤
│ ●━━━━━●━━━━━●   Search · Confirm · Detail│
├─────────────────────────────────────────┤
│ [thumb 48×48] Tsukiji Outer Market       │  compact context strip
├─────────────────────────────────────────┤
│ Start time *                             │  label
│ [📅 Fri Apr 14] [⏰ 09:00 AM]            │  date + time, 2-col
│                                          │
│ Duration                                 │
│ [ 2 hours ▾ ]                            │  select (15m, 30m, 1h, 1.5h, 2h, half, full)
│                                          │
│ Estimated cost per person                │
│ [ ¥ ▾ ] [        2,000       ]   ~$13    │  currency + amount, live convert
│                                          │
│ Notes                                    │
│ ┌─────────────────────────────────────┐ │
│ │ Sushi breakfast, get there early.   │ │  textarea
│ └─────────────────────────────────────┘ │
│                                          │
│ Status                                   │
│ ( ) Approved (organizer override)       │  radio — only visible to organizer
│ (●) Propose for group vote               │  default
│                                          │
│ [ ] Make optional (opt-in only)          │  checkbox
│                                          │
│ ⚠ Heads up: Tsukiji Outer Market is closed Sundays.   │  inline warning bg
│ ⚠ Travel time from prior stop ~25min.                  │
├─────────────────────────────────────────┤
│ [◀ Back]                       [Save]    │  Save = accent primary
└─────────────────────────────────────────┘
```

### Mobile interactions
- Search step: debounced Places API call, list updates in place. Tap to select → auto-advance to step 2.
- Step 2 → tap Continue (or just swipe to step 3 with form pre-loaded).
- Date defaults to the currently-viewed day. Time defaults to the next round hour, or after the latest existing stop.
- Save closes sheet, shows toast "Tsukiji Outer Market proposed — group will be notified", scrolls list to new item.

---

## Desktop layout

Same content, centered dialog `max-w-2xl`. Steps 1+2 can split into 2-col on `lg+` (search left, selected preview right) — optional polish. MVP: keep stepped for simplicity.

```
┌────────────────────────────────────────────────────────────┐
│ Add stop · Day 3, Apr 14                          [×]      │
├────────────────────────────────────────────────────────────┤
│ ●━━━━━●━━━━━●   Search · Confirm · Detail                  │
├────────────────────────────────────────────────────────────┤
│ [thumb 56×56] Tsukiji Outer Market · 5AM–2PM · ¥¥          │  context strip
├────────────────────────────────────────────────────────────┤
│ ┌─────────── form 2-col grid ───────────────────────────┐  │
│ │ Start time *           Duration                       │  │
│ │ [Fri Apr 14] [09:00]   [2 hours ▾]                    │  │
│ │                                                       │  │
│ │ Cost per person                                       │  │
│ │ [¥ ▾] [ 2,000 ]  ~$13                                 │  │
│ │                                                       │  │
│ │ Notes (full width)                                    │  │
│ │ [    textarea                                       ] │  │
│ │                                                       │  │
│ │ ( ) Approved   (●) Propose for vote                   │  │
│ │ [ ] Optional opt-in                                   │  │
│ │                                                       │  │
│ │ ⚠ closed Sundays                                      │  │
│ └───────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│ [◀ Back]                                [Cancel] [Save]    │
└────────────────────────────────────────────────────────────┘
```

---

## States

- **Search no results:** "No matches. Try a different name or [add manually]."
- **Place hours unavailable from Places API:** show "Hours not available" + soft warning.
- **Time conflicts with existing stop:** warning banner in step 3 with name + time of conflicting stop.
- **Closed on the chosen day:** strong warning + force confirmation: "Tsukiji Outer Market is closed on Apr 14. Add anyway?"
- **Offline / Places API failure:** banner "Search unavailable — try again or [add manually]."
- **Manual add (no Place ID):** skips step 2; step 3 adds title + address as plain text fields.
- **Editing existing stop:** same sheet, pre-filled, step 1 hidden, header "Edit stop".

---

## Notes for developer
- Google Places "Autocomplete (New)" — restrict bias to trip destination bounding box if available.
- Cache Place details (`google_place_id`) into `place_hours_cache` after fetch — don't re-call for the same place.
- EXIF/photo from Places API is licensed; show via Places SDK photo URL with attribution badge bottom-right of image.
- Optimistic create on Save: show the new card in the list before server roundtrip confirms; show toast on success/error.
