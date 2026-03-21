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

    useEffect(() => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }, []);

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

      const bitmapData = buildTextBitmap(lines, w, h, fontFamily, fontWeight);
      bitmapRef.current = bitmapData;

      const count = isMobile() ? Math.min(maxParticles, 1000) : maxParticles;
      const targets = sampleTargets(bitmapData.bitmap, w, h, count);

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
          gatherTime += GATHER_PULSE_SPEED;
          for (const p of particles) {
            p.x = p.homeX + Math.sin(gatherTime + p.homeX * 0.1) * 1.5;
            p.y = p.homeY + Math.cos(gatherTime + p.homeY * 0.1) * 1.5;
          }
        } else if (phase === 'explode' || phase === 'settle') {
          const stiffness = isMobile() ? 0.12 : SPRING_STIFFNESS;

          for (const p of particles) {
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            p.vx += dx * stiffness;
            p.vy += dy * stiffness;

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

            p.vx *= SPRING_DAMPING;
            p.vy *= SPRING_DAMPING;

            p.x += p.vx;
            p.y += p.vy;

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

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ro = new ResizeObserver(() => {
        if (phaseRef.current === 'settle') {
          initParticles();
          phaseRef.current = 'settle';
        }
      });
      ro.observe(canvas.parentElement || canvas);

      return () => ro.disconnect();
    }, [initParticles]);

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

    useImperativeHandle(ref, () => ({
      triggerExplode() {
        phaseRef.current = 'explode';
        setTimeout(() => {
          phaseRef.current = 'settle';
        }, 800);
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

export default ParticleCanvas;
