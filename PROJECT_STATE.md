# Project State

Last verified: 2026-06-24 — WellFi Insight closing section + horizontal internal-deployment render + Clearwater "arrival" reveal + SEO structured data LIVE in production (mpsgroup.energy/wellfi). `master` == origin (pushed); working tree clean.

## Live now (deployed from `master` via Vercel)

**Page order** (`src/app/page.tsx`): IslandHero → Navigation → Telemetry → Clearwater → WellFi Insight (closing).

**Hero** — island diorama (`src/components/hero/island/`): WellFi at `WELLFI_BELOW_PUMP_CASING_PARAM = 0.50` in `src/lib/island/wellPath.ts` (0 = wellhead, 1 = shoe; 0.50 = inside intermediate, below pump). `feat/island-hero-v9` is a **parked, different** hero — NOT live; don't restore it to "fix" the hero.

**Clearwater** — `src/components/clearwater/ClearwaterDescent.tsx` (`id="anchor"`, 440vh): scroll drills the bore in (vertical → build → lateral through oilsand), six benefits surface one at a time, the **WellFi pokes out past the casing**, a signal rises, then a **slow cross-fade to the lit reservoir "arrival" render** (`public/renders/clearwater-drill/reservoir-arrival.png`) + "Data Below, Insight Above". Heading "Unearth Your Data". Layered Blender passes + SVG drilling mask + GSAP scrub; reduced-motion/mobile → static.

**WellFi Insight** (closing) — `src/components/closing/ClosingSection.tsx` (`id="proof"`): replaces the retired SAGD + Proof sections. Full-width **horizontal ghosted internal-deployment render** (WellFi in cutaway tubing, EM collar glowing) = `public/images/wellfi-internal-ghost.webp` (25 KB, transparent, CSS left/right fade); application icons (light/heavy oil, gas); spec strip (WellFi Access Point, 4 Hz, ~7,700 events); "Seamless Install"; email button (address hidden, mailto); "Field Service Support"; closes on "Know the Unknown — One Changeout Away".

**Telemetry** — "Explore Your Data" icon cards; "Fluid Composition" (was Water Cut). Nav: Telemetry + Insight.

**SEO** — `src/app/layout.tsx`: JSON-LD (Organization + Product, `<`-escaped), canonical, OG/Twitter, keyword set; meta description rewritten off the retired "1.8 trillion" line.

**Blender source (asset repo `codex/animation3`)**: `blender/clearwater_drill.blend` + `render_passes.py` (Clearwater); `blender/render_internal_ghost.py` + `wellfi_internal_ghost.blend` (internal render; builds from `WellFi2.blend`).

## Parked / retired
- Calculator — `src/app/_calculator` (underscore = excluded route); numbers unverified.
- `feat/island-hero-v9` — divergent hero variant, parked.
- Retired 2026-06-24 (superseded by WellFi Insight): `components/{proof,sagd-presentation,contact,specs}` + `images/wellfi-tool-hero.webp` deleted.

## Deploy + gates
- **"Commit" ≠ "deploy"**: pushing `master` auto-builds production (no PR gate). Review `git log origin/master..master` first and get explicit OK before pushing — the auto-mode classifier will (correctly) block a push authorized only as "commit".
- Gates: `npx tsc --noEmit` · `npm run lint` · `npm test` (51 tests). `next build` can OOM under heavy local load (free RAM / let Vercel build).

## QA
- Prod: `https://mpsgroup.energy/wellfi` · Local: `cd site && node node_modules/next/dist/bin/next dev -p 3002` (basePath `/wellfi`; preview MCP can't reach it from the asset-repo worktree).
