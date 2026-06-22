# Clearwater Descent — Design Spec

- **Date:** 2026-06-22
- **Status:** Approved (decisions locked via brainstorming + visual companion)
- **Owner:** Kyle (MPS) · authored with Claude
- **Replaces:** `OneEightTrillionAnchor` section
- **Repo:** WellFi site (`github.com/Bushels/WellFi`)

## 1. Goal

Replace the static "1.8 trillion barrels locked in place / Waiting / Seeing is Believing" recognition section with a **scroll-driven parallax descent** through the Clearwater formation. As the visitor scrolls, the viewport falls through subsurface rock layers; the six WellFi benefits surface one at a time; and the descent resolves on a hi-res reveal of the WellFi device in the reservoir.

This is a curiosity-stage section for the slow-leak campaign audience (WCSB cold heavy-oil production/completion/project engineers). It carries no CTA — it is a recognition/payoff moment that hands off to the existing SAGD → Proof funnel.

## 2. Locked decisions

| Decision | Choice | Rationale |
|---|---|---|
| Choreography | **Continuous Descent** (smooth fall, no hard stops) | Cinematic; maps cleanly to GSAP `scrub`; avoids pinning fragility |
| Geology | **Clearwater** formation (not Bluesky) | More popular/futureproof play for the audience |
| Caption | **Dropped** (no "1.8T/Waiting/Seeing is Believing") | Clean benefit-only descent; handshake job shifts to the hero |
| Benefit order | Pump Life → Production → Drawdown → Reservoir Monitoring → Water Cut → Well Optimization | Surface outcomes → reservoir monitoring → summarizing payoff |
| Reveal | **Isolated device** on blue glow, **no CTA** | Simplest robust; most on-brand with the "candle in the dark" concept |
| Reveal tagline | **"Data Below, Insight Above"** (relocated) | See §7 copy moves |
| Implementation | Single GSAP ScrollTrigger `scrub`, CSS strata, no pinning | Reliability over flash (per prior parallax difficulties) |

## 3. Narrative & UX

Top → bottom of the scroll experience:

1. **Surface intro** — a brief orienting line at the top of the descent (e.g. eyebrow "The Clearwater · ~500 m down"; copy editable). Establishes we are about to go underground.
2. **Descent** — the viewport falls; CSS strata drift upward (slower background = parallax). Six benefit chips fade in then out, each anchored to a depth band, in the locked order.
3. **Reveal** — strata fall away to near-black; the isolated WellFi device fades + scales in, lit by its own blue telemetry glow; tagline **"Data Below, Insight Above"**. No button.

Emotional arc: *down through the dark rock → the benefits surface → WellFi is there → data below, insight above.*

## 4. Component architecture

New client component replacing the old one, same page slot:

```
src/components/clearwater/ClearwaterDescent.tsx     // section shell + GSAP timeline (client)
src/components/clearwater/FormationStrata.tsx        // stacked CSS gradient layers (presentational)
src/components/clearwater/BenefitChip.tsx            // single benefit label + supporting line
src/components/clearwater/DeviceReveal.tsx           // isolated device image + tagline
```

- `ClearwaterDescent` owns the `<section id="anchor">`, the sticky stage, refs, and the single `useGSAP`/`ScrollTrigger` timeline. Mirrors the existing `useGSAP({ scope })` + `prefers-reduced-motion` guard pattern from `OneEightTrillionAnchor.tsx` and `page.tsx`.
- Children are presentational; all motion is driven by the parent timeline (progress-keyed `gsap.set`/`gsap.to` on child refs or class targets via the scoped selector).
- Keeping children small and single-purpose keeps the timeline file readable and the pieces independently testable.

### DOM shape

```
<section id="anchor" aria-labelledby="clearwater-reveal-tagline">          // ~400vh tall
  <div class="sticky stage (100vh)">                                       // position: sticky; top:0
    <FormationStrata/>            // absolutely-positioned layered gradients, translated by progress
    <BenefitChip/> ×6             // absolutely positioned, opacity/transform keyed to progress
    <DeviceReveal/>               // hidden until end; fades/scales in at progress ~0.82–1.0
  </div>
</section>
```

## 5. Scroll mechanics

