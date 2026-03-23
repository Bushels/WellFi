'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { calculator as calculatorCopy } from '@/lib/content';
import type {
  CalculatorInputs,
  CalculatorResults as CalculatorResultsData,
} from '@/lib/calculator';
import { cn } from '@/lib/utils';

interface CalculatorResultsProps {
  inputs: CalculatorInputs;
  results: CalculatorResultsData;
  isReady: boolean;
}

export default function CalculatorResults({
  inputs,
  results,
  isReady,
}: CalculatorResultsProps) {
  const capexMax = Math.max(
    results.capexPerIncrementalBpdWellFiCad ?? 0,
    results.drillCapexPerIncrementalBpdCad ?? 0,
    1,
  );

  if (!isReady) {
    return (
      <div className="calc-panel calc-panel--accent">
        <p className="label-text mb-3">{calculatorCopy.metrics.payout}</p>
        <h2 className="display-heading text-[clamp(2rem,5vw,3.8rem)] text-[#f7fbff]">
          {calculatorCopy.emptyStateTitle}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#d6e3ec]">
          {calculatorCopy.emptyStateDescription}
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <MetricCard
            label={calculatorCopy.metrics.payout}
            value="Your result"
            caption="Days to payout once their assumptions are in."
          />
          <MetricCard
            label={calculatorCopy.metrics.annualValuePerWell}
            value="Your result"
            caption="Per-well value from uplift and annualized workover savings."
          />
          <MetricCard
            label={calculatorCopy.metrics.totalProgramValue}
            value="Your result"
            caption="Scaled to the candidate wells they enter."
          />
          <MetricCard
            label={calculatorCopy.metrics.capexPerBarrel}
            value="Your result"
            caption="A direct retrofit-versus-drill comparison."
          />
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href="mailto:kylegronning@mpsgroup.ca"
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            {calculatorCopy.buttons.requestQuote}
            <ArrowRight size={16} />
          </a>
          <Link href="/#details" className="btn-secondary inline-flex items-center text-sm">
            {calculatorCopy.buttons.viewSpecs}
          </Link>
        </div>
      </div>
    );
  }

  const capitalSavedIsPositive =
    results.capitalSavedVsDrillCad !== null && results.capitalSavedVsDrillCad >= 0;

  return (
    <div className="space-y-5">
      <div className="calc-panel calc-panel--accent">
        <p className="label-text mb-3">{calculatorCopy.metrics.payout}</p>
        <h2 className="display-heading text-[clamp(2.2rem,6vw,4.2rem)] text-[#f7fbff]">
          {formatNumber(results.payoutDays, 0)} days
        </h2>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-[#d6e3ec]">
          {buildDecisionMessage(results)}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <MetricCard
            label={calculatorCopy.metrics.annualValuePerWell}
            value={formatMoney(results.annualTotalValuePerWellCad)}
            caption={`${formatMoney(results.annualProductionValuePerWellCad)} production + ${formatMoney(results.annualWorkoverSavingsPerWellCad)} workover`}
          />
          <MetricCard
            label={calculatorCopy.metrics.totalProgramValue}
            value={formatMoney(results.annualTotalValueCad)}
            caption={`${formatInteger(inputs.candidateWellCount)} candidate wells`}
          />
          <MetricCard
            label={calculatorCopy.metrics.capexPerBarrel}
            value={formatMoney(results.capexPerIncrementalBpdWellFiCad)}
            caption={buildCapexMessage(results)}
          />
          <MetricCard
            label={capitalSavedIsPositive ? calculatorCopy.metrics.capitalSaved : 'Extra capital vs drilling'}
            value={formatMoney(
              results.capitalSavedVsDrillCad !== null
                ? Math.abs(results.capitalSavedVsDrillCad)
                : null,
            )}
            caption={
              capitalSavedIsPositive
                ? 'Capital difference to buy the same sustained barrels by drilling'
                : 'Additional capital needed to match the drill benchmark'
            }
          />
        </div>
      </div>

      <div className="calc-panel">
        <p className="tech-text text-[0.72rem] uppercase tracking-[0.22em] text-[#88e6f4]">
          Retrofit versus drill
        </p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          The comparison stays intentionally simple: sustained barrels, payout speed, and capex efficiency.
        </p>

        <div className="mt-6 space-y-4">
          <ComparisonBar
            label="WellFi"
            value={results.capexPerIncrementalBpdWellFiCad}
            width={((results.capexPerIncrementalBpdWellFiCad ?? 0) / capexMax) * 100}
            tone="wellfi"
            detail={`${formatMoney(results.annualWorkoverSavingsCad)} annualized workover savings`}
          />
          <ComparisonBar
            label="New drill"
            value={results.drillCapexPerIncrementalBpdCad}
            width={((results.drillCapexPerIncrementalBpdCad ?? 0) / capexMax) * 100}
            tone="drill"
            detail={`${formatNumber(results.drillPayoutMonths, 1)} months payout`}
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <MetricCard
            label={calculatorCopy.metrics.sameCapital}
            value={formatNumber(results.sameCapitalDrillBpd, 1)}
            caption="bbl/d from drilling with the same capital"
          />
          <MetricCard
            label={calculatorCopy.metrics.productionValue}
            value={formatMoney(results.annualProductionValueCad)}
            caption={`${formatNumber(results.totalIncrementalBpd, 1)} total incremental bbl/d`}
          />
        </div>
      </div>

      <div className="calc-panel">
        <p className="text-sm leading-6 text-[#d4dfe9]">{calculatorCopy.benchmarkSummary}</p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{calculatorCopy.contactPrompt}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="mailto:kylegronning@mpsgroup.ca"
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            {calculatorCopy.buttons.requestQuote}
            <ArrowRight size={16} />
          </a>
          <Link href="/" className="btn-secondary inline-flex items-center text-sm">
            {calculatorCopy.buttons.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  caption: string;
}

function MetricCard({ label, value, caption }: MetricCardProps) {
  return (
    <article className="rounded-[1.15rem] border border-white/8 bg-white/4 p-4">
      <p className="tech-text text-[0.68rem] uppercase tracking-[0.2em] text-[#88e6f4]">{label}</p>
      <p className="mt-3 display-heading text-[clamp(1.4rem,3vw,2.2rem)] text-[#f6fbff]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{caption}</p>
    </article>
  );
}

interface ComparisonBarProps {
  label: string;
  value: number | null;
  width: number;
  tone: 'wellfi' | 'drill';
  detail?: string;
}

function ComparisonBar({ label, value, width, tone, detail }: ComparisonBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#f0f6fb]">{label}</p>
          {detail && <p className="text-xs leading-5 text-text-secondary">{detail}</p>}
        </div>
        <span className="tech-text text-sm text-[#dbe8f1]">{formatMoney(value)}</span>
      </div>

      <div className="calc-comparison-track">
        <div
          className={cn(
            'calc-comparison-bar',
            tone === 'wellfi' ? 'calc-comparison-bar--wellfi' : 'calc-comparison-bar--drill',
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function buildDecisionMessage(results: CalculatorResultsData) {
  const isFaster =
    results.drillPayoutMonths !== null && results.payoutMonths !== null && results.drillPayoutMonths > results.payoutMonths;
  const isCheaper =
    results.capexPerIncrementalBpdWellFiCad !== null &&
    results.drillCapexPerIncrementalBpdCad !== null &&
    results.capexPerIncrementalBpdWellFiCad < results.drillCapexPerIncrementalBpdCad;

  if (isFaster && isCheaper) {
    return 'Under these assumptions, WellFi pays back faster and buys incremental barrels more efficiently than drilling.';
  }

  if (isFaster) {
    return 'Under these assumptions, WellFi pays back faster, but the capital-efficiency side of the case is closer and worth discussing.';
  }

  if (isCheaper) {
    return 'Under these assumptions, WellFi still buys barrels more cheaply, but the payout speed is tighter than the drill benchmark.';
  }

  return 'Under these assumptions, the drill benchmark is still stronger. That usually means the candidate well set or the WellFi assumptions need a second look.';
}

function buildCapexMessage(results: CalculatorResultsData) {
  if (results.capitalEfficiencyAdvantagePct === null) {
    return 'Check the assumptions';
  }

  if (results.capitalEfficiencyAdvantagePct >= 0) {
    return `${formatNumber(Math.abs(results.capitalEfficiencyAdvantagePct), 0)}% cheaper than drilling`;
  }

  return `${formatNumber(Math.abs(results.capitalEfficiencyAdvantagePct), 0)}% more expensive than drilling`;
}

function formatMoney(value: number | null, fractionDigits = 0) {
  if (value === null || Number.isNaN(value)) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    notation: Math.abs(value) >= 1_000_000 ? 'compact' : 'standard',
    compactDisplay: 'short',
  }).format(value);
}

function formatNumber(value: number | null, fractionDigits: number) {
  if (value === null || Number.isNaN(value)) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-CA', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('en-CA', {
    maximumFractionDigits: 0,
  }).format(value);
}
