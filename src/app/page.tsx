'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CalculatorTeaserSection from '@/components/calculator/CalculatorTeaserSection';
import HeroSection from '@/components/hero/HeroSection';
import Navigation from '@/components/nav/Navigation';
import ProofSection from '@/components/proof/ProofSection';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Navigation />
      <CalculatorTeaserSection />
      <div className="section-divider" />
      <ProofSection />
    </main>
  );
}
