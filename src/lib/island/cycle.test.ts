import { describe, expect, it } from 'vitest';
import { BREATH, CYCLE_S, EMBER, cycleState, type CycleState } from './cycle';

function expectSameState(a: CycleState, b: CycleState) {
  for (const k of Object.keys(a) as (keyof CycleState)[]) {
    expect(Math.abs(a[k] - b[k])).toBeLessThan(1e-6);
  }
}

describe('cycleState', () => {
  it('is seamless: state at t=12⁻ equals state at t=0', () => {
    expectSameState(cycleState(CYCLE_S - 1e-9), cycleState(0));
  });

  it('wraps negative and >CYCLE_S times', () => {
    expectSameState(cycleState(CYCLE_S + 1), cycleState(1));
    expectSameState(cycleState(-1), cycleState(CYCLE_S - 1));
  });

  it('is fully lit during the lit hold and fully dark mid-relay', () => {
    expect(cycleState(1).sun).toBe(1);
    expect(cycleState(6).sun).toBe(0);
  });

  it('moves the camera focus in during darken and back out during relight', () => {
    expect(cycleState(1).focus).toBe(0);
    expect(cycleState(4.4).focus).toBeGreaterThan(0);
    expect(cycleState(6).focus).toBe(1);
    expect(cycleState(9.8).focus).toBeGreaterThan(0);
    expect(cycleState(11).focus).toBe(0);
  });

  it('pulses and receiver are inactive (-1) in the lit phase, collars at ember', () => {
    const s = cycleState(1);
    expect(s.pulseCased).toBe(-1);
    expect(s.receiver).toBe(-1);
    expect(s.collarWellFi).toBeCloseTo(EMBER, 5);
  });

  it('relay sequence within a breath: cased pulse first, then receiver', () => {
    const early = cycleState(5 + 0.2 * BREATH);   // f=0.2 -> cased pulse active
    expect(early.pulseCased).toBeGreaterThanOrEqual(0);

    const mid = cycleState(5 + 0.6 * BREATH);     // f=0.6 -> still cased active
    expect(mid.pulseCased).toBeGreaterThanOrEqual(0);

    const late = cycleState(5 + 0.85 * BREATH);   // f=0.85 -> receiver ring live
    expect(late.receiver).toBeGreaterThanOrEqual(0);
    expect(late.pulseCased).toBe(-1);
    const overlap = cycleState(5 + 0.76 * BREATH); // ring + cased pulse coexist
    expect(overlap.receiver).toBeGreaterThanOrEqual(0);
    expect(overlap.pulseCased).toBeGreaterThan(0);
  });

  it('pulse heads progress monotonically within their windows', () => {
    const a = cycleState(5 + 0.15 * BREATH).pulseCased;
    const b = cycleState(5 + 0.35 * BREATH).pulseCased;
    expect(b).toBeGreaterThan(a);
  });

  it('single WellFi collar swells during each relay breath', () => {
    const f01 = cycleState(5 + 0.1 * BREATH);
    expect(f01.collarWellFi).toBeGreaterThan(EMBER);
    const f06 = cycleState(5 + 0.6 * BREATH);
    expect(f06.collarWellFi).toBeGreaterThan(EMBER + 0.2);
  });

  it('flow follows the lit phase', () => {
    expect(cycleState(1).flow).toBe(1);
    expect(cycleState(6).flow).toBe(0);
    expect(cycleState(4).flow).toBeGreaterThan(0);
    expect(cycleState(4).flow).toBeLessThan(1);
  });

  it('all envelope fields stay in range', () => {
    let maxCollar = 0;
    for (let t = 0; t < CYCLE_S; t += 0.05) {
      const s = cycleState(t);
      maxCollar = Math.max(maxCollar, s.collarWellFi);
      for (const k of ['sun', 'sky', 'collarWellFi', 'flow', 'focus'] as const) {
        expect(s[k]).toBeGreaterThanOrEqual(0);
        expect(s[k]).toBeLessThanOrEqual(1);
      }
      for (const k of ['pulseCased', 'receiver'] as const) {
        expect(s[k]).toBeLessThanOrEqual(1);
        expect(s[k] === -1 || (s[k] >= 0 && s[k] <= 1)).toBe(true);
      }
    }
    expect(maxCollar).toBeGreaterThan(EMBER + 0.5);
  });
});
