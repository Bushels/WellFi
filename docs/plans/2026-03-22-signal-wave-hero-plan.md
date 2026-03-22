# Signal Wave Hero Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace GenesisOverlay + ParticleCanvas with a single `SignalWaveHero` component where a traveling sine wave morphs into "STOP PUMPING BLIND" text.

**Architecture:** Single Canvas 2D component with particle state machine (offscreen → sine_travel → morphing → settled). Particles travel in sine wave formation left-to-right, then spring toward text bitmap targets. GSAP timeline orchestrates phase transitions and content reveal.

**Tech Stack:** Canvas 2D (native), GSAP 3.14, React 19, Next.js 16, TypeScript

---

## Task 1: Create SignalWaveHero Component — Particle Infrastructure

**Files:**
- Create: `src/components/hero/SignalWaveHero.tsx`

**Step 1: Create the component scaffold with types and constants**

```tsx
'use client';

import {
  useRef, useEffect, useCallback,
  useImperativeHandle, forwardRef, useState,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ParticlePhase = 'offscreen' | 'sine_travel' | 'morphing' | 'settled';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  radius: number;
  alpha: number;
  phase: ParticlePhase;
  /** Which "wave line" this particle belongs to (0–29) for layered look */
  lineIndex: number;
  /** Per-particle phase offset for sine variation */
  phaseOffset: number;
  /** Per-particle amplitude multiplier (Gaussian by lineIndex) */
  ampMultiplier: number;
  /** X-position at which this particle enters the screen */
  entryDelay: number;
}

export interface SignalWaveHeroHandle {
  /** Start the wave animation (called by GSAP timeline) */
  startWave: () => void;
  /** Trigger the morph from wave to text */
  triggerMorph: () => void;
  /** Enable mouse/touch interaction on settled text */
  enableMouseInteraction: () => void;
}

interface SignalWaveHeroProps {
  /** Text lines to morph into */
  lines: string[];
  fontFamily?: string;
  fontWeight?: number;
  maxParticles?: number;
  className?: string;
}

// ---------------------------------------------------------------------------
// Physics & Rendering Constants
// ---------------------------------------------------------------------------

const WAVE_LINES = 30;
const WAVE_SPEED = 4; // px per frame — how fast the wave sweeps right
const WAVE_FREQUENCY = 0.025; // sine frequency along x-axis
const BASE_AMPLITUDE = 120; // max sine amplitude in px (center lines)

const SPRING_STIFFNESS = 0.08;
const SPRING_DAMPING = 0.82;
const MOUSE_RADIUS = 80;
const MOUSE_FORCE = 6;
const RETURN_STIFFNESS = 0.12;

// Colors
const COLOR_CORE = '#7DEEFF';
const COLOR_GLOW = '#22D3EE';
const COLOR_DEEP = '#06B6D4';

// ---------------------------------------------------------------------------
// Helpers — reused from ParticleCanvas (proven)
// ---------------------------------------------------------------------------

function isMobile() {
  return typeof window !== 'undefined' && window.innerWidth < 1024;
}

function getDevicePixelRatio() {
  if (typeof window === 'undefined') return 1;
  return isMobile() ? 1 : Math.min(window.devicePixelRatio, 2);
}

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

  let fontSize = Math.floor(height / lines.length * 0.75);
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

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
    bitmap[i] = imageData.data[i * 4 + 3] > 128 ? 1 : 0;
  }

  return { bitmap, width, height };
}

function sampleTargets(
  bitmap: Uint8Array,
  bitmapW: number,
  bitmapH: number,
  count: number,
): { x: number; y: number }[] {
  const candidates: { x: number; y: number }[] = [];
  for (let y = 0; y < bitmapH; y += 2) {
    for (let x = 0; x < bitmapW; x += 2) {
      if (bitmap[x + y * bitmapW] === 1) {
        candidates.push({ x, y });
      }
    }
  }

  // Fisher-Yates shuffle
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return candidates.slice(0, count).map(c => ({
    x: c.x + (Math.random() - 0.5) * 2,
    y: c.y + (Math.random() - 0.5) * 2,
  }));
}
```

