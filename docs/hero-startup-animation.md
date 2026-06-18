# Hero Animation - Living Island Diorama

The wave-sweep startup sequence documented here previously was retired on 2026-06-10 with Kyle's explicit approval. Git history preserves the old spec.

The hero is now the R3F island diorama. Authoritative references:

- Design spec: `wellfi-marketing/docs/superpowers/specs/2026-06-10-wellfi-island-hero-r3f-design.md`
- Animation truth: `src/lib/island/cycle.ts` (12 s seamless envelope, unit-tested)
- Scene root: `src/components/hero/island/IslandScene.tsx`

Cycle summary:

```text
lit hold (0-3 s)
  -> darken while holding the wide island/surface-casing view (3-5 s)
  -> three relay breaths in the dark (5-9 s)
       single WellFi red pulse from the casing shoe to surface
       -> surface ring
       downhole bubble highlights pressure, temperature, pump vibration
  -> relight while staying wide (9-10.5 s)
  -> lit hold to the seam (12 s == 0 s)
```

## 2026-06-16 Export And Motion Notes

- Boardroom export workflow lives in `scripts/export-island-hero.mjs` and runs through `npm run export:hero`.
- Browser-only animation view is available at `/wellfi/animation`; it uses the same live hero animation/readout without the logo, headline, CTA, chips, or scroll chrome.
- Use `/wellfi?motion=force` for capture so the animation runs even on machines with `prefers-reduced-motion: reduce`.
- Use `/wellfi/animation?motion=force` to show only the animation in a browser.
- Use `/wellfi?motion=force&heroT=6.2` for exact-frame QA of the dark relay/readout beat without racing the browser clock.
- Default presentation export captures 24 s and encodes it at 2x speed into a 12 s H.264 MP4. This reads better in a boardroom than the original 24 s two-cycle export.
- The verified deck asset is `exports/wellfi-island-hero-1920x1080-12s-fast.mp4`; the quick preview is `exports/wellfi-island-hero-1280x720-12s-fast-preview.mp4`.
- The exporter also writes `exports/wellfi-island-hero-960x540-12s-fast.gif` by default. Use `WELLFI_CAPTURE_SECONDS=12` and `WELLFI_EXPORT_SPEED=1` for the normal-speed 12 s MP4/GIF pair.
- HTML overlays are hidden unless their root has `data-wellfi-export-overlay`; the downhole telemetry bubble uses that marker so it appears in MP4/GIF exports.
- Do not use headless canvas `captureStream()` as the primary export path. It produced a 10-frame MP4 during testing. Playwright browser video capture plus FFmpeg was reliable.
- Animation visibility was improved by increasing relay pulse width/strength, brightening the surface ring/readout, strengthening production-flow chevrons, adding subtle idle camera drift, and increasing bloom on high-tier devices.
