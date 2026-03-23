'use client';

import { useDeferredValue, useState } from 'react';
import { calculator as calculatorCopy } from '@/lib/content';
import {
  blankCalculatorInputs,
  calculateWellFiResults,
  type CalculatorInputs,
  type CalculatorNumericField,
} from '@/lib/calculator';
import CalculatorInputsPanel from './CalculatorInputs';
import CalculatorResults from './CalculatorResults';

export default function WellFiCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(blankCalculatorInputs);
  const deferredInputs = useDeferredValue(inputs);
  const results = calculateWellFiResults(deferredInputs);
  const isReady = hasRequiredInputs(deferredInputs, results.drillYear1AvgBpdResolved);

  function handleNumberChange(field: CalculatorNumericField, value: number) {
    setInputs((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleReset() {
    setInputs(blankCalculatorInputs);
  }

  return (
    <div className="calc-shell p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 border-b border-white/8 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="label-text mb-3">{calculatorCopy.pageEyebrow}</p>
            <p className="text-base leading-7 text-[#d6e3ec]">
              {calculatorCopy.benchmarkSummary}
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {calculatorCopy.contactPrompt}
            </p>
          </div>

          <button type="button" onClick={handleReset} className="calc-segment">
            {calculatorCopy.buttons.reset}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(21rem,0.85fr)]">
        <CalculatorInputsPanel
          inputs={inputs}
          onNumberChange={handleNumberChange}
        />

        <div className="xl:sticky xl:top-6 h-fit">
          <CalculatorResults
            inputs={deferredInputs}
            results={results}
            isReady={isReady}
          />
        </div>
      </div>
    </div>
  );
}

function hasRequiredInputs(inputs: CalculatorInputs, drillYear1AvgBpdResolved: number) {
  return (
    inputs.candidateWellCount > 0 &&
    inputs.avgOilRatePerWellBpd > 0 &&
    inputs.wellfiCostPerWellCad > 0 &&
    inputs.productionUpliftPct > 0 &&
    inputs.currentRunLifeMonths > 0 &&
    inputs.runLifeExtensionPct > 0 &&
    inputs.workoverCostPerEventCad > 0 &&
    inputs.operatingNetbackCadPerBbl > 0 &&
    inputs.drillCapexPerWellCad > 0 &&
    drillYear1AvgBpdResolved > 0
  );
}
