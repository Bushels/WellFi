# Project State

Last verified: 2026-06-18 local QA on wide top-of-casing telemetry rendition.

Current task status: merged to `master` for live review.

## Parked Rendition

- Single WellFi is located inside the intermediate casing on the lower cased run, below the pump/tag-bar zone.
- The hero darkens while staying zoomed out on the wide wellbore view, shows the telemetry bubble at the top of the intermediate casing, then relights while remaining wide.
- Telemetry bubble values:
  - Pressure: `158 kPa`
  - Temperature: `26 C`
  - Pump vibration: `4.2 mm/s RMS`
- Pump vibration unit call: use `mm/s RMS` for the field/SCADA-style readout; keep `g RMS` as the raw accelerometer-style alternative only if a future technical page needs it.
- Export workflow now preserves marked HTML overlays with `data-wellfi-export-overlay` and writes MP4 plus GIF assets.

## Generated Assets

- Normal-speed MP4: `exports/wellfi-island-hero-1920x1080-12s.mp4`
- Normal-speed GIF: `exports/wellfi-island-hero-960x540-12s.gif`
- Fast boardroom MP4: `exports/wellfi-island-hero-1920x1080-12s-fast.mp4`
- Fast GIF: `exports/wellfi-island-hero-960x540-12s-fast.gif`
- Preview MP4s:
  - `exports/wellfi-island-hero-1280x720-12s-preview.mp4`
  - `exports/wellfi-island-hero-1280x720-12s-fast-preview.mp4`
- Poster: `exports/wellfi-island-hero-1920x1080-poster.png`

## Verified

- `npx tsc --noEmit`
- `npm run lint` (passes with the existing `WellFiLogo.tsx` raw `<img>` warning)
- `npm test` (43 tests passing)
- `npm run build`
- Browser/visual evidence:
  - desktop fixed frame: `output/playwright/wellfi-cutaway-bubble-desktop.png`
  - mobile fixed frame: `output/playwright/wellfi-cutaway-bubble-mobile-final.png`
  - exported-video contact sheet: `output/playwright/wellfi-export-contact-sheet.png`

## Resume Notes

- This rendition is merged to `master` for live review. Compare it against any remaining alternate renders before choosing the final public hero direction.
- Local QA URL: `http://127.0.0.1:3001/wellfi`
- Exact wide telemetry frame: `http://127.0.0.1:3001/wellfi/animation?motion=force&heroT=6.1`
- Re-export accepted motion with `npm run export:hero`.
- The calculator route remains parked at `src/app/_calculator`; do not un-park without Kyle approval.
