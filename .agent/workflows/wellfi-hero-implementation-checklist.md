# WellFi Hero Implementation Checklist

Use this checklist before and during any future hero rebuild so the team does not repeat the same drift.

## 1. Source Of Truth Gate

- Lock the approved render, image, or user-provided reference first.
- Write down what is allowed to change and what is not allowed to change.
- If a GLB or procedural model disagrees with the approved render, the approved render wins.

## 2. Still-Frame Parity Gate

Before animation work starts, confirm:
- correct background world
- correct installed-state configuration
- correct side-clamp silhouette
- correct product scale in frame
- correct mobile crop

If the still frame is wrong, stop. Do not compensate with animation.

## 3. Technology Selection Gate

Choose the simplest option that can match the approved image:

1. approved render as image or R3F card
2. prepared GLB with correct materials and camera
3. procedural geometry only if the product story truly requires it

Do not let "we already have a model" decide the hero direction.

## 4. Review Order

Run reviewers in this order:

1. `reference-fidelity-reviewer`
2. `design-quality-reviewer`
3. `animation-performance-reviewer`

If reviewer 1 says the frame is off-brief, do not continue deeper.

## 5. Motion Rules

- One visual world only.
- One dominant motion idea only.
- Hardware stays heavy and stable.
- Sweep/pulse must support the product read, not replace it.
- Do not add extra reveals, flashes, or concept changes after the brief is already clear.

## 6. Red Flags

Stop and reassess immediately if:
- background color flips away from the brief
- the wrong product/configuration is in frame
- the team starts arguing from available assets instead of approved visuals
- motion work starts before still-frame approval
- reviewers are describing the work as "cinematic" but not "exact"

## 7. Acceptance Rule

A hero pass is only acceptable when:
- the still frame matches the approved reference closely
- the motion improves that exact frame rather than changing it
- mobile still looks intentional
- the implementation is simple enough to maintain
