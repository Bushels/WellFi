# WellFi Landing Page Rules

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (static export)
npm run lint         # ESLint check
npm run export:hero  # Export boardroom-safe MP4 + preview from the live R3F hero
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
- React Three Fiber for the island hero; GSAP for scroll reveals in sibling sections
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
- Lit phase: cyan production-flow chevrons along the bores; strata use a world-Y procedural bedding shader (`Terrain.tsx`)
- Telemetry readout (`TelemetryReadout.tsx`) pops above the wellhead during the dark phase and snaps to a new channel on each pulse arrival: pressure (kPa) → temperature (°C) → water cut (%, derived from fluid resistivity; "≈" flags it's salinity-calibrated). Values: `IslandScene.tsx` `CHANNEL_VALUES`.
- Mobile (<768px): in-scene labels hidden (they collide with the copy column); the relay color story carries it
- Drag = PresentationControls with spring-back; pointer parallax when idle; page scroll is never captured
- `prefers-reduced-motion`: frozen lit state, no pulses

### Presentation export

- Start local dev at `http://127.0.0.1:3001/wellfi` before exporting.
- `npm run export:hero` captures the live WebGL canvas from `/wellfi?motion=force`.
- Default export is a 24 s capture encoded at 2x speed into `exports/wellfi-island-hero-1920x1080-12s-fast.mp4`.
- The command also writes `exports/wellfi-island-hero-1280x720-12s-fast-preview.mp4` and `exports/wellfi-island-hero-1920x1080-poster.png`.
- Use H.264 MP4, 16:9, 30 fps, `yuv420p`, `+faststart` for boardroom/PowerPoint compatibility.
- Do not rely on canvas `captureStream()` in headless Chrome for this hero; it under-emitted frames in testing. Browser video capture plus FFmpeg produced the verified 720-frame, 24 s source and the final 360-frame, 12 s fast export.

### Non-Negotiables

- Do not let the canvas block first paint (poster-first stays)
- Red #EF4444 belongs to WellFi B only; transmission stays cyan
- Pure-math modules under src/lib/island/ (layout, cycle, wellPath, quality) keep their unit tests green (npm test)
- The cycle must stay seamless (state at t=12 ≡ t=0)
- No scroll hijacking in the hero

## Deploy + local dev (basePath `/wellfi`) — READ THIS

This app is `output: 'export'` + `basePath: '/wellfi'`. The export writes files to `out/`
root but the HTML references `/wellfi/...` assets. The rewrite that strips `/wellfi`
lives on the **mps-corporate-site (mpsgroup.energy)**, NOT on this Vercel project. So:

- ✅ Canonical public URL: **`mpsgroup.energy/wellfi`** (corporate rewrite strips `/wellfi`).
  Local dev: **`localhost:<port>/wellfi`**.
- ✅ The raw **`wellfi-marketing.vercel.app`** URL now renders **standalone** too. `vercel.json`
  adds a `/wellfi/:path* → /:path*` rewrite so the `/wellfi`-prefixed asset refs resolve on the
  bare Vercel domain (applies to production AND preview deploys). Added 2026-06-16. Vercel checks
  the filesystem before rewrites, so `/wellfi/_next/x` (no such file) falls through to `/_next/x`
  (exists) → 200. This does NOT affect `mpsgroup.energy/wellfi` (its proxy strips `/wellfi`
  before Vercel sees it).
- ⚠️ **Deployment Protection** still returns **401 to anonymous** on any `*.vercel.app` URL —
  view it signed into the Vercel team, or turn protection off in project settings to make the
  Vercel URL publicly shareable. (`mpsgroup.energy/wellfi` is public regardless.)
- Promote to production: `vercel --prod` from this dir. After promoting, verify
  `mpsgroup.energy/wellfi/calculator` (and any new sub-route) resolves through the rewrite.

Local dev: `$env:PORT='3002'; npm run dev` (PowerShell). Do NOT use `npm --prefix <dir>
run dev -- -p 3002` — the `-p` mis-forwards as a directory arg. Git worktrees of this
repo need their OWN `node_modules` (`npm ci`); a junction makes Turbopack panic.

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
