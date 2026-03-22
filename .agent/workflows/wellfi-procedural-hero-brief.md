# WellFi Procedural Hero Brief

> **2026-03-21 deprecation note:** This workflow is no longer the active hero truth for the homepage. It reflects an earlier reducer/fiberglass/coupling explainer concept that drifted away from the approved marketing visual. Keep it only as historical reference or for a later explainer section. Do **not** use it as the default first-load hero brief.

This brief replaces the older particle-first hero ideas.

## Recommendation

Build the first-pass hero assembly directly in `React Three Fiber` as a procedural scene.

Why:
- The required geometry is simple enough to model from code.
- The scene needs to be interactive, mobile-safe, and fast to iterate.
- A stylized technical render is a better target than weak browser photorealism.

## Story To Communicate

Show one clean engineering idea:

1. A larger production pipe reduces to a smaller pipe.
2. A fiberglass coupling creates the insulated break.
3. WellFi is clamped across that break.
4. The dipole path is implied by the two metal contact points on either side.
5. A signal pulse travels to surface.

The visual should make an engineer understand the mechanism in one glance.

## Reference Corrections

These corrections come from the latest user-provided photos.

- The current hero assumption of an expanded pipe transition is wrong. The pipe reduces down into the section near the fiberglass coupling.
- The stainless portion should read as smooth machined metal, not a rough cast or glossy chrome finish.
- The fiberglass coupling sits flush near the stainless body on the reduced pipe section.
- The hero should avoid blocky placeholder clamp geometry if the real product language is smooth, tapered, and machined.
- Real-world rust, grime, and workshop clutter are reference only, not hero styling targets.

## What To Model

Model only the parts that matter for the story:

1. Upper large pipe
2. Tapered reducer into small pipe
3. Small pipe section above coupling
4. Fiberglass coupling
5. Small pipe section below coupling
6. WellFi body mounted parallel to the small pipe
7. Top clamp contacting pipe above the fiberglass break
8. Bottom clamp contacting pipe below the fiberglass break
9. Minimal signal path to surface

Do not model the full pump string in the hero.

## What To Fake

Fake these aggressively:

- Exact engineering dimensions
- Thread detail
- Bolt detail
- Internal electronics
- True casing depth scale
- Full surface equipment
- Outer wellbore shell in the first pass

These details add cost without improving the first-read story.

## Relative Proportions

Use ratios, not exact dimensions:

- Large pipe outer diameter: `1.0`
- Small pipe outer diameter: `0.62`
- Fiberglass coupling length: `1.25 x` small pipe diameter
- Reducer length: `1.75 x` large pipe diameter
- WellFi body length: `7.5 x` small pipe diameter
- Clamp spacing: each clamp centered `0.7 x` coupling length from coupling midpoint
- WellFi body offset from pipe centerline: `1.1 x` small pipe radius

These numbers are only for visual balance.

## Scene Composition

Use a single strong hero composition:

- Camera angle: front three-quarter, slightly above centerline
- Pipe axis: near-vertical with a slight diagonal bias
- Coupling and clamps: centered in the frame
- WellFi body: fully readable in silhouette
- Background: controlled dark void, not a busy environment

The coupling and both clamps must be visible at the same time.

## Materials

Use authored stylization, not realism-chasing.

- Metal pipe: dark steel `matcap` or low-complexity physical metal
- Fiberglass coupling: warm off-white or pale tan with satin roughness
- WellFi body: brushed steel with slightly brighter edge response
- Clamps: darker machined alloy
- Signal path: restrained cyan emissive accent
- Background surfaces, if any: extremely subdued and secondary to the assembly

`Matcap` means a baked lighting look applied from a texture so the object reads well without expensive real-time lighting.

## Lighting

Keep the light rig simple and deliberate:

1. Strong cool rim from upper back-left
2. Soft fill from front-right
3. Narrow top kicker on coupling and clamp edges
4. Cyan pulse acts as the main animated light event in the scene

Avoid broad glows and broad ambient haze.

## Animation Sequence

Target `2.4s to 3.2s` total.

### Shot beats

1. `0.0s - 0.8s`
   Assembly is already mounted and fully framed.
   Camera eases in slightly.
   Lighting wakes up from dark.

2. `0.8s - 1.8s`
   Clamp contact points and fiberglass break become visually obvious through light and framing.

3. `1.8s - 2.6s`
   A signal pulse crosses the insulated break and rises toward surface.
   That pulse should briefly light nearby steel surfaces.

4. `2.6s - 3.2s`
   Scene settles.
   Text remains readable.
   Intro clears or hands off to the quieter page state.

No bounce, no springy overshoot, no gimmick particles.

## Motion Rules

- Camera moves should be slow and confident.
- Hardware should feel stable and heavy.
- Signal motion can move faster than the hardware.
- Idle motion after the intro should be nearly imperceptible.

## Mobile Rules

Mobile gets a different composition, not a squeezed desktop shot.

- Shorter camera distance
- Less visible surface receiver detail
- Larger coupling and clamp presence in frame
- Shorter intro duration if needed
- Keep the mechanism readable above the fold

## Technical Stack

Use the current web stack:

- `@react-three/fiber`
- `three`
- `@react-three/drei`
- optional `@react-three/postprocessing` only if needed
- `gsap` for overlay timing only

Do not introduce another 3D engine.

## Implementation Direction

The procedural scene should replace the GLB-dependent insert in:

- `src/components/hero/HeroIntroCanvas.tsx`

Build the geometry from primitives:

- `CylinderGeometry`
- `LatheGeometry` or tapered cylinders for the reducer
- simple custom clamp meshes from grouped boxes and cylinders
- local clipping planes for cutaway control

Use reusable parts:

- `PipeSection`
- `ReducerSection`
- `FiberglassCoupling`
- `Clamp`
- `WellFiBody`
- `SignalPulse`

## Non-Goals

Do not do these in the first pass:

- Full photorealism
- Full manufacturing accuracy
- Complex shader experiments
- Full scrollytelling
- Surface facility scene building
- Dense labels or floating UI markers
- Cutaway wellbore geometry in the first pass

## Quality Bar

The result should read as:

- industrial
- premium
- credible
- engineered
- visually controlled

It must not read as:

- generic AI startup
- abstract tech art
- browser demo
- CAD screenshot

## Review Checklist

Before calling the first pass acceptable, check:

1. Can a new viewer immediately identify the fiberglass break?
2. Can they see that WellFi bridges across it?
3. Do the two clamp contact points read clearly?
4. Does the scene still work without text?
5. Does the mobile crop preserve the mechanism?
6. Are the materials controlled enough to avoid the "fake photoreal" look?
