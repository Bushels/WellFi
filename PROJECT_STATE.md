# Project State

Last verified: 2026-06-16 local QA on `codex/wellfi-hero-calculator`

Current task status: ready to merge to `main`.

## Completed This Session

- Restored and verified local dev at `http://127.0.0.1:3001/wellfi`.
- Made the island hero animation more legible:
  - stronger relay pulse shape and wider pulse bands
  - brighter production-flow chevrons
  - stronger surface-ring and telemetry-readout hits
  - subtle idle camera drift
  - higher high-tier bloom
- Added `?motion=force` so export/QA can run animation even when the host machine has reduced motion enabled.
- Fixed GSAP selector scoping warnings on the homepage scroll effects.
- Fixed the SAGD image path for the `/wellfi` base path.
- Added a repeatable presentation export command:
  - `npm run export:hero`
  - primary output: `exports/wellfi-island-hero-1920x1080-12s-fast.mp4`
  - preview output: `exports/wellfi-island-hero-1280x720-12s-fast-preview.mp4`
  - poster output: `exports/wellfi-island-hero-1920x1080-poster.png`

## Verified

- `npx tsc --noEmit`
- `npm run lint` (passes with the existing `WellFiLogo.tsx` raw `<img>` warning)
- `npm test` (40 tests passing)
- `npm run build`
- Playwright browser checks:
  - `/wellfi` returns 200
  - canvas renders
  - no failed requests
  - no Next.js error overlay
  - normal motion animates
  - reduced motion freezes
  - `?motion=force` animates under reduced-motion settings

## Next Branch Suggestion

Start from `main` and branch for animation-only iteration. Keep the scope narrow:

```powershell
git checkout main
git pull
git checkout -b codex/wellfi-hero-animation-iteration
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Use `npm run export:hero` after each accepted visual pass to regenerate the boardroom MP4.

## Watch Items

- Mobile composition is still crowded by the forest/strata; treat that as the next visual pass, not a bug fix in this closeout.
- The first wheel event over the exact bottom-center canvas area was inconsistent in one Playwright probe, but subsequent wheel events and other canvas positions scrolled. Re-test if the next branch changes `PresentationControls` or canvas event handling.
- The calculator route remains parked at `src/app/_calculator`; do not un-park without Kyle approval.
