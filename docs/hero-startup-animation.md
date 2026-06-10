# Hero Animation — Living Island Diorama

> The wave-sweep startup sequence documented here previously was retired
> 2026-06-10 with Kyle's explicit approval. Git history preserves the old spec.

The hero is now the R3F island diorama. Authoritative references:

- Design spec: `wellfi-marketing/docs/superpowers/specs/2026-06-10-wellfi-island-hero-r3f-design.md`
- Animation truth: `src/lib/island/cycle.ts` (12 s seamless envelope, unit-tested)
- Scene root: `src/components/hero/island/IslandScene.tsx`

Cycle summary: lit hold (0–3 s) → darken (3–5 s) → three relay breaths in the
dark (5–9 s: WellFi B red pulse → WellFi A cyan pulse up the casing → surface
ring) → relight (9–10.5 s) → lit hold to the seam (12 s ≡ 0 s).
