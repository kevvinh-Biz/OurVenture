# OurVenture — Accessibility (WCAG 2.2 AA)

**Target:** WCAG 2.2 Level AA across all MVP screens.
**Audit cadence:** axe-core in CI (block on serious/critical), manual keyboard pass before each milestone, Lighthouse accessibility ≥95.

---

## 1. Color contrast minimums

WCAG 2.2 AA requires **4.5:1** for normal text, **3:1** for large text (≥18.66px regular / ≥14px bold) and UI components/graphics.

### Verified pairings in our palette
| Use | Foreground | Background | Ratio | Pass |
| --- | --- | --- | --- | --- |
| Body text default | `neutral-900` #1B1A17 | `neutral-50` #FAFAF8 | ~16.4:1 | AAA |
| Body secondary | `neutral-700` #46443B | `neutral-50` | ~9.2:1 | AAA |
| Caption tertiary | `neutral-500` #7C7869 | `neutral-50` | ~4.7:1 | AA (use ≥13px) |
| Link / primary text | `primary-700` #126C6C | white | ~5.8:1 | AA |
| Primary button label | white | `primary-500` #1FA2A2 | ~3.4:1 | AA large text only |
| Accent button label | white | `accent-500` #ED4F23 | ~3.6:1 | AA large text only |
| Success badge text | `success-700` #047857 | `success-50` #ECFDF5 | ~7.0:1 | AAA |
| Warning badge text | `warning-700` #B45309 | `warning-50` #FFFBEB | ~5.8:1 | AA |
| Error badge text | `error-700` #B91C1C | `error-50` #FEF2F2 | ~6.6:1 | AAA |
| Info badge text | `info-700` #1D4ED8 | `info-50` #EFF6FF | ~8.2:1 | AAA |

### Rules
- **Buttons:** primary/accent labels are short and rendered at ≥14px bold or ≥16px, so 3.4–3.6:1 passes "large text" / non-text UI threshold. If a primary button ever needs ≤14px regular text, swap to `primary-700` background.
- **Don't use `neutral-400` for any text** (≤2.8:1). It's for disabled states only, accompanied by an `aria-disabled` and other affordances.
- **Don't use `neutral-300` borders for anything load-bearing** — those are decorative. Load-bearing borders use `neutral-400` or stronger.
- **Status badges** must always include both color AND text/icon. Never color-only.

---

## 2. Focus state requirements

- Every interactive element shows a visible focus indicator on `:focus-visible`.
- Default indicator: `outline: none` + `box-shadow: 0 0 0 3px rgb(31 162 162 / 0.30)` (the `shadow-focus-ring` token). Ring is the `primary-500` at 30% alpha — contrast vs. surrounding ≥3:1 on light bg.
- Inputs additionally darken their border to `primary-500` on focus.
- Cards that are clickable: focus ring around the whole card.
- Never disable focus ring on keyboard. Removing it only on mouse via `:focus-visible` is fine.
- Skip-to-content link (`Skip to main content`) at top of every page; visually hidden until focused.

---

## 3. Keyboard navigation patterns

| Surface | Behavior |
| --- | --- |
| Tab order | Top-to-bottom, left-to-right, follows DOM order — do not use positive tabindex anywhere. |
| Buttons | Activated on Enter and Space. |
| Links | Activated on Enter only. |
| Dialogs (modal/sheet) | Focus moves into dialog on open, focus trapped, ESC closes, focus returns to trigger on close. |
| Bottom sheets | Same as dialogs; drag handle is also a button with `aria-label="Close dialog"`. |
| Popovers (avatar group, tooltips) | Open on focus/hover, close on blur/ESC. Tooltips never hold focusable content. |
| Menus (shadcn DropdownMenu) | Arrow keys navigate items, Home/End jump, Enter selects, ESC closes. |
| Vote buttons | Arrow keys move focus across the three pills; Enter or Space chooses. |
| Map + list dual view | Tab moves through list first; pressing Enter on a list item pans/highlights the matching pin. Provide a `View on map` button per row for non-mouse users. |
| Date picker | Calendar supports arrow keys, PgUp/PgDn for month, Home/End for week, Enter selects. |
| Tables / lists | Arrow keys not required, but Tab must reach all controls in row. Use `aria-rowcount` on long virtualized lists. |

---

## 4. Screen reader considerations — Voting view

The voting flow is numeric + interactive + asynchronous. SR users need to (a) understand the current state, (b) cast a vote, (c) hear confirmation, (d) hear threshold movement.

### Structure
- Stop title: `<h2>`.
- Place metadata: definition list (`<dl>`) — "Address", "Hours today", "Estimated cost".
- Vote tally region:
  ```html
  <section aria-labelledby="vote-tally-h">
    <h3 id="vote-tally-h">Votes</h3>
    <p>5 yes, 0 no, 1 maybe out of 7 travelers.</p>
    <ul role="list" aria-label="Members who voted yes">
      <li>Olivia, voted yes</li>
      ...
    </ul>
  </section>
  ```