- **One** `ScrollTrigger` with `scrub: true`, `trigger: sectionRef`, `start: 'top top'`, `end: 'bottom bottom'`. No `pin` (pinning is the usual source of parallax breakage). The `position: sticky` inner stage gives the "fixed viewport while scrolling" feel without ScrollTrigger pinning.
- A single GSAP timeline maps scroll progress 0→1 to:
  - Strata vertical translate (background slower than foreground → parallax depth).
  - Six benefit chips: each gets an in/out window (e.g. chip *i* visible across progress `[0.10 + i*0.11, 0.20 + i*0.11]`, tuned in implementation).
  - Device reveal: opacity 0→1 + scale 0.92→1 across the final window (~0.82→1.0); strata dim/recede simultaneously.
- Section height ~**400vh** (tunable 360–480vh) — enough for six distinct benefit beats plus intro + reveal without dragging.

## 6. Formation palette (Clearwater, dark "candle in the dark" register)

Strata top→bottom (depths approximate; colors are the on-theme darkened render values):

| Layer | Approx depth | Color | Texture |
|---|---|---|---|
| Overburden | 0–150 m | `#2a2620` warm brown-dark | subtle granular |
| Colorado Shale (seal) | 150–280 m | `#232628` cool grey-dark | fine horizontal lamination |
| Clearwater Upper Sand | 280–380 m | `#33271c` bitumen tan-dark | sand grain, faint laminae |
| Clearwater Middle Mudstone | 380–420 m | `#2c2a24` grey-tan | laminated |
| Clearwater Lower Sand (reservoir) | 420–500 m | `#1c130d` dark bitumen | device lands here; blue telemetry glow |
| Ellerslie (underburden) | 500 m+ | `#20191a` dark | optional, mostly off-screen |

