import { describe, expect, it } from 'vitest';
import {
  STRATA,
  REVEAL_START,
  benefitVisibility,
  layerTranslateVh,
  revealState,
} from './descent';

describe('clearwater descent math', () => {
  it('defines the six-band Clearwater column surface → underburden', () => {
    expect(STRATA.map((s) => s.id)).toEqual([
      'overburden',
      'colorado',
      'upper-sand',
      'mudstone',
      'lower-sand',
      'ellerslie',
    ]);
    // depths are monotonically increasing and contiguous
    for (let i = 1; i < STRATA.length; i++) {
      expect(STRATA[i].depthTop).toBe(STRATA[i - 1].depthBottom);
    }
  });

  it('benefit visibility is 0 outside its window and ~1 at its center', () => {
    for (let i = 0; i < 6; i++) {
      expect(benefitVisibility(0, i)).toBe(0);
      expect(benefitVisibility(1, i)).toBe(0);
    }
    // benefit 0 peaks early, benefit 5 peaks late
    expect(benefitVisibility(0.1, 0)).toBeGreaterThan(0.5);
    expect(benefitVisibility(0.75, 5)).toBeGreaterThan(0.5);
  });

  it('visibility never exceeds 1 and never goes negative', () => {
    for (let s = 0; s <= 100; s++) {
      const p = s / 100;
      for (let i = 0; i < 6; i++) {
        const v = benefitVisibility(p, i);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });

  it('strata translate starts at 0 and finishes its travel by REVEAL_START', () => {
    expect(layerTranslateVh(0, 1)).toBe(0);
    const end = layerTranslateVh(REVEAL_START, 1);
    const past = layerTranslateVh(1, 1);
    expect(end).toBeLessThan(0); // moved upward (negative translateY)
    expect(past).toBe(end); // clamped after travel completes
  });

  it('a slower parallax factor moves the layer less', () => {
    expect(Math.abs(layerTranslateVh(0.5, 0.5))).toBeLessThan(
      Math.abs(layerTranslateVh(0.5, 1)),
    );
  });

  it('reveal is hidden before REVEAL_START and full at the end', () => {
    expect(revealState(0.5).opacity).toBe(0);
    expect(revealState(1).opacity).toBe(1);
    expect(revealState(1).scale).toBe(1);
    expect(revealState(REVEAL_START).scale).toBeCloseTo(0.92, 2);
  });
});
