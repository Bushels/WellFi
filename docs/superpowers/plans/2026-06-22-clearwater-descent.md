# Clearwater Descent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static `OneEightTrillionAnchor` section with a scroll-driven parallax "Clearwater Descent": the viewport falls through Clearwater formation strata, six WellFi benefits surface in turn, and the descent resolves on an isolated hi-res device reveal with the tagline "Data Below, Insight Above" — no CTA.

**Architecture:** A single `<section id="anchor">` (~400vh) with a `position: sticky` inner stage. One GSAP `ScrollTrigger` (`scrub`) drives an `onUpdate` callback that applies styles computed by a **pure, unit-tested choreography module** (`src/lib/clearwater/descent.ts`). Presentational children (`FormationStrata`, `BenefitChip`, `DeviceReveal`) are dumb. `prefers-reduced-motion` and touch/narrow viewports render a static stacked fallback (progressive enhancement, no scroll-driving). All copy lives in `content.ts`.

**Tech Stack:** Next.js 16 (App Router), React 19, GSAP 3.14 + `@gsap/react` `useGSAP` + `ScrollTrigger`, Tailwind v4, `next/image`, Vitest (pure-logic tests only — no RTL).

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/content.ts` | **Modify** — add `ClearwaterBenefit`/`ClearwaterContent` interfaces + `clearwater` export; change `telemetry.title` → `'Explore Your Data'` |
| `src/lib/clearwater/descent.ts` | **Create** — pure choreography math (strata specs, benefit visibility, layer translate, reveal state). No React. |
| `src/lib/clearwater/descent.test.ts` | **Create** — Vitest unit tests for the math |
| `src/lib/clearwater-content.test.ts` | **Create** — content-shape tests (6 benefits, order, tagline) |
| `src/lib/telemetry-content.test.ts` | **Modify** — update the guarded headline assertion |
| `src/components/clearwater/FormationStrata.tsx` | **Create** — stacked CSS-gradient strata column (presentational) |
| `src/components/clearwater/BenefitChip.tsx` | **Create** — single benefit label + supporting line (presentational) |
| `src/components/clearwater/DeviceReveal.tsx` | **Create** — isolated device image + tagline (presentational) |
| `src/components/clearwater/ClearwaterDescent.tsx` | **Create** — section shell, sticky stage, GSAP scrub driver, static fallback |
| `src/components/proof/ProofSection.tsx` | **Modify** — tagline → "Decisions with Proof" |
| `src/app/page.tsx` | **Modify** — swap component; retune `#anchor` bg ramp |
| `src/components/anchor/OneEightTrillionAnchor.tsx` | **Delete** — after grep confirms unused |
| `public/renders/wellfi-device-reveal.png` | **Add** — copied from the asset repo |
| `PROJECT_STATE.md`, `docs/journal/2026-06.md` | **Modify/Create** — documentation convention |