**Step 2: Verify file compiles**

Run: `cd /c/Users/kyle/MPS/WellFi/wellfi-marketing && npx tsc --noEmit src/components/hero/SignalWaveHero.tsx 2>&1 | head -20`
Expected: No errors (or only unused variable warnings since component isn't complete yet)

---

## Task 2: SignalWaveHero — Particle Initialization & Sine Travel Phase

**Files:**
- Modify: `src/components/hero/SignalWaveHero.tsx`

**Step 1: Add the component body with particle initialization**

After the helper functions, add the component. Key logic:
- Each particle is assigned to one of 30 "wave lines" (for the layered harmonic look)
- Center lines (lineIndex near 15) get full amplitude; outer lines get Gaussian-reduced amplitude
- Each particle gets a staggered `entryDelay` based on its target x-position (left targets enter first)
- Initial phase is `offscreen`

```tsx
const SignalWaveHero = forwardRef<SignalWaveHeroHandle, SignalWaveHeroProps>(
  function SignalWaveHero(
    {
      lines,
      fontFamily = 'Space Grotesk, system-ui, sans-serif',
      fontWeight = 700,
      maxParticles = 2500,
      className,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const bitmapRef = useRef<{ bitmap: Uint8Array; width: number; height: number } | null>(null);
    const rafRef = useRef<number>(0);
    const mouseRef = useRef({ x: -9999, y: -9999, active: false });
    const animPhaseRef = useRef<'idle' | 'wave' | 'morph' | 'settled'>('idle');
    const waveXRef = useRef(-200); // leading edge x-position of the wave
    const [reducedMotion, setReducedMotion] = useState(false);

    // Reduced motion detection
    useEffect(() => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }, []);

    // Initialize particles
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

      // Build text bitmap for morph targets
      const bitmapData = buildTextBitmap(lines, w, h, fontFamily, fontWeight);
      bitmapRef.current = bitmapData;

      const count = isMobile() ? Math.min(maxParticles, 1000) : maxParticles;
      const targets = sampleTargets(bitmapData.bitmap, w, h, count);
      const cy = h / 2;

      const particles: Particle[] = targets.map((t, i) => {
        const lineIndex = i % WAVE_LINES;
        // Gaussian amplitude: center lines (15) get full amplitude, edges fade
        const lineDist = (lineIndex - WAVE_LINES / 2) / (WAVE_LINES / 2);
        const ampMultiplier = Math.exp(-lineDist * lineDist * 2);
        // Stagger entry: particles with leftmost targets enter first
        const entryDelay = (t.x / w) * 1.5; // 0 to 1.5s spread

        return {
          x: -100 - Math.random() * 200, // start offscreen left
          y: cy,
          vx: 0,
          vy: 0,
          targetX: t.x,
          targetY: t.y,
          radius: 1.0 + Math.random() * 0.8,
          alpha: 0,
          phase: 'offscreen' as ParticlePhase,
          lineIndex,
          phaseOffset: lineIndex * 0.15 + Math.random() * 0.3,
          ampMultiplier,
          entryDelay,
        };
      });

      particlesRef.current = particles;
    }, [lines, fontFamily, fontWeight, maxParticles]);

    // ... (animation loop added in next task)

    // Imperative handle
    useImperativeHandle(ref, () => ({
      startWave() {
        waveXRef.current = -200;
        animPhaseRef.current = 'wave';
      },
      triggerMorph() {
        animPhaseRef.current = 'morph';
        // Activate all particles that haven't morphed yet
        for (const p of particlesRef.current) {
          if (p.phase === 'sine_travel') {
            p.phase = 'morphing';
          }
        }
      },
      enableMouseInteraction() {
        mouseRef.current.active = true;
      },
    }), []);

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

export default SignalWaveHero;
```

**Step 2: Verify TypeScript compiles**

Run: `cd /c/Users/kyle/MPS/WellFi/wellfi-marketing && npx tsc --noEmit 2>&1 | head -20`
Expected: Clean or only warnings about unused vars

---

## Task 3: SignalWaveHero — Animation Loop (Wave + Morph + Settle)

**Files:**
- Modify: `src/components/hero/SignalWaveHero.tsx`

**Step 1: Add the main animation loop**

Insert between `initParticles` and `useImperativeHandle`. This is the core render loop that handles all four phases.

```tsx
    // Main animation loop
    useEffect(() => {
      if (reducedMotion) return;
      initParticles();

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let time = 0;

      function animate() {
        rafRef.current = requestAnimationFrame(animate);

        const rect = canvas!.getBoundingClientRect();
        const w = Math.floor(rect.width);
        const h = Math.floor(rect.height);
        const dpr = getDevicePixelRatio();
        const particles = particlesRef.current;
        const bitmap = bitmapRef.current;
        const animPhase = animPhaseRef.current;
        const mouse = mouseRef.current;
        const cy = h / 2;

        if (!ctx || particles.length === 0) return;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        time += 0.016; // ~60fps frame time

        if (animPhase === 'idle') return; // nothing to draw yet

        // --- WAVE PHASE: advance wave front, activate particles ---
        if (animPhase === 'wave') {
          waveXRef.current += WAVE_SPEED;
          const waveX = waveXRef.current;

          for (const p of particles) {
            if (p.phase === 'offscreen') {
              // Activate particle when wave front reaches its entry point
              // Entry point is staggered: earlier targets enter earlier
              const entryX = p.entryDelay * w * 0.5; // spread across first half
              if (waveX > entryX) {
                p.phase = 'sine_travel';
                p.x = -20;
                p.alpha = 0.3 + p.ampMultiplier * 0.7;
              }
            }

            if (p.phase === 'sine_travel') {
              // Move right at wave speed
              p.x += WAVE_SPEED;
              // Y follows sine wave
              const sineY = Math.sin(p.x * WAVE_FREQUENCY + p.phaseOffset + time * 2);
              p.y = cy + sineY * BASE_AMPLITUDE * p.ampMultiplier;

              // When particle's x reaches its target x, start morphing
              if (p.x >= p.targetX) {
                p.phase = 'morphing';
              }
            }
          }

          // If wave front has passed the right edge + buffer, check if all morphing
          if (waveX > w + 200) {
            const allMorphedOrSettled = particles.every(
              p => p.phase === 'morphing' || p.phase === 'settled'
            );
            if (allMorphedOrSettled) {
              animPhaseRef.current = 'morph';
            }
          }
        }

        // --- MORPH / SETTLE: spring physics toward text targets ---
        if (animPhase === 'morph' || animPhase === 'settled' || animPhase === 'wave') {
          const stiffness = isMobile() ? 0.12 : SPRING_STIFFNESS;

          for (const p of particles) {
            if (p.phase === 'morphing' || p.phase === 'settled') {
              const dx = p.targetX - p.x;
              const dy = p.targetY - p.y;
              p.vx += dx * stiffness;
              p.vy += dy * stiffness;

              // Mouse repulsion (only when interaction enabled)
              if (mouse.active && !isMobile()) {
                const mx = p.x - mouse.x;
                const my = p.y - mouse.y;
                const dist = Math.sqrt(mx * mx + my * my);
                if (dist < MOUSE_RADIUS && dist > 0) {
                  const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * MOUSE_FORCE;
                  p.vx += (mx / dist) * force;
                  p.vy += (my / dist) * force;
                }
              }

              p.vx *= SPRING_DAMPING;
              p.vy *= SPRING_DAMPING;
              p.x += p.vx;
              p.y += p.vy;

              // Letter boundary constraint (only when mouse active)
              if (mouse.active && bitmap) {
                const bx = Math.floor(p.x);
                const by = Math.floor(p.y);
                if (bx >= 0 && bx < bitmap.width && by >= 0 && by < bitmap.height) {
                  if (bitmap.bitmap[bx + by * bitmap.width] === 0) {
                    p.vx += (p.targetX - p.x) * RETURN_STIFFNESS;
                    p.vy += (p.targetY - p.y) * RETURN_STIFFNESS;
                  }
                }
              }

              // Check if settled (velocity near zero)
              if (p.phase === 'morphing') {
                const speed = Math.abs(p.vx) + Math.abs(p.vy);
                if (speed < 0.1) {
                  p.phase = 'settled';
                }
              }

              p.alpha = 1.0;
            }
          }

          // Transition global phase to settled when most particles are done
          if (animPhase === 'morph') {
            const settledCount = particles.filter(p => p.phase === 'settled').length;
            if (settledCount > particles.length * 0.9) {
              animPhaseRef.current = 'settled';
            }
          }
        }

        // --- RENDER: Two-pass (glow + core) ---

        // Pass 1: Glow layer
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowColor = COLOR_GLOW;
        ctx.shadowBlur = 6;
        ctx.fillStyle = COLOR_GLOW;
        for (const p of particles) {
          if (p.phase === 'offscreen') continue;
          ctx.globalAlpha = p.alpha * 0.4;
          ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
        }

        // Pass 2: Sharp core
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 0;
        ctx.fillStyle = COLOR_CORE;
        for (const p of particles) {
          if (p.phase === 'offscreen') continue;
          ctx.globalAlpha = p.alpha;
          const r = p.radius * 0.6;
          ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
        }

        // Pass 3: Wave front glow (during wave phase only)
        if (animPhase === 'wave') {
          const waveX = waveXRef.current;
          if (waveX > 0 && waveX < w) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.15;
            const frontGlow = ctx.createRadialGradient(
              waveX, cy, 0, waveX, cy, 150
            );
            frontGlow.addColorStop(0, 'rgba(125, 238, 255, 0.4)');
            frontGlow.addColorStop(0.5, 'rgba(34, 211, 238, 0.1)');
            frontGlow.addColorStop(1, 'rgba(34, 211, 238, 0)');
            ctx.fillStyle = frontGlow;
            ctx.fillRect(0, 0, w, h);
          }
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }

      animate();

      return () => cancelAnimationFrame(rafRef.current);
    }, [reducedMotion, initParticles]);

    // Mouse/touch handlers
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const handleMouseMove = (e: MouseEvent) => {
        if (!mouseRef.current.active) return;
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
      };
      const handleTouchMove = (e: TouchEvent) => {
        if (!mouseRef.current.active) return;
        const t = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = t.clientX - rect.left;
        mouseRef.current.y = t.clientY - rect.top;
      };
      const handleLeave = () => {
        mouseRef.current.x = -9999;
        mouseRef.current.y = -9999;
      };

      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleLeave);
      canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
      canvas.addEventListener('touchend', handleLeave);

      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleLeave);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleLeave);
      };
    }, []);

    // Resize handler
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ro = new ResizeObserver(() => {
        if (animPhaseRef.current === 'settled') {
          initParticles();
          // Re-settle all particles immediately
          for (const p of particlesRef.current) {
            p.x = p.targetX;
            p.y = p.targetY;
            p.phase = 'settled';
            p.alpha = 1;
          }
          animPhaseRef.current = 'settled';
        }
      });
      ro.observe(canvas.parentElement || canvas);

      return () => ro.disconnect();
    }, [initParticles]);
```

**Step 2: Verify TypeScript compiles**

Run: `cd /c/Users/kyle/MPS/WellFi/wellfi-marketing && npx tsc --noEmit 2>&1 | head -20`
Expected: Clean compile

**Step 3: Commit**

```bash
git add src/components/hero/SignalWaveHero.tsx
git commit -m "feat: add SignalWaveHero component with wave-to-text particle morph"
```

---

## Task 4: Wire SignalWaveHero into HeroSection

**Files:**
- Modify: `src/components/hero/HeroSection.tsx`

**Step 1: Replace ParticleCanvas with SignalWaveHero**

Key changes:
- Import `SignalWaveHero` instead of `ParticleCanvas`
- Update ref type to `SignalWaveHeroHandle`
- Update GSAP timeline:
  - At 0.0s: Call `startWave()` (wave begins immediately)
  - At 0.3s: Logo fades in
  - At 2.5s: Support copy starts fading in (wave is morphing by now)
  - At 3.5s: Logo drop animation
  - At 4.0s: Proof chips + CTAs
  - At 4.5s: Enable mouse interaction
- Remove tool PNG spotlight (no longer part of the sequence)
- Remove `toolRef` and tool image entirely — the hero is wave → text → content

```tsx
// Updated imports
import SignalWaveHero, { type SignalWaveHeroHandle } from './SignalWaveHero';

// Remove: toolRef, HEADLINE_LINES stays
// Change: particleRef type
const waveRef = useRef<SignalWaveHeroHandle>(null);

// Updated GSAP timeline
useGSAP(() => {
  if (prefersReducedMotion) return;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Start wave immediately
  tl.call(() => waveRef.current?.startWave(), [], 0.0);

  // Logo fades in
  tl.fromTo(logoRef.current, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.3);

  // Tagline
  tl.fromTo(taglineRef.current, { autoAlpha: 0, y: 8 }, { autoAlpha: 0.85, y: 0, duration: 0.4 }, 1.0);

  // Support copy
  tl.fromTo(supportRef.current, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 3.5);

  // Proof chips
  if (chipsRef.current) {
    const chips = chipsRef.current.querySelectorAll('.hero-proof-chip');
    tl.fromTo(chips, { autoAlpha: 0, scale: 0.95 }, { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.12 }, 3.8);
  }

  // CTAs
  if (ctaRef.current) {
    const buttons = ctaRef.current.querySelectorAll('.hero-cta');
    tl.fromTo(buttons, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.15 }, 4.0);
  }

  // Enable mouse interaction
  tl.call(() => waveRef.current?.enableMouseInteraction(), [], 4.5);

  // Logo pulse
  tl.fromTo(logoRef.current, { filter: 'brightness(1)' }, { filter: 'brightness(1.3)', duration: 0.3, yoyo: true, repeat: 1 }, 4.2);

  // Settle
  tl.call(() => heroRef.current?.classList.add('hero-settled'), [], 5.0);
}, { scope: heroRef, dependencies: [] });
```

**Step 2: Update the JSX — remove tool image, use SignalWaveHero as full-bleed background**

The SignalWaveHero canvas should be positioned absolutely behind the text content.

```tsx
return (
  <section ref={heroRef} id="hero" className="hero-poster relative isolate min-h-screen overflow-hidden bg-[#020408] text-white">
    {/* Background layers */}
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_17%_22%,rgba(11,42,74,0.34),transparent_34%),radial-gradient(circle_at_75%_28%,rgba(255,255,255,0.05),transparent_26%),linear-gradient(180deg,#010205_0%,#02070e_58%,#050b14_100%)]" />

    {/* Signal wave canvas — full bleed behind content */}
    <div className="absolute inset-0 z-[5]">
      <SignalWaveHero
        ref={waveRef}
        lines={HEADLINE_LINES}
        fontFamily="Space Grotesk, system-ui, sans-serif"
        fontWeight={700}
        maxParticles={2500}
        className="h-full w-full"
      />
    </div>

    {/* Accessible hidden headline */}
    <h1 className="sr-only">{hero.pulseHeadline}</h1>

    {/* Content overlay */}
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[96rem] flex-col justify-end px-6 pb-16 sm:px-10 lg:px-12 xl:px-14">
      <div className="flex flex-col gap-6 lg:max-w-[34rem]">
        {/* Logo */}
        <div ref={logoRef} className="invisible">
          <WellFiLogo className="w-[15rem] sm:w-[18rem] lg:w-[28rem]" />
        </div>

        {/* Tagline */}
        <p ref={taglineRef} className="invisible max-w-[18ch] text-[clamp(1.1rem,2vw,1.7rem)] font-medium tracking-[-0.02em] text-[#d7dee8]">
          {hero.tagline}
        </p>

        {/* Support line */}
        <p ref={supportRef} className={`invisible max-w-[36ch] text-[clamp(0.95rem,1.6vw,1.15rem)] leading-relaxed text-[#9CA3AF] ${prefersReducedMotion ? '!visible' : ''}`}>
          {hero.supportLine}
        </p>

        {/* Proof chips */}
        <div ref={chipsRef} className="flex flex-wrap gap-2.5">
          {hero.proofChips.map((chip) => (
            <span key={chip} className={`hero-proof-chip invisible inline-flex items-center rounded-full border border-[rgba(6,182,212,0.25)] bg-[rgba(6,182,212,0.08)] px-3.5 py-1.5 text-[0.8rem] font-medium tracking-wide text-[#22D3EE] ${prefersReducedMotion ? '!visible' : ''}`}>
              {chip}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-wrap gap-3 pt-2">
          <a href={`mailto:${footer.email}`} className={`hero-cta btn-primary invisible text-sm ${prefersReducedMotion ? '!visible' : ''}`}>
            {hero.ctaPrimary}
          </a>
          <a href={hero.ctaSecondaryHref} className={`hero-cta btn-secondary invisible text-sm ${prefersReducedMotion ? '!visible' : ''}`}>
            {hero.ctaSecondary}
          </a>
        </div>

        {/* Reduced motion fallback */}
        {prefersReducedMotion && (
          <h1 className="text-center text-[clamp(2.4rem,8vw,5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-[#f5f8fd]">
            {hero.pulseHeadline}
          </h1>
        )}
      </div>
    </div>
  </section>
);
```

**Step 3: Verify build**

Run: `cd /c/Users/kyle/MPS/WellFi/wellfi-marketing && npm run build 2>&1 | tail -20`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/hero/HeroSection.tsx
git commit -m "feat: wire SignalWaveHero into hero section, replace tool spotlight with wave-to-text"
```

---

## Task 5: Simplify page.tsx — Remove GenesisOverlay

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Remove GenesisOverlay import and state management**

The new page.tsx is much simpler — no overlay/reveal state needed. The wave animation is inside HeroSection now.

```tsx
'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroSection from '@/components/hero/HeroSection';
import Navigation from '@/components/nav/Navigation';
import HighlightsSection from '@/components/highlights/HighlightsSection';
import ToolSection from '@/components/tool/ToolSection';
import SpecsSection from '@/components/specs/SpecsSection';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Navigation />
      <HighlightsSection />
      <div className="section-divider" />
      <ToolSection />
      <div className="section-divider" />
      <SpecsSection />
    </main>
  );
}
```

**Step 2: Verify build**

Run: `cd /c/Users/kyle/MPS/WellFi/wellfi-marketing && npm run build 2>&1 | tail -20`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "refactor: remove GenesisOverlay from page, hero animation is self-contained"
```

---

## Task 6: Delete Dead Code

**Files:**
- Delete: `src/components/genesis/GenesisOverlay.tsx`
- Delete: `src/components/hero/ParticleCanvas.tsx`
- Delete: `src/components/hero/EMWaveScene.tsx` (if exists)
- Delete: `src/components/hero/EMWaveSceneB.tsx` (if exists)
- Delete: `src/components/hero/EMWaveSceneC.tsx` (if exists)
- Delete: `src/components/hero/EMWaveSceneFinal.tsx` (if exists)
- Delete: `src/components/hero/HeroIntroCanvas.tsx` (if exists)
- Delete: `src/components/hero/HeroRenderCardCanvas.tsx` (if exists)
- Delete: `src/components/hero/HeroWorkflowStage.tsx` (if exists)
- Delete: `src/components/hero/HeroToolStage.tsx` (if exists)
- Delete: `src/components/hero/HeroToolFigure.tsx` (if exists)
- Delete: `src/lib/hero-motion.ts`

**Step 1: Delete all dead files**

```bash
cd /c/Users/kyle/MPS/WellFi/wellfi-marketing
rm -f src/components/genesis/GenesisOverlay.tsx
rm -f src/components/hero/ParticleCanvas.tsx
rm -f src/components/hero/EMWaveScene.tsx
rm -f src/components/hero/EMWaveSceneB.tsx
rm -f src/components/hero/EMWaveSceneC.tsx
rm -f src/components/hero/EMWaveSceneFinal.tsx
rm -f src/components/hero/HeroIntroCanvas.tsx
rm -f src/components/hero/HeroRenderCardCanvas.tsx
rm -f src/components/hero/HeroWorkflowStage.tsx
rm -f src/components/hero/HeroToolStage.tsx
rm -f src/components/hero/HeroToolFigure.tsx
rm -f src/lib/hero-motion.ts
```

**Step 2: Check for any remaining imports of deleted files**

Run: `grep -r "GenesisOverlay\|ParticleCanvas\|EMWaveScene\|HeroIntroCanvas\|HeroRenderCard\|HeroWorkflow\|HeroToolStage\|HeroToolFigure\|hero-motion" src/ --include="*.tsx" --include="*.ts" -l`
Expected: No files found (all references removed)

**Step 3: Update hero index if it re-exports deleted components**

Check `src/components/hero/index.ts` — remove any re-exports of deleted files.

**Step 4: Verify build**

Run: `cd /c/Users/kyle/MPS/WellFi/wellfi-marketing && npm run build 2>&1 | tail -20`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove dead hero animation files (GenesisOverlay, ParticleCanvas, 10 experimental files)"
```

---

## Task 7: Visual Verification & Tuning

**Files:**
- May modify: `src/components/hero/SignalWaveHero.tsx` (tuning constants)

**Step 1: Start dev server**

Run: `cd /c/Users/kyle/MPS/WellFi/wellfi-marketing && npm run dev`

**Step 2: Visual checks (use preview tools)**

Verify:
1. Page loads to dark screen
2. Wave enters from left with visible sine formation
3. Particles look like a continuous wave (not scattered dots)
4. Wave sweeps across full viewport
5. Particles morph into "STOP PUMPING BLIND" text
6. Text is readable within ~1s of morph starting
7. Logo drops in above text
8. Mouse interaction works on settled text
9. No frame drops (check console for performance)

**Step 3: Tune if needed**

Common adjustments:
- `WAVE_SPEED`: increase if wave feels too slow (try 5-6)
- `BASE_AMPLITUDE`: increase for more dramatic wave (try 150)
- `WAVE_FREQUENCY`: lower for broader waves, higher for tighter oscillation
- `SPRING_STIFFNESS`: increase for snappier text formation (try 0.1)
- Particle count per wave line (`WAVE_LINES`): decrease for faster rendering

**Step 4: Commit final tuning**

```bash
git add src/components/hero/SignalWaveHero.tsx
git commit -m "fix: tune wave animation timing and amplitude"
```

---

## Task Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Component scaffold + types + helpers | 3 min |
| 2 | Particle init + sine travel phase | 5 min |
| 3 | Animation loop (wave + morph + settle + render) | 5 min |
| 4 | Wire into HeroSection + update GSAP timeline | 5 min |
| 5 | Simplify page.tsx | 2 min |
| 6 | Delete dead code (12 files) | 3 min |
| 7 | Visual verification + tuning | 5 min |

**Total: ~28 minutes**

**Dependencies:** Tasks 1→2→3 are sequential (building the component). Task 4 depends on 3. Tasks 5 and 6 can run in parallel after 4. Task 7 requires all prior tasks.
