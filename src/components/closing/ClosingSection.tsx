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
  Droplet,
  Droplets,
  Flame,
  type LucideIcon,
} from 'lucide-react';
import { proof, specs, footer } from '@/lib/content';
import { animation, spacing } from '@/lib/design-tokens';
import { animateCounter } from '@/lib/animate-counter';
import { animateTextScramble } from '@/lib/animate-text-scramble';
import { cn } from '@/lib/utils';
import WellFiLogo from '@/components/ui/WellFiLogo';

gsap.registerPlugin(ScrollTrigger);

const iconMap: Record<string, LucideIcon> = {
  Radio,
  BatteryFull,
  Wrench,
  Gauge,
  Thermometer,
  Ruler,
  Droplet,
  Droplets,
  Flame,
};

/** The deeper spec rows — the ones NOT already surfaced as headline stat counters. */
const DEEP_SPEC_PARAMS = [
  'Pressure Accuracy',
  'Data Output',
  'WellFi Access Point (WAP)',
  'Power',
  'Storage',
];
const deepSpecs = DEEP_SPEC_PARAMS
  .map((p) => specs.find((s) => s.parameter === p))
  .filter((s): s is (typeof specs)[number] => Boolean(s));

/** True for values that can animate as counters (e.g. "150", "10,000", "5+"). */
function isCountable(v: string): boolean {
  return /^[\d,]+\+?$/.test(v);
}
function parseCountTarget(v: string): number {
  return parseFloat(v.replace(/[,+]/g, ''));
}

