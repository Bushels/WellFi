'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Activity,
  Gauge,
  SlidersHorizontal,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { workflow } from '@/lib/content';
import { animation, spacing } from '@/lib/design-tokens';
import GlassPanel from '@/components/ui/GlassPanel';

gsap.registerPlugin(ScrollTrigger);

const iconMap: LucideIcon[] = [
  Wrench,
  Activity,
  Gauge,
  SlidersHorizontal,
  TrendingUp,
];

export default function ScadaSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    gsap.fromTo(
      sectionRef.current.querySelectorAll('.workflow-copy, .flow-node'),
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: animation.entrance.duration,
        ease: animation.entrance.ease,
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
        },
      },
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="workflow"
      className="relative"
      style={{ padding: `${spacing.sectionY} ${spacing.containerX}` }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <div className="workflow-copy">
          <p className="label-text mb-4">{workflow.eyebrow}</p>
          <h2 className="display-heading mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            {workflow.title}
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-text-secondary">
            {workflow.description}
          </p>

          <GlassPanel glow className="mt-8 p-6 md:p-7">
            <p className="label-text mb-2">{workflow.asideTitle}</p>
            <p className="text-sm leading-7 text-text-secondary">
              {workflow.asideBody}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {workflow.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-text-secondary"
                >
                  {chip}
                </span>
              ))}
            </div>
          </GlassPanel>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {workflow.flow.map((step, index) => {
            const Icon = iconMap[index] ?? Activity;

            return (
              <GlassPanel
                key={step}
                hover
                className="flow-node relative flex min-h-[220px] flex-col justify-between overflow-hidden p-5"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-em-cyan/80 to-transparent" />

                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-em-cyan/20 bg-em-cyan/10 text-em-glow">
                    <Icon size={22} strokeWidth={1.6} />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary">
                    0{index + 1}
                  </span>
                </div>

                <div className="mt-8">
                  <p className="label-text mb-2">Workflow step</p>
                  <h3 className="font-heading text-xl font-bold leading-snug text-text-primary">
                    {step}
                  </h3>
                </div>

                <p className="mt-6 text-sm leading-6 text-text-secondary">
                  {index === 0 && 'Use the maintenance event that is already on the calendar.'}
                  {index === 1 && 'Add WellFi into the string while the well is already open for service.'}
                  {index === 2 && 'Bring pressure data to surface without a dedicated cable run.'}
                  {index === 3 && 'Adjust speed, drawdown, and operating strategy from real conditions.'}
                  {index === 4 && 'Aim for more barrels and longer runtime from the same existing asset.'}
                </p>
              </GlassPanel>
            );
          })}
        </div>
      </div>
    </section>
  );
}
