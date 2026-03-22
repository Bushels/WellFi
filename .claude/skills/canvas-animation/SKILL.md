---
name: canvas-animation
description: Canvas 2D animation patterns for high-performance particle systems, waveforms, and interactive visual effects. Use when building full-screen canvas animations, particle text effects, EM wave visualizations, or any Canvas 2D-based animation in React/Next.js.
---

# Canvas 2D Animation Patterns

## When to Use Canvas 2D vs Other Approaches

| Approach | Sweet Spot | Particle Limit | Use When |
|----------|-----------|----------------|----------|
| **Canvas 2D** | 500–5,000 particles, waveforms, 2D effects | ~5,000 at 60fps | Interactive text, waveforms, ripples, particle fields |
| **SVG** | <200 elements, path morphing | ~200 | Logo animations, icon transitions, morphing shapes |
| **CSS** | <50 elements, simple transforms | ~50 | Hover effects, loading spinners, simple transitions |
| **WebGL/Three.js** | 10,000+ particles, true 3D | 100,000+ | 3D scenes, GPU shaders, heavy particle systems |

**Rule: Start with Canvas 2D. Upgrade to WebGL only if you need >5,000 particles or GPU shaders.**

## Component Architecture (React/Next.js)

```tsx
// Standard Canvas 2D component structure
'use client';

import { useRef, useEffect, useCallback } from 'react';

interface CanvasAnimationProps {
  className?: string;
  onPhaseChange?: (phase: string) => void;
}

export default function CanvasAnimation({ className, onPhaseChange }: CanvasAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  const startAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- SIZING ---
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2); // CAP DPR
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    // --- ANIMATION LOOP ---
    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      if (!canvas || !ctx) return;
      // ... render logic
    }
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const cleanup = startAnimation();
    return cleanup;
  }, [startAnimation]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
```

**Key patterns:**
- Always cap DPR at 2 (mobile retina is 3x — kills performance)
- Use `useCallback` for the animation starter to avoid re-creating on render
- Null-guard canvas and ctx inside `animate()` for TypeScript
- Mouse refs (not state) — state changes trigger re-renders, refs don't

## Parametric Waveform Rendering

For oscilloscope/EM wave visualizations with dense line work:

```tsx
const LINES = 90;           // Number of horizontal wave lines
const POINTS = 280;         // Points per line (smoothness)
const AMPLITUDE = 0.16;     // Fraction of canvas height
const WAVE_FREQ = 7;        // Cycles across width
const PHASE_SHIFT = 0.14;   // Phase offset between lines (creates weave)
const VERTICAL_SPREAD = 0.55; // Lines spread across this fraction of height

// Multi-harmonic wave (richer than single sine)
const w1 = Math.sin(nx * Math.PI * WAVE_FREQ + time + linePhase);
const w2 = Math.sin(nx * Math.PI * WAVE_FREQ * 1.5 + time * 0.7 + linePhase * 1.3) * 0.25;
const w3 = Math.sin(nx * Math.PI * WAVE_FREQ * 0.5 + time * 1.3 + linePhase * 0.7) * 0.12;
const wave = w1 + w2 + w3;

// Gaussian envelope — amplitude peaks at center, fades to edges
const nx = (x / width) * 2 - 1; // Normalize x to [-1, 1]
const envelope = Math.exp(-Math.pow(nx * 3, 2));

// Final y position
const y = baseY + wave * amplitude * envelope * breathe;
```

**Two-pass rendering for glow effect:**
```tsx
// Pass 1: Outer glow (wider, dimmer, additive blending)
ctx.globalCompositeOperation = 'lighter';
ctx.lineWidth = 3.5;
ctx.globalAlpha = 0.045;
ctx.strokeStyle = gradient; // horizontal gradient cyan→white→cyan

// Pass 2: Sharp core (thinner, brighter)
ctx.lineWidth = 1.0;
ctx.globalAlpha = 0.09;
```

## Expansion Masking (Radial Reveal)

Make effects expand from a center point:

```tsx
const maxExpansion = Math.sqrt(cx * cx + cy * cy) * 1.2;
const expansionRadius = power * maxExpansion; // power: 0→1

// Per-point mask
const distFromCenter = Math.sqrt(dx * dx + dy * dy);
const edgeSoftness = maxExpansion * 0.15;
const mask = clamp((expansionRadius - distFromCenter) / edgeSoftness, 0, 1);
```

## Particle Text System

### Text-to-Pixel Sampling
```tsx
function buildTextBitmap(lines: string[], width: number, height: number) {
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d')!;

  // Render text
  ctx.font = `700 ${fontSize}px "Space Grotesk", system-ui, sans-serif`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  lines.forEach((line, i) => ctx.fillText(line, width / 2, yOffset + i * lineHeight));

  // Read pixels → bitmap lookup
  const imageData = ctx.getImageData(0, 0, width, height);
  const bitmap = new Uint8Array(width * height);
  for (let i = 0; i < bitmap.length; i++) {
    bitmap[i] = imageData.data[i * 4 + 3] > 128 ? 1 : 0; // Alpha > 128 = filled
  }

  // Sample target positions (every Nth filled pixel)
  const targets: Array<{ x: number; y: number }> = [];
  // ... sample filled pixels

  return { bitmap, targets, width, height };
}
```

