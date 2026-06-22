'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { clearwater } from '@/lib/content';
import {
  STRATA_VH,
  BENEFIT_START,
  benefitVisibility,
  layerTranslateVh,
  revealState,
} from '@/lib/clearwater/descent';
import FormationStrata from './FormationStrata';
import BenefitChip from './BenefitChip';
import DeviceReveal from './DeviceReveal';

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

// Where each benefit chip sits vertically in the 100vh stage (descent mode).
const CHIP_TOP_PCT = [24, 36, 30, 44, 38, 50];

export default function ClearwaterDescent() {
  const sectionRef = useRef<HTMLElement>(null);
  const strataRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Array<HTMLDivElement | null>>([]);
  const revealRef = useRef<HTMLDivElement>(null);
  const [descent, setDescent] = useState(false);

  useGSAP(
    () => {
      if (typeof window === 'undefined') return;

      // First pass (static DOM committed): decide whether to enhance.
      if (!descent) {
        const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const finePointer = window.matchMedia('(pointer: fine)').matches;
        const wideEnough = window.innerWidth >= 768;
        if (motionOk && finePointer && wideEnough) setDescent(true);
        return;
      }

      // Second pass (descent DOM committed → section is 400vh, refs attached).
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;

          if (strataRef.current) {
            strataRef.current.style.transform = `translateY(${layerTranslateVh(p, 1)}vh)`;
          }
          if (introRef.current) {
            introRef.current.style.opacity = String(1 - clamp01(p / BENEFIT_START));
          }
          chipRefs.current.forEach((el, i) => {
            if (!el) return;
            const v = benefitVisibility(p, i);
            el.style.opacity = String(v);
            el.style.transform = `translate(-50%, ${(1 - v) * 16}px)`;
          });
          if (revealRef.current) {
            const { opacity, scale } = revealState(p);
            revealRef.current.style.opacity = String(opacity);
            revealRef.current.style.transform = `scale(${scale})`;
          }
        },
      });

      return () => st.kill();
    },
    { scope: sectionRef, dependencies: [descent] },
  );

  return (
    <section
      ref={sectionRef}
      id="anchor"
      aria-labelledby="clearwater-reveal-tagline"
      className="relative isolate bg-[#020408]"
      style={descent ? { height: '400vh' } : undefined}
    >
      {descent ? (
        // ── Descent mode: sticky stage, scroll-driven ──
        <div className="sticky top-0 h-screen overflow-hidden">
          <div
            ref={strataRef}
            aria-hidden="true"
            className="absolute inset-x-0 top-0 will-change-transform"
            style={{ height: `${STRATA_VH}vh` }}
          >
            <FormationStrata />
          </div>

          <div
            ref={introRef}
            className="absolute left-1/2 top-[14%] w-[min(90vw,32rem)] -translate-x-1/2 text-center"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-text-muted">
              {clearwater.introEyebrow}
            </p>
            <p className="mt-2 font-heading text-2xl font-medium text-text-primary">
              {clearwater.introLine}
            </p>
          </div>

          {clearwater.benefits.map((benefit, i) => (
            <div
              key={benefit.label}
              ref={(el) => {
                chipRefs.current[i] = el;
              }}
              className="absolute left-1/2"
              style={{ top: `${CHIP_TOP_PCT[i]}%`, opacity: 0, transform: 'translate(-50%, 16px)' }}
            >
              <BenefitChip benefit={benefit} />
            </div>
          ))}

          <div
            ref={revealRef}
            className="absolute inset-0 will-change-transform"
            style={{ opacity: 0 }}
          >
            <DeviceReveal />
          </div>
        </div>
      ) : (
        // ── Static fallback: reduced-motion / touch / narrow ──
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-10 px-6 py-24 text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-text-muted">
              {clearwater.introEyebrow}
            </p>
            <p className="mt-2 font-heading text-2xl font-medium text-text-primary">
              {clearwater.introLine}
            </p>
          </div>
          <ul className="flex w-full flex-col gap-4">
            {clearwater.benefits.map((b) => (
              <li key={b.label} className="w-full">
                <BenefitChip benefit={b} />
              </li>
            ))}
          </ul>
          <div className="relative h-[60vh] w-full">
            <DeviceReveal />
          </div>
        </div>
      )}
    </section>
  );
}
