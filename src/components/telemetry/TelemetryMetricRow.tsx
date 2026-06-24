'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Activity,
  Droplets,
  Gauge,
  Thermometer,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { TelemetryMetric } from '@/lib/content';
import { animation } from '@/lib/design-tokens';

gsap.registerPlugin(ScrollTrigger);

const iconMap: Record<string, LucideIcon> = {
  Activity,
  Droplets,
  Gauge,
  Thermometer,
  TrendingUp,
};

interface TelemetryMetricRowProps {
  metrics: TelemetryMetric[];
}

export default function TelemetryMetricRow({ metrics }: TelemetryMetricRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rowRef.current;
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>('.telemetry-metric', root);
      const sweeps = gsap.utils.toArray<HTMLElement>('.telemetry-metric-sweep', root);
      const icons = gsap.utils.toArray<HTMLElement>('.telemetry-metric-icon', root);

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        // Skip motion — render the channels in their resting, "locked" state.
        gsap.set(cards, { opacity: 1, y: 0 });
        gsap.set(sweeps, { scaleX: 1, opacity: 1 });
        gsap.set(icons, { boxShadow: 'none' });
        return;
      }

      const { stagger } = animation;
      const { duration, ease } = animation.entrance;

      // Resting state of the accent hairline before it "acquires."
      gsap.set(sweeps, { scaleX: 0, transformOrigin: 'left center', opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 80%', once: true },
      });

      // 1. Channels power up — staggered rise, left to right.
      tl.fromTo(
        cards,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration, ease, stagger },
      );

      // 2. Each channel's hairline sweeps across as it locks on.
      tl.to(
        sweeps,
        { scaleX: 1, opacity: 1, duration: 0.55, ease: 'power2.out', stagger },
        // Overlap the sweep with the card reveal so it reads as one "acquire" motion.
        `-=${duration - stagger}`,
      );

      // 3. A brief glow pulse on the icon chip as the signal confirms.
      tl.fromTo(
        icons,
        { boxShadow: '0 0 0 0 rgba(248,113,113,0)' },
        {
          boxShadow: '0 0 18px 1px rgba(248,113,113,0.45)',
          duration: 0.45,
          ease: 'power2.out',
          stagger,
          yoyo: true,
          repeat: 1,
        },
        `<`,
      );
    },
    { scope: rowRef },
  );

  return (
    <div
      ref={rowRef}
      className="telemetry-metric-row grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
    >
      {metrics.map((metric, index) => {
        const Icon = iconMap[metric.icon] ?? Gauge;
        return (
          <div
            key={metric.label}
            className="telemetry-metric group relative min-h-[9.75rem] overflow-hidden rounded-md border border-white/10 bg-[linear-gradient(180deg,rgba(13,20,31,0.92),rgba(5,9,15,0.96))] p-3 shadow-[0_18px_70px_rgba(0,0,0,0.24)] transition-transform duration-300 ease-out hover:-translate-y-1 sm:min-h-[11.5rem] sm:p-4"
          >
            <div
              aria-hidden="true"
              className="telemetry-metric-sweep absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(248,113,113,0),rgba(248,113,113,0.78),rgba(34,211,238,0.28),rgba(248,113,113,0))]"
            />
            <div
              aria-hidden="true"
              className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-em-glow/8 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
            />

            <div className="flex items-start justify-between gap-3">
              <div className="telemetry-metric-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-em-glow/25 bg-em-glow/8 text-em-glow sm:h-10 sm:w-10">
                <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <span className="tech-text rounded-sm border border-white/8 bg-white/[0.035] px-2 py-1 text-[0.58rem] uppercase tracking-[0.16em] text-text-muted">
                CH-{String(index + 1).padStart(2, '0')}
              </span>
            </div>

            <h3 className="mt-4 font-heading text-sm font-semibold text-text-primary sm:mt-5 sm:text-base">
              {metric.label}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary sm:text-sm">
              {metric.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