- Vote buttons: each labeled clearly — `aria-label="Vote yes on Fushimi Inari"`. Pressed state via `aria-pressed="true"`.
- Threshold progress:
  ```html
  <div role="progressbar"
       aria-valuemin="0" aria-valuemax="7"
       aria-valuenow="5"
       aria-valuetext="5 of 7 yes votes, threshold met. Approved.">
  </div>
  ```
- Status change announcements: live region
  ```html
  <div aria-live="polite" aria-atomic="true" class="sr-only" id="vote-status-live"></div>
  ```
  When threshold flips, write: "Threshold reached. Fushimi Inari is now approved."

---

## 5. Screen reader considerations — Settlement view

Numeric and action-heavy. SR users must hear who owes whom, totals, and confirm payment.

- Page H1: "Settle up for [Trip name]".
- Per-person summary: "You are owed $42 total. You owe $18 total. Net: you are owed $24."
- Recommended transactions list:
  ```html
  <ol aria-label="Recommended transactions to settle the trip">
    <li>
      <p>Mark pays Olivia <span aria-label="forty-two US dollars">$42</span>.</p>
      <button aria-label="Mark Mark's payment of $42 to Olivia as paid">Mark as paid</button>
    </li>
  </ol>
  ```
- After "Mark as paid": toast + live region announce "Marked $42 from Mark to Olivia as paid. 3 transactions remaining."
- Currency: prefix the local symbol in visible text; for SR use `aria-label` with the spelled currency code when ambiguous (`"¥21,000 — twenty-one thousand Japanese yen, about one hundred forty US dollars"`). Don't over-verbose-ify on every row — once per page in a summary line is enough; rows can stay terse with the visible glyph.
- Tabular numerals are visual only — don't change SR pronunciation.

---

## 6. Color-not-only-signal (color-blind safety)

Most-checked: red/green confusion (deuteranopia/protanopia), which is exactly our vote yes/no problem.

### Vote choices use FOUR signals layered:
1. **Icon shape:** `Check` (yes), `X` (no), `HelpCircle` (maybe). Different geometries, not just different colors.
2. **Color:** success-500 / error-500 / warning-500.
3. **Position:** Yes left, Maybe center, No right — consistent everywhere.
4. **Text label:** always present, never icon-only on vote choice (vote *counts* badges may show icon+number, but choice buttons spell "Yes / Maybe / No").

### Other status systems
| Where | Signal stack |
| --- | --- |
| Status badges | bg color + icon + text label |
| Threshold progress | bar fill + numeric "5 / 7 yes" + status badge (Approved/Pending) text |
| Reservation progress bars | filled cells + text "5/7 paid · 7/7 ticketed" |
| Expense balance pills | tinted bg + arrow icon (up=you-owe, down=you-are-owed) + text "$20" |
| Checklist items | checkbox state + line-through text |
| Map pins | shape (circle vs square), number, color (accent vs info dashed) |

### Tools to verify
- Test with [Sim Daltonism](https://michelf.ca/projects/sim-daltonism/) or the Chrome devtools Emulate Vision Deficiencies.
- Verify our 8 hero screens pass under Deuteranopia, Protanopia, Tritanopia.

---

## 7. Per-screen accessibility checklist

Before any of the 8 hero screens are signed off:

- [ ] All interactive elements reachable by Tab.
- [ ] Focus indicator visible on every focusable element.
- [ ] Headings form a logical outline (h1 → h2 → h3, no skips).
- [ ] All images have `alt` (or `alt=""` if decorative).
- [ ] All icon-only buttons have `aria-label`.
- [ ] Form fields have associated `<label>` (not just placeholder).
- [ ] Form errors are linked to fields via `aria-describedby` and announced via `aria-live="polite"`.
- [ ] Dialogs use `role="dialog"` + `aria-modal="true"` + `aria-labelledby` pointing to the title.
- [ ] Live regions exist for vote results, expense settle confirmation, toast.
- [ ] Touch targets ≥44×44 CSS px on mobile.
- [ ] Page works at 200% browser zoom without horizontal scrolling on widths ≥320px.
- [ ] axe-core: 0 serious/critical violations.
- [ ] Tested under one screen reader (NVDA on Windows or VoiceOver on Mac/iOS) for vote + settle flows specifically.
- [ ] Respects `prefers-reduced-motion: reduce`.
- [ ] Color-blind simulation pass for vote, status, balance UIs.

---

## 8. Known compromises for MVP

- **Mapbox map itself is not fully a11y-compliant** out of the box. Mitigation: every map state must have a list/text equivalent (route list, day list, reservation list). Map is enhancement, not the only path.
- **Date picker on mobile uses native input** (`type="datetime-local"`) — relies on OS accessibility, which is acceptable for MVP. Replace with custom a11y-audited picker in Phase 2 if needed.
- **PDF recap** — react-pdf can produce tagged PDFs but our MVP output is "good enough" not "Section 508 audited". Add a heading structure pass before public sharing in Phase 2.
