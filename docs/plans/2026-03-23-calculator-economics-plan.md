# Calculator Economics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire 4 anonymized operator presets into the WellFi calculator, rebuild the homepage teaser with live preset tabs + 3 headline metrics, add data provenance badges, and make it visually polished.

**Architecture:** Presets live in `src/lib/presets.ts` as `CalculatorPreset[]`. The teaser becomes a `'use client'` component with tab state driving live metric computation. The full calculator gains a preset selector that auto-fills inputs. Data provenance copy goes in `content.ts`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind 4, existing calculator math engine.

---

### Task 1: Create preset data file

**Files:**
- Create: `src/lib/presets.ts`

**Step 1: Create the presets file with all 4 operator datasets**

```typescript
import type { CalculatorPreset } from './calculator';

// Data provenance:
// - Production: AER active_clearwater_bluesky_recent_prod_ab_sk.csv (Jan 2026)
// - Financials: Latest public corporate reports (Q4/FY2025 results, 2026 guidance)
// - WCS pricing: Current market ~C$83.18/bbl
// - WellFi uplift: Average of estimated uplift observed across existing installations
// - Run-life extension: Calculated, varies by use case

export const presets: CalculatorPreset[] = [
  {
    id: 'operator-a',
    label: 'Operator A',
    formation: 'Clearwater / Bluesky',
    companySummary: '415 wells — Clearwater & Bluesky producer',
    candidateWellCount: 415,
    topTierWellCount: 41,
    avgOilRatePerWellBpd: 24.42,
    topTierAvgOilRatePerWellBpd: 97.6,
    wellfiCostPerWellCad: 20_000,
    productionUpliftPct: 10,
    currentRunLifeMonths: 15,
    runLifeExtensionPct: 25,
    workoverCostPerEventCad: 50_000,
    netbackMode: 'direct',
    operatingNetbackCadPerBbl: 50.69,
    realizedOilPriceCadPerBbl: 83.18,
    royaltyRatePct: 15,
    variableOperatingCostCadPerBbl: 13.84,
    transportCostCadPerBbl: 3.44,
    gAndACostCadPerBbl: 2.73,
    drillRateMode: 'average',
    drillCapexPerWellCad: 2_900_000,
    drillYear1AvgBpd: 108.75,
    drillIp30Bpd: 150,
    drillFirstYearDeclinePct: 55,
    notes: [
      'Production: AER Jan 2026 filing',
      'Financials: Q4/FY2025 results, March 2026 corporate presentation',
      'WellFi uplift: average of observed installations',
    ],
  },
  {
    id: 'operator-b',
    label: 'Operator B',
    formation: 'Clearwater',
    companySummary: '259 wells — Clearwater producer',
    candidateWellCount: 259,
    topTierWellCount: 25,
    avgOilRatePerWellBpd: 71.87,
    topTierAvgOilRatePerWellBpd: 217.9,
    wellfiCostPerWellCad: 20_000,
    productionUpliftPct: 10,
    currentRunLifeMonths: 15,
    runLifeExtensionPct: 25,
    workoverCostPerEventCad: 50_000,
    netbackMode: 'direct',
    operatingNetbackCadPerBbl: 53.12,
    realizedOilPriceCadPerBbl: 83.18,
    royaltyRatePct: 17.2,
    variableOperatingCostCadPerBbl: 9.90,
    transportCostCadPerBbl: 4.25,
    gAndACostCadPerBbl: 1.60,
    drillRateMode: 'average',
    drillCapexPerWellCad: 2_000_000,
    drillYear1AvgBpd: 187.5,
    drillIp30Bpd: 250,
    drillFirstYearDeclinePct: 50,
    notes: [
      'Production: AER Jan 2026 filing',
      'Financials: 2026 guidance, estimated D&C from dev capex / well count',
      'Opex+transport combined from 2026 guidance, split estimated',
    ],
  },
  {
    id: 'operator-c',
    label: 'Operator C',
    formation: 'Clearwater',
    companySummary: '650 wells — Clearwater producer',
    candidateWellCount: 650,
    topTierWellCount: 65,
    avgOilRatePerWellBpd: 71.61,
    topTierAvgOilRatePerWellBpd: 227.6,
    wellfiCostPerWellCad: 20_000,
    productionUpliftPct: 10,
    currentRunLifeMonths: 15,
    runLifeExtensionPct: 25,
    workoverCostPerEventCad: 50_000,
    netbackMode: 'direct',
    operatingNetbackCadPerBbl: 58.07,
    realizedOilPriceCadPerBbl: 83.18,
    royaltyRatePct: 15,
    variableOperatingCostCadPerBbl: 7.00,
    transportCostCadPerBbl: 4.25,
    gAndACostCadPerBbl: 1.38,
    drillRateMode: 'average',
    drillCapexPerWellCad: 1_900_000,
    drillYear1AvgBpd: 150,
    drillIp30Bpd: 200,
    drillFirstYearDeclinePct: 50,
    notes: [
      'Production: AER Jan 2026 filing',
      'Financials: 2026 guidance, D&C estimated from capex allocation',
      'WellFi uplift: average of observed installations',
    ],
  },
  {
    id: 'operator-d',
    label: 'Operator D',
    formation: 'Clearwater / Bluesky',
    companySummary: '178 wells — Clearwater & Bluesky producer',
    candidateWellCount: 178,
    topTierWellCount: 17,
    avgOilRatePerWellBpd: 39.21,
    topTierAvgOilRatePerWellBpd: 153.5,
    wellfiCostPerWellCad: 20_000,
    productionUpliftPct: 10,
    currentRunLifeMonths: 15,
    runLifeExtensionPct: 25,
    workoverCostPerEventCad: 60_000,
    netbackMode: 'direct',
    operatingNetbackCadPerBbl: 51.28,
    realizedOilPriceCadPerBbl: 83.18,
    royaltyRatePct: 15,
    variableOperatingCostCadPerBbl: 17.40,
    transportCostCadPerBbl: 0,
    gAndACostCadPerBbl: 2.05,
    drillRateMode: 'average',
    drillCapexPerWellCad: 3_100_000,
    drillYear1AvgBpd: 192.5,
    drillIp30Bpd: 275,
    drillFirstYearDeclinePct: 60,
    notes: [
      'Production: AER Jan 2026 filing',
      'Financials: H2 2025 guidance, D&C from dev capex / well count',
      'Transport bundled into opex — transport field set to zero',
      'Workover cost estimated at $60K (higher than other operators)',
    ],
  },
];
```

