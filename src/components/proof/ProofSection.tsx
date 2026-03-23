'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Radio,
  BatteryFull,
  Wrench,
  Gauge,
  Thermometer,
  Ruler,
  Mail,
  type LucideIcon,
} from 'lucide-react';
import { proof, footer } from '@/lib/content';
import { animation, spacing } from '@/lib/design-tokens';

gsap.registerPlugin(ScrollTrigger);

const iconMap: Record<string, LucideIcon> = {
  Radio,
  BatteryFull,
  Wrench,
  Gauge,
  Thermometer,
  Ruler,
};

export default function ProofSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    // Stagger the proof points in from the sides
    const leftPoints = sectionRef.current.querySelectorAll('.proof-point-left');
    const rightPoints = sectionRef.current.querySelectorAll('.proof-point-right');
    const image = sectionRef.current.querySelector('.proof-image');
    const trust = sectionRef.current.querySelectorAll('.proof-trust');
    const cta = sectionRef.current.querySelector('.proof-cta');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 78%',
      },
    });

    tl.fromTo(
      image,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' },
    );

    tl.fromTo(
      leftPoints,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: animation.entrance.duration,
        ease: animation.entrance.ease,
        stagger: 0.1,
      },
      '-=0.5',
    );

    tl.fromTo(
      rightPoints,
      { opacity: 0, x: 30 },
      {
        opacity: 1,
        x: 0,
        duration: animation.entrance.duration,
        ease: animation.entrance.ease,
        stagger: 0.1,
      },
      '<',
    );

    tl.fromTo(
      trust,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.08,
      },
      '-=0.2',
    );

    tl.fromTo(
      cta,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.2',
    );
  }, { scope: sectionRef });

  const leftPoints = proof.points.filter((p) => p.side === 'left');
  const rightPoints = proof.points.filter((p) => p.side === 'right');

  return (
    <section
      ref={sectionRef}
      id="proof"
      className="relative"
      style={{ padding: `${spacing.sectionY} ${spacing.containerX}` }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Section tagline */}
        <p className="mb-10 text-center font-heading text-sm font-medium uppercase tracking-[0.18em] text-text-secondary">
          Data Below. <span className="text-em-glow">Insight Above.</span>
        </p>

        {/* ─── Image Spine: 3-column grid ─── */}
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_320px_1fr] lg:gap-10">
          {/* Left proof points */}
          <div className="order-2 grid grid-cols-3 gap-4 lg:order-1 lg:grid-cols-1 lg:gap-8">
            {leftPoints.map((point) => {
              const Icon = iconMap[point.icon] ?? Radio;
              return (
                <div
                  key={point.label}
                  className="proof-point-left flex flex-col items-center text-center lg:flex-row lg:justify-end lg:gap-4 lg:text-right"
                >
                  <div className="order-2 mt-2 lg:order-1 lg:mt-0">
                    <div className="flex items-baseline justify-center gap-1.5 lg:justify-end">
                      <span className="display-heading text-[clamp(1.4rem,3vw,2.2rem)] leading-none text-text-primary">
                        {point.value}
                      </span>
                      {point.unit && (
                        <span className="tech-text text-xs uppercase tracking-[0.14em] text-em-glow">
                          {point.unit}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-text-secondary">
                      {point.label}
                    </p>
                  </div>
                  <div className="order-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-em-cyan/20 bg-em-cyan/8 text-em-glow lg:order-2">
                    <Icon size={18} strokeWidth={1.6} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center image */}
          <div className="proof-image order-1 mx-auto w-full max-w-[280px] lg:order-2 lg:max-w-none">
            <div className="relative aspect-[9/16] overflow-hidden rounded-[2rem]">
              <Image
                src="/images/wellfi-signal-dark.jpeg"
                alt="WellFi electromagnetic signal visualization on black background"
                fill
                sizes="(min-width: 1024px) 320px, 280px"
                className="object-cover object-[center_60%]"
                priority
              />
              {/* Bottom glow blend */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-void via-navy-void/60 to-transparent" />
            </div>
          </div>

          {/* Right proof points */}
          <div className="order-3 grid grid-cols-3 gap-4 lg:grid-cols-1 lg:gap-8">
            {rightPoints.map((point) => {
              const Icon = iconMap[point.icon] ?? Gauge;
              return (
                <div
                  key={point.label}
                  className="proof-point-right flex flex-col items-center text-center lg:flex-row lg:justify-start lg:gap-4 lg:text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-em-cyan/20 bg-em-cyan/8 text-em-glow">
                    <Icon size={18} strokeWidth={1.6} />
                  </div>
                  <div className="mt-2 lg:mt-0">
                    <div className="flex items-baseline justify-center gap-1.5 lg:justify-start">
                      <span className="display-heading text-[clamp(1.4rem,3vw,2.2rem)] leading-none text-text-primary">
                        {point.value}
                      </span>
                      {point.unit && (
                        <span className="tech-text text-xs uppercase tracking-[0.14em] text-em-glow">
                          {point.unit}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-text-secondary">
                      {point.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Trust strip ─── */}
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <span className="proof-trust rounded-full border border-em-cyan/20 bg-em-cyan/8 px-5 py-2 text-sm font-semibold tracking-wide text-em-glow">
            {proof.trustLine}
          </span>
          <p className="proof-trust text-sm text-text-secondary">
            {proof.trustSub}
          </p>
        </div>

        {/* ─── Contact CTA ─── */}
        <div
          id="contact"
          className="proof-cta mx-auto mt-14 max-w-2xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,34,0.92)_0%,rgba(24,30,42,0.94)_100%)] p-8 text-center shadow-[0_22px_80px_rgba(0,0,0,0.44)]"
        >
          <Image
            src="/images/wellfi-logo-v3-transparent.png"
            alt="WellFi"
            width={180}
            height={98}
            className="mx-auto mb-6 h-auto w-[120px] md:w-[160px]"
          />

          <h3 className="display-heading text-[clamp(1.4rem,2.8vw,2rem)] text-text-primary">
            Improve Your Wells
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary md:text-base md:leading-7">
            Reach out to us today
          </p>

          <a
            href={`mailto:${footer.email}`}
            className="btn-primary mt-6 inline-flex items-center gap-2 text-base"
          >
            <Mail size={18} />
            Contact Us
          </a>

          <div className="mt-8 border-t border-white/8 pt-5">
            <p className="text-xs text-text-secondary">{footer.copyright}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
