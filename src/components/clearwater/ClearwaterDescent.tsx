'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { clearwater } from '@/lib/content';

gsap.registerPlugin(ScrollTrigger);

// Render dimensions (Blender passes are 2560x1440, pixel-aligned).
const VW = 2560;
const VH = 1440;
const BASE = '/wellfi/renders/clearwater-drill';

// Well-path centerline, normalized top-left origin (from Blender wellpath.json).
const WELL: ReadonlyArray<readonly [number, number]> = [
  [0.06556, 0.11965], [0.07974, 0.27552], [0.08966, 0.38457], [0.0982, 0.4784],
  [0.10459, 0.54873], [0.10943, 0.58711], [0.11543, 0.60946], [0.1237, 0.6299],
  [0.13397, 0.64784], [0.1459, 0.66281], [0.15912, 0.67442], [0.17323, 0.68238],
  [0.18784, 0.68651], [0.20251, 0.68673], [0.26171, 0.67971], [0.34881, 0.66937],
  [0.43393, 0.65927], [0.51714, 0.6494],
];
const pathD = (pts: ReadonlyArray<readonly [number, number]>) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${(x * VW).toFixed(1)} ${(y * VH).toFixed(1)}`).join(' ');
const DRILL_D = pathD(WELL);
const SIGNAL_D = pathD([...WELL].reverse()); // toe -> surface (signal rising)
const TOE = WELL[WELL.length - 1];

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);
const seg = (p: number, a: number, b: number): number => clamp01((p - a) / (b - a));

export default function ClearwaterDescent() {
  const sectionRef = useRef<HTMLElement>(null);
  const drillRef = useRef<SVGPathElement>(null);
  const signalRef = useRef<SVGPathElement>(null);
  const deviceRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const [on, setOn] = useState(false);

  useGSAP(
    () => {
      if (typeof window === 'undefined') return;

      // First pass (static DOM): decide whether to enhance into the scroll.
      if (!on) {
        const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const finePointer = window.matchMedia('(pointer: fine)').matches;
        const wideEnough = window.innerWidth >= 768;
        if (motionOk && finePointer && wideEnough) setOn(true);
        return;
      }

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          // drill the bore in (surface -> toe)
          if (drillRef.current) drillRef.current.style.strokeDashoffset = String(1 - seg(p, 0.05, 0.72));
          // intro fades as drilling starts
          if (introRef.current) introRef.current.style.opacity = String(1 - seg(p, 0.03, 0.14));
          // device lands at the toe
          const rev = seg(p, 0.7, 0.95);
          if (deviceRef.current) {
            deviceRef.current.style.opacity = String(rev);
            deviceRef.current.style.transform = `scale(${0.96 + 0.04 * rev})`;
          }
          if (glowRef.current) glowRef.current.style.opacity = String(rev);
          // telemetry signal rises to surface
          if (signalRef.current) signalRef.current.style.strokeDashoffset = String(1 - seg(p, 0.82, 1.0));
          // tagline
          if (taglineRef.current) {
            const t = seg(p, 0.86, 1.0);
            taglineRef.current.style.opacity = String(t);
            taglineRef.current.style.transform = `translate(-50%, ${(1 - t) * 14}px)`;
          }
        },
      });

      ScrollTrigger.refresh(); // section grew to its scroll height; recompute sibling triggers
      return () => st.kill();
    },
    { scope: sectionRef, dependencies: [on] },
  );

  return (
    <section
      ref={sectionRef}
      id="anchor"
      aria-labelledby="clearwater-reveal-tagline"
      className="relative isolate bg-[#04060a]"
      style={on ? { height: '320vh' } : undefined}
    >
      {on ? (
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(125% 85% at 50% 42%, rgba(18,26,36,0.55), #04060a 72%)' }}
          />

          {/* pixel-aligned cutaway stack (all layers share the 16:9 render framing) */}
          <div className="relative w-[min(94vw,1180px)]" style={{ aspectRatio: '16 / 9' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE}/pass_formation.png`}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-contain"
            />

            <svg
              viewBox={`0 0 ${VW} ${VH}`}
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 h-full w-full"
            >
              <defs>
                <mask id="cw-drill">
                  <path
                    ref={drillRef}
                    d={DRILL_D}
                    fill="none"
                    stroke="white"
                    strokeWidth={120}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1}
                  />
                </mask>
                <filter id="cw-signal-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="6" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <image href={`${BASE}/pass_casing.png`} width={VW} height={VH} mask="url(#cw-drill)" />
              {/* telemetry signal travelling up the bore */}
              <path
                ref={signalRef}
                d={SIGNAL_D}
                fill="none"
                stroke="rgb(34,211,238)"
                strokeWidth={7}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1}
                filter="url(#cw-signal-glow)"
                opacity={0.9}
              />
            </svg>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={deviceRef}
              src={`${BASE}/pass_device.png`}
              alt={clearwater.deviceAlt}
              className="absolute inset-0 h-full w-full object-contain will-change-transform"
              style={{ opacity: 0 }}
            />

            {/* blue coupling hue at the toe */}
            <div
              ref={glowRef}
              aria-hidden="true"
              className="pointer-events-none absolute"
              style={{
                opacity: 0,
                left: `${TOE[0] * 100}%`,
                top: `${TOE[1] * 100}%`,
                width: '20%',
                height: '34%',
                transform: 'translate(-50%, -50%)',
                background:
                  'radial-gradient(circle, rgba(34,211,238,0.45), rgba(34,211,238,0.12) 42%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
          </div>

          {/* intro */}
          <div
            ref={introRef}
            className="absolute left-1/2 top-[11%] w-[min(90vw,42rem)] -translate-x-1/2 text-center"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-text-muted">{clearwater.introEyebrow}</p>
            <p className="mt-2 font-heading text-2xl font-medium text-text-primary sm:text-3xl">
              {clearwater.introLine}
            </p>
          </div>

          {/* reveal tagline */}
          <p
            ref={taglineRef}
            id="clearwater-reveal-tagline"
            className="absolute bottom-[11%] left-1/2 font-heading text-[clamp(1.5rem,4vw,2.8rem)] font-semibold tracking-[-0.02em] text-text-primary will-change-transform"
            style={{ opacity: 0, transform: 'translate(-50%, 14px)' }}
          >
            Data Below, <span className="text-em-glow">Insight Above</span>
          </p>
        </div>
      ) : (
        // static fallback (reduced-motion / touch / narrow): the finished cutaway still
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-20 text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-text-muted">{clearwater.introEyebrow}</p>
            <p className="mt-2 font-heading text-2xl font-medium text-text-primary">{clearwater.introLine}</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE}/hires_wide_02.png`}
            alt={clearwater.deviceAlt}
            className="w-full rounded-xl border border-white/5"
          />
          <p
            id="clearwater-reveal-tagline"
            className="font-heading text-[clamp(1.4rem,4vw,2.4rem)] font-semibold tracking-[-0.02em] text-text-primary"
          >
            Data Below, <span className="text-em-glow">Insight Above</span>
          </p>
        </div>
      )}
    </section>
  );
}
