# WellFi Marketing Site

Public marketing site for WellFi, built with Next.js 16 static export and a React Three Fiber island hero.

Production surface:

- Canonical public URL: `https://mpsgroup.energy/wellfi`
- Local dev URL: `http://127.0.0.1:<port>/wellfi`
- Vercel project: `wellfi-marketing`

The app uses `basePath: "/wellfi"`. Do not validate this site at the bare local root; use `/wellfi`.

## Local Dev

```powershell
npm install
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Open:

```text
http://127.0.0.1:3001/wellfi
```

If port `3001` is occupied, use another port but keep the `/wellfi` path.

## Quality Gates

Run these before committing or deploying:

```powershell
npx tsc --noEmit
npm run lint
npm test
npm run build
```

Current known lint warning: `src/components/ui/WellFiLogo.tsx` uses a raw `<img>` and triggers the Next.js image optimization warning.

## Hero Animation

Authoritative files:

- Animation envelope: `src/lib/island/cycle.ts`
- Scene root: `src/components/hero/island/IslandScene.tsx`
- Canvas wrapper: `src/components/hero/island/IslandCanvas.tsx`
- Animation notes: `docs/hero-startup-animation.md`

The island hero is a poster-first WebGL scene. Reduced-motion users get a frozen lit state. For export/QA where animation must run even if the machine has reduced motion enabled, use:

```text
http://127.0.0.1:3001/wellfi?motion=force
```

## Presentation Export

The boardroom-safe export is an H.264 MP4 generated from the live WebGL canvas.

Start the dev server first:

```powershell
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Then export:

```powershell
npm run export:hero
```

Default outputs:

- `exports/wellfi-island-hero-1920x1080-12s-fast.mp4` - primary PowerPoint asset
- `exports/wellfi-island-hero-1280x720-12s-fast-preview.mp4` - quick preview
- `exports/wellfi-island-hero-1920x1080-poster.png` - still-image fallback

Default capture settings:

- captures `24s` from `/wellfi?motion=force`
- encodes at `2x` speed to a `12s` presentation loop
- writes H.264, `yuv420p`, `30 fps`, `+faststart`

Override with environment variables:

```powershell
$env:WELLFI_CAPTURE_WIDTH='3840'
$env:WELLFI_CAPTURE_HEIGHT='2160'
$env:WELLFI_CAPTURE_SECONDS='24'
$env:WELLFI_EXPORT_SPEED='2'
npm run export:hero
```

## Deployment

Deploy from this directory:

```powershell
vercel --prod
```

The calculator is parked at `src/app/_calculator`; do not un-park it without Kyle approval.
