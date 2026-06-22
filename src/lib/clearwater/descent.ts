// Pure choreography math for the Clearwater Descent. No React, no DOM.
// Overall scroll progress p is in [0, 1].

export interface LayerSpec {
  id: string;
  label: string;
  depthTop: number;    // metres TVD
  depthBottom: number; // metres TVD
  color: string;       // dark earth-tone render value
  laminated: boolean;  // adds a fine repeating-linear-gradient lamination
}

export const REVEAL_START = 0.8;
export const BENEFIT_START = 0.06;
export const BENEFIT_END = 0.78;
export const STRATA_VH = 220; // strata column height; viewport stage is 100vh

export const STRATA: LayerSpec[] = [
  { id: 'overburden', label: 'Overburden',                 depthTop: 0,   depthBottom: 150, color: '#2a2620', laminated: false },
  { id: 'colorado',   label: 'Colorado Shale · seal',      depthTop: 150, depthBottom: 280, color: '#232628', laminated: true },
  { id: 'upper-sand', label: 'Clearwater · upper sand',    depthTop: 280, depthBottom: 380, color: '#33271c', laminated: false },
  { id: 'mudstone',   label: 'Clearwater · mudstone',      depthTop: 380, depthBottom: 420, color: '#2c2a24', laminated: true },
  { id: 'lower-sand', label: 'Clearwater · lower sand',    depthTop: 420, depthBottom: 500, color: '#1c130d', laminated: false },
  { id: 'ellerslie',  label: 'Ellerslie · underburden',    depthTop: 500, depthBottom: 600, color: '#20191a', laminated: false },
];

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

/**
 * Trapezoidal visibility for benefit i across [BENEFIT_START, BENEFIT_END].
 * Each benefit owns an equal slot; it fades in over the first `edge` fraction
 * of the slot, holds, then fades out over the last `edge` fraction.
 */
export function benefitVisibility(p: number, i: number, count = 6): number {
  const span = BENEFIT_END - BENEFIT_START;
  const slot = span / count;
  const start = BENEFIT_START + i * slot;
  const end = start + slot;
  if (p <= start || p >= end) return 0;
  const local = (p - start) / slot; // 0..1 within the slot
  const edge = 0.35; // fraction of slot used for fade in and fade out
  if (local < edge) return clamp01(local / edge);
  if (local > 1 - edge) return clamp01((1 - local) / edge);
  return 1;
}

/**
 * Vertical translate (in vh, negative = upward) for a strata layer as the
 * camera falls. Travel completes at REVEAL_START, then clamps.
 * `parallaxFactor` < 1 makes a background layer drift slower (depth cue).
 */
export function layerTranslateVh(p: number, parallaxFactor: number): number {
  const travel = STRATA_VH - 100; // distance the column must move to expose its base
  const progress = clamp01(p / REVEAL_START);
  // `+ 0` normalizes the IEEE-754 negative zero (`-(0 * …)`) back to +0 so the
  // p=0 case is exactly 0, not -0.
  return -(progress * travel * parallaxFactor) + 0;
}

/** Device reveal opacity (0→1) and scale (0.92→1) across [REVEAL_START, 1]. */
export function revealState(p: number): { opacity: number; scale: number } {
  const t = clamp01((p - REVEAL_START) / (1 - REVEAL_START));
  return { opacity: t, scale: 0.92 + 0.08 * t };
}
