'use client';

import { useDeferredValue, useState } from 'react';
import { calculator as calculatorCopy } from '@/lib/content';
import { presets } from '@/lib/presets';
import {
  blankCalculatorInputs,
  calculateWellFiResults,
  getCalculatorInputsFromPreset,
  type CalculatorInputs,
  type CalculatorNumericField,
} from '@/lib/calculator';
import CalculatorInputsPanel from './CalculatorInputs';
import CalculatorResults from './CalculatorResults';
import { cn } from '@/lib/utils';

export default function WellFiCalculator() {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    presets[0].id,
  );
  const [inputs, setInputs] = useState<CalculatorInputs>(
    getCalculatorInputsFromPreset(presets[0]),
  );
  const deferredInputs = useDeferredValue(inputs);
  const results = calculateWellFiResults(deferredInputs);
  const isReady = hasRequiredInputs(deferredInputs, results.drillYear1AvgBpdResolved);

  function handlePresetChange(presetId: string | null) {
    setSelectedPresetId(presetId);
    if (presetId === null) {
      setInputs(blankCalculatorInputs);
      return;
    }
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      setInputs(getCalculatorInputsFromPreset(preset));
    }
  }

  function handleNumberChange(field: CalculatorNumericField, value: number) {
    setSelectedPresetId(null);
    setInputs((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleReset() {
    setSelectedPresetId(presets[0].id);
    setInputs(getCalculatorInputsFromPreset(presets[0]));
  }

  return (
    <div className="calc-shell p-5 sm:p-6 lg:p-8">
      {/* Preset selector bar */}
      <div className="flex flex-col gap-4 border-b border-white/8 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="label-text mb-3">{calculatorCopy.presetSelectorLabel}</p>
            <p className="text-sm leading-6 text-text-secondary">
              {calculatorCopy.provenance.fullDisclaimer}
            </p>
          </div>
          <button type="button" onClick={handleReset} className="calc-segment">
            {calculatorCopy.buttons.reset}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetChange(p.id)}
              className={cn(
                'calc-segment text-xs',
                selectedPresetId === p.id && 'calc-segment--active',
              )}
            >
              {p.label}
              <span className="hidden sm:inline"> ({p.candidateWellCount})</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => handlePresetChange(null)}
            className={cn(
              'calc-segment text-xs',
              selectedPresetId === null && 'calc-segment--active',
            )}
          >
            {calculatorCopy.customLabel}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
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
