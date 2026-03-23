export type NetbackMode = 'direct' | 'detailed';
export type DrillRateMode = 'average' | 'ip30';
export type PresetScenario = 'average' | 'top10' | 'custom';

export interface CalculatorPreset {
  id: string;
  label: string;
  formation: string;
  companySummary: string;
  candidateWellCount: number;
  topTierWellCount: number;
  avgOilRatePerWellBpd: number;
  topTierAvgOilRatePerWellBpd: number;
  wellfiCostPerWellCad: number;
  productionUpliftPct: number;
  currentRunLifeMonths: number;
  runLifeExtensionPct: number;
  workoverCostPerEventCad: number;
  netbackMode: NetbackMode;
  operatingNetbackCadPerBbl: number;
  realizedOilPriceCadPerBbl: number;
  royaltyRatePct: number;
  variableOperatingCostCadPerBbl: number;
  transportCostCadPerBbl: number;
  gAndACostCadPerBbl: number;
  drillRateMode: DrillRateMode;
  drillCapexPerWellCad: number;
  drillYear1AvgBpd: number;
  drillIp30Bpd: number;
  drillFirstYearDeclinePct: number;
  notes: string[];
}

export interface CalculatorInputs {
  candidateWellCount: number;
  avgOilRatePerWellBpd: number;
  wellfiCostPerWellCad: number;
  productionUpliftPct: number;
  currentRunLifeMonths: number;
  runLifeExtensionPct: number;
  workoverCostPerEventCad: number;
  netbackMode: NetbackMode;
  operatingNetbackCadPerBbl: number;
  realizedOilPriceCadPerBbl: number;
  royaltyRatePct: number;
  variableOperatingCostCadPerBbl: number;
  transportCostCadPerBbl: number;
  gAndACostCadPerBbl: number;
  drillRateMode: DrillRateMode;
  drillCapexPerWellCad: number;
  drillYear1AvgBpd: number;
  drillIp30Bpd: number;
  drillFirstYearDeclinePct: number;
}

export type CalculatorNumericField =
  | 'candidateWellCount'
  | 'avgOilRatePerWellBpd'
  | 'wellfiCostPerWellCad'
  | 'productionUpliftPct'
  | 'currentRunLifeMonths'
  | 'runLifeExtensionPct'
  | 'workoverCostPerEventCad'
  | 'operatingNetbackCadPerBbl'
  | 'realizedOilPriceCadPerBbl'
  | 'royaltyRatePct'
  | 'variableOperatingCostCadPerBbl'
  | 'transportCostCadPerBbl'
  | 'gAndACostCadPerBbl'
  | 'drillCapexPerWellCad'
  | 'drillYear1AvgBpd'
  | 'drillIp30Bpd'
  | 'drillFirstYearDeclinePct';

export interface CalculatorResults {
  netbackCadPerBbl: number;
  drillYear1AvgBpdResolved: number;
  extendedRunLifeMonths: number;
  currentWorkoversPerYear: number;
  extendedWorkoversPerYear: number;
  avoidedWorkoversPerWellPerYear: number;
  avoidedWorkoversPerYear: number;
  incrementalBpdPerWell: number;
  totalIncrementalBpd: number;
  annualProductionValuePerWellCad: number;
  annualWorkoverSavingsPerWellCad: number;
  annualTotalValuePerWellCad: number;
  annualProductionValueCad: number;
  annualWorkoverSavingsCad: number;
  annualTotalValueCad: number;
  wellfiCapexTotalCad: number;
  payoutDays: number | null;
  payoutMonths: number | null;
  capexPerIncrementalBpdWellFiCad: number | null;
  cashYieldPct: number | null;
  netYear1ReturnPct: number | null;
  valueSplitProductionPct: number;
  valueSplitWorkoverPct: number;
  drillAnnualValueCad: number;
  drillPayoutMonths: number | null;
  drillCapexPerIncrementalBpdCad: number | null;
  drillCashYieldPct: number | null;
  drillNetYear1ReturnPct: number | null;
  capitalEfficiencyAdvantagePct: number | null;
  sameCapitalDrillWells: number | null;
  sameCapitalDrillBpd: number | null;
  drillCapexNeededToMatchWellFiCad: number | null;
  capitalSavedVsDrillCad: number | null;
  barrelsPerMillionWellFi: number | null;
  barrelsPerMillionDrill: number | null;
  warnings: string[];
}

