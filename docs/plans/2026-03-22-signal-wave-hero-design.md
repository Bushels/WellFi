# Hero Animation Design: "The Signal Becomes The Message"

**Date:** 2026-03-22
**Status:** Approved
**Replaces:** GenesisOverlay (10.5s) + ParticleCanvas (separate component)

## Creative Vision

A traveling electromagnetic sine wave sweeps left-to-right across a dark screen.
As the wave front reaches the text zone, the wave energy morphs into the words
"STOP PUMPING BLIND" — the EM signal literally carries the message. The WellFi
logo drops in above. The engineer can then interact with the text particles
via mouse/touch repulsion.

**Reference images:**
- `wellfi-dwg/EM Pulse.jpeg` — layered harmonic sine wave with bright core
- `wellfi-dwg/WellFi_Signal_Blackbackgound.jpeg` — tool emitting concentric EM rings
- `wellfi-dwg/Animation_Sin.mp4` — traveling sine wave animation

## Animation Sequence (5 seconds)

| Phase | Time | Description |
|-------|------|-------------|
| Dark | 0.0–0.3s | Pure black screen (#0A0E1A). Anticipation beat. |
| Wave Entry | 0.3–1.5s | ~2500 particles enter from left edge in sine wave formation. Multiple layered harmonics (bright core + dimmer trailing lines). Glow rendering. |
| Wave Sweep | 1.5–2.5s | Wave crosses full viewport width. Amplitude modulates slightly (breathing). Sparkle particles trail behind leading edge. |
| Wave → Text Morph | 2.5–3.5s | As wave front passes text zone x-positions, particles break from sine paths and spring toward "STOP PUMPING BLIND" bitmap targets. Letters form left-to-right following the wave. Spring physics creates organic overshoot + settle. |
| Logo Drop | 3.5–4.0s | WellFi logo fades in above settled text. |
| Content Cascade | 4.0–5.0s | Supporting copy, proof chips, CTAs stagger in. Mouse interaction enables on text particles. |
| Settled | 5.0s+ | Text particles respond to mouse/touch repulsion. Living, interactive hero. |

## Technical Architecture

### Single Unified Component
Replaces both `GenesisOverlay.tsx` and `ParticleCanvas.tsx` with one component:
**`SignalWaveHero.tsx`** — full-screen Canvas 2D with internal state machine.

### Particle State Machine
Each of the ~2500 particles has a state:
```
offscreen → sine_travel → morphing → settled
```

- **offscreen**: Particle exists but is not yet visible. Waits for its staggered entry time.
- **sine_travel**: Particle moves right at constant speed. Y-position follows:
  `y = centerY + amplitude * sin(frequency * x + phase + particlePhaseOffset)`
  Each particle has slight variation in amplitude and phase for layered look.
- **morphing**: Spring physics redirects particle toward its text bitmap target.
  `velocity += (target - current) * stiffness; velocity *= damping; current += velocity`
- **settled**: Particle is at its text target. Mouse repulsion active with letter-bound constraint.

### Rendering (Two-Pass)
1. **Glow pass**: `ctx.shadowBlur = 6`, `globalCompositeOperation = 'lighter'`, low alpha, wider radius
2. **Core pass**: Full alpha, smaller radius, sharp dots

### Color Palette
- `#7DEEFF` — bright core (leading edge)
- `#22D3EE` — glow / trailing particles
- `#06B6D4` — deep / settled text
- `#082F49` — edge fade

### Text Bitmap Sampling
- Render "STOP PUMPING BLIND" to offscreen canvas at viewport-appropriate size
- `getImageData()` to extract alpha channel
- Sample every Nth filled pixel as particle target position
- Pre-compute `Uint8Array` bitmap lookup for O(1) letter-bound mouse constraint

### Wave Visual Composition
To match the EM Pulse reference (multiple layered lines, not just dots):
- Group particles into ~30 "wave lines" (each line = ~83 particles)
- Within each line, particles are spaced evenly on x-axis
- Lines have decreasing amplitude from center outward (Gaussian envelope)
- Center lines are brightest (core), outer lines are dimmer (harmonics)
- Optional: connect particles within same line with thin polylines for continuous wave look

### GSAP Orchestration
```
const tl = gsap.timeline()
tl.call(startWaveEntry, [], 0.3)
tl.call(startMorphPhase, [], 2.5)
tl.to(logoRef, { opacity: 1 }, 3.5)
tl.to(supportRef, { opacity: 1 }, 4.0)
tl.call(enableMouseInteraction, [], 4.5)
tl.add(() => heroRef.classList.add('hero-settled'), 5.0)
```

### Responsive
- Desktop: 2500 particles, full harmonic depth
- Tablet: 1500 particles
- Mobile: 1000 particles, fewer harmonic lines
- DPR capped at 2

### Accessibility
- `prefers-reduced-motion: reduce` → skip animation, show settled state immediately
- `<span class="sr-only">` fallback with full text content
- Canvas is decorative (`role="presentation"`)

## Dependencies
**Zero new packages.** Uses:
- Canvas 2D (browser native)
- GSAP 3.14 (already installed)
- React 19 refs + imperative handle (already installed)

## Files to Create
- `src/components/hero/SignalWaveHero.tsx` — unified wave + morph + interactive component

## Files to Modify
- `src/app/page.tsx` — replace GenesisOverlay + ParticleCanvas with SignalWaveHero
- `src/components/hero/HeroSection.tsx` — update GSAP timeline to new sequence

## Files to Delete (Dead Code Cleanup)
- `src/components/genesis/GenesisOverlay.tsx`
- `src/components/hero/EMWaveScene.tsx`
- `src/components/hero/EMWaveSceneB.tsx`
- `src/components/hero/EMWaveSceneC.tsx`
- `src/components/hero/EMWaveSceneFinal.tsx`
- `src/components/hero/HeroIntroCanvas.tsx`
- `src/components/hero/HeroRenderCardCanvas.tsx`
- `src/components/hero/HeroWorkflowStage.tsx`
- `src/components/hero/HeroToolStage.tsx`
- `src/components/hero/HeroToolFigure.tsx`
- `src/lib/hero-motion.ts`

## Success Criteria
1. Wave visually matches the EM Pulse reference (layered harmonics, bright core)
2. Wave-to-text morph feels like energy transforming into meaning (not a cross-fade)
3. Text is fully readable within 1s of morph starting
4. 60fps on desktop, 30fps minimum on mobile
5. Total sequence completes in ~5s
6. Mouse/touch repulsion on settled text particles works smoothly
7. Reduced motion users see settled state immediately
8. Zero new dependencies added
