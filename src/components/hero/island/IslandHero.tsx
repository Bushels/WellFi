'use client';

import { useEffect, useState } from 'react';
import usePrefersReducedMotion from '@/lib/usePrefersReducedMotion';
import WellFiLogo from '@/components/ui/WellFiLogo';
import IslandCanvas from './IslandCanvas';

const PROOF_CHIPS = ['130+ Installed Globally', 'Modbus Ready', 'Seamless Install'];

function useCompactViewport(): boolean {
  const [compact, setCompact] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false,
  );
  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return compact;
}

/**
 * IslandHero — the living diorama. Poster paints immediately (LCP + no-WebGL
 * fallback); the canvas cross-fades in when the renderer is ready.
 */
export default function IslandHero() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const compact = useCompactViewport();
  const [canvasReady, setCanvasReady] = useState(false);

  return (
    <section
      id="hero"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#020408] text-white"
    >
      {/* Poster = a still of this very scene, so the poster→canvas crossfade is invisible. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- raw img matches the repo's basePath'd-asset convention; fetchPriority makes it the LCP */}
      <img
        aria-hidden="true"
        src="/wellfi/hero-island-poster.webp"
        alt=""
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover motion-safe:transition-opacity motion-safe:duration-[1200ms]"
        style={{ opacity: canvasReady ? 0 : 1 }}
      />

      {/* Live canvas — fades in over the poster */}
      <div
        aria-hidden="true"
        className="absolute inset-0 motion-safe:transition-opacity motion-safe:duration-[1200ms]"
        style={{ opacity: canvasReady ? 1 : 0 }}
      >
        <IslandCanvas
          reducedMotion={prefersReducedMotion}
          compact={compact}
          onReady={() => setCanvasReady(true)}
        />
      </div>

      {/* Bottom fade into the next section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[16%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(2,7,14,0.92)_100%)]"
      />

      {/* Overlay UI */}
      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[96rem] flex-col px-6 pt-10 sm:px-10 sm:pt-14 lg:px-12 lg:pt-16">
        <div className="pointer-events-auto">
          <WellFiLogo
            interactiveSignal
            wordmarkColor="#d3e2ec"
            signalColor="#ef4444"
            className="w-[10rem] sm:w-[12rem] lg:w-[14rem]"
          />
        </div>

        <div className="flex-1" />

        <div className="max-w-xl pb-12 sm:pb-16 lg:pb-20">
          <h1
            className="text-4xl leading-tight sm:text-5xl lg:text-6xl"
            style={{ fontFamily: 'var(--font-heading), system-ui, sans-serif' }}
          >
            Know the Unknown
          </h1>
          <p className="mt-3 text-base text-[#9bb5c7] sm:text-lg">
            Real-Time Wireless Telemetry Tool
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {PROOF_CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[#1F2937] bg-[rgba(2,4,8,0.6)] px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] text-[#9CA3AF]"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                {chip}
              </span>
            ))}
          </div>
          <a
            href="mailto:kylegronning@mpsgroup.ca?subject=WellFi%20Quote%20Request"
            className="pointer-events-auto mt-7 inline-block rounded-md bg-[#06B6D4] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#04141a] transition-colors hover:bg-[#22D3EE]"
          >
            Request a Quote
          </a>
        </div>

        <div className="flex items-center justify-center pb-8">
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
