# Hero Startup Animation

This file is the canonical source of truth for the approved WellFi hero startup behavior.

## Approved Sequence
- Start from a near-black field with an ultra-faint ghost baseline.
- Draw the waveform left to right at a fixed band height.
- Reveal the WellFi logo when the sweep is about 75% across the screen.
- Reveal `Stop Pumping Blind` only when the sweep reaches the right edge.
- Reveal the subheadline, proof chips, and CTAs only after the headline lands.
- Enable mouse/touch interaction only after the sweep completes.
- Allow the logo WiFi arcs to pulse only on direct hover/touch/focus interaction.

## Implementation Source
- Wave logic: `src/components/hero/SignalWaveHero.tsx`
- Hero reveal timing: `src/components/hero/HeroSection.tsx`
- Logo signal treatment: `src/components/ui/WellFiLogo.tsx`

## Regression Guardrails
- Do not move the wave band upward during intro.
- Do not resize or tighten the wave during intro.
- Do not add lens spikes, spark bursts, or extra startup effects unless explicitly requested.
- Do not decouple the hero text timing from the shared wave duration constant.
- Do not reveal supporting copy before `Stop Pumping Blind`.

## Current Timing Model
- Shared duration constant: `SIGNAL_WAVE_INTRO_DURATION`
- Ghost baseline: first `60-180ms`
- Logo reveal: `75%` of sweep duration
- Headline reveal: immediately after full sweep
- Interactivity: at full sweep completion
- Input model: use one Pointer Events path for mouse, pen, and touch
- Primary CTA: `Request a Quote` uses `mailto:kylegronning@mpsgroup.ca`

## Validation
- Check an early frame to confirm the wave starts dark with only a faint baseline.
- Check a mid-sequence frame to confirm the sweep is left to right and the logo lands before the copy.
- Check a settled frame to confirm the final layout is legible and interactive.
- Check laptop/desktop interaction specifically so the settled wave deformation is visible enough to notice.