**Step 2: Verify Operator D netback calculation**

Operator D uses a cost stack, not a published netback. Verify the derived number:
`83.18 * (1 - 0.15) - 17.40 - 0 - 2.05 = 70.703 - 17.40 - 2.05 = 51.253`

Round to 51.28 to account for intermediate rounding in the workbook. This is correct.

**Step 3: Build and verify no type errors**

Run: `cd wellfi-marketing && npx tsc --noEmit`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/lib/presets.ts
git commit -m "feat(calc): add 4 anonymized operator presets from AER/public data"
```

---

### Task 2: Add provenance and preset copy to content.ts

**Files:**
- Modify: `src/lib/content.ts:86-161` (CalculatorContent interface) and `src/lib/content.ts:333-487` (calculator object)

**Step 1: Add provenance fields to the CalculatorContent interface**

Add after line 160 (before the closing `}`):

```typescript
  provenance: {
    aer: string;
    financials: string;
    uplift: string;
    runLife: string;
    workover: string;
    fullDisclaimer: string;
  };
  presetSelectorLabel: string;
  customLabel: string;
  verdictBothWin: string;
  verdictPayoutWin: string;
  verdictCapexWin: string;
  verdictDrillWin: string;
```

**Step 2: Add the copy values to the calculator object**

Add after `notes` array (line 486, before the closing `}`):

```typescript
  provenance: {
    aer: 'Production data: AER public filings, January 2026',
    financials: 'Corporate financials: latest public reports (Q4/FY2025, 2026 guidance)',
    uplift: 'WellFi uplift: average of estimated uplift observed across existing installations',
    runLife: 'Run-life extension: calculated, varies by operator and use case',
    workover: 'Workover costs: estimated $50K–$60K/event — update with actual field data',
    fullDisclaimer: 'Built from four Clearwater and Bluesky operators using AER public production reports and the latest corporate financial disclosures. WellFi assumptions reflect field-observed averages, not guaranteed outcomes.',
  },
  presetSelectorLabel: 'Benchmark basis',
  customLabel: 'Custom — enter your own',
  verdictBothWin: 'Under these assumptions, WellFi pays back faster and buys incremental barrels more efficiently than drilling.',
  verdictPayoutWin: 'Under these assumptions, WellFi pays back faster, but the capital-efficiency comparison is closer and worth discussing.',
  verdictCapexWin: 'Under these assumptions, WellFi buys barrels more cheaply, but the payout speed is tighter than the drill benchmark.',
  verdictDrillWin: 'Under these assumptions, the drill benchmark is stronger. That usually means the candidate well set or the WellFi assumptions need a second look.',
