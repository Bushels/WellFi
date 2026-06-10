# WellFi Landing Page Rules

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (static export)
npm run lint         # ESLint check
gemini --help        # Gemini CLI for second-opinion troubleshooting
```

## Directory Structure

```text
wellfi-marketing/
|-- src/
|   |-- app/
|   |-- components/
|   |   |-- hero/
|   |   |-- nav/
|   |   |-- highlights/
|   |   |-- tool/
|   |   |-- scada/
|   |   |-- specs/
|   |   |-- contact/
|   |   `-- ui/
|   `-- lib/
|-- docs/
|-- public/
|-- next.config.ts
`-- CLAUDE.md
```

## Brand Rules

- Product name: **WellFi**
- Company: **MPS Group**
- Never use **ResLink**
- Default mark: use `src/components/ui/WellFiLogo.tsx`
- Hero logo treatment: only the hero may animate the WiFi arcs on the `i`

## Design System

### Color Tokens

- `--navy-void`: `#0A0E1A`
- `--charcoal`: `#111827`
- `--text-primary`: `#F9FAFB`
- `--text-secondary`: `#9CA3AF`
- `--em-cyan`: `#06B6D4`
- `--em-glow`: `#22D3EE`
- `--hw-amber`: `#D97706`
- `--border-subtle`: `#1F2937`

### Typography

- Headings: `Space Grotesk`
- Body: `Inter`
- Data/specs: `JetBrains Mono`

### Motion Stack

- GSAP for hero sequencing and scroll reveals
- React Three Fiber for the island hero (R3F + drei + postprocessing)
- SVG for the hero logo signal arcs
- Respect `prefers-reduced-motion`

## Hero — Living Island Diorama (R3F)

Source of truth: `docs/hero-startup-animation.md` and the design spec in
`wellfi-marketing/docs/superpowers/specs/2026-06-10-wellfi-island-hero-r3f-design.md`.
The wave-sweep startup hero was retired 2026-06-10 (Kyle-approved).

### Approved behavior

- Poster paints first (LCP); the R3F canvas cross-fades in when ready
- 12 s seamless lighting cycle: day → dark → 3 relay pulses → relight (`src/lib/island/cycle.ts`)
- Relay grammar: WellFi B (red #EF4444) fires deep in the lateral → WellFi A (cyan) answers at the casing shoe → surface ring
- Drag = PresentationControls with spring-back; pointer parallax when idle; page scroll is never captured
- `prefers-reduced-motion`: frozen lit state, no pulses

### Non-Negotiables

- Do not let the canvas block first paint (poster-first stays)
- Red #EF4444 belongs to WellFi B only; transmission stays cyan
- Pure-math modules (`layout.ts`, `cycle.ts`, `wellPath.ts`) keep their unit tests green (`npm test`)
- The cycle must stay seamless (state at t=12 ≡ t=0)
- No scroll hijacking in the hero

## Code Style

- TypeScript strict mode
- Server Components by default, `'use client'` only when needed
- No runtime CSS-in-JS
- Use `cn()` from `@/lib/utils` for conditional classes
- Every dependency must justify its bundle cost

## Product Quick Reference

### Core Value Proposition

**Know the Unknown**

### Hero Copy

- Headline: `Know the Unknown`
- Subheadline: `Real-Time Wireless Telemetry Tool`
- Proof chips: `130+ Installed Globally`, `Modbus Ready`, `Seamless Install`
- Primary CTA: `Request a Quote` -> `mailto:kylegronning@mpsgroup.ca`

### Key Specs

- Temperature: `150 C [302 F]`
- Pressure: `10,000 psia`
- Data output: `MODBUS RS-485`
- Outer diameter: `46 mm [1.83 in]`

### Physical Assembly

Top Clamp -> Signal Collar -> Electronics Sonde -> Battery Barrel(s) -> PEEK Clamp -> Fiberglass Collar -> Bottom Clamp

### EM Telemetry Path

Sonde -> Signal Collar -> Formation -> Casing -> Surface Receiver -> MODBUS -> SCADA
