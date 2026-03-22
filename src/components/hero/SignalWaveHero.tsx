'use client';

import {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useState,
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
  lineIndex: number;
  ampMultiplier: number;
  phaseOffset: number;
  entryDelay: number; // normalized 0-1.5 delay before particle enters
}

export interface SignalWaveHeroHandle {
  startWave: () => void;
  triggerMorph: () => void;
  enableMouseInteraction: () => void;
}

interface SignalWaveHeroProps {
  lines: string[];
  fontFamily?: string;
  fontWeight?: number;
  maxParticles?: number;
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants (tuned values)
// ---------------------------------------------------------------------------

const WAVE_LINES = 30;
const WAVE_SPEED = 4;
const WAVE_FREQUENCY = 0.025;
const BASE_AMPLITUDE = 120;
const SPRING_STIFFNESS = 0.08;
const SPRING_DAMPING = 0.82;
const MOUSE_RADIUS = 80;
const MOUSE_FORCE = 6;
const RETURN_STIFFNESS = 0.12;
const COLOR_CORE = '#7DEEFF';
const COLOR_GLOW = '#22D3EE';

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
  if (lines.length === 0 || width === 0 || height === 0) {
    return { bitmap: new Uint8Array(0), width: 0, height: 0 };
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Calculate font size to fill the canvas width with the longest line
  let fontSize = Math.floor((height / lines.length) * 0.75);
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  // Measure widest line and scale font to fit
  let maxTextWidth = 0;
  for (const line of lines) {
    const m = ctx.measureText(line);
    if (m.width > maxTextWidth) maxTextWidth = m.width;
  }
  if (maxTextWidth > width * 0.92) {
    fontSize = Math.floor((fontSize * (width * 0.92)) / maxTextWidth);
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

  return candidates.slice(0, count).map((c) => ({
    x: c.x + (Math.random() - 0.5) * 2,
    y: c.y + (Math.random() - 0.5) * 2,
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
    const bitmapRef = useRef<{
      bitmap: Uint8Array;
      width: number;
      height: number;
    } | null>(null);
    const rafRef = useRef<number>(0);
    const mouseRef = useRef({ x: -9999, y: -9999, active: false });
    const animPhaseRef = useRef<'idle' | 'wave' | 'morph' | 'settled'>('idle');
    const waveXRef = useRef<number>(-100);
    const timeRef = useRef<number>(0);
    const lastFrameTimeRef = useRef<number>(0);
    const [reducedMotion, setReducedMotion] = useState(false);

    // Cached layout values — updated on init/resize only, NOT per frame
    const canvasDimsRef = useRef({ w: 0, h: 0 });
    const isMobileRef = useRef(isMobile());

    useEffect(() => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }, []);

    const initParticles = useCallback(
      (placeAtTargets = false) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const w = Math.floor(rect.width);
        const h = Math.floor(rect.height);
        if (w === 0 || h === 0) return;

        canvasDimsRef.current = { w, h };
        isMobileRef.current = isMobile();

        const dpr = isMobileRef.current ? 1 : Math.min(window.devicePixelRatio, 2);
        canvas.width = w * dpr;
        canvas.height = h * dpr;

        const bitmapData = buildTextBitmap(lines, w, h, fontFamily, fontWeight);
        bitmapRef.current = bitmapData;

        const count = isMobileRef.current
          ? Math.min(maxParticles, 1000)
          : maxParticles;
        const targets = sampleTargets(
          bitmapData.bitmap,
          w,
          h,
          count,
        );

        const centerY = h / 2;

        const particles: Particle[] = targets.map((t, i) => {
          const lineIndex = i % WAVE_LINES;
          const lineDist = (lineIndex - 15) / 15;
          const ampMultiplier = Math.exp(-lineDist * lineDist * 2);
          const phaseOffset = (lineIndex / WAVE_LINES) * Math.PI * 2;
          const entryDelay = (t.x / w) * 1.5;

          if (placeAtTargets) {
            return {
              x: t.x,
              y: t.y,
              vx: 0,
              vy: 0,
              targetX: t.x,
              targetY: t.y,
              radius: 1.2 + Math.random() * 0.8,
              alpha: 0.6 + Math.random() * 0.4,
              phase: 'settled' as ParticlePhase,
              lineIndex,
              ampMultiplier,
              phaseOffset,
              entryDelay,
            };
          }

          return {
            x: -100 - Math.random() * 200,
            y: centerY,
            vx: 0,
            vy: 0,
            targetX: t.x,
            targetY: t.y,
            radius: 1.2 + Math.random() * 0.8,
            alpha: 0,
            phase: 'offscreen' as ParticlePhase,
            lineIndex,
            ampMultiplier,
            phaseOffset,
            entryDelay,
          };
        });

        particlesRef.current = particles;
      },
      [lines, fontFamily, fontWeight, maxParticles],
    );

    // Main animation loop
    useEffect(() => {
      if (reducedMotion) return;

      initParticles();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      lastFrameTimeRef.current = performance.now();

      function animate(now: number) {
        rafRef.current = requestAnimationFrame(animate);

        if (!canvas || !canvas.isConnected) return;

        // Delta time (capped at 50ms to avoid spiral on tab-return)
        const dt = Math.min((now - lastFrameTimeRef.current) / 1000, 0.05);
        lastFrameTimeRef.current = now;
        timeRef.current += dt;

        const { w, h } = canvasDimsRef.current;
        const dpr = isMobileRef.current ? 1 : Math.min(window.devicePixelRatio, 2);
        const particles = particlesRef.current;
        const bitmap = bitmapRef.current;
        const animPhase = animPhaseRef.current;
        const mouse = mouseRef.current;
        const mobile = isMobileRef.current;

        if (!ctx || particles.length === 0 || w === 0) return;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const time = timeRef.current;
        const centerY = h / 2;

        // ----- IDLE: nothing to render, waiting for startWave -----
        if (animPhase === 'idle') {
          // Draw nothing — particles are offscreen
          return;
        }

        // ----- WAVE PHASE -----
        if (animPhase === 'wave') {
          waveXRef.current += WAVE_SPEED;
          const waveFront = waveXRef.current;

          for (const p of particles) {
            if (p.phase === 'offscreen') {
              // Activate when wave front passes the particle's entry point
              // Entry point = proportional to targetX across canvas width
              const entryX = p.entryDelay * (w / 1.5); // scale entryDelay back to px
              if (waveFront >= entryX) {
                p.phase = 'sine_travel';
                p.x = -50;
                p.alpha = 0.5 + Math.random() * 0.3;
              }
            }

            if (p.phase === 'sine_travel') {
              p.x += WAVE_SPEED;
              p.y =
                centerY +
                Math.sin(
                  p.x * WAVE_FREQUENCY + p.phaseOffset + time * 2,
                ) *
                  BASE_AMPLITUDE *
                  p.ampMultiplier;

              // When particle reaches its target X, begin morphing
              if (p.x >= p.targetX) {
                p.phase = 'morphing';
                p.vx = WAVE_SPEED * 0.3; // carry some momentum
                p.vy = (p.targetY - p.y) * 0.05;
              }
            }

            if (p.phase === 'morphing') {
              p.vx += (p.targetX - p.x) * SPRING_STIFFNESS;
              p.vy += (p.targetY - p.y) * SPRING_STIFFNESS;
              p.vx *= SPRING_DAMPING;
              p.vy *= SPRING_DAMPING;
              p.x += p.vx;
              p.y += p.vy;

              const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
              if (speed < 0.1) {
                p.phase = 'settled';
                p.alpha = 0.6 + Math.random() * 0.4;
              }
            }

            if (p.phase === 'settled') {
              // Spring to target (gentle settle)
              p.vx += (p.targetX - p.x) * SPRING_STIFFNESS;
              p.vy += (p.targetY - p.y) * SPRING_STIFFNESS;
              p.vx *= SPRING_DAMPING;
              p.vy *= SPRING_DAMPING;
              p.x += p.vx;
              p.y += p.vy;
            }
          }

          // Wave front glow effect
          if (waveFront > 0 && waveFront < w + 200) {
            const grad = ctx.createRadialGradient(
              waveFront,
              centerY,
              0,
              waveFront,
              centerY,
              150,
            );
            grad.addColorStop(0, 'rgba(125, 238, 255, 0.12)');
            grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.04)');
            grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
          }

          // Transition: when wave front passes right edge + buffer
          if (waveFront > w + 200) {
            animPhaseRef.current = 'morph';
          }
        }

        // ----- MORPH PHASE -----
        if (animPhase === 'morph') {
          let settledCount = 0;

          for (const p of particles) {
            // Force any remaining offscreen/traveling particles into morphing
            if (p.phase === 'offscreen' || p.phase === 'sine_travel') {
              p.phase = 'morphing';
              p.alpha = 0.5 + Math.random() * 0.3;
            }

            if (p.phase === 'morphing') {
              p.vx += (p.targetX - p.x) * SPRING_STIFFNESS;
              p.vy += (p.targetY - p.y) * SPRING_STIFFNESS;
              p.vx *= SPRING_DAMPING;
              p.vy *= SPRING_DAMPING;
              p.x += p.vx;
              p.y += p.vy;

              const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
              if (speed < 0.1) {
                p.phase = 'settled';
                p.alpha = 0.6 + Math.random() * 0.4;
              }
            }

            if (p.phase === 'settled') {
              settledCount++;
              // Gentle spring
              p.vx += (p.targetX - p.x) * SPRING_STIFFNESS;
              p.vy += (p.targetY - p.y) * SPRING_STIFFNESS;
              p.vx *= SPRING_DAMPING;
              p.vy *= SPRING_DAMPING;
              p.x += p.vx;
              p.y += p.vy;
            }
          }

          // Transition when 90% are settled
          if (settledCount >= particles.length * 0.9) {
            animPhaseRef.current = 'settled';
          }
        }

        // ----- SETTLED PHASE -----
        if (animPhase === 'settled') {
          for (const p of particles) {
            // Ensure all particles are in settled state
            if (p.phase !== 'settled') {
              p.phase = 'settled';
              p.alpha = 0.6 + Math.random() * 0.4;
            }

            p.vx += (p.targetX - p.x) * SPRING_STIFFNESS;
            p.vy += (p.targetY - p.y) * SPRING_STIFFNESS;

            // Mouse repulsion when enabled
            if (mouse.active && !mobile) {
              const mx = p.x - mouse.x;
              const my = p.y - mouse.y;
              const dist = Math.sqrt(mx * mx + my * my);
              if (dist < MOUSE_RADIUS && dist > 0) {
                const ratio = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                const force = ratio * ratio * MOUSE_FORCE;
                p.vx += (mx / dist) * force;
                p.vy += (my / dist) * force;
              }
            }

            p.vx *= SPRING_DAMPING;
            p.vy *= SPRING_DAMPING;
            p.x += p.vx;
            p.y += p.vy;

            // Letter boundary constraint
            if (mouse.active && bitmap) {
              const bx = Math.floor(p.x);
              const by = Math.floor(p.y);
              if (
                bx >= 0 &&
                bx < bitmap.width &&
                by >= 0 &&
                by < bitmap.height
              ) {
                if (bitmap.bitmap[bx + by * bitmap.width] === 0) {
                  p.vx += (p.targetX - p.x) * RETURN_STIFFNESS;
                  p.vy += (p.targetY - p.y) * RETURN_STIFFNESS;
                }
              }
            }
          }
        }

        // ----- RENDERING (two-pass) -----
        // Pass 1: Glow
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 6;
        ctx.shadowColor = COLOR_GLOW;
        ctx.fillStyle = COLOR_GLOW;
        for (const p of particles) {
          if (p.phase === 'offscreen') continue;
          ctx.globalAlpha = p.alpha * 0.4;
          ctx.fillRect(
            p.x - p.radius,
            p.y - p.radius,
            p.radius * 2,
            p.radius * 2,
          );
        }

        // Pass 2: Core
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 0;
        ctx.fillStyle = COLOR_CORE;
        for (const p of particles) {
          if (p.phase === 'offscreen') continue;
          ctx.globalAlpha = p.alpha;
          const r = p.radius * 0.6;
          ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }

      rafRef.current = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(rafRef.current);
      };
    }, [reducedMotion, initParticles]);

    // ResizeObserver
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ro = new ResizeObserver(() => {
        if (animPhaseRef.current === 'settled') {
          initParticles(true); // place at targets instantly on resize
          animPhaseRef.current = 'settled';
        }
      });
      ro.observe(canvas.parentElement || canvas);

      return () => ro.disconnect();
    }, [initParticles]);

    // Mouse/touch events
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
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        if (touch) {
          mouseRef.current.x = touch.clientX - rect.left;
          mouseRef.current.y = touch.clientY - rect.top;
        }
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

    // Imperative handle for GSAP integration
    useImperativeHandle(
      ref,
      () => ({
        startWave() {
          waveXRef.current = -100;
          timeRef.current = 0;
          animPhaseRef.current = 'wave';
        },
        triggerMorph() {
          animPhaseRef.current = 'morph';
        },
        enableMouseInteraction() {
          mouseRef.current.active = true;
        },
      }),
      [],
    );

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
