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
- Canvas 2D for the startup wave
- SVG for the hero logo signal arcs
- Respect `prefers-reduced-motion`

## Hero Startup Animation

Source of truth: `docs/hero-startup-animation.md`

### Approved Sequence

- Ultra-faint ghost baseline
- Fixed-height left-to-right sine-wave sweep
- WellFi logo at 75% sweep
- `Know the Unknown` at full sweep
- Supporting copy, chips, and CTAs after the headline
- Mouse/touch interaction only after sweep completion
- Hero logo WiFi arcs may pulse only on direct hover/touch/focus interaction

### Non-Negotiables

- Do not reintroduce bottom-up wave motion
- Do not tighten or reshape the wave during intro
- Do not reveal supporting copy before the headline
- Do not decouple GSAP timing from the shared sweep duration constant
- Do not pile extra startup effects onto the approved sequence

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