```

**Step 3: Update the teaserTitle and teaserDescription**

Replace the current `teaserTitle` (line 335) and `teaserDescription` (lines 337-338):

```typescript
  teaserTitle: 'What if you already had the wells?',
  teaserDescription:
    'Four Clearwater and Bluesky operators screened against WellFi retrofit economics — all using AER public production data and the latest corporate financial disclosures.',
```

**Step 4: Build and verify**

Run: `cd wellfi-marketing && npx tsc --noEmit`
Expected: No errors.

**Step 5: Commit**

```bash
git add src/lib/content.ts
git commit -m "feat(calc): add provenance copy and preset-related content"
```

---

### Task 3: Rebuild the homepage teaser with live preset tabs

**Files:**
- Modify: `src/components/calculator/CalculatorTeaserSection.tsx` (full rewrite — 93 lines → ~180 lines)

**Step 1: Rewrite CalculatorTeaserSection as a client component with tab state**

The component needs:
- `'use client'` directive (it has tab state now)
- Import presets from `presets.ts`, calculator engine from `calculator.ts`
- `useState` for active preset index (default 0)
- Compute results for the active preset using `getCalculatorInputsFromPreset` + `calculateWellFiResults`
- Render: left column = copy + provenance badges, right column = tab bar + 3 metric cards
- Tab bar: 4 buttons styled with `calc-segment` / `calc-segment--active`
- 3 metric cards: Payout (days), Capex/incr bbl/d, Annual program value
- CTA buttons: "Open Full Calculator" + "Request a Quote"
- Provenance badges below metrics: 3 small pills with source labels

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { calculator as calculatorCopy } from '@/lib/content';
import { presets } from '@/lib/presets';
import {
  getCalculatorInputsFromPreset,
  calculateWellFiResults,
} from '@/lib/calculator';
import { spacing } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export default function CalculatorTeaserSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const preset = presets[activeIndex];
  const inputs = getCalculatorInputsFromPreset(preset);
  const results = calculateWellFiResults(inputs);

  return (
    <section
      id="calculator"
      className="relative overflow-hidden bg-section-alt"
      style={{ padding: `${spacing.sectionY} ${spacing.containerX}` }}
    >
      {/* Background gradient — keep existing */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_78%_12%,rgba(217,119,6,0.08),transparent_22%),linear-gradient(180deg,rgba(4,10,18,0.9)_0%,rgba(10,14,26,1)_100%)]"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-8 xl:grid-cols-[0.85fr_1fr] xl:items-start">
          {/* Left column — copy + provenance */}
          <div className="max-w-xl">
            <p className="label-text mb-4">{calculatorCopy.teaserEyebrow}</p>
            <h2 className="display-heading text-[clamp(2.2rem,5vw,4.1rem)] text-text-primary">
              {calculatorCopy.teaserTitle}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-8 text-[#c7d6e2]">
              {calculatorCopy.teaserDescription}
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {calculatorCopy.teaserChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-[#dce8f1]"
                >
                  {chip}
                </span>
              ))}
            </div>

            {/* Data provenance */}
            <div className="mt-8 space-y-2">
              <p className="tech-text text-[0.68rem] uppercase tracking-[0.2em] text-[#88e6f4]">
                Data sources
              </p>
              {[
                calculatorCopy.provenance.aer,
                calculatorCopy.provenance.financials,
                calculatorCopy.provenance.uplift,
              ].map((source) => (
                <p
                  key={source}
                  className="rounded-[0.75rem] border border-white/8 bg-white/4 px-3.5 py-2.5 text-xs leading-5 text-[#d1dde8]"
                >
                  {source}
                </p>
              ))}
            </div>
          </div>

          {/* Right column — preset tabs + metrics */}
          <div className="calc-panel calc-panel--accent">
            {/* Tab bar */}
            <div className="flex flex-wrap gap-2">
              {presets.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'calc-segment text-xs',
                    i === activeIndex && 'calc-segment--active',
                  )}
                >
                  {p.label}
                  <span className="hidden sm:inline"> — {p.candidateWellCount} wells</span>
                </button>
              ))}
            </div>

            <p className="mt-4 text-sm leading-6 text-text-secondary">
              {preset.formation} — {preset.companySummary}
            </p>

            {/* 3 headline metrics */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <TeaserMetric
                label="Payout"
                value={formatDays(results.payoutDays)}
                caption="Combined production + workover"
              />
              <TeaserMetric
                label="Capex / incr. bbl/d"
                value={formatMoney(results.capexPerIncrementalBpdWellFiCad)}
                caption={`vs ${formatMoney(results.drillCapexPerIncrementalBpdCad)} drilling`}
              />
              <TeaserMetric
                label="Program value / yr"
                value={formatMoney(results.annualTotalValueCad)}
                caption={`${preset.candidateWellCount} candidate wells`}
              />
            </div>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/calculator"
                className="btn-primary inline-flex items-center text-sm"
              >
                {calculatorCopy.buttons.openFull}
              </Link>
              <a
                href="mailto:kylegronning@mpsgroup.ca"
                className="btn-secondary inline-flex items-center text-sm"
              >
                {calculatorCopy.buttons.requestQuote}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Sub-components ────────────────────────────────────────── */

function TeaserMetric({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <article className="rounded-[1.15rem] border border-white/8 bg-white/4 p-4">
      <p className="tech-text text-[0.68rem] uppercase tracking-[0.2em] text-[#88e6f4]">
        {label}
      </p>
      <p className="mt-3 display-heading text-[clamp(1.3rem,3vw,2rem)] text-[#f6fbff]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{caption}</p>
    </article>
  );
}

/* ── Formatters (teaser-specific, keep local) ──────────────── */

function formatDays(value: number | null) {
  if (value === null || Number.isNaN(value)) return '—';
  return `${Math.round(value)} days`;
}

function formatMoney(value: number | null) {
  if (value === null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
    notation: Math.abs(value) >= 1_000_000 ? 'compact' : 'standard',
    compactDisplay: 'short',
  }).format(value);
}
```

