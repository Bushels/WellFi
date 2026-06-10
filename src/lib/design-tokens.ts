// WellFi Design Token System
// Central reference for colors, typography, spacing, and animation values.
// Import these tokens instead of hardcoding values in components.

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

export const colors = {
  background: {
    primary:   '#0A0E1A',   // navy-void — deepest layer
    secondary: '#111827',   // charcoal — card/section backgrounds
  },
  glass: {
    surface:      'rgba(255, 255, 255, 0.08)',
    surfaceHover: 'rgba(255, 255, 255, 0.12)',
    border:       'rgba(255, 255, 255, 0.15)',
    borderHover:  'rgba(255, 255, 255, 0.2)',
    blur:         '16px',
  },
  text: {
    primary:   '#F9FAFB',   // near-white headings and body
    secondary: '#9CA3AF',   // muted labels and captions
  },
  accent: {
    cyan:  '#EF4444',       // EM energy / primary accent (red-500)
    glow:  '#F87171',       // bright red for animations & hover (red-400)
    amber: '#D97706',       // hardware / industrial callouts
  },
  border: {
    subtle: '#1F2937',      // faint dividers between sections
  },
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const typography = {
  fonts: {
    heading: 'var(--font-heading)',  // Space Grotesk — set in layout.tsx
    body:    'var(--font-body)',     // Inter — set in layout.tsx
    mono:    'var(--font-mono)',     // JetBrains Mono — set in layout.tsx
  },
  weights: {
    light:   300,
    regular: 400,
    medium:  500,
    semi:    600,
    bold:    700,
  },
  sizes: {
    // Headings (desktop → clamp for responsive)
    hero:  'clamp(2.5rem, 5vw, 4.5rem)',     // hero tagline
    h1:    'clamp(2rem, 4vw, 3.5rem)',        // section titles
    h2:    'clamp(1.5rem, 3vw, 2rem)',        // sub-headings
    h3:    'clamp(1.125rem, 2vw, 1.5rem)',    // card titles

    // Body
    body:  '1rem',         // 16px
    small: '0.875rem',     // 14px — captions, table cells
    xs:    '0.75rem',      // 12px — fine print

    // Data display (highlight cards)
    stat:  'clamp(2rem, 4vw, 3rem)',
  },
  lineHeights: {
    tight:  1.1,
    snug:   1.3,
    normal: 1.6,
  },
} as const;

// ---------------------------------------------------------------------------
// Spacing (8px grid)
// ---------------------------------------------------------------------------

export const spacing = {
  sectionY:   'clamp(3.25rem, 7vh, 5.75rem)',   // vertical padding between sections
  containerX: 'clamp(1rem, 5vw, 6rem)',    // horizontal page margins
  cardGap:    '1.5rem',
  gridGap:    '2rem',
} as const;

// ---------------------------------------------------------------------------
// Animation Tokens (GSAP + ScrollTrigger)
// ---------------------------------------------------------------------------

export const animation = {
  entrance: { duration: 0.6, ease: 'power2.out' },
  hover:    { duration: 0.2, ease: 'power1.inOut' },
  stagger:  0.12,                        // seconds between staggered children
  heroCinematic: 4,                      // total hero reveal duration (s)
  heroLoop: {
    duration: 8.5,
    quietEnd: 2.0,
    glimmerEnd: 2.7,
    pulseStart: 2.75,
    pulseEnd: 3.35,
    headlineHoldEnd: 3.8,
    decayEnd: 4.6,
    toolRestOpacity: 0.12,
    headlineRestOpacity: 0.12,
  },
  navSlide: { duration: 0.3, ease: 'back.out(1.2)' },
  scrollReveal: {
    duration: 0.7,
    ease: 'power2.out',
    stagger: 0.1,
    start: 'top 82%',
  },
  counter: {
    duration: 1.4,
    ease: 'power1.inOut',
  },
  glowPulse: {
    duration: 0.6,
    ease: 'power1.inOut',
  },
} as const;

// ---------------------------------------------------------------------------
// Breakpoints (mirrors Tailwind defaults for JS-side checks)
// ---------------------------------------------------------------------------

export const breakpoints = {
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
  xxl: 1536,
} as const;

// ---------------------------------------------------------------------------
// Z-Index Scale
// ---------------------------------------------------------------------------

export const zIndex = {
  background: 0,
  content:    10,
  nav:        50,
  overlay:    60,
  modal:      70,
} as const;
