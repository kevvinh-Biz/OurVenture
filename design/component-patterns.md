# OurVenture — Component Patterns

**Version:** 1.0 MVP
**Foundation:** shadcn/ui primitives extended with OurVenture variants.

All sizes follow the spacing scale (`design-system.md §3`). All colors are tokens, not hex. Tap targets ≥44px on mobile.

---

## 1. Button

shadcn `Button` with these variants and sizes.

### Variants
| Variant | Use | Style |
| --- | --- | --- |
| `primary` | Page primary action (Save, Create, Settle Up) | `bg-primary-500 text-inverse hover:bg-primary-600` |
| `accent` | Hero/wedge action (Approve, Export Recap, Mark Paid) | `bg-accent-500 text-inverse hover:bg-accent-600` |
| `secondary` | Alternative action (Cancel, Edit) | `bg-neutral-100 text-neutral-900 border border-neutral-200 hover:bg-neutral-200` |
| `outline` | Tertiary or low-emphasis | `bg-transparent border border-neutral-300 text-neutral-900 hover:bg-neutral-50` |
| `ghost` | In toolbars, table rows, dropdown triggers | `bg-transparent hover:bg-neutral-100` |
| `destructive` | Delete trip, remove member, cancel reservation | `bg-error-500 text-inverse hover:bg-error-700` |
| `link` | Inline action that reads as text | `text-primary-600 underline-offset-4 hover:underline` |

### Sizes
| Size | Height | Padding x | Font | Use |
| --- | --- | --- | --- | --- |
| `sm` | 32 | 12 | body-sm | dense tables, inline edits |
| `md` (default) | 40 | 16 | body | most buttons |
| `lg` | 48 | 20 | body | mobile primary CTA, hero actions |
| `icon` | 40×40 | — | — | icon-only (toolbar) — needs `aria-label` |
| `icon-sm` | 32×32 | — | — | dense rows |
| `fab` | 56×56 | — | — | mobile floating add (Plus, accent) |

### States
Resting → Hover (slightly darker bg, `shadow-xs` on primary/accent) → Active (`scale-[0.98]`, `instant` duration) → Focus-visible (`shadow-focus-ring`, 3px primary tint) → Disabled (`opacity-60 cursor-not-allowed`) → Loading (replace icon with `Loader2 animate-spin`, retain width).

### Icon usage
Lead icon + label = `<Icon size=18 /> + 8px gap + label`. Trailing icon for "more" or external link.

---

## 2. Card patterns

All cards: `bg-surface rounded-lg border border-default p-4 md:p-6 shadow-sm`. Hover (only if clickable): `shadow-md transition-shadow duration-fast`.

### 2.1 Trip card (used on "My Trips")
```
┌─────────────────────────────────────┐
│ [cover image 16:9, rounded-t-lg]    │
│   ┌────────┐                        │
│   │ Apr 12 │  status pill           │
│   └────────┘                        │
├─────────────────────────────────────┤
│ Tokyo & Kyoto with the Crew   h3   │
│ Apr 12 – Apr 22 · 7 travelers       │
│ [avatar group ●●●●●+3]              │
│                                     │
│ 4 reservations · 2 pending votes    │  ← caption neutral-500
└─────────────────────────────────────┘
```
- Cover photo if set, else gradient placeholder (`from-primary-100 to-accent-100`) with `Compass` icon centered.
- Status pill: `upcoming` (info), `live` (accent), `past` (neutral).

### 2.2 Reservation card (Trip Timeline hero list)
```
┌─────────────────────────────────────────────────────┐
│ ●─time rail─●                                       │
│             ┌─────────────────────────────────────┐ │
│  Fri Apr 14 │ [Ticket icon] Hotel Granbell Kyoto  │ │
│  3:00 PM    │ status: 5/7 paid · 7/7 ticketed     │ │
│             │ ────────●●●●●●●○ progress           │ │
│             │ ¥48,000 / ~$320 · paid by Olivia    │ │
│             │ [avatar group of included members]  │ │
│             │ [More] [View confirmation]          │ │
│             └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```
- Left rail with time dot anchors the chronological feel.
- Two progress bars stacked or combined: tickets + payments.
- Status colors: full success-500; partial warning-500; none info-500.

### 2.3 Expense card (Expenses list)
```
┌──────────────────────────────────────────┐
│ [Receipt icon]  Sushi dinner — Tsukiji   │
│  Apr 14 · Olivia paid · split equal × 7  │
│  ¥21,000  ~$140                          │
│  badge: you owe $20  |  you are owed $0  │
└──────────────────────────────────────────┘
```
- Money right-aligned, `tabular-nums`.
- Personal-balance badge (your-perspective) at right — error tint if you owe, success if you're owed, neutral if settled.

