'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroSection from '@/components/hero/HeroSection';
import Navigation from '@/components/nav/Navigation';
import OneEightTrillionAnchor from '@/components/anchor/OneEightTrillionAnchor';
import ToolRevealSection from '@/components/reveal/ToolRevealSection';
import ProofSection from '@/components/proof/ProofSection';
// Calculator hidden 2026-05-09 — pivoted to curiosity-driven page.
// Restore when ROI numbers are locked.
// import CalculatorTeaserSection from '@/components/calculator/CalculatorTeaserSection';
//
// CuriosityHintSection merged into HeroSection 2026-05-10 — the entire hero now acts
// as the cursor-flashlight stage. Standalone hint section is no longer needed.
// import CuriosityHintSection from '@/components/hint/CuriosityHintSection';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Section divider — grows from center on scroll approach
    gsap.fromTo('.section-divider',
      { opacity: 0, maxWidth: '0%' },
      {
        opacity: 1,
        maxWidth: '80%',
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.section-divider',
          start: 'top 90%',
        },
      },
    );

    // Background gradient shift — scroll-linked color temperature
    gsap.fromTo('main',
      { '--bg-cyan-intensity': 0.04, '--bg-amber-intensity': 0.02 },
      {
        '--bg-cyan-intensity': 0.12,
        '--bg-amber-intensity': 0.03,
        ease: 'none',
        scrollTrigger: {
          trigger: '#anchor',
          start: 'top center',
          end: 'bottom center',
          scrub: true,
        },
      },
    );

    // Warmer shift near proof section
    gsap.fromTo('main',
      { '--bg-cyan-intensity': 0.12, '--bg-amber-intensity': 0.03 },
      {
        '--bg-cyan-intensity': 0.06,
        '--bg-amber-intensity': 0.08,
        ease: 'none',
        scrollTrigger: {
          trigger: '#proof',
          start: 'top center',
          end: 'bottom center',
          scrub: true,
        },
      },
    );
  }, { scope: mainRef });

  return (
    <main
      ref={mainRef}
      style={{
        '--bg-cyan-intensity': '0.04',
        '--bg-amber-intensity': '0.02',
      } as React.CSSProperties}
    >
      <HeroSection />
      <Navigation />
      <OneEightTrillionAnchor />
      <ToolRevealSection />
      <div className="section-divider" />
      <ProofSection />
    </main>
  );
}