export const blankCalculatorInputs: CalculatorInputs = {
  candidateWellCount: 0,
  avgOilRatePerWellBpd: 0,
  wellfiCostPerWellCad: 0,
  productionUpliftPct: 0,
  currentRunLifeMonths: 0,
  runLifeExtensionPct: 0,
  workoverCostPerEventCad: 0,
  netbackMode: 'direct',
  operatingNetbackCadPerBbl: 0,
  realizedOilPriceCadPerBbl: 0,
  royaltyRatePct: 0,
  variableOperatingCostCadPerBbl: 0,
  transportCostCadPerBbl: 0,
  gAndACostCadPerBbl: 0,
  drillRateMode: 'average',
  drillCapexPerWellCad: 0,
  drillYear1AvgBpd: 0,
  drillIp30Bpd: 0,
  drillFirstYearDeclinePct: 0,
};

export function getCalculatorInputsFromPreset(
  preset: CalculatorPreset,
  scenario: PresetScenario = 'average',
): CalculatorInputs {
  const useTopTier = scenario === 'top10';

  return {
    candidateWellCount: useTopTier ? preset.topTierWellCount : preset.candidateWellCount,
    avgOilRatePerWellBpd: useTopTier
      ? preset.topTierAvgOilRatePerWellBpd
      : preset.avgOilRatePerWellBpd,
    wellfiCostPerWellCad: preset.wellfiCostPerWellCad,
    productionUpliftPct: preset.productionUpliftPct,
    currentRunLifeMonths: preset.currentRunLifeMonths,
    runLifeExtensionPct: preset.runLifeExtensionPct,
    workoverCostPerEventCad: preset.workoverCostPerEventCad,
    netbackMode: preset.netbackMode,
    operatingNetbackCadPerBbl: preset.operatingNetbackCadPerBbl,
    realizedOilPriceCadPerBbl: preset.realizedOilPriceCadPerBbl,
    royaltyRatePct: preset.royaltyRatePct,
    variableOperatingCostCadPerBbl: preset.variableOperatingCostCadPerBbl,
    transportCostCadPerBbl: preset.transportCostCadPerBbl,
    gAndACostCadPerBbl: preset.gAndACostCadPerBbl,
    drillRateMode: preset.drillRateMode,
    drillCapexPerWellCad: preset.drillCapexPerWellCad,
    drillYear1AvgBpd: preset.drillYear1AvgBpd,
    drillIp30Bpd: preset.drillIp30Bpd,
    drillFirstYearDeclinePct: preset.drillFirstYearDeclinePct,
  };
}

