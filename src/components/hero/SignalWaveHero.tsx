'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface SignalWaveHeroHandle {
  startWave: () => void;
  enableMouseInteraction: () => void;
}

interface SignalWaveHeroProps {
  className?: string;
}

type WavePhase = 'idle' | 'intro' | 'settled';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface PointerState {
  x: number;
  y: number;
  active: boolean;
  engaged: boolean;
  pointerType: 'mouse' | 'pen' | 'touch' | '';
}

const TAU = Math.PI * 2;

export const SIGNAL_WAVE_INTRO_DURATION = 4.2;
const SETTLE_DURATION = 1.2;

const BAND_Y_INTRO = 0.26;
const BAND_Y_SETTLED = 0.26;
const SPREAD_INTRO = 0.18;
const SPREAD_SETTLED = 0.18;
const AMPLITUDE_INTRO = 0.13;
const AMPLITUDE_SETTLED = 0.13;

const BASE_CYCLES = 3.15;
const HARMONIC_CYCLES = 5.85;
const NEEDLE_CYCLES = 11;

const HARMONIC_LINES_DESKTOP = 18;
const HARMONIC_LINES_MOBILE = 14;
const POINTS_DESKTOP = 220;
const POINTS_MOBILE = 150;

const REVEAL_SOFTNESS = 0.12;
const PULSE_WIDTH = 0.09;
const MAX_SPARKS = 36;
const SPARK_DRAG = 0.92;
const SPARK_GRAVITY = 18;

const POINTER_RADIUS_FINE = 240;
const POINTER_RADIUS_PEN = 210;
const POINTER_RADIUS_COARSE = 160;
const POINTER_FORCE_FINE = 54;
const POINTER_FORCE_PEN = 42;
const POINTER_FORCE_COARSE = 24;

const COLOR_CORE = '#FFECEC';
const COLOR_GLOW = '#EF4444';

function isMobile() {
  return typeof window !== 'undefined' && window.innerWidth < 1024;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function easeInOutSine(value: number) {
  return -(Math.cos(Math.PI * value) - 1) / 2;
}

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3;
}

function gaussian(value: number) {
  return Math.exp(-(value * value));
}