export default function ClosingSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        gsap.set(
          root.querySelectorAll(
            '.closing-head, .closing-device, .closing-stat, .closing-spec, .closing-trust, .closing-cta',
          ),
          { opacity: 1, x: 0, y: 0, scale: 1, filter: 'none' },
        );
        root.querySelectorAll('.closing-value, .closing-value-scramble').forEach((el) => {
          const h = el as HTMLElement;
          if (h.dataset.target) h.textContent = h.dataset.target;
        });
        return;
      }

      const { scrollReveal } = animation;

      // ── Header reveal ───────────────────────────────────────
      gsap.fromTo(
        '.closing-head',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: scrollReveal.duration,
          ease: scrollReveal.ease,
          scrollTrigger: { trigger: root, start: 'top 80%' },
        },
      );

      // ── Device rail: fade/scale in + gentle scrub parallax ──
      gsap.fromTo(
        '.closing-device',
        { opacity: 0, scale: 0.96, y: 24 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.closing-device', start: 'top 82%' },
        },
      );
      gsap.to('.closing-device-img', {
        y: -22,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      // Sensor halo breathing pulse
      gsap.to('.closing-device-glow', {
        opacity: 0.85,
        scale: 1.08,
        duration: 2.6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      // ── Stats: stagger in, glow-flash icons, then count up ──
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.closing-stats', start: 'top 80%' } });

      tl.fromTo(
        '.closing-stat',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.07 },
      );
      tl.fromTo(
        '.closing-icon',
        { boxShadow: '0 0 0px rgba(248,113,113,0)' },
        {
          boxShadow: '0 0 16px rgba(248,113,113,0.5), 0 0 32px rgba(239,68,68,0.2)',
          duration: 0.4,
          ease: 'power1.out',
          stagger: 0.06,
        },
        '-=0.4',
      );
      tl.to('.closing-icon', {
        boxShadow: '0 0 0px rgba(248,113,113,0)',
        duration: 0.7,
        ease: 'power1.inOut',
        stagger: 0.04,
      });

      root.querySelectorAll('.closing-value').forEach((el) => {
        const h = el as HTMLElement;
        const raw = h.dataset.target;
        if (!raw || !isCountable(raw)) return;
        tl.add(
          animateCounter(h, parseCountTarget(raw), {
            duration: animation.counter.duration,
            ease: animation.counter.ease,
            suffix: raw.includes('+') ? '+' : '',
          }),
          '-=1.0',
        );
      });
      root.querySelectorAll('.closing-value-scramble').forEach((el) => {
        const h = el as HTMLElement;
        const finalText = h.dataset.target ?? h.textContent ?? '';
        h.textContent = '';
        tl.add(animateTextScramble(h, finalText, { duration: 0.9 }), '-=0.8');
      });

      // ── Full-spec cards ─────────────────────────────────────
      gsap.fromTo(
        '.closing-spec',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.06,
          scrollTrigger: { trigger: '.closing-specs', start: 'top 85%' },
        },
      );

      // ── Trust strip ─────────────────────────────────────────
      gsap.fromTo(
        '.closing-trust',
        { opacity: 0, y: 16, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: { trigger: '.closing-trust', start: 'top 88%' },
        },
      );

      // ── Contact CTA ─────────────────────────────────────────
      gsap.fromTo(
        '.closing-cta',
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.closing-cta', start: 'top 86%' },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="proof"
      className="relative isolate overflow-hidden bg-section-alt border-t border-white/5"
      style={{ padding: `${spacing.sectionY} ${spacing.containerX}` }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-red-500/5 blur-[140px]"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* ── Header ── */}
        <div className="closing-head mx-auto max-w-3xl text-center">
          {proof.eyebrow && (
            <span className="label-text tech-text text-xs font-semibold uppercase tracking-widest text-em-glow">
              {proof.eyebrow}
            </span>
          )}
          <h2 className="display-heading text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] text-text-primary">
            {proof.headline}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary md:text-lg">
            {proof.intro}
          </p>
          {/* Applications WellFi serves */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            {proof.applications.map((app) => {
              const Icon = iconMap[app.icon] ?? Droplet;
              return (
                <span
                  key={app.label}
                  className="inline-flex items-center gap-2 rounded-full border border-em-cyan/20 bg-em-cyan/[0.06] px-4 py-2 text-sm font-medium text-text-secondary"
                >
                  <Icon size={16} strokeWidth={1.7} className="text-em-glow" aria-hidden="true" />
                  {app.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── Device banner (full-width, horizontal tool in cutaway tubing) ── */}
        <div className="closing-device relative mt-14 flex items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/8 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.08),transparent_64%)] px-4 py-6 lg:mt-16">
          <div
            aria-hidden="true"
            className="closing-device-glow pointer-events-none absolute left-1/2 top-1/2 h-40 w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-em-glow/15 blur-[60px] opacity-60"
          />
          <Image
            src="/wellfi/images/wellfi-internal-ghost.webp"
            alt="The WellFi deployed inside the production tubing — housing ghosted to reveal the EM isolator collar and internal sensor"
            width={1800}
            height={1120}
            priority
            className="closing-device-img relative z-10 h-auto w-full max-w-3xl object-contain drop-shadow-[0_14px_40px_rgba(0,0,0,0.5)]"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, #000 11%, #000 89%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 11%, #000 89%, transparent 100%)',
            }}
          />
        </div>

        {/* ── Stats + full specs (full width below the banner) ── */}
        <div className="mt-10 flex flex-col gap-9">
            {/* Headline stat counters */}
            <div className="closing-stats grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {proof.points.map((point) => {
                const Icon = iconMap[point.icon] ?? Radio;
                const countable = isCountable(point.value);
                return (
                  <div
                    key={point.label}
                    className="closing-stat flex flex-col gap-2.5 rounded-xl border border-white/8 bg-white/[0.025] p-3.5"
                  >
                    <span className="closing-icon flex h-9 w-9 items-center justify-center rounded-lg border border-em-cyan/20 bg-em-cyan/8 text-em-glow">
                      <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={cn(
                            'display-heading text-2xl leading-none text-text-primary',
                            countable ? 'closing-value' : 'closing-value-scramble',
                          )}
                          data-target={point.value}
                        >
                          {countable ? '0' : point.value}
                        </span>
                        {point.unit && (
                          <span className="tech-text text-[0.7rem] uppercase tracking-[0.12em] text-em-glow">
                            {point.unit}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs leading-snug text-text-secondary">{point.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full specifications */}
            <div className="closing-specs">
              <p className="label-text mb-4">Full specifications</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {deepSpecs.map((row) => (
                  <div
                    key={row.parameter}
                    className="closing-spec rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5"
                  >
                    <p className="label-text mb-1.5">{row.parameter}</p>
                    <p className="tech-text text-sm leading-6 text-[#f2f6fb]">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* ── Trust strip ── */}
        <div className="mt-14 flex flex-col items-center gap-2 text-center">
          <span className="closing-trust rounded-full border border-em-cyan/20 bg-em-cyan/8 px-5 py-2 text-sm font-semibold tracking-wide text-em-glow">
            {proof.trustLine}
          </span>
          <p className="closing-trust text-sm text-text-secondary">{proof.trustSub}</p>
        </div>

        {/* ── Contact CTA ── */}
        <div
          id="contact"
          className="closing-cta mx-auto mt-14 max-w-3xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,34,0.92)_0%,rgba(24,30,42,0.94)_100%)] p-8 text-center shadow-[0_22px_80px_rgba(0,0,0,0.44)] sm:p-10"
        >
          <WellFiLogo className="mx-auto mb-6 h-7 w-auto opacity-40" />

          <h3 className="display-heading text-[clamp(1.6rem,3vw,2.6rem)] leading-[1.05] text-text-primary">
            {proof.ctaHeading}
          </h3>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-text-secondary">
            {proof.ctaBody}
          </p>

          <a
            href={`mailto:${footer.email}`}
            className="btn-primary mt-8 inline-flex items-center gap-2 text-base"
          >
            <Mail size={18} aria-hidden="true" />
            Email Our Team
          </a>

          {/* Visible address fallback — if no default mail client is set, the
              button does nothing, so the address must be readable/copyable here. */}
          <p className="mt-4 text-sm text-text-secondary">
            or reach us directly at{' '}
            <a
              href={`mailto:${footer.email}`}
              className="select-all font-medium text-em-glow underline decoration-em-cyan/40 underline-offset-2 transition-colors hover:text-text-primary"
            >
              {footer.email}
            </a>
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {proof.ctaChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-text-secondary"
              >
                {chip}
              </span>
            ))}
          </div>

          <p className="mt-10 font-heading text-[clamp(1.25rem,2.4vw,1.9rem)] font-semibold leading-tight tracking-[-0.01em] text-text-primary">
            Know the <span className="text-em-glow">Unknown</span> — One Changeout Away.
          </p>

          <div className="mt-6 border-t border-white/8 pt-5">
            <p className="text-xs text-text-secondary/50">
              {footer.distributor} · {footer.copyright}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
