# EM Pulse Sequence — Design Document

**Date:** 2026-03-21
**Status:** Approved
**Builds on:** 2026-03-21-particle-text-hero-design.md (particles retained, sequence upgraded)

---

## 1. Concept

The tool is the origin of the signal. The hero tells that story visually:

1. The tool emerges from darkness (spotlight reveal)
2. It fires an electromagnetic pulse (2-3 concentric expanding rings)
3. The pulse wave activates the particles as it passes — a wave of illumination
4. Particles settle into "STOP PUMPING BLIND." letterforms
5. The tool ghosts out — it sent its signal, the message is what matters
6. Marketing content fades in. Hold forever.

This mirrors the real WellFi physics: sonde generates EM signal, signal
travels through casing to surface, data becomes actionable insight.

---

## 2. The Sequence

| Beat | Time        | What Happens                                                      |
|------|-------------|-------------------------------------------------------------------|
| 0    | 0.0–0.8s    | Black void. Logo begins fading in at ~0.3s.                       |
| 1    | 0.8–1.5s    | Tool emerges from darkness via spotlight mask — radial gradient    |
|      |             | mask expands from center, revealing the PNG as if a light turns on.|
|      |             | Tagline fades in alongside.                                       |
| 2    | 1.5–2.0s    | Tool fully revealed. Brief hold — tension before the pulse.       |
|      |             | Particles are present on tool surface but nearly invisible         |
|      |             | (alpha ~0.05), gently pulsing.                                    |
| 3    | 2.0s        | EM PULSE FIRES. 2-3 concentric rings begin expanding from tool    |
|      |             | center point. Leading ring is brightest, trailing rings are       |
|      |             | softer echoes. Rings expand with decreasing opacity.              |
| 4    | 2.0–2.8s    | Rings expand outward across the canvas. As the LEADING ring's     |
|      |             | radius passes each particle's home position, that particle:       |
|      |             |   (a) "activates" — alpha jumps from 0.05 to full                 |
|      |             |   (b) begins springing toward its text target position            |
|      |             | Creates a WAVE of illumination radiating from the tool.           |
| 5    | 2.8–3.2s    | Particles settling into crisp letterforms. Spring damping.        |
|      |             | Rings have faded out at the canvas edges.                         |
| 6    | 3.0–3.5s    | Tool ghosts down to ~15% opacity. It has done its job.            |
| 7    | 3.5–4.2s    | Supporting copy fades in. Proof chips stagger in. CTAs appear.    |
| 8    | 4.2–4.5s    | Subtle logo pulse. Mouse interaction enabled on particles.        |
| HOLD | 4.5s+       | Settled marketing page. Particles hold shapes, mouse repels       |
|      |             | dots within letter bounds. No more pulses. One shot.              |

---

## 3. Technical Changes

### 3a. Spotlight Tool Reveal (CSS mask on tool wrapper)

Instead of a flat `autoAlpha 0 → 0.55` fade, animate a CSS radial mask:

```css
/* GSAP animates --reveal-radius from 0 to 600 */
.tool-spotlight {
  -webkit-mask-image: radial-gradient(
    circle var(--reveal-radius, 0px) at 50% 45%,
    white 95%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle var(--reveal-radius, 0px) at 50% 45%,
    white 95%,
    transparent 100%
  );
}
```

GSAP timeline:
```ts
tl.fromTo(toolRef.current,
  { '--reveal-radius': '0px', opacity: 0 },
  { '--reveal-radius': '600px', opacity: 0.55, duration: 0.7, ease: 'power2.out' },
  0.8
);
```

The spotlight center is at 50% 45% (slightly above center) to catch the
tool's body. The feathered edge (95%→100%) creates a soft spotlight boundary.

### 3b. EM Pulse Rings (Canvas 2D, inside ParticleCanvas)

Add a `pulse` phase to the existing ParticleCanvas state machine.

**Pulse State:**
```ts
interface PulseRing {
  startTime: number;     // when this ring started expanding
  maxRadius: number;     // maximum radius before fade-out
  speed: number;         // px per frame expansion rate
  currentRadius: number; // current radius
  opacity: number;       // current opacity (decreases as radius grows)
}

// 3 rings, staggered by 80ms
const PULSE_RINGS = [
  { delay: 0,    maxRadius: 800, speed: 8, lineWidth: 3.0, startOpacity: 0.9 },
  { delay: 0.08, maxRadius: 750, speed: 7, lineWidth: 2.0, startOpacity: 0.6 },
  { delay: 0.16, maxRadius: 700, speed: 6, lineWidth: 1.5, startOpacity: 0.35 },
];
```

**Drawing a pulse ring:**
```ts
function drawPulseRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  opacity: number,
  lineWidth: number,
) {
  ctx.save();
  ctx.shadowColor = '#22D3EE';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = `rgba(34, 211, 238, ${opacity})`;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner brighter ring for core intensity
  ctx.shadowBlur = 8;
  ctx.strokeStyle = `rgba(125, 238, 255, ${opacity * 0.5})`;
  ctx.lineWidth = lineWidth * 0.4;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}
```

