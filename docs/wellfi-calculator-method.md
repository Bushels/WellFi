# WellFi Calculator Method

## Goal

Build one engineer-facing screening calculator for WellFi instead of copying four separate operator spreadsheets into the app.

The calculator should answer one direct question:

> Does WellFi buy incremental barrels more cheaply and faster than drilling a new well?

## Source Inputs

The normalized model was derived from four local operator workbooks covering Clearwater and Bluesky producers, built from:

- latest publicly available production data
- public corporate reports and guidance

Each workbook uses the same directional structure:

- base well productivity
- price and cost assumptions
- WellFi uplift assumptions
- run-life / workover savings assumptions
- drill benchmark assumptions
- fleet-wide and top-tier rollups

## What Was Normalized

The spreadsheets were usable as screening models, but not clean enough to expose directly in the UI.

### 1. ROI naming

The workbooks used inconsistent ROI formulas:

- several sources used `annual value / capex`
- one source used `(annual value - capex) / capex`

The app does not use a vague standalone `ROI` label.

It now exposes:

- `Year-1 cash yield = annual total value / capex`
- `Net year-1 return = (annual total value - capex) / capex`

### 2. Drill productivity basis

One workbook used drill `cost per incremental bbl/d` based on IP30 while the others used a year-one average rate.

The app standardizes on:

- `Drill capex per incremental bbl/d = drill capex / drill year-1 average bbl/d`

Why:

- IP30 is a flush-rate headline
- WellFi uplift is a sustained operating uplift
- year-one average is the fairest apples-to-apples screening basis

The UI still allows `IP30 + decline` as an advanced shortcut, but it resolves back to a year-one average rate before comparison.

### 3. Label drift in one source workbook

One source workbook labeled the top-tier section with a different well count than the formulas actually used.

The app follows the formula count, not the text label.

### 4. Preset assumptions versus user assumptions

The workbooks are now used as presets, not as the app's source of truth.

The app lets engineers override:

- candidate well count
- average oil rate
- WellFi cost
- production uplift
- run-life assumptions
- workover cost
- netback directly, or price/cost stack
- drill capex and drill productivity

## Core Formulas

### WellFi value

```text
incremental_bpd_per_well = avg_oil_rate_per_well * production_uplift_pct

annual_production_value_per_well =
  incremental_bpd_per_well * 365 * operating_netback

extended_run_life_months =
  current_run_life_months * (1 + run_life_extension_pct)

avoided_workovers_per_well_per_year =
  (12 / current_run_life_months) - (12 / extended_run_life_months)

annual_workover_savings_per_well =
  avoided_workovers_per_well_per_year * workover_cost_per_event

annual_total_value_per_well =
  annual_production_value_per_well + annual_workover_savings_per_well

payout_days =
  wellfi_cost_per_well / annual_total_value_per_well * 365

capex_per_incremental_bpd =
  wellfi_cost_per_well / incremental_bpd_per_well
```

### Netback

Quick mode:

```text
operating_netback = direct user input
```

Detailed mode:

```text
operating_netback =
  realized_price * (1 - royalty_rate)
  - variable_operating_cost
  - transport_cost
  - g_and_a_cost
```

### Drill benchmark

Preferred mode:

```text
drill_year_1_avg_bpd = direct user input
```

Advanced shortcut:

```text
drill_year_1_avg_bpd =
  drill_ip30_bpd * (1 - first_year_decline_pct / 2)
```

Comparison metrics:

```text
drill_capex_per_incremental_bpd =
  drill_capex / drill_year_1_avg_bpd

drill_year_1_value =
  drill_year_1_avg_bpd * 365 * operating_netback

drill_payout_months =
  drill_capex / drill_year_1_value * 12
```

## Outputs Shown In The App

### Primary outputs

- payout
- annual value per well
- total program value
- capex per incremental bbl/d
- capital saved versus drilling

### Supporting outputs

- year-1 cash yield
- net year-1 return
- production uplift value
- annualized workover savings
- same-capital drill result
- detailed formula breakdown

## Why The UI Is Split

### Homepage section

Purpose:

- fast credibility
- engineer can change a few assumptions immediately
- keeps the landing page from becoming a full spreadsheet

### Full calculator page

Purpose:

- every major assumption is editable
- progressive disclosure for netback and drill benchmarking
- explicit formula detail for trust

## Known Limits

This is still a screening model.

Main limits:

- annual production uses 365-day uptime
- workover savings are annualized expectations, not literal single-well event timing
- detailed cost mode can overstate costs if full corporate G&A is applied to incremental barrels
- `IP30 + decline` remains a shortcut, not a full decline-curve forecast
- one benchmark source did not break out transportation separately, so that input must be treated carefully

## Implementation Files

- `src/lib/calculator.ts`
- `src/components/calculator/WellFiCalculator.tsx`
- `src/components/calculator/CalculatorInputs.tsx`
- `src/components/calculator/CalculatorResults.tsx`
- `src/components/calculator/CalculatorTeaserSection.tsx`
- `src/app/calculator/page.tsx`
- `src/lib/content.ts`
- `src/app/page.tsx`
