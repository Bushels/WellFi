# Particle Text Hero — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the hero section as a one-shot 4-second particle text animation where teal dots explode from the tool PNG into the letterforms of "STOP PUMPING BLIND.", then settle into an interactive marketing page.

**Architecture:** Canvas 2D particle system renders ~2,500 dots that spring from home positions (on tool) to target positions (sampled from text bitmap). GSAP master timeline orchestrates the entrance sequence. After 4s, particles hold their letter shapes with mouse repulsion constrained to letter boundaries. Post-reveal marketing content (supporting copy, proof chips, CTAs) fades in via GSAP stagger.

**Tech Stack:** Next.js 16, React 19, Canvas 2D, GSAP 3.14 + @gsap/react, Tailwind 4, Space Grotesk (font for text bitmap)

**Design Doc:** `docs/plans/2026-03-21-particle-text-hero-design.md`

---

## Task 1: Add Hero Content to content.ts

**Files:**
- Modify: `src/lib/content.ts:8-12` (HeroContent interface)
- Modify: `src/lib/content.ts:79-83` (hero object)

**Step 1: Update HeroContent interface**

Add new fields to the existing interface:

```ts
export interface HeroContent {
  brandWordmarkAlt: string;
  tagline: string;
  pulseHeadline: string;
  supportLine: string;
  proofChips: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  ctaSecondaryHref: string;
}
```

**Step 2: Add content values to hero object**

```ts
export const hero: HeroContent = {
  brandWordmarkAlt: 'WellFi',
  tagline: 'Data Below. Insight Above.',
  pulseHeadline: 'Stop Pumping Blind.',
  supportLine: 'Real-time downhole pressure through steel casing. No cables. No extra rig time.',
  proofChips: ['130+ installed globally', 'MODBUS RS-485', '5+ year battery'],
  ctaPrimary: 'Request a Quote',
  ctaSecondary: 'View Specifications',
  ctaSecondaryHref: '#details',
};
```

**Step 3: Verify build**

Run: `cd C:\Users\kyle\MPS\WellFi\wellfi-marketing && npx next build`
Expected: Build succeeds (no type errors from other components using hero)

**Step 4: Commit**

```bash
git add src/lib/content.ts
git commit -m "feat(content): add hero support line, proof chips, and CTA copy"
```

---

## Task 2: Build ParticleCanvas Component

This is the core component — the Canvas 2D particle system.

**Files:**
- Create: `src/components/hero/ParticleCanvas.tsx`

**Step 1: Create the particle canvas component**

