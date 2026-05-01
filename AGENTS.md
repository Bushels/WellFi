# WellFi Agent Routing

Use these agents as focused review passes for the WellFi marketing site. Invoke the narrowest reviewer that matches the failure mode, and route hero or product-shot work through reference fidelity before spending time on broader design, animation, or performance critique.

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