### 2.4 Stop card (Day view list item)
```
┌────────────────────────────────────────────────────┐
│ [thumb 56×56]  Fushimi Inari Shrine    9:00–11:30  │
│                ★ must-visit · 3 photos · 1 note     │
│                votes: ✓5 ✗0 ?1 — APPROVED          │
│                est ¥0 · free                        │
└────────────────────────────────────────────────────┘
```
- Status corner ribbon or left border: 4px solid color (info=proposed, success=approved, error=rejected, neutral=skipped).
- Tap → stop detail.

### 2.5 Photo card (Album / stop attachments)
```
┌──────────────┐
│              │
│   [photo]    │  16:9 ratio, object-cover
│              │
│ ────────────-│
│ [avatar] Mark│
│ "Best view"  │  caption truncate-2
│ 👁 group     │
└──────────────┘
```
- Grid masonry on desktop (2-col mobile, 3-col tablet, 4-col desktop).
- Visibility icon top-right corner overlay.

---

## 3. List patterns

Base list row: 44–56px tall (mobile thumb), 16px x-padding, divider `border-b border-default` between rows. Use shadcn `<Separator />` or implicit divider classes.

### 3.1 Member list
`avatar(32) | name + role badge | trailing menu`. Organizer badge = accent outline.

### 3.2 Vote list (who voted what on a stop)
Three sections horizontal: ✓ Yes (success), ✗ No (error), ? Maybe (warning). Avatars stacked per section with count. Empty section shows muted "No votes".

### 3.3 Expense list
Scannable row: `[icon] description / date | amount | your-balance-pill`. Right-align money. Sticky day header (`Apr 14`).

### 3.4 Checklist
Each row: `Checkbox | item title | optional due date · category chip | trailing menu`.
Checked state: line-through `text-tertiary`, checkbox `bg-success-500`. Group items show small "group" icon prefix.

---

## 4. Form patterns

### 4.1 Input
```
[Label (h4, neutral-900)]
[Input — h-10, rounded-lg, border-default, px-3]
[Helper text caption neutral-500]   |   [Error text caption error-700]
```
Focus: `border-primary-500 + shadow-focus-ring`. Error: `border-error-500 + ring red-200/40`.

### 4.2 Textarea
Min 3 rows, max-height with scroll. Auto-grow optional. Same border/focus as input.

### 4.3 Select (shadcn Select)
Trigger looks like input. Content panel `bg-surface shadow-lg rounded-lg`, items `px-3 h-9 hover:bg-neutral-100`, selected check on right.

### 4.4 Multi-select (combobox)
Chips inside the input box, removable with `×`. Use shadcn Command for search.

### 4.5 Date / time picker
- **Mobile:** native `<input type="datetime-local">` for speed (acceptable for MVP).
- **Desktop:** shadcn `Calendar` + `Popover` for date; `Select` pair for time.
- Always echo timezone if non-local: caption "Times shown in trip timezone (JST)".

### 4.6 File upload
- Drag-drop zone: dashed border `border-neutral-300`, hover `border-primary-500 bg-primary-50`.
- Preview row per file: `[icon] filename | size | × remove`.
- Photo upload shows thumbnail, progress bar overlay during upload.
- Accepts: images (jpg, png, heic, webp), PDF for reservation attachments.

### 4.7 Form layout
- Single column on mobile.
- 2-column at `md:` for related short fields (date + time, currency + amount).
- Buttons row sticky-bottom on mobile, right-aligned on desktop.
- Required marker: `*` after label in `text-error-500`.

---

## 5. Modal / Dialog / Bottom-sheet patterns

**Responsive rule:** dialogs render as **bottom sheets** on mobile (`max-md`) and **centered dialogs** on `md+`. Use shadcn `Dialog` + a `<Sheet>` swap via responsive variants, or a custom `<ResponsiveModal>` wrapper.

### 5.1 Add Stop (bottom sheet on mobile)
Steps: search → select place → fill time/cost/notes → submit. Stepper at top (`1 · 2 · 3`).
Mobile: full-height sheet, sticky CTA bottom. Desktop: 560px wide dialog, sticky CTA bottom.

### 5.2 Vote modal
Triggered from stop detail or notification. Shows place context (thumb, name) + 3 large vote buttons stacked on mobile, side-by-side on desktop. Below: live "X of Y voted yes — threshold 60%".

### 5.3 Add expense
Fields: amount + currency selector | category | description | paid-by (member select) | split-type tabs (Equal / Shares / Custom) | participants checkbox list. Show calculated split preview before submit.

