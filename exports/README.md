# WellFi Hero Exports

Presentation-ready exports of the R3F island hero.

Tracked assets:

- `wellfi-island-hero-1920x1080-12s-fast.mp4` - primary PowerPoint/boardroom asset
- `wellfi-island-hero-1280x720-12s-fast-preview.mp4` - lightweight click-preview
- `wellfi-island-hero-1920x1080-poster.png` - still fallback

Regenerate from the live local hero:

```powershell
npm run dev -- --hostname 127.0.0.1 --port 3001
npm run export:hero
```

The exporter captures `/wellfi?motion=force`, records browser video, and encodes H.264 MP4 with FFmpeg. Do not use headless canvas `captureStream()` for this scene; it under-emitted frames in validation.
