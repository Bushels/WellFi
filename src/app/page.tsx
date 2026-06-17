'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import IslandHero from '@/components/hero/island/IslandHero';
import Navigation from '@/components/nav/Navigation';
import OneEightTrillionAnchor from '@/components/anchor/OneEightTrillionAnchor';
import SagdPresentationSection from '@/components/sagd-presentation/SagdPresentationSection';
// Tool closeup image hidden 2026-05-22 — requested to be removed as incorrect.
// import ToolRevealSection from '@/components/reveal/ToolRevealSection';
import ProofSection from '@/components/proof/ProofSection';
// Calculator hidden 2026-05-09 — pivoted to curiosity-driven page.
// Restore when ROI numbers are locked.
// import CalculatorTeaserSection from '@/components/calculator/CalculatorTeaserSection';
//
// CuriosityHintSection was retired 2026-06-10 along with HeroSection — its
// cursor-flashlight role is superseded by the IslandHero living diorama.
// import CuriosityHintSection from '@/components/hint/CuriosityHintSection';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const main = mainRef.current;
    if (!main) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const sectionDividers = main.querySelectorAll('.section-divider');
    const anchor = main.querySelector('#anchor');
    const proof = main.querySelector('#proof');

    // Section divider — grows from center on scroll approach
    sectionDividers.forEach((divider) => {
      gsap.fromTo(divider,
        { opacity: 0, maxWidth: '0%' },
        {
          opacity: 1,
          maxWidth: '80%',
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: divider,
            start: 'top 90%',
          },
        },
      );
    });

    // Background gradient shift — scroll-linked color temperature
    if (anchor) {
      gsap.fromTo(main,
        { '--bg-red-intensity': 0.04, '--bg-amber-intensity': 0.02 },
        {
          '--bg-red-intensity': 0.12,
          '--bg-amber-intensity': 0.03,
          ease: 'none',
          scrollTrigger: {
            trigger: anchor,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
          },
        },
      );
    }

    // Warmer shift near proof section
    if (proof) {
      gsap.fromTo(main,
        { '--bg-red-intensity': 0.12, '--bg-amber-intensity': 0.03 },
        {
          '--bg-red-intensity': 0.06,
          '--bg-amber-intensity': 0.08,
          ease: 'none',
          scrollTrigger: {
            trigger: proof,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
          },
        },
      );
    }
  }, { scope: mainRef });

  return (
    <main
      ref={mainRef}
      style={{
        '--bg-red-intensity': '0.04',
        '--bg-amber-intensity': '0.02',
      } as React.CSSProperties}
    >
      <IslandHero />
      <Navigation />
      <OneEightTrillionAnchor />
      {/* Hidden 2026-05-22 — requested to be removed as incorrect: <ToolRevealSection /> */}
      <div className="section-divider" />
      <SagdPresentationSection />
      <div className="section-divider" />
      <ProofSection />
    </main>
  );
}
