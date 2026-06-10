import { describe, expect, it } from 'vitest';
import {
  SLAB, STRATA, LOWER, FLOOR_Y, CAVITY, CAP_OUTLINE,
  pointInPolygon, inCavity, onCap, floorY, COLORS, PAD_RECT, ROAD_RECT,
} from './layout';

describe('strata stack', () => {
  it('bands are contiguous from grass (y=0) down to the cavity floor', () => {
    expect(STRATA[0].topY).toBe(0);
    for (let i = 1; i < STRATA.length; i++) {
      expect(STRATA[i].topY).toBe(STRATA[i - 1].bottomY);
    }
    expect(STRATA[STRATA.length - 1].bottomY).toBe(FLOOR_Y);
  });
  it('lower block continues from the floor to the slab base', () => {
    expect(LOWER.topY).toBeLessThanOrEqual(FLOOR_Y);
    expect(LOWER.bottomY).toBe(SLAB.baseY);
  });
});

describe('pointInPolygon', () => {
  const square: [number, number][] = [[0, 0], [2, 0], [2, 2], [0, 2]];
  it('classifies inside and outside', () => {
    expect(pointInPolygon(1, 1, square)).toBe(true);
    expect(pointInPolygon(3, 1, square)).toBe(false);
    expect(pointInPolygon(-0.1, 1, square)).toBe(false);
  });
});

describe('cavity and cap', () => {
  it('bowl centre is in the cavity; back-left forest ground is not', () => {
    expect(inCavity(2.6, 1.9)).toBe(true);
    expect(inCavity(-5, -3)).toBe(false);
  });
  it('onCap excludes cavity points and points beyond the slab', () => {
    expect(onCap(-5, -3)).toBe(true);
    expect(onCap(2.6, 1.9)).toBe(false);
    expect(onCap(8, 0)).toBe(false);
  });
  it('cavity polygon and cap outline both stay within slab bounds', () => {
    for (const [x, z] of [...CAVITY, ...CAP_OUTLINE]) {
      expect(x).toBeGreaterThanOrEqual(SLAB.minX);
      expect(x).toBeLessThanOrEqual(SLAB.maxX);
      expect(z).toBeGreaterThanOrEqual(SLAB.minZ);
      expect(z).toBeLessThanOrEqual(SLAB.maxZ);
    }
  });
});

describe('floorY', () => {
  it('dishes deepest near the bowl centre', () => {
    expect(floorY(2.6, 1.9)).toBeLessThan(FLOOR_Y - 0.1);
  });
  it('returns to near-flat away from the bowl', () => {
    expect(Math.abs(floorY(-1.0, 4.5) - FLOOR_Y)).toBeLessThan(0.08);
  });
});

describe('exclusion rects + palette', () => {
  it('pad and road rects are on the cap side (not in the cavity)', () => {
    expect(inCavity((PAD_RECT.minX + PAD_RECT.maxX) / 2, (PAD_RECT.minZ + PAD_RECT.maxZ) / 2)).toBe(false);
    expect(inCavity((ROAD_RECT.minX + ROAD_RECT.maxX) / 2, (ROAD_RECT.minZ + ROAD_RECT.maxZ) / 2)).toBe(false);
  });
  it('brand colors are present', () => {
    expect(COLORS.emCyan).toBe('#06B6D4');
    expect(COLORS.signalRed).toBe('#EF4444');
  });
});
