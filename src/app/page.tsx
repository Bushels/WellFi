'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CalculatorTeaserSection from '@/components/calculator/CalculatorTeaserSection';
import HeroSection from '@/components/hero/HeroSection';
import Navigation from '@/components/nav/Navigation';
import HighlightsSection from '@/components/highlights/HighlightsSection';
import ToolSection from '@/components/tool/ToolSection';
import SpecsSection from '@/components/specs/SpecsSection';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Navigation />
      <CalculatorTeaserSection />
      <div className="section-divider" />
      <HighlightsSection />
      <div className="section-divider" />
      <ToolSection />
      <div className="section-divider" />
      <SpecsSection />
    </main>
  );
}
