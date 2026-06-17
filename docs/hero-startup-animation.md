# Hero Animation - Living Island Diorama

The wave-sweep startup sequence documented here previously was retired on 2026-06-10 with Kyle's explicit approval. Git history preserves the old spec.

The hero is now the R3F island diorama. Authoritative references:

- Design spec: `wellfi-marketing/docs/superpowers/specs/2026-06-10-wellfi-island-hero-r3f-design.md`
- Animation truth: `src/lib/island/cycle.ts` (12 s seamless envelope, unit-tested)
- Scene root: `src/components/hero/island/IslandScene.tsx`

Cycle summary:

```text
lit hold (0-3 s)
  -> darken (3-5 s)
  -> three relay breaths in the dark (5-9 s)
       WellFi B red pulse
       -> WellFi A cyan pulse up the casing
       -> surface ring
  -> relight (9-10.5 s)
  -> lit hold to the seam (12 s == 0 s)
```

## 2026-06-16 Export And Motion Notes

- Boardroom export workflow lives in `scripts/export-island-hero.mjs` and runs through `npm run export:hero`.
- Use `/wellfi?motion=force` for capture so the animation runs even on machines with `prefers-reduced-motion: reduce`.
- Default presentation export captures 24 s and encodes it at 2x speed into a 12 s H.264 MP4. This reads better in a boardroom than the original 24 s two-cycle export.
- The verified deck asset is `exports/wellfi-island-hero-1920x1080-12s-fast.mp4`; the quick preview is `exports/wellfi-island-hero-1280x720-12s-fast-preview.mp4`.
- Do not use headless canvas `captureStream()` as the primary export path. It produced a 10-frame MP4 during testing. Playwright browser video capture plus FFmpeg was reliable.
- Animation visibility was improved by increasing relay pulse width/strength, brightening the surface ring/readout, strengthening production-flow chevrons, adding subtle idle camera drift, and increasing bloom on high-tier devices.
