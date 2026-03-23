'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, TrendingDown, DollarSign, Layers } from 'lucide-react';
import { calculator as calculatorCopy } from '@/lib/content';
import { presets } from '@/lib/presets';
import {
  getCalculatorInputsFromPreset,
  calculateWellFiResults,
  type CalculatorResults,
} from '@/lib/calculator';
import { spacing } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

/** Pre-compute results for all presets so we can show the "best" payout as the hero number. */
const presetResults = presets.map((p) => ({
  preset: p,
  results: calculateWellFiResults(getCalculatorInputsFromPreset(p)),
}));
const bestPayout = Math.min(
  ...presetResults.map((r) => r.results.payoutDays ?? Infinity),
);
const bestEfficiency = Math.max(
  ...presetResults.map((r) => r.results.capitalEfficiencyAdvantagePct ?? 0),
);

export default function CalculatorTeaserSection() {
  const [activeIndex, setActiveIndex] = useState(
    presetResults.findIndex((r) => r.results.payoutDays === bestPayout),
  );
  const { preset, results } = presetResults[activeIndex];

  const capexMax = Math.max(
    results.capexPerIncrementalBpdWellFiCad ?? 1,
    results.drillCapexPerIncrementalBpdCad ?? 1,
  );
  const wellfiBarPct = ((results.capexPerIncrementalBpdWellFiCad ?? 0) / capexMax) * 100;
  const drillBarPct = ((results.drillCapexPerIncrementalBpdCad ?? 0) / capexMax) * 100;

  return (
    <section
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
            'radial-gradient(ellipse 60% 50% at 25% 0%, rgba(6,182,212,0.14), transparent)',
            'radial-gradient(ellipse 40% 60% at 85% 80%, rgba(217,119,6,0.06), transparent)',
            'linear-gradient(180deg, rgba(4,10,18,0.95) 0%, rgba(10,14,26,1) 100%)',
          ].join(', '),
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* ── IMPACT ZONE ─────────────────────────────────── */}
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="label-text mb-5">{calculatorCopy.teaserEyebrow}</p>
            <h2 className="display-heading text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.05] tracking-[-0.03em]">
              <span className="text-text-primary">Add Barrels,</span>
              <br />
              <span className="text-gradient">Not Capex.</span>
            </h2>
          </div>

          {/* Proof chips — right-aligned on desktop */}
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {calculatorCopy.teaserChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1.5 rounded-full border border-em-cyan/20 bg-em-cyan/8 px-3.5 py-1.5 text-[0.8rem] font-medium text-[#b8f0fa]"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-em-cyan" />
                {chip}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-5 max-w-2xl text-[1.05rem] leading-8 text-[#a8bfce]">
          {calculatorCopy.teaserDescription}
        </p>

        {/* ── HERO NUMBER + COMPARISON ────────────────────── */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {/* Left: Hero payout number + comparison bars */}
          <div>
            <div className="flex items-baseline gap-3">
              <span className="tech-text text-[clamp(5rem,12vw,9rem)] font-bold leading-none text-text-primary">
                {Math.round(results.payoutDays ?? 0)}
              </span>
              <div>
                <span className="tech-text block text-[clamp(1.4rem,3vw,2.4rem)] font-medium text-[#a8bfce]">
                  days
                </span>
                <span className="tech-text block text-[0.72rem] uppercase tracking-[0.18em] text-[#88e6f4]">
                  to full payout
                </span>
              </div>
            </div>

            {/* Comparison bars */}
            <div className="mt-8 space-y-4">
              <ComparisonRow
                label="WellFi retrofit"
                value={results.capexPerIncrementalBpdWellFiCad}
                widthPct={wellfiBarPct}
                tone="wellfi"
              />
              <ComparisonRow
                label="New drill"
                value={results.drillCapexPerIncrementalBpdCad}
                widthPct={drillBarPct}
                tone="drill"
              />
              <p className="text-[0.72rem] uppercase tracking-[0.15em] text-[#6b8393]">
                Capex per incremental bbl/d
              </p>
            </div>

            {/* Provenance line */}
            <p className="mt-6 text-xs leading-5 text-[#5a7080]">
              {calculatorCopy.provenance.aer} · {calculatorCopy.provenance.uplift.toLowerCase()}
            </p>
          </div>

          {/* Right: Operator cards */}
          <div>
            <p className="tech-text mb-4 text-[0.68rem] uppercase tracking-[0.22em] text-[#6b8393]">
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
            <div className="mt-6 flex flex-wrap gap-3">
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
        'group relative rounded-[1.2rem] border p-4 text-left transition-all duration-200',
        isActive
          ? 'border-em-cyan/30 bg-[linear-gradient(135deg,rgba(6,182,212,0.12),rgba(6,182,212,0.04))] shadow-[0_0_32px_rgba(6,182,212,0.08)]'
          : 'border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]',
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
        <span className="text-[#88e6f4]">{icon}</span>
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
  widthPct,
  tone,
}: {
  label: string;
  value: number | null;
  widthPct: number;
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
            'h-full rounded-full transition-[width] duration-500 ease-out',
            tone === 'wellfi'
              ? 'bg-gradient-to-r from-em-cyan/60 to-em-cyan'
              : 'bg-gradient-to-r from-hw-amber/60 to-hw-amber',
          )}
          style={{ width: `${Math.max(widthPct, 4)}%` }}
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
