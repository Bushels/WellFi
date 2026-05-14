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
import { animateCounter } from '@/lib/animate-counter';
import { animateTextScramble } from '@/lib/animate-text-scramble';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const iconMap: Record<string, LucideIcon> = {
  Radio,
  BatteryFull,
  Wrench,
  Gauge,
  Thermometer,
  Ruler,
};

/** Returns true for values that can be animated as counters (e.g. "150", "10,000", "5+") */
function isCountable(v: string): boolean {
  return /^[\d,]+\+?$/.test(v);
}

/** Parse a countable string into a numeric target */
function parseCountTarget(v: string): number {
  return parseFloat(v.replace(/[,+]/g, ''));
}

export default function ProofSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      // Make everything visible immediately
      gsap.set(sectionRef.current.querySelectorAll(
        '.proof-tagline, .proof-point-left, .proof-point-right, .proof-image, .proof-trust, .proof-cta'
      ), { opacity: 1, y: 0, x: 0, scale: 1, filter: 'none' });
      // Set counter values directly
      sectionRef.current.querySelectorAll('.proof-value').forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.dataset.target) htmlEl.textContent = htmlEl.dataset.target;
      });
      return;
    }

    const section = sectionRef.current;
    const { scrollReveal } = animation;

    // ── 1. Tagline text scramble ──────────────────────────────
    const taglineEl = section.querySelector('.proof-tagline') as HTMLElement;
    if (taglineEl) {
      const finalHTML = taglineEl.innerHTML;
      const finalText = taglineEl.textContent ?? '';
      taglineEl.style.opacity = '0';

      ScrollTrigger.create({
        trigger: taglineEl,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          // Temporarily replace with plain text for scramble, then restore HTML
          taglineEl.textContent = '';
          taglineEl.style.opacity = '1';
          animateTextScramble(taglineEl, finalText, { duration: 1.2 });
          // After scramble completes, restore the original HTML with the styled span
          gsap.delayedCall(1.3, () => { taglineEl.innerHTML = finalHTML; });
        },
      });
    }

    // ── 2. Center image parallax (scrub-linked) ──────────────
    gsap.to('.proof-image', {
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    // ── 2b. Bottom glow continuous pulse ─────────────────────
    gsap.to('.proof-image-glow', {
      opacity: 0.85,
      duration: 2.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // ── 3. Main entrance timeline ────────────────────────────
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
      },
    });

    // Image entrance: fade + scale
    tl.fromTo('.proof-image',
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' },
    );

    // Left proof points: slide-in + blur reveal
    tl.fromTo('.proof-point-left',
      { opacity: 0, x: -30, filter: 'blur(4px)' },
      {
        opacity: 1, x: 0, filter: 'blur(0px)',
        duration: scrollReveal.duration,
        ease: scrollReveal.ease,
        stagger: 0.1,
      },
      '-=0.5',
    );

    // Right proof points: slide-in + blur reveal
    tl.fromTo('.proof-point-right',
      { opacity: 0, x: 30, filter: 'blur(4px)' },
      {
        opacity: 1, x: 0, filter: 'blur(0px)',
        duration: scrollReveal.duration,
        ease: scrollReveal.ease,
        stagger: 0.1,
      },
      '<',
    );

    // ── 4. Icon glow flash on enter ─────────────────────────
    tl.fromTo('.proof-icon',
      { boxShadow: '0 0 0px rgba(34,211,238,0)' },
      {
        boxShadow: '0 0 16px rgba(34,211,238,0.5), 0 0 32px rgba(34,211,238,0.2)',
        duration: 0.4,
        ease: 'power1.out',
        stagger: 0.08,
      },
      '-=0.4',
    );

    // Fade the glow back after flash
    tl.to('.proof-icon', {
      boxShadow: '0 0 0px rgba(34,211,238,0)',
      duration: 0.8,
      ease: 'power1.inOut',
      stagger: 0.05,
    });

    // ── 5. Proof value counters ─────────────────────────────
    const valueEls = section.querySelectorAll('.proof-value');
    valueEls.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const raw = htmlEl.dataset.target;
      if (!raw || !isCountable(raw)) return;

      const target = parseCountTarget(raw);
      const suffix = raw.includes('+') ? '+' : '';

      tl.add(
        animateCounter(htmlEl, target, {
          duration: animation.counter.duration,
          ease: animation.counter.ease,
          suffix,
        }),
        '-=1.2', // overlap with previous animations
      );
    });

    // ── 6. Trust badge — scale + glow pulse ─────────────────
    tl.fromTo('.proof-trust',
      { opacity: 0, y: 16, scale: 0.94 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.08,
      },
      '-=0.3',
    );

    // Trust badge glow pulse
    tl.fromTo('.proof-trust-badge',
      { boxShadow: '0 0 0px rgba(34,211,238,0)' },
      {
        boxShadow: '0 0 20px rgba(34,211,238,0.25), 0 0 40px rgba(34,211,238,0.1)',
        duration: animation.glowPulse.duration,
        ease: animation.glowPulse.ease,
        yoyo: true,
        repeat: 1,
      },
    );

    // ── 7. Contact CTA — rise with border glow ──────────────
    tl.fromTo('.proof-cta',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.4',
    );

    tl.fromTo('.proof-cta',
      { boxShadow: '0 22px 80px rgba(0,0,0,0.44)' },
      {
        boxShadow: '0 22px 80px rgba(0,0,0,0.44), 0 0 30px rgba(6,182,212,0.12)',
        duration: 0.6,
        ease: 'power1.inOut',
      },
      '-=0.3',
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
        <p className="proof-tagline mb-10 text-center font-heading text-sm font-medium uppercase tracking-[0.18em] text-text-secondary">
          Data Below. <span className="text-em-glow">Insight Above.</span>
        </p>

        {/* ─── Image Spine: 3-column grid ─── */}
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_320px_1fr] lg:gap-10">
          {/* Left proof points */}
          <div className="order-2 grid grid-cols-3 gap-4 lg:order-1 lg:grid-cols-1 lg:gap-8">
            {leftPoints.map((point) => {
              const Icon = iconMap[point.icon] ?? Radio;
              const countable = isCountable(point.value);
              return (
                <div
                  key={point.label}
                  className="proof-point-left flex flex-col items-center text-center lg:flex-row lg:justify-end lg:gap-4 lg:text-right"
                >
                  <div className="order-2 mt-2 lg:order-1 lg:mt-0">
                    <div className="flex items-baseline justify-center gap-1.5 lg:justify-end">
                      <span
                        className={cn(
                          'display-heading text-[clamp(1.4rem,3vw,2.2rem)] leading-none text-text-primary',
                          countable && 'proof-value',
                        )}
                        data-target={point.value}
                      >
                        {countable ? '0' : point.value}
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
                  <div className="proof-icon order-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-em-cyan/20 bg-em-cyan/8 text-em-glow lg:order-2">
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
              <div className="proof-image-glow absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-void via-navy-void/60 to-transparent" />
            </div>
          </div>

          {/* Right proof points */}
          <div className="order-3 grid grid-cols-3 gap-4 lg:grid-cols-1 lg:gap-8">
            {rightPoints.map((point) => {
              const Icon = iconMap[point.icon] ?? Gauge;
              const countable = isCountable(point.value);
              return (
                <div
                  key={point.label}
                  className="proof-point-right flex flex-col items-center text-center lg:flex-row lg:justify-start lg:gap-4 lg:text-left"
                >
                  <div className="proof-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-em-cyan/20 bg-em-cyan/8 text-em-glow">
                    <Icon size={18} strokeWidth={1.6} />
                  </div>
                  <div className="mt-2 lg:mt-0">
                    <div className="flex items-baseline justify-center gap-1.5 lg:justify-start">
                      <span
                        className={cn(
                          'display-heading text-[clamp(1.4rem,3vw,2.2rem)] leading-none text-text-primary',
                          countable && 'proof-value',
                        )}
                        data-target={point.value}
                      >
                        {countable ? '0' : point.value}
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
          <span className="proof-trust proof-trust-badge rounded-full border border-em-cyan/20 bg-em-cyan/8 px-5 py-2 text-sm font-semibold tracking-wide text-em-glow">
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
            Downhole Pressure. Surface Decisions.
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary md:text-base md:leading-7">
            Talk with MPS Group about candidate wells, changeout timing, and deployment fit.
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
