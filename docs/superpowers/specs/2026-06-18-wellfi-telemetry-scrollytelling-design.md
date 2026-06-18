# WellFi Telemetry Scrollytelling Section Design

Date: 2026-06-18
Branch: `codex/wellfi-telemetry-section`
Status: approved concept, ready for implementation planning after spec review

## Goal

Add the second major homepage section below the hero. The section must explain WellFi to a project engineer by leading with the strongest primary use case: below-pump lift optimization. It must also show that the same wireless telemetry platform can support behind-casing/intermediate placement and dual-tool interval applications.

The section should feel like an engineering cutaway, not an AI concept image or a generic SaaS feature band.

## Positioning

Primary message:

> Wireless Data Where Lift Decisions Are Made

Supporting copy:

> Place WellFi below pump, behind casing, or across dual-tool intervals to monitor downhole conditions without running cable.

The page should teach one hierarchy:

1. Below-pump WellFi is the default story because it maps directly to pump optimization, drawdown confidence, pressure build-up testing, and pump protection.
2. Behind-casing/intermediate placement is the expansion story for reservoir pressure trends and behind-casing condition changes.
3. Dual WellFi layouts are the advanced story for interval behavior, differential pressure, water-cut change, and flow insight.

## User

The primary reader is a project engineer or production engineer evaluating whether WellFi belongs in a candidate well. The section must help them answer:

- What can it measure?
- Where can it be placed?
- Which field decisions does the data support?
- Is this a practical retrofit, or just a visual claim?

## Section Flow

The section is a single pinned GSAP scrollytelling block followed by application cards.

```text
Metric icon row
  |
  v
Pinned cutaway frame: below-pump placement
  |
  v
Scroll callouts: pressure, temperature, vibration, water cut, flow insight
  |
  v
Hydrostatic head cue: fluid column around pump / measured pressure context
  |
  v
Placement states: below pump, behind casing, dual WellFi
  |
  v
Formation descent / parallax transition
  |
  v
Application cards
```

Do not split this into three independent sections. The breadth should live inside one guided engineer story.

## Visual Design

### Asset Direction

Use new controlled artwork for this section. Do not treat `blender/wellfi_island_hero_cutaway.blend` as the baseline; that file was an exploratory Antigravity/Gemini render direction and was rejected.

Preferred visual source:

- A Blender-rendered cutaway image or layered render set showing pump, tubing, casing, WellFi, and formation.
- Browser overlays for labels, leader lines, and telemetry bubbles.
- Optional layered formation images for parallax depth.

Do not use live R3F for V1 unless the static render path cannot communicate the placement states. Pre-rendered imagery gives a more polished result with lower browser risk.

### Look

- Dark formation background, restrained cyan/red signal accents, and crisp industrial annotation.
- No oversized marketing cards inside the pinned scene.
- Callouts should feel like drawing annotations or SCADA-linked tags, not cartoon popups.
- The pressure beat should show hydrostatic head visually as the fluid column around the pump/tubing. Use this to explain that WellFi is measuring pressure where lift decisions are made, including the column context that drives intake pressure and drawdown interpretation.
- Keep the cutaway legible on desktop and mobile; if mobile cannot support a pinned full scrollytelling frame cleanly, collapse into stacked static panels with the same sequence.

### Icon Row

Label:

> Pressure. Temperature. Vibration. Water cut. Flow insight.

Icons:

- Pressure: gauge icon
- Temperature: thermometer icon
- Vibration: waveform/activity icon
- Water cut: droplet/percent icon
- Flow insight: flow/arrow/trending icon

Use `lucide-react` icons already present in the project.

## Content Model

Add a content object in `src/lib/content.ts` so copy stays centralized. Proposed shape:

```ts
export interface TelemetryMetric {
  icon: string;
  label: string;
  shortLabel: string;
  description: string;
}

export interface PlacementMode {
  id: 'below-pump' | 'behind-casing' | 'dual-wellfi';
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  callouts: string[];
}

export interface ApplicationCard {
  icon: string;
  title: string;
  description: string;
}
```

Initial content:

- Metrics: pressure, temperature, vibration, water cut, flow insight.
- Pressure callout: include hydrostatic head/fluid-column context around the pump, not only a gauge icon.
- Placement modes: Below Pump, Behind Casing, Dual WellFi.
- Applications: Pump Optimization, Drawdown Management, Pressure Build-Up Testing, Reservoir Pressure Monitoring, Water Cut Tracking, Flow Insight, Pump Protection, Cableless Gauge Backup.