```tsx
'use client';

import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
}

export interface ParticleCanvasHandle {
  triggerExplode: () => void;
  enableMouseInteraction: () => void;
}

interface ParticleCanvasProps {
  /** The text lines to render as particles */
  lines: string[];
  /** Font family for text bitmap (must match visual headline) */
  fontFamily?: string;
  /** Font weight */
  fontWeight?: number;
  /** Max particles (desktop). Mobile auto-halves. */
  maxParticles?: number;
  /** Bounding box of the tool image relative to canvas (normalized 0-1) */
  toolBounds?: { x: number; y: number; width: number; height: number };
  /** Additional className for the canvas wrapper */
  className?: string;
}

// ---------------------------------------------------------------------------
// Physics constants
// ---------------------------------------------------------------------------

const SPRING_STIFFNESS = 0.08;
const SPRING_DAMPING = 0.82;
const MOUSE_RADIUS = 80;
const MOUSE_FORCE = 6;
const RETURN_STIFFNESS = 0.12;
const GATHER_PULSE_SPEED = 0.03;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isMobile() {
  return typeof window !== 'undefined' && window.innerWidth < 1024;
}

function getDevicePixelRatio() {
  if (typeof window === 'undefined') return 1;
  return isMobile() ? 1 : Math.min(window.devicePixelRatio, 2);
}

/** Build a binary bitmap from rendered text. Returns { bitmap, width, height }. */
function buildTextBitmap(
  lines: string[],
  width: number,
  height: number,
  fontFamily: string,
  fontWeight: number,
): { bitmap: Uint8Array; width: number; height: number } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Calculate font size to fill the canvas width with the longest line
  // Start large and shrink until the widest line fits within 90% of canvas width
  let fontSize = Math.floor(height / lines.length * 0.75);
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  // Measure widest line and scale font to fit
  let maxTextWidth = 0;
  for (const line of lines) {
    const m = ctx.measureText(line);
    if (m.width > maxTextWidth) maxTextWidth = m.width;
  }
  if (maxTextWidth > width * 0.92) {
    fontSize = Math.floor(fontSize * (width * 0.92) / maxTextWidth);
  }

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';

  const lineHeight = height / lines.length;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], width / 2, lineHeight * (i + 0.5));
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const bitmap = new Uint8Array(width * height);
  for (let i = 0; i < bitmap.length; i++) {
    // Alpha channel is every 4th byte starting at index 3
    bitmap[i] = imageData.data[i * 4 + 3] > 128 ? 1 : 0;
  }

  return { bitmap, width, height };
}

/** Sample target positions from bitmap. Returns array of {x, y}. */
function sampleTargets(
  bitmap: Uint8Array,
  bitmapW: number,
  bitmapH: number,
  count: number,
): { x: number; y: number }[] {
  // Collect all filled pixel positions
  const candidates: { x: number; y: number }[] = [];
  // Sample every 2nd pixel to speed up scanning
  for (let y = 0; y < bitmapH; y += 2) {
    for (let x = 0; x < bitmapW; x += 2) {
      if (bitmap[x + y * bitmapW] === 1) {
        candidates.push({ x, y });
      }
    }
  }

  // Shuffle and take `count` samples
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return candidates.slice(0, count).map(c => ({
    x: c.x + (Math.random() - 0.5) * 2, // ±1px jitter
    y: c.y + (Math.random() - 0.5) * 2,
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ParticleCanvas = forwardRef<ParticleCanvasHandle, ParticleCanvasProps>(
  function ParticleCanvas(
    {
      lines,
      fontFamily = 'Space Grotesk, system-ui, sans-serif',
      fontWeight = 700,
      maxParticles = 2500,
      toolBounds = { x: 0.65, y: 0.1, width: 0.25, height: 0.7 },
      className,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const bitmapRef = useRef<{ bitmap: Uint8Array; width: number; height: number } | null>(null);
    const rafRef = useRef<number>(0);
    const mouseRef = useRef({ x: -9999, y: -9999, active: false });
    const phaseRef = useRef<'idle' | 'gather' | 'explode' | 'settle'>('idle');
    const [reducedMotion, setReducedMotion] = useState(false);

    // Check reduced motion preference
    useEffect(() => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }, []);

    // Initialize particles and bitmap
    const initParticles = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      if (w === 0 || h === 0) return;

      const dpr = getDevicePixelRatio();
      canvas.width = w * dpr;
      canvas.height = h * dpr;

      // Build text bitmap at canvas logical size
      const bitmapData = buildTextBitmap(lines, w, h, fontFamily, fontWeight);
      bitmapRef.current = bitmapData;

      // Determine particle count
      const count = isMobile() ? Math.min(maxParticles, 1000) : maxParticles;

      // Sample targets
      const targets = sampleTargets(bitmapData.bitmap, w, h, count);

      // Create particles at home positions (on tool surface)
      const particles: Particle[] = targets.map(t => {
        const homeX = toolBounds.x * w + Math.random() * toolBounds.width * w;
        const homeY = toolBounds.y * h + Math.random() * toolBounds.height * h;
        return {
          x: homeX,
          y: homeY,
          vx: 0,
          vy: 0,
          homeX,
          homeY,
          targetX: t.x,
          targetY: t.y,
          radius: 1.2 + Math.random() * 0.8,
          alpha: 0.6 + Math.random() * 0.4,
        };
      });

      particlesRef.current = particles;
      phaseRef.current = 'gather';
    }, [lines, fontFamily, fontWeight, maxParticles, toolBounds]);

    // Animation loop
    useEffect(() => {
      if (reducedMotion) return;

      initParticles();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let gatherTime = 0;

      function animate() {
        rafRef.current = requestAnimationFrame(animate);

        const rect = canvas!.getBoundingClientRect();
        const w = Math.floor(rect.width);
        const h = Math.floor(rect.height);
        const dpr = getDevicePixelRatio();
        const particles = particlesRef.current;
        const bitmap = bitmapRef.current;
        const phase = phaseRef.current;
        const mouse = mouseRef.current;

        if (!ctx || particles.length === 0) return;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        if (phase === 'gather') {
          // Gentle pulse at home positions
          gatherTime += GATHER_PULSE_SPEED;
          for (const p of particles) {
            p.x = p.homeX + Math.sin(gatherTime + p.homeX * 0.1) * 1.5;
            p.y = p.homeY + Math.cos(gatherTime + p.homeY * 0.1) * 1.5;
          }
        } else if (phase === 'explode' || phase === 'settle') {
          const stiffness = isMobile() ? 0.12 : SPRING_STIFFNESS;

          for (const p of particles) {
            // Spring toward target
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            p.vx += dx * stiffness;
            p.vy += dy * stiffness;

            // Mouse repulsion (settle phase, desktop only)
            if (phase === 'settle' && mouse.active && !isMobile()) {
              const mx = p.x - mouse.x;
              const my = p.y - mouse.y;
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

            // Letter boundary constraint (only in settle with mouse active)
            if (phase === 'settle' && mouse.active && bitmap) {
              const bx = Math.floor(p.x);
              const by = Math.floor(p.y);
              if (bx >= 0 && bx < bitmap.width && by >= 0 && by < bitmap.height) {
                if (bitmap.bitmap[bx + by * bitmap.width] === 0) {
                  p.vx += (p.targetX - p.x) * RETURN_STIFFNESS;
                  p.vy += (p.targetY - p.y) * RETURN_STIFFNESS;
                }
              }
            }
          }
        }

        // --- Draw ---
        // Glow layer
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#22D3EE';
        ctx.fillStyle = '#22D3EE';
        for (const p of particles) {
          ctx.globalAlpha = p.alpha * 0.4;
          ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
        }

        // Sharp core layer
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#7DEEFF';
        for (const p of particles) {
          ctx.globalAlpha = p.alpha;
          const r = p.radius * 0.6;
          ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
        }

        ctx.globalAlpha = 1;
      }

      animate();

      return () => {
        cancelAnimationFrame(rafRef.current);
      };
    }, [reducedMotion, initParticles]);

    // Resize observer
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ro = new ResizeObserver(() => {
        // Re-initialize on resize if we're in settle phase
        // (gather/explode will be re-triggered by GSAP anyway)
        if (phaseRef.current === 'settle') {
          initParticles();
          phaseRef.current = 'settle';
        }
      });
      ro.observe(canvas.parentElement || canvas);

      return () => ro.disconnect();
    }, [initParticles]);

    // Mouse tracking
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const handleMouseMove = (e: MouseEvent) => {
        if (!mouseRef.current.active) return;
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
      };

      const handleMouseLeave = () => {
        mouseRef.current.x = -9999;
        mouseRef.current.y = -9999;
      };

      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, []);

    // Expose imperative methods to parent via ref
    useImperativeHandle(ref, () => ({
      triggerExplode() {
        phaseRef.current = 'explode';
        // Auto-transition to settle after spring physics completes (~0.8s)
        setTimeout(() => {
          phaseRef.current = 'settle';
        }, 800);
      },
      enableMouseInteraction() {
        mouseRef.current.active = true;
      },
    }), []);

    // If reduced motion, render nothing (parent shows static text)
    if (reducedMotion) return null;

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={className}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    );
  },
);

export default ParticleCanvas;
```

**Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\kyle\MPS\WellFi\wellfi-marketing && npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add src/components/hero/ParticleCanvas.tsx
git commit -m "feat(hero): add Canvas 2D particle text system with spring physics and mouse repulsion"
```

---

## Task 3: Clean Up globals.css — Remove Infinite Loops

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Remove all hero loop keyframes and classes**

Delete these blocks from globals.css:

1. `@keyframes heroHeadlineLoop` (lines ~584-611)
2. `@keyframes heroToolPresence` (lines ~613-628)
3. `@keyframes heroToolSheen` (lines ~630-651)
4. `@keyframes heroToolSource` (lines ~653-671)
5. `@keyframes heroPulseTrail` (lines ~673-700)
6. `@keyframes heroPulseHalo` (lines ~702-731)
7. `@keyframes heroPulseDot` (lines ~733-761)
8. `@keyframes heroGlassDrift` (lines ~764-777)
9. `@keyframes heroTelemetryPulse` (lines ~378-395)

Also delete these CSS classes that reference the loops:
- `.hero-pulse-headline` (animation: heroHeadlineLoop)
- `.hero-glass-orb` animation property (keep the class, remove animation)
- `.hero-tool-rest-image` animation property
- `.hero-tool-sheen` and all its sub-rules
- `.hero-tool-source`
- `.hero-tool-pulse-trail`
- `.hero-tool-pulse-halo`
- `.hero-tool-pulse-dot`
- `.hero-poster[data-hero-active="false"]` animation-pause rules
- `.hero-dark-pulse` (infinite animation)

**Step 2: Keep these (still used)**

- `.hero-poster` (just sets `--hero-glass-alpha`)
- `.hero-headline` (`will-change: clip-path`)
- `.hero-tool-wrap` canvas sizing rules
- All `@keyframes heroDarkFadeIn`, `heroToolRise`, `heroHeadlineWipe`, `heroFadeUp`, `heroChipPop` — these are one-shot entrance animations, keep them
- `.hero-dark-tool`, `.hero-dark-headline`, etc. — one-shot entrance classes, keep
- All reduced motion rules — keep and update

**Step 3: Add hero-settled utility class**

```css
/* Applied by GSAP after timeline completes — locks final visual state */
.hero-settled .hero-glass-orb {
  opacity: 0.12;
  animation: none;
}
```

**Step 4: Update reduced motion rules**

Update the `@media (prefers-reduced-motion: reduce)` block to include:
```css
.hero-particle-canvas {
  display: none !important;
}

