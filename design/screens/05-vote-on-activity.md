# Screen 05 — Vote on Activity

**Purpose:** A focused decision moment. Member sees the stop in context, casts their vote, sees who else voted what, and watches the threshold progress live. This is the heart of the wedge.

**Route:** Stop detail page `/trips/[tripId]/stops/[stopId]` OR a modal-equivalent triggered from notification, dashboard, day view, or proposed sidebar.

We design the **stop detail screen** here — the vote modal is a compressed variant of the same content.

---

## Components
- Place hero (photo + name + address)
- Vote action: three big choice buttons
- Threshold progress bar with status
- Voter breakdown (Yes / Maybe / No columns with avatars)
- Stop metadata (time, cost, hours)
- Notes / comments (existing notes from members)
- Photos attached (if any)
- Organizer-only actions (force approve, mark skipped)

---

## Mobile layout (stop detail / vote)

```
┌─────────────────────────────────────────┐
│ [◀]  Tsukiji breakfast counter   [···]  │  app bar
├─────────────────────────────────────────┤
│ [   place photo  16:9   ]                │  hero photo from Places
│                                          │
│ Tsukiji breakfast counter           h2   │
│ Tsukiji 4-chome · Tokyo             body-sm
│                                          │
│ [PROPOSED]  proposed by Mark · 2h ago    │  badge info + caption
│ Day 3, Fri Apr 14 · 8:00 AM · ~1h        │
│ ¥2,000 / ~$13 per person                 │
│                                          │
│ Today's hours: 5:00 AM – 10:00 AM ✓      │
│                                          │
│ ─── Your vote ───                        │  separator + overline
│ ┌─────────────────────────────────────┐ │
│ │ ✓ Yes, I'm in                       │ │  big button success-500 white text
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ? Maybe                             │ │  warning-100 bg, warning-700 text
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ✗ No, skip                          │ │  error-100 bg, error-700 text
│ └─────────────────────────────────────┘ │
│                                          │
│ ─── Vote results ───                     │
│ ━━━━━━━━━━━━━━○○ 4/7 yes (need 5)        │  progress info color until met
│ Threshold: 60% (5 of 7 active travelers) │  caption
│                                          │
│ Yes  ✓  ( O )( T )( F )(+1)              │  3 columns: success bg
│        Olivia, Tess, Fiona, Joey         │  spelled out below avatars
│ Maybe ?  ( M )                            │  warning bg
│        Mark                              │
│ No  ✗   —                                │  empty: "No one yet"
│                                          │
│ ─── Notes from the group ───             │
│ ( T ) Tess · 1h ago                       │  avatar + name + time
│ "Heard the line gets long after 9. Get   │
│  there by 8 sharp."                      │
│                                          │
│ ( O ) Olivia · 30m ago                    │
│ "Confirmed it's open Fri."               │
│                                          │
│ [+ Add a note]                           │
│                                          │
│ ─── Organizer actions ───                │  visible only if role=organizer
│ [Approve anyway]   [Reject]              │
└─────────────────────────────────────────┘
```

### Mobile interactions
- Vote buttons: tap to choose, ring-2 around chosen, others fade to opacity-70. Tap again to change (allowed). Optimistic update: progress bar animates immediately.
- Progress bar color shifts info → success at threshold; status badge above flips from PROPOSED → APPROVED with a small `Sparkles` toast and `aria-live` announcement.
- Notes area: simple textarea + Post button, posts to `stop_notes` with visibility=group.
- "···" menu: copy link, edit (if author), delete (if author or organizer).

---

## Desktop layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ◀ Trips / Tokyo & Kyoto / Day 3 / Tsukiji breakfast counter      [···]    │
├────────────────────────────────────────────┬───────────────────────────────┤
│  [place photo  16:9]                       │  ┌──── YOUR VOTE ────────┐   │
│                                            │  │ ✓ Yes, I'm in          │   │
│  Tsukiji breakfast counter           h1    │  │ ? Maybe                │   │
│  Tsukiji 4-chome · Tokyo                   │  │ ✗ No, skip             │   │
│                                            │  │   (current: not voted) │   │
│  [PROPOSED] · by Mark · 2h ago             │  └────────────────────────┘   │
│  Day 3, Fri Apr 14 · 8:00 AM · ~1h         │                                │
│  ¥2,000 / ~$13 per person                  │  ┌──── PROGRESS ─────────┐   │
│  Today's hours: 5–10 AM ✓                  │  │ ━━━━━━━━━━━━━━○○       │   │
│                                            │  │ 4 of 7 yes — need 5    │   │
│  ─── Notes from the group ───              │  │ Threshold 60%          │   │
│  ( T ) Tess  ·  1h ago                     │  └────────────────────────┘   │
│  "Heard the line gets long after 9..."     │                                │
│                                            │  ┌──── WHO VOTED ────────┐   │
│  ( O ) Olivia ·  30m ago                   │  │ Yes ✓                   │   │
│  "Confirmed it's open Fri."                │  │  ( O )( T )( F )( J )   │   │
│                                            │  │  Olivia, Tess, Fiona,   │   │
│  [+ Add a note]                            │  │  Joey                   │   │
│                                            │  │                         │   │
│  ─── Photos ───                            │  │ Maybe ?                  │   │
│  (none yet — [Add memory])                 │  │  ( M )  Mark            │   │
│                                            │  │                         │   │
│  ─── Organizer actions ───                 │  │ No ✗                     │   │
│  [Approve anyway]   [Reject]               │  │  No one yet             │   │
│                                            │  │                         │   │
│                                            │  │ Not yet voted (2)        │   │
│                                            │  │  ( A )  ( P )           │   │
│                                            │  │  Adi, Pat               │   │
│                                            │  │  [Nudge]                │   │
│                                            │  └─────────────────────────┘   │
└────────────────────────────────────────────┴───────────────────────────────┘
```

### Desktop interactions
- 2-col split: place + notes on left (8 cols), vote panel sticky on right (4 cols).
- Right panel always reachable while scrolling notes.
- "Nudge" sends a Resend email + in-app notification to the named members.
- Organizer's "Approve anyway" requires confirm dialog: "Skip the vote and approve now? Members will be notified."

---

## States

- **Already voted:** chosen button stays pressed with `aria-pressed=true`, others fade. Inline caption under buttons: "You voted yes 2h ago — [change]"
- **Threshold met, transition:** badge flips, progress bar fills full success, micro `Sparkles` accent, toast "Approved! It's now on your timeline." On the right panel show "APPROVED · 5 of 7 yes" with green check.
- **All voted, no threshold:** status flips to REJECTED if `yes/total < threshold` AND `no votes ≥ remaining-needed`. Show "Rejected — only 3 of 7 said yes." Organizer can still override.
- **Optional stop:** vote UI replaced with "Opt in" toggle, no threshold concept. Caption "Optional means: only those who opt in are expected."
- **Solo trip (only 1 member):** vote UI hidden; auto-approves; show "You're flying solo — your stops auto-approve."
- **Viewer role:** vote buttons disabled; tooltip "View-only access — voting is for active travelers."

---

## Notes for developer
- Realtime channel on `votes WHERE stop_id=$1` to live-update other clients' progress + voter avatars.
- Status flip server-side via DB function or server action; client just listens and re-renders.
- Threshold math: `yes_count / active_members_count >= trip.vote_threshold / 100`.
- Rejected status: `yes_count + remaining_unvoted_members < required_count`.
- The vote modal (when triggered from elsewhere) reuses ~70% of this UI — extract `<VotePanel />` component for reuse.
