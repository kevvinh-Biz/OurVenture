# Screen 06 — Expense Settlement

**Purpose:** Resolve the math. Show who owes whom, recommend minimum transactions, let any member mark transactions as paid. Real pain reliever for groups; lets Olivia stop being the bank.

**Route:** `/trips/[tripId]/expenses/settle` (or as a section/tab of `/expenses`).

This screen has two views joined as tabs on mobile, side-by-side on desktop: **Settle up** (recommended transactions) and **Balances** (per-person breakdown). Both share the top summary.

---

## Components
- Summary header (your net, group total spent, settled %)
- Tab: Settle up | Balances
- Settle up: recommended transaction list with Mark-as-paid buttons
- Balances: per-member row with owed/owes amounts
- Currency display (local + home, tabular)
- Settle log (audit trail) — collapsible

---

## Mobile layout — Settle up tab

```
┌─────────────────────────────────────────┐
│ [◀]  Expenses                  [+]      │  app bar
├─────────────────────────────────────────┤
│ [Expenses] [*Settle up*] [Balances]     │  inner tabs
├─────────────────────────────────────────┤
│ YOUR POSITION                            │  overline
│ You are owed   $124         [↓ success] │  h2 + pill
│ You owe         $42         [↑ error]   │
│ Net             +$82                     │  bold tabular
│                                          │
│ Group total: $1,847 spent · 68% settled  │  caption tertiary
│ ━━━━━━━━━━━━━━━━━━━━○○○○○                │  progress neutral→success
├─────────────────────────────────────────┤
│ ─── Recommended transactions ───         │  3 minimum txns
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ ( M ) Mark   →   ( O ) Olivia        │ │  card
│ │ $42                                  │ │  big tabular h3
│ │ covers: Sushi Dai, taxi, museum tix  │ │  caption
│ │              [Mark as paid]          │ │  accent button
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ( T ) Tess   →   ( O ) Olivia        │ │
│ │ $82                                  │ │
│ │ covers: Hotel Granbell share         │ │
│ │              [Mark as paid]          │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ( F ) Fiona  →   ( J ) Joey          │ │
│ │ $18                                  │ │
│ │ covers: groceries                    │ │
│ │              [Mark as paid]          │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [Mark all as paid]                       │  outline destructive-ish, confirm
│                                          │
│ ─── Settle log (5) ───  [expand ▾]       │  collapsed
└─────────────────────────────────────────┘
```

---

## Mobile layout — Balances tab

```
┌─────────────────────────────────────────┐
│ [◀]  Expenses                  [+]      │
├─────────────────────────────────────────┤
│ [Expenses] [Settle up] [*Balances*]     │
├─────────────────────────────────────────┤
│ (summary same as above)                  │
├─────────────────────────────────────────┤
│ Per-person breakdown                     │  overline
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ ( O ) Olivia              +$124      │ │  positive = is owed, success
│ │ paid $620 · share $496               │ │  caption
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ( M ) Mark               −$42        │ │  negative = owes, error
│ │ paid $80 · share $122                │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ( T ) Tess               −$82        │ │
│ │ paid $0 · share $82                  │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ( F ) Fiona              +$18        │ │
│ │ paid $108 · share $90                │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ( J ) Joey               −$18        │ │
│ │ paid $40 · share $58                 │ │
│ └─────────────────────────────────────┘ │
│ Adi, Pat: settled ✓                      │
│                                          │
│ Per-row tap → expense list filtered      │
│ by that person's involvement.            │
└─────────────────────────────────────────┘
```

### Mobile interactions
- "Mark as paid" → confirmation toast ("Marked $42 from Mark to Olivia as paid · undo") with 6-second undo window.
- "Mark all as paid" → confirm dialog "Mark 3 outstanding transactions as paid?" then bulk update.
- Settle log expands inline showing recent `settled_at` events with avatar + name + amount + date.
- Tapping a person row in Balances opens a drill-down with their expense list.

---

## Desktop layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ◀ Trips / Tokyo & Kyoto / Expenses                              [+ Expense]  │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Expenses] [*Settle up*] [Balances]                                          │
├────────────────────────────────────────┬──────────────────────────────────────┤
│ YOUR POSITION                          │ BALANCES                              │
│ You are owed   $124   [↓]              │ ( O ) Olivia            +$124         │
│ You owe         $42   [↑]              │ ( M ) Mark              −$42          │
│ Net             +$82                   │ ( T ) Tess              −$82          │
│                                        │ ( F ) Fiona             +$18          │
│ Group total $1,847 · 68% settled       │ ( J ) Joey              −$18          │
│ ━━━━━━━━━━━━━━━━━━━○○○○○                │ Adi  settled ✓                        │
│                                        │ Pat  settled ✓                        │
│ ─── Recommended transactions ───       │                                       │
│                                        │ ─── Currency ───                      │
│ ( M ) Mark → ( O ) Olivia              │ Displayed in USD (your home)          │
│ $42      covers: Sushi Dai, taxi…      │ Trip default: JPY                     │
│                       [Mark as paid]   │ Rate cached: Apr 12                   │
│                                        │                                       │
│ ( T ) Tess → ( O ) Olivia              │                                       │
│ $82      covers: Hotel Granbell share  │                                       │
│                       [Mark as paid]   │                                       │
│                                        │                                       │
│ ( F ) Fiona → ( J ) Joey               │                                       │
│ $18      covers: groceries             │                                       │
│                       [Mark as paid]   │                                       │
│                                        │                                       │
│ [Mark all as paid]                     │                                       │
│                                        │                                       │
│ ─── Settle log (5) ───                 │                                       │
│ • Tess paid Olivia $40 — Apr 13        │                                       │
│ • Mark paid Olivia $25 — Apr 13        │                                       │
│ ...                                    │                                       │
└────────────────────────────────────────┴──────────────────────────────────────┘
```

### Desktop interactions
- 2-col: Settle list left (8), Balances + meta right (4) — Balances becomes a peek panel, full balances drill-down still available.
- Hover on a transaction row reveals "Edit" + "View details" small icon buttons.
- Currency note (cached date) helps trust the conversion.

---

## States

- **All settled:** Big success card replaces transaction list: "All squared up — nobody owes anyone." 🎉 (no emoji actually — use `CircleCheck` icon). Show "Export settlement summary" button.
- **No expenses yet:** Empty state from `component-patterns.md §6` — "All quiet on the wallet" + Log expense CTA.
- **Single payer (only Olivia has paid anything):** Recommended transactions all flow toward her. Same layout, just simpler.
- **Multi-currency wallet:** All settlement is converted to home currency. Add caption "Settle in any currency — convert at marked-paid time" and a tooltip explaining the cached rate.
- **Failed mark-as-paid:** error toast, row stays unchecked, "Try again" inline.

---

## Notes for developer
- Settlement = minimum-cash-flow algorithm. Greedy approach: sort positives desc + negatives asc, match largest pairs until zero. MVP-acceptable.
- Mark-as-paid affects `expense_splits.settled` for the implicated splits. Algorithm needs to know which splits map to which transaction — easiest: settling a transaction marks the smallest necessary subset of splits.
- Currency conversion uses `currency_rates_cache` row (base=home, quote=expense). If missing, fallback to expense's native currency display + warning.
- "Mark all" should be a confirmable dangerous action; log who triggered it for the audit trail.