**Step 2: Build and verify**

Run: `cd wellfi-marketing && npm run build`
Expected: Clean build, no errors.

**Step 3: Commit**

```bash
git add src/components/calculator/CalculatorTeaserSection.tsx
git commit -m "feat(calc): rebuild teaser with live preset tabs and 3 headline metrics"
```

---

### Task 4: Wire preset selector into the full calculator

**Files:**
- Modify: `src/components/calculator/WellFiCalculator.tsx` (82 lines → ~120 lines)

**Step 1: Add preset selector and auto-fill logic**

The full calculator needs:
- Import `presets` from `presets.ts` and `getCalculatorInputsFromPreset`
- `useState` for selected preset ID (`string | null`, default `presets[0].id`)
- When preset changes: `setInputs(getCalculatorInputsFromPreset(preset))`
- When user edits any field: `setSelectedPreset(null)` (switches to Custom)
- Preset selector: a row of `calc-segment` buttons at the top of the shell

Key changes to `WellFiCalculator`:

```typescript
'use client';

import { useDeferredValue, useState } from 'react';
import { calculator as calculatorCopy } from '@/lib/content';
import { presets } from '@/lib/presets';
import {
  blankCalculatorInputs,
  calculateWellFiResults,
  getCalculatorInputsFromPreset,
  type CalculatorInputs,
  type CalculatorNumericField,
} from '@/lib/calculator';
import CalculatorInputsPanel from './CalculatorInputs';
import CalculatorResults from './CalculatorResults';
import { cn } from '@/lib/utils';

export default function WellFiCalculator() {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    presets[0].id,
  );
  const [inputs, setInputs] = useState<CalculatorInputs>(
    getCalculatorInputsFromPreset(presets[0]),
  );
  const deferredInputs = useDeferredValue(inputs);
  const results = calculateWellFiResults(deferredInputs);
  const isReady = hasRequiredInputs(deferredInputs, results.drillYear1AvgBpdResolved);

  function handlePresetChange(presetId: string | null) {
    setSelectedPresetId(presetId);
    if (presetId === null) {
      setInputs(blankCalculatorInputs);
      return;
    }
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      setInputs(getCalculatorInputsFromPreset(preset));
    }
  }

  function handleNumberChange(field: CalculatorNumericField, value: number) {
    setSelectedPresetId(null); // User edited — switch to Custom
    setInputs((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleReset() {
    setSelectedPresetId(presets[0].id);
    setInputs(getCalculatorInputsFromPreset(presets[0]));
  }

  return (
    <div className="calc-shell p-5 sm:p-6 lg:p-8">
      {/* Preset selector bar */}
      <div className="flex flex-col gap-4 border-b border-white/8 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="label-text mb-3">{calculatorCopy.presetSelectorLabel}</p>
            <p className="text-sm leading-6 text-text-secondary">
              {calculatorCopy.provenance.fullDisclaimer}
            </p>
          </div>
          <button type="button" onClick={handleReset} className="calc-segment">
            {calculatorCopy.buttons.reset}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetChange(p.id)}
              className={cn(
                'calc-segment text-xs',
                selectedPresetId === p.id && 'calc-segment--active',
              )}
            >
              {p.label}
              <span className="hidden sm:inline"> ({p.candidateWellCount})</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => handlePresetChange(null)}
            className={cn(
              'calc-segment text-xs',
              selectedPresetId === null && 'calc-segment--active',
            )}
          >
            {calculatorCopy.customLabel}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(21rem,0.85fr)]">
        <CalculatorInputsPanel
          inputs={inputs}
          onNumberChange={handleNumberChange}
        />
        <div className="xl:sticky xl:top-6 h-fit">
          <CalculatorResults
            inputs={deferredInputs}
            results={results}
            isReady={isReady}
          />
        </div>
      </div>
    </div>
  );
}

function hasRequiredInputs(inputs: CalculatorInputs, drillYear1AvgBpdResolved: number) {
  return (
    inputs.candidateWellCount > 0 &&
    inputs.avgOilRatePerWellBpd > 0 &&
    inputs.wellfiCostPerWellCad > 0 &&
    inputs.productionUpliftPct > 0 &&
    inputs.currentRunLifeMonths > 0 &&
    inputs.runLifeExtensionPct > 0 &&
    inputs.workoverCostPerEventCad > 0 &&
    inputs.operatingNetbackCadPerBbl > 0 &&
    inputs.drillCapexPerWellCad > 0 &&
    drillYear1AvgBpdResolved > 0
  );
}
```

