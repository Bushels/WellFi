# Project State

Last verified: 2026-06-22 — Clearwater Descent IMPLEMENTED + verified; on branch `feat/clearwater-descent`, pending Kyle review/merge.

## Current task: Clearwater Descent

A scroll-driven parallax section replacing the `OneEightTrillionAnchor` ("1.8 trillion barrels")
recognition section. Approved spec: `docs/superpowers/specs/2026-06-22-clearwater-descent-design.md`.
Supersedes the parked cutaway imagegen exploration (imagegen was unreliable for the multilateral geometry).

Status: built across 6 commits (`d026eb4`→`fc96c51`). Verified: tsc/eslint clean, 57/57 vitest,
`next build` ok, live preview (desktop descent + mobile/reduced-motion static fallback + device
image + all 3 copy moves). Awaiting Kyle review/merge.

Locked design:
- Continuous descent through the Clearwater formation — one GSAP `scrub`, no pinning, ~400vh.
- New `src/components/clearwater/*`; replaces `OneEightTrillionAnchor`, keeps `id="anchor"`.
- 6 benefits (order): Pump Life → Production → Drawdown → Reservoir Monitoring → Water Cut → Well Optimization.
- Reveal: isolated device `public/renders/wellfi-device-reveal.png`, tagline "Data Below, Insight Above", no CTA.
- Reduced-motion + mobile → static stacked fallback.
- Copy moves: telemetry heading → "Explore Your Data"; Proof tagline → "Decisions with Proof".

## Parked (do not un-park without Kyle's OK)

- Island hero — approved, parked. Renders/exports in `exports/`; detail in git history.
- Calculator — `src/app/_calculator` (underscore = excluded route); numbers unverified.
- Cutaway imagegen exploration — parked/superseded by Clearwater Descent.
  Handover: `docs/plans/2026-06-20-cutaway-visual-exploration-handover.md`.
  Next *true* cutaway = deterministic R3F/CAD geometry, not imagegen.

## Gates before commit

- `npx tsc --noEmit` · `npm run lint` · `npm test`. Pure-math `src/lib/island/` stays green;
  `cycle.ts` keeps seam invariant `state(12) ≡ state(0)`.

## QA

- Local: `http://127.0.0.1:3001/wellfi`
