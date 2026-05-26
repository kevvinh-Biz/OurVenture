# OurVenture — Visual Direction

**Personality target:** warm + adventurous + organized.
**Not:** corporate (Asana), clinical (Linear-when-cold), playful-to-a-fault (Duolingo), gradient-heavy (modern crypto sites), glassmorphic (Apple Vision marketing).

---

## 1. Comparable apps — steal / avoid

### Wanderlog
- **Steal:** map + list dual view, day-by-day chronological clarity, lightweight stop cards with thumbnails, hours displayed inline.
- **Avoid:** consumer-y density that gets noisy on desktop, color palette that leans generic-blue, ad-supported feel.

### Splitwise
- **Steal:** scannable expense rows with "you owe / you are owed" personal-balance tint, minimum-transactions settlement, friction-free mark-as-paid.
- **Avoid:** dated visual feel (table-of-numbers vibe), low-touch web UI, weak empty states.

### Notion
- **Steal:** calm typographic hierarchy, generous whitespace, restrained color use, neutral surface that lets content carry the room, content-first cards.
- **Avoid:** the "everything is a block, everything is editable inline" complexity — OurVenture needs decisive UI states (proposed vs approved), not infinite flexibility.

### Linear
- **Steal:** crisp tabular numerals, fast keyboard-feel feedback, focus rings that are unmistakable, taut spacing scale, status pills that read instantly.
- **Avoid:** cold/aloof palette, dark-mode-first instincts (we're light-only MVP), engineer-density that intimidates Casual Mark.

### Airbnb
- **Steal:** human warmth in photography, generous photo-led cards, soft shadows and ample whitespace, plain-English copy, mobile sheet patterns.
- **Avoid:** their accent red (we use coral, not their crimson), marketing-heavy density on top of functional pages, hero-image-or-bust layouts.

### Splittr / Notch-equivalents (avoid trap)
Don't follow the "split-the-bill apps look like calculators" pattern. OurVenture's expense view should feel like a friendly ledger, not a POS.

---

## 2. Personality north stars

| Attribute | Means | Doesn't mean |
| --- | --- | --- |
| Warm | warm-tinted neutrals (Sand), coral accent, friendly headline copy ("Where to first?") | beige nostalgia, cottagecore, Instagram filters |
| Adventurous | photography of real places, map prominence, primary teal that hints at horizon | gradient adventure-bro aesthetic, mountain stock imagery, neon |
| Organized | crisp typographic rhythm, predictable card grid, status-first lists, dependable empty states | over-engineered tables, dashboards-for-the-sake-of-it, fintech rigor |

If you ever can't tell which way to go on a small UI decision, default to **calm clarity**. Olivia is already overwhelmed — we are the antidote.

---

## 3. Density target

| Surface | Mobile | Desktop |
| --- | --- | --- |
| Trip dashboard | Stacked cards, 1 col, generous padding (p-4, gap-4). Comfortable. | 12-col grid, 3–4 cards across, info-dense but with breathing room (p-6, gap-6). |
| Trip Timeline (hero) | Single-column with time rail, cards full-bleed within gutters. | Two-column at `xl:`: timeline left, sticky map/route right. |
| Itinerary day view | List + map toggle (tabs). One at a time. | Split 60/40 list+map by default. |
| Expense / settle | List 1 col. Sticky day headers. | Two-column list + balance summary right. |
| Vote modal | Bottom sheet, big tap targets. | Centered 560px dialog. |
| Recap PDF preview | Single column scroll. | Constrained `max-w-3xl` page-like preview, side margins. |

Rule: **mobile is comfortable, desktop earns its density** — never just zoom the mobile layout up to 1440.

---

## 4. Photography / imagery direction

### User-uploaded photos (the actual product content)
- Render at honest aspect ratios (don't crop to square by default — masonry).
- Soft `rounded-lg`, `shadow-sm`. No filters, no overlays except subtle visibility chip top-right.
- Lightbox uses full-screen black backdrop, captions in bottom drawer.

### Cover / placeholder imagery (when no user photo)
- Trip cards with no cover photo: gradient placeholder `bg-gradient-to-br from-primary-100 to-accent-100` with centered `Compass` icon `text-primary-500/60`.
- Empty-state illustrations: light line-art only (compass, map pin, ticket, route line). Stroke `accent-300`, no fills, single weight. Avoid mascot characters.

### Marketing/onboarding hero (sign-in page only)
- Single large warm photo of friends at a viewpoint (group of 3-4, candid, not stock-y) overlaid with a translucent neutral card holding the form.
- One photo, no carousel. We'll source from Unsplash with attribution at launch.

### Iconography support
- lucide line icons (stroke 2). Never mix line + filled icons.
- Numbered map pins use brand colors (accent for approved, info dashed for proposed) — never red default Mapbox pins.

---

## 5. Anti-patterns (do not do)

- Gradients on cards, buttons, or backgrounds beyond the single empty-cover placeholder above.
- Glassmorphism / frosted backgrounds.
- Neumorphism / inset shadows.
- Auto-play motion, parallax, scroll-jacking.
- All-caps headlines (use overline class for the rare label use only).
- Emoji as primary status indicators (use icons + color + text — emoji feel cute now, dated in 18 months).
- Slack-style colored sidebars. We keep chrome neutral so content sings.
- More than 2 fonts on a screen. Inter only, with optional JetBrains Mono for confirmation codes.
- Confetti on save (one exception: Recap export complete — a small `Sparkles` toast accent, no full-screen animation).

---

## 6. Logo / mark placeholder (until Brand Guardian engages)

For MVP build: monogram **`OV`** in primary-700 inside a 32px rounded square (`bg-primary-500 text-inverse rounded-md font-bold`). Use the lucide `Compass` icon to the right in primary-700 when space allows. Replace once a real logo lands — don't bake the monogram deep into headers; isolate in `<Logo />` component.

---

## 7. "Does it feel OurVenture?" gut-check

Before shipping any screen, ask:
1. Could Olivia glance at this for 3 seconds and know who's involved + what's pending?
2. Could a color-blind Mark still parse vote status and balances?
3. Does it feel like a confident command center — not a craft project or a spreadsheet?
4. Is there at least one moment of warmth (photo, name, avatar) per screen, so it doesn't feel like SaaS chrome?

If any answer is "no", iterate.