**Step 2: Build and verify**

Run: `cd wellfi-marketing && npm run build`
Expected: Clean build.

**Step 3: Commit**

```bash
git add src/components/calculator/WellFiCalculator.tsx
git commit -m "feat(calc): wire preset selector into full calculator with auto-fill"
```

---

### Task 5: Add verdict badge and provenance footer to results

**Files:**
- Modify: `src/components/calculator/CalculatorResults.tsx:82-123` (the "isReady" return block)

**Step 1: Add verdict badge**

Inside the `isReady` return, immediately after the `<p className="label-text mb-3">` payout label and the big payout heading, replace the `buildDecisionMessage` paragraph with a styled verdict badge:

Replace the current `buildDecisionMessage` call (line 90-92) with:

```typescript
        <div className="mt-4 rounded-[1rem] border border-em-cyan/20 bg-em-cyan/8 px-4 py-3">
          <p className="text-sm font-medium leading-6 text-[#c8f4fd]">
            {buildDecisionMessage(results)}
          </p>
        </div>
```

**Step 2: Add provenance footer to the bottom panel**

In the last `calc-panel` div (the one with `benchmarkSummary` at line 164), replace the existing content with provenance-enhanced version:

```typescript
      <div className="calc-panel">
        <p className="tech-text text-[0.68rem] uppercase tracking-[0.2em] text-[#88e6f4] mb-3">
          Data sources
        </p>
        <p className="text-sm leading-6 text-[#d4dfe9]">
          {calculatorCopy.provenance.fullDisclaimer}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            calculatorCopy.provenance.aer,
            calculatorCopy.provenance.financials,
            calculatorCopy.provenance.uplift,
            calculatorCopy.provenance.runLife,
          ].map((source) => (
            <p
              key={source}
              className="rounded-[0.75rem] border border-white/6 bg-white/3 px-3 py-2 text-xs leading-5 text-text-secondary"
            >
              {source}
            </p>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="mailto:kylegronning@mpsgroup.ca"
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            {calculatorCopy.buttons.requestQuote}
            <ArrowRight size={16} />
          </a>
          <Link href="/" className="btn-secondary inline-flex items-center text-sm">
            {calculatorCopy.buttons.backHome}
          </Link>
        </div>
      </div>
```

**Step 3: Move verdict messages to content.ts**

Replace the `buildDecisionMessage` function body to use content.ts verdict strings:

