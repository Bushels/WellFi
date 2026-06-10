import { describe, expect, it } from 'vitest';
import { CYCLE_S, EMBER, cycleState, type CycleState } from './cycle';

const BREATH = 4 / 3;

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

  it('pulses and receiver are inactive (-1) in the lit phase, collars at ember', () => {
    const s = cycleState(1);
    expect(s.pulseLateral).toBe(-1);
    expect(s.pulseCased).toBe(-1);
    expect(s.receiver).toBe(-1);
    expect(s.collarA).toBeCloseTo(EMBER, 5);
    expect(s.collarB).toBeCloseTo(EMBER, 5);
  });

  it('relay sequence within a breath: lateral pulse first, then cased, then receiver', () => {
    const early = cycleState(5 + 0.2 * BREATH);   // f=0.2 → lateral active
    expect(early.pulseLateral).toBeGreaterThanOrEqual(0);
    expect(early.pulseCased).toBe(-1);

    const mid = cycleState(5 + 0.6 * BREATH);     // f=0.6 → cased active
    expect(mid.pulseCased).toBeGreaterThanOrEqual(0);
    expect(mid.pulseLateral).toBe(-1);

    const late = cycleState(5 + 0.85 * BREATH);   // f=0.85 → receiver ring live
    expect(late.receiver).toBeGreaterThanOrEqual(0);
  });

  it('pulse heads progress monotonically within their windows', () => {
    const a = cycleState(5 + 0.15 * BREATH).pulseLateral;
    const b = cycleState(5 + 0.35 * BREATH).pulseLateral;
    expect(b).toBeGreaterThan(a);
  });

  it('collar B swells before collar A answers', () => {
    const f01 = cycleState(5 + 0.1 * BREATH);
    expect(f01.collarB).toBeGreaterThan(f01.collarA);
    const f06 = cycleState(5 + 0.6 * BREATH);
    expect(f06.collarA).toBeGreaterThan(EMBER + 0.2);
  });

  it('all envelope fields stay in range', () => {
    for (let t = 0; t < CYCLE_S; t += 0.05) {
      const s = cycleState(t);
      for (const k of ['sun', 'sky', 'collarA', 'collarB'] as const) {
        expect(s[k]).toBeGreaterThanOrEqual(0);
        expect(s[k]).toBeLessThanOrEqual(1);
      }
      for (const k of ['pulseLateral', 'pulseCased', 'receiver'] as const) {
        expect(s[k]).toBeLessThanOrEqual(1);
        expect(s[k] === -1 || s[k] >= 0).toBe(true);
      }
    }
  });
});
