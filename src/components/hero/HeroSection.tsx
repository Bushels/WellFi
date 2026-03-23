'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { hero } from '@/lib/content';
import WellFiLogo from '@/components/ui/WellFiLogo';
import SignalWaveHero, {
  SIGNAL_WAVE_INTRO_DURATION,
  type SignalWaveHeroHandle,
} from './SignalWaveHero';

gsap.registerPlugin(useGSAP);

export default function HeroSection() {
  const headlineWords = hero.headline.split(' ');
  const hasHeadlineEmphasis = headlineWords.length > 1;
  const headlineEmphasis = hasHeadlineEmphasis ? (headlineWords.at(-1) ?? '') : '';
  const headlineLeadWords = hasHeadlineEmphasis ? headlineWords.slice(0, -1) : [hero.headline];
  const heroRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const headlineBlindRef = useRef<HTMLSpanElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const waveRef = useRef<SignalWaveHeroHandle>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
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
      const sweepDuration = SIGNAL_WAVE_INTRO_DURATION;
      const logoRevealAt = sweepDuration * 0.75;
      const copyRevealAt = sweepDuration + 0.05;
      const chipsRevealAt = copyRevealAt + 0.3;
      const ctaRevealAt = copyRevealAt + 0.46;
      const chips = chipsRef.current?.querySelectorAll('.hero-proof-chip') ?? [];
      const buttons = ctaRef.current?.querySelectorAll('.hero-cta') ?? [];

      // 0.0s - Start the wave animation immediately
      tl.call(() => waveRef.current?.startWave(), [], 0.0);
      tl.set(logoRef.current, { autoAlpha: 0, y: 10 }, 0);
      tl.set(headlineRef.current, { autoAlpha: 0 }, 0);
      tl.set(subheadlineRef.current, { autoAlpha: 0, y: 14 }, 0);
      tl.set(chips, { autoAlpha: 0, scale: 0.95 }, 0);
      tl.set(buttons, { autoAlpha: 0, y: 10 }, 0);
      if (headlineRef.current) {
        tl.set(
          headlineRef.current.querySelectorAll('.hero-headline-part'),
          { autoAlpha: 0, x: 18 },
          0,
        );
      }

      // 75% sweep - Brand appears once the signal has earned the frame
      tl.to(
        logoRef.current,
        { autoAlpha: 1, y: 0, duration: 0.42 },
        logoRevealAt,
      );

      // Logo gets a brief systems-online pulse after reveal
      tl.fromTo(
        logoRef.current,
        { filter: 'brightness(1)' },
        { filter: 'brightness(1.24)', duration: 0.18, yoyo: true, repeat: 1 },
        logoRevealAt + 0.22,
      );

      // Full sweep - Headline wipes in from left to right, with Blind landing last
      tl.set(headlineRef.current, { autoAlpha: 1 }, copyRevealAt);
      if (headlineRef.current) {
        const headlineParts = headlineRef.current.querySelectorAll('.hero-headline-part');
        tl.fromTo(
          headlineParts,
          { autoAlpha: 0, x: 18 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.66,
            stagger: 0.08,
            ease: 'power3.out',
          },
          copyRevealAt,
        );
      }

      if (headlineBlindRef.current) {
        tl.fromTo(
          headlineBlindRef.current,
          { filter: 'brightness(0.92)' },
          { filter: 'brightness(1.1)', duration: 0.18, yoyo: true, repeat: 1 },
          copyRevealAt + 0.56,
        );
      }

      // Product descriptor follows the slogan after the headline takes the beat
      tl.to(
        subheadlineRef.current,
        { autoAlpha: 1, y: 0, duration: 0.42 },
        copyRevealAt + 0.16,
      );

      // Proof chips wait until the full headline beat has landed
      tl.to(chips, { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.12 }, chipsRevealAt);

      // CTAs come in last so they do not compete with the message
      tl.to(buttons, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.15 }, ctaRevealAt);

      // Interactivity turns on exactly when the sweep finishes
      tl.call(() => waveRef.current?.enableMouseInteraction(), [], sweepDuration);

      // Settle shortly after the reveal completes
      tl.call(() => {
        heroRef.current?.classList.add('hero-settled');
      }, [], sweepDuration + 0.15);
    },
    { scope: heroRef, dependencies: [prefersReducedMotion] },
  );

  return (
    <section
      ref={heroRef}
      id="hero"
      className="hero-poster relative isolate min-h-[clamp(38rem,82svh,50rem)] overflow-hidden bg-[#020408] text-white"
    >
      {/* --- Background layers (z-0) --- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_17%_22%,rgba(11,42,74,0.34),transparent_34%),radial-gradient(circle_at_75%_28%,rgba(255,255,255,0.05),transparent_26%),linear-gradient(180deg,#010205_0%,#02070e_58%,#050b14_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(2,7,14,0.92)_100%)] lg:h-[20%]"
      />

      {/* --- Signal wave canvas (z-5) --- */}
      <SignalWaveHero ref={waveRef} className="absolute inset-0 z-[5]" />

      {/* --- Content overlay (z-10) --- */}
      <div className="relative z-10 mx-auto flex min-h-[clamp(38rem,82svh,50rem)] w-full max-w-[96rem] flex-col items-start justify-center px-6 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24 xl:px-14 xl:py-28">
        <div className="flex w-full max-w-[31rem] flex-col gap-4 sm:max-w-[33rem] sm:gap-5 lg:max-w-[36rem]">
          {/* Logo */}
          <div ref={logoRef} className={prefersReducedMotion ? '' : 'invisible'}>
            <WellFiLogo
              interactiveSignal
              wordmarkColor="#d3e2ec"
              signalColor="#78f4ff"
              className="w-[13rem] sm:w-[16rem] lg:w-[23rem] xl:w-[25rem]"
            />
          </div>

          {/* Headline */}
          <h1
            ref={headlineRef}
            className={`${prefersReducedMotion ? '' : 'invisible'} max-w-[13ch] text-[clamp(2.8rem,6vw,5.6rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-[#f5fbff]`}
          >
            {headlineLeadWords.map((word) => (
              <span key={word} className="hero-headline-part block pr-[0.08em]">
                {word}
              </span>
            ))}
            {headlineEmphasis && (
              <span ref={headlineBlindRef} className="hero-headline-part block pr-[0.08em]">
                {headlineEmphasis}
              </span>
            )}
          </h1>

          {/* Subheadline */}
          <p
            ref={subheadlineRef}
            className={`${prefersReducedMotion ? '' : 'invisible'} max-w-[28ch] text-[clamp(1rem,1.8vw,1.35rem)] font-medium leading-relaxed tracking-[-0.02em] text-[#c9d7e2]`}
          >
            {hero.subheadline}
          </p>

          {/* Proof chips */}
          <div ref={chipsRef} className="flex flex-wrap gap-2.5">
            {hero.proofChips.map((chip) => (
              <span
                key={chip}
                className={`hero-proof-chip invisible inline-flex items-center rounded-full border border-[rgba(6,182,212,0.25)] bg-[rgba(6,182,212,0.08)] px-3.5 py-1.5 text-[0.8rem] font-medium tracking-wide text-[#22D3EE] ${prefersReducedMotion ? '!visible' : ''}`}
              >
                {chip}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-wrap gap-3 pt-2">
            <a
              href={hero.ctaPrimaryHref}
              className={`hero-cta btn-primary invisible text-sm ${prefersReducedMotion ? '!visible' : ''}`}
            >
              {hero.ctaPrimary}
            </a>
            <a
              href={hero.ctaSecondaryHref}
              className={`hero-cta btn-secondary invisible text-sm ${prefersReducedMotion ? '!visible' : ''}`}
            >
              {hero.ctaSecondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