Use "Flow Insight" instead of "Flow Rate" for public-facing copy unless the calculation method is ready to defend.

## Components

Create a new feature directory:

```text
src/components/telemetry/
```

Recommended files:

- `TelemetryScrollytellingSection.tsx`: top-level section, layout, GSAP setup.
- `TelemetryMetricRow.tsx`: five metric icons.
- `TelemetryCutawayStage.tsx`: image frame, leader lines, callout bubbles, placement labels.
- `TelemetryApplications.tsx`: application cards.

The homepage imports this section directly after `IslandHero` and before the current anchor/recognition section unless final QA shows the old anchor must remain immediately below the hero. The intended order is:

```text
IslandHero
TelemetryScrollytellingSection
OneEightTrillionAnchor
SagdPresentationSection
ProofSection
```

If the old SAGD section remains live, avoid making the new section thermal-first. The new section should stay heavy-oil/conventional/gas compatible and should not raise SAGD/CSS temperature-limit questions.

## Animation Architecture

Use GSAP ScrollTrigger through `@gsap/react`.

Desktop/tablet behavior:

- Pin the cutaway stage for the scrollytelling sequence.
- Use one scrubbed timeline with labelled beats:
  - `metrics`
  - `belowPump`
  - `callouts`
  - `hydrostaticHead`
  - `behindCasing`
  - `dualWellfi`
  - `formation`
- Animate only transforms and opacity where possible.
- Use SVG/absolute-positioned leader lines for callouts.
- Keep pinned scroll distance moderate; target roughly 220-300vh, not an endless animation tunnel.

Mobile behavior:

- Prefer stacked static/short-reveal panels over pinned animation if viewport width makes leader lines fragile.
- Keep callout text visible without hover.
- Do not require horizontal gestures.

Reduced motion:

- Skip pinning and scrubbed transitions.
- Show all placement modes as static panels.
- Keep metric icons and application cards visible immediately.

Mini-lesson for implementation: state is the live data controlling what the interface draws, like a SCADA tag driving an HMI. For this section, React state can track the active placement mode for accessibility/mobile, while GSAP controls the desktop scroll timeline.

## Accessibility

- Use semantic section markup with one `h2`.
- Do not hide essential meaning inside animation-only overlays.
- Every image needs clear alt text or `aria-hidden` if the nearby copy carries the meaning.
- Placement modes should be understandable in source order.
- Respect `prefers-reduced-motion`.
- Keep color contrast high on cyan/red labels.

## Engineering Claim Boundaries

Allowed public claims:

- Measures pressure, temperature, vibration, water cut, and flow insight.
- Visualizes hydrostatic head as pressure context around the pump/fluid column.
- Can support below-pump, behind-casing/intermediate, and dual-tool layouts.
- Supports pump optimization, drawdown management, pressure build-up testing, reservoir pressure monitoring, water cut tracking, pump protection, and cableless gauge backup.
- No downhole cable run.

Avoid or qualify:

- Exact flow rate claims unless calculation method is defensible.
- SAGD/CSS thermal suitability unless temperature-exposure limits are explicitly stated.
- Any ResLink-branded wording from case-study PDFs.
- Any public claim copied directly from internal/source PDFs.

## Testing And Review Gates

Implementation verification must include:

- `npx tsc --noEmit`
- `npm run lint`
- `npm test`
- `npm run build`
- Browser QA at `/wellfi` on desktop and mobile widths.
- Reduced-motion QA.

Reviewer gates from `AGENTS.md`:

- `reference-fidelity-reviewer` after visual assets are placed.
- `animation-performance-reviewer` after GSAP/pinned-scroll implementation.
- `content-accuracy-verifier` after copy is final.
- `mobile-responsiveness-tester` before deployment.

## Open Decisions

These should be decided during implementation, not reopened as strategy:

- Whether V1 uses one composite render with overlay shifts or three render variants for the placement modes.
- Whether the formation descent is a layered still parallax or a short rendered transition plate.
- Whether the old `OneEightTrillionAnchor` stays immediately after the hero or moves below the new telemetry section. Default is to place telemetry directly below the hero because it answers the engineer's first question faster.
