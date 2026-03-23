# Calculator Economics Section — Design

## Goal

Build an engineer-facing economics section that answers one question:

> Does WellFi buy incremental barrels more cheaply and faster than drilling a new well?

The section shows anonymized industry benchmarks first (presets from 4 real operator analyses), then lets the engineer enter their own numbers.

## Data Provenance

All preset data is sourced from:

- **Production data**: Latest publicly available AER (Alberta Energy Regulator) production reports — January 2026 filing for Clearwater and Bluesky formations
- **Corporate financials**: Latest public corporate financial disclosures (Q4/FY2025 results, 2026 guidance, corporate presentations)
- **Oil pricing**: Current WCS heavy oil market price (C$83.18/bbl at time of analysis)
- **WellFi assumptions**: Production uplift (10%) is an average of estimated uplift observed across existing installations. Run-life extension (25%) is calculated but varies by use case and operator conditions.
- **Workover costs**: Estimated at $50,000–$60,000 per event depending on operator — should be updated with actual MPS field data when available.

This provenance must be visible in the UI — not buried in footnotes. Engineers need to see that the benchmark is grounded in real public data, not marketing claims.

## Architecture

### Homepage Teaser (`CalculatorTeaserSection.tsx`)

Two-column layout. Left: copy + data provenance. Right: preset tabs + 3 headline metrics.

**Preset tabs**: 4 anonymized operators (A/B/C/D). Switching tabs updates the 3 metrics.

**3 headline metrics per preset**:
- Payout (days)
- Capex per incremental bbl/d (C$)
- Annual program value (C$)

**Data source badges** below the metrics:
- "AER Jan 2026 production data"
- "Public corporate financials"
- "WellFi uplift: avg of observed installations"

**CTA**: "Open Full Calculator" → `/calculator`

### Full Calculator Page (`/calculator`)

**Preset selector** at top: segmented control with 5 options:
- Operator A (415 wells, Clearwater/Bluesky)
- Operator B (259 wells, Clearwater)
- Operator C (650 wells, Clearwater)
- Operator D (178 wells, Clearwater/Bluesky)
- Custom (blank)

Selecting a preset auto-fills all inputs. Selecting Custom clears to blank.

**Input panel** (left): 3 sections unchanged:
1. Your Well Set — candidate wells, avg rate, netback, workover cost, run life
2. Your WellFi Assumptions — capital, uplift %, run-life extension %
3. Your Drill Benchmark — D&C cost, year-1 avg rate

**Results panel** (right, sticky): Unchanged structure but with:
- Verdict badge: "WellFi pays out in X days — Y% cheaper per barrel than drilling"
- 4 metric cards: payout, annual value/well, program value, capex/bbl
- Comparison bars: WellFi vs Drill (capex per incr. bbl/d)
- Capital saved vs drilling
- Same-capital drill result

**Data provenance footer** on the calculator page:
- Source attribution for AER data and corporate financials
- Note that WellFi uplift is an observed average, not a guarantee
- Note that run-life extension is calculated and varies by use case

## Preset Data (from workbook audit)

### Operator A (Baytex — anonymized)
- Formation: Clearwater / Bluesky
- Wells: 415 | Top 10%: 41
- Avg rate: 24.4 bbl/d | Top 10% avg: 97.6 bbl/d
- WCS: $83.18 | Royalty: 15% | Opex: $13.84 | Transport: $3.44 | G&A: $2.73
- Netback: $50.69/bbl
- WellFi: $20K/well | 10% uplift | 15mo run life | 25% extension | $50K workover
- Drill: $2.9M D&C | 150 IP30 | 55% decline | 108.75 yr-1 avg

