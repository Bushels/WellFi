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

// Transmission glow sits at the toe — the point the bore lands and the EM
// signal originates ("a blue light coming out of the casing").
const TOE = WELL[WELL.length - 1];

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);
const seg = (p: number, a: number, b: number): number => clamp01((p - a) / (b - a));

// Six benefits surface one at a time across this scroll window (trapezoidal).
const B_START = 0.12;
const B_END = 0.66;
function benefitViz(p: number, i: number, n: number): number {
  const slot = (B_END - B_START) / n;
  const s = B_START + i * slot;
  const e = s + slot;
  if (p <= s || p >= e) return 0;
  const local = (p - s) / slot;
  const edge = 0.26; // fade-in / fade-out fraction of the slot
  if (local < edge) return clamp01(local / edge);
  if (local > 1 - edge) return clamp01((1 - local) / edge);
  return 1;
}

export default function ClearwaterDescent() {
  const sectionRef = useRef<HTMLElement>(null);
  const drillRef = useRef<SVGPathElement>(null);
  const signalRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const benefitRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [on, setOn] = useState(false);

  const benefits = clearwater.benefits;

  useGSAP(
    () => {
      if (typeof window === 'undefined') return;

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
          if (drillRef.current) drillRef.current.style.strokeDashoffset = String(1 - seg(p, 0.05, 0.50));
          // opening line fades as the first benefit arrives
          if (introRef.current) introRef.current.style.opacity = String(1 - seg(p, 0.03, 0.12));
          // benefits surface one at a time
          benefitRefs.current.forEach((el, i) => {
            if (!el) return;
            const v = benefitViz(p, i, benefits.length);
            el.style.opacity = String(v);
            el.style.transform = `translate(-50%, ${(1 - v) * 14}px)`;
          });
          // once the casing is set, a blue transmission glow blooms at the toe
          // (replaces the old WellFi poke-out) and holds to the end
          if (glowRef.current) glowRef.current.style.opacity = String(seg(p, 0.52, 0.74));
          // telemetry signal rises to surface — the finale
          if (signalRef.current) signalRef.current.style.strokeDashoffset = String(1 - seg(p, 0.66, 0.92));
        },
      });

      ScrollTrigger.refresh();
      return () => st.kill();
    },
    { scope: sectionRef, dependencies: [on] },
  );

  return (
    <section
      ref={sectionRef}
      id="anchor"
      aria-label="Benefits of WellFi"
      className="relative isolate bg-[#04060a]"
      style={on ? { height: '380vh' } : undefined}
    >
      {on ? (
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(125% 85% at 50% 42%, rgba(18,26,36,0.55), #04060a 72%)' }}
          />

          {/* pixel-aligned cutaway stack */}
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

            {/* Transmission glow — a blue light blooming out of the casing once it's
                set (replaces the WellFi device poke-out). Centering lives on the
                wrapper; the inner node breathes so the light feels alive. */}
            <div
              ref={glowRef}
              aria-hidden="true"
              className="pointer-events-none absolute will-change-[opacity]"
              style={{
                left: `${TOE[0] * 100}%`,
                top: `${TOE[1] * 100}%`,
                width: '34%',
                aspectRatio: '1',
                transform: 'translate(-50%, -50%)',
                opacity: 0,
                mixBlendMode: 'screen',
              }}
            >
              <div
                className="cw-glow-breathe h-full w-full rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(190,248,255,0.95) 0%, rgba(34,211,238,0.7) 16%, rgba(56,189,248,0.32) 40%, rgba(34,211,238,0) 72%)',
                  filter: 'blur(4px)',
                }}
              />
            </div>
          </div>

          {/* opening line */}
          <div ref={introRef} className="absolute left-1/2 top-[10%] w-[min(90vw,42rem)] -translate-x-1/2 text-center">
            {clearwater.introEyebrow && <p className="text-xs uppercase tracking-[0.28em] text-text-muted">{clearwater.introEyebrow}</p>}
            <p className="mt-2 font-heading text-2xl font-medium text-text-primary sm:text-3xl">
              {clearwater.introLine}
            </p>
          </div>

          {/* benefits — surface one at a time, synced to the drill, seated over the formation */}
          {benefits.map((b, i) => (
            <div
              key={b.label}
              ref={(el) => {
                benefitRefs.current[i] = el;
              }}
              className="absolute left-1/2 top-[30%] w-[min(90vw,33rem)] rounded-xl border border-white/12 bg-[rgba(8,13,20,0.78)] px-6 py-4 text-center backdrop-blur-sm"
              style={{ opacity: 0, transform: 'translate(-50%, 14px)', boxShadow: '0 0 30px -10px rgba(34,211,238,0.4)' }}
            >
              <h3 className="font-heading text-xl font-semibold tracking-[-0.01em] text-text-primary sm:text-2xl">
                {b.label}
              </h3>
              <p className="mt-1 text-sm text-text-secondary sm:text-base">{b.detail}</p>
            </div>
          ))}

          <style>{`
            @keyframes cw-glow-breathe {
              0%   { transform: scale(0.92); opacity: 0.82; }
              100% { transform: scale(1.08); opacity: 1; }
            }
            .cw-glow-breathe { animation: cw-glow-breathe 3s ease-in-out infinite alternate; }
            @media (prefers-reduced-motion: reduce) { .cw-glow-breathe { animation: none; } }
          `}</style>
        </div>
      ) : (
        // static fallback (reduced-motion / touch / narrow)
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-20 text-center">
          <div>
            {clearwater.introEyebrow && <p className="text-xs uppercase tracking-[0.28em] text-text-muted">{clearwater.introEyebrow}</p>}
            <p className="mt-2 font-heading text-2xl font-medium text-text-primary">{clearwater.introLine}</p>
          </div>
          <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
            {benefits.map((b) => (
              <li
                key={b.label}
                className="rounded-xl border border-white/10 bg-[rgba(8,13,20,0.7)] px-4 py-3 text-left"
              >
                <h3 className="font-heading text-sm font-semibold text-text-primary">{b.label}</h3>
                <p className="mt-1 text-xs text-text-secondary">{b.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