**Pulse origin:** Center of the tool bounds in canvas coordinates:
```ts
const pulseOriginX = toolBounds.x * canvasW + toolBounds.width * canvasW / 2;
const pulseOriginY = toolBounds.y * canvasH + toolBounds.height * canvasH / 2;
```

### 3c. Wave Activation (particles light up as ring passes)

Each particle gets a new property: `activated: boolean` (default `false`).

During gather phase, particles render at very low alpha (0.05).

During pulse phase, for each frame:
```ts
for (const p of particles) {
  if (p.activated) continue;

  const distFromOrigin = Math.sqrt(
    (p.homeX - pulseOriginX) ** 2 +
    (p.homeY - pulseOriginY) ** 2
  );

  // Leading ring activates particles
  if (leadingRingRadius >= distFromOrigin) {
    p.activated = true;
    p.alpha = 0.6 + Math.random() * 0.4; // restore full alpha
    // Begin springing toward text target (same physics as current explode)
  }
}
```

**Unactivated particles** render at alpha 0.05 (barely visible shimmer).
**Activated particles** render at full alpha and begin spring physics.

This creates the wave effect: particles near the tool light up first,
particles far away light up later as the ring sweeps outward.

### 3d. Updated Phase Machine

```
idle → gather → pulse → settle
```

- **idle**: nothing rendered
- **gather**: particles at home positions, alpha 0.05, gentle pulse
- **pulse**: rings expanding, particles activating as rings pass, activated
  particles springing toward targets
- **settle**: all particles activated, at targets, mouse interaction enabled

### 3e. Updated Imperative API

```ts
export interface ParticleCanvasHandle {
  triggerPulse: () => void;           // NEW: fires EM rings + wave activation
  enableMouseInteraction: () => void; // existing
}
```

Remove `triggerExplode()` — replaced by `triggerPulse()` which does both
the ring animation AND the particle activation.

---

## 4. GSAP Timeline Update

```ts
useGSAP(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Beat 0 (0.0-0.8s): Logo fades in
  tl.fromTo(logoRef.current,
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, duration: 0.5 },
    0.3
  );

  // Beat 1 (0.8-1.5s): Tool spotlight reveal
  tl.fromTo(toolRef.current,
    { '--reveal-radius': '0px', autoAlpha: 0 },
    { '--reveal-radius': '600px', autoAlpha: 0.55, duration: 0.7, ease: 'power2.out' },
    0.8
  );

  // Tagline alongside tool reveal
  tl.fromTo(taglineRef.current,
    { autoAlpha: 0, y: 8 },
    { autoAlpha: 0.85, y: 0, duration: 0.4 },
    1.0
  );

  // Beat 3 (2.0s): Fire EM pulse
  tl.call(() => particleRef.current?.triggerPulse(), [], 2.0);

  // Beat 6 (3.0s): Ghost tool
  tl.to(toolRef.current,
    { autoAlpha: 0.15, duration: 0.5, ease: 'power2.inOut' },
    3.0
  );

  // Beat 7 (3.5-4.2s): Marketing content
  tl.fromTo(supportRef.current,
    { autoAlpha: 0, y: 14 },
    { autoAlpha: 1, y: 0, duration: 0.5 },
    3.5
  );

  tl.fromTo('.hero-proof-chip',
    { autoAlpha: 0, scale: 0.95 },
    { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.12 },
    3.8
  );

  tl.fromTo('.hero-cta',
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.15 },
    4.0
  );

  // Beat 8 (4.2s): Enable mouse, settle
  tl.call(() => particleRef.current?.enableMouseInteraction(), [], 4.2);

  tl.call(() => heroRef.current?.classList.add('hero-settled'), [], 4.5);
}, { scope: heroRef });
```

---

## 5. Files Changed

### Modified Files
- `src/components/hero/ParticleCanvas.tsx` — add pulse phase, ring drawing,
  wave activation, update imperative API
- `src/components/hero/HeroSection.tsx` — spotlight mask, updated timeline,
  call `triggerPulse` instead of `triggerExplode`
- `src/app/globals.css` — add `.tool-spotlight` mask styles

### No New Files
Everything fits within the existing component architecture.

---

## 6. Anti-Patterns

- Pulse ring that looks like Material Design ripple (too fast, too uniform)
- All particles activating at once (defeats the wave effect)
- Ring that goes off-canvas instantly (needs to be slow enough to read)
- Multiple pulse events (ONE pulse, period)
- Tool staying bright after pulse (must ghost down)
- Particles visible before pulse (should be nearly invisible at alpha 0.05)
- Spotlight that snaps on (needs smooth radial expansion)

---

## 7. Success Criteria

1. Tool reveal feels like a spotlight turning on in a dark room
2. EM pulse rings read as electromagnetic energy, not UI decoration
3. Wave activation creates visible "sweep" of particles lighting up
4. Text is fully formed and readable by T+3.0s
5. Tool ghosts gracefully — it sent its signal, now the message dominates
6. Marketing content visible by T+4.2s — visitor can act
7. No looping. One pulse. One reveal. Hold.