const SignalWaveHero = forwardRef<SignalWaveHeroHandle, SignalWaveHeroProps>(
  function SignalWaveHero({ className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const pointerRef = useRef<PointerState>({
      x: -9999,
      y: -9999,
      active: false,
      engaged: false,
      pointerType: '',
    });
    const pointerDownRef = useRef(false);
    const timeRef = useRef(0);
    const lastFrameRef = useRef(0);
    const dimsRef = useRef({
      w: 0,
      h: 0,
      dpr: 1,
      xs: [] as number[],
      nxs: [] as number[],
    });
    const mobileRef = useRef(isMobile());
    const phaseRef = useRef<WavePhase>('idle');
    const introStartRef = useRef(0);
    const settledStartRef = useRef(0);
    const sparksRef = useRef<Spark[]>([]);
    const [reducedMotion, setReducedMotion] = useState(() =>
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false,
    );

    useEffect(() => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
      mq.addEventListener('change', handleChange);
      return () => mq.removeEventListener('change', handleChange);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        startWave() {
          const now = performance.now();
          phaseRef.current = 'intro';
          introStartRef.current = now;
          settledStartRef.current = now;
          timeRef.current = 0;
          lastFrameRef.current = now;
          sparksRef.current = [];
          pointerRef.current.active = false;
          pointerRef.current.engaged = false;
          pointerRef.current.pointerType = '';
          pointerRef.current.x = -9999;
          pointerRef.current.y = -9999;
          pointerDownRef.current = false;
        },
        enableMouseInteraction() {
          pointerRef.current.active = true;
        },
      }),
      [],
    );

    useEffect(() => {
      if (reducedMotion) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let gradients:
        | {
            harmonic: CanvasGradient;
            core: CanvasGradient;
            carrier: CanvasGradient;
          }
        | null = null;

      const resize = () => {
        mobileRef.current = isMobile();

        const rect = canvas.getBoundingClientRect();
        const dpr = mobileRef.current ? 1 : Math.min(window.devicePixelRatio, 2);
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);
        const pointCount = mobileRef.current ? POINTS_MOBILE : POINTS_DESKTOP;
        const xs = Array.from({ length: pointCount + 1 }, (_, index) => (index / pointCount) * width);
        const nxs = xs.map((x) => x / width);

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        dimsRef.current = { w: width, h: height, dpr, xs, nxs };

        const harmonic = ctx.createLinearGradient(0, 0, width, 0);
        harmonic.addColorStop(0, 'rgba(127, 29, 29, 0.12)');
        harmonic.addColorStop(0.14, 'rgba(239, 68, 68, 0.34)');
        harmonic.addColorStop(0.5, 'rgba(254, 202, 202, 0.74)');
        harmonic.addColorStop(0.86, 'rgba(239, 68, 68, 0.34)');
        harmonic.addColorStop(1, 'rgba(127, 29, 29, 0.12)');

        const core = ctx.createLinearGradient(0, 0, width, 0);
        core.addColorStop(0, 'rgba(239, 68, 68, 0.06)');
        core.addColorStop(0.2, 'rgba(239, 68, 68, 0.18)');
        core.addColorStop(0.5, 'rgba(254, 202, 202, 0.28)');
        core.addColorStop(0.8, 'rgba(239, 68, 68, 0.18)');
        core.addColorStop(1, 'rgba(239, 68, 68, 0.06)');

        const carrier = ctx.createLinearGradient(0, 0, width, 0);
        carrier.addColorStop(0, 'rgba(239, 68, 68, 0)');
        carrier.addColorStop(0.2, 'rgba(239, 68, 68, 0.36)');
        carrier.addColorStop(0.5, 'rgba(254, 226, 226, 0.95)');
        carrier.addColorStop(0.8, 'rgba(239, 68, 68, 0.36)');
        carrier.addColorStop(1, 'rgba(239, 68, 68, 0)');

        gradients = { harmonic, core, carrier };
      };

      resize();
      window.addEventListener('resize', resize);
      lastFrameRef.current = performance.now();

      const animate = (now: number) => {
        rafRef.current = requestAnimationFrame(animate);

        const { w, h, dpr, xs, nxs } = dimsRef.current;
        if (!gradients || w === 0 || h === 0 || xs.length === 0) return;
        const activeGradients = gradients;

        const dt = Math.min((now - lastFrameRef.current) / 1000, 0.05);
        lastFrameRef.current = now;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const phase = phaseRef.current;
        if (phase === 'idle') return;

        timeRef.current += dt * (phase === 'intro' ? 1.22 : 0.58);

        let introProgress = 1;
          if (phase === 'intro') {
          introProgress = clamp(
            (now - introStartRef.current) / (SIGNAL_WAVE_INTRO_DURATION * 1000),
            0,
            1,
          );
          if (introProgress >= 1) {
            phaseRef.current = 'settled';
            settledStartRef.current = now;
          }
        }

        const activePhase = phaseRef.current;
        const settleProgress =
          activePhase === 'intro'
            ? easeInOutSine(clamp((introProgress - 0.68) / 0.32, 0, 1))
            : easeOutCubic(
                clamp((now - settledStartRef.current) / (SETTLE_DURATION * 1000), 0, 1),
              );
        const pointer = pointerRef.current;
        const pointerInteractive = pointer.active && pointer.engaged && activePhase === 'settled';
        const pointerRadius =
          pointer.pointerType === 'touch'
            ? POINTER_RADIUS_COARSE
            : pointer.pointerType === 'pen'
              ? POINTER_RADIUS_PEN
              : POINTER_RADIUS_FINE;
        const pointerForce =
          pointer.pointerType === 'touch'
            ? POINTER_FORCE_COARSE
            : pointer.pointerType === 'pen'
              ? POINTER_FORCE_PEN
              : POINTER_FORCE_FINE;
        const pointerFieldX = w * (pointer.pointerType === 'touch' ? 0.11 : 0.14);
        const pointerFieldY = h * (pointer.pointerType === 'touch' ? 0.16 : 0.18);

        const cy = h * lerp(BAND_Y_INTRO, BAND_Y_SETTLED, settleProgress);
        const verticalSpread = h * lerp(SPREAD_INTRO, SPREAD_SETTLED, settleProgress);
        const baseAmplitude = h * lerp(AMPLITUDE_INTRO, AMPLITUDE_SETTLED, settleProgress);
        const baseLineCount = mobileRef.current ? HARMONIC_LINES_MOBILE : HARMONIC_LINES_DESKTOP;
        const lineCount = baseLineCount;
        const pointStep = mobileRef.current ? 2 : 1;
        const lineSpacing = verticalSpread / Math.max(lineCount - 1, 1);

        const pulseProgress =
          activePhase === 'intro'
            ? introProgress
            : 1;
        const pulseX = lerp(0, w, pulseProgress);
        const revealSoftness = w * REVEAL_SOFTNESS;
        const pulseWidth = w * PULSE_WIDTH;
        const introAgeMs = activePhase === 'intro' ? now - introStartRef.current : 0;
        const ghostMix = activePhase === 'intro' ? 1 - smoothstep(60, 180, introAgeMs) : 0;
        const revealHeadX =
          activePhase === 'intro'
            ? clamp(pulseX, 0, w)
            : w;
        const drawLimit =
          activePhase === 'intro'
            ? clamp(revealHeadX + revealSoftness * 0.45, 0, w)
            : w;

        const burstMix = 0;
        const lensMix = 0;
        const lensCenterX = lerp(pulseX, w * 0.52, lensMix * 0.85);
        const lensRadiusX = lerp(w * 0.05, w * 0.18, lensMix);
        const lensRadiusY = lerp(h * 0.03, h * 0.12, lensMix);

        const sparks = sparksRef.current;
        if (activePhase === 'intro' && burstMix > 0.45 && pulseX > -w * 0.08 && pulseX < w * 1.05) {
          const spawnCount = mobileRef.current ? 1 : 2;
          for (let i = 0; i < spawnCount && sparks.length < MAX_SPARKS; i += 1) {
            const lifetime = 0.3 + Math.random() * 0.35;
            const angle = (Math.random() - 0.5) * Math.PI * 0.8;
            const direction = Math.random() < 0.6 ? 1 : -1;
            const speed = 45 + Math.random() * 90 + burstMix * 70;

            sparks.push({
              x: pulseX + (Math.random() - 0.5) * 20,
              y: cy + (Math.random() - 0.5) * h * 0.05,
              vx: Math.cos(angle) * speed * direction + 24,
              vy: Math.sin(angle) * speed,
              life: lifetime,
              maxLife: lifetime,
              size: 1 + Math.random() * 1.8,
            });
          }
        }

        for (let index = sparks.length - 1; index >= 0; index -= 1) {
          const spark = sparks[index];
          spark.vx *= SPARK_DRAG;
          spark.vy = spark.vy * SPARK_DRAG + SPARK_GRAVITY * dt;
          spark.x += spark.vx * dt;
          spark.y += spark.vy * dt;
          spark.life -= dt;
          if (spark.life <= 0) sparks.splice(index, 1);
        }

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = activeGradients.carrier;
        ctx.lineWidth = mobileRef.current ? 1 : 1.2;
        if (ghostMix > 0) {
          ctx.globalAlpha = 0.075 * ghostMix;
          ctx.lineWidth = mobileRef.current ? 1.1 : 1.35;
          ctx.beginPath();
          ctx.moveTo(0, cy);
          ctx.lineTo(w, cy);
          ctx.stroke();
          ctx.lineWidth = mobileRef.current ? 1 : 1.2;
        }
        ctx.globalAlpha = activePhase === 'intro' ? 0.12 + introProgress * 0.08 : 0.18;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(revealHeadX, cy);
        ctx.stroke();

        if (activePhase === 'intro') {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = 0.15 + burstMix * 0.18;
          const pulseGlow = ctx.createRadialGradient(
            pulseX,
            cy,
            0,
            pulseX,
            cy,
            mobileRef.current ? 110 : 170,
          );
          pulseGlow.addColorStop(0, 'rgba(254, 202, 202, 0.55)');
          pulseGlow.addColorStop(0.35, 'rgba(239, 68, 68, 0.18)');
          pulseGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = pulseGlow;
          ctx.fillRect(0, 0, w, h);

          if (lensMix > 0.05) {
            ctx.globalAlpha = 0.1 + lensMix * 0.08;
            const lensGlow = ctx.createRadialGradient(lensCenterX, cy, 0, lensCenterX, cy, lensRadiusX);
            lensGlow.addColorStop(0, 'rgba(254, 202, 202, 0.16)');
            lensGlow.addColorStop(0.45, 'rgba(239, 68, 68, 0.07)');
            lensGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.fillStyle = lensGlow;
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = activeGradients.carrier;
            ctx.lineWidth = mobileRef.current ? 1 : 1.3;
            ctx.globalAlpha = 0.06 + lensMix * 0.06;
            ctx.beginPath();
            ctx.ellipse(lensCenterX, cy, lensRadiusX, lensRadiusY, 0, 0, TAU);
            ctx.stroke();
          }
        }

        const harmonicPasses = [
          { lineWidth: mobileRef.current ? 2.7 : 3.4, alphaScale: 0.095 },
          { lineWidth: mobileRef.current ? 1.25 : 1.65, alphaScale: 0.24 },
        ];

        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = activeGradients.harmonic;

        for (const pass of harmonicPasses) {
          ctx.lineWidth = pass.lineWidth;

          for (let lineIndex = 0; lineIndex < lineCount; lineIndex += 1) {
            const dist = (lineIndex - (lineCount - 1) / 2) / Math.max((lineCount - 1) / 2, 1);
            const density = gaussian(dist * 1.55);
            if (density < 0.03) continue;

            const linePhase = lineIndex * 0.24;
            const lineBaseY = cy + (lineIndex - (lineCount - 1) / 2) * lineSpacing;
            const breathe = 0.92 + Math.sin(timeRef.current * 0.9 + lineIndex * 0.25) * 0.06;
            const baseAlpha =
              pass.alphaScale *
              density *
              (activePhase === 'intro' ? 0.78 + burstMix * 0.12 : 1);

            ctx.globalAlpha = baseAlpha;
            ctx.beginPath();

            let started = false;

            for (let pointIndex = 0; pointIndex < xs.length; pointIndex += pointStep) {
              const x = xs[pointIndex];
              if (x > drawLimit) break;
              const nx = nxs[pointIndex];

              const trailReveal =
                activePhase === 'intro'
                  ? smoothstep(-revealSoftness * 0.55, revealSoftness, pulseX - x)
                  : 1;
              const waveMix = activePhase === 'intro' ? trailReveal : 1;
              const frontGlow =
                activePhase === 'intro' ? gaussian((x - pulseX) / pulseWidth) : 0;
              const centerBias = gaussian((x - w * 0.5) / (w * 0.18));
              const lensField =
                lensMix *
                gaussian((x - lensCenterX) / lensRadiusX) *
                gaussian((lineBaseY - cy) / (verticalSpread * 0.38));
              const cursorField =
                pointerInteractive
                  ? gaussian((x - pointer.x) / pointerFieldX) *
                    gaussian((lineBaseY - pointer.y) / pointerFieldY)
                  : 0;

              const primary = Math.sin(nx * TAU * BASE_CYCLES + timeRef.current * 1.15 + linePhase);
              const secondary =
                Math.sin(nx * TAU * HARMONIC_CYCLES - timeRef.current * 0.82 + linePhase * 1.35) *
                0.14;
              const slowDrift =
                Math.sin(nx * TAU * 0.7 + timeRef.current * 0.33 + linePhase * 0.28) * 0.08;
              const spike =
                Math.sin(((x - pulseX) / w) * TAU * NEEDLE_CYCLES - timeRef.current * 13.5 + linePhase * 1.65) *
                frontGlow *
                burstMix *
                centerBias *
                baseAmplitude *
                density *
                0.68;

              let y =
                lineBaseY +
                ((primary + secondary + slowDrift) * baseAmplitude * density * breathe + spike) *
                  waveMix +
                Math.sign(lineBaseY - cy || 1) * lensField * baseAmplitude * 0.72;

              if (pointerInteractive) {
                const dx = x - pointer.x;
                const dy = y - pointer.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0 && distance < pointerRadius) {
                  const influence = (1 - distance / pointerRadius) ** 2 * pointerForce;
                  y += (dy / distance) * influence;
                }
                y += Math.sign(lineBaseY - pointer.y || 1) * cursorField * baseAmplitude * 0.3;
              }

              if (!started) {
                ctx.moveTo(x, y);
                started = true;
              } else {
                ctx.lineTo(x, y);
              }
            }

            if (started) ctx.stroke();
          }
        }

        const drawCoreWave = (lineWidth: number, alphaScale: number, shadowBlur: number) => {
          ctx.strokeStyle = activeGradients.core;
          ctx.lineWidth = lineWidth;
          ctx.shadowColor = COLOR_GLOW;
          ctx.shadowBlur = shadowBlur;
          ctx.globalAlpha = alphaScale * (activePhase === 'intro' ? 0.9 : 1);
          ctx.beginPath();

          let started = false;

          for (let pointIndex = 0; pointIndex < xs.length; pointIndex += pointStep) {
            const x = xs[pointIndex];
            if (x > drawLimit) break;
            const nx = nxs[pointIndex];

            const trailReveal =
              activePhase === 'intro'
                ? smoothstep(-revealSoftness * 0.45, revealSoftness * 0.82, pulseX - x)
                : 1;
            const waveMix = activePhase === 'intro' ? trailReveal : 1;
            const frontGlow = activePhase === 'intro' ? gaussian((x - pulseX) / pulseWidth) : 0;
            const centerBias = gaussian((x - w * 0.5) / (w * 0.17));
            const lensField = lensMix * gaussian((x - lensCenterX) / lensRadiusX);
            const cursorField =
              pointerInteractive
                ? gaussian((x - pointer.x) / pointerFieldX) *
                  gaussian((cy - pointer.y) / pointerFieldY)
                : 0;

            const wave =
              Math.sin(nx * TAU * BASE_CYCLES + timeRef.current * 1.18) +
              Math.sin(nx * TAU * (HARMONIC_CYCLES * 0.92) - timeRef.current * 0.66) * 0.1 +
              Math.sin(nx * TAU * 0.7 + timeRef.current * 0.28) * 0.05;
            const needle =
              Math.sin(((x - pulseX) / w) * TAU * (NEEDLE_CYCLES + 2) - timeRef.current * 16) *
              frontGlow *
              burstMix *
              centerBias *
              baseAmplitude *
              1.25;

            let y =
              cy +
              (wave * baseAmplitude + needle) * waveMix +
              Math.sin(((x - lensCenterX) / w) * TAU * 2.4) * lensField * baseAmplitude * 0.2;

            if (pointerInteractive) {
              const dx = x - pointer.x;
              const dy = y - pointer.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance > 0 && distance < pointerRadius) {
                const influence = (1 - distance / pointerRadius) ** 2 * (pointerForce * 0.72);
                y += (dy / distance) * influence;
              }
              y += Math.sin(((x - pointer.x) / w) * TAU * 1.8) * cursorField * baseAmplitude * 0.16;
            }

            if (!started) {
              ctx.moveTo(x, y);
              started = true;
            } else {
              ctx.lineTo(x, y);
            }
          }

          if (started) ctx.stroke();
        };

        drawCoreWave(mobileRef.current ? 2.4 : 3.3, 0.045, mobileRef.current ? 4 : 7);
        drawCoreWave(mobileRef.current ? 0.95 : 1.2, 0.16, 0);

        ctx.shadowBlur = 0;

        if (pointerInteractive) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = pointer.pointerType === 'touch' ? 0.08 : 0.14;
          const pointerGlow = ctx.createRadialGradient(
            pointer.x,
            pointer.y,
            0,
            pointer.x,
            pointer.y,
            pointerRadius,
          );
          pointerGlow.addColorStop(0, 'rgba(254, 202, 202, 0.35)');
          pointerGlow.addColorStop(0.42, 'rgba(239, 68, 68, 0.14)');
          pointerGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = pointerGlow;
          ctx.fillRect(0, 0, w, h);
        }

        if (sparks.length > 0) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = COLOR_CORE;

          for (const spark of sparks) {
            const lifeMix = clamp(spark.life / spark.maxLife, 0, 1);
            ctx.globalAlpha = lifeMix * 0.8;
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, spark.size * lifeMix, 0, TAU);
            ctx.fill();
          }
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      };

      rafRef.current = requestAnimationFrame(animate);

      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(rafRef.current);
      };
    }, [reducedMotion]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const resetPointer = () => {
        pointerRef.current.engaged = false;
        pointerRef.current.pointerType = '';
        pointerRef.current.x = -9999;
        pointerRef.current.y = -9999;
      };

      const getPosition = (clientX: number, clientY: number) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: clientX - rect.left,
          y: clientY - rect.top,
        };
      };

      const updatePointer = (clientX: number, clientY: number, pointerType: string) => {
        const position = getPosition(clientX, clientY);
        pointerRef.current.x = position.x;
        pointerRef.current.y = position.y;
        pointerRef.current.engaged = true;
        pointerRef.current.pointerType =
          pointerType === 'touch' || pointerType === 'pen' ? pointerType : 'mouse';
      };

      const handlePointerEnter = (event: PointerEvent) => {
        if (!pointerRef.current.active || event.pointerType === 'touch') return;
        updatePointer(event.clientX, event.clientY, event.pointerType);
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (!pointerRef.current.active) return;
        if (event.pointerType === 'touch' && !pointerDownRef.current) return;
        updatePointer(event.clientX, event.clientY, event.pointerType);
      };

      const handlePointerDown = (event: PointerEvent) => {
        if (!pointerRef.current.active) return;
        pointerDownRef.current = true;
        updatePointer(event.clientX, event.clientY, event.pointerType);
      };

      const handlePointerUp = () => {
        pointerDownRef.current = false;
        if (pointerRef.current.pointerType === 'touch') {
          resetPointer();
        }
      };

      const handlePointerLeave = () => {
        pointerDownRef.current = false;
        resetPointer();
      };

      canvas.addEventListener('pointerenter', handlePointerEnter);
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointerup', handlePointerUp);
      canvas.addEventListener('pointerleave', handlePointerLeave);
      canvas.addEventListener('pointercancel', handlePointerLeave);

      return () => {
        canvas.removeEventListener('pointerenter', handlePointerEnter);
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerdown', handlePointerDown);
        canvas.removeEventListener('pointerup', handlePointerUp);
        canvas.removeEventListener('pointerleave', handlePointerLeave);
        canvas.removeEventListener('pointercancel', handlePointerLeave);
      };
    }, []);

    if (reducedMotion) return null;

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={className}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'pan-y' }}
      />
    );
  },
);

export default SignalWaveHero;
