# "Stop Pumping Blind" Motion Poster Hero — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a cinematic R3F-powered motion poster hero featuring the side-clamp WellFi tool with animated lighting reveal, traveling EM signal ring, and GSAP-orchestrated text entrance.

**Architecture:** R3F canvas renders the side-clamp tool with procedural geometry + imported GLB clamp detail. Cinematic lighting rig fades up in stages. SignalRing travels upward. GSAP timeline coordinates HTML text reveals with R3F animation via shared clock. Post-processing: Bloom + SSAO (desktop) + DOF + Vignette.

**Tech Stack:** React Three Fiber, Drei, @react-three/postprocessing, GSAP 3.14 + @gsap/react, Next.js 16 static export.

**Design Doc:** `docs/plans/2026-03-20-motion-poster-hero-design.md`

**Previous approach (Blender) abandoned:** Assembly of individual STEP parts via Blender MCP failed after 10+ iterations — parts couldn't be positioned correctly without CAD assembly constraints. See `memory/feedback_blender_assembly.md`.

---

## Task 1: R3F Side-Clamp Tool Model

**Files:**
- Create: `src/components/hero/WellFiSideClampModel.tsx`
- Reference: `public/models/wellfi-sideclamp.glb` (869 KB, Draco-compressed)
- Reference: `wellfi-dwg/Side Clamp/` (reference images)

**Step 1: Create the model component**

Build a R3F component that renders the WellFi side-clamp tool. Two strategies, try in order:

**Strategy A — GLB Import:**
```tsx
import { useGLTF } from '@react-three/drei';

const MODEL_PATH = '/models/wellfi-sideclamp.glb';
useGLTF.preload(MODEL_PATH);

// Load and apply stainless steel MeshPhysicalMaterial
```

If the GLB assembly geometry looks correct (clamps at ends, signal adapter running parallel to pipe), use it directly.

**Strategy B — Procedural Fallback:**
If the GLB assembly is wrong, build from Three.js primitives:
```tsx
// Production tubing: dark pipe
<mesh><cylinderGeometry args={[0.030, 0.030, 3.0, 32]} /></mesh>

// Signal adapter: stainless cylinder alongside pipe
<mesh position={[0.04, 0, 0]}>
  <cylinderGeometry args={[0.023, 0.023, 2.5, 32]} />
</mesh>

// Clamp sections at top and bottom
// Battery barrel cylinders between clamps
```

**Step 2: Apply materials**

```
WellFi Steel (MeshPhysicalMaterial):
  color: #D8E4EE
  roughness: 0.14
  metalness: 0.97
  clearcoat: 1.0
  clearcoatRoughness: 0.06
  envMapIntensity: 0 (animated up during reveal)
  emissive: #66EFFF
  emissiveIntensity: 0 (animated up)

Dark Pipe (MeshStandardMaterial):
  color: #0A0A0A
  roughness: 0.9
  metalness: 0.1
```

**Step 3: Orient vertically and verify**

Run `npm run dev`. The tool should appear vertical with the pipe running top-to-bottom. Check against reference images in `wellfi-dwg/Side Clamp/`.

**Step 4: Commit**

```bash
git add src/components/hero/WellFiSideClampModel.tsx
git commit -m "feat(hero): R3F side-clamp tool model component"
```

---

## Task 2: Adapt HeroCinematicCanvas for Side-Clamp

**Files:**
- Modify: `src/components/hero/HeroCinematicCanvas.tsx`
- Reference: `src/components/hero/WellFiSideClampModel.tsx` (from Task 1)
- Reference: `src/components/hero/SignalRing.tsx` (existing, reuse)

**Step 1: Swap model import**

Replace `PersistentToolStage` (which loads `wellfi-gauge.glb`) with the new `WellFiSideClampModel`. Keep the animated `envMapIntensity` and `emissiveIntensity` logic.

**Step 2: Adjust camera framing**

The side-clamp assembly is taller/narrower than the gauge cylinder. Update camera positions:
- Start: slightly further back to frame the full visible section
- End: closer, foreshortened view showing clamp detail
- FOV: may need to tighten (32→28) for more dramatic foreshortening

**Step 3: Adjust SignalRing parameters**

The signal ring radius needs to match the new tool diameter. Update:
```tsx
<SignalRing
  startTime={1.1}       // Matches Beat 2 timing
  startY={-1.0}         // Bottom of visible tool
  endY={1.2}            // Top of visible tool
  radius={0.035}        // Slightly larger than tool OD (23mm + margin)
  duration={0.4}
/>
```

**Step 4: Verify in browser**

Run `npm run dev`. Check:
- Lighting reveals the tool with staggered fades
- Signal ring travels up the tool body
- Post-processing bloom catches the ring and specular highlights
- Camera settles into foreshortened view

**Step 5: Commit**

```bash
git add src/components/hero/HeroCinematicCanvas.tsx
git commit -m "feat(hero): cinematic canvas adapted for side-clamp model"
```

---

## Task 3: Wire R3F Canvas into HeroSection

**Files:**
- Modify: `src/components/hero/HeroSection.tsx`

**Step 1: Replace static image with R3F canvas**

The current HeroSection renders a `<picture>` element with Blender-rendered WebP images. Replace the image layer with the R3F canvas:

```tsx
import dynamic from 'next/dynamic';

const HeroCinematicCanvas = dynamic(
  () => import('./HeroCinematicCanvas'),
  { ssr: false }
);

// In JSX, replace the hero-image-wrap div with:
<div className="hero-tool-wrap absolute inset-0 z-[1] opacity-0">
  <HeroCinematicCanvas />
</div>
```

**Step 2: Coordinate GSAP with R3F clock**

