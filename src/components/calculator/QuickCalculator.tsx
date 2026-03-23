'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { ArrowRight, Mail, Clock, TrendingDown, DollarSign, Droplets } from 'lucide-react';
import { calculateWellFiResults, type CalculatorInputs } from '@/lib/calculator';
import { cn } from '@/lib/utils';

/*
 * Hidden WellFi assumptions — based on all current data from WellFi deployments.
 * These are NOT shown to the user. The calculator applies them silently.
 */
const WELLFI_COST_PER_WELL = 20_000;
const WELLFI_UPLIFT_PCT = 10;       // 10% production uplift
const WELLFI_RUNLIFE_EXT_PCT = 20;  // 20% pump run-life extension

interface QuickInputs {
  avgOilRate: number;
  netback: number;
  pumpRunLife: number;
  workoverCost: number;
  drillCapex: number;
  drillYear1Rate: number;
}

const defaultInputs: QuickInputs = {
  avgOilRate: 71.09,    // Best preset (Operator C)
  netback: 85.57,
  pumpRunLife: 15,
  workoverCost: 50_000,
  drillCapex: 1_900_000,
  drillYear1Rate: 150,
};

const fields: {
  key: keyof QuickInputs;
  label: string;
  unit: string;
  hint: string;
  step: number;
}[] = [
  { key: 'avgOilRate', label: 'Your existing well rate', unit: 'bbl/d', hint: 'Current producing rate for the well you want to retrofit', step: 1 },
  { key: 'netback', label: 'Operating netback', unit: 'C$/bbl', hint: 'Dollars kept per produced barrel', step: 1 },
  { key: 'pumpRunLife', label: 'Pump run life', unit: 'months', hint: 'Avg months between changeouts', step: 1 },
  { key: 'workoverCost', label: 'Workover cost', unit: 'C$', hint: 'Cost per pump change intervention', step: 5000 },
  { key: 'drillCapex', label: 'New well D&C cost', unit: 'C$', hint: 'What it costs to drill and complete a new well', step: 50000 },
  { key: 'drillYear1Rate', label: 'Expected rate for new D&C well', unit: 'bbl/d', hint: 'What a new drill produces in year one', step: 5 },
];

