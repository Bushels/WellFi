# EM Pulse Sequence — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the hero entrance from instant particle explosion to a cinematic EM pulse sequence: spotlight reveal, concentric pulse rings, wave activation of particles, then settle.

**Architecture:** Modify existing ParticleCanvas to add pulse phase with expanding rings and per-particle wave activation. Update HeroSection GSAP timeline for spotlight reveal and new timing. Add CSS mask for spotlight effect.

**Tech Stack:** Canvas 2D (pulse rings + wave activation), GSAP (timeline + CSS custom property animation), CSS mask-image (spotlight reveal)

**Design Doc:** `docs/plans/2026-03-21-em-pulse-sequence-design.md`

---

## Task 1: Add Spotlight CSS to globals.css

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add spotlight mask class**

Add after the `.hero-headline` rule:

```css
/* Spotlight reveal — GSAP animates --reveal-radius from 0 to 600 */
.tool-spotlight {
  --reveal-radius: 0px;
  -webkit-mask-image: radial-gradient(
    circle var(--reveal-radius) at 50% 45%,
    white 95%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle var(--reveal-radius) at 50% 45%,
    white 95%,
    transparent 100%
  );
}
```

**Step 2: Verify build**

Run: `cd /c/Users/kyle/MPS/WellFi/wellfi-marketing && npx next build`

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(css): add tool-spotlight mask class for radial reveal"
```

---

## Task 2: Upgrade ParticleCanvas with Pulse Phase

This is the core change. Add EM pulse rings, wave activation, and updated API.

**Files:**
- Modify: `src/components/hero/ParticleCanvas.tsx`

**Step 1: Add `activated` property to Particle interface**

```ts
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
  targetX: number;
  targetY: number;
  radius: number;
  alpha: number;
  activated: boolean;  // NEW
}
```

Initialize `activated: false` in the particle creation (initParticles).
Set initial `alpha: 0.05` (barely visible during gather).

**Step 2: Add pulse ring configuration**

```ts
const PULSE_RING_COUNT = 3;
const PULSE_RING_DELAY = 0.08; // seconds between each ring start
const PULSE_RING_SPEED = 8;    // px per frame for leading ring
const PULSE_MAX_RADIUS = 800;  // max radius before ring fades out

interface PulseRingState {
  startedAt: number;   // elapsed time when this ring started
  radius: number;
  opacity: number;
  speed: number;
  lineWidth: number;
  startOpacity: number;
  active: boolean;
}
```

**Step 3: Add pulse ring refs**

```ts
const pulseRingsRef = useRef<PulseRingState[]>([]);
const pulseStartTimeRef = useRef<number>(0);
const pulseOriginRef = useRef({ x: 0, y: 0 });
```

**Step 4: Update phase machine**

Change phases from `'idle' | 'gather' | 'explode' | 'settle'` to:
`'idle' | 'gather' | 'pulse' | 'settle'`

**Step 5: Add pulse ring drawing function**

```ts
function drawPulseRing(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number,
  opacity: number,
  lineWidth: number,
) {
  if (opacity <= 0 || radius <= 0) return;

  ctx.save();

  // Outer glow ring
  ctx.shadowColor = '#22D3EE';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = `rgba(34, 211, 238, ${opacity})`;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner brighter core ring
  ctx.shadowBlur = 8;
  ctx.strokeStyle = `rgba(125, 238, 255, ${opacity * 0.5})`;
  ctx.lineWidth = lineWidth * 0.4;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}
