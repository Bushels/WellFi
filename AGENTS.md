# WellFi Agent Routing

Use these agents as focused review passes for the WellFi marketing site. Invoke the narrowest reviewer that matches the failure mode, and route hero or product-shot work through reference fidelity before spending time on broader design, animation, or performance critique.

## Project context & guardrails (read before building or deploying)

This repo (`site/`, git `Bushels/WellFi`) is the **WellFi public marketing site** — Next.js 16 static export (`output: 'export'`, `basePath: '/wellfi'`). The homepage hero is a React-Three-Fiber "island diorama". It is **LIVE in production** (shipped 2026-06-16) at **https://mpsgroup.energy/wellfi**. (This is a different property from the internal `wellfi-app` Obsidian command-hub dashboard — don't conflate them.)

**Deploy**
- `vercel --prod` from this `site/` dir. Vercel project = `wellfi-marketing`.
- Canonical public URL: `mpsgroup.energy/wellfi` (the corporate site rewrites `/wellfi/*` → the Vercel deployment, stripping `/wellfi`).
- The bare `wellfi-marketing.vercel.app` also renders standalone via `vercel.json` (`/wellfi/:path* → /:path*`); it returns 401 to anyone not signed into the Vercel team (Deployment Protection, left ON intentionally).
- After renaming or removing a route, delete `.next` and `out` before rebuilding — a stale generated typed-route validator otherwise fails the build.

**The calculator is PARKED (do not un-park without Kyle's OK)**
- The interactive ROI calculator is intentionally NOT deployed. Its route lives at `src/app/_calculator` (leading underscore = excluded from App Router routing). The numbers are unverified; don't surface them publicly until Kyle confirms. Re-enable by renaming the folder back to `calculator`.

**Cutaway visual exploration is PARKED (2026-06-20)**
- Image-generation exploration clarified the coupling, dogleg, and formation language, but failed as a reliable source of truth for the open-hole multilateral geometry.
- Use `docs/plans/2026-06-20-cutaway-visual-exploration-handover.md` before restarting cutaway work.
- Next cutaway work should be deterministic R3F/CAD-style geometry first, then visual polish. Do not treat the failed imagegen multilateral output as a reference to match.
- Preserve the live island hero while prototyping any new cutaway route.

**Gates before commit**
- `npx tsc --noEmit`, `npm run lint`, `npm test` (40 unit tests). The pure-math modules under `src/lib/island/` must stay green, and `cycle.ts` must keep its seam invariant `state(12) ≡ state(0)`.

**Presentation export**
- Use `npm run export:hero` after accepted hero-animation changes. It captures `/wellfi?motion=force` and writes the boardroom MP4, preview MP4, poster PNG, and GIF under `exports/`.
- If a R3F `Html` overlay must appear in exported assets, mark its root with `data-wellfi-export-overlay`; the exporter preserves only marked overlays while hiding normal page UI. Verify with a contact sheet after export.
- Do not create a new export agent or skill for this yet. The working pattern is: use the existing `animation-performance-reviewer` for R3F motion changes, validate with Playwright/browser evidence, then run the exporter.
- Hindsight can be updated explicitly through its MCP `sync_retain` tool when a session produces durable project lessons. Do not assume it always updates automatically.

**Full project rules** (brand, design tokens, hero non-negotiables, deploy details): see `CLAUDE.md`.

## accessibility-checker

Purpose: Audits WCAG 2.1 AA accessibility for keyboard navigation, screen readers, contrast, semantic HTML, ARIA, focus states, touch targets, and reduced-motion support.

Trigger conditions: Use before deployment, after component changes, when reviewing forms or CTAs, or when motion/content changes could affect users with assistive technology.

Path: `.claude/agents/accessibility-checker.md`

## animation-performance-reviewer

Purpose: Reviews GSAP, Framer Motion, Canvas, and React Three Fiber animation performance without sacrificing the approved WellFi visual direction.

Trigger conditions: Use after new scroll effects, hero animation changes, pointer interaction changes, Three.js/R3F work, or any fix intended to improve frame rate, bundle weight, or mobile smoothness.

Path: `.claude/agents/animation-performance-reviewer.md`

## content-accuracy-verifier

Purpose: Audits WellFi technical copy for specification accuracy, substantiated claims, correct oilfield terminology, engineering credibility, and consistent tone.

Trigger conditions: Use when adding or changing marketing copy, product specs, proof claims, installation descriptions, telemetry explanations, or CTA wording.

Path: `.claude/agents/content-accuracy-verifier.md`

## design-quality-reviewer

Purpose: Reviews UI/UX quality for visual hierarchy, typography, color system consistency, scrollytelling flow, mobile readability, and engineering-focused polish.

Trigger conditions: Use after UI component work, section redesigns, proof-section changes, layout changes, or when a design feels visually weak but the reference match has already been checked.

Path: `.claude/agents/design-quality-reviewer.md`

## mobile-responsiveness-tester

Purpose: Tests responsive behavior, touch interaction, viewport handling, scrollytelling usability, and field-use readability from 320px through large desktop.

Trigger conditions: Use after layout changes, hero/proof/calculator edits, pinned or animated sections, or before deployment when mobile and tablet behavior must be verified.

Path: `.claude/agents/mobile-responsiveness-tester.md`

## reference-fidelity-reviewer

Purpose: Checks whether hero, product-shot, or motion-poster work still matches the approved marketing reference before broader design or animation work continues.

Trigger conditions: Use first when an approved image, render, installed-state side-clamp visual, or startup-wave behavior is the source of truth.

Path: `.claude/agents/reference-fidelity-reviewer.md`

## seo-optimization-reviewer

Purpose: Audits industrial B2B SEO readiness, including metadata, heading hierarchy, schema, keywords, Core Web Vitals, image optimization, and technical SEO.

Trigger conditions: Use before deployment, after metadata or content changes, when adding new sections, or when reviewing search readiness for WellFi and EM telemetry keywords.

Path: `.claude/agents/seo-optimization-reviewer.md`
