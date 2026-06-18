// WellFi Landing Page — Single Source of Truth for All Copy
// Every user-facing string lives here. Components import, never hardcode.

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface HeroContent {
  brandWordmarkAlt: string;
  headline: string;
  subheadline: string;
  proofChips: string[];
  ctaPrimary: string;
  ctaPrimaryHref: string;
  ctaSecondary: string;
  ctaSecondaryHref: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface HighlightCard {
  icon: string; // lucide-react icon name
  value: string;
  unit: string;
  label: string;
  description: string;
}

export interface ToolComponent {
  name: string;
  description: string;
  material: string; // Folder / stack key used for the assembly view
}

export interface SpecRow {
  parameter: string;
  value: string; // metric primary [imperial]
}

export interface IntegrationContent {
  title: string;
  description: string;
  flow: string[];
}

export interface WorkflowContent {
  eyebrow: string;
  title: string;
  description: string;
  flow: string[];
  asideTitle: string;
  asideBody: string;
  chips: string[];
}

export interface TelemetryMetric {
  icon: string;
  label: string;
  shortLabel: string;
  description: string;
}

export interface TelemetryCallout {
  id: string;
  label: string;
  value: string;
  description: string;
  xPercent: number;
  yPercent: number;
}

export interface TelemetryPlacementMode {
  id: 'below-pump' | 'behind-casing' | 'dual-wellfi';
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  callouts: TelemetryCallout[];
}

export interface TelemetryApplicationCard {
  icon: string;
  title: string;
  description: string;
}

export interface TelemetryContent {
  eyebrow: string;
  title: string;
  description: string;
  metricSummary: string;
  metrics: TelemetryMetric[];
  hydrostaticHead: {
    title: string;
    description: string;
    label: string;
  };
  placementModes: TelemetryPlacementMode[];
  applications: TelemetryApplicationCard[];
}

export interface ProofPoint {
  icon: string; // lucide-react icon name
  value: string;
  unit?: string;
  label: string;
  side: 'left' | 'right';
}

export interface ProofContent {
  eyebrow: string;
  points: ProofPoint[];
  trustLine: string;
  trustSub: string;
  ctaHeading: string;
  ctaBody: string;
  ctaChips: string[];
}

export interface FooterContent {
  cta: string;
  email: string;
  distributor: string;
  copyright: string;
}

export interface MetaContent {
  title: string;
  description: string;
}

export interface StitchLabContent {
  eyebrow: string;
  title: string;
  description: string;
  cloudProjectHint: string;
  projectIdHint: string;
  promptPlaceholder: string;
}

export interface CalculatorFieldCopy {
  label: string;
  hint: string;
  unit?: string;
}

export interface CalculatorContent {
  teaserEyebrow: string;
  teaserTitle: string;
  teaserDescription: string;
  teaserChips: string[];
  benchmarkSummary: string;
  contactPrompt: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  pageEyebrow: string;
  pageTitle: string;
  pageDescription: string;
  pageBody: string;
  presetLabel: string;
  scenarioLabel: string;
  scenarios: {
    average: string;
    top10: string;
    custom: string;
  };
  groups: {
    compact: string;
    production: string;
    wellfi: string;
    economics: string;
    drill: string;
  };
  modes: {
    directNetback: string;
    detailedNetback: string;
    averageRate: string;
    ip30Rate: string;
  };
  fields: {
    candidateWellCount: CalculatorFieldCopy;
    avgOilRatePerWellBpd: CalculatorFieldCopy;
    wellfiCostPerWellCad: CalculatorFieldCopy;
    productionUpliftPct: CalculatorFieldCopy;
    currentRunLifeMonths: CalculatorFieldCopy;
    runLifeExtensionPct: CalculatorFieldCopy;
    workoverCostPerEventCad: CalculatorFieldCopy;
    operatingNetbackCadPerBbl: CalculatorFieldCopy;
    realizedOilPriceCadPerBbl: CalculatorFieldCopy;
    royaltyRatePct: CalculatorFieldCopy;
    variableOperatingCostCadPerBbl: CalculatorFieldCopy;
    transportCostCadPerBbl: CalculatorFieldCopy;
    gAndACostCadPerBbl: CalculatorFieldCopy;
    drillCapexPerWellCad: CalculatorFieldCopy;
    drillYear1AvgBpd: CalculatorFieldCopy;
    drillIp30Bpd: CalculatorFieldCopy;
    drillFirstYearDeclinePct: CalculatorFieldCopy;
  };
  metrics: {
    payout: string;
    annualValuePerWell: string;
    totalProgramValue: string;
    capexPerBarrel: string;
    capitalSaved: string;
    cashYield: string;
    netReturn: string;
    productionValue: string;
    workoverSavings: string;
    drillBenchmark: string;
    sameCapital: string;
    showMath: string;
    warnings: string;
  };
  buttons: {
    openFull: string;
    requestQuote: string;
    reset: string;
    backHome: string;
    viewSpecs: string;
  };
  notes: string[];
  provenance: {
    aer: string;
    financials: string;
    uplift: string;
    runLife: string;
    workover: string;
    fullDisclaimer: string;
  };
  presetSelectorLabel: string;
  customLabel: string;
  verdictBothWin: string;
  verdictPayoutWin: string;
  verdictCapexWin: string;
  verdictDrillWin: string;
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export const hero: HeroContent = {
  brandWordmarkAlt: 'WellFi',
  headline: 'Know the Unknown',
  subheadline: '1.8 trillion barrels. Waiting.',
  proofChips: ['100+ Installed Internationally', 'Modbus Ready', 'Planned Changeout'],
  ctaPrimary: 'See Closer',
  ctaPrimaryHref: 'mailto:kylegronning@mpsgroup.ca',
  ctaSecondary: 'Continue',
  ctaSecondaryHref: '#anchor',
};

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export const navLinks: NavLink[] = [
  { label: 'Telemetry', href: '#telemetry' },
  { label: 'SAGD',      href: '#sagd-interactive' },
  { label: 'Proof',     href: '#proof' },
];

// ---------------------------------------------------------------------------
// Highlight Cards (icon-driven stats)
// ---------------------------------------------------------------------------

export const highlights: HighlightCard[] = [
  {
    icon: 'Wrench',
    value: 'Same',
    unit: 'changeout window',
    label: 'Planned changeout',
    description: 'Deploy on the work already on the calendar.',
  },
  {
    icon: 'Globe',
    value: '100+',
    unit: 'installed internationally',
    label: 'Field-proven base',
    description: 'Established hardware, not a concept render.',
  },
  {
    icon: 'ChartColumnIncreasing',
    value: 'MODBUS',
    unit: 'RS-485 output',
    label: 'Surface-ready signal',
    description: 'Bring pressure above without rebuilding the stack.',
  },
];

// ---------------------------------------------------------------------------
// Tool Assembly (4 labelled components, top-to-bottom)
// ---------------------------------------------------------------------------

export const toolComponents: ToolComponent[] = [
  {
    name: 'Top Clamp',
    description: 'Locks the stack to the assembly and keeps the upper seal tight.',
    material: 'top-clamp',
  },
  {
    name: 'Signal Collar',
    description: 'Routes the EM dipole cleanly into the casing path.',
    material: 'signal-collar',
  },
  {
    name: 'Electronics Sonde',
    description: 'Pressure, temperature, telemetry, and control logic in one core.',
    material: 'electronics-sonde',
  },
  {
    name: 'Battery Barrel(s)',
    description: 'Long-life power stack sized for multi-year downhole service.',
    material: 'battery-barrels',
  },
  {
    name: 'PEEK Clamp',
    description: 'High-temperature isolation and electrical separation.',
    material: 'peek-clamp',
  },
  {
    name: 'Fiberglass Collar',
    description: 'Non-conductive isolation that preserves the EM signal path.',
    material: 'fiberglass-collar',
  },
  {
    name: 'Bottom Clamp',
    description: 'Anchors the lower end of the stack and closes the assembly.',
    material: 'bottom-clamp',
  },
];

// ---------------------------------------------------------------------------
// SCADA / Integration
// ---------------------------------------------------------------------------

export const integration: IntegrationContent = {
  title: 'Plug & Play SCADA',
  description:
    'EM signal transmits through earth to surface receiver. ' +
    'Decoded data outputs via MODBUS RS-485 to your existing RTU/SCADA. ' +
    'No downhole cable run required.',
  flow: ['Downhole Gauge', 'EM Signal', 'Surface Receiver', 'RTU / SCADA'],
};

export const workflow: WorkflowContent = {
  eyebrow: 'How it fits',
  title: 'Built for Planned PCP Changeouts',
  description:
    'The value is timing. If the pump is already coming out, WellFi can go in during the same intervention, start sending pressure to surface, and give engineers a live basis to tune production.',
  flow: [
    'Scheduled PCP changeout',
    'Install WellFi in the string',
    'Read downhole pressure at surface',
    'Tune pump speed and drawdown',
    'Tune from pressure trends earlier',
  ],
  asideTitle: 'Why engineers care',
  asideBody:
    'This is an upgrade to an existing producer, not a new drill, a cable install, or a full control-system rebuild. The simplicity is a large part of the value.',
  chips: ['No new cable run', 'MODBUS RS-485', 'Canadian rollout via MPS Group'],
};

// ---------------------------------------------------------------------------
// Telemetry Scrollytelling
// ---------------------------------------------------------------------------

export const telemetry: TelemetryContent = {
  eyebrow: 'Below-pump telemetry',
  title: 'Wireless Data Where Lift Decisions Are Made',
  description:
    'Place WellFi below pump, behind casing, or across dual-tool intervals to monitor downhole conditions without running cable.',
  metricSummary: 'Pressure. Temperature. Vibration. Water cut. Flow insight.',
  metrics: [
    {
      icon: 'Gauge',
      label: 'Pressure',
      shortLabel: 'Pressure',
      description: 'Track pump-intake and reservoir response pressure where the lift decision is made.',
    },
    {
      icon: 'Thermometer',
      label: 'Temperature',
      shortLabel: 'Temp',
      description: 'Watch temperature trends that show changing downhole conditions and operating state.',
    },
    {
      icon: 'Activity',
      label: 'Vibration',
      shortLabel: 'Vibration',
      description: 'Use vibration changes as an early signal of pump stress, interference, or abnormal operation.',
    },
    {
      icon: 'Droplets',
      label: 'Water Cut',
      shortLabel: 'Water Cut',
      description: 'Track changing produced-fluid conditions from the tool location or dual-tool layouts.',
    },
    {
      icon: 'TrendingUp',
      label: 'Flow Insight',
      shortLabel: 'Flow',
      description: 'Use paired pressure, temperature, and fluid-condition changes to interpret interval behavior.',
    },
  ],
  hydrostaticHead: {
    title: 'Hydrostatic Head',
    label: 'Fluid column around pump',
    description:
      'The pressure reading is interpreted against the fluid column around the pump intake, helping engineers see drawdown instead of guessing from surface behavior alone.',
  },
  placementModes: [
    {
      id: 'below-pump',
      label: 'Below Pump',
      eyebrow: 'Primary application',
      title: 'Measure below the pump before changing the pump.',
      description:
        'Below-pump WellFi gives engineers pressure, temperature, vibration, water-cut, and flow insight at the point where lift decisions are made.',
      callouts: [
        {
          id: 'intake-pressure',
          label: 'Pump-intake pressure',
          value: 'P intake',
          description: 'Pressure below the pump, read against the local fluid column.',
          xPercent: 54,
          yPercent: 38,
        },
        {
          id: 'pump-vibration',
          label: 'Vibration',
          value: 'mm/s RMS',
          description: 'Pump vibration trend for stress, pump-off, or interference signals.',
          xPercent: 42,
          yPercent: 50,
        },
        {
          id: 'fluid-change',
          label: 'Water cut',
          value: 'Fluid trend',
          description: 'Changing produced-fluid condition close to the lift point.',
          xPercent: 60,
          yPercent: 61,
        },
      ],
    },
    {
      id: 'behind-casing',
      label: 'Behind Casing',
      eyebrow: 'Expansion application',
      title: 'Move the same telemetry logic outside the intermediate.',
      description:
        'Behind-casing or intermediate placement supports reservoir-pressure trends and condition changes where a wired gauge is difficult to justify.',
      callouts: [
        {
          id: 'behind-casing-pressure',
          label: 'Behind-casing pressure',
          value: 'Trend',
          description: 'Reservoir response trend outside the main lift string.',
          xPercent: 34,
          yPercent: 45,
        },
        {
          id: 'surface-handoff',
          label: 'Wireless handoff',
          value: 'No cable',
          description: 'Data reaches surface without running a downhole cable.',
          xPercent: 66,
          yPercent: 30,
        },
      ],
    },
    {
      id: 'dual-wellfi',
      label: 'Dual WellFi',
      eyebrow: 'Advanced layout',
      title: 'Use paired tools to read interval behavior.',
      description:
        'Dual WellFi layouts compare pressure, temperature, and fluid-condition changes across an interval to show directional interval behavior.',
      callouts: [
        {
          id: 'upper-tool',
          label: 'Upper WellFi',
          value: 'P1',
          description: 'Upper interval reference point.',
          xPercent: 45,
          yPercent: 34,
        },
        {
          id: 'lower-tool',
          label: 'Lower WellFi',
          value: 'P2',
          description: 'Lower interval reference point for differential behavior.',
          xPercent: 58,
          yPercent: 68,
        },
        {
          id: 'interval-insight',
          label: 'Interval response',
          value: 'P1 - P2',
          description: 'Pressure and fluid-condition change across the interval.',
          xPercent: 68,
          yPercent: 52,
        },
      ],
    },
  ],
  applications: [
    {
      icon: 'Settings2',
      title: 'Pump Optimization',
      description: 'Below-pump pressure, temperature, and vibration for pump intake and head monitoring.',
    },
    {
      icon: 'Gauge',
      title: 'Drawdown Management',
      description: 'Increase drawdown with better confidence instead of guessing where the pump is operating.',
    },
    {
      icon: 'LineChart',
      title: 'Pressure Build-Up Testing',
      description: 'Shut in the well and watch pressure recovery without running cable.',
    },
    {
      icon: 'Radar',
      title: 'Reservoir Pressure Monitoring',
      description: 'Track bottomhole or behind-casing pressure trends over time.',
    },
    {
      icon: 'Droplets',
      title: 'Water Cut Tracking',
      description: 'Track changing produced-fluid conditions from behind casing or dual-tool layouts.',
    },
    {
      icon: 'TrendingUp',
      title: 'Flow Insight',
      description: 'Use paired pressure, temperature, water-cut, and interval changes to interpret flow behavior.',
    },
    {
      icon: 'ShieldAlert',
      title: 'Pump Protection',
      description: 'Detect pressure-change events, pump-off trends, gas interference, or abnormal vibration earlier.',
    },
    {
      icon: 'Cable',
      title: 'Cableless Gauge Backup',
      description: 'Add wireless backup or retrofit telemetry where wired gauges are expensive, risky, or already failed.',
    },
  ],
};

// ---------------------------------------------------------------------------
// Proof Section (unified image-spine layout)
// ---------------------------------------------------------------------------

export const proof: ProofContent = {
  eyebrow: 'The tool',
  points: [
    { icon: 'Radio',        value: 'MODBUS',  label: 'Straight to SCADA',    side: 'left' },
    { icon: 'BatteryFull',  value: '5+',      unit: 'yr',  label: 'Battery Life',  side: 'left' },
    { icon: 'Wrench',       value: 'Same',    label: 'Changeout Window',     side: 'left' },
    { icon: 'Gauge',        value: '10,000',  unit: 'psi', label: 'Pressure Rating', side: 'right' },
    { icon: 'Thermometer',  value: '150',     unit: '°C',  label: 'Temperature',    side: 'right' },
    { icon: 'Ruler',        value: '46',      unit: 'mm',  label: 'Tool OD',        side: 'right' },
  ],
  trustLine: '100+ installed internationally',
  trustSub: 'No downhole cable run · MODBUS-ready surface handoff',
  ctaHeading: 'Review a candidate well.',
  ctaBody: 'Talk directly with MPS Group about candidate wells, changeout timing, fit, and what data you need before a deployment decision.',
  ctaChips: ['Candidate-well review', 'Planned PCP changeouts', 'MPS Group Canadian support'],
};

// ---------------------------------------------------------------------------
// Specifications Table (metric primary, imperial in brackets)
// ---------------------------------------------------------------------------

export const specs: SpecRow[] = [
  { parameter: 'Tool OD',            value: '46 mm [1.83\u2033]' },
  { parameter: 'Temperature',        value: '150\u00B0C [302\u00B0F]' },
  { parameter: 'Pressure',           value: '68,948 kPa(a) [10,000 psia]' },
  { parameter: 'Pressure Accuracy',  value: '0.15% F.S. (Piezo) | 13.8 kPa [2.0 psi] (Quartz)' },
  { parameter: 'Battery Life',       value: '5+ years' },
  { parameter: 'Data Output',        value: 'MODBUS RS-485, dual 4\u201320 mA' },
  { parameter: 'Surface Receiver',   value: '150 \u00D7 112 \u00D7 55 mm' },
  { parameter: 'Power',              value: '24 V DC / ~3 W' },
  { parameter: 'Storage',            value: '64 MB event SD' },
  { parameter: 'Corrosion',          value: 'NACE MR-01-75 available' },
  { parameter: 'Deployments',        value: '100+ tools installed internationally' },
];

// ---------------------------------------------------------------------------
// Technology Section
// ---------------------------------------------------------------------------

export const technology = {
  title: 'Electromagnetic Telemetry',
  subtitle: 'Low-frequency EM signals through steel casing and formation.',
} as const;

// ---------------------------------------------------------------------------
// Footer / CTA
// ---------------------------------------------------------------------------

export const footer: FooterContent = {
  cta: 'Email MPS Group',
  email: 'kylegronning@mpsgroup.ca',
  distributor: 'MPS Group \u2014 Exclusive Canadian Distributor',
  copyright: '\u00A9 2026 MPS Group',
};

// ---------------------------------------------------------------------------
// Calculator
// ---------------------------------------------------------------------------

export const calculator: CalculatorContent = {
  teaserEyebrow: 'Seeing is Believing.',
  teaserTitle: 'Screen candidate wells with MPS Group.',
  teaserDescription: 'Public calculator assumptions are parked until the benchmark and claim boundary are approved for publication.',
  teaserChips: ['Candidate screening', 'Operator assumptions', 'Contact for model'],
  benchmarkSummary:
    'Built from four Clearwater and Bluesky operators using the latest publicly available production data and corporate reports.',
  contactPrompt:
    'If they want the modeled benchmark assumptions behind the screen, that is the point where they contact MPS Group.',
  emptyStateTitle: 'Enter your own assumptions to see the WellFi case.',
  emptyStateDescription:
    'Add your own base rate, netback, drill benchmark, WellFi capital, expected uplift, and PCP run-life assumptions. The outputs stay intentionally simple.',
  pageEyebrow: 'WellFi Calculator',
  pageTitle: 'A simple engineer screen for retrofit value in Clearwater and Bluesky.',
  pageDescription:
    'Compare WellFi against drilling using your own well assumptions, grounded in a Clearwater and Bluesky benchmark built from four operators\' latest publicly available production data and corporate reports.',
  pageBody:
    'This is a lightweight contact-driving screen, not a full engineering model. It is designed to show whether the retrofit deserves a deeper conversation.',
  presetLabel: 'Benchmark basis',
  scenarioLabel: 'Mode',
  scenarios: {
    average: 'Average fleet',
    top10: 'Top 10%',
    custom: 'Custom',
  },
  groups: {
    compact: 'Calculator preview',
    production: 'Your well set',
    wellfi: 'Your WellFi assumptions',
    economics: 'Your economics',
    drill: 'Your drill benchmark',
  },
  modes: {
    directNetback: 'Direct netback',
    detailedNetback: 'Price and cost stack',
    averageRate: 'Year-1 average rate',
    ip30Rate: 'IP30 + decline',
  },
  fields: {
    candidateWellCount: {
      label: 'Candidate wells',
      hint: 'How many changeout candidates you want to screen in one program.',
      unit: 'wells',
    },
    avgOilRatePerWellBpd: {
      label: 'Average oil rate per well',
      hint: 'Use a sustained producing rate, not flush production.',
      unit: 'bbl/d',
    },
    wellfiCostPerWellCad: {
      label: 'Your assumed WellFi capital',
      hint: 'Enter the per-well retrofit capital you want to test.',
      unit: 'C$',
    },
    productionUpliftPct: {
      label: 'Your assumed uplift',
      hint: 'Enter the year-one average production improvement you want to test.',
      unit: '%',
    },
    currentRunLifeMonths: {
      label: 'Current pump run life',
      hint: 'Average months between changeouts for the candidate well set.',
      unit: 'months',
    },
    runLifeExtensionPct: {
      label: 'Your assumed PCP life extension',
      hint: 'Enter the pump-life improvement you want to test.',
      unit: '%',
    },
    workoverCostPerEventCad: {
      label: 'Workover cost per event',
      hint: 'Use the direct intervention cost you want to annualize.',
      unit: 'C$',
    },
    operatingNetbackCadPerBbl: {
      label: 'Operating netback',
      hint: 'The cleanest screening input if you already know your dollars kept per produced barrel.',
      unit: 'C$/bbl',
    },
    realizedOilPriceCadPerBbl: {
      label: 'Realized oil price',
      hint: 'Use realized pricing if you have it, not just headline WCS.',
      unit: 'C$/bbl',
    },
    royaltyRatePct: {
      label: 'Royalty rate',
      hint: 'Flat screening assumption. Real royalties are price and well sensitive.',
      unit: '%',
    },
    variableOperatingCostCadPerBbl: {
      label: 'Variable operating cost',
      hint: 'Incremental cost basis is usually more defensible than full corporate cost.',
      unit: 'C$/bbl',
    },
    transportCostCadPerBbl: {
      label: 'Transportation',
      hint: 'Use the portion that moves with each extra barrel.',
      unit: 'C$/bbl',
    },
    gAndACostCadPerBbl: {
      label: 'G&A burden',
      hint: 'Optional. Keep this low if you want a marginal rather than corporate cost view.',
      unit: 'C$/bbl',
    },
    drillCapexPerWellCad: {
      label: 'Drill and complete cost',
      hint: 'All-in capital required for the benchmark new well.',
      unit: 'C$',
    },
    drillYear1AvgBpd: {
      label: 'Drill year-1 average rate',
      hint: 'Preferred benchmark for comparing sustained incremental barrels.',
      unit: 'bbl/d',
    },
    drillIp30Bpd: {
      label: 'Drill IP30 rate',
      hint: 'Only use this path if you do not have a known year-one average rate.',
      unit: 'bbl/d',
    },
    drillFirstYearDeclinePct: {
      label: 'First-year decline',
      hint: 'Screening shortcut used to convert IP30 into a year-one average rate.',
      unit: '%',
    },
  },
  metrics: {
    payout: 'Payout',
    annualValuePerWell: 'Annual value per well',
    totalProgramValue: 'Total program value',
    capexPerBarrel: 'Capex per incremental bbl/d',
    capitalSaved: 'Capital saved vs drilling',
    cashYield: 'Year-1 cash yield',
    netReturn: 'Net year-1 return',
    productionValue: 'Production uplift value',
    workoverSavings: 'Annualized workover savings',
    drillBenchmark: 'Drill benchmark',
    sameCapital: 'Same capital drill result',
    showMath: 'View calculation detail',
    warnings: 'Assumption flags',
  },
  buttons: {
    openFull: 'Open Full Calculator',
    requestQuote: 'Contact MPS Group',
    reset: 'Clear Inputs',
    backHome: 'Back to Home',
    viewSpecs: 'View Specifications',
  },
  notes: [
    'Built from four Clearwater and Bluesky operators using latest public production data and corporate reports.',
    'The drill comparison is normalized to year-one average rate instead of IP30 so the capital-efficiency math stays apples-to-apples.',
    'Workover savings are annualized screening values. A single well does not literally have fractional workovers.',
    'Use your own assumptions. The page intentionally does not publish a canned WellFi price, uplift claim, or pump-life claim.',
  ],
  provenance: {
    aer: 'Production data: AER public filings, February 2026',
    financials: 'Corporate financials: latest public reports (Q4/FY2025, 2026 guidance)',
    uplift: 'WellFi uplift: average of estimated uplift observed across existing installations',
    runLife: 'Run-life extension: calculated, varies by operator and use case',
    workover: 'Workover costs: estimated $50K\u2013$60K/event \u2014 update with actual field data',
    fullDisclaimer: 'Built from four Clearwater and Bluesky operators using AER February 2026 production reports and the latest corporate financial disclosures. All prices in Canadian dollars. WellFi assumptions reflect field-observed averages, not guaranteed outcomes.',
  },
  presetSelectorLabel: 'Benchmark basis',
  customLabel: 'Custom \u2014 enter your own',
  verdictBothWin: 'Under these assumptions, WellFi pays back faster and buys incremental barrels more efficiently than drilling.',
  verdictPayoutWin: 'Under these assumptions, WellFi pays back faster, but the capital-efficiency comparison is closer and worth discussing.',
  verdictCapexWin: 'Under these assumptions, WellFi buys barrels more cheaply, but the payout speed is tighter than the drill benchmark.',
  verdictDrillWin: 'Under these assumptions, the drill benchmark is stronger. That usually means the candidate well set or the WellFi assumptions need a second look.',
};

// ---------------------------------------------------------------------------
// Stitch Lab
// ---------------------------------------------------------------------------

export const stitchLab: StitchLabContent = {
  eyebrow: 'Google Stitch Lab',
  title: 'Authenticate and Generate UI Concepts',
  description:
    'Connect your Google account, load your Stitch projects, and generate interface concepts directly from the site.',
  cloudProjectHint:
    'Google Cloud project ID used for OAuth quota and billing. This is your Google Cloud project, not the Stitch design project.',
  projectIdHint:
    'Select an existing Stitch project or create a new one below, then generate screens from prompts.',
  promptPlaceholder:
    'A production dashboard for heavy-oil wells with pressure, temperature, runtime, and alarm status cards.',
};

// ---------------------------------------------------------------------------
// Meta Tags
// ---------------------------------------------------------------------------

export const meta: MetaContent = {
  title: 'WellFi \u2014 Know the Unknown | MPS Group',
  description:
    '1.8 trillion barrels locked in place. Waiting. Seeing is Believing. Install WellFi on the planned changeout and bring downhole pressure to surface with minimalist wireless telemetry.',
};
