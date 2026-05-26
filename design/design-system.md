# OurVenture — Design System Spec

**Version:** 1.0 (MVP)
**Mode:** Light only (dark deferred)
**Stack target:** Tailwind CSS + shadcn/ui + lucide-react
**Date:** 2026-05-25

---

## 1. Color Palette

### 1.1 Design intent
- **Primary (Horizon Teal):** warm, adventurous, calm — evokes ocean/sky horizon. Not corporate blue, not Slack purple.
- **Accent (Sunset Coral):** action, energy, CTAs that matter (approve vote, settle up, export recap).
- **Neutrals (Sand):** slightly warm gray — never pure cool gray. Makes long lists of data feel less clinical.
- **Semantics:** standard but tuned to harmonize with the primary/accent.

### 1.2 Primary — Horizon Teal
```
50   #F0FAFA
100  #D7F2F2
200  #ADE5E5
300  #7BD3D3
400  #4CBCBC
500  #1FA2A2   ← base / brand
600  #168585
700  #126C6C
800  #115757
900  #0F4848
950  #062626
```

### 1.3 Accent — Sunset Coral
```
50   #FFF4F0
100  #FFE3D8
200  #FFC2AC
300  #FF9C78
400  #FB7148
500  #ED4F23   ← base / accent CTA
600  #C73C16
700  #9F3013
800  #7E2912
900  #672313
950  #380E07
```

### 1.4 Neutral — Sand (warm gray)
```
50   #FAFAF8
100  #F4F3EE
200  #E8E6DE
300  #D4D1C5
400  #A8A498
500  #7C7869
600  #5E5B4F
700  #46443B
800  #2D2C26
900  #1B1A17
950  #0E0D0B
```

### 1.5 Semantic
| Token | Hex | Use |
| --- | --- | --- |
| `success-50`  | `#ECFDF5` | success bg |
| `success-500` | `#10B981` | paid, approved, ready |
| `success-700` | `#047857` | success text on light |
| `warning-50`  | `#FFFBEB` | warning bg |
| `warning-500` | `#F59E0B` | conflict, pending, partial |
| `warning-700` | `#B45309` | warning text |
| `error-50`    | `#FEF2F2` | error bg |
| `error-500`   | `#EF4444` | rejected, overdue, destructive |
| `error-700`   | `#B91C1C` | error text |
| `info-50`     | `#EFF6FF` | info bg |
| `info-500`    | `#3B82F6` | proposed, neutral info |
| `info-700`    | `#1D4ED8` | info text |

### 1.6 Surfaces (semantic aliases)
| Token | Maps to | Use |
| --- | --- | --- |
| `bg-app` | `neutral-50` | page background |
| `bg-surface` | `#FFFFFF` | cards, sheets |
| `bg-subtle` | `neutral-100` | hover row, disabled fill |
| `bg-muted` | `neutral-200` | dividers between sections |
| `border-default` | `neutral-200` | card/input border |
| `border-strong` | `neutral-300` | focused border (non-primary) |
| `text-primary` | `neutral-900` | headings, primary body |
| `text-secondary` | `neutral-700` | body |
| `text-tertiary` | `neutral-500` | metadata, captions |
| `text-disabled` | `neutral-400` | disabled |
| `text-inverse` | `#FFFFFF` | on primary/accent buttons |

### 1.7 Tailwind config snippet
```js
// tailwind.config.ts (theme.extend.colors)
colors: {
  primary: {
    50:'#F0FAFA',100:'#D7F2F2',200:'#ADE5E5',300:'#7BD3D3',
    400:'#4CBCBC',500:'#1FA2A2',600:'#168585',700:'#126C6C',
    800:'#115757',900:'#0F4848',950:'#062626',
    DEFAULT:'#1FA2A2',
  },
  accent: {
    50:'#FFF4F0',100:'#FFE3D8',200:'#FFC2AC',300:'#FF9C78',
    400:'#FB7148',500:'#ED4F23',600:'#C73C16',700:'#9F3013',
    800:'#7E2912',900:'#672313',950:'#380E07',
    DEFAULT:'#ED4F23',
  },
  neutral: {
    50:'#FAFAF8',100:'#F4F3EE',200:'#E8E6DE',300:'#D4D1C5',
    400:'#A8A498',500:'#7C7869',600:'#5E5B4F',700:'#46443B',
    800:'#2D2C26',900:'#1B1A17',950:'#0E0D0B',
  },
  success: {50:'#ECFDF5',500:'#10B981',700:'#047857'},
  warning: {50:'#FFFBEB',500:'#F59E0B',700:'#B45309'},
  error:   {50:'#FEF2F2',500:'#EF4444',700:'#B91C1C'},
  info:    {50:'#EFF6FF',500:'#3B82F6',700:'#1D4ED8'},
}
```