export function calculateWellFiResults(inputs: CalculatorInputs): CalculatorResults {
  const netbackCadPerBbl = resolveNetback(inputs);
  const drillYear1AvgBpdResolved = resolveDrillYear1AvgBpd(inputs);
  const productionUpliftFraction = inputs.productionUpliftPct / 100;
  const runLifeExtensionFraction = inputs.runLifeExtensionPct / 100;
  const extendedRunLifeMonths = inputs.currentRunLifeMonths * (1 + runLifeExtensionFraction);
  const currentWorkoversPerYear = safeDivide(12, inputs.currentRunLifeMonths) ?? 0;
  const extendedWorkoversPerYear = safeDivide(12, extendedRunLifeMonths) ?? 0;
  const avoidedWorkoversPerWellPerYear = Math.max(
    currentWorkoversPerYear - extendedWorkoversPerYear,
    0,
  );
  const avoidedWorkoversPerYear = avoidedWorkoversPerWellPerYear * inputs.candidateWellCount;
  const incrementalBpdPerWell = inputs.avgOilRatePerWellBpd * productionUpliftFraction;
  const totalIncrementalBpd = incrementalBpdPerWell * inputs.candidateWellCount;
  const annualProductionValuePerWellCad = incrementalBpdPerWell * 365 * netbackCadPerBbl;
  const annualWorkoverSavingsPerWellCad =
    avoidedWorkoversPerWellPerYear * inputs.workoverCostPerEventCad;
  const annualTotalValuePerWellCad =
    annualProductionValuePerWellCad + annualWorkoverSavingsPerWellCad;
  const annualProductionValueCad = annualProductionValuePerWellCad * inputs.candidateWellCount;
  const annualWorkoverSavingsCad =
    annualWorkoverSavingsPerWellCad * inputs.candidateWellCount;
  const annualTotalValueCad = annualTotalValuePerWellCad * inputs.candidateWellCount;
  const wellfiCapexTotalCad = inputs.candidateWellCount * inputs.wellfiCostPerWellCad;
  const payoutDays = annualTotalValuePerWellCad > 0
    ? (inputs.wellfiCostPerWellCad / annualTotalValuePerWellCad) * 365
    : null;
  const payoutMonths = payoutDays !== null ? payoutDays / 30.4375 : null;
  const capexPerIncrementalBpdWellFiCad = safeDivide(
    inputs.wellfiCostPerWellCad,
    incrementalBpdPerWell,
  );
  const cashYieldPct = annualTotalValuePerWellCad > 0
    ? (annualTotalValuePerWellCad / inputs.wellfiCostPerWellCad) * 100
    : null;
  const netYear1ReturnPct = annualTotalValuePerWellCad > 0
    ? ((annualTotalValuePerWellCad - inputs.wellfiCostPerWellCad) /
        inputs.wellfiCostPerWellCad) *
      100
    : null;
  const drillAnnualValueCad = drillYear1AvgBpdResolved * 365 * netbackCadPerBbl;
  const drillPayoutMonths = drillAnnualValueCad > 0
    ? (inputs.drillCapexPerWellCad / drillAnnualValueCad) * 12
    : null;
  const drillCapexPerIncrementalBpdCad = safeDivide(
    inputs.drillCapexPerWellCad,
    drillYear1AvgBpdResolved,
  );
  const drillCashYieldPct = drillAnnualValueCad > 0
    ? (drillAnnualValueCad / inputs.drillCapexPerWellCad) * 100
    : null;
  const drillNetYear1ReturnPct = drillAnnualValueCad > 0
    ? ((drillAnnualValueCad - inputs.drillCapexPerWellCad) / inputs.drillCapexPerWellCad) * 100
    : null;
  const capitalEfficiencyAdvantagePct =
    capexPerIncrementalBpdWellFiCad !== null && drillCapexPerIncrementalBpdCad !== null
      ? (1 - capexPerIncrementalBpdWellFiCad / drillCapexPerIncrementalBpdCad) * 100
      : null;
  const sameCapitalDrillWells = safeDivide(wellfiCapexTotalCad, inputs.drillCapexPerWellCad);
  const sameCapitalDrillBpd = sameCapitalDrillWells !== null
    ? sameCapitalDrillWells * drillYear1AvgBpdResolved
    : null;
  const drillCapexNeededToMatchWellFiCad = drillYear1AvgBpdResolved > 0
    ? (totalIncrementalBpd / drillYear1AvgBpdResolved) * inputs.drillCapexPerWellCad
    : null;
  const capitalSavedVsDrillCad = drillCapexNeededToMatchWellFiCad !== null
    ? drillCapexNeededToMatchWellFiCad - wellfiCapexTotalCad
    : null;
  const barrelsPerMillionWellFi = wellfiCapexTotalCad > 0
    ? totalIncrementalBpd / (wellfiCapexTotalCad / 1_000_000)
    : null;
  const barrelsPerMillionDrill = inputs.drillCapexPerWellCad > 0
    ? drillYear1AvgBpdResolved / (inputs.drillCapexPerWellCad / 1_000_000)
    : null;
  const totalValueBase = annualTotalValuePerWellCad > 0 ? annualTotalValuePerWellCad : 0;
  const rawValueSplitProductionPct = totalValueBase > 0
    ? (annualProductionValuePerWellCad / totalValueBase) * 100
    : 0;
  const valueSplitProductionPct = clampPercentage(rawValueSplitProductionPct);
  const valueSplitWorkoverPct = totalValueBase > 0
    ? 100 - valueSplitProductionPct
    : 0;

  const warnings: string[] = [];

  if (netbackCadPerBbl <= 0) {
    warnings.push(
      'Operating netback is at or below zero, so production uplift alone will not pay out under these assumptions.',
    );
  }

  if (annualWorkoverSavingsPerWellCad <= 0) {
    warnings.push(
      'Run-life assumptions do not create measurable annualized workover savings in the current setup.',
    );
  }

  if (inputs.netbackMode === 'detailed' && inputs.gAndACostCadPerBbl > 0) {
    warnings.push(
      'Full corporate G&A is applied to incremental barrels here. Many engineers will prefer a marginal-cost view for screening.',
    );
  }

  if (inputs.drillRateMode === 'ip30') {
    warnings.push(
      'The drill benchmark is using an IP30-to-year-one shortcut. For higher fidelity, replace it with a known year-one average rate.',
    );
  }

  return {
    netbackCadPerBbl,
    drillYear1AvgBpdResolved,
    extendedRunLifeMonths,
    currentWorkoversPerYear,
    extendedWorkoversPerYear,
    avoidedWorkoversPerWellPerYear,
    avoidedWorkoversPerYear,
    incrementalBpdPerWell,
    totalIncrementalBpd,
    annualProductionValuePerWellCad,
    annualWorkoverSavingsPerWellCad,
    annualTotalValuePerWellCad,
    annualProductionValueCad,
    annualWorkoverSavingsCad,
    annualTotalValueCad,
    wellfiCapexTotalCad,
    payoutDays,
    payoutMonths,
    capexPerIncrementalBpdWellFiCad,
    cashYieldPct,
    netYear1ReturnPct,
    valueSplitProductionPct,
    valueSplitWorkoverPct,
    drillAnnualValueCad,
    drillPayoutMonths,
    drillCapexPerIncrementalBpdCad,
    drillCashYieldPct,
    drillNetYear1ReturnPct,
    capitalEfficiencyAdvantagePct,
    sameCapitalDrillWells,
    sameCapitalDrillBpd,
    drillCapexNeededToMatchWellFiCad,
    capitalSavedVsDrillCad,
    barrelsPerMillionWellFi,
    barrelsPerMillionDrill,
    warnings,
  };
}

function resolveNetback(inputs: CalculatorInputs) {
  if (inputs.netbackMode === 'direct') {
    return inputs.operatingNetbackCadPerBbl;
  }

  return (
    inputs.realizedOilPriceCadPerBbl * (1 - inputs.royaltyRatePct / 100) -
    inputs.variableOperatingCostCadPerBbl -
    inputs.transportCostCadPerBbl -
    inputs.gAndACostCadPerBbl
  );
}

function resolveDrillYear1AvgBpd(inputs: CalculatorInputs) {
  if (inputs.drillRateMode === 'average') {
    return inputs.drillYear1AvgBpd;
  }

  return inputs.drillIp30Bpd * (1 - inputs.drillFirstYearDeclinePct / 100 / 2);
}

function safeDivide(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return null;
  }

  return numerator / denominator;
}

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, value));
}
