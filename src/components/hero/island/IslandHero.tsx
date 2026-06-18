'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CircleDot, Layers, Radio, type LucideIcon } from 'lucide-react';
import usePrefersReducedMotion from '@/lib/usePrefersReducedMotion';
import {
  DEFAULT_WELLFI_VIEW,
  isWellFiViewId,
  type WellFiViewId,
} from '@/lib/island/wellPath';
import WellFiLogo from '@/components/ui/WellFiLogo';
import IslandCanvas from './IslandCanvas';
import TelemetryReadout, { type TelemetryState } from './TelemetryReadout';

const PROOF_CHIPS = ['130+ Installed Globally', 'Modbus Ready', 'Seamless Install'];
const HERO_VIEW_QUERY = 'heroView';

const HERO_VIEW_OPTIONS: {
  id: WellFiViewId;
  label: string;
  ariaLabel: string;
  Icon: LucideIcon;
}[] = [
  {
    id: 'below-pump',
    label: 'Below pump',
    ariaLabel: 'Show WellFi installed below the pump',
    Icon: CircleDot,
  },
  {
    id: 'outside-intermediate',
    label: 'Outside shoe',
    ariaLabel: 'Show WellFi outside the intermediate casing shoe',
    Icon: Radio,
  },
  {
    id: 'dual-wellfi',
    label: 'Dual WellFi',
    ariaLabel: 'Show dual WellFi tools in the wellbore',
    Icon: Layers,
  },
];

function useCompactViewport(): boolean {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return compact;
}

function useForceMotionOverride(): boolean {
  const [forceMotion, setForceMotion] = useState(false);

  useEffect(() => {
    const update = () => {
      const params = new URLSearchParams(window.location.search);
      setForceMotion(params.get('motion') === 'force');
    };

    update();
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

  return forceMotion;
}

function useHeroTimeOverride(): number | null {
  const [heroTime, setHeroTime] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get('heroT');
      if (raw === null) {
        setHeroTime(null);
        return;
      }
      const value = Number(raw);
      setHeroTime(Number.isFinite(value) ? value : null);
    };

    update();
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

  return heroTime;
}

function useHeroView(): [WellFiViewId, (nextView: WellFiViewId) => void] {
  const [view, setView] = useState<WellFiViewId>(DEFAULT_WELLFI_VIEW);

  useEffect(() => {
    const update = () => {
      const params = new URLSearchParams(window.location.search);
      const nextView = params.get(HERO_VIEW_QUERY);
      setView(isWellFiViewId(nextView) ? nextView : DEFAULT_WELLFI_VIEW);
    };

    update();
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

  const selectView = useCallback((nextView: WellFiViewId) => {
    setView(nextView);

    const url = new URL(window.location.href);
    if (nextView === DEFAULT_WELLFI_VIEW) {
      url.searchParams.delete(HERO_VIEW_QUERY);
    } else {
      url.searchParams.set(HERO_VIEW_QUERY, nextView);
    }
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  return [view, selectView];
}

function HeroViewSwitcher({
  view,
  onViewChange,
}: {
  view: WellFiViewId;
  onViewChange: (nextView: WellFiViewId) => void;
}) {
  return (
    <div
      className="w-full max-w-[22rem] rounded-lg border border-[#1F2937] bg-[rgba(2,8,14,0.68)] p-2 shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:w-auto"
      aria-label="Hero WellFi placement"
    >
      <div
        className="mb-2 px-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#7FA1B3]"
        style={{ fontFamily: 'var(--font-mono), monospace' }}
      >
        Placement
      </div>
      <div className="grid grid-cols-3 gap-1">
        {HERO_VIEW_OPTIONS.map(({ id, label, ariaLabel, Icon }) => {
          const active = id === view;
          return (
            <button
              key={id}
              type="button"
              data-hero-view-button={id}
              aria-label={ariaLabel}
              aria-pressed={active}
              onClick={() => onViewChange(id)}
              className={[
                'flex min-h-12 min-w-0 items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-[0.68rem] font-semibold uppercase leading-tight transition-colors',
                active
                  ? 'border-[#22D3EE]/70 bg-[#06B6D4] text-[#04141a] shadow-[0_0_20px_rgba(34,211,238,0.18)]'
                  : 'border-[#1F2937] bg-[rgba(2,4,8,0.54)] text-[#9bb5c7] hover:border-[#22D3EE]/45 hover:text-[#d3e2ec]',
              ].join(' ')}
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="min-w-0 text-center">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * IslandHero — the living diorama. Poster paints immediately (LCP + no-WebGL
 * fallback); the canvas cross-fades in when the renderer is ready.
 */
export default function IslandHero({ animationOnly = false }: { animationOnly?: boolean }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const forceMotion = useForceMotionOverride();
  const heroTime = useHeroTimeOverride();
  const [view, setHeroView] = useHeroView();
  const compact = useCompactViewport();
  const readoutRef = useRef<TelemetryState>({ intensity: 0, channel: -1 });
  const [canvasReady, setCanvasReady] = useState(false);
  const reducedMotion = forceMotion ? false : prefersReducedMotion;

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
          reducedMotion={reducedMotion}
          compact={compact}
          forcedTime={heroTime}
          view={view}
          readoutRef={readoutRef}
          onReady={() => setCanvasReady(true)}
        />
      </div>

      <TelemetryReadout readoutRef={readoutRef} compact={compact} />

      {/* Bottom fade into the next section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[16%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(2,7,14,0.92)_100%)]"
        style={{ display: animationOnly ? 'none' : undefined }}
      />

      {/* Overlay UI */}
      <div
        className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[96rem] flex-col px-6 pt-10 sm:px-10 sm:pt-14 lg:px-12 lg:pt-16"
        style={{ display: animationOnly ? 'none' : undefined }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="pointer-events-auto">
            <WellFiLogo
              interactiveSignal
              wordmarkColor="#d3e2ec"
              signalColor="#ef4444"
              className="w-[10rem] sm:w-[12rem] lg:w-[14rem]"
            />
          </div>

          <div className="pointer-events-auto">
            <HeroViewSwitcher view={view} onViewChange={setHeroView} />
          </div>
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