### 5.4 Settle up
Read-only of recommended transactions ("Mark → Olivia $42"), each with `Mark as paid` button. Bulk "Mark all paid" optional.

### 5.5 General rules
- Max width: `sm` 400 / `md` 560 / `lg` 720.
- Sheet on mobile uses `shadow-xl`, drag-handle at top (4px×40 pill `bg-neutral-300`).
- Close icon top-right, `aria-label="Close"`. ESC closes. Backdrop click closes unless form dirty (then confirm).
- Focus trap on open, return focus to trigger on close.

---

## 6. Empty states

Pattern: centered, max-w-sm, 48px–32px icon (neutral-400 stroke), `h3` headline (neutral-700), body line (neutral-500), one primary CTA.

| Surface | Icon | Headline | Body | CTA |
| --- | --- | --- | --- | --- |
| No trips | `Compass` | "Where to first?" | "Create a trip or join one with an invite link." | "Create trip" (primary) + "Join with code" (outline) |
| No stops on a day | `MapPin` | "Nothing planned for Day 3 yet." | "Add a place to explore." | "Add stop" |
| No expenses | `Receipt` | "All quiet on the wallet." | "Log shared expenses to keep the math fair." | "Log expense" |
| No photos | `Camera` | "First memory goes here." | "Snap or upload to remember this stop." | "Upload photo" |
| No reservations | `Ticket` | "No bookings yet." | "Add your hotel, flight, or tickets." | "Add reservation" |

Decoration: optional small illustration (line-art compass/route, accent-200 stroke). Keep below the icon line.

---

## 7. Loading + skeleton

### 7.1 Skeleton patterns
- Use `bg-neutral-100 animate-pulse rounded-md`.
- Card skeleton: header bar, 2 lines of text, optional avatar circle.
- Avoid full-page spinners — prefer skeletons that mirror the eventual layout.
- Spinner only inside buttons (Loader2) and during ≤300ms transitions.

### 7.2 Skeleton examples
**Trip card skeleton:**
```
[████████████████████████]   cover
[██████████░░░░]              title
[████░░░░░░]  [● ● ●]         meta + avatars
```

### 7.3 Progress
- Linear: 4px tall, `bg-neutral-200` track, `bg-primary-500` fill. Use for upload, threshold.
- For "X of Y" use linear with text right of bar: `5/7 paid`.

---

## 8. Toast / notification

shadcn `Sonner` toaster. Positions: `top-center` on mobile (avoid keyboard collisions less common), `bottom-right` desktop.

| Type | Color strip / icon | Use |
| --- | --- | --- |
| success | success-500 / `CheckCircle2` | "Vote recorded" |
| error | error-500 / `AlertTriangle` | "Couldn't save — try again" |
| info | info-500 / `Info` | "Olivia added a new stop" |
| warning | warning-500 / `AlertCircle` | "This place is closed Sundays" |

Toast body max 2 lines + optional action link ("View"). Auto-dismiss 5s, persistent if it has an action. Always announce via `aria-live=polite`.

---

## 9. Map controls + place pin

Mapbox GL JS canvas with overlay controls.

### Controls (top-right stack)
- Zoom in / out (icon buttons, `bg-surface shadow-md rounded-lg`).
- Recenter to fit route (`Locate` icon).
- Layer toggle (Day filter chip when on day view).

### Place pin
- Approved stop: filled `accent-500` circle with white number (day order).
- Proposed: dashed-border circle, `info-500` stroke, white interior.
- Reservation: `accent-500` rounded-square with `Ticket` icon.
- Hover/tap: tooltip card with thumb + name + time. Selected: lifts with `shadow-lg` and ring `ring-2 ring-primary-500`.
- Numbered label badge for sort order (white circle, `text-primary-700`, `caption` weight).

### Route line
- Approved route: solid `primary-500`, 3px.
- Proposed leg: dashed `info-500`, 2px.

---

## 10. Voting UI

Core wedge component. Must be unambiguous, color-blind safe, fast on mobile.

### 10.1 Vote pill (compact, in list)
```
[ ✓ 5 ]  [ ✗ 0 ]  [ ? 1 ]    APPROVED
 success   error    warning   success badge
```
Each pill = icon + count. Icon is the signal, color is reinforcement. Hover/tap reveals member avatars.

### 10.2 Vote buttons (in vote modal / stop detail)
Three large equal-width buttons stacked on mobile / inline on desktop:
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  ✓ Yes, in      │  │  ? Maybe         │  │  ✗ No, skip      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
  bg success-500     bg warning-100     bg error-100
  text white         text warning-700   text error-700