The R3F canvas has its own internal clock for lighting/camera animation. The GSAP timeline controls HTML elements (text, overlays). They don't need to share a clock — they just need to start at the same time (page load).

Key sync points:
- R3F lighting starts revealing at T+0.0 (R3F clock)
- GSAP starts fading in the canvas wrapper at T+0.5 (matching Beat 1)
- SignalRing fires at T+1.1 (R3F clock)
- GSAP text reveal at T+1.5 is visually timed to follow the ring

**Step 3: Update GSAP timeline**

```tsx
// Beat 1: Canvas fades in (tool already being revealed by R3F lighting)
tl.to('.hero-tool-wrap', { opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.5);

// Beat 3: Text reveal (timed to follow signal ring)
tl.to('.hero-headline', { clipPath: 'inset(0% 0 0 0)', duration: 0.7, ease: 'power3.out' }, 1.5);

// Beat 4: Canvas fades to ghost (tool becomes silhouette behind text)
tl.to('.hero-tool-wrap', { opacity: 0.15, duration: 0.8, ease: 'power2.inOut' }, 2.2);

// Beat 5: Supporting content
tl.to('.hero-support-content', { opacity: 1, y: 0, duration: 0.5 }, 3.2);
```

**Step 4: Remove static image references**

Delete the `<picture>` element and the `wellfi-hero-sideclamp-*` image references. The R3F canvas replaces them entirely.

**Step 5: Verify**

Run `npm run dev`. The full sequence should play:
- 0.0–0.5s: Black screen (R3F canvas hidden, lighting starting to reveal internally)
- 0.5–1.1s: Canvas fades in, tool visible with cinematic lighting
- 1.1–1.5s: Signal ring travels up
- 1.5–2.2s: "STOP PUMPING BLIND" revealed via clip-path
- 2.2–3.0s: Tool ghosts to 15%, logo appears
- 3.0–4.0s: Supporting content fades in

**Step 6: Commit**

```bash
git add src/components/hero/HeroSection.tsx
git commit -m "feat(hero): R3F canvas replaces static image in hero section"
```

---

## Task 4: CSS & Globals Updates

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add hero-specific CSS**

```css
/* Hero motion poster */
.hero-headline { will-change: clip-path; }

/* R3F canvas sizing */
.hero-tool-wrap canvas { width: 100% !important; height: 100% !important; }
```

**Step 2: Remove old signal-ring CSS if present**

The old `.signal-active .signal-ring` keyframes are no longer needed — the signal ring is now a 3D R3F torus, not a CSS animation.

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "refactor(css): update hero styles for R3F motion poster"
```

---

## Task 5: Reduced Motion Fallback

**Files:**
- Modify: `src/components/hero/HeroSection.tsx`

**Step 1: When `prefers-reduced-motion: reduce`, skip the R3F canvas entirely**

```tsx
if (reducedMotion) {
  // Don't render the R3F canvas at all (saves GPU + bundle parse)
  // Show static settled state: headline visible, logo visible, navy background
}
```

This means either conditionally rendering the canvas or rendering a static fallback image.

**Step 2: Verify reduced motion**

In browser devtools, enable reduced motion. Verify:
- No R3F canvas rendered (check DOM)
- All text visible immediately
- Background is navy, not black
- No animations

**Step 3: Commit**

```bash
git add src/components/hero/HeroSection.tsx
git commit -m "feat(hero): reduced motion fallback — skip R3F canvas"
```

---

## Task 6: Visual QA & Tuning

**Files:**
- Possibly modify: `HeroCinematicCanvas.tsx`, `HeroSection.tsx`, `WellFiSideClampModel.tsx`

**Step 1: Desktop full-screen test**

Check against design doc success criteria:
- [ ] Tool reads as real CNC-machined downhole hardware
- [ ] Lighting reveal creates anticipation
- [ ] Signal ring feels like EM telemetry, not sci-fi
- [ ] "Stop Pumping Blind." lands as a gut punch
- [ ] Ghost silhouette maintains product connection
- [ ] Bloom is subtle (only catches bright edges)
- [ ] Mouse parallax works after settle

**Step 2: Mobile test**

- [ ] DPR capped appropriately
- [ ] SSAO disabled on mobile
- [ ] Text readable at clamp sizes
- [ ] No horizontal scroll
- [ ] 30+ fps maintained

**Step 3: Performance**

- [ ] No layout shifts
- [ ] Main thread under 16ms/frame
- [ ] R3F canvas doesn't block TTI excessively

**Step 4: Tune and commit**

```bash
git add -A
git commit -m "polish(hero): visual QA tuning"
```

---

## Task 7: Production Build Verification

**Step 1: Clean build**

```bash
cd wellfi-marketing
rm -rf .next out
npm run build
```

**Step 2: Verify static export**

Check that the GLB model is included in the output:
```bash
ls out/models/wellfi-sideclamp.glb
```

**Step 3: Serve and test**

```bash
npx serve out
```

Verify the full motion poster sequence works from the static build.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: verify production build with R3F motion poster hero"
```

---

## Dependency Summary

| Task | Depends On | Output |
|------|-----------|--------|
| 1 | GLB model or STEP/STL files | WellFiSideClampModel.tsx |
| 2 | Task 1 | Adapted HeroCinematicCanvas.tsx |
| 3 | Task 2 | HeroSection with R3F canvas |
| 4 | Task 3 | CSS updates |
| 5 | Task 3 | Reduced motion fallback |
| 6 | Tasks 3-5 | Visual QA |
| 7 | Task 6 | Production verification |

**Critical path:** Tasks 1→2→3 (model → canvas → hero integration)
**Parallel work:** Task 4 can run alongside Task 5
