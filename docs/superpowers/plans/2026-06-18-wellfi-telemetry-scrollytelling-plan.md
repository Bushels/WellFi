# WellFi Telemetry Scrollytelling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the second homepage section that explains below-pump WellFi telemetry first, then shows behind-casing and dual-tool expansion cases with a hydrostatic-head pressure cue.

**Architecture:** Add centralized telemetry content in `src/lib/content.ts`, focused presentational components under `src/components/telemetry/`, and a single GSAP ScrollTrigger section inserted directly below the existing `IslandHero`. The V1 uses existing public image assets with DOM/SVG overlays so the section can ship before a new Blender render is finalized.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4 utility classes, GSAP ScrollTrigger with `@gsap/react`, `lucide-react`, Vitest.

---

## Scope Check

This is one subsystem: a homepage scrollytelling section. It does not include a new Blender render pipeline, new R3F scene, deployment, or hero re-export. The implementation must keep the existing hero untouched.

## File Structure

- Modify: `src/lib/content.ts`
  - Adds typed telemetry copy, metrics, placement modes, hydrostatic-head callout text, and application cards.
- Create: `src/lib/telemetry-content.test.ts`
  - Locks terminology and claim boundaries, especially `Flow Insight` and hydrostatic-head wording.
- Create: `src/components/telemetry/TelemetryMetricRow.tsx`
  - Renders the five measurement icons.
- Create: `src/components/telemetry/TelemetryApplications.tsx`
  - Renders application cards after the pinned story.
- Create: `src/components/telemetry/TelemetryCutawayStage.tsx`
  - Renders the cutaway image, mode panels, SVG leader lines, callouts, and hydrostatic-head fluid-column cue.
- Create: `src/components/telemetry/TelemetryScrollytellingSection.tsx`
  - Owns the section layout and GSAP ScrollTrigger timeline.
- Modify: `src/app/page.tsx`
  - Imports and places the new section directly below `IslandHero`.
- Modify: `src/lib/content.ts`
  - Updates `navLinks` so `Telemetry` points to the new section and `Proof` becomes the later technical/spec anchor.

---

### Task 1: Add Telemetry Content Contract

**Files:**
- Modify: `src/lib/content.ts`
- Create: `src/lib/telemetry-content.test.ts`

- [ ] **Step 1: Write the failing content tests**

Create `src/lib/telemetry-content.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { navLinks, telemetry } from './content';

describe('telemetry content', () => {
  it('lists the five measurement families in engineer-facing order', () => {
    expect(telemetry.metrics.map((metric) => metric.label)).toEqual([
      'Pressure',
      'Temperature',
      'Vibration',
      'Water Cut',
      'Flow Insight',
    ]);
  });

  it('uses flow insight instead of a hard flow-rate claim', () => {
    const allText = JSON.stringify(telemetry).toLowerCase();
    expect(allText).toContain('flow insight');
    expect(allText).not.toContain('flow rate');
  });

  it('includes hydrostatic head as pressure context for the below-pump story', () => {
    expect(telemetry.hydrostaticHead.title).toBe('Hydrostatic Head');
    expect(telemetry.hydrostaticHead.description.toLowerCase()).toContain('fluid column');
    expect(telemetry.hydrostaticHead.description.toLowerCase()).toContain('pump intake');
  });

  it('keeps the three placement modes in the approved hierarchy', () => {
    expect(telemetry.placementModes.map((mode) => mode.id)).toEqual([
      'below-pump',
      'behind-casing',
      'dual-wellfi',
    ]);
  });

  it('keeps the application cards focused on production engineering decisions', () => {
    expect(telemetry.applications.map((card) => card.title)).toEqual([
      'Pump Optimization',
      'Drawdown Management',
      'Pressure Build-Up Testing',
      'Reservoir Pressure Monitoring',
      'Water Cut Tracking',
      'Flow Insight',
      'Pump Protection',
      'Cableless Gauge Backup',
    ]);
  });

  it('points the primary telemetry nav link at the new section', () => {
    expect(navLinks).toContainEqual({ label: 'Telemetry', href: '#telemetry' });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
npm test -- src/lib/telemetry-content.test.ts
```

