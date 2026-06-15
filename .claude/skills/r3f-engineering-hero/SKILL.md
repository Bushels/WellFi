---
name: r3f-engineering-hero
description: Patterns for building animated React Three Fiber "engineering diorama" heroes (the WellFi island hero) — stylized subsurface/equipment scenes with a timed lighting cycle, signal/pulse animation, and SCADA-style telemetry readouts. Use when building or extending an animated R3F marketing hero, a downhole/well diorama, a live-data callout overlay, or reusing these animations for presentations.
---

# R3F Engineering Hero Dioramas

Hard-won patterns from building the WellFi island hero (`src/components/hero/island/`,
`src/lib/island/`). Use these when building a similar animated, technically-credible R3F
scene that must impress engineers AND look premium (the "Legend of Zelda: BotW diorama" bar).

## Architecture — the load-bearing pattern

**Split pure math from rendering, and drive everything from ONE clock.**

1. **Pure-math modules, unit-tested** (`src/lib/island/`): `layout.ts` (geometry constants,
   palette, point-in-polygon), `cycle.ts` (the time→state animation envelope), `wellPath.ts`
   (authored curves). No React, no three objects with side effects — just functions returning
   numbers/vectors. Unit-test the invariants (seam: `state(T) ≡ state(0)`; geometry stays in
   bounds; monotonic radii). These tests are the guardrail when you tune values later.
2. **One `useFrame` clock at priority −1** in the scene root evaluates `cycleState(t)` once per
   frame and writes into **refs** (`cycleRef.current = s`), plus drives lights and shader
   uniforms. Consumers run their own `useFrame` at default priority (runs after −1, so the ref
   is fresh) and **mutate the DOM / object props directly — never per-frame React state.**
3. **Components are dumb**: they read a ref and render. This keeps 60fps clean and makes the
   animation deterministic and seamless.

```
clock (priority -1): cycleState(t) → cycleRef, light.intensity, material.setPulse(...)
consumers (priority 0): read cycleRef → mutate mesh/DOM
```

## Telemetry / live-data readout (SCADA callout)

A glass `<Html>` (drei) callout that shows live readings and **snaps to a new channel only
when a signal "arrives"** (`TelemetryReadout.tsx`). Pattern:
- Scene clock computes `{ intensity, channel, value }` into a ref. Channel switches on an
  arrival fraction within the pulse (`ARRIVAL_F`), so the number changes exactly when the
  pulse hits — reinforcing "the signal carried this data."
- The component's `useFrame` mutates `box.style.opacity`/`transform` and `span.textContent`
  directly (guard with a `shownChannel`/`shownValue` ref to skip no-op writes). No React state.
- Hold the last/most-important reading into the relight so it's **readable** — a 0.6s flash is
  too quick. Style: dark glass + cyan border/glow + mono font + downward pointer + a live dot.
- **Be honest with derived numbers**: prefix `≈` for calibration-dependent figures. For WellFi,
  resistivity → **water cut** is the only defensible fluid derivation (NOT API/density/flow);
  it needs an operator produced-water baseline (Rw) and is temp-corrected. See the handover.

## Emissive pulse + flow shader

`pulseMaterial.ts` patches `MeshStandardMaterial` via `onBeforeCompile`: a gaussian emissive
"head" rides the tube's `vUv.x`, plus periodic dash "chevrons" for steady flow. Gotchas:
- `material.toneMapped = false` so the glow isn't crushed.
- **`customProgramCacheKey` per instance** — three caches programs by `onBeforeCompile` source
  text; identical factories collide and the 2nd material silently reuses the 1st's shader.
- Wrap the flow time (`elapsedTime % 20`, where 20·rate is an integer dash period) so `fract()`
  doesn't lose fragment precision after a long session.

## Stylized materials that read as "engineering"

- **Strata lamination = world-Y procedural shader** (`Terrain.tsx`), NOT a bumpMap. Bump only
  perturbs normals (invisible on flat, smoothly-lit slab walls) and never touches base color;
  real lithology layering IS color variation. Modulate albedo by world Y → beds read horizontal
  on every cut face regardless of UV.
- Instanced forests/props (one `InstancedMesh` per variant), seeded deterministic scatter
  (mulberry32, NOT `Math.random`) so it's identical across loads/hydration.

## Static-export safety + LCP

- **Poster-first**: a still of the scene (`public/*.webp`) paints first (LCP + no-WebGL
  fallback), the canvas mounts behind a post-effect gate and cross-fades in. The mount gate
  (tier set in a client effect, `tier === null` until then) keeps the Canvas subtree out of the
  static-export prerender entirely — that's the SSR boundary; guard any `document` access too.
- Reduced-motion conditionals that reach SSR'd markup must be **CSS** (`motion-safe:`), not JS —
  hydration won't patch attribute mismatches on a static export.

## ⚠️ basePath `/wellfi` deploy reality

This app is `output:'export'` + `basePath:'/wellfi'`; the `/wellfi` prefix only resolves via the
mpsgroup.energy rewrite. **Raw `vercel.app` URLs (prod AND preview) serve broken pages** — review
on the **local dev server** (`localhost:<port>/wellfi`) or `mpsgroup.energy/wellfi`. A Vercel
preview deploy of this app is NOT directly viewable. See `site/CLAUDE.md` → "Deploy + local dev".

## Verifying animated R3F in a headless browser

Pulses/readouts are visible only briefly. A blind screenshot usually misses the window. Instead,
in one `browser_evaluate` loop, poll the target DOM element's `style.opacity` and return when it's
on the **rising edge** (e.g. climbing past 0.5) — then screenshot. Measure brightness/cyan-pixels
of saved PNGs in PowerShell (`System.Drawing`) to pick the right frame; WebGL `drawImage`→2D
readback returns black (no `preserveDrawingBuffer`), so sample the screenshot, not the canvas.

## Build approach that worked

Brainstorm → spec → plan (`docs/superpowers/`) → **subagent-driven development**: a fresh
implementer subagent per task, then two-stage review (spec-compliance, then code-quality) with
fix loops. Code-in-full plans + test-guarded pure modules made the fan-out reliable. The reviews
caught real bugs (shader cache collision, troughs floating above the floor, a hydration hole).

## Reference

- Code: `src/components/hero/island/*`, `src/lib/island/*`
- Spec + handover: `wellfi-marketing/docs/superpowers/specs/2026-06-10-wellfi-island-hero-r3f-design.md`,
  `.../handovers/2026-06-15-island-hero-session-handover.md`
- Companion skills: `threejs-skills/*` (fundamentals), `blender-rendering` (the video sibling),
  `wellfi-product` (specs/claims), `engineering-visual` (Subterranean Signal design philosophy)
