'use client';

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SignalWaveHeroHandle {
  /** Start the left-to-right wave reveal */
  startWave: () => void;
  /** Enable mouse/touch interaction */
  enableMouseInteraction: () => void;
}

interface SignalWaveHeroProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants — tuned to match EM Pulse reference image
// ---------------------------------------------------------------------------

const LINES = 50; // number of stacked sine lines
const POINTS_PER_LINE = 300; // resolution per line
const BASE_AMPLITUDE = 0.16; // fraction of canvas height
const WAVE_FREQ = 5; // primary sine frequency
const PHASE_SHIFT = 0.1; // phase offset between adjacent lines
const VERTICAL_SPREAD = 0.35; // fraction of canvas height the lines span
const WAVE_SPEED = 0.012; // time-based animation speed
const REVEAL_SPEED = 5; // px per frame for left-to-right reveal

// Mouse interaction
const MOUSE_RADIUS = 150;
const MOUSE_FORCE = 40;

// Colors
const COLOR_CORE = '#7DEEFF';
const COLOR_GLOW = '#22D3EE';
const COLOR_DEEP = '#06B6D4';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isMobile() {
  return typeof window !== 'undefined' && window.innerWidth < 1024;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SignalWaveHero = forwardRef<SignalWaveHeroHandle, SignalWaveHeroProps>(
  function SignalWaveHero({ className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const mouseRef = useRef({ x: -9999, y: -9999, active: false });
    const timeRef = useRef(0);
    const lastFrameRef = useRef(0);
    const revealXRef = useRef(-1); // -1 = not started, 0+ = revealing
    const phaseRef = useRef<'idle' | 'revealing' | 'settled'>('idle');
    const dimsRef = useRef({ w: 0, h: 0 });
    const mobileRef = useRef(isMobile());
    const [reducedMotion, setReducedMotion] = useState(false);

    // Reduced motion
    useEffect(() => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }, []);

    // Imperative handle for GSAP integration
    useImperativeHandle(ref, () => ({
      startWave() {
        revealXRef.current = 0;
        phaseRef.current = 'revealing';
      },
      enableMouseInteraction() {
        mouseRef.current.active = true;
      },
    }), []);

    // Sizing
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = mobileRef.current ? 1 : Math.min(window.devicePixelRatio, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      dimsRef.current = { w, h };
      mobileRef.current = isMobile();
    };

    // Main animation loop
    useEffect(() => {
      if (reducedMotion) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      resize();
      window.addEventListener('resize', resize);

      lastFrameRef.current = performance.now();

      // Build x-axis gradient (cyan center, fading edges)
      function makeGradient() {
        const w = canvas!.width;
        const g = ctx!.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0.0, 'rgba(6, 182, 212, 0.15)');
        g.addColorStop(0.1, 'rgba(34, 211, 238, 0.3)');
        g.addColorStop(0.3, 'rgba(34, 211, 238, 0.5)');
        g.addColorStop(0.5, 'rgba(125, 238, 255, 0.75)');
        g.addColorStop(0.7, 'rgba(34, 211, 238, 0.5)');
        g.addColorStop(0.9, 'rgba(34, 211, 238, 0.3)');
        g.addColorStop(1.0, 'rgba(6, 182, 212, 0.15)');
        return g;
      }
      let grad = makeGradient();

      const handleResize = () => {
        resize();
        grad = makeGradient();
      };
      window.removeEventListener('resize', resize);
      window.addEventListener('resize', handleResize);

      function animate(now: number) {
        rafRef.current = requestAnimationFrame(animate);

        if (!canvas || !canvas.isConnected || !ctx) return;

        // Delta time
        const dt = Math.min((now - lastFrameRef.current) / 1000, 0.05);
        lastFrameRef.current = now;
        timeRef.current += WAVE_SPEED;

        const { w, h } = dimsRef.current;
        if (w === 0 || h === 0) return;

        const dpr = mobileRef.current ? 1 : Math.min(window.devicePixelRatio, 2);
        const phase = phaseRef.current;
        const mouse = mouseRef.current;
        const tm = timeRef.current;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        // Idle — draw nothing
        if (phase === 'idle') return;

        // Advance reveal cursor
        if (phase === 'revealing') {
          // Speed scales with dt for frame-rate independence
          revealXRef.current += REVEAL_SPEED * (dt / 0.016);
          if (revealXRef.current >= w) {
            revealXRef.current = w;
            phaseRef.current = 'settled';
          }
        }

        const revealX = revealXRef.current;

        // --- WAVE RENDERING ---
        const amplitude = h * BASE_AMPLITUDE;
        const vSpread = h * VERTICAL_SPREAD;
        const cy = h * 0.28; // center the wave in upper area, clear of logo
        const startY = cy - vSpread / 2;
        const lineSpacing = vSpread / LINES;

        // Two rendering passes for glow depth
        const passes = [
          // Pass 1: Wide glow
          { lineWidth: 3.5, alphaScale: 0.06 },
          // Pass 2: Sharp core
          { lineWidth: 1.2, alphaScale: 0.14 },
        ];

        ctx.globalCompositeOperation = 'lighter';

        for (const pass of passes) {
          ctx.strokeStyle = grad;
          ctx.lineWidth = pass.lineWidth;

          for (let i = 0; i < LINES; i++) {
            // Gaussian: center lines are brightest, edges fade
            const lineDist = (i - LINES / 2) / (LINES / 2);
            const gaussianAlpha = Math.exp(-lineDist * lineDist * 3);

            ctx.globalAlpha = pass.alphaScale * gaussianAlpha;
            ctx.beginPath();

            const baseY = startY + i * lineSpacing;
            const linePhase = i * PHASE_SHIFT;
            // Breathing: subtle amplitude modulation over time
            const breathe = Math.sin(tm * 1.5 + i * 0.04) * 0.1 + 0.9;
            // Per-line amplitude scaled by Gaussian (center lines = full amplitude)
            const lineAmp = amplitude * gaussianAlpha;

            for (let j = 0; j <= POINTS_PER_LINE; j++) {
              const x = (j / POINTS_PER_LINE) * w;

              // Don't draw past reveal cursor
              if (x > revealX) break;

              // Normalized x for wave math (-1 to 1)
              const nx = (x / w) * 2 - 1;

              // Near-uniform x-axis envelope — wave spans full width like reference
              const xEnvelope = 0.65 + 0.35 * Math.exp(-nx * nx * 3);

              // Multi-harmonic sine wave
              const w1 = Math.sin(nx * Math.PI * WAVE_FREQ + tm + linePhase);
              const w2 = Math.sin(nx * Math.PI * WAVE_FREQ * 1.5 + tm * 0.7 + linePhase * 1.3) * 0.25;
              const w3 = Math.sin(nx * Math.PI * WAVE_FREQ * 0.5 + tm * 1.3 + linePhase * 0.7) * 0.12;
              const wave = w1 + w2 + w3;

              let fy = baseY + wave * lineAmp * xEnvelope * breathe;

              // Mouse interaction (only when enabled)
              if (mouse.active) {
                const mdx = x - mouse.x;
                const mdy = fy - mouse.y;
                const md = Math.sqrt(mdx * mdx + mdy * mdy);
                if (md < MOUSE_RADIUS && md > 0) {
                  const ratio = 1 - md / MOUSE_RADIUS;
                  const force = ratio * ratio * MOUSE_FORCE;
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
        // Bright radial glow at the horizontal center of the wave
        if (revealX > w * 0.4) {
          const glowIntensity = phase === 'revealing'
            ? clamp((revealX - w * 0.4) / (w * 0.3), 0, 1)
            : 1;
          const glowRadius = Math.min(w * 0.2, 300);
          ctx.globalAlpha = 0.15 * glowIntensity;
          const cg = ctx.createRadialGradient(w / 2, cy, 0, w / 2, cy, glowRadius);
          cg.addColorStop(0, 'rgba(125, 238, 255, 0.5)');
          cg.addColorStop(0.3, 'rgba(34, 211, 238, 0.15)');
          cg.addColorStop(1, 'rgba(34, 211, 238, 0)');
          ctx.fillStyle = cg;
          ctx.fillRect(0, 0, w, h);
        }

        // --- REVEAL EDGE GLOW ---
        // Bright leading edge during reveal
        if (phase === 'revealing' && revealX > 0 && revealX < w) {
          ctx.globalAlpha = 0.2;
          const eg = ctx.createRadialGradient(revealX, cy, 0, revealX, cy, 100);
          eg.addColorStop(0, 'rgba(125, 238, 255, 0.5)');
          eg.addColorStop(0.4, 'rgba(34, 211, 238, 0.15)');
          eg.addColorStop(1, 'rgba(34, 211, 238, 0)');
          ctx.fillStyle = eg;
          ctx.fillRect(0, 0, w, h);
        }

        // Reset
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }

      rafRef.current = requestAnimationFrame(animate);

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(rafRef.current);
      };
    }, [reducedMotion]);

    // Mouse/touch handlers
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const getPos = (clientX: number, clientY: number) => {
        const rect = canvas.getBoundingClientRect();
        return { x: clientX - rect.left, y: clientY - rect.top };
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!mouseRef.current.active) return;
        const pos = getPos(e.clientX, e.clientY);
        mouseRef.current.x = pos.x;
        mouseRef.current.y = pos.y;
      };
      const handleTouchMove = (e: TouchEvent) => {
        if (!mouseRef.current.active) return;
        const t = e.touches[0];
        const pos = getPos(t.clientX, t.clientY);
        mouseRef.current.x = pos.x;
        mouseRef.current.y = pos.y;
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
