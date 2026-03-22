# WellFi Landing Page - Project Context

## Quick Facts
- **Project:** WellFi single-page marketing landing
- **Stack:** Next.js 16, React 19, Tailwind 4, GSAP, Three.js + R3F + Drei
- **Deployment:** Vercel (static export)
- **Brand:** WellFi by MPS Group (mpsgroup.ca)
- **Target:** Cold production engineers in Canadian oilsands

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build (static export)
npm run lint         # ESLint check
```

## Directory Structure
```
wellfi-marketing/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Single landing page (GenesisOverlay + sections)
│   │   ├── layout.tsx          # Root layout (fonts, metadata)
│   │   └── globals.css         # Tailwind + design tokens + glass utilities
│   ├── components/
│   │   ├── genesis/            # Full-screen EM wave intro overlay
│   │   ├── hero/               # Hero section + particle text canvas
│   │   ├── nav/                # Sticky navigation bar
│   │   ├── highlights/         # Feature highlight cards
│   │   ├── tool/               # 3D tool explorer (R3F)
│   │   ├── scada/              # SCADA integration diagram
│   │   ├── specs/              # Specifications table
│   │   ├── contact/            # Contact / CTA footer
│   │   └── ui/                 # Shared UI primitives
│   ├── hooks/                  # Custom React hooks
│   └── lib/
│       ├── content.ts          # Single source of truth for ALL copy
│       ├── design-tokens.ts    # Colors, typography, spacing, animation tokens
│       ├── hero-motion.ts      # Hero loop state machine (may be deprecated)
│       └── utils.ts            # cn() helper
├── public/                     # Static assets
│   ├── images/                 # Hero PNG, etc.
│   └── models/                 # GLB 3D models
├── next.config.ts              # Static export, Turbopack
└── CLAUDE.md                   # This file
```

## Brand Rules
- Product name: **WellFi** (one word, capital W capital F)
- Company: **MPS Group** (footer only — "A product of MPS Group")
- NEVER use "ResLink" — that is the old brand name
- Logo: Use WellFi_Logo_V3.png from public/

## Design System

### Color Tokens (CSS custom properties in globals.css)
| Token            | Hex       | Usage                        |
|------------------|-----------|------------------------------|
| --navy-void      | #0A0E1A   | Page background              |
| --charcoal       | #111827   | Card/section backgrounds     |
| --text-primary   | #F9FAFB   | Headings, body text          |
| --text-secondary | #9CA3AF   | Subtitles, captions          |
| --em-cyan        | #06B6D4   | Primary accent (EM signal)   |
| --em-glow        | #22D3EE   | Glow/highlight variant       |
| --hw-amber       | #D97706   | Hardware callout accent      |
| --border-subtle  | #1F2937   | Dividers, card borders       |

### Typography
- **Headings:** Space Grotesk (700, 500) — `font-heading`
- **Body:** Inter (400, 500) — `font-body`
- **Data/Specs:** JetBrains Mono (400) — `font-mono`

### Glassmorphism
- `.glass-panel` — standard frosted glass
- `.glass-panel-hover` — interactive hover variant
- `.glass-card` — card with gradient glass + hover lift

### Animation
- GSAP one-shot timeline for hero intro sequence (NOT infinite CSS loops)
- GSAP + ScrollTrigger for scroll-driven animations below hero
- Canvas 2D for particle text effects and EM waveform (see `.claude/skills/canvas-animation/`)
- @gsap/react for React integration
- Three.js lazy-loaded via next/dynamic (used in tool explorer section, not hero)
- Respect `prefers-reduced-motion`

### Hero Animation (IN PROGRESS — Creative Direction)
The hero sequence is being redesigned. See `memory/feedback_hero_animation.md` for full context.
- **Current vision**: EM waveform powers up from darkness → wave morphs into "STOP PUMPING BLIND." text → tool fades in and pulses → tool ghosts → page reveals
- **Tech**: Canvas 2D for wave + particles, GSAP for orchestration
- **Key principle**: Prototype each animation phase INDEPENDENTLY before stitching together
- **Do NOT build the full sequence in one pass** — this was tried and lost coherence

## Code Style
- TypeScript strict mode
- Server Components by default, `'use client'` only when needed
- No runtime CSS-in-JS — Tailwind utility classes only
- `cn()` from `@/lib/utils` for conditional classes
- Every dependency must justify its bundle cost

## Product Quick Reference

### WellFi Core Value Proposition
**"Wireless Below. Insight Above."**
Real-time downhole monitoring through steel casing via EM telemetry. 5+ year battery. SCADA-ready.

### Key Specifications
| Parameter                     | Value               |
|-------------------------------|---------------------|
| Temperature Rating            | 302 deg F (150 deg C)|
| Pressure Rating               | 10,000 psi          |
| Battery Life                  | 5+ years             |
| Outer Diameter                | 1.83" (46mm)         |
| Pressure Resolution (Piezo)   | 0.04 psi             |
| Pressure Resolution (Quartz)  | 0.006 psi            |
| Data Output                   | MODBUS RS-485        |
| Optional Output               | 4-20mA               |

### Physical Assembly (top to bottom)
1. Top Clamp -> Signal Collar -> Electronics Sonde -> Battery Barrel(s) -> PEEK Clamp -> Fiberglass Collar -> Bottom Clamp

### EM Telemetry Signal Path
Sonde -> Signal Collar -> Pup Joint #1 -> Formation (via fiberglass isolation) -> Casing -> Surface Box -> MODBUS -> SCADA

### DeltaPressure Feature
Exception-based alerting: monitors at short intervals, transmits on schedule, sends immediate alert if reading exceeds threshold.
