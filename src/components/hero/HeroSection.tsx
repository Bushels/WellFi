'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import { hero, footer } from '@/lib/content';
import WellFiLogo from '@/components/ui/WellFiLogo';
import ParticleCanvas, { type ParticleCanvasHandle } from './ParticleCanvas';

gsap.registerPlugin(useGSAP);

const HEADLINE_LINES = ['STOP', 'PUMPING', 'BLIND.'];

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const toolRef = useRef<HTMLDivElement>(null);
  const particleRef = useRef<ParticleCanvasHandle>(null);
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

      // Beat 0 (0.0-0.5s): Logo + tagline fade in
      tl.fromTo(
        logoRef.current,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        0,
      );
      tl.fromTo(
        taglineRef.current,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 0.85, y: 0, duration: 0.4 },
        0.15,
      );

      // Beat 1 (0.5-1.0s): Tool fades in
      tl.fromTo(
        toolRef.current,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 0.55, y: 0, duration: 0.5 },
        0.5,
      );

      // Beat 2 (1.0s): Trigger particle explosion
      tl.call(() => particleRef.current?.triggerPulse(), [], 1.0);

      // Beat 3 (1.8s): Ghost tool down
      tl.to(
        toolRef.current,
        { autoAlpha: 0.15, duration: 0.4, ease: 'power2.inOut' },
        1.8,
      );

      // Beat 4 (2.2-3.0s): Supporting content staggers in
      tl.fromTo(
        supportRef.current,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        2.2,
      );

      if (chipsRef.current) {
        const chips = chipsRef.current.querySelectorAll('.hero-proof-chip');
        tl.fromTo(
          chips,
          { autoAlpha: 0, scale: 0.95 },
          { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.12 },
          2.5,
        );
      }

      if (ctaRef.current) {
        const buttons = ctaRef.current.querySelectorAll('.hero-cta');
        tl.fromTo(
          buttons,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.15 },
          2.8,
        );
      }

      // Beat 5 (3.2s): Logo pulse + enable mouse interaction
      tl.fromTo(
        logoRef.current,
        { filter: 'brightness(1)' },
        { filter: 'brightness(1.3)', duration: 0.3, yoyo: true, repeat: 1 },
        3.2,
      );

      tl.call(() => particleRef.current?.enableMouseInteraction(), [], 3.5);

      // After complete — add settled class
      tl.call(() => {
        heroRef.current?.classList.add('hero-settled');
      }, [], 4.0);
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

      {/* --- Glass orbs (z-1) --- */}
      <div
        aria-hidden="true"
        className="hero-glass-orb pointer-events-none absolute right-[6%] top-[14%] z-[1] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(126,238,255,0.3)_0%,rgba(29,78,136,0.16)_36%,rgba(3,10,18,0)_72%)] opacity-[0.12] blur-[56px]"
      />
      <div
        aria-hidden="true"
        className="hero-glass-orb pointer-events-none absolute left-[11%] top-[18%] z-[1] h-[16rem] w-[16rem] rounded-full bg-[radial-gradient(circle,rgba(125,238,255,0.08)_0%,rgba(16,78,140,0.06)_38%,rgba(2,7,14,0)_72%)] opacity-[0.06] blur-[44px]"
      />

      {/* --- Main content grid --- */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[96rem] flex-col justify-center px-6 py-16 sm:px-10 lg:flex-row lg:items-center lg:px-12 xl:px-14">

        {/* Left column: brand + post-reveal content */}
        <div className="relative z-20 flex flex-col gap-6 lg:max-w-[34rem] lg:pr-12">
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

          {/* Support line (hidden until Beat 4) */}
          <p
            ref={supportRef}
            className={`invisible max-w-[36ch] text-[clamp(0.95rem,1.6vw,1.15rem)] leading-relaxed text-[#9CA3AF] ${prefersReducedMotion ? '!visible' : ''}`}
          >
            {hero.supportLine}
          </p>

          {/* Proof chips (hidden until Beat 4) */}
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

          {/* CTAs (hidden until Beat 4) */}
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

        {/* Right column: tool image + particle canvas */}
        <div className="relative mt-8 flex flex-1 items-center justify-center lg:mt-0">
          {/* Tool PNG (z-5) */}
          <div
            ref={toolRef}
            className="invisible relative h-[clamp(20rem,50vh,36rem)] w-[clamp(8rem,20vw,16rem)]"
          >
            <Image
              src="/images/wellfi-sideclamp-hero.png"
              alt="WellFi side-clamped tool mounted vertically alongside carbon steel pipe"
              fill
              priority
              sizes="(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 20vw"
              className="select-none object-contain object-center brightness-[0.6] contrast-[1.08] saturate-[0.72]"
            />
          </div>

          {/* Particle canvas (z-10) — overlays the headline area */}
          <div className="hero-particle-canvas absolute inset-0 z-10">
            <ParticleCanvas
              ref={particleRef}
              lines={HEADLINE_LINES}
              fontFamily="Space Grotesk, system-ui, sans-serif"
              fontWeight={700}
              maxParticles={2500}
              toolBounds={{ x: 0.55, y: 0.15, width: 0.3, height: 0.65 }}
              className="h-full w-full"
            />
          </div>

          {/* Accessible hidden headline (z-15) */}
          <h1 className="sr-only">{hero.pulseHeadline}</h1>

          {/* Static headline fallback for reduced motion */}
          {prefersReducedMotion && (
            <h1 className="hero-static-headline absolute inset-0 z-[15] flex items-center justify-center text-center text-[clamp(2.4rem,8vw,5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-[#f5f8fd]">
              {hero.pulseHeadline}
            </h1>
          )}
        </div>
      </div>
    </section>
  );
}