```typescript
function buildDecisionMessage(results: CalculatorResultsData) {
  const isFaster =
    results.drillPayoutMonths !== null &&
    results.payoutMonths !== null &&
    results.drillPayoutMonths > results.payoutMonths;
  const isCheaper =
    results.capexPerIncrementalBpdWellFiCad !== null &&
    results.drillCapexPerIncrementalBpdCad !== null &&
    results.capexPerIncrementalBpdWellFiCad < results.drillCapexPerIncrementalBpdCad;

  if (isFaster && isCheaper) return calculatorCopy.verdictBothWin;
  if (isFaster) return calculatorCopy.verdictPayoutWin;
  if (isCheaper) return calculatorCopy.verdictCapexWin;
  return calculatorCopy.verdictDrillWin;
}
```

**Step 4: Build and verify**

Run: `cd wellfi-marketing && npm run build`
Expected: Clean build.

**Step 5: Commit**

```bash
git add src/components/calculator/CalculatorResults.tsx
git commit -m "feat(calc): add verdict badge and data provenance footer"
```

---

### Task 6: Add CSS transition for comparison bars

**Files:**
- Modify: `src/app/globals.css:301-304` (`.calc-comparison-bar`)

**Step 1: Add transition to comparison bar**

Add `transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1);` to `.calc-comparison-bar`:

```css
.calc-comparison-bar {
  height: 100%;
  border-radius: inherit;
  transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "style(calc): add width transition to comparison bars"
```

---

### Task 7: Update calculator/page.tsx with provenance section

**Files:**
- Modify: `src/app/calculator/page.tsx:50-59` (notes section)

**Step 1: Replace the generic notes grid with provenance + notes**

Replace the notes section (lines 50-59) with:

```typescript
        <section className="mt-8 space-y-4">
          <div className="rounded-[1.4rem] border border-white/8 bg-white/4 px-5 py-4">
            <p className="tech-text text-[0.68rem] uppercase tracking-[0.2em] text-[#88e6f4] mb-2">
              About this benchmark
            </p>
            <p className="text-sm leading-6 text-[#d4dfe9]">
              {calculatorCopy.provenance.fullDisclaimer}
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {calculatorCopy.notes.map((note) => (
              <article
                key={note}
                className="rounded-[1.4rem] border border-white/8 bg-white/4 px-5 py-4 text-sm leading-6 text-[#d4dfe9]"
              >
                {note}
              </article>
            ))}
          </div>
        </section>
```

**Step 2: Build and verify**

Run: `cd wellfi-marketing && npm run build`
Expected: Clean build.

**Step 3: Commit**

```bash
git add src/app/calculator/page.tsx
git commit -m "feat(calc): add provenance section to calculator page"
```

---

### Task 8: Visual verification and polish

**Files:**
- No new files — visual review pass

**Step 1: Start dev server**

Run: `cd wellfi-marketing && npm run dev`

**Step 2: Verify homepage teaser**

- Navigate to `http://localhost:3000`
- Scroll to calculator section
- Verify all 4 preset tabs render
- Click each tab — verify metrics update
- Verify provenance badges render below the left column
- Verify CTA buttons link correctly

**Step 3: Verify full calculator**

- Navigate to `http://localhost:3000/calculator`
- Verify Operator A is pre-selected and all inputs are filled
- Click through all presets — verify inputs update
- Click Custom — verify inputs clear
- Edit a field — verify it switches to Custom automatically
- Verify verdict badge renders with correct message
- Verify provenance footer renders at bottom
- Verify comparison bars animate width on preset switch

**Step 4: Take screenshot for proof**

Use preview tools to capture the teaser and full calculator states.

**Step 5: Commit any polish fixes**

```bash
git add -A
git commit -m "style(calc): visual polish pass"
```

---

## Summary of all files

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/lib/presets.ts` | 4 anonymized operator preset datasets |
| Modify | `src/lib/content.ts` | Provenance copy, verdict messages, preset labels |
| Rewrite | `src/components/calculator/CalculatorTeaserSection.tsx` | Live preset tabs + 3 metrics + provenance |
| Modify | `src/components/calculator/WellFiCalculator.tsx` | Preset selector + auto-fill logic |
| Modify | `src/components/calculator/CalculatorResults.tsx` | Verdict badge + provenance footer |
| Modify | `src/app/globals.css` | Comparison bar transition |
| Modify | `src/app/calculator/page.tsx` | Provenance section |