Conventions to follow (verified in-repo): components import copy from `@/lib/content` (never hardcode); colors use Tailwind tokens `text-text-primary` (#F9FAFB), `text-text-secondary` (#9CA3AF), `text-text-muted`, `font-heading`, `text-em-glow`/`bg-em-glow` (red #F87171). Data-cyan accent literal: `rgba(34,211,238,…)`. GSAP uses `useGSAP(() => {…}, { scope: ref })` with a `prefers-reduced-motion` early return (see `OneEightTrillionAnchor.tsx`).

---

## Task 1: Content model + copy moves

**Files:**
- Modify: `src/lib/content.ts` (interfaces block ~line 6; `telemetry` export line 336–365; append `clearwater`)
- Modify: `src/lib/telemetry-content.test.ts:6`
- Create: `src/lib/clearwater-content.test.ts`
- Modify: `src/components/proof/ProofSection.tsx:268-270`

- [ ] **Step 1: Update the telemetry guard test (write the failing expectation)**

In `src/lib/telemetry-content.test.ts`, change the assertion:

```ts
import { describe, expect, it } from 'vitest';
import { telemetry, clearwater } from './content';

describe('telemetry content', () => {
  it('uses the relocated data-cards headline', () => {
    expect(telemetry.title).toBe('Explore Your Data');
  });
});
```

- [ ] **Step 2: Create the Clearwater content test (the spec for Task 1)**

Create `src/lib/clearwater-content.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { clearwater } from './content';

describe('clearwater content', () => {
  it('has exactly six benefits in the locked descent order', () => {
    expect(clearwater.benefits.map((b) => b.label)).toEqual([
      'Extend Pump Life',
      'Increase Production',
      'Drawdown Management',
      'Reservoir Monitoring',
      'Water Cut Tracking',
      'Well Optimization',
    ]);
  });

  it('every benefit has a non-empty supporting line', () => {
    for (const b of clearwater.benefits) {
      expect(b.detail.length).toBeGreaterThan(0);
    }
  });

  it('uses the relocated reveal tagline', () => {
    expect(clearwater.revealTagline).toBe('Data Below, Insight Above');
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run src/lib/clearwater-content.test.ts src/lib/telemetry-content.test.ts`
Expected: FAIL — `clearwater` is not exported; `telemetry.title` is still `'Data Below, Insight Above'`.

- [ ] **Step 4: Add interfaces to `content.ts`**

In the Interfaces block (after `HighlightCard`, before `ToolComponent` ~line 31), add:

```ts
export interface ClearwaterBenefit {
  label: string;
  detail: string; // one supporting line
}

export interface ClearwaterContent {
  introEyebrow: string;
  introLine: string;
  benefits: ClearwaterBenefit[]; // exactly 6, in descent order (surface → reservoir)
  revealTagline: string;
  deviceAlt: string;
}
```

- [ ] **Step 5: Change the telemetry title**

In the `telemetry` export (`src/lib/content.ts:337`), change:

```ts
  title: 'Explore Your Data',
```

- [ ] **Step 6: Append the `clearwater` export**

After the `telemetry` export block (~line 365), add:

```ts
// ---------------------------------------------------------------------------
// Clearwater Descent (scroll-driven parallax section, replaces 1.8T anchor)
// ---------------------------------------------------------------------------

export const clearwater: ClearwaterContent = {
  introEyebrow: 'The Clearwater',
  introLine: 'Scroll down through the formation.',
  benefits: [
    { label: 'Extend Pump Life',    detail: 'Catch wear and abnormal operation before failure.' },
    { label: 'Increase Production',  detail: 'Run closer to optimal without flying blind.' },
    { label: 'Drawdown Management',  detail: 'Hold the right drawdown with live pressure.' },
    { label: 'Reservoir Monitoring', detail: 'See reservoir response at the lift point.' },
    { label: 'Water Cut Tracking',   detail: 'Spot produced-fluid changes as they happen.' },
    { label: 'Well Optimization',    detail: 'Turn continuous data into better calls.' },
  ],
  revealTagline: 'Data Below, Insight Above',
  deviceAlt: 'The WellFi downhole telemetry device, revealed in the Clearwater reservoir.',
};
```

- [ ] **Step 7: Update the Proof tagline**

In `src/components/proof/ProofSection.tsx:268-270`, replace the tagline `<p>` body:

```tsx
        <p className="proof-tagline mb-10 text-center font-heading text-sm font-medium uppercase tracking-[0.18em] text-text-secondary">
          Decisions with <span className="text-em-glow">Proof.</span>
        </p>
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npx vitest run src/lib/clearwater-content.test.ts src/lib/telemetry-content.test.ts`
Expected: PASS (all assertions green).

- [ ] **Step 9: Commit**

```bash
git -C "C:/Users/kyle/MPS/wellfi-marketing/site" add src/lib/content.ts src/lib/clearwater-content.test.ts src/lib/telemetry-content.test.ts src/components/proof/ProofSection.tsx
git -C "C:/Users/kyle/MPS/wellfi-marketing/site" commit -m "feat(content): relocate 'Data Below, Insight Above' to Clearwater reveal; add clearwater copy

Telemetry heading -> 'Explore Your Data'; Proof tagline -> 'Decisions with Proof'.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Choreography math module (pure, tested)

**Files:**
- Create: `src/lib/clearwater/descent.ts`
- Create: `src/lib/clearwater/descent.test.ts`

Coordinate model: overall scroll progress `p ∈ [0,1]`. Strata travel completes at `REVEAL_START = 0.80`; the device reveal occupies `[0.80, 1.0]`. Benefits are spread across `[BENEFIT_START, BENEFIT_END] = [0.06, 0.78]`, each with a trapezoidal visibility window.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/clearwater/descent.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  STRATA,
  REVEAL_START,
  benefitVisibility,
  layerTranslateVh,
  revealState,
} from './descent';

describe('clearwater descent math', () => {
  it('defines the six-band Clearwater column surface → underburden', () => {
    expect(STRATA.map((s) => s.id)).toEqual([
      'overburden',
      'colorado',
      'upper-sand',
      'mudstone',
      'lower-sand',
      'ellerslie',
    ]);
    // depths are monotonically increasing and contiguous
    for (let i = 1; i < STRATA.length; i++) {
      expect(STRATA[i].depthTop).toBe(STRATA[i - 1].depthBottom);
    }
  });

  it('benefit visibility is 0 outside its window and ~1 at its center', () => {
    for (let i = 0; i < 6; i++) {
      expect(benefitVisibility(0, i)).toBe(0);
      expect(benefitVisibility(1, i)).toBe(0);
    }
    // benefit 0 peaks early, benefit 5 peaks late
    expect(benefitVisibility(0.1, 0)).toBeGreaterThan(0.5);
    expect(benefitVisibility(0.75, 5)).toBeGreaterThan(0.5);
  });

  it('visibility never exceeds 1 and never goes negative', () => {
    for (let s = 0; s <= 100; s++) {
      const p = s / 100;
      for (let i = 0; i < 6; i++) {
        const v = benefitVisibility(p, i);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });

  it('strata translate starts at 0 and finishes its travel by REVEAL_START', () => {
    expect(layerTranslateVh(0, 1)).toBe(0);
    const end = layerTranslateVh(REVEAL_START, 1);
    const past = layerTranslateVh(1, 1);
    expect(end).toBeLessThan(0); // moved upward (negative translateY)
    expect(past).toBe(end); // clamped after travel completes
  });

  it('a slower parallax factor moves the layer less', () => {
    expect(Math.abs(layerTranslateVh(0.5, 0.5))).toBeLessThan(
      Math.abs(layerTranslateVh(0.5, 1)),
    );
  });

  it('reveal is hidden before REVEAL_START and full at the end', () => {
    expect(revealState(0.5).opacity).toBe(0);
    expect(revealState(1).opacity).toBe(1);
    expect(revealState(1).scale).toBe(1);
    expect(revealState(REVEAL_START).scale).toBeCloseTo(0.92, 2);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/lib/clearwater/descent.test.ts`
Expected: FAIL — module `./descent` not found.

- [ ] **Step 3: Implement `descent.ts`**

Create `src/lib/clearwater/descent.ts`:

```ts
// Pure choreography math for the Clearwater Descent. No React, no DOM.
// Overall scroll progress p is in [0, 1].

export interface LayerSpec {
  id: string;
  label: string;
  depthTop: number;    // metres TVD
  depthBottom: number; // metres TVD
  color: string;       // dark earth-tone render value
  laminated: boolean;  // adds a fine repeating-linear-gradient lamination
}

export const REVEAL_START = 0.8;
export const BENEFIT_START = 0.06;
export const BENEFIT_END = 0.78;
export const STRATA_VH = 220; // strata column height; viewport stage is 100vh

export const STRATA: LayerSpec[] = [
  { id: 'overburden', label: 'Overburden',                 depthTop: 0,   depthBottom: 150, color: '#2a2620', laminated: false },
  { id: 'colorado',   label: 'Colorado Shale · seal',      depthTop: 150, depthBottom: 280, color: '#232628', laminated: true },
  { id: 'upper-sand', label: 'Clearwater · upper sand',    depthTop: 280, depthBottom: 380, color: '#33271c', laminated: false },
  { id: 'mudstone',   label: 'Clearwater · mudstone',      depthTop: 380, depthBottom: 420, color: '#2c2a24', laminated: true },
  { id: 'lower-sand', label: 'Clearwater · lower sand',    depthTop: 420, depthBottom: 500, color: '#1c130d', laminated: false },
  { id: 'ellerslie',  label: 'Ellerslie · underburden',    depthTop: 500, depthBottom: 600, color: '#20191a', laminated: false },
];

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

/**
 * Trapezoidal visibility for benefit i across [BENEFIT_START, BENEFIT_END].
 * Each benefit owns an equal slot; it fades in over the first `edge` fraction
 * of the slot, holds, then fades out over the last `edge` fraction.
 */
export function benefitVisibility(p: number, i: number, count = 6): number {
  const span = BENEFIT_END - BENEFIT_START;
  const slot = span / count;
  const start = BENEFIT_START + i * slot;
  const end = start + slot;
  if (p <= start || p >= end) return 0;
  const local = (p - start) / slot; // 0..1 within the slot
  const edge = 0.35; // fraction of slot used for fade in and fade out
  if (local < edge) return clamp01(local / edge);
  if (local > 1 - edge) return clamp01((1 - local) / edge);
  return 1;
}

/**
 * Vertical translate (in vh, negative = upward) for a strata layer as the
 * camera falls. Travel completes at REVEAL_START, then clamps.
 * `parallaxFactor` < 1 makes a background layer drift slower (depth cue).
 */
export function layerTranslateVh(p: number, parallaxFactor: number): number {
  const travel = STRATA_VH - 100; // distance the column must move to expose its base
  const progress = clamp01(p / REVEAL_START);
  return -(progress * travel * parallaxFactor);
}

/** Device reveal opacity (0→1) and scale (0.92→1) across [REVEAL_START, 1]. */
export function revealState(p: number): { opacity: number; scale: number } {
  const t = clamp01((p - REVEAL_START) / (1 - REVEAL_START));
  return { opacity: t, scale: 0.92 + 0.08 * t };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/lib/clearwater/descent.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C "C:/Users/kyle/MPS/wellfi-marketing/site" add src/lib/clearwater/descent.ts src/lib/clearwater/descent.test.ts
git -C "C:/Users/kyle/MPS/wellfi-marketing/site" commit -m "feat(clearwater): pure choreography math (strata, benefit windows, reveal)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Presentational sub-components

No unit tests (no RTL in repo); verified by `tsc` + lint + preview. Each is a pure function of props.

**Files:**
- Create: `src/components/clearwater/FormationStrata.tsx`
- Create: `src/components/clearwater/BenefitChip.tsx`
- Create: `src/components/clearwater/DeviceReveal.tsx`

- [ ] **Step 1: Create `FormationStrata.tsx`**

```tsx
import { STRATA } from '@/lib/clearwater/descent';

/**
 * Stacked column of Clearwater strata as CSS gradients. Fills its parent's
 * height; the parent (a ref'd wrapper in ClearwaterDescent) owns positioning
 * and the scroll-driven translate. Purely decorative.
 */
export default function FormationStrata() {
  return (
    <div aria-hidden="true" className="flex h-full flex-col">
      {STRATA.map((layer) => (
        <div
          key={layer.id}
          className="relative flex-1"
          style={{
            backgroundColor: layer.color,
            backgroundImage: layer.laminated
              ? 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 7px)'
              : undefined,
          }}
        >
          <span className="absolute left-4 top-3 text-[0.6rem] uppercase tracking-[0.12em] text-white/25">
            {layer.label}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `BenefitChip.tsx`**

```tsx
import type { ClearwaterBenefit } from '@/lib/content';

/**
 * One benefit as a glass card. Presentational only — the same card is used in
 * descent mode (parent wraps it in a positioned, ref'd div it animates) and in
 * the static fallback (parent wraps it in an <li>).
 */
export default function BenefitChip({ benefit }: { benefit: ClearwaterBenefit }) {
  return (
    <div
      className="mx-auto w-[min(90vw,30rem)] rounded-xl border border-white/12 bg-[rgba(10,16,22,0.72)] px-5 py-4 text-center backdrop-blur-sm"
      style={{ boxShadow: '0 0 28px -8px rgba(34,211,238,0.35)' }}
    >
      <h3 className="font-heading text-lg font-semibold text-text-primary">{benefit.label}</h3>
      <p className="mt-1 text-sm text-text-secondary">{benefit.detail}</p>
    </div>
  );
}
```

- [ ] **Step 3: Create `DeviceReveal.tsx`**

```tsx
import Image from 'next/image';
import { clearwater } from '@/lib/content';

/**
 * The isolated device reveal: hi-res transparent render on a cyan ("data")
 * telemetry glow, with the relocated tagline. Presentational — the parent
 * (a ref'd wrapper) fades/scales it in on scroll; in the static fallback the
 * wrapper is a normal block so it shows fully.
 */
export default function DeviceReveal() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden="true"
          className="absolute h-[26rem] w-[26rem] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(34,211,238,0.40) 0%, rgba(34,211,238,0.10) 45%, transparent 70%)',
          }}
        />
        <Image
          src="/renders/wellfi-device-reveal.png"
          alt={clearwater.deviceAlt}
          width={1600}
          height={6000}
          priority={false}
          className="relative h-[min(62vh,40rem)] w-auto"
        />
      </div>
      <p
        id="clearwater-reveal-tagline"
        className="font-heading text-[clamp(1.6rem,4vw,3rem)] font-semibold tracking-[-0.02em] text-text-primary"
      >
        Data Below, <span className="text-em-glow">Insight Above</span>
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint src/components/clearwater`
Expected: no errors. (Asset `/renders/wellfi-device-reveal.png` is added in Task 5; `next/image` does not check existence at typecheck.)

- [ ] **Step 5: Commit**

```bash
git -C "C:/Users/kyle/MPS/wellfi-marketing/site" add src/components/clearwater/FormationStrata.tsx src/components/clearwater/BenefitChip.tsx src/components/clearwater/DeviceReveal.tsx
git -C "C:/Users/kyle/MPS/wellfi-marketing/site" commit -m "feat(clearwater): presentational strata, benefit chip, device reveal

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: `ClearwaterDescent` container (GSAP + fallback)

**Files:**
- Create: `src/components/clearwater/ClearwaterDescent.tsx`

Behavior: SSR/first client render = **static stacked** (safe, content visible, no hydration mismatch). After mount, if motion is allowed AND pointer is fine AND viewport ≥ 768px, switch to **descent mode**: sticky 100vh stage, strata translated and benefits/reveal driven by a single scrubbed `ScrollTrigger.onUpdate` using the Task 2 math. Otherwise stay static.

- [ ] **Step 1: Create `ClearwaterDescent.tsx`**

```tsx
'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { clearwater } from '@/lib/content';
import {
  STRATA_VH,
  BENEFIT_START,
  benefitVisibility,
  layerTranslateVh,
  revealState,
} from '@/lib/clearwater/descent';
import FormationStrata from './FormationStrata';
import BenefitChip from './BenefitChip';
import DeviceReveal from './DeviceReveal';

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

// Where each benefit chip sits vertically in the 100vh stage (descent mode).
const CHIP_TOP_PCT = [24, 36, 30, 44, 38, 50];

export default function ClearwaterDescent() {
  const sectionRef = useRef<HTMLElement>(null);
  const strataRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Array<HTMLDivElement | null>>([]);
  const revealRef = useRef<HTMLDivElement>(null);
  const [descent, setDescent] = useState(false);

  useGSAP(
    () => {
      if (typeof window === 'undefined') return;

      // First pass (static DOM committed): decide whether to enhance.
      if (!descent) {
        const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const finePointer = window.matchMedia('(pointer: fine)').matches;
        const wideEnough = window.innerWidth >= 768;
        if (motionOk && finePointer && wideEnough) setDescent(true);
        return;
      }

      // Second pass (descent DOM committed → section is 400vh, refs attached).
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;

          if (strataRef.current) {
            strataRef.current.style.transform = `translateY(${layerTranslateVh(p, 1)}vh)`;
          }
          if (introRef.current) {
            introRef.current.style.opacity = String(1 - clamp01(p / BENEFIT_START));
          }
          chipRefs.current.forEach((el, i) => {
            if (!el) return;
            const v = benefitVisibility(p, i);
            el.style.opacity = String(v);
            el.style.transform = `translate(-50%, ${(1 - v) * 16}px)`;
          });
          if (revealRef.current) {
            const { opacity, scale } = revealState(p);
            revealRef.current.style.opacity = String(opacity);
            revealRef.current.style.transform = `scale(${scale})`;
          }
        },
      });

      return () => st.kill();
    },
    { scope: sectionRef, dependencies: [descent] },
  );

  return (
    <section
      ref={sectionRef}
      id="anchor"
      aria-labelledby="clearwater-reveal-tagline"
      className="relative isolate bg-[#020408]"
      style={descent ? { height: '400vh' } : undefined}
    >
      {descent ? (
        // ── Descent mode: sticky stage, scroll-driven ──
        <div className="sticky top-0 h-screen overflow-hidden">
          <div
            ref={strataRef}
            aria-hidden="true"
            className="absolute inset-x-0 top-0 will-change-transform"
            style={{ height: `${STRATA_VH}vh` }}
          >
            <FormationStrata />
          </div>

          <div
            ref={introRef}
            className="absolute left-1/2 top-[14%] w-[min(90vw,32rem)] -translate-x-1/2 text-center"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-text-muted">
              {clearwater.introEyebrow}
            </p>
            <p className="mt-2 font-heading text-2xl font-medium text-text-primary">
              {clearwater.introLine}
            </p>
          </div>

          {clearwater.benefits.map((benefit, i) => (
            <div
              key={benefit.label}
              ref={(el) => {
                chipRefs.current[i] = el;
              }}
              className="absolute left-1/2"
              style={{ top: `${CHIP_TOP_PCT[i]}%`, opacity: 0, transform: 'translate(-50%, 16px)' }}
            >
              <BenefitChip benefit={benefit} />
            </div>
          ))}

          <div
            ref={revealRef}
            className="absolute inset-0 will-change-transform"
            style={{ opacity: 0 }}
          >
            <DeviceReveal />
          </div>
        </div>
      ) : (
        // ── Static fallback: reduced-motion / touch / narrow ──
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-10 px-6 py-24 text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-text-muted">
              {clearwater.introEyebrow}
            </p>
            <p className="mt-2 font-heading text-2xl font-medium text-text-primary">
              {clearwater.introLine}
            </p>
          </div>
          <ul className="flex w-full flex-col gap-4">
            {clearwater.benefits.map((b) => (
              <li key={b.label} className="w-full">
                <BenefitChip benefit={b} />
              </li>
            ))}
          </ul>
          <div className="relative h-[60vh] w-full">
            <DeviceReveal />
          </div>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint src/components/clearwater`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/kyle/MPS/wellfi-marketing/site" add src/components/clearwater/ClearwaterDescent.tsx
git -C "C:/Users/kyle/MPS/wellfi-marketing/site" commit -m "feat(clearwater): ClearwaterDescent container — scrubbed descent + static fallback

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Asset + page integration + remove old section

**Files:**
- Add: `public/renders/wellfi-device-reveal.png`
- Modify: `src/app/page.tsx`
- Delete: `src/components/anchor/OneEightTrillionAnchor.tsx`

- [ ] **Step 1: Copy the device render into the site**

Run:
```bash
cp "C:/Users/kyle/MPS/wellfi-marketing/wellfi-dwg/Side Clamp/WellFi_Hero_Model_Large_Transparent.png" \
   "C:/Users/kyle/MPS/wellfi-marketing/site/public/renders/wellfi-device-reveal.png"
```
Verify: `ls -la "C:/Users/kyle/MPS/wellfi-marketing/site/public/renders/wellfi-device-reveal.png"` → file exists, ~0.5MB.

- [ ] **Step 2: Confirm the old component is unreferenced elsewhere**

Run: `git -C "C:/Users/kyle/MPS/wellfi-marketing/site" grep -n "OneEightTrillionAnchor"`
Expected: only `src/app/page.tsx` (import + element). If anything else references it, stop and reassess.

- [ ] **Step 3: Swap the component in `page.tsx`**

Change the import (`src/app/page.tsx:10`):

```tsx
import ClearwaterDescent from '@/components/clearwater/ClearwaterDescent';
```

Change the element (`src/app/page.tsx:105`):

```tsx
      <ClearwaterDescent />
```

- [ ] **Step 4: Retune the `#anchor` background ramp in `page.tsx`**

The current block (`src/app/page.tsx:57-72`) ramps `--bg-red-intensity` up while scrolling `#anchor`. A descent through earth + cyan should not glow red. Replace that block with a neutral hold (keep the variables stable so the descent reads cool/dark):

```tsx
    // Background stays cool/neutral through the Clearwater descent (no red ramp)
    if (anchor) {
      gsap.fromTo(main,
        { '--bg-red-intensity': 0.04, '--bg-amber-intensity': 0.02 },
        {
          '--bg-red-intensity': 0.03,
          '--bg-amber-intensity': 0.02,
          ease: 'none',
          scrollTrigger: {
            trigger: anchor,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
          },
        },
      );
    }
```

(The `#proof` warm shift below it is unchanged. Note the proof block starts from `0.12` red; with the anchor no longer ramping to `0.12`, optionally change the proof block's `from` to `0.03` to avoid a jump — verify visually in Step 7 and adjust if a flash appears.)

- [ ] **Step 5: Delete the old component**

Run: `git -C "C:/Users/kyle/MPS/wellfi-marketing/site" rm src/components/anchor/OneEightTrillionAnchor.tsx`

- [ ] **Step 6: Typecheck + lint + tests**

Run: `cd "C:/Users/kyle/MPS/wellfi-marketing/site" && npx tsc --noEmit && npm run lint && npm test`
Expected: tsc clean; lint clean (pre-existing `WellFiLogo.tsx` `<img>` warning is acceptable); all Vitest tests pass.

- [ ] **Step 7: Commit**

```bash
git -C "C:/Users/kyle/MPS/wellfi-marketing/site" add -A
git -C "C:/Users/kyle/MPS/wellfi-marketing/site" commit -m "feat(clearwater): wire ClearwaterDescent into page; remove 1.8T anchor

Keeps id=anchor (hero Continue + bg ramp targets); retunes anchor bg to neutral; adds device render.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Verification + documentation

**Files:**
- Modify: `PROJECT_STATE.md`
- Create/append: `docs/journal/2026-06.md`

- [ ] **Step 1: Build**

Run: `cd "C:/Users/kyle/MPS/wellfi-marketing/site" && npm run build`
Expected: build succeeds, no type/lint errors fail the build.

- [ ] **Step 2: Preview verification (use the preview_* tools, not Bash)**

- Start the dev server; load `/wellfi`.
- Desktop (≥768px, fine pointer): scroll the anchor section — confirm strata translate, each of the six benefits fades in/out in order, and the device + "Data Below, Insight Above" reveal at the end. Capture a screenshot near the reveal.
- Check console for errors (expect none).
- Resize to mobile width / emulate touch: confirm the **static stacked** fallback renders (intro eyebrow, six benefit cards, device + tagline) with no sticky/scroll-driving.
- Emulate `prefers-reduced-motion: reduce`: confirm the static fallback (no scrubbing).
- Confirm the hero "Continue" button still scrolls to the section (it targets `#anchor`).
- Confirm telemetry section now reads "Explore Your Data" and Proof reads "Decisions with Proof".

- [ ] **Step 3: Fix any issues found**

If the descent janks, the chips overlap, or the reveal timing feels off: tune `CHIP_TOP_PCT`, `STRATA_VH`, `REVEAL_START`, or the section height (`400vh`). Re-run Step 2. (Math changes get a matching test update in `descent.test.ts`.)

- [ ] **Step 4: Update PROJECT_STATE.md**

Supersede the "Current task" section to reflect implementation complete + verified (keep ≤45 lines, no strikethroughs). Move Clearwater Descent from "design approved" to "shipped on branch `feat/clearwater-descent`, pending Kyle review/merge," and note the verification evidence captured.

- [ ] **Step 5: Append to the journal**

Append a dated entry to `docs/journal/2026-06.md` (create if absent) summarizing: what was built, key decisions (Concept A, Reveal 2, no CTA, Clearwater, copy relocation), the red-vs-cyan accent note, and verification results.

- [ ] **Step 6: Commit docs**

```bash
git -C "C:/Users/kyle/MPS/wellfi-marketing/site" add PROJECT_STATE.md docs/journal/2026-06.md
git -C "C:/Users/kyle/MPS/wellfi-marketing/site" commit -m "docs: Clearwater Descent implemented + verified

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Notes for the implementer

- **Accent color is a reviewable choice.** The plan uses the data-cyan literal `rgba(34,211,238,…)` for the device glow + chip shadow, because the site has no blue token and cyan already signifies "data" on the telemetry cards. If Kyle prefers the site's red (`em-glow`), swap those two literals for `var(--em-glow)` / `text-em-glow`.
- **Reveal tagline glow:** the tagline uses `text-em-glow` (red) on "Insight Above" to match the page's heading-accent treatment. If we go cyan-everywhere for this section, change that span too.
- **No pinning** anywhere — the sticky stage provides the fixed-viewport feel. Do not add `ScrollTrigger.pin`.
- **Device crop:** if the vertical 1600×6000 render reads too tall at the reveal, swap to `WellFi_Hero_Model_Preview_Dark.png` (6000×1600) and adjust `width`/`height`/`className` accordingly.
```