### Spring Physics
```tsx
const STIFFNESS = 0.08;
const DAMPING = 0.82;
const MOUSE_RADIUS = 80;
const MOUSE_FORCE = 6;
const RETURN_STIFFNESS = 0.12; // Force to return to letter boundaries

// Per frame, per particle:
p.vx += (p.targetX - p.x) * STIFFNESS;
p.vy += (p.targetY - p.y) * STIFFNESS;

// Mouse repulsion
if (mouse.active) {
  const dx = p.x - mouse.x;
  const dy = p.y - mouse.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d < MOUSE_RADIUS && d > 0) {
    const force = Math.pow(1 - d / MOUSE_RADIUS, 2) * MOUSE_FORCE;
    p.vx += (dx / d) * force;
    p.vy += (dy / d) * force;
  }
}

p.vx *= DAMPING;
p.vy *= DAMPING;
p.x += p.vx;
p.y += p.vy;

// Letter-bound constraint (O(1) per particle via bitmap lookup)
const bx = Math.floor(p.x);
const by = Math.floor(p.y);
if (bx >= 0 && bx < bmpWidth && by >= 0 && by < bmpHeight) {
  if (bitmap[bx + by * bmpWidth] === 0) {
    // Outside letter — apply return force toward target
    p.vx += (p.targetX - p.x) * RETURN_STIFFNESS;
    p.vy += (p.targetY - p.y) * RETURN_STIFFNESS;
  }
}
```

### Particle Rendering (two-layer glow)
```tsx
// Layer 1: Glow
ctx.shadowBlur = 6;
ctx.shadowColor = '#22D3EE';
ctx.fillStyle = '#22D3EE';
particles.forEach(p => {
  ctx.globalAlpha = p.alpha * 0.5;
  ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
});

// Layer 2: Sharp core
ctx.shadowBlur = 0;
ctx.fillStyle = '#7DEEFF';
particles.forEach(p => {
  ctx.globalAlpha = p.alpha;
  ctx.fillRect(p.x - 0.75, p.y - 0.75, 1.5, 1.5);
});
```

## Color Palette (WellFi Cyan EM Energy)

| Use | Color | Alpha Range |
|-----|-------|-------------|
| Core energy (brightest) | `#7DEEFF` | 0.6–1.0 |
| Primary glow | `#22D3EE` | 0.3–0.6 |
| Deep accent | `#06B6D4` | 0.15–0.4 |
| Edge fade | `#082F49` | 0.1–0.2 |
| Background | `#020617` | 1.0 |

## Mouse/Touch Interaction

```tsx
// Track mouse position in CANVAS coordinates (not viewport)
const handleMouseMove = (e: MouseEvent) => {
  const r = canvas.getBoundingClientRect();
  mouseRef.current.x = (e.clientX - r.left) * (canvas.width / r.width);
  mouseRef.current.y = (e.clientY - r.top) * (canvas.height / r.height);
  mouseRef.current.active = true;
};

// Touch support
const handleTouchMove = (e: TouchEvent) => {
  const t = e.touches[0];
  // Same coordinate transform as mouse
};

// Mouse glow at cursor position
if (mouse.active) {
  const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS);
  mg.addColorStop(0, 'rgba(125, 238, 255, 0.25)');
  mg.addColorStop(1, 'rgba(34, 211, 238, 0)');
  ctx.fillStyle = mg;
  ctx.globalAlpha = 0.1;
  ctx.fillRect(0, 0, w, h);
}
```

## Performance Guidelines

- **DPR cap**: Always `Math.min(window.devicePixelRatio, 2)` — 3x retina kills fillrate
- **Mobile particle count**: 1,000 (vs 2,500 desktop)
- **Avoid per-frame allocations**: Pre-allocate arrays, reuse gradient objects
- **ResizeObserver**: Only re-init during settled state, not mid-animation
- **`fillRect` > `arc`**: For small particles, fillRect is faster than arc+fill (no path calculation)
- **Reduced motion**: Check `prefers-reduced-motion: reduce` and return null or static state

## Timing Constants (Proven Feel)

| Constant | Value | Note |
|----------|-------|------|
| Wave speed | 0.012 per frame | Calm, organic |
| Power-up duration | 4.5s | Slow enough to appreciate |
| Wave hold | 3.0s | Let user interact |
| Reveal duration | 2.5s | Smooth handoff |
| Spring stiffness | 0.08 | Snappy but not jarring |
| Spring damping | 0.82 | Settles in ~20 frames |
| Mouse radius | 80px (canvas coords) | Comfortable interaction zone |
| Mouse force | 6 | Visible push, not violent |

## GSAP Integration

```tsx
// Use imperative handle pattern for GSAP → Canvas coordination
export interface CanvasHandle {
  triggerPhase: (phase: string) => void;
  enableInteraction: () => void;
}

// In parent (HeroSection):
const canvasRef = useRef<CanvasHandle>(null);
const tl = gsap.timeline();
tl.call(() => canvasRef.current?.triggerPhase('explode'), [], 2.0);
tl.call(() => canvasRef.current?.enableInteraction(), [], 4.2);
```

## Anti-Patterns (Learned the Hard Way)

1. **Don't build the full sequence before each piece feels right.** Prototype phases independently.
2. **Don't use CSS keyframes for complex animation loops.** GSAP timeline or rAF — never @keyframes for multi-phase sequences.
3. **Don't animate too fast.** If the user says "I can't see what's happening," default to 2x slower.
4. **Don't skip the "causal moment."** Every visual effect needs a clear origin event (pulse from tool, spark from center, etc.)
5. **Don't use `composite: lighter` without alpha control.** Additive blending with high alpha = white blowout.