### Operator B (Headwater — anonymized)
- Formation: Clearwater
- Wells: 259 | Top 10%: 25
- Avg rate: 71.9 bbl/d | Top 10% avg: 217.9 bbl/d
- WCS: $83.18 | Royalty: 17.2% | Opex: $9.90 | Transport: $4.25 | G&A: $1.60
- Netback: $53.12/bbl
- WellFi: $20K/well | 10% uplift | 15mo run life | 25% extension | $50K workover
- Drill: $2.0M D&C | 250 IP30 | 50% decline | 187.5 yr-1 avg

### Operator C (Tamarack — anonymized)
- Formation: Clearwater
- Wells: 650 | Top 10%: 65
- Avg rate: 71.6 bbl/d | Top 10% avg: 227.6 bbl/d
- WCS: $83.18 | Royalty: 15% | Opex: $7.00 | Transport: $4.25 | G&A: $1.38
- Netback: $58.07/bbl
- WellFi: $20K/well | 10% uplift | 15mo run life | 25% extension | $50K workover
- Drill: $1.9M D&C | 200 IP30 | 50% decline | 150 yr-1 avg

### Operator D (Obsidian — anonymized)
- Formation: Clearwater / Bluesky
- Wells: 178 | Top 10%: 17
- Avg rate: 39.2 bbl/d | Top 10% avg: 153.5 bbl/d
- WCS: $83.18 | Royalty: 15% | Opex: $17.40 | Transport: $0 (bundled) | G&A: $2.05
- Netback: calculated from cost stack
- WellFi: $20K/well | 10% uplift | 15mo run life | 25% extension | $60K workover
- Drill: $3.1M D&C | 275 IP30 | 60% decline | 192.5 yr-1 avg

### Pre-computed teaser metrics (combined value = production + workover savings)

| Preset | Payout (days) | Capex/incr bbl/d | Program value/yr |
|--------|--------------|-------------------|------------------|
| Op A   | 137          | $8,191            | $22.1M           |
| Op B   | 52           | $2,783            | $36.1M           |
| Op C   | 48           | $2,793            | $98.7M           |
| Op D   | 88           | $5,101            | $14.8M           |

## Visual Design

- Dark theme: navy void `#0A0E1A` background
- Cyan `#06B6D4` for WellFi metrics and active tab
- Amber `#D97706` for drill benchmark bar
- JetBrains Mono for all numbers
- Glass panels with `border-white/8` and subtle gradients
- Tab-switch transitions: CSS crossfade on metric values, width transition on comparison bars
- Data source badges: small pill-shaped labels with subtle border

## What We Won't Build (YAGNI)

- No charts or graphs beyond comparison bars
- No PDF export or sharing
- No top-10% scenario toggle on the teaser (keep it simple — full calc only)
- No detailed netback/IP30 modes on the teaser
- No animation beyond tab transitions and number formatting

## Files to Create/Modify

### New
- `src/lib/presets.ts` — 4 `CalculatorPreset` objects with workbook data

### Modify
- `src/components/calculator/CalculatorTeaserSection.tsx` — preset tabs + 3 live metrics + provenance
- `src/components/calculator/WellFiCalculator.tsx` — preset selector, auto-fill logic
- `src/components/calculator/CalculatorResults.tsx` — verdict badge, provenance footer
- `src/lib/content.ts` — updated copy for provenance, preset labels, verdict messages
- `src/app/page.tsx` — no structural changes (teaser already in place)
- `src/app/calculator/page.tsx` — provenance section at bottom

### Unchanged
- `src/lib/calculator.ts` — math engine is verified and correct
- `src/components/calculator/CalculatorInputs.tsx` — input layout is already clean

## Implementation Order

1. Extract preset data into `presets.ts`
2. Wire presets into `WellFiCalculator.tsx` (selector + auto-fill)
3. Rebuild `CalculatorTeaserSection.tsx` (tabs + live metrics + provenance)
4. Add verdict badge and provenance to `CalculatorResults.tsx`
5. Update copy in `content.ts`
6. Visual polish pass (transitions, typography, spacing)
7. Build verification + screenshot
