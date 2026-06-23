# Project State

Last verified: 2026-06-23 — Clearwater drilling-cutaway scroll + hero WellFi placement fix LIVE in production (mpsgroup.energy/wellfi). `master` == origin (pushed); working tree clean.

## Live now (deployed from `master` via Vercel)

**Clearwater section** — `src/components/clearwater/ClearwaterDescent.tsx` (replaces the old "1.8 trillion" anchor; keeps `id="anchor"`):
- A Blender-rendered horizontal-well **drilling cutaway** scroll. As you scroll, the bore drills in (vertical → build curve → lateral through the **oilsand**); the six WellFi benefits surface one at a time synced to the drill; the WellFi emerges from the casing toe with its small blue coupling; a telemetry signal rises to surface; ends on "Data Below, Insight Above". Heading: **"Unearth Your Data"**.
- Built from layered Blender passes (formation / casing / device) in `public/renders/clearwater-drill/`, composited with a scroll-driven SVG drilling mask keyed to the exported well-path coords + GSAP scrub. Reduced-motion / mobile → static finished cutaway.
- Blender source (asset repo): `blender/clearwater_drill.blend` + `blender/render_passes.py`.
- NOTE: an earlier flat-CSS "strata bands" version was rejected as generic; the live one uses real renders.

**Hero** — island diorama (`src/components/hero/island/`): WellFi placement is `WELLFI_BELOW_PUMP_CASING_PARAM = 0.50` in `src/lib/island/wellPath.ts` (0 = wellhead, 1 = casing shoe; 0.50 = inside the intermediate, below the pump). A stray commit `f25fb2d` had moved it to 0.55 (the shoe — read as "outside"); reverted. `feat/island-hero-v9` is a **parked, different** hero (own worktree) — NOT live; do not restore it to fix the live hero.

Copy: telemetry heading "Explore Your Data"; Proof tagline "Decisions with Proof".

## Parked (do not un-park without Kyle's OK)

- Calculator — `src/app/_calculator` (underscore = excluded route); numbers unverified.
- Cutaway imagegen exploration — superseded by the Clearwater drilling cutaway.
- `feat/island-hero-v9` — divergent hero variant, parked.

## Deploy + gates

- Push `master` → Vercel auto-builds production. **Before pushing, review `git log <last-deployed-sha>..master`** and confirm every commit that will go live — a deploy ships *all* of master, not just the latest change (a stray hero tweak shipped this way once).
- Gates: `npx tsc --noEmit` · `npm run lint` · `npm test`. `next build` can OOM locally under heavy load (close Blender / free RAM, or let Vercel build).

## QA

- Local: `http://127.0.0.1:3001/wellfi` · Prod: `https://mpsgroup.energy/wellfi`
