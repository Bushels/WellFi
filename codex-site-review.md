# Codex Site Review - WellFi Marketing Site

Date: 2026-05-13
Preview: http://localhost:3007/wellfi
Verdict: Production deployed after claim-boundary cleanup. The hero direction is right; the calculator is parked publicly until assumptions are approved.

## Implemented Changes

### 2026-05-13 Production Hardening

- `site/src/app/layout.tsx`
  - Added canonical metadata for `https://mpsgroup.energy/wellfi`.
  - Pointed Open Graph and Twitter image metadata to `https://mpsgroup.energy/wellfi/og-wellfi.png`.
  - Removed old `mpsgroup.ca` author URL from WellFi metadata.

- `site/src/app/calculator/page.tsx`
  - Parked the public calculator route behind a contact handoff.
  - Added `noindex,nofollow` metadata.
  - Removed public pricing, payout, uplift, and capital-efficiency language from the route.

- `site/src/lib/content.ts` and public CTA sections
  - Replaced "first Canadian install" language with candidate-well review.
  - Replaced "130+ globally" with the approved "100+ installed internationally" boundary.
  - Replaced "no new infrastructure" wording with the narrower downhole-cable / MODBUS-ready framing.
  - Softened the proof CTA from production/capex promise language to pressure-data and deployment-fit language.

- `site/src/components/hero/HeroSection.tsx`
  - Added a real screen-reader `<h1>`: `Know the Unknown`.
  - Changed the hero touch behavior from `touchAction: none` to `touchAction: pan-y` so mobile users are not trapped in the first viewport.
  - Added `scrimRef` and pointer-driven CSS variables so cursor position controls the scrim mask.
  - Added `pointercancel` and `pointerup` cleanup so the flashlight does not stay active after touch/pointer end.

- `site/src/app/globals.css`
  - Added `.hero-flashlight-scrim` and `.hero-flashlight-scrim--active`.
  - The flashlight now cuts a transparent radial hole through the dark scrim, with cyan bloom layered above it.
  - Desktop flashlight radius: `14rem`; mobile radius: `10rem`.

## Verification

- `node_modules\.bin\tsc.cmd -b --noEmit` passed.
- `http://localhost:3007/wellfi` returns HTTP 200.
- Server-rendered HTML now contains one `<h1>`.
- Browser-plugin route was unavailable because the required browser-control runtime was not exposed in this session.
- Headless Chrome/Edge screenshot attempts were blocked by Windows sandbox/Crashpad/Mojo permission errors, so visual assessment below is based on source review plus the locked `/hero-v2-portrait.png` asset, not a captured browser screenshot.

## Ambiance Assessment

The base art has the right emotional payload: small cyan signal, dark formation, huge negative space. It can carry "a candle in a vast oilsands formation."

The pre-fix implementation was weaker than the idea. The cursor glow sat above a black scrim using `mix-blend-screen`, which brightened the darkness but did not truly reveal the formation below. That reads more like a UI glow than a flashlight. The implemented mask fix should materially improve the metaphor because the cursor now opens the darkness instead of just painting cyan over it.

Remaining concern: on desktop, using the portrait asset as `background-size: cover` may crop away some horizontal formation scale. Kyle's direction says "massive formation extending in every direction." If the browser pass feels too portrait/poster-like, use responsive art direction with the locked no-text landscape/square assets for wide viewports without modifying `/hero-v2-portrait.png`.

## Below-Hero Critique

`OneEightTrillionAnchor` fits the new campaign. It is slow, sparse, and recognizable from Post 01. Keep it.

`ProofSection` was the mismatch. It still has a conventional B2B conversion structure, but the public claim boundary is now safer:

- CTA now says `Downhole Pressure. Surface Decisions.`
- Trust line now says `100+ installed internationally`
- Subcopy now routes to candidate-well review and deployment fit
- Public page no longer exposes the calculator assumptions

For v1 launch this is acceptable. The next improvement is visual/tonal: make the proof section feel more like technical evidence revealed from the dark and less like a standard conversion card.

## Ranked Improvements

1. **Implemented - make the flashlight actually reveal the formation.**
   Severity: P0. The old blend-only approach did not fully sell "flashlight." The scrim mask is the right mechanic.

2. **Implemented - restore a real page heading and mobile scroll path.**
   Severity: P0. The page had no `<h1>`, and `touchAction: none` risked trapping mobile users in the hero.

3. **Responsive hero art direction for wide screens.**
   Severity: P1. Keep `/hero-v2-portrait.png` untouched, but consider using the locked square/landscape variants at desktop breakpoints if the real-browser pass feels cropped or insufficiently vast.

4. **Pivot ProofSection from sales proof to quiet technical reveal.**
   Severity: P1. Replace the old tagline and CTA tone first. Keep specs, but reduce animation and make the copy feel like evidence discovered in the dark, not a pitch deck.

5. **Move hero image loading from CSS background to a priority image layer if LCP is weak.**
   Severity: P2. Current CSS background is simple and fine for v1, but `next/image` with `priority` would give better loading control if the first viewport flashes dark too long.

## Ship Call

Good enough to keep moving, with one caveat: run a human visual pass in Chrome/Safari/Edge on desktop and mobile before production deploy. If the flashlight now feels like a true reveal, ship this hero and leave ProofSection cleanup as the next pass. If it still feels like a cyan UI glow, the next adjustment is smaller flashlight radius plus darker outer scrim, not more copy.
