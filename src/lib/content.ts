// WellFi Landing Page — Single Source of Truth for All Copy
// Every user-facing string lives here. Components import, never hardcode.

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface HeroContent {
  brandWordmarkAlt: string;
  tagline: string;
  pulseHeadline: string;
  supportLine: string;
  proofChips: string[];
  ctaPrimary: string;
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

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export const hero: HeroContent = {
  brandWordmarkAlt: 'WellFi',
  tagline: 'Data Below. Insight Above.',
  pulseHeadline: 'Stop Pumping Blind.',
  supportLine: 'Real-time downhole pressure through steel casing. No cables. No extra rig time.',
  proofChips: ['130+ installed globally', 'MODBUS RS-485', '5+ year battery'],
  ctaPrimary: 'Request a Quote',
  ctaSecondary: 'View Specifications',
  ctaSecondaryHref: '#details',
};

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export const navLinks: NavLink[] = [
  { label: 'Proof',   href: '#proof' },
  { label: 'Install', href: '#install' },
  { label: 'Details', href: '#details' },
  { label: 'Contact', href: '#contact' },
];

// ---------------------------------------------------------------------------
// Highlight Cards (icon-driven stats)
// ---------------------------------------------------------------------------

export const highlights: HighlightCard[] = [
  {
    icon: 'Wrench',
    value: 'Same',
    unit: 'changeout window',
    label: 'No extra rig time',
    description: 'Deploy on the work already on the calendar.',
  },
  {
    icon: 'Globe',
    value: '130+',
    unit: 'installed globally',
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
    'No new infrastructure required.',
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
    'Produce more and change out less often',
  ],
  asideTitle: 'Why engineers care',
  asideBody:
    'This is an upgrade to an existing producer, not a new drill, a cable install, or a full control-system rebuild. The simplicity is a large part of the value.',
  chips: ['No new cable run', 'MODBUS RS-485', 'Canadian rollout via MPS Group'],
};

// ---------------------------------------------------------------------------
// Specifications Table (metric primary, imperial in brackets)
// ---------------------------------------------------------------------------

export const specs: SpecRow[] = [
  { parameter: 'Tool OD',            value: '46 mm [1.83\u2033]' },
  { parameter: 'Temperature',        value: '150\u00B0C [302\u00B0F]' },
  { parameter: 'Pressure',           value: '68,948 kPa [10,000 psi]' },
  { parameter: 'Pressure Accuracy',  value: '0.15% F.S. (Piezo) | 13.8 kPa [2.0 psi] (Quartz)' },
  { parameter: 'Battery Life',       value: '5+ years' },
  { parameter: 'Data Output',        value: 'MODBUS RS-485, dual 4\u201320 mA' },
  { parameter: 'Surface Receiver',   value: '150 \u00D7 112 \u00D7 55 mm' },
  { parameter: 'Power',              value: '24 V DC / ~3 W' },
  { parameter: 'Storage',            value: '64 MB event SD' },
  { parameter: 'Corrosion',          value: 'NACE MR-01-75 available' },
  { parameter: 'Deployments',        value: '130+ tools installed globally' },
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
  title: 'WellFi \u2014 Retrofit Production Uplift for PCP Wells | MPS Group',
  description:
    'Data Below. Insight Above. Install WellFi on the planned changeout, avoid extra rig time, and bring downhole pressure to surface with minimalist wireless telemetry.',
};
