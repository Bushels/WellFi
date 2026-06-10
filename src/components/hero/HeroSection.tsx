'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import WellFiLogo from '@/components/ui/WellFiLogo';

gsap.registerPlugin(useGSAP);

const HERO_INTRO_DURATION = 1.6;

/**
 * HeroSection — the candle pulses; the dark accepts and releases.
 *
 * Design philosophy: the reservoir is almost invisible at rest. Then a sharp
 * burst of light briefly illuminates the entire formation — like a camera flash
 * or an arc-weld blink — before the light contracts to just around the WellFi
 * device and slowly fades back to darkness. Then darkness again. Then another
 * pulse. The visitor watches the formation reveal itself rhythmically.
 *
 * Two synchronized animations:
 *   1. `hero-candle-pulse` (image filter) — drives the flash + decay of the
 *      whole formation's brightness.
 *   2. `hero-candle-glow` (radial overlay at the candle position) — adds the
 *      lingering localized glow that "clings to the WellFi device" after the
 *      flash before fading.
 *
 * Both animations share a 6s cycle. Each cycle: ~4s of dark, ~0.4s sharp burst,
 * ~1.6s contracted glow fade. Then dark again.
 */
export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      const logoRevealAt = HERO_INTRO_DURATION * 0.6;
      const scrollHintAt = HERO_INTRO_DURATION + 0.4;

      tl.set(logoRef.current, { autoAlpha: 0, y: 8 }, 0);
      tl.set(scrollHintRef.current, { autoAlpha: 0, y: -6 }, 0);

      tl.to(logoRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, logoRevealAt);
      tl.to(scrollHintRef.current, { autoAlpha: 0.6, y: 0, duration: 0.5 }, scrollHintAt);

      tl.call(() => {
        heroRef.current?.classList.add('hero-settled');
      }, [], HERO_INTRO_DURATION + 1.0);
    },
    { scope: heroRef, dependencies: [prefersReducedMotion] },
  );

  return (
    <section
      ref={heroRef}
      id="hero"
      className="hero-poster relative isolate min-h-[100svh] overflow-hidden bg-[#020408] text-white"
    >
      {/* Layer 1: The DARK reservoir state — always visible at full opacity.
          The candle is a faint cyan point; the formation is barely lit. */}
      <div
        aria-hidden="true"
        className="hero-art-direction absolute inset-0"
      />

      {/* Layer 2: The LIT reservoir state — a Codex-generated relight of the
          same scene with the WellFi device's light actively illuminating the
          surrounding wet bitumen. Cross-fades on top of the dark layer:
          baseline opacity 0.15 keeps the candle quietly burning, peaks at 1.0
          during the burst, decays back. The "concentrated around device"
          effect is BAKED INTO this image's lighting — no radial overlay needed. */}
      <div
        aria-hidden="true"
        className="hero-art-lit absolute inset-0"
      />

      {/* Localized pulsing glow overlay */}
      <div
        aria-hidden="true"
        className="hero-candle-glow absolute inset-0"
      />

      {/* Bottom fade for clean separation from next section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(2,7,14,0.92)_100%)] lg:h-[20%]"
      />

      {/* Foreground overlay — logo top-left, scroll hint bottom-center */}
      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[96rem] flex-col px-6 pt-10 sm:px-10 sm:pt-14 lg:px-12 lg:pt-16 xl:px-14 xl:pt-20">
        <h1 className="sr-only">Know the Unknown</h1>

        <div ref={logoRef} className={prefersReducedMotion ? '' : 'invisible'}>
          <WellFiLogo
            interactiveSignal
            wordmarkColor="#d3e2ec"
            signalColor="#ef4444"
            className="w-[10rem] sm:w-[12rem] lg:w-[14rem]"
          />
        </div>

        <div className="flex-1" />

        <div
          ref={scrollHintRef}
          className={`flex items-center justify-center pb-10 sm:pb-14 ${prefersReducedMotion ? '' : 'invisible'}`}
        >
          <span
            className="text-[0.72rem] font-medium uppercase tracking-[0.32em] text-[#9bb5c7]"
            aria-hidden="true"
          >
            ↓ Closer
          </span>
        </div>
      </div>
    </section>
  );
}