Expected: fail because `telemetry` is not exported from `src/lib/content.ts`.

- [ ] **Step 3: Add telemetry interfaces**

In `src/lib/content.ts`, add these interfaces after `WorkflowContent`:

```ts
export interface TelemetryMetric {
  icon: string;
  label: string;
  shortLabel: string;
  description: string;
}

export interface TelemetryCallout {
  id: string;
  label: string;
  value: string;
  description: string;
  x: number;
  y: number;
}

export interface TelemetryPlacementMode {
  id: 'below-pump' | 'behind-casing' | 'dual-wellfi';
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  callouts: TelemetryCallout[];
}

export interface TelemetryApplicationCard {
  icon: string;
  title: string;
  description: string;
}

export interface TelemetryContent {
  eyebrow: string;
  title: string;
  description: string;
  metricSummary: string;
  metrics: TelemetryMetric[];
  hydrostaticHead: {
    title: string;
    description: string;
    label: string;
  };
  placementModes: TelemetryPlacementMode[];
  applications: TelemetryApplicationCard[];
}
```

- [ ] **Step 4: Update nav links**

Replace the existing `navLinks` export in `src/lib/content.ts` with:

```ts
export const navLinks: NavLink[] = [
  { label: 'Telemetry', href: '#telemetry' },
  { label: 'SAGD',      href: '#sagd-interactive' },
  { label: 'Proof',     href: '#proof' },
];
```

- [ ] **Step 5: Add telemetry content**

In `src/lib/content.ts`, add this block before the existing `Proof Section` comment:

```ts
// ---------------------------------------------------------------------------
// Telemetry Scrollytelling
// ---------------------------------------------------------------------------

export const telemetry: TelemetryContent = {
  eyebrow: 'Below-pump telemetry',
  title: 'Wireless Data Where Lift Decisions Are Made',
  description:
    'Place WellFi below pump, behind casing, or across dual-tool intervals to monitor downhole conditions without running cable.',
  metricSummary: 'Pressure. Temperature. Vibration. Water cut. Flow insight.',
  metrics: [
    {
      icon: 'Gauge',
      label: 'Pressure',
      shortLabel: 'Pressure',
      description: 'Track pump-intake and reservoir response pressure where the lift decision is made.',
    },
    {
      icon: 'Thermometer',
      label: 'Temperature',
      shortLabel: 'Temp',
      description: 'Watch temperature trends that show changing downhole conditions and operating state.',
    },
    {
      icon: 'Activity',
      label: 'Vibration',
      shortLabel: 'Vibration',
      description: 'Use vibration changes as an early signal of pump stress, interference, or abnormal operation.',
    },
    {
      icon: 'Droplets',
      label: 'Water Cut',
      shortLabel: 'Water Cut',
      description: 'Track changing produced-fluid conditions from the tool location or dual-tool layouts.',
    },
    {
      icon: 'TrendingUp',
      label: 'Flow Insight',
      shortLabel: 'Flow',
      description: 'Use paired pressure, temperature, and fluid-condition changes to interpret interval behavior.',
    },
  ],
  hydrostaticHead: {
    title: 'Hydrostatic Head',
    label: 'Fluid column around pump',
    description:
      'The pressure reading is interpreted against the fluid column around the pump intake, helping engineers see drawdown instead of guessing from surface behavior alone.',
  },
  placementModes: [
    {
      id: 'below-pump',
      label: 'Below Pump',
      eyebrow: 'Primary application',
      title: 'Measure below the pump before changing the pump.',
      description:
        'Below-pump WellFi gives engineers pressure, temperature, vibration, water-cut, and flow insight at the point where lift decisions are made.',
      callouts: [
        {
          id: 'intake-pressure',
          label: 'Pump-intake pressure',
          value: 'P intake',
          description: 'Pressure below the pump, read against the local fluid column.',
          x: 54,
          y: 38,
        },
        {
          id: 'pump-vibration',
          label: 'Vibration',
          value: 'mm/s RMS',
          description: 'Pump vibration trend for stress, pump-off, or interference signals.',
          x: 42,
          y: 50,
        },
        {
          id: 'fluid-change',
          label: 'Water cut',
          value: 'Fluid trend',
          description: 'Changing produced-fluid condition close to the lift point.',
          x: 60,
          y: 61,
        },
      ],
    },
    {
      id: 'behind-casing',
      label: 'Behind Casing',
      eyebrow: 'Expansion application',
      title: 'Move the same telemetry logic outside the intermediate.',
      description:
        'Behind-casing or intermediate placement supports reservoir-pressure trends and condition changes where a wired gauge is difficult to justify.',
      callouts: [
        {
          id: 'behind-casing-pressure',
          label: 'Behind-casing pressure',
          value: 'Trend',
          description: 'Reservoir response trend outside the main lift string.',
          x: 34,
          y: 45,
        },
        {
          id: 'surface-handoff',
          label: 'Wireless handoff',
          value: 'No cable',
          description: 'Data reaches surface without running a downhole cable.',
          x: 66,
          y: 30,
        },
      ],
    },
    {
      id: 'dual-wellfi',
      label: 'Dual WellFi',
      eyebrow: 'Advanced layout',
      title: 'Use paired tools to read interval behavior.',
      description:
        'Dual WellFi layouts support differential-pressure, water-cut, and flow insight across an interval without turning the page into a hard flow-rate claim.',
      callouts: [
        {
          id: 'upper-tool',
          label: 'Upper WellFi',
          value: 'P1',
          description: 'Upper interval reference point.',
          x: 45,
          y: 34,
        },
        {
          id: 'lower-tool',
          label: 'Lower WellFi',
          value: 'P2',
          description: 'Lower interval reference point for differential behavior.',
          x: 58,
          y: 68,
        },
        {
          id: 'interval-insight',
          label: 'Interval response',
          value: 'P1 - P2',
          description: 'Pressure and fluid-condition change across the interval.',
          x: 68,
          y: 52,
        },
      ],
    },
  ],
  applications: [
    {
      icon: 'Settings2',
      title: 'Pump Optimization',
      description: 'Below-pump pressure, temperature, and vibration for pump intake and head monitoring.',
    },
    {
      icon: 'Gauge',
      title: 'Drawdown Management',
      description: 'Increase drawdown with better confidence instead of guessing where the pump is operating.',
    },
    {
      icon: 'LineChart',
      title: 'Pressure Build-Up Testing',
      description: 'Shut in the well and watch pressure recovery without running cable.',
    },
    {
      icon: 'Radar',
      title: 'Reservoir Pressure Monitoring',
      description: 'Track bottomhole or behind-casing pressure trends over time.',
    },
    {
      icon: 'Droplets',
      title: 'Water Cut Tracking',
      description: 'Track changing produced-fluid conditions from behind casing or dual-tool layouts.',
    },
    {
      icon: 'TrendingUp',
      title: 'Flow Insight',
      description: 'Use paired pressure, temperature, water-cut, and interval changes to interpret flow behavior.',
    },
    {
      icon: 'ShieldAlert',
      title: 'Pump Protection',
      description: 'Detect pressure-change events, pump-off trends, gas interference, or abnormal vibration earlier.',
    },
    {
      icon: 'Cable',
      title: 'Cableless Gauge Backup',
      description: 'Add wireless backup or retrofit telemetry where wired gauges are expensive, risky, or already failed.',
    },
  ],
};
```

- [ ] **Step 6: Run the content test**

Run:

```powershell
npm test -- src/lib/telemetry-content.test.ts
```

Expected: pass.

- [ ] **Step 7: Commit Task 1**

Run:

```powershell
git add src/lib/content.ts src/lib/telemetry-content.test.ts
git commit -m "feat(telemetry): add section content model"
```

---

### Task 2: Build Metric Row And Application Cards

**Files:**
- Create: `src/components/telemetry/TelemetryMetricRow.tsx`
- Create: `src/components/telemetry/TelemetryApplications.tsx`

- [ ] **Step 1: Create the metric row component**

Create `src/components/telemetry/TelemetryMetricRow.tsx`:

```tsx
import {
  Activity,
  Droplets,
  Gauge,
  Thermometer,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { TelemetryMetric } from '@/lib/content';

const iconMap: Record<string, LucideIcon> = {
  Activity,
  Droplets,
  Gauge,
  Thermometer,
  TrendingUp,
};

interface TelemetryMetricRowProps {
  metrics: TelemetryMetric[];
}

export default function TelemetryMetricRow({ metrics }: TelemetryMetricRowProps) {
  return (
    <div className="telemetry-metric-row grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {metrics.map((metric) => {
        const Icon = iconMap[metric.icon] ?? Gauge;
        return (
          <div
            key={metric.label}
            className="telemetry-metric rounded-md border border-white/10 bg-white/[0.035] p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-em-cyan/25 bg-em-cyan/10 text-em-glow">
              <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-heading text-sm font-semibold text-text-primary">
              {metric.label}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              {metric.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create the applications component**

Create `src/components/telemetry/TelemetryApplications.tsx`:

```tsx
import {
  Cable,
  Droplets,
  Gauge,
  LineChart,
  Radar,
  Settings2,
  ShieldAlert,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { TelemetryApplicationCard } from '@/lib/content';

const iconMap: Record<string, LucideIcon> = {
  Cable,
  Droplets,
  Gauge,
  LineChart,
  Radar,
  Settings2,
  ShieldAlert,
  TrendingUp,
};

interface TelemetryApplicationsProps {
  applications: TelemetryApplicationCard[];
}

export default function TelemetryApplications({ applications }: TelemetryApplicationsProps) {
  return (
    <div className="telemetry-applications mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {applications.map((card) => {
        const Icon = iconMap[card.icon] ?? Gauge;
        return (
          <article
            key={card.title}
            className="telemetry-application rounded-md border border-white/10 bg-[#07101a]/80 p-5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-em-glow">
              <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-heading text-base font-semibold text-text-primary">
              {card.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {card.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Run TypeScript**

Run:

```powershell
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 4: Commit Task 2**

Run:

```powershell
git add src/components/telemetry/TelemetryMetricRow.tsx src/components/telemetry/TelemetryApplications.tsx
git commit -m "feat(telemetry): add metric and application panels"
```

---

### Task 3: Build The Cutaway Stage With Hydrostatic Head Cue

**Files:**
- Create: `src/components/telemetry/TelemetryCutawayStage.tsx`

- [ ] **Step 1: Create the cutaway stage component**

Create `src/components/telemetry/TelemetryCutawayStage.tsx`:

```tsx
import Image from 'next/image';
import type { TelemetryContent } from '@/lib/content';

interface TelemetryCutawayStageProps {
  telemetry: TelemetryContent;
}

export default function TelemetryCutawayStage({ telemetry }: TelemetryCutawayStageProps) {
  return (
    <div className="telemetry-stage relative overflow-hidden rounded-md border border-white/10 bg-[#020408] shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
      <div className="grid min-h-[min(78vh,46rem)] lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative isolate min-h-[34rem] overflow-hidden">
          <Image
            src="/wellfi/wellfi_multilateral_cutaway.png"
            alt="Cutaway wellbore illustration showing WellFi telemetry placement options around pump, casing, and interval layouts."
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover object-center opacity-75"
            priority={false}
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_52%_44%,rgba(248,113,113,0.22),transparent_24%),linear-gradient(180deg,rgba(2,4,8,0.12)_0%,rgba(2,4,8,0.82)_100%)]"
          />

          <div
            aria-hidden="true"
            className="telemetry-fluid-column absolute left-[46%] top-[22%] h-[52%] w-[7%] rounded-full border border-cyan-200/25 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(34,211,238,0.28),rgba(239,68,68,0.18))] shadow-[0_0_40px_rgba(34,211,238,0.12)]"
          />

          <div
            aria-hidden="true"
            className="telemetry-hydrostatic-ring absolute left-[41%] top-[39%] h-[16%] w-[17%] rounded-full border border-em-glow/45 shadow-[0_0_35px_rgba(248,113,113,0.25)]"
          />

          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              className="telemetry-leader telemetry-leader-pressure"
              d="M 50 45 C 61 43, 65 36, 72 32"
              fill="none"
              stroke="rgba(248,113,113,0.75)"
              strokeWidth="0.35"
            />
            <path
              className="telemetry-leader telemetry-leader-hydrostatic"
              d="M 49 58 C 36 58, 31 52, 25 44"
              fill="none"
              stroke="rgba(34,211,238,0.7)"
              strokeWidth="0.3"
            />
          </svg>

          <div className="telemetry-callout telemetry-callout-pressure absolute right-[6%] top-[24%] max-w-[15rem] rounded-md border border-em-glow/35 bg-[#030710]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.45)]">
            <p className="tech-text text-[0.68rem] uppercase tracking-[0.2em] text-em-glow">
              Pressure
            </p>
            <h3 className="mt-2 font-heading text-base font-semibold text-text-primary">
              Pump-intake pressure
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              Measured below the pump where drawdown and lift decisions are made.
            </p>
          </div>

          <div className="telemetry-callout telemetry-callout-hydrostatic absolute left-[6%] top-[40%] max-w-[16rem] rounded-md border border-cyan-200/25 bg-[#03111a]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.45)]">
            <p className="tech-text text-[0.68rem] uppercase tracking-[0.2em] text-cyan-200">
              {telemetry.hydrostaticHead.title}
            </p>
            <h3 className="mt-2 font-heading text-base font-semibold text-text-primary">
              {telemetry.hydrostaticHead.label}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              {telemetry.hydrostaticHead.description}
            </p>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(2,4,8,0)_0%,rgba(2,4,8,0.95)_100%)]" />
        </div>

        <div className="relative border-t border-white/10 bg-[#050b12]/94 p-5 lg:border-l lg:border-t-0 lg:p-6">
          <div className="telemetry-mode-list grid gap-3">
            {telemetry.placementModes.map((mode, index) => (
              <article
                key={mode.id}
                data-placement-mode={mode.id}
                className="telemetry-mode rounded-md border border-white/10 bg-white/[0.035] p-4"
                style={{ opacity: index === 0 ? 1 : 0.45 }}
              >
                <p className="tech-text text-[0.65rem] uppercase tracking-[0.2em] text-em-glow">
                  {mode.eyebrow}
                </p>
                <h3 className="mt-2 font-heading text-lg font-semibold text-text-primary">
                  {mode.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {mode.description}
                </p>
                <ul className="mt-4 grid gap-2">
                  {mode.callouts.map((callout) => (
                    <li
                      key={callout.id}
                      className="flex items-start gap-3 text-xs leading-relaxed text-text-secondary"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-em-glow" />
                      <span>
                        <span className="font-medium text-text-primary">{callout.label}:</span>{' '}
                        {callout.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run TypeScript**

Run:

```powershell
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 3: Commit Task 3**

Run:

```powershell
git add src/components/telemetry/TelemetryCutawayStage.tsx
git commit -m "feat(telemetry): add cutaway stage with hydrostatic cue"
```

---

### Task 4: Add Scrollytelling Section And GSAP Timeline

**Files:**
- Create: `src/components/telemetry/TelemetryScrollytellingSection.tsx`

- [ ] **Step 1: Create the section component**

Create `src/components/telemetry/TelemetryScrollytellingSection.tsx`:

```tsx
'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { telemetry } from '@/lib/content';
import TelemetryApplications from './TelemetryApplications';
import TelemetryCutawayStage from './TelemetryCutawayStage';
import TelemetryMetricRow from './TelemetryMetricRow';

gsap.registerPlugin(ScrollTrigger);

export default function TelemetryScrollytellingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const desktop = window.matchMedia('(min-width: 1024px)').matches;

      const metrics = section.querySelectorAll('.telemetry-metric');
      const stageShell = section.querySelector('.telemetry-stage');
      const modes = section.querySelectorAll<HTMLElement>('.telemetry-mode');
      const pressureCallout = section.querySelector('.telemetry-callout-pressure');
      const hydrostaticCallout = section.querySelector('.telemetry-callout-hydrostatic');
      const fluidColumn = section.querySelector('.telemetry-fluid-column');
      const hydrostaticRing = section.querySelector('.telemetry-hydrostatic-ring');
      const leaders = section.querySelectorAll('.telemetry-leader');
      const applications = section.querySelectorAll('.telemetry-application');
      const revealEls = [
        ...Array.from(metrics),
        stageShell,
        ...Array.from(modes),
        pressureCallout,
        hydrostaticCallout,
        fluidColumn,
        hydrostaticRing,
        ...Array.from(leaders),
        ...Array.from(applications),
      ].filter(Boolean);

      if (prefersReduced || !desktop) {
        gsap.set(revealEls, {
          autoAlpha: 1,
          y: 0,
          x: 0,
          scale: 1,
          filter: 'none',
        });
        return;
      }

      gsap.set(metrics, { autoAlpha: 0, y: 18 });
      gsap.set(stageShell, { autoAlpha: 0, y: 28, scale: 0.985 });
      gsap.set([pressureCallout, hydrostaticCallout, fluidColumn, hydrostaticRing, leaders], {
        autoAlpha: 0,
      });
      gsap.set(applications, { autoAlpha: 0, y: 22 });
      modes.forEach((mode, index) => {
        gsap.set(mode, { autoAlpha: index === 0 ? 1 : 0.35, y: index === 0 ? 0 : 8 });
      });

      const setMode = (activeIndex: number) => {
        modes.forEach((mode, index) => {
          gsap.to(mode, {
            autoAlpha: index === activeIndex ? 1 : 0.35,
            y: index === activeIndex ? 0 : 8,
            duration: 0.35,
            overwrite: 'auto',
          });
        });
      };

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=260%',
          pin: stage,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      tl.addLabel('metrics')
        .to(metrics, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 })
        .addLabel('belowPump')
        .to(stageShell, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7 }, '<0.15')
        .add(() => setMode(0))
        .addLabel('callouts')
        .to([pressureCallout, leaders], { autoAlpha: 1, duration: 0.45 }, '+=0.25')
        .addLabel('hydrostaticHead')
        .to([fluidColumn, hydrostaticRing, hydrostaticCallout], { autoAlpha: 1, duration: 0.5 }, '+=0.25')
        .to(fluidColumn, { scaleY: 1.04, transformOrigin: '50% 100%', duration: 0.45 }, '<')
        .addLabel('behindCasing')
        .add(() => setMode(1), '+=0.45')
        .to(stageShell, { x: -18, duration: 0.6 }, '<')
        .addLabel('dualWellfi')
        .add(() => setMode(2), '+=0.55')
        .to(stageShell, { x: 18, duration: 0.6 }, '<')
        .addLabel('formation')
        .to(stageShell, { y: -24, scale: 1.025, duration: 0.7 }, '+=0.35')
        .to(applications, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07 }, '<0.25');
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="telemetry"
      aria-labelledby="telemetry-title"
      className="relative isolate overflow-hidden bg-[#020408] px-4 py-[clamp(5rem,12vh,9rem)] sm:px-6 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(239,68,68,0.10),transparent_34%),radial-gradient(circle_at_12%_62%,rgba(34,211,238,0.08),transparent_26%)]"
      />

      <div ref={stageRef} className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="tech-text text-xs font-semibold uppercase tracking-[0.22em] text-em-glow">
            {telemetry.eyebrow}
          </p>
          <h2
            id="telemetry-title"
            className="mt-4 font-heading text-[clamp(2rem,4.4vw,4.5rem)] font-semibold leading-[1.02] text-text-primary"
          >
            {telemetry.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
            {telemetry.description}
          </p>
        </div>

        <div className="mt-10">
          <TelemetryMetricRow metrics={telemetry.metrics} />
        </div>

        <div className="mt-10">
          <TelemetryCutawayStage telemetry={telemetry} />
        </div>

        <TelemetryApplications applications={telemetry.applications} />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run TypeScript**

Run:

```powershell
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 3: Commit Task 4**

Run:

```powershell
git add src/components/telemetry/TelemetryScrollytellingSection.tsx
git commit -m "feat(telemetry): add scrollytelling section"
```

---

### Task 5: Insert Section Into Homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Import the section**

In `src/app/page.tsx`, add this import with the other component imports:

```tsx
import TelemetryScrollytellingSection from '@/components/telemetry/TelemetryScrollytellingSection';
```

- [ ] **Step 2: Render the section below the hero**

In `src/app/page.tsx`, change the returned section order to:

```tsx
      <IslandHero />
      <Navigation />
      <TelemetryScrollytellingSection />
      <div className="section-divider" />
      <OneEightTrillionAnchor />
      {/* Hidden 2026-05-22 — requested to be removed as incorrect: <ToolRevealSection /> */}
      <div className="section-divider" />
      <SagdPresentationSection />
      <div className="section-divider" />
      <ProofSection />
```

- [ ] **Step 3: Run TypeScript**

Run:

```powershell
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 4: Commit Task 5**

Run:

```powershell
git add src/app/page.tsx src/lib/content.ts
git commit -m "feat(telemetry): place section below hero"
```

---

### Task 6: Full Verification And Visual QA

**Files:**
- No required file changes.
- Create screenshots only if browser QA exposes a visual issue that needs tracking.

- [ ] **Step 1: Run unit tests**

Run:

```powershell
npm test
```

Expected: all tests pass, including the existing island tests and new telemetry content tests.

- [ ] **Step 2: Run lint**

Run:

```powershell
npm run lint
```

Expected: pass. The known raw image warning in `WellFiLogo.tsx` can remain only if it already exists on this branch and is not changed by this work.

- [ ] **Step 3: Run production build**

Run:

```powershell
npm run build
```

Expected: pass with static export.

- [ ] **Step 4: Start local dev server**

Run:

```powershell
$env:PORT='3002'; npm run dev
```

Expected: local site available at `http://127.0.0.1:3002/wellfi`.

- [ ] **Step 5: Desktop browser QA**

Open:

```text
http://127.0.0.1:3002/wellfi
```

Check:

- The telemetry section appears directly below the hero.
- Icon row is visible before the cutaway.
- Hydrostatic-head cue appears as a fluid-column/pressure-context visual near the pump area.
- Placement panels show Below Pump, Behind Casing, and Dual WellFi in that order.
- Scroll animation does not trap the page or create an excessive scroll tunnel.
- Application cards appear after the pinned story.

- [ ] **Step 6: Mobile browser QA**

Use browser device emulation at 390px width and reload:

```text
http://127.0.0.1:3002/wellfi
```

Check:

- No text overlaps the cutaway image.
- Callouts are readable without hover.
- The pinned behavior is disabled or harmless on compact width.
- Application cards stack cleanly.

- [ ] **Step 7: Reduced-motion QA**

In browser devtools, emulate `prefers-reduced-motion: reduce`, then reload:

```text
http://127.0.0.1:3002/wellfi
```

Check:

- No pinned scroll sequence is required to understand the section.
- Metrics, placement modes, hydrostatic-head explanation, and application cards are visible.

- [ ] **Step 8: Run reviewer gates**

Run or request the repo reviewers described in `AGENTS.md`:

- `reference-fidelity-reviewer`: confirm the temporary cutaway asset does not misrepresent the WellFi placement story.
- `animation-performance-reviewer`: confirm GSAP pinning, scrub behavior, and DOM overlays are not performance risks.
- `content-accuracy-verifier`: confirm hydrostatic head, pressure build-up, water cut, and flow insight wording are public-safe.
- `mobile-responsiveness-tester`: confirm compact layouts are readable.

- [ ] **Step 9: Commit verification fixes**

If QA changes are needed, commit them with:

```powershell
git add src
git commit -m "fix(telemetry): address section QA findings"
```

If no QA changes are needed, do not create an empty commit.

---

## Final Closeout

- [ ] **Step 1: Confirm clean branch status**

Run:

```powershell
git status --short --branch
```

Expected: no unstaged or uncommitted files.

- [ ] **Step 2: Summarize result**

Report:

- Branch name.
- Commits created.
- Verification commands and pass/fail result.
- Local QA URL.
- Any asset caveat, specifically whether the V1 still uses `public/wellfi_multilateral_cutaway.png` as the temporary cutaway plate.
