# Gemini Usage Guide

Use Gemini as a second-opinion creative and critique tool for the WellFi marketing site. Do not use it as the implementation authority.

## Best Uses

- Creative direction for the hero startup animation.
- Design critique against a supplied reference image or screenshot.
- Animation feel: pacing, mood, visual hierarchy, and whether the sequence reads as industrial telemetry instead of generic tech.
- Alternate copy framing when the technical facts are already locked.
- Sanity-checking whether a visual direction would feel credible to production engineers.

## Request Pattern

Always give Gemini the visual source of truth, the exact question, and the constraints.

Good prompt shape:

```text
Reference: [attach approved image or screenshot]

Question: Does this WellFi hero direction preserve the approved industrial telemetry feel, or has it drifted into generic SaaS/tech visuals?

Constraints:
- Product is a wireless downhole pressure/temperature gauge.
- Audience is Canadian oilsands production engineers.
- Keep black-field startup wave direction.
- Do not add bottom-up motion.
- Do not reveal supporting copy before "Know the Unknown."
- Blue/cyan is the only hero accent.
- Be blunt and rank the top 3 issues only.
```

## Project-Specific Checks

Ask Gemini to judge:

- Does the hero still feel like WellFi, not a generic AI dashboard?
- Does the startup wave feel like telemetry, not decorative audio-reactive motion?
- Is the visual hierarchy clear within the first viewport?
- Does the proof section feel credible to engineers?
- Does the design look expensive without becoming slick or vague?
- Does the animation add meaning, or is it just motion?

## Do Not Use Gemini For

- Technical implementation decisions.
- Code structure.
- React, Next.js, GSAP, Canvas, or TypeScript correctness.
- Build failures.
- Accessibility compliance.
- SEO implementation.
- Source-of-truth product specifications.

Defer implementation, debugging, and repo contract decisions to Codex or Claude using the actual codebase.
