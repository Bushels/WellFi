'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { hero, footer } from '@/lib/content';
import WellFiLogo from '@/components/ui/WellFiLogo';
import SignalWaveHero, { type SignalWaveHeroHandle } from './SignalWaveHero';

gsap.registerPlugin(useGSAP);

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const waveRef = useRef<SignalWaveHeroHandle>(null);
  const supportRef = useRef<HTMLParagraphElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Check reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 0.0s — Start the wave animation immediately
      tl.call(() => waveRef.current?.startWave(), [], 0.0);

      // 0.3s — Logo fades in
      tl.fromTo(
        logoRef.current,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        0.3,
      );

      // 1.0s — Tagline fades in
      tl.fromTo(
        taglineRef.current,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 0.85, y: 0, duration: 0.4 },
        1.0,
      );

      // 3.5s — Support copy fades in
      tl.fromTo(
        supportRef.current,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        3.5,
      );

      // 3.8s — Proof chips stagger in
      if (chipsRef.current) {
        const chips = chipsRef.current.querySelectorAll('.hero-proof-chip');
        tl.fromTo(
          chips,
          { autoAlpha: 0, scale: 0.95 },
          { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.12 },
          3.8,
        );
      }

      // 4.0s — CTAs fade in
      if (ctaRef.current) {
        const buttons = ctaRef.current.querySelectorAll('.hero-cta');
        tl.fromTo(
          buttons,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.15 },
          4.0,
        );
      }

      // 4.2s — Logo brightness pulse
      tl.fromTo(
        logoRef.current,
        { filter: 'brightness(1)' },
        { filter: 'brightness(1.3)', duration: 0.3, yoyo: true, repeat: 1 },
        4.2,
      );

      // 4.5s — Enable mouse interaction on wave
      tl.call(() => waveRef.current?.enableMouseInteraction(), [], 4.5);

      // 5.0s — Settle
      tl.call(() => {
        heroRef.current?.classList.add('hero-settled');
      }, [], 5.0);
    },
    { scope: heroRef, dependencies: [] },
  );

  return (
    <section
      ref={heroRef}
      id="hero"
      className="hero-poster relative isolate min-h-screen overflow-hidden bg-[#020408] text-white"
    >
      {/* --- Background layers (z-0) --- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_17%_22%,rgba(11,42,74,0.34),transparent_34%),radial-gradient(circle_at_75%_28%,rgba(255,255,255,0.05),transparent_26%),linear-gradient(180deg,#010205_0%,#02070e_58%,#050b14_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(2,7,14,0.92)_100%)]"
      />

      {/* --- Signal wave canvas (z-5) --- */}
      <SignalWaveHero ref={waveRef} className="absolute inset-0 z-[5]" />

      {/* --- Content overlay (z-10) --- */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[96rem] flex-col justify-end px-6 pb-16 sm:px-10 lg:px-12 xl:px-14">
        <div className="flex flex-col gap-6 lg:max-w-[34rem]">
          {/* Logo */}
          <div ref={logoRef} className="invisible">
            <WellFiLogo className="w-[15rem] sm:w-[18rem] lg:w-[28rem]" />
          </div>

          {/* Tagline */}
          <p
            ref={taglineRef}
            className="invisible max-w-[18ch] text-[clamp(1.1rem,2vw,1.7rem)] font-medium tracking-[-0.02em] text-[#d7dee8]"
          >
            {hero.tagline}
          </p>

          {/* Support line */}
          <p
            ref={supportRef}
            className={`invisible max-w-[36ch] text-[clamp(0.95rem,1.6vw,1.15rem)] leading-relaxed text-[#9CA3AF] ${prefersReducedMotion ? '!visible' : ''}`}
          >
            {hero.supportLine}
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
              href={`mailto:${footer.email}`}
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

      {/* Accessible hidden headline */}
      <h1 className="sr-only">{hero.pulseHeadline}</h1>

      {/* Static headline fallback for reduced motion */}
      {prefersReducedMotion && (
        <h1 className="absolute inset-0 z-[15] flex items-center justify-center text-center text-[clamp(2.4rem,8vw,5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-[#f5f8fd]">
          {hero.pulseHeadline}
        </h1>
      )}
    </section>
  );
}