### 1.8 CSS variables (shadcn convention)
```css
/* app/globals.css — light mode only */
:root {
  --background: 60 18% 98%;        /* neutral-50 */
  --foreground: 36 8% 10%;         /* neutral-900 */
  --card: 0 0% 100%;
  --card-foreground: 36 8% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 36 8% 10%;
  --primary: 180 68% 38%;          /* primary-500 */
  --primary-foreground: 0 0% 100%;
  --secondary: 50 18% 95%;         /* neutral-100 */
  --secondary-foreground: 36 8% 18%;
  --muted: 50 18% 95%;
  --muted-foreground: 41 9% 45%;   /* neutral-500 */
  --accent: 14 86% 53%;            /* accent-500 */
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 47 18% 89%;            /* neutral-200 */
  --input: 47 18% 89%;
  --ring: 180 68% 38%;             /* primary-500 */
  --radius: 0.625rem;
}
```

---

## 2. Typography

### 2.1 Font families (open source / system)
- **Display + UI (sans):** `Inter` (variable, self-hosted via `next/font`). Falls back to `system-ui`.
- **Numeric / tabular (data):** `Inter` with `font-variant-numeric: tabular-nums`. (Same family; tabular for balance sheets/expense tables.)
- **Mono (rarely — confirmation #, invite code):** `JetBrains Mono` via `next/font`. Falls back to `ui-monospace, SFMono-Regular, Menlo`.

> No licensed fonts. Inter + JetBrains Mono are SIL OFL.

### 2.2 Type scale (rem, 16px base)
| Token | Size | Line-height | Weight | Use |
| --- | --- | --- | --- | --- |
| `display`  | 36px / 2.25rem | 44px / 1.22 | 700 | Recap PDF cover, marketing only |
| `h1`       | 28px / 1.75rem | 36px / 1.29 | 700 | Trip name on dashboard |
| `h2`       | 22px / 1.375rem | 30px / 1.36 | 600 | Section headers ("Reservations", "Day 3") |
| `h3`       | 18px / 1.125rem | 26px / 1.44 | 600 | Card titles, modal titles |
| `h4`       | 16px / 1rem | 22px / 1.375 | 600 | List item headers |
| `body-lg`  | 17px / 1.0625rem | 26px / 1.53 | 400 | Long-form (stop notes, recap) |
| `body`     | 15px / 0.9375rem | 22px / 1.47 | 400 | Default body |
| `body-sm`  | 14px / 0.875rem | 20px / 1.43 | 400 | Secondary body, table cells |
| `caption`  | 13px / 0.8125rem | 18px / 1.38 | 500 | Metadata, timestamps |
| `overline` | 11px / 0.6875rem | 16px / 1.45 | 600 | UPPERCASE labels, tracking 0.06em |
| `numeric`  | matches body | matches | 500 tabular | Money, counts |

### 2.3 Tailwind type config snippet
```js
fontFamily: {
  sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-jetbrains)', 'ui-monospace', 'SFMono-Regular', 'Menlo'],
},
fontSize: {
  'overline': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.06em', fontWeight: '600' }],
  'caption':  ['0.8125rem',{ lineHeight: '1.125rem', fontWeight: '500' }],
  'body-sm':  ['0.875rem', { lineHeight: '1.25rem' }],
  'body':     ['0.9375rem',{ lineHeight: '1.375rem' }],
  'body-lg':  ['1.0625rem',{ lineHeight: '1.625rem' }],
  'h4':       ['1rem',     { lineHeight: '1.375rem', fontWeight: '600' }],
  'h3':       ['1.125rem', { lineHeight: '1.625rem', fontWeight: '600' }],
  'h2':       ['1.375rem', { lineHeight: '1.875rem', fontWeight: '600' }],
  'h1':       ['1.75rem',  { lineHeight: '2.25rem',  fontWeight: '700' }],
  'display':  ['2.25rem',  { lineHeight: '2.75rem',  fontWeight: '700' }],
},
```

### 2.4 Text rules
- Body line length max **70ch** on long-form (notes, recap).
- Never use h-styles for visual weight only — use `font-semibold`/`font-bold` on body utility classes.
- Tabular numerals on every money/count display: `font-variant-numeric: tabular-nums` utility `tabular-nums`.

---

## 3. Spacing Scale

Tailwind defaults are kept (4px base, multiplied). MVP usage subset:

| Token | px | Common use |
| --- | --- | --- |
| `0.5` | 2  | hairline gaps |
| `1`   | 4  | inline icon → text gap |
| `1.5` | 6  | badge inner padding |
| `2`   | 8  | small gap, chip padding |
| `3`   | 12 | input internal y, list row gap mobile |
| `4`   | 16 | card padding mobile, default gap |
| `5`   | 20 | section spacing mobile |
| `6`   | 24 | card padding desktop |
| `8`   | 32 | section spacing desktop |
| `10`  | 40 | page top spacing mobile |
| `12`  | 48 | page top spacing desktop, hero spacing |
| `16`  | 64 | major section breaks |

**Cards:** `p-4` mobile / `p-6` desktop.
**Page gutters:** `px-4` mobile / `px-6` tablet / `px-8` desktop. Max content width `max-w-screen-xl` (1280px).
**Stack rhythm:** prefer `space-y-3` for tight lists, `space-y-4` for cards-in-column, `space-y-8` for sections.

---

## 4. Border Radius Scale

| Token | px | Use |
| --- | --- | --- |
| `none` | 0 | full-bleed dividers |
| `sm`   | 4 | inputs inside dense forms only |
| `md`   | 6 | badges, chips |
| `lg`   | 10 | **default for inputs, cards, buttons** ← `--radius` |
| `xl`   | 14 | modals, sheets, larger cards |
| `2xl`  | 20 | hero cards (recap cover, trip dashboard hero) |
| `full` | 9999 | avatars, vote pills, FAB |

Default radius for shadcn `--radius: 0.625rem` (10px).

---

## 5. Elevation / Shadows

| Token | Value | Use |
| --- | --- | --- |
| `shadow-xs` | `0 1px 2px 0 rgb(27 26 23 / 0.04)` | hover lift on rows |
| `shadow-sm` | `0 1px 2px 0 rgb(27 26 23 / 0.05), 0 1px 3px 0 rgb(27 26 23 / 0.06)` | default card resting |
| `shadow-md` | `0 4px 6px -1px rgb(27 26 23 / 0.08), 0 2px 4px -2px rgb(27 26 23 / 0.06)` | card hover, dropdown |
| `shadow-lg` | `0 10px 15px -3px rgb(27 26 23 / 0.10), 0 4px 6px -4px rgb(27 26 23 / 0.05)` | modal, popover |
| `shadow-xl` | `0 20px 25px -5px rgb(27 26 23 / 0.12), 0 8px 10px -6px rgb(27 26 23 / 0.06)` | bottom sheet on mobile |
| `shadow-focus-ring` | `0 0 0 3px rgb(31 162 162 / 0.30)` | focus indicator (primary tint) |

Restraint rule: most surfaces stay `shadow-sm`. Only lift on hover/interaction.

---

## 6. Motion

### 6.1 Durations
| Token | ms | Use |
| --- | --- | --- |
| `instant` | 80 | active-state press feedback |
| `fast`    | 150 | hover, focus, color/bg changes |
| `base`    | 220 | dropdown, tooltip, toast in/out |
| `slow`    | 320 | modal, bottom sheet, drawer |
| `slowest` | 480 | page section reveal (use sparingly) |

### 6.2 Easings
| Token | curve | Use |
| --- | --- | --- |
| `ease-standard` | `cubic-bezier(0.2, 0, 0.2, 1)` | default in/out |
| `ease-emphasized` | `cubic-bezier(0.2, 0, 0, 1)` | exits, modals opening |
| `ease-enter` | `cubic-bezier(0, 0, 0.2, 1)` | element entering view |
| `ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | element leaving |

### 6.3 Patterns
- Bottom sheet (mobile modal): translateY 100% → 0, `slow` + `ease-emphasized`.
- Toast: translateY -8px + opacity 0→1, `base` + `ease-enter`.
- Vote pill press: scale 1 → 0.96 → 1, `instant`.
- Threshold progress bar fill: width animation, `slow` + `ease-standard`.
- **Always respect `prefers-reduced-motion: reduce`** — drop translates, keep opacity only.

---

## 7. Iconography

- **Library:** `lucide-react` (matches Frontend Developer's plan; same family used by shadcn examples).
- **Default sizes:** 16 (inline body), 18 (button/input), 20 (list row), 24 (heading-adjacent), 32 (empty state hero).
- **Stroke width:** 2 default (lucide default). Use 1.5 only for 32px+ illustrative use.
- **Color:** inherit currentColor. Never tint icons differently from their adjacent text unless conveying status (then use semantic token).
- **Icon-only buttons must always have `aria-label`.**

### Common icon map (suggested)
| Concept | Icon |
| --- | --- |
| Trip | `Compass` |
| Dashboard | `LayoutDashboard` |
| Timeline | `CalendarClock` |
| Itinerary day | `Map` / `MapPin` |
| Vote | `ThumbsUp` / `ThumbsDown` / `HelpCircle` (maybe) |
| Reservation | `Ticket` |
| Expense | `Receipt` / `Wallet` |
| Settle | `ArrowLeftRight` |
| Photo | `Image` / `Camera` |
| Note | `StickyNote` |
| Checklist | `ListChecks` |
| Member | `Users` |
| Invite | `UserPlus` |
| Export PDF | `FileDown` |
| Settings | `Settings` |
| Add | `Plus` |
| More | `MoreHorizontal` |

---

## 8. Dark Mode

**Explicitly deferred.** Build with semantic CSS variables so a `.dark` class can be added in Phase 2 without refactoring components. Do not add a theme toggle.
