'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Clock, TrendingDown, DollarSign } from 'lucide-react';
import { calculator as calculatorCopy } from '@/lib/content';
import { presets } from '@/lib/presets';
import {
  getCalculatorInputsFromPreset,
  calculateWellFiResults,
} from '@/lib/calculator';
import { animation, spacing } from '@/lib/design-tokens';
import { animateCounter } from '@/lib/animate-counter';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

/** Pre-compute results for all presets so we can show the "best" payout as the hero number. */
const presetResults = presets.map((p) => ({
  preset: p,
  results: calculateWellFiResults(getCalculatorInputsFromPreset(p)),
}));
const bestPayout = Math.min(
  ...presetResults.map((r) => r.results.payoutDays ?? Infinity),
);

export default function CalculatorTeaserSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const payoutRef = useRef<HTMLSpanElement>(null);
  const hasEnteredRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(
    presetResults.findIndex((r) => r.results.payoutDays === bestPayout),
  );
  const { results } = presetResults[activeIndex];

  const capexMax = Math.max(
    results.capexPerIncrementalBpdWellFiCad ?? 1,
    results.drillCapexPerIncrementalBpdCad ?? 1,
  );
  const wellfiBarPct = ((results.capexPerIncrementalBpdWellFiCad ?? 0) / capexMax) * 100;
  const drillBarPct = ((results.drillCapexPerIncrementalBpdCad ?? 0) / capexMax) * 100;

  /* ── Scroll-triggered entrance (plays once) ────────────────── */
  useGSAP(() => {
    if (!sectionRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      // Make everything visible immediately
      gsap.set(sectionRef.current.querySelectorAll(
        '.calc-eyebrow, .calc-word, .calc-desc, .calc-chip, .calc-payout-number, .calc-payout-label, .calc-cards-label, .calc-card, .calc-ctas'
      ), { opacity: 1, y: 0, x: 0, scale: 1, filter: 'none' });
      if (payoutRef.current) {
        payoutRef.current.textContent = String(Math.round(results.payoutDays ?? 0));
      }
      hasEnteredRef.current = true;
      return;
    }

    const section = sectionRef.current;
    const { scrollReveal, counter } = animation;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: scrollReveal.start,
        toggleActions: 'play none none none',
      },
      onComplete: () => { hasEnteredRef.current = true; },
    });

    // 1. Eyebrow
    tl.fromTo('.calc-eyebrow',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.5, ease: scrollReveal.ease },
    );

    // 2. Headline words — staggered reveal
    tl.fromTo('.calc-word',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08 },
      '-=0.2',
    );

    // 3. Gradient glow pulse after words land
    tl.fromTo('.calc-gradient-word',
      { textShadow: '0 0 0px rgba(34,211,238,0)' },
      {
        textShadow: '0 0 20px rgba(34,211,238,0.5), 0 0 40px rgba(34,211,238,0.25)',
        duration: animation.glowPulse.duration,
        ease: animation.glowPulse.ease,
        yoyo: true,
        repeat: 1,
      },
      '-=0.1',
    );

    // 4. Description
    tl.fromTo('.calc-desc',
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: scrollReveal.duration, ease: scrollReveal.ease },
      '-=0.5',
    );

    // 5. Proof chips — stagger from left
    tl.fromTo('.calc-chip',
      { opacity: 0, x: -16, scale: 0.92 },
      { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: 'back.out(1.4)', stagger: 0.1 },
      '-=0.4',
    );

    // 6. Hero payout counter
    const payoutEl = payoutRef.current;
    if (payoutEl) {
      const targetValue = Math.round(results.payoutDays ?? 0);
      tl.add(
        animateCounter(payoutEl, targetValue, {
          duration: counter.duration,
          ease: counter.ease,
        }),
        '-=0.3',
      );
    }

    // 7. Payout labels
    tl.fromTo('.calc-payout-label',
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.08 },
      '-=0.8',
    );

    // 8. Comparison bars grow from 0
    tl.to('.calc-bar-wellfi',
      { width: `${Math.max(wellfiBarPct, 4)}%`, duration: 0.8, ease: 'power2.out' },
      '-=0.5',
    );
    tl.to('.calc-bar-drill',
      { width: `${Math.max(drillBarPct, 4)}%`, duration: 0.8, ease: 'power2.out' },
      '-=0.5',
    );

    // 9. Provenance line
    tl.fromTo('.calc-provenance',
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' },
      '-=0.4',
    );

    // 10. Cards label + operator cards cascade
    tl.fromTo('.calc-cards-label',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.3',
    );

    tl.fromTo('.calc-card',
      { opacity: 0, y: 24, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.5,
        ease: 'power2.out',
        stagger: { amount: 0.4, from: 'start' },
      },
      '-=0.2',
    );

    // 11. CTA buttons
    tl.fromTo('.calc-ctas',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.2',
    );
  }, { scope: sectionRef });

  /* ── Reactive animation on card switch ─────────────────────── */
  useEffect(() => {
    if (!hasEnteredRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Animate bars to new widths
    gsap.to('.calc-bar-wellfi', {
      width: `${Math.max(wellfiBarPct, 4)}%`,
      duration: prefersReduced ? 0 : 0.6,
      ease: 'power2.out',
    });
    gsap.to('.calc-bar-drill', {
      width: `${Math.max(drillBarPct, 4)}%`,
      duration: prefersReduced ? 0 : 0.6,
      ease: 'power2.out',
    });

    // Animate counter to new value
    const payoutEl = payoutRef.current;
    if (payoutEl) {
      const targetValue = Math.round(results.payoutDays ?? 0);
      if (prefersReduced) {
        payoutEl.textContent = String(targetValue);
      } else {
        animateCounter(payoutEl, targetValue, {
          duration: 0.8,
          ease: 'power2.out',
        });
      }
    }
  }, [activeIndex, wellfiBarPct, drillBarPct, results.payoutDays]);

  return (
    <section
      ref={sectionRef}
      id="calculator"
      className="relative overflow-hidden"
      style={{ padding: `${spacing.sectionY} ${spacing.containerX}` }}
    >
      {/* Layered background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 60% 50% at 25% 0%, rgba(239,68,68,0.14), transparent)',
            'radial-gradient(ellipse 40% 60% at 85% 80%, rgba(217,119,6,0.06), transparent)',
            'linear-gradient(180deg, rgba(4,10,18,0.95) 0%, rgba(10,14,26,1) 100%)',
          ].join(', '),
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* ── IMPACT ZONE ─────────────────────────────────── */}
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="calc-eyebrow label-text mb-5">{calculatorCopy.teaserEyebrow}</p>
            <h2 className="display-heading text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.05] tracking-[-0.03em]">
              {['Data', 'Below.'].map((w) => (
                <span key={w} className="calc-word inline-block text-text-primary">{w}&nbsp;</span>
              ))}
              <br />
              {['Insight', 'Above.'].map((w) => (
                <span key={w} className="calc-word calc-gradient-word inline-block text-gradient">{w}&nbsp;</span>
              ))}
            </h2>
          </div>

          {/* Proof chips — right-aligned on desktop */}
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {calculatorCopy.teaserChips.map((chip) => (
              <span
                key={chip}
                className="calc-chip inline-flex items-center gap-1.5 rounded-full border border-em-cyan/20 bg-em-cyan/8 px-3.5 py-1.5 text-[0.8rem] font-medium text-[#FEE2E2]"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-em-cyan" />
                {chip}
              </span>
            ))}
          </div>
        </div>

        <p className="calc-desc mt-5 max-w-2xl text-[1.05rem] leading-8 text-[#a8bfce]">
          {calculatorCopy.teaserDescription}
        </p>

        {/* ── HERO NUMBER + COMPARISON ────────────────────── */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {/* Left: Hero payout number + comparison bars */}
          <div>
            <div className="flex items-baseline gap-3">
              <span
                ref={payoutRef}
                className="calc-payout-number tech-text text-[clamp(5rem,12vw,9rem)] font-bold leading-none text-text-primary"
              >
                0
              </span>
              <div>
                <span className="calc-payout-label tech-text block text-[clamp(1.4rem,3vw,2.4rem)] font-medium text-[#a8bfce]">
                  days
                </span>
                <span className="calc-payout-label tech-text block text-[0.72rem] uppercase tracking-[0.18em] text-[#FCA5A5]">
                  to full payout
                </span>
              </div>
            </div>

            {/* Comparison bars */}
            <div className="mt-8 space-y-4">
              <ComparisonRow
                label="WellFi retrofit"
                value={results.capexPerIncrementalBpdWellFiCad}
                tone="wellfi"
              />
              <ComparisonRow
                label="New drill"
                value={results.drillCapexPerIncrementalBpdCad}
                tone="drill"
              />
              <p className="text-[0.72rem] uppercase tracking-[0.15em] text-[#6b8393]">
                Capex per incremental bbl/d
              </p>
            </div>

            {/* Provenance line */}
            <p className="calc-provenance mt-6 text-xs leading-5 text-[#5a7080]">
              {calculatorCopy.provenance.aer} · {calculatorCopy.provenance.uplift.toLowerCase()}
            </p>
          </div>

          {/* Right: Operator cards */}
          <div>
            <p className="calc-cards-label tech-text mb-4 text-[0.68rem] uppercase tracking-[0.22em] text-[#6b8393]">
              Flip through four operators
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {presetResults.map(({ preset: p, results: r }, i) => (
                <OperatorCard
                  key={p.id}
                  label={p.label}
                  wells={p.candidateWellCount}
                  formation={p.formation}
                  payout={r.payoutDays}
                  efficiency={r.capitalEfficiencyAdvantagePct}
                  programValue={r.annualTotalValueCad}
                  isActive={i === activeIndex}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>

            {/* CTAs */}
            <div className="calc-ctas mt-6 flex flex-wrap gap-3">
              <Link
                href="/calculator"
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                Run Your Numbers
                <ArrowRight size={16} />
              </Link>
              <a
                href="mailto:kylegronning@mpsgroup.ca"
                className="btn-secondary inline-flex items-center text-sm"
              >
                {calculatorCopy.buttons.requestQuote}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Operator Card ──────────────────────────────────────────── */

function OperatorCard({
  label,
  wells,
  formation,
  payout,
  efficiency,
  programValue,
  isActive,
  onClick,
}: {
  label: string;
  wells: number;
  formation: string;
  payout: number | null;
  efficiency: number | null;
  programValue: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'calc-card group relative rounded-[1.2rem] border p-4 text-left',
        isActive
          ? 'border-em-cyan/30 bg-[linear-gradient(135deg,rgba(239,68,68,0.12),rgba(239,68,68,0.04))] shadow-[0_0_32px_rgba(239,68,68,0.08)]'
          : 'border-white/8 bg-white/[0.03]',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.82rem] font-semibold text-[#e8f1f8]">{label}</span>
        <span className="tech-text text-[0.65rem] text-[#6b8393]">{wells} wells</span>
      </div>
      <p className="mt-1 text-[0.68rem] text-[#5a7080]">{formation}</p>

      {/* Metrics row */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        <LabeledMetric
          icon={<Clock size={12} />}
          value={`${Math.round(payout ?? 0)}d`}
          label="Payout"
        />
        <LabeledMetric
          icon={<TrendingDown size={12} />}
          value={`${Math.round(efficiency ?? 0)}%`}
          label="Cheaper"
        />
        <LabeledMetric
          icon={<DollarSign size={12} />}
          value={formatCompact(programValue)}
          label="Value / yr"
        />
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute -top-px left-6 right-6 h-[2px] rounded-b-full bg-gradient-to-r from-transparent via-em-cyan to-transparent" />
      )}
    </button>
  );
}

/* ── Labeled Metric (icon + number + label inside a card) ──── */

function LabeledMetric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className="text-[#FCA5A5]">{icon}</span>
        <span className="tech-text text-[0.82rem] font-semibold text-[#e0ecf3]">{value}</span>
      </div>
      <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.12em] text-[#5a7080]">{label}</p>
    </div>
  );
}

/* ── Comparison Bar Row ─────────────────────────────────────── */

function ComparisonRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | null;
  tone: 'wellfi' | 'drill';
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[0.78rem] font-medium text-[#c8dae6]">{label}</span>
        <span className="tech-text text-[0.82rem] font-semibold text-[#e0ecf3]">
          {formatMoney(value)}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn(
            'h-full rounded-full',
            tone === 'wellfi'
              ? 'calc-bar-wellfi bg-gradient-to-r from-em-cyan/60 to-em-cyan'
              : 'calc-bar-drill bg-gradient-to-r from-hw-amber/60 to-hw-amber',
          )}
          style={{ width: '0%' }}
        />
      </div>
    </div>
  );
}

/* ── Formatters ─────────────────────────────────────────────── */

function formatMoney(value: number | null) {
  if (value === null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
    notation: Math.abs(value) >= 1_000_000 ? 'compact' : 'standard',
    compactDisplay: 'short',
  }).format(value);
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `$${Math.round(value / 1_000_000)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}