.hero-static-headline {
  opacity: 1 !important;
}
```

**Step 5: Verify build**

Run: `cd C:\Users\kyle\MPS\WellFi\wellfi-marketing && npx next build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/app/globals.css
git commit -m "refactor(css): remove 9 infinite hero keyframes, add hero-settled class"
```

---

## Task 4: Rebuild HeroSection.tsx

This is the main integration task — replacing the looping hero with the one-shot GSAP timeline + particle canvas + post-reveal content.

**Files:**
- Modify: `src/components/hero/HeroSection.tsx` (full rewrite)

**Step 1: Rewrite HeroSection with GSAP timeline**

```tsx
'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import { hero, footer } from '@/lib/content';
import WellFiLogo from '@/components/ui/WellFiLogo';
import ParticleCanvas, { type ParticleCanvasHandle } from './ParticleCanvas';

gsap.registerPlugin(useGSAP);

const HEADLINE_LINES = ['STOP', 'PUMPING', 'BLIND.'];

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const toolRef = useRef<HTMLDivElement>(null);
  const particleRef = useRef<ParticleCanvasHandle>(null);
  const supportRef = useRef<HTMLParagraphElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Check reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Beat 0 (0.0-0.5s): Logo + tagline fade in
      tl.fromTo(
        logoRef.current,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        0,
      );
      tl.fromTo(
        taglineRef.current,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 0.85, y: 0, duration: 0.4 },
        0.15,
      );

      // Beat 1 (0.5-1.0s): Tool fades in
      tl.fromTo(
        toolRef.current,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 0.55, y: 0, duration: 0.5 },
        0.5,
      );

      // Beat 2 (1.0s): Trigger particle explosion
      tl.call(() => particleRef.current?.triggerExplode(), [], 1.0);

      // Beat 3 (1.8s): Ghost tool down
      tl.to(
        toolRef.current,
        { autoAlpha: 0.15, duration: 0.4, ease: 'power2.inOut' },
        1.8,
      );

      // Beat 4 (2.2-3.0s): Supporting content staggers in
      tl.fromTo(
        supportRef.current,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        2.2,
      );

      if (chipsRef.current) {
        const chips = chipsRef.current.querySelectorAll('.hero-proof-chip');
        tl.fromTo(
          chips,
          { autoAlpha: 0, scale: 0.95 },
          { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.12 },
          2.5,
        );
      }

      if (ctaRef.current) {
        const buttons = ctaRef.current.querySelectorAll('.hero-cta');
        tl.fromTo(
          buttons,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.15 },
          2.8,
        );
      }

      // Beat 5 (3.2s): Logo pulse + enable mouse interaction
      tl.fromTo(
        logoRef.current,
        { filter: 'brightness(1)' },
        { filter: 'brightness(1.3)', duration: 0.3, yoyo: true, repeat: 1 },
        3.2,
      );

      tl.call(() => particleRef.current?.enableMouseInteraction(), [], 3.5);

      // After complete — add settled class
      tl.call(() => {
        heroRef.current?.classList.add('hero-settled');
      }, [], 4.0);
    },
    { scope: heroRef, dependencies: [] },
  );

  return (
    <section
      ref={heroRef}
      id="hero"
      className="hero-poster relative isolate min-h-screen overflow-hidden bg-[#020408] text-white"
    >
      {/* --- Background layers (z-0) --- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_17%_22%,rgba(11,42,74,0.34),transparent_34%),radial-gradient(circle_at_75%_28%,rgba(255,255,255,0.05),transparent_26%),linear-gradient(180deg,#010205_0%,#02070e_58%,#050b14_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(2,7,14,0.92)_100%)]"
      />

      {/* --- Glass orbs (z-1) --- */}
      <div
        aria-hidden="true"
        className="hero-glass-orb pointer-events-none absolute right-[6%] top-[14%] z-[1] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(126,238,255,0.3)_0%,rgba(29,78,136,0.16)_36%,rgba(3,10,18,0)_72%)] opacity-[0.12] blur-[56px]"
      />
      <div
        aria-hidden="true"
        className="hero-glass-orb pointer-events-none absolute left-[11%] top-[18%] z-[1] h-[16rem] w-[16rem] rounded-full bg-[radial-gradient(circle,rgba(125,238,255,0.08)_0%,rgba(16,78,140,0.06)_38%,rgba(2,7,14,0)_72%)] opacity-[0.06] blur-[44px]"
      />

      {/* --- Main content grid --- */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[96rem] flex-col justify-center px-6 py-16 sm:px-10 lg:flex-row lg:items-center lg:px-12 xl:px-14">

        {/* Left column: brand + post-reveal content */}
        <div className="relative z-20 flex flex-col gap-6 lg:max-w-[34rem] lg:pr-12">
          {/* Logo */}
          <div ref={logoRef} className="invisible">
            <WellFiLogo className="w-[15rem] sm:w-[18rem] lg:w-[28rem]" />
          </div>

          {/* Tagline */}
          <p
            ref={taglineRef}
            className="invisible max-w-[18ch] text-[clamp(1.1rem,2vw,1.7rem)] font-medium tracking-[-0.02em] text-[#d7dee8]"
          >
            {hero.tagline}
          </p>

          {/* Support line (hidden until Beat 4) */}
          <p
            ref={supportRef}
            className={`invisible max-w-[36ch] text-[clamp(0.95rem,1.6vw,1.15rem)] leading-relaxed text-[#9CA3AF] ${prefersReducedMotion ? '!visible' : ''}`}
          >
            {hero.supportLine}
          </p>

          {/* Proof chips (hidden until Beat 4) */}
          <div ref={chipsRef} className="flex flex-wrap gap-2.5">
            {hero.proofChips.map((chip) => (
              <span
                key={chip}
                className={`hero-proof-chip invisible inline-flex items-center rounded-full border border-[rgba(6,182,212,0.25)] bg-[rgba(6,182,212,0.08)] px-3.5 py-1.5 text-[0.8rem] font-medium tracking-wide text-[#22D3EE] ${prefersReducedMotion ? '!visible' : ''}`}
              >
                {chip}
              </span>
            ))}
          </div>

          {/* CTAs (hidden until Beat 4) */}
          <div ref={ctaRef} className="flex flex-wrap gap-3 pt-2">
            <a
              href={`mailto:${footer.email}`}
              className={`hero-cta btn-primary invisible text-sm ${prefersReducedMotion ? '!visible' : ''}`}
            >
              {hero.ctaPrimary}
            </a>
            <a
              href={hero.ctaSecondaryHref}
              className={`hero-cta btn-secondary invisible text-sm ${prefersReducedMotion ? '!visible' : ''}`}
            >
              {hero.ctaSecondary}
            </a>
          </div>
        </div>

        {/* Right column: tool image + particle canvas */}
        <div className="relative mt-8 flex flex-1 items-center justify-center lg:mt-0">
          {/* Tool PNG (z-5) */}
          <div
            ref={toolRef}
            className="invisible relative h-[clamp(20rem,50vh,36rem)] w-[clamp(8rem,20vw,16rem)]"
          >
            <Image
              src="/images/wellfi-sideclamp-hero.png"
              alt="WellFi side-clamped tool mounted vertically alongside carbon steel pipe"
              fill
              priority
              sizes="(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 20vw"
              className="select-none object-contain object-center brightness-[0.6] contrast-[1.08] saturate-[0.72]"
            />
          </div>

          {/* Particle canvas (z-10) — overlays the headline area */}
          <div className="hero-particle-canvas absolute inset-0 z-10">
            <ParticleCanvas
              ref={particleRef}
              lines={HEADLINE_LINES}
              fontFamily="Space Grotesk, system-ui, sans-serif"
              fontWeight={700}
              maxParticles={2500}
              toolBounds={{ x: 0.55, y: 0.15, width: 0.3, height: 0.65 }}
              className="h-full w-full"
            />
          </div>

          {/* Accessible hidden headline (z-15) */}
          <h1 className="sr-only">{hero.pulseHeadline}</h1>

          {/* Static headline fallback for reduced motion */}
          {prefersReducedMotion && (
            <h1 className="hero-static-headline absolute inset-0 z-[15] flex items-center justify-center text-center text-[clamp(2.4rem,8vw,5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-[#f5f8fd]">
              {hero.pulseHeadline}
            </h1>
          )}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify build**

Run: `cd C:\Users\kyle\MPS\WellFi\wellfi-marketing && npx next build`
Expected: Build succeeds, no type errors

**Step 3: Commit**

```bash
git add src/components/hero/HeroSection.tsx
git commit -m "feat(hero): rebuild as one-shot GSAP timeline with particle text and post-reveal content"
```

---

## Task 5: Visual QA — Dev Server Test

**Files:**
- No file changes — visual inspection only

**Step 1: Start dev server**

Run: `cd C:\Users\kyle\MPS\WellFi\wellfi-marketing && npm run dev`
Expected: Server starts on localhost:3000

**Step 2: Desktop viewport check**

Open browser at http://localhost:3000. Verify:
- [ ] Black void for ~0.5s on load
- [ ] Logo + tagline fade in
- [ ] Tool PNG fades in (right side)
- [ ] Teal dots visible on tool, gently pulsing
- [ ] Dots explode upward into "STOP PUMPING BLIND." letterforms
- [ ] Dots settle into readable text
- [ ] Tool ghosts to ~15%
- [ ] Supporting copy, proof chips, CTAs fade in
- [ ] Mouse over particle text scatters dots within letter bounds
- [ ] No looping — animation plays once then holds

**Step 3: Mobile viewport check (375px wide)**

Resize browser or use dev tools mobile simulation. Verify:
- [ ] Particle count reduced (fewer, denser dots)
- [ ] Text readable at mobile font size
- [ ] No horizontal scroll
- [ ] CTAs visible without scrolling
- [ ] Smooth 30+ fps

**Step 4: Reduced motion check**

In browser dev tools, enable "prefers-reduced-motion: reduce". Verify:
- [ ] No canvas visible
- [ ] Static headline text shown immediately
- [ ] All content visible immediately
- [ ] No animations

**Step 5: Tune physics constants if needed**

If particles feel too slow/fast/bouncy, adjust in ParticleCanvas.tsx:
- `SPRING_STIFFNESS` (higher = faster reach)
- `SPRING_DAMPING` (lower = more bounce)
- `MOUSE_RADIUS` (larger = wider repulsion)
- `MOUSE_FORCE` (higher = stronger push)

**Step 6: Commit any tuning changes**

```bash
git add -u
git commit -m "tune: adjust particle physics constants after visual QA"
```

---

## Task 6: Production Build Verification

**Files:**
- No file changes — build verification only

**Step 1: Clean build**

Run: `cd C:\Users\kyle\MPS\WellFi\wellfi-marketing && rm -rf .next out && npx next build`
Expected: Build succeeds with no warnings about missing assets

**Step 2: Verify static export**

Run: `ls out/images/wellfi-sideclamp-hero.png`
Expected: File exists in output

**Step 3: Serve and test**

Run: `npx serve out`
Open browser and replay full sequence from static build. Verify identical behavior to dev server.

**Step 4: Performance check**

Run Lighthouse in Chrome DevTools (Performance category). Verify:
- [ ] LCP < 2.0s
- [ ] No layout shifts (CLS = 0)
- [ ] Performance score > 90

**Step 5: Final commit (if any fixes needed)**

```bash
git add -u
git commit -m "fix: production build corrections after static export verification"
```

---

## Task Dependency Graph

```
Task 1 (content.ts) ──┐
                       ├──► Task 4 (HeroSection rebuild)
Task 2 (ParticleCanvas) ──┤
                           │
Task 3 (CSS cleanup) ──────┘
                               │
                               ▼
                        Task 5 (Visual QA)
                               │
                               ▼
                        Task 6 (Production build)
```

Tasks 1, 2, and 3 are **independent** and can run in parallel.
Task 4 depends on all three.
Tasks 5 and 6 are sequential after Task 4.