Accent: faint blue telemetry glow `rgba(95,168,255,…)` concentrated at the reservoir/device (the campaign's "faint blue glow = transmission" motif). Lamination via lightweight `repeating-linear-gradient` (no image scrubbing).

## 7. Copy moves — relocating "Data Below, Insight Above"

The phrase currently appears on the page twice and is moving to become the reveal tagline:

1. **Reveal (new):** tagline = **"Data Below, Insight Above"**.
2. **Telemetry / data-cards heading** (`telemetry.title`, `content.ts:337`): change **"Data Below, Insight Above" → "Explore Your Data"**.
3. **Proof tagline** (`ProofSection.tsx:269`): change **"Data Below. Insight Above." → "Decisions with Proof"** (glow on the second word, matching the existing `text-em-glow` treatment).
4. **Guard test** (`src/lib/telemetry-content.test.ts:6`): update assertion to `expect(telemetry.title).toBe('Explore Your Data')`.

Resulting page header arc: **Explore Your Data** → **Data Below, Insight Above** → **Decisions with Proof**.

## 8. Content model (`content.ts`)

Add a typed `clearwater` content export (single source of truth) and edit the two existing strings:

```ts
export interface ClearwaterBenefit { label: string; detail: string; }
export interface ClearwaterContent {
  introEyebrow: string;          // e.g. "The Clearwater"
  introLine: string;             // surface orienting line (editable)
  benefits: ClearwaterBenefit[]; // exactly 6, in descent order
  revealTagline: string;         // "Data Below, Insight Above"
  deviceAlt: string;             // a11y alt for the device render
}
```

Benefit list (order locked; `detail` copy is placeholder, editable):

1. Extend Pump Life — *catch wear and abnormal operation before failure.*
2. Increase Production — *run closer to optimal without flying blind.*
3. Drawdown Management — *hold the right drawdown with live pressure.*
4. Reservoir Monitoring — *see reservoir response at the lift point.*
5. Water Cut Tracking — *spot produced-fluid changes as they happen.*
6. Well Optimization — *turn continuous data into better calls.*

Edits: `telemetry.title → 'Explore Your Data'`; Proof tagline string in `ProofSection.tsx` (it is inline JSX, not in `content.ts`).

## 9. `page.tsx` integration

- Replace the `<OneEightTrillionAnchor />` import + element with `<ClearwaterDescent />`, same slot (between `TelemetryIconCardsSection` and `SagdPresentationSection`, between the existing `.section-divider`s).
- **Keep `id="anchor"`** on the new section — both the hero "Continue" button (`ctaSecondaryHref: '#anchor'`) and the page background-temperature ScrollTrigger target it.
- **Retune the background-temperature block** in `page.tsx` (currently ramps `--bg-red-intensity` up while scrolling `#anchor`). A descent through earth + blue telemetry should not glow red. Change the `#anchor` ramp to a cooler/earth→blue treatment (or neutralize it) so it does not clash. Keep the `#proof` warm shift as-is.
- Remove the now-unused `OneEightTrillionAnchor` component file (and its import). The component is not referenced elsewhere (verify with a grep before deleting).

## 10. Accessibility & reduced motion

- `prefers-reduced-motion: reduce` → skip the scrubbed timeline entirely and render a **static stacked** version: intro line, the six benefits as a simple list/grid, then the device + tagline. (Mirror the existing reduced-motion early-return pattern.)
- `aria-labelledby` points to the reveal tagline element (`id="clearwater-reveal-tagline"`); benefit chips use real text (not background images) so they are readable by AT.
- Device image has descriptive `alt` from `content.deviceAlt`.

## 11. Mobile / responsive

- Touch / small viewports → same **static stacked** fallback as reduced-motion (no scrubbing on touch; avoids the jank that plagues mobile scroll-linked animation). Detect via a width breakpoint and/or coarse-pointer media query at mount.
- Desktop → full descent. Strata use viewport-relative sizing; chips use `clamp()` like the rest of the site.

## 12. Assets

- **Device render:** copy `…/wellfi-marketing/wellfi-dwg/Side Clamp/WellFi_Hero_Model_Large_Transparent.png` (1600×6000, transparent, vertical — ideal for a vertical reveal) into `site/public/renders/wellfi-device-reveal.png`.
  - Alternative if a wider crop reads better at the reveal: `WellFi_Hero_Model_Preview_Dark.png`. Decide visually during implementation.
- Use `next/image` with appropriate `sizes`; the source is large, so set explicit dimensions and let Next optimize. No giant-PNG scroll-scrubbing.

## 13. Testing strategy

- Update `telemetry-content.test.ts` assertion (§7.4).
- Add a content test for `clearwater`: exactly 6 benefits, in the locked order; `revealTagline === 'Data Below, Insight Above'`.
- (If Proof copy is asserted anywhere, update it — grep first.)
- Manual/preview verification: scroll behavior on desktop; reduced-motion static fallback; mobile static fallback; no console errors; Lighthouse sanity on the section.

## 14. Out of scope (parked)

- Telemetry-HUD reveal (benefits as live nodes around the device).
- Any real-time 3D / R3F scene for the formation.
- Animated live signal/telemetry overlays.
- A CTA in this section.

Ship the reliable version first; treat the above as optional future enhancement.

## 15. Risks & mitigations

- **Scroll jank / prior parallax pain** → no pinning, no image scrubbing, single scrubbed timeline, hard static fallbacks for touch + reduced-motion.
- **`#anchor` coupling** → preserved id; background-temperature ramp retuned, not removed.
- **Pre-existing WIP on `master`** (AGENTS.md, PROJECT_STATE.md, a handover doc) → branch off committed master; commit only this work; leave WIP untouched.
- **Section length feel** → start at 400vh, tune.

## 16. File-change checklist (for the plan)

- [ ] `src/components/clearwater/ClearwaterDescent.tsx` (new)
- [ ] `src/components/clearwater/FormationStrata.tsx` (new)
- [ ] `src/components/clearwater/BenefitChip.tsx` (new)
- [ ] `src/components/clearwater/DeviceReveal.tsx` (new)
- [ ] `src/lib/content.ts` (add `clearwater`; edit `telemetry.title`)
- [ ] `src/components/proof/ProofSection.tsx` (tagline → "Decisions with Proof")
- [ ] `src/app/page.tsx` (swap component; retune `#anchor` bg ramp)
- [ ] `src/lib/telemetry-content.test.ts` (update assertion)
- [ ] `src/lib/clearwater-content.test.ts` (new content test)
- [ ] `public/renders/wellfi-device-reveal.png` (copied asset)
- [ ] delete `src/components/anchor/OneEightTrillionAnchor.tsx` (after grep confirms unused)
- [ ] `PROJECT_STATE.md` + `docs/journal/2026-06.md` (per documentation convention)
