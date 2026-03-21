'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const LINES = 90;
const POINTS_PER_LINE = 280;
const BASE_AMPLITUDE = 0.16; // fraction of canvas height
const WAVE_FREQ = 7;
const PHASE_SHIFT = 0.14;
const VERTICAL_SPREAD = 0.55; // fraction of canvas height
const WAVE_SPEED = 0.012;

// Timing (seconds)
const T_DARK = 0.5;          // pure black before anything
const T_POWER_UP = 4.5;      // energy builds from center point
const T_WAVE_HOLD = 3.0;     // wave breathes at full power
const T_REVEAL = 2.5;        // wave fades to reveal page beneath
// Total: ~10.5s from load to fully revealed page

// Interaction
const MOUSE_RADIUS = 120;
const MOUSE_FORCE = 30;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GenesisOverlayProps {
  /** Called when the wave begins revealing the page content */
  onRevealStart?: () => void;
  /** Called when the overlay is fully transparent and can be removed */
  onComplete?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GenesisOverlay({ onRevealStart, onComplete }: GenesisOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const startTimeRef = useRef<number>(0);
  const timeRef = useRef(0);
  const revealFiredRef = useRef(false);
  const completeFiredRef = useRef(false);
  const [done, setDone] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Reduced motion check
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    if (mq.matches) {
      onRevealStart?.();
      onComplete?.();
      setDone(true);
    }
  }, [onRevealStart, onComplete]);

  // Mouse/touch tracking
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - r.left) * (canvas.width / r.width);
      mouseRef.current.y = (e.clientY - r.top) * (canvas.height / r.height);
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const r = canvas.getBoundingClientRect();
      mouseRef.current.x = (t.clientX - r.left) * (canvas.width / r.width);
      mouseRef.current.y = (t.clientY - r.top) * (canvas.height / r.height);
      mouseRef.current.active = true;
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Main animation
  const startAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Size canvas to viewport
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    startTimeRef.current = performance.now() / 1000;

    // Build gradient (rebuild on resize)
    function makeGradient() {
      const w = canvas!.width;
      const g = ctx!.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0.0, 'rgba(2, 6, 23, 0)');
      g.addColorStop(0.1, 'rgba(8, 47, 73, 0.2)');
      g.addColorStop(0.3, 'rgba(34, 211, 238, 0.4)');
      g.addColorStop(0.5, 'rgba(125, 238, 255, 0.75)');
      g.addColorStop(0.7, 'rgba(34, 211, 238, 0.4)');
      g.addColorStop(0.9, 'rgba(8, 47, 73, 0.2)');
      g.addColorStop(1.0, 'rgba(2, 6, 23, 0)');
      return g;
    }

    let grad = makeGradient();
    const resizeHandler = () => {
      resize();
      grad = makeGradient();
    };
    window.addEventListener('resize', resizeHandler);

    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      if (!canvas || !ctx) return;

      const now = performance.now() / 1000;
      const elapsed = now - startTimeRef.current;
      timeRef.current += WAVE_SPEED;
      const tm = timeRef.current;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const mouse = mouseRef.current;

      // --- PHASE CALCULATION ---
      let power = 0;        // 0 = dark, 1 = full wave
      let overlayAlpha = 1; // 1 = fully covering page, 0 = fully transparent
      let revealProgress = 0;

      if (elapsed < T_DARK) {
        // Pure black
        power = 0;
      } else if (elapsed < T_DARK + T_POWER_UP) {
        // Powering up
        power = easeOutCubic((elapsed - T_DARK) / T_POWER_UP);
      } else if (elapsed < T_DARK + T_POWER_UP + T_WAVE_HOLD) {
        // Full wave, breathing
        power = 1;
      } else if (elapsed < T_DARK + T_POWER_UP + T_WAVE_HOLD + T_REVEAL) {
        // Revealing page
        power = 1;
        revealProgress = easeInOutCubic(
          (elapsed - T_DARK - T_POWER_UP - T_WAVE_HOLD) / T_REVEAL,
        );
        overlayAlpha = 1 - revealProgress * 0.85; // fade to 0.15, not fully gone

        if (!revealFiredRef.current) {
          revealFiredRef.current = true;
          onRevealStart?.();
        }
      } else {
        // Settled — wave stays as subtle background
        power = 1;
        overlayAlpha = 0.15;
        revealProgress = 1;

        if (!revealFiredRef.current) {
          revealFiredRef.current = true;
          onRevealStart?.();
        }
        if (!completeFiredRef.current) {
          completeFiredRef.current = true;
          onComplete?.();
        }
      }

      // --- CLEAR ---
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      if (power < 0.003) {
        return; // still dark
      }

      // --- EXPANSION: wave radiates from center point ---
      // During power-up, the wave's visible radius expands from 0 to full screen
      const maxExpansion = Math.sqrt(cx * cx + cy * cy) * 1.2;
      const expansionRadius = power < 1
        ? power * maxExpansion
        : maxExpansion;

      // --- DRAW WAVE ---
      ctx.globalCompositeOperation = 'lighter';

      const amplitude = h * BASE_AMPLITUDE;
      const vSpread = h * VERTICAL_SPREAD;
      const startY = cy - vSpread / 2;
      const lineSpacing = vSpread / LINES;

      const passes = [
        { lineWidth: 3.5, alpha: 0.045 * overlayAlpha },
        { lineWidth: 1.0, alpha: 0.09 * overlayAlpha },
      ];

      for (const pass of passes) {
        ctx.strokeStyle = grad;
        ctx.lineWidth = pass.lineWidth;
        ctx.globalAlpha = pass.alpha * power;

        for (let i = 0; i < LINES; i++) {
          ctx.beginPath();
          const baseY = startY + i * lineSpacing;
          const linePhase = i * PHASE_SHIFT;
          const breathe = Math.sin(tm * 1.5 + i * 0.04) * 0.12 + 0.88;

          for (let j = 0; j <= POINTS_PER_LINE; j++) {
            const x = (j / POINTS_PER_LINE) * w;
            const nx = (x / w) * 2 - 1;

            // Distance from center for expansion masking
            const dx = x - cx;
            const dy = baseY - cy;
            const distFromCenter = Math.sqrt(dx * dx + dy * dy);

            // Expansion mask: only show wave within expansion radius
            let expansionMask = 1;
            if (power < 1) {
              const edgeSoftness = maxExpansion * 0.15;
              expansionMask = clamp(
                (expansionRadius - distFromCenter) / edgeSoftness,
                0, 1,
              );
            }

            if (expansionMask < 0.01) {
              // Outside expansion — draw flat line at baseY
              if (j === 0) ctx.moveTo(x, baseY);
              else ctx.lineTo(x, baseY);
              continue;
            }

            // Gaussian envelope on x-axis
            const envelope = Math.exp(-Math.pow(nx * 3, 2));

            // Multi-harmonic wave
            const w1 = Math.sin(nx * Math.PI * WAVE_FREQ + tm + linePhase);
            const w2 = Math.sin(nx * Math.PI * WAVE_FREQ * 1.5 + tm * 0.7 + linePhase * 1.3) * 0.25;
            const w3 = Math.sin(nx * Math.PI * WAVE_FREQ * 0.5 + tm * 1.3 + linePhase * 0.7) * 0.12;
            const wave = w1 + w2 + w3;

            let fy = baseY + wave * amplitude * envelope * breathe * expansionMask;

            // Mouse interaction
            if (mouse.active) {
              const mdx = x - mouse.x;
              const mdy = fy - mouse.y;
              const md = Math.sqrt(mdx * mdx + mdy * mdy);
              if (md < MOUSE_RADIUS && md > 0) {
                const force = Math.pow(1 - md / MOUSE_RADIUS, 2) * MOUSE_FORCE;
                fy += (mdy / md) * force;
              }
            }

            if (j === 0) ctx.moveTo(x, fy);
            else ctx.lineTo(x, fy);
          }
          ctx.stroke();
        }
      }

      // --- CENTER ENERGY GLOW ---
      const glowRadius = Math.min(expansionRadius * 0.3, w * 0.15);
      if (glowRadius > 5) {
        ctx.globalAlpha = 0.25 * power * overlayAlpha;
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
        cg.addColorStop(0, 'rgba(125, 238, 255, 0.5)');
        cg.addColorStop(0.3, 'rgba(34, 211, 238, 0.15)');
        cg.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = cg;
        ctx.fillRect(0, 0, w, h);
      }

      // --- INITIAL SPARK (first 0.5s of power-up) ---
      if (power > 0 && power < 0.15) {
        const sparkIntensity = power / 0.15;
        ctx.globalAlpha = sparkIntensity * 0.8;
        const sparkRadius = 5 + sparkIntensity * 30;
        const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sparkRadius);
        sg.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        sg.addColorStop(0.2, 'rgba(125, 238, 255, 0.6)');
        sg.addColorStop(0.6, 'rgba(34, 211, 238, 0.2)');
        sg.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, w, h);
      }

      // --- MOUSE GLOW ---
      if (mouse.active && power > 0.3) {
        ctx.globalAlpha = 0.1 * overlayAlpha;
        const mg = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, MOUSE_RADIUS,
        );
        mg.addColorStop(0, 'rgba(125, 238, 255, 0.25)');
        mg.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = mg;
        ctx.fillRect(0, 0, w, h);
      }

      // Reset compositing
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeHandler);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onRevealStart, onComplete]);

  // Start animation on mount
  useEffect(() => {
    if (reducedMotion) return;
    const cleanup = startAnimation();
    return cleanup;
  }, [reducedMotion, startAnimation]);

  // Don't render anything if reduced motion
  if (done) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-auto fixed inset-0 z-50"
      style={{
        touchAction: 'none',
      }}
    />
  );
}
