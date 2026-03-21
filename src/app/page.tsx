'use client';

import { useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GenesisOverlay from '@/components/genesis/GenesisOverlay';
import HeroSection from '@/components/hero/HeroSection';
import Navigation from '@/components/nav/Navigation';
import HighlightsSection from '@/components/highlights/HighlightsSection';
import ToolSection from '@/components/tool/ToolSection';
import SpecsSection from '@/components/specs/SpecsSection';

// Register GSAP plugins once at the page level
gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [pageRevealed, setPageRevealed] = useState(false);
  const [overlayDone, setOverlayDone] = useState(false);

  const handleRevealStart = useCallback(() => {
    setPageRevealed(true);
  }, []);

  const handleComplete = useCallback(() => {
    setOverlayDone(true);
  }, []);

  return (
    <>
      {/* Genesis wave — covers entire screen, births the page */}
      {!overlayDone && (
        <GenesisOverlay
          onRevealStart={handleRevealStart}
          onComplete={handleComplete}
        />
      )}

      {/* Page content — invisible until wave reveals it */}
      <main
        className="transition-opacity duration-1000"
        style={{ opacity: pageRevealed ? 1 : 0 }}
      >
        <HeroSection />
        <Navigation />
        <HighlightsSection />
        <div className="section-divider" />
        <ToolSection />
        <div className="section-divider" />
        <SpecsSection />
      </main>
    </>
  );
}
