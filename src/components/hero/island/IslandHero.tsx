'use client';

import { useEffect, useState } from 'react';
import usePrefersReducedMotion from '@/lib/usePrefersReducedMotion';
import WellFiLogo from '@/components/ui/WellFiLogo';
import IslandCanvas from './IslandCanvas';

const PROOF_CHIPS = ['130+ Installed Internationally', 'Modbus Ready', 'Rapid Deployment'];

const CONTACT_EMAIL = 'kylegronning@mpsgroup.ca';
const EMBED_READY = 'wellfi:r3f-ready';
const EMBED_ACTIVITY = 'wellfi:set-active';
const EMBED_HANDOFF_MS = 1300;

function trustedYotinOrigin(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.origin !== value) return null;

    const publicYotin =
      url.protocol === 'https:' &&
      ['yotinenergy.com', 'www.yotinenergy.com', 'yotin-energy.vercel.app'].includes(url.hostname);
    const localYotin =
      url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname);

    return publicYotin || localYotin ? url.origin : null;
  } catch {
    return null;
  }
}

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

function useYotinEmbed(canvasReady: boolean): { embedded: boolean; active: boolean } {
  const [parentOrigin, setParentOrigin] = useState<string | null>(null);
  const [embedded, setEmbedded] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const update = () => {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get('embed') === 'yotin';
      const trustedOrigin = requested ? trustedYotinOrigin(params.get('parentOrigin')) : null;

      setEmbedded(Boolean(trustedOrigin));
      setParentOrigin(trustedOrigin);
    };

    update();
  }, []);

  useEffect(() => {
    if (!embedded || !parentOrigin) return;

    const receiveParentMessage = (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin !== parentOrigin) return;
      if (event.data?.type !== EMBED_ACTIVITY) return;
      setActive(event.data.active !== false);
    };

    window.addEventListener('message', receiveParentMessage);
    return () => window.removeEventListener('message', receiveParentMessage);
  }, [embedded, parentOrigin]);

  useEffect(() => {
    if (!embedded || !parentOrigin || !canvasReady) return;

    let repeatId = 0;
    let stopId = 0;
    const sendReady = () => {
      window.parent.postMessage({ type: EMBED_READY, version: 1 }, parentOrigin);
    };
    const handoffId = window.setTimeout(() => {
      sendReady();
      repeatId = window.setInterval(sendReady, 500);
      stopId = window.setTimeout(() => window.clearInterval(repeatId), 5000);
    }, EMBED_HANDOFF_MS);

    return () => {
      window.clearTimeout(handoffId);
      window.clearInterval(repeatId);
      window.clearTimeout(stopId);
    };
  }, [canvasReady, embedded, parentOrigin]);

  return { embedded, active };
}

/**
 * IslandHero — the living diorama. Poster paints immediately (LCP + no-WebGL
 * fallback); the canvas cross-fades in when the renderer is ready.
 */
export default function IslandHero({ animationOnly = false }: { animationOnly?: boolean }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const forceMotion = useForceMotionOverride();
  const heroTime = useHeroTimeOverride();
  const compact = useCompactViewport();
  const [canvasReady, setCanvasReady] = useState(false);
  const reducedMotion = forceMotion ? false : prefersReducedMotion;
  const yotinEmbed = useYotinEmbed(canvasReady);

  return (
    <section
      id="hero"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#020408] text-white"
      data-yotin-embed={yotinEmbed.embedded ? '' : undefined}
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
          active={yotinEmbed.active}
          maxDpr={yotinEmbed.embedded ? 1.35 : undefined}
          onReady={() => setCanvasReady(true)}
        />
      </div>

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
            href={`mailto:${CONTACT_EMAIL}?subject=WellFi%20Quote%20Request`}
            className="pointer-events-auto mt-7 inline-block rounded-md bg-[#06B6D4] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#04141a] transition-colors hover:bg-[#22D3EE]"
          >
            Request a Quote
          </a>
          {/* Visible address fallback for users without a default mail client. */}
          <p className="pointer-events-auto mt-3 text-sm text-[#9bb5c7]">
            or email{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="select-all font-medium text-[#22D3EE] underline underline-offset-2 transition-colors hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>

        <div className="hidden">
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
