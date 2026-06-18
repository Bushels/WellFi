'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { telemetry, type TelemetryPlacementMode } from '@/lib/content';
import TelemetryApplications from './TelemetryApplications';
import TelemetryCutawayStage from './TelemetryCutawayStage';
import TelemetryMetricRow from './TelemetryMetricRow';

gsap.registerPlugin(ScrollTrigger);

export default function TelemetryScrollytellingSection() {
  const initialModeId = telemetry.placementModes[0]?.id;
  const [activeModeId, setActiveModeId] = useState<
    TelemetryPlacementMode['id'] | undefined
  >(initialModeId);
  const activeModeRef = useRef<TelemetryPlacementMode['id'] | undefined>(initialModeId);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;

      const setMode = (activeIndex: number) => {
        const nextModeId = telemetry.placementModes[activeIndex]?.id;
        if (!nextModeId || activeModeRef.current === nextModeId) return;

        activeModeRef.current = nextModeId;
        setActiveModeId(nextModeId);
      };

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 1024px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions as {
            isDesktop: boolean;
            reduceMotion: boolean;
          };

          const stageShell = stage.querySelector('.telemetry-stage');
          if (!stageShell) return;

          const modes = section.querySelectorAll<HTMLElement>('.telemetry-mode');
          const pressureCallout = section.querySelector('.telemetry-callout-pressure');
          const hydrostaticCallout = section.querySelector('.telemetry-callout-hydrostatic');
          const fluidColumn = section.querySelector('.telemetry-fluid-column');
          const hydrostaticRing = section.querySelector('.telemetry-hydrostatic-ring');
          const leaders = section.querySelectorAll('.telemetry-leader');
          const applications = section.querySelectorAll('.telemetry-application');
          const pressureEls = [
            pressureCallout,
            ...Array.from(leaders),
          ].filter((element): element is Element => Boolean(element));
          const hydrostaticEls = [
            fluidColumn,
            hydrostaticRing,
            hydrostaticCallout,
          ].filter((element): element is Element => Boolean(element));
          const revealEls = [
            stageShell,
            ...Array.from(modes),
            pressureCallout,
            hydrostaticCallout,
            fluidColumn,
            hydrostaticRing,
            ...Array.from(leaders),
            ...Array.from(applications),
          ].filter((element): element is Element => Boolean(element));

          const resetScrollytelling = () => {
            gsap.set(revealEls, {
              autoAlpha: 1,
              y: 0,
              x: 0,
              scale: 1,
              scaleY: 1,
              filter: 'none',
            });
            setMode(0);
          };

          if (reduceMotion) {
            resetScrollytelling();
            return;
          }

          if (!isDesktop) {
            resetScrollytelling();
            return;
          }

          gsap.set(stageShell, { autoAlpha: 1, y: 0, x: 0, scale: 1 });
          gsap.set([...pressureEls, ...hydrostaticEls], { autoAlpha: 0 });
          gsap.set(applications, { autoAlpha: 0, y: 22 });

          const tl = gsap.timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: {
              trigger: stage,
              start: 'top top',
              end: '+=260%',
              pin: stage,
              scrub: 0.8,
              anticipatePin: 1,
            },
          });

          tl.addLabel('belowPump')
            .addLabel('callouts')
            .to(pressureEls, { autoAlpha: 1, duration: 0.45 }, '+=0.25')
            .addLabel('hydrostaticHead')
            .to(hydrostaticEls, { autoAlpha: 1, duration: 0.5 }, '+=0.25');

          if (fluidColumn) {
            tl.to(
              fluidColumn,
              { scaleY: 1.04, transformOrigin: '50% 100%', duration: 0.45 },
              '<',
            );
          }

          tl.addLabel('behindCasing', '+=0.45')
            .to(stageShell, { x: -18, duration: 0.6 }, 'behindCasing')
            .addLabel('dualWellfi', '+=0.55')
            .to(stageShell, { x: 18, duration: 0.6 }, 'dualWellfi')
            .addLabel('formation')
            .to(stageShell, { y: -24, scale: 1.025, duration: 0.7 }, '+=0.35')
            .to(
              applications,
              { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07 },
              '<0.25',
            );

          const updateActiveMode = () => {
            const time = tl.time();
            if (time >= tl.labels.dualWellfi) {
              setMode(2);
              return;
            }

            if (time >= tl.labels.behindCasing) {
              setMode(1);
              return;
            }

            setMode(0);
          };

          tl.eventCallback('onUpdate', updateActiveMode);
          updateActiveMode();
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="telemetry"
      aria-labelledby="telemetry-title"
      className="relative isolate scroll-mt-16 overflow-hidden bg-[#020408] px-4 py-[clamp(5rem,12vh,9rem)] sm:px-6 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(239,68,68,0.10),transparent_34%),radial-gradient(circle_at_12%_62%,rgba(34,211,238,0.08),transparent_26%)]"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="tech-text text-xs font-semibold uppercase tracking-[0.22em] text-em-glow">
            {telemetry.eyebrow}
          </p>
          <h2
            id="telemetry-title"
            className="mt-4 font-heading text-[clamp(2rem,4.4vw,4.5rem)] font-semibold leading-[1.02] text-text-primary"
          >
            {telemetry.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
            {telemetry.description}
          </p>
        </div>

        <div className="mt-10">
          <TelemetryMetricRow metrics={telemetry.metrics} />
        </div>
      </div>

      <div
        ref={stageRef}
        className="relative z-10 mx-auto mt-10 flex w-full max-w-7xl items-center lg:min-h-[100svh]"
      >
        <div className="w-full">
          <TelemetryCutawayStage telemetry={telemetry} activeModeId={activeModeId} />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <TelemetryApplications applications={telemetry.applications} />
      </div>
    </section>
  );
}
