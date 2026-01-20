// WellFi Design System Constants

export const colors = {
  wellfiNavy: '#1a365d',
  wellfiBlue: '#2563eb',
  wellfiCyan: '#22d3ee',
  wellfiTeal: '#0d9488',
  wellfiSlate: '#0f172a',
  wellfiSlate800: '#1e293b',
  wellfiWhite: '#f8fafc',
} as const;

export const specs = {
  temperature: '302°F (150°C)',
  pressure: '10,000 psi',
  batteryLife: '5+ years',
  outerDiameter: '1.83" (46mm)',
  pressureResolutionPiezo: '0.04 psi',
  pressureResolutionQuartz: '0.006 psi',
  dataOutput: 'MODBUS RS-485',
  optionalOutput: '4-20mA',
  surfaceBoxMemory: '7,768 events',
} as const;

export const content = {
  tagline: 'Wireless Below. Insight Above.',
  headline: 'Real-time downhole monitoring. Wirelessly. For 5+ years.',
  subtext: '5+ year battery life. SCADA-ready. Zero cables.',
  sections: {
    benefits: {
      title: 'Reliable. Simple. Powerful.',
      items: [
        { icon: 'zap', label: 'Instant Data', description: 'Real-time pressure and temperature readings' },
        { icon: 'plug', label: 'SCADA-Ready', description: 'MODBUS RS-485 output to your existing systems' },
        { icon: 'battery', label: '5+ Year Battery', description: 'Deploy and forget with modular capacity' },
        { icon: 'radio', label: 'Through-Casing', description: 'EM telemetry works where others fail' },
        { icon: 'clock', label: 'Minimal Rig Time', description: 'Install during pump changeout' },
        { icon: 'trending-up', label: 'Potential Uplift', description: 'Optimize production with data' },
        { icon: 'settings', label: 'Increased Pump Life', description: 'Prevent burnout with head management' },
      ],
    },
    technology: {
      title: 'Electromagnetic Telemetry — The New Standard',
      subtitle: 'Transmits through steel casing using low-frequency EM signals',
    },
    product: {
      title: 'Modular Design. Engineered Integrity.',
      components: [
        { name: 'Signal Collar', description: 'Bare-metal contact for signal transmission', position: 1 },
        { name: 'Electronics Sonde', description: 'Precision sensors and transmitter', position: 2 },
        { name: 'Battery Barrel', description: 'Modular capacity options (17/34/51 Ah)', position: 3 },
        { name: 'PEEK Clamp', description: 'Vibration dampening for longevity', position: 4 },
        { name: 'Fiberglass Collar', description: 'Electrical isolation for through-formation telemetry', position: 5 },
      ],
    },
    installation: {
      title: 'Quicker Install. No Strings Attached.',
      steps: [
        { step: 1, label: 'Makeup on Surface', description: 'Attach to pup joints' },
        { step: 2, label: 'Run with Tubing', description: 'Standard EUE connections' },
        { step: 3, label: 'Connect Surface Box', description: 'BNC cables to wellhead and ground stake' },
      ],
    },
    integration: {
      title: 'Plug and Play',
      flow: ['Wellhead', 'Surface Box', 'RTU', 'SCADA'],
    },
    intelligence: {
      title: "Deploy and Forget. We'll Alert You.",
      subtitle: 'DeltaPressure exception-based alerting',
    },
    results: {
      title: 'Less Downtime. Fewer Workovers. Optimized Production.',
      installCount: '130+',
      installLabel: 'installs and counting',
    },
    specifications: {
      title: 'The Details. For When You\'re Ready to Go Deeper.',
    },
    cta: {
      title: 'Become Wireless',
      primaryButton: 'Contact Us Now',
      secondaryButton: 'Download Tech Sheet',
    },
  },
} as const;

// Full specification table data
export const specificationTable = [
  { parameter: 'Temperature Rating', value: '302°F (150°C)' },
  { parameter: 'Pressure Rating', value: '10,000 psi' },
  { parameter: 'Battery Life', value: '5+ years' },
  { parameter: 'Outer Diameter', value: '1.83" (46mm)' },
  { parameter: 'Pressure Resolution (Piezo)', value: '0.04 psi' },
  { parameter: 'Pressure Resolution (Quartz)', value: '0.006 psi' },
  { parameter: 'Data Output', value: 'MODBUS RS-485' },
  { parameter: 'Optional Output', value: '4-20mA' },
  { parameter: 'Surface Box Memory', value: '7,768 events' },
] as const;
