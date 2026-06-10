'use client';

import { calculator as calculatorCopy } from '@/lib/content';
import type {
  CalculatorInputs as CalculatorInputsState,
  CalculatorNumericField,
} from '@/lib/calculator';

interface CalculatorInputsProps {
  inputs: CalculatorInputsState;
  onNumberChange: (field: CalculatorNumericField, value: number) => void;
}

const fieldConfig: Record<CalculatorNumericField, { min: number; step: number }> = {
  candidateWellCount: { min: 0, step: 1 },
  avgOilRatePerWellBpd: { min: 0, step: 0.1 },
  wellfiCostPerWellCad: { min: 0, step: 1000 },
  productionUpliftPct: { min: 0, step: 0.5 },
  currentRunLifeMonths: { min: 0, step: 0.5 },
  runLifeExtensionPct: { min: 0, step: 1 },
  workoverCostPerEventCad: { min: 0, step: 1000 },
  operatingNetbackCadPerBbl: { min: 0, step: 0.5 },
  realizedOilPriceCadPerBbl: { min: 0, step: 0.5 },
  royaltyRatePct: { min: 0, step: 0.1 },
  variableOperatingCostCadPerBbl: { min: 0, step: 0.1 },
  transportCostCadPerBbl: { min: 0, step: 0.1 },
  gAndACostCadPerBbl: { min: 0, step: 0.1 },
  drillCapexPerWellCad: { min: 0, step: 10000 },
  drillYear1AvgBpd: { min: 0, step: 0.5 },
  drillIp30Bpd: { min: 0, step: 1 },
  drillFirstYearDeclinePct: { min: 0, step: 1 },
};

export default function CalculatorInputs({
  inputs,
  onNumberChange,
}: CalculatorInputsProps) {
  return (
    <div className="calc-panel">
      <div>
        <p className="label-text mb-3">{calculatorCopy.groups.production}</p>
        <h2 className="display-heading text-[clamp(1.7rem,4vw,2.8rem)] text-text-primary">
          Use their numbers, not ours.
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
          Keep the exercise simple: enter the engineer&apos;s own assumptions, let the screen show the value case, and leave the deeper modeled benchmark for the follow-up conversation.
        </p>
      </div>

      <div className="mt-7 space-y-6">
        <SectionBlock
          title={calculatorCopy.groups.production}
          description="Start with the candidate wells and the economics that already exist on the engineer's side of the desk."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <NumericField field="candidateWellCount" value={inputs.candidateWellCount} onNumberChange={onNumberChange} />
            <NumericField field="avgOilRatePerWellBpd" value={inputs.avgOilRatePerWellBpd} onNumberChange={onNumberChange} />
            <NumericField field="operatingNetbackCadPerBbl" value={inputs.operatingNetbackCadPerBbl} onNumberChange={onNumberChange} />
            <NumericField field="workoverCostPerEventCad" value={inputs.workoverCostPerEventCad} onNumberChange={onNumberChange} />
            <NumericField field="currentRunLifeMonths" value={inputs.currentRunLifeMonths} onNumberChange={onNumberChange} />
          </div>
        </SectionBlock>

        <SectionBlock
          title={calculatorCopy.groups.wellfi}
          description="Let the engineer choose the WellFi assumptions directly instead of publishing a canned price or claim."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <NumericField field="wellfiCostPerWellCad" value={inputs.wellfiCostPerWellCad} onNumberChange={onNumberChange} />
            <NumericField field="productionUpliftPct" value={inputs.productionUpliftPct} onNumberChange={onNumberChange} />
            <NumericField field="runLifeExtensionPct" value={inputs.runLifeExtensionPct} onNumberChange={onNumberChange} />
          </div>
        </SectionBlock>

        <SectionBlock
          title={calculatorCopy.groups.drill}
          description="Use the drill case the engineer already believes, then let the calculator compare sustained barrels against retrofit barrels."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <NumericField field="drillCapexPerWellCad" value={inputs.drillCapexPerWellCad} onNumberChange={onNumberChange} />
            <NumericField field="drillYear1AvgBpd" value={inputs.drillYear1AvgBpd} onNumberChange={onNumberChange} />
          </div>
        </SectionBlock>
      </div>
    </div>
  );
}

interface NumericFieldProps {
  field: CalculatorNumericField;
  value: number;
  onNumberChange: (field: CalculatorNumericField, value: number) => void;
}

function NumericField({ field, value, onNumberChange }: NumericFieldProps) {
  const copy = calculatorCopy.fields[field];
  const config = fieldConfig[field];

  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold tracking-[-0.02em] text-[#f2f7fb]">
          {copy.label}
        </span>
        {copy.unit && (
          <span className="tech-text text-[0.72rem] uppercase tracking-[0.2em] text-[#FCA5A5]">
            {copy.unit}
          </span>
        )}
      </div>

      <input
        className="calc-input w-full"
        type="number"
        min={config.min}
        step={config.step}
        value={value > 0 ? value : ''}
        placeholder="Enter value"
        onChange={(event) => onNumberChange(field, parseFloat(event.target.value) || 0)}
      />

      <p className="mt-2 text-xs leading-5 text-text-secondary">{copy.hint}</p>
    </label>
  );
}

interface SectionBlockProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SectionBlock({ title, description, children }: SectionBlockProps) {
  return (
    <section className="rounded-[1.35rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
      <div className="mb-5">
        <p className="tech-text text-[0.72rem] uppercase tracking-[0.22em] text-[#FCA5A5]">{title}</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{description}</p>
      </div>
      {children}
    </section>
  );
}
