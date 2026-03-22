# Particle Text Hero — Design Document

**Date:** 2026-03-21
**Status:** Approved
**Supersedes:** 2026-03-20-motion-poster-hero-design.md (concept retained, technique upgraded)

---

## 1. Concept

A one-shot 4-second hero entrance where ~2,500 teal particles (#22D3EE) start
clustered on the WellFi tool surface, explode upward like an EM signal, and
arrange themselves into the letterforms of **"STOP PUMPING BLIND."** via spring
physics. After settling, mouse movement scatters the dots within their letter
boundaries. The hero then holds as a static marketing page with visible CTAs.

The particles tell the product story: the signal travels from the hardware to
the message. An engineer instantly reads: this tool sends data upward.

---

## 2. The Sequence

| Beat | Time        | What Happens                                                    |
|------|-------------|-----------------------------------------------------------------|
| 0    | 0.0–0.5s    | Black void. Logo and tagline fade in at low opacity.            |
| 1    | 0.5–1.0s    | Tool PNG fades in (opacity 0→0.55, translateY 20→0).            |
|      |             | Teal dots appear clustered on the tool surface, gently pulsing. |
| 2    | 1.0–1.8s    | Dots explode upward via spring physics into letter shapes.      |
|      |             | Tool holds at 0.55 opacity during explosion.                   |
| 3    | 1.8–2.2s    | Dots settle into crisp letterforms. Spring damping completes.   |
|      |             | Tool ghosts down to 0.15 opacity.                              |
| 4    | 2.2–3.2s    | Supporting copy fades in below headline.                        |
|      |             | Proof chips stagger in (0.12s each).                           |
|      |             | Primary CTA + secondary CTA fade in.                           |
| 5    | 3.2–4.0s    | Single subtle pulse on logo. Timeline completes.                |
|      |             | Mouse interaction activates on particle canvas.                 |
| HOLD | 4.0s+       | Settled marketing page. Particles hold letter shapes.           |
|      |             | Mouse repels dots within letter bounds. No looping.             |

---

## 3. Rendering Architecture

### Layer Stack (bottom to top)

```
z-0   Background gradients (existing radial + linear gradients)
z-1   Glass orbs (existing, static after entrance — no infinite animation)
z-5   Tool PNG (Next/Image, priority loaded, anchored right)
z-10  Particle canvas (Canvas 2D, overlays headline area, aria-hidden)
z-15  Hidden real <h1> (DOM text for accessibility + SEO, very low opacity)
z-20  Post-reveal content (supporting copy, proof chips, CTAs)
z-25  Logo + tagline (top-left, existing position)
```

### Technology Choices

| Component           | Technology        | Why                                              |
|---------------------|-------------------|--------------------------------------------------|
| Tool render         | Static PNG        | Priority-loaded, instant LCP, no WebGL needed    |
| Particle system     | Canvas 2D         | 2,500 particles at 60fps, no Three.js overhead   |
| Text target bitmap  | Offscreen canvas  | getImageData for pixel-level letter boundaries    |
| Entrance timeline   | GSAP + useGSAP    | Frame-accurate choreography with position params  |
| Physics             | Custom spring math | ~10 lines: velocity += (target-pos)*k; vel *= f  |
| Mouse interaction   | mousemove + rAF   | Repulsion force, clamped by bitmap bounds         |
| Bloom/glow on dots  | Canvas shadows     | shadowBlur + shadowColor on fillRect — cheap glow |
| Text reveal fallback| CSS clip-path      | For prefers-reduced-motion: instant text, no canvas|
| Post-reveal content | GSAP stagger       | Fade-in-up with 0.12s stagger delay              |

---

## 4. Particle System Specification

### Particle Properties

```ts
interface Particle {
  // Current position (animated)
  x: number;
  y: number;
  // Velocity for spring physics
  vx: number;
  vy: number;
  // Home position (on tool surface)
  homeX: number;
  homeY: number;
  // Target position (letter pixel)
  targetX: number;
  targetY: number;
  // Visual
  radius: number;    // 1.2–2.0px (randomized)
  alpha: number;     // 0.6–1.0
  // State
  phase: 'gather' | 'explode' | 'settle';
}
```

### Physics Constants

```ts
const SPRING_STIFFNESS = 0.08;   // How fast particles reach target
const SPRING_DAMPING   = 0.82;   // Velocity decay per frame (1 = no damping)
const MOUSE_RADIUS     = 80;     // px — repulsion influence radius
const MOUSE_FORCE      = 6;      // Repulsion strength
const RETURN_STIFFNESS = 0.12;   // How fast dots return after mouse leaves
```

### Text Bitmap Generation

1. Create offscreen `<canvas>` sized to match headline container
2. Set font: `'700 ${fontSize}px Space Grotesk'`
3. Fill text: "STOP", "PUMPING", "BLIND." on separate lines
4. Call `ctx.getImageData()` — extract alpha channel
5. Build `Uint8Array` lookup: `bitmap[x + y * width] = alpha > 128 ? 1 : 0`
6. Sample every Nth filled pixel as a particle target position
7. On resize: re-run steps 1–6 via ResizeObserver

### Sampling Strategy

- Scan bitmap left-to-right, top-to-bottom
- For every filled pixel, add to candidate pool
- Randomly sample 2,500 candidates (desktop) or 1,000 (mobile)
- Jitter each target by ±1px to avoid grid artifacts
- Home positions: random scatter within tool PNG bounding box

### Per-Frame Update Loop

```ts
function updateParticles(particles: Particle[], mouseX: number, mouseY: number) {
  for (const p of particles) {
    // Spring toward target
    const dx = p.targetX - p.x;
    const dy = p.targetY - p.y;
    p.vx += dx * SPRING_STIFFNESS;
    p.vy += dy * SPRING_STIFFNESS;

    // Mouse repulsion (desktop only)
    if (mouseActive) {
      const mx = p.x - mouseX;
      const my = p.y - mouseY;
      const dist = Math.sqrt(mx * mx + my * my);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * MOUSE_FORCE;
        p.vx += (mx / dist) * force;
        p.vy += (my / dist) * force;
      }
    }

    // Damping
    p.vx *= SPRING_DAMPING;
    p.vy *= SPRING_DAMPING;

    // Update position
    p.x += p.vx;
    p.y += p.vy;

    // Letter boundary constraint (after mouse repulsion)
    // If particle pushed outside letter, pull it back
    const bx = Math.floor(p.x);
    const by = Math.floor(p.y);
    if (bx >= 0 && bx < bitmapW && by >= 0 && by < bitmapH) {
      if (bitmap[bx + by * bitmapW] === 0) {
        // Outside letter — spring back harder toward target
        p.vx += (p.targetX - p.x) * RETURN_STIFFNESS;
        p.vy += (p.targetY - p.y) * RETURN_STIFFNESS;
      }
    }
  }
}
```

### Rendering

```ts
function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  ctx.clearRect(0, 0, width, height);

  // Glow layer (drawn first, under sharp dots)
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#22D3EE';

  for (const p of particles) {
    ctx.globalAlpha = p.alpha * 0.4;
    ctx.fillStyle = '#22D3EE';
    ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
  }

  // Sharp dot layer (drawn on top)
  ctx.shadowBlur = 0;
  for (const p of particles) {
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = '#7DEEFF';  // Brighter core
    ctx.fillRect(p.x - p.radius * 0.6, p.y - p.radius * 0.6, p.radius * 1.2, p.radius * 1.2);
  }

  ctx.globalAlpha = 1;
}
```

---

## 5. GSAP Master Timeline

```ts
useGSAP(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Beat 0: Logo + tagline fade in
  tl.fromTo(logoRef.current,
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, duration: 0.5 },
    0
  );

  // Beat 1: Tool PNG fades in
  tl.fromTo(toolRef.current,
    { autoAlpha: 0, y: 20 },
    { autoAlpha: 0.55, y: 0, duration: 0.5 },
    0.5
  );

  // Beat 2: Trigger particle explosion (canvas handles physics)
  tl.call(() => particleCanvasRef.current?.triggerExplode(), [], 1.0);

  // Beat 3: Ghost tool after particles settle
  tl.to(toolRef.current,
    { autoAlpha: 0.15, duration: 0.4, ease: 'power2.inOut' },
    1.8
  );

  // Beat 4: Supporting content staggers in
  tl.fromTo('.hero-support-line',
    { autoAlpha: 0, y: 14 },
    { autoAlpha: 1, y: 0, duration: 0.5 },
    2.2
  );

  tl.fromTo('.hero-proof-chip',
    { autoAlpha: 0, scale: 0.95 },
    { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.12 },
    2.5
  );

  tl.fromTo('.hero-cta',
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.15 },
    2.8
  );

  // Beat 5: Subtle logo pulse
  tl.fromTo(logoRef.current,
    { filter: 'brightness(1)' },
    { filter: 'brightness(1.3)', duration: 0.3, yoyo: true, repeat: 1 },
    3.2
  );

  // Beat 6: Enable mouse interaction after settle
  tl.call(() => particleCanvasRef.current?.enableMouseInteraction(), [], 3.5);

}, { scope: heroRef });
```

---

## 6. Post-Reveal Content (Settle State)

After Beat 4, the hero becomes a static marketing page:

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   [WellFi Logo]                              (tool at    │
│   Data Below. Insight Above.                  15% ghost) │
│                                                          │
│                    S T O P                                │
│                 P U M P I N G                             │
│                  B L I N D .                              │
│                (particle text, interactive)               │
│                                                          │
│   Real-time downhole pressure through                    │
│   steel casing. No cables. No extra rig time.            │
│                                                          │
│   [130+ installed] [MODBUS RS-485] [5+ year battery]     │
│                                                          │
│   [Request a Quote]  [View Specifications ↓]             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Content (from content.ts — add these)

```ts
hero.supportLine = 'Real-time downhole pressure through steel casing. No cables. No extra rig time.';
hero.proofChips = ['130+ installed globally', 'MODBUS RS-485', '5+ year battery'];
hero.ctaPrimary = 'Request a Quote';
hero.ctaSecondary = 'View Specifications';
```

---

## 7. Responsive Behavior

| Property          | Desktop (≥1024px) | Mobile (<1024px) |
|-------------------|-------------------|------------------|
| Particle count    | 2,500             | 1,000            |
| Canvas DPR        | window.dpr        | 1 (capped)       |
| Mouse interaction | Full repulsion    | Disabled          |
| Spring stiffness  | 0.08              | 0.12 (faster)    |
| Headline font     | ~6rem             | ~2.8rem          |
| Tool position     | Right 4%, anchored| Center, smaller   |
| Layout            | Side-by-side      | Stacked           |

---

## 8. Accessibility & Reduced Motion

### Screen Readers
- Real `<h1>` exists in DOM: `<h1 class="sr-only">Stop Pumping Blind.</h1>`
- Canvas is `aria-hidden="true"`
- All post-reveal content is semantic HTML

### prefers-reduced-motion: reduce
- Skip canvas particle animation entirely
- Show headline as static text (full opacity, no particles)
- Tool fades in instantly (no animation)
- Supporting content visible immediately
- No mouse interaction

---

## 9. Performance Budget

| Metric              | Target    | How                                          |
|---------------------|-----------|----------------------------------------------|
| LCP                 | < 1.5s    | Tool PNG is priority Image, no render-block   |
| JS parse (hero)     | < 50ms    | No Three.js, no GLB, just Canvas 2D + GSAP   |
| Canvas frame time   | < 8ms     | 2,500 fillRect calls + spring math           |
| Memory              | < 5MB     | Particle array + bitmap Uint8Array            |
| Extra bundle        | ~0KB      | GSAP already loaded; Canvas is native browser |
| Total hero assets   | < 200KB   | PNG (optimized) + JS (tree-shaken GSAP)       |

---

## 10. Files Changed

### New Files
- `src/components/hero/ParticleCanvas.tsx` — Canvas 2D particle system
- `docs/plans/2026-03-21-particle-text-hero-design.md` — this document

### Modified Files
- `src/components/hero/HeroSection.tsx` — rebuilt with GSAP timeline + post-reveal content
- `src/lib/content.ts` — add supportLine, proofChips, ctaPrimary, ctaSecondary
- `src/app/globals.css` — remove 9 infinite keyframes, add hero-settled class

### Deleted Code (within files)
- All `@keyframes hero*` infinite animations in globals.css
- `hero-motion.ts` — loop state machine (no longer needed)
- `HeroToolStage.tsx` overlay elements (sheen, pulse-trail, pulse-halo, pulse-dot)
- `data-hero-active` scroll listener in HeroSection.tsx

### Kept (not touched)
- `HeroCinematicCanvas.tsx` — used in tool explorer section, not hero
- `WellFiSideClampModel.tsx` — used in tool explorer section
- `SignalRing.tsx` — used in tool explorer section
- `EMPulse.tsx` — may be removed later, not blocking

---

## 11. Anti-Patterns (What Will Kill Impact)

- Particles moving randomly instead of toward letter targets (looks like confetti, not EM)
- Too many particles (>4000) causing frame drops on mid-range laptops
- Mouse repulsion that pushes dots completely outside letters (breaks the illusion)
- Dots that are too large (>3px) — should feel like data points, not bubbles
- Looping the entrance (the whole point is one-shot → hold)
- Ghost tool too dark (0.05) — needs to remain subtly visible as context
- CTAs that appear before the headline settles (premature, undercuts the gut punch)
- Particle text that doesn't match the real h1 sizing (accessibility mismatch)

---

## 12. Success Criteria

1. Engineer watches the 4s sequence and reads "Stop Pumping Blind." as a statement, not a tagline
2. The particle explosion reads as "signal traveling from tool to message"
3. Mouse interaction feels playful but controlled — dots scatter and reform, never chaotic
4. Mobile loads fast, particles settle quickly, page is immediately usable
5. Supporting copy and CTAs are visible within 3.5s — visitor can act without scrolling
6. No layout shifts during or after the animation
7. prefers-reduced-motion shows a clean static page with zero animation
8. Lighthouse Performance score remains > 90