```
Selected vote: outlined ring + bold text, others fade to opacity-70.

### 10.3 Threshold progress bar
```
Threshold: 60%   ●●●●●●●●●○○○○○○  5 of 7 yes  ⟶  Approved
                 success-500       caption     success badge
```
- Track: `bg-neutral-200` 8px tall, `rounded-full`.
- Fill: `bg-success-500` once threshold met; before threshold, `bg-info-500`.
- Threshold tick mark on bar at the 60% position (1px notch).
- Live region announces status changes for screen readers.

### 10.4 Voter avatars
Per choice column show first 3 avatars + `+N more` chip. On hover, popover lists names + vote time.

---

## 11. Status badges

Inline pill, `rounded-full px-2 py-0.5 caption font-semibold`. Use both color AND icon (or text) for color-blind safety.

| Status | Bg | Text | Icon | Where |
| --- | --- | --- | --- | --- |
| Proposed | `info-50` | `info-700` | `Sparkles` | stop, reservation |
| Approved | `success-50` | `success-700` | `Check` | stop |
| Rejected | `error-50` | `error-700` | `X` | stop |
| Skipped | `neutral-100` | `neutral-700` | `MinusCircle` | stop |
| Pending | `warning-50` | `warning-700` | `Clock` | reservation, vote |
| Booked | `success-50` | `success-700` | `Ticket` | reservation |
| Paid | `success-50` | `success-700` | `CheckCircle2` | expense, reservation |
| Owed | `error-50` | `error-700` | `ArrowUpRight` | personal balance |
| Owed-to-you | `success-50` | `success-700` | `ArrowDownLeft` | personal balance |
| Ready | `success-50` | `success-700` | `CheckCircle2` | checklist |
| Missing | `warning-50` | `warning-700` | `AlertCircle` | checklist |

---

## 12. Avatar + AvatarGroup

shadcn `Avatar` extended.

### Sizes
| Size | px | Use |
| --- | --- | --- |
| `xs` | 20 | inline in body text |
| `sm` | 24 | dense lists |
| `md` | 32 | default lists, member rows |
| `lg` | 40 | dashboard headers |
| `xl` | 64 | profile, recap |

### Fallback
Initials in `bg-primary-100 text-primary-700`. Generate background color from name hash (palette: primary-100, accent-100, info-100, warning-100, success-100) for at-a-glance recognition.

### AvatarGroup
Overlap stack with `-space-x-2` and `ring-2 ring-surface`. Max 4 shown then `+N` chip with same size + `bg-neutral-200 text-neutral-700`.
```
( O )( M )( T )( F )(+3)
```
Tap/hover reveals full member list popover.

---

## 13. Currency display

The local-first rule: **always show local currency first, home currency as a soft secondary**. Tabular numerals everywhere.

### Inline pattern
```
¥21,000  ~$140    (local-bold, secondary-muted)
```
HTML/JSX:
```
<span class="tabular-nums font-semibold">¥21,000</span>
<span class="tabular-nums text-tertiary text-body-sm">  ~$140</span>
```

### Stacked pattern (cards with tight horizontal space)
```
¥21,000
~$140 USD
```
Local on top in body weight, secondary on next line in caption neutral-500.

### Conversion freshness
Tooltip on the `~$` value: "Rate as of Apr 12 — cached daily" + small `Info` icon (12px) optional in expense detail views.

### Negative / refund
Prefix `−` (en dash) and color `error-700`. Never use parentheses — confusing on small screens.

### Total row
Bold, larger size (`h4`), `border-t border-default pt-2`. Both currencies shown stacked.

---

## 14. Component-to-spec cross-reference

| Wedge moment | Components in play |
| --- | --- |
| Vote on activity | Vote modal, Vote buttons, Threshold progress, Voter avatars, Status badge |
| Trip Timeline (Command Center) | Reservation card, Progress bars, Status badges, AvatarGroup, Time rail |
| Settlement | Expense card, Settle modal, Currency display, Status badge (paid/owed) |
| Memory pin (lite) | Photo card, Stop card, Visibility selector, Toast |
| Recap export | PDF preview component (read-only card set), Button (accent, lg) |

---

## 15. Component naming convention (for handoff)

Use `OurVenture` prefix only when extending shadcn beyond a variant:
- shadcn primitive + variant → import from `@/components/ui/button` etc.
- composed component → `@/components/voting/vote-pill.tsx`, `@/components/timeline/reservation-card.tsx`.
- domain folders: `voting`, `expenses`, `itinerary`, `reservations`, `memories`, `checklist`, `trips`.
