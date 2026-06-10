// The hero's single animation truth: a pure, seamless 12 s envelope.
// "Breath, not strobe" — eased swells per the 1–10 Hz EM telemetry framing.
// Pulse/receiver fields: -1 = inactive, else progress 0..1 along their path.

export const CYCLE_S = 12;
export const EMBER = 0.18; // collars never go fully cold

export interface CycleState {
  sun: number;          // 0..1 key-light factor (1 = full daylight)
  sky: number;          // 0..1 ambient/fill factor
  collarA: number;      // 0..1 cyan collar boost (WellFi A, casing shoe)
  collarB: number;      // 0..1 red collar boost (WellFi B, deep lateral)
  pulseLateral: number; // B → junction pulse progress, or -1
  pulseCased: number;   // shoe → wellhead pulse progress, or -1
  receiver: number;     // surface ring progress, or -1
}

export function smooth(a: number, b: number, t: number): number {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

const RELAY_START = 5;
const RELAY_END = 9;
const BREATH = (RELAY_END - RELAY_START) / 3;

export function cycleState(t: number): CycleState {
  t = ((t % CYCLE_S) + CYCLE_S) % CYCLE_S;

  // Master light level — piecewise over the five phases.
  let light: number;
  if (t < 3) light = 1;
  else if (t < 5) light = 1 - smooth(3, 5, t);
  else if (t < 9) light = 0;
  else if (t < 10.5) light = smooth(9, 10.5, t);
  else light = 1;

  let collarA = EMBER;
  let collarB = EMBER;
  let pulseLateral = -1;
  let pulseCased = -1;
  let receiver = -1;

  if (t >= RELAY_START && t < RELAY_END) {
    const f = ((t - RELAY_START) / BREATH) % 1; // local breath time 0..1

    collarB = Math.max(EMBER, smooth(0, 0.12, f) * (1 - smooth(0.5, 0.8, f)));
    collarA = Math.max(EMBER, smooth(0.4, 0.5, f) * (1 - smooth(0.85, 1, f)));

    if (f >= 0.08 && f < 0.45) pulseLateral = (f - 0.08) / 0.37;
    if (f >= 0.45 && f < 0.8) pulseCased = (f - 0.45) / 0.35;
    if (f >= 0.72) receiver = (f - 0.72) / 0.28;
  }

  return {
    sun: light,
    sky: 0.25 + 0.75 * light,
    collarA,
    collarB,
    pulseLateral,
    pulseCased,
    receiver,
  };
}

// Frozen frame used when prefers-reduced-motion is set: mid lit-hold, no pulses.
export const REDUCED_MOTION_T = 1.5;