export default function QuickCalculator() {
  const [inputs, setInputs] = useState<QuickInputs>(defaultInputs);
  const deferred = useDeferredValue(inputs);

  const results = useMemo(() => {
    const calcInputs: CalculatorInputs = {
      candidateWellCount: 1,
      avgOilRatePerWellBpd: deferred.avgOilRate,
      wellfiCostPerWellCad: WELLFI_COST_PER_WELL,
      productionUpliftPct: WELLFI_UPLIFT_PCT,
      currentRunLifeMonths: deferred.pumpRunLife,
      runLifeExtensionPct: WELLFI_RUNLIFE_EXT_PCT,
      workoverCostPerEventCad: deferred.workoverCost,
      netbackMode: 'direct',
      operatingNetbackCadPerBbl: deferred.netback,
      realizedOilPriceCadPerBbl: 0,
      royaltyRatePct: 0,
      variableOperatingCostCadPerBbl: 0,
      transportCostCadPerBbl: 0,
      gAndACostCadPerBbl: 0,
      drillRateMode: 'average',
      drillCapexPerWellCad: deferred.drillCapex,
      drillYear1AvgBpd: deferred.drillYear1Rate,
      drillIp30Bpd: 0,
      drillFirstYearDeclinePct: 0,
    };
    return calculateWellFiResults(calcInputs);
  }, [deferred]);

  const isReady = deferred.avgOilRate > 0 && deferred.netback > 0 &&
    deferred.pumpRunLife > 0 && deferred.drillCapex > 0 && deferred.drillYear1Rate > 0;

  function handleChange(key: keyof QuickInputs, value: number) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
      {/* ── LEFT: Inputs ─────────────────────────────── */}
      <div className="calc-panel">
        <p className="tech-text text-[0.68rem] uppercase tracking-[0.2em] text-[#88e6f4] mb-1">
          Your well
        </p>
        <p className="text-xs text-[#5a7080] mb-5">
          One well you know. WellFi assumptions based on deployment data.
        </p>

        <div className="space-y-4">
          {fields.map((f) => (
            <label key={f.key} className="block">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[0.78rem] font-semibold text-[#e0ecf3]">{f.label}</span>
                <span className="tech-text text-[0.62rem] uppercase tracking-[0.18em] text-[#88e6f4]">{f.unit}</span>
              </div>
              <input
                className="calc-input w-full"
                type="number"
                min={0}
                step={f.step}
                value={inputs[f.key] > 0 ? inputs[f.key] : ''}
                placeholder={f.hint}
                onChange={(e) => handleChange(f.key, parseFloat(e.target.value) || 0)}
              />
            </label>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Results Reward ────────────────────── */}
      <div className="lg:sticky lg:top-6 space-y-4">
        {isReady ? (
          <ResultsReward inputs={deferred} results={results} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

/* ── Results Reward Panel ───────────────────────────────────── */

function ResultsReward({
  inputs,
  results,
}: {
  inputs: QuickInputs;
  results: ReturnType<typeof calculateWellFiResults>;
}) {
  const capexMax = Math.max(
    results.capexPerIncrementalBpdWellFiCad ?? 1,
    results.drillCapexPerIncrementalBpdCad ?? 1,
  );
  const wellfiPct = ((results.capexPerIncrementalBpdWellFiCad ?? 0) / capexMax) * 100;
  const drillPct = ((results.drillCapexPerIncrementalBpdCad ?? 0) / capexMax) * 100;

  const freeWells = results.capitalSavedVsDrillCad !== null && inputs.drillCapex > 0
    ? results.capitalSavedVsDrillCad / inputs.drillCapex
    : null;

  const isCheaper = (results.capitalEfficiencyAdvantagePct ?? 0) > 0;
  const isFaster = results.drillPayoutMonths !== null && results.payoutMonths !== null
    && results.drillPayoutMonths > results.payoutMonths;

  return (
    <>
      {/* Hero: Capital saved */}
      <div className="calc-panel calc-panel--accent relative overflow-hidden">
        {/* Subtle glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-em-cyan/10 blur-3xl"
        />
        <div className="relative">
          <p className="tech-text text-[0.68rem] uppercase tracking-[0.2em] text-[#88e6f4] mb-2">
            {isCheaper ? 'Capital saved vs drilling' : 'Capital comparison'}
          </p>

          <p className="display-heading text-[clamp(2.8rem,7vw,4.8rem)] leading-[1] text-text-primary">
            {formatMoney(Math.abs(results.capitalSavedVsDrillCad ?? 0))}
          </p>

          {isCheaper && isFaster && (
            <p className="mt-3 text-sm font-medium text-[#b8f0fa]">
              WellFi pays back in {Math.round(results.payoutDays ?? 0)} days and buys barrels {Math.round(results.capitalEfficiencyAdvantagePct ?? 0)}% cheaper than drilling.
            </p>
          )}

          {freeWells !== null && freeWells > 0.1 && (
            <div className="mt-4 rounded-[0.8rem] border border-em-cyan/15 bg-em-cyan/6 px-3.5 py-2.5">
              <p className="text-[0.82rem] font-medium text-[#c8f4fd]">
                That&apos;s enough savings to fund{' '}
                <span className="tech-text font-bold text-text-primary">
                  {freeWells.toFixed(1)}
                </span>{' '}
                additional new wells.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={<Clock size={16} />}
          value={`${Math.round(results.payoutDays ?? 0)}`}
          unit="days"
          label="Payout"
        />
        <MetricCard
          icon={<DollarSign size={16} />}
          value={formatMoney(results.annualTotalValuePerWellCad)}
          label="Annual value"
        />
        <MetricCard
          icon={<Droplets size={16} />}
          value={`+${(results.incrementalBpdPerWell ?? 0).toFixed(1)}`}
          unit="bbl/d"
          label="Extra production"
        />
        <MetricCard
          icon={<TrendingDown size={16} />}
          value={`${Math.round(results.capitalEfficiencyAdvantagePct ?? 0)}%`}
          label="Cheaper per barrel"
        />
      </div>

      {/* Comparison chart */}
      <div className="calc-panel">
        <p className="tech-text text-[0.62rem] uppercase tracking-[0.2em] text-[#6b8393] mb-4">
          Capex per incremental bbl/d
        </p>

        <div className="space-y-3">
          <BarRow
            label="WellFi"
            value={results.capexPerIncrementalBpdWellFiCad}
            pct={wellfiPct}
            tone="wellfi"
          />
          <BarRow
            label="New drill"
            value={results.drillCapexPerIncrementalBpdCad}
            pct={drillPct}
            tone="drill"
          />
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-white/6 pt-3">
          <div className="flex-1">
            <p className="text-[0.68rem] text-[#5a7080]">Drill payout</p>
            <p className="tech-text text-sm font-semibold text-[#e0ecf3]">
              {results.drillPayoutMonths !== null ? `${results.drillPayoutMonths.toFixed(1)} months` : '—'}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-[0.68rem] text-[#5a7080]">WellFi payout</p>
            <p className="tech-text text-sm font-semibold text-em-cyan">
              {results.payoutDays !== null ? `${Math.round(results.payoutDays)} days` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <a
        href={buildEmailLink(inputs, results)}
        className="btn-primary flex w-full items-center justify-center gap-2.5 text-[0.92rem]"
      >
        <Mail size={18} />
        Email About WellFi
      </a>

      {/* Disclaimer */}
      <p className="text-[0.65rem] leading-4 text-[#4a5e6a]">
        Screening estimate based on current WellFi deployment data. All prices C$. Not a guarantee — contact MPS Group for a site-specific assessment.
      </p>
    </>
  );
}

/* ── Empty State ────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="calc-panel calc-panel--accent flex flex-col items-center justify-center py-16 text-center">
      <p className="tech-text text-[0.72rem] uppercase tracking-[0.2em] text-[#6b8393]">
        Your results
      </p>
      <p className="mt-3 display-heading text-[clamp(1.6rem,4vw,2.4rem)] text-[#3a5060]">
        Enter your well data
      </p>
      <p className="mt-2 max-w-xs text-sm text-[#4a5e6a]">
        Fill in the fields on the left. Results appear here instantly.
      </p>
    </div>
  );
}

/* ── Metric Card ────────────────────────────────────────────── */

function MetricCard({
  icon,
  value,
  unit,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  unit?: string;
  label: string;
}) {
  return (
    <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] p-3.5">
      <div className="mb-2 text-[#88e6f4]">{icon}</div>
      <p className="display-heading text-[clamp(1.3rem,3vw,1.8rem)] text-text-primary">
        {value}
        {unit && <span className="ml-1 tech-text text-[0.7rem] font-normal text-[#6b8393]">{unit}</span>}
      </p>
      <p className="mt-1 text-[0.65rem] uppercase tracking-[0.12em] text-[#5a7080]">{label}</p>
    </div>
  );
}

/* ── Comparison Bar ─────────────────────────────────────────── */

function BarRow({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: number | null;
  pct: number;
  tone: 'wellfi' | 'drill';
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[0.75rem] font-medium text-[#c8dae6]">{label}</span>
        <span className="tech-text text-[0.78rem] font-semibold text-[#e0ecf3]">
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
          style={{ width: `${Math.max(pct, 4)}%` }}
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

/* ── Email builder ──────────────────────────────────────────── */

function buildEmailLink(inputs: QuickInputs, results: ReturnType<typeof calculateWellFiResults>) {
  const subject = encodeURIComponent('WellFi Calculator Inquiry');
  const body = encodeURIComponent(
    `Hi Kyle,\n\nI ran the WellFi calculator with these well assumptions:\n\n` +
    `• Avg well rate: ${inputs.avgOilRate} bbl/d\n` +
    `• Operating netback: C$${inputs.netback}/bbl\n` +
    `• Pump run life: ${inputs.pumpRunLife} months\n` +
    `• Workover cost: C$${inputs.workoverCost.toLocaleString()}\n` +
    `• Drill D&C: C$${inputs.drillCapex.toLocaleString()}\n` +
    `• New well yr-1 avg: ${inputs.drillYear1Rate} bbl/d\n\n` +
    `Results:\n` +
    `• Payout: ${Math.round(results.payoutDays ?? 0)} days\n` +
    `• Annual value: ${formatMoney(results.annualTotalValuePerWellCad)}\n` +
    `• ${Math.round(results.capitalEfficiencyAdvantagePct ?? 0)}% cheaper per barrel than drilling\n\n` +
    `I'd like to discuss further.\n\nThanks`
  );
  return `mailto:kylegronning@mpsgroup.ca?subject=${subject}&body=${body}`;
}