```

**Step 6: Update the animation loop for pulse phase**

In the `animate()` function, replace the `explode` phase logic with `pulse`:

```ts
if (phase === 'pulse') {
  const elapsed = performance.now() / 1000;
  const pulseElapsed = elapsed - pulseStartTimeRef.current;
  const origin = pulseOriginRef.current;
  const rings = pulseRingsRef.current;

  // Update and draw each ring
  let leadingRadius = 0;
  for (let i = 0; i < rings.length; i++) {
    const ring = rings[i];
    const ringElapsed = pulseElapsed - (i * PULSE_RING_DELAY);
    if (ringElapsed < 0) continue;

    ring.radius = ringElapsed * ring.speed * 60; // convert to px
    ring.opacity = ring.startOpacity * (1 - ring.radius / PULSE_MAX_RADIUS);
    ring.active = ring.radius < PULSE_MAX_RADIUS;

    if (ring.active && ring.opacity > 0) {
      drawPulseRing(ctx, origin.x, origin.y, ring.radius, ring.opacity, ring.lineWidth);
    }

    if (i === 0) leadingRadius = ring.radius;
  }

  // Wave activation — particles light up as leading ring passes
  const stiffness = isMobile() ? 0.12 : SPRING_STIFFNESS;
  for (const p of particles) {
    if (!p.activated) {
      const dist = Math.sqrt(
        (p.homeX - origin.x) ** 2 + (p.homeY - origin.y) ** 2
      );
      if (leadingRadius >= dist) {
        p.activated = true;
        p.alpha = 0.6 + Math.random() * 0.4;
      }
    }

    if (p.activated) {
      // Spring toward target (same physics as before)
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      p.vx += dx * stiffness;
      p.vy += dy * stiffness;
      p.vx *= SPRING_DAMPING;
      p.vy *= SPRING_DAMPING;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  // Transition to settle when all rings are done
  const allDone = rings.every(r => r.radius >= PULSE_MAX_RADIUS);
  if (allDone) {
    phaseRef.current = 'settle';
  }
}
```

**Step 7: Update gather phase rendering**

During gather, particles render at alpha 0.05 (nearly invisible):
```ts
if (phase === 'gather') {
  gatherTime += GATHER_PULSE_SPEED;
  for (const p of particles) {
    p.x = p.homeX + Math.sin(gatherTime + p.homeX * 0.1) * 1.5;
    p.y = p.homeY + Math.cos(gatherTime + p.homeY * 0.1) * 1.5;
    // Keep alpha at 0.05 (set during init)
  }
}
```

**Step 8: Update imperative handle**

Replace `triggerExplode` with `triggerPulse`:

```ts
useImperativeHandle(ref, () => ({
  triggerPulse() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    // Pulse origin = center of tool bounds
    pulseOriginRef.current = {
      x: toolBounds.x * w + toolBounds.width * w / 2,
      y: toolBounds.y * h + toolBounds.height * h / 2,
    };

    // Initialize 3 rings
    pulseRingsRef.current = [
      { startedAt: 0, radius: 0, opacity: 0.9, speed: 8, lineWidth: 3.0, startOpacity: 0.9, active: true },
      { startedAt: 0, radius: 0, opacity: 0.6, speed: 7, lineWidth: 2.0, startOpacity: 0.6, active: true },
      { startedAt: 0, radius: 0, opacity: 0.35, speed: 6, lineWidth: 1.5, startOpacity: 0.35, active: true },
    ];

    pulseStartTimeRef.current = performance.now() / 1000;
    phaseRef.current = 'pulse';
  },
  enableMouseInteraction() {
    mouseRef.current.active = true;
  },
}), [toolBounds]);
```

**Step 9: Update the export type**

```ts
export interface ParticleCanvasHandle {
  triggerPulse: () => void;
  enableMouseInteraction: () => void;
}
```

**Step 10: Verify build**

Run: `cd /c/Users/kyle/MPS/WellFi/wellfi-marketing && npx tsc --noEmit && npx next build`

**Step 11: Commit**

```bash
git add src/components/hero/ParticleCanvas.tsx
git commit -m "feat(hero): add EM pulse rings with wave particle activation"
```

---

## Task 3: Update HeroSection Timeline

**Files:**
- Modify: `src/components/hero/HeroSection.tsx`

**Step 1: Add spotlight class to tool wrapper**

Change the tool div className to include `tool-spotlight`:
```tsx
<div
  ref={toolRef}
  className="tool-spotlight invisible relative h-[clamp(20rem,50vh,36rem)] w-[clamp(8rem,20vw,16rem)]"
>
```

**Step 2: Update GSAP timeline**

Replace the current timeline with the new sequence:

```ts
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

// Tagline alongside tool
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

// Beat 7 (3.5s): Marketing content
tl.fromTo(supportRef.current,
  { autoAlpha: 0, y: 14 },
  { autoAlpha: 1, y: 0, duration: 0.5 },
  3.5
);

// Chips and CTAs with existing stagger logic...
// (keep existing chip/CTA fromTo calls, adjust position params to 3.8 and 4.0)

// Beat 8 (4.2s): Enable mouse, settle
tl.call(() => particleRef.current?.enableMouseInteraction(), [], 4.2);
tl.call(() => heroRef.current?.classList.add('hero-settled'), [], 4.5);
```

**Step 3: Update the ref type**

Change `triggerExplode` to `triggerPulse` in the timeline call.

**Step 4: Verify build**

Run: `cd /c/Users/kyle/MPS/WellFi/wellfi-marketing && npx next build`

**Step 5: Commit**

```bash
git add src/components/hero/HeroSection.tsx
git commit -m "feat(hero): spotlight reveal + EM pulse timeline with wave activation"
```

---

## Task 4: Visual QA

**Step 1:** Start dev server, open browser
**Step 2:** Verify sequence plays:
- [ ] Black void → spotlight reveals tool
- [ ] Tool fully visible, particles barely visible on surface
- [ ] EM pulse rings fire from tool center (2-3 concentric rings)
- [ ] Particles light up in a wave as rings sweep outward
- [ ] Particles settle into readable "STOP PUMPING BLIND."
- [ ] Tool ghosts to subtle outline
- [ ] Marketing content fades in
- [ ] Mouse interaction works on particle text
- [ ] No second pulse, no looping

**Step 3:** Tune constants if needed:
- Ring speed (PULSE_RING_SPEED)
- Ring opacity falloff
- Ring count and delay
- Particle activation alpha
- Spotlight expand duration

**Step 4:** Commit tuning changes

---

## Task Dependency Graph

```
Task 1 (CSS spotlight) ──┐
                          ├──► Task 3 (HeroSection timeline)
Task 2 (ParticleCanvas) ──┘          │
                                     ▼
                              Task 4 (Visual QA)
```

Tasks 1 and 2 are independent and can run in parallel.
Task 3 depends on both.
Task 4 depends on Task 3.
