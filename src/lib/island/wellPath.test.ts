import { describe, expect, it } from 'vitest';
import { buildWellPaths, KOP_PARAMS, RADII, WELLFI_TOOL_PARAM } from './wellPath';
import { floorY, inCavity } from './layout';

const paths = buildWellPaths();

describe('well system continuity', () => {
  it('cased section ends where the open hole begins (the shoe)', () => {
    const casedEnd = paths.cased.getPointAt(1);
    const ohStart = paths.openHole.getPointAt(0);
    expect(casedEnd.distanceTo(ohStart)).toBeLessThan(1e-3);
    expect(casedEnd.distanceTo(paths.shoe)).toBeLessThan(1e-3);
  });

  it('wellhead sits at grade on the front face', () => {
    expect(paths.wellhead.y).toBeGreaterThan(-0.1);
    expect(Math.abs(paths.wellhead.z - 5)).toBeLessThan(0.05);
  });
});

describe('gate-v9 wide fan', () => {
  it('KOP params and laterals stay in lock-step', () => {
    expect(KOP_PARAMS.length).toBe(paths.laterals.length);
  });

  it('has exactly 5 laterals', () => {
    expect(paths.laterals).toHaveLength(5);
  });

  it('every lateral starts on the pilot at its KOP param (tight junction cluster ≤ 16%)', () => {
    KOP_PARAMS.forEach((p, i) => {
      expect(p).toBeLessThanOrEqual(0.16);
      const kopOnPilot = paths.openHole.getPointAt(p);
      const lateralStart = paths.laterals[i].getPointAt(0);
      expect(lateralStart.distanceTo(kopOnPilot)).toBeLessThan(1e-3);
    });
  });

  it('all toes land inside the cavity, draped near the floor', () => {
    for (const lat of paths.laterals) {
      const toe = lat.getPointAt(1);
      expect(inCavity(toe.x, toe.z)).toBe(true);
      expect(Math.abs(toe.y - floorY(toe.x, toe.z))).toBeLessThan(0.25);
    }
  });

  it('laterals stay inside the cavity along their whole length', () => {
    for (const lat of paths.laterals) {
      for (const u of [0.25, 0.5, 0.75]) {
        const p = lat.getPointAt(u);
        expect(inCavity(p.x, p.z)).toBe(true);
      }
    }
  });

  it('pilot toe is in the cavity too', () => {
    const toe = paths.openHole.getPointAt(1);
    expect(inCavity(toe.x, toe.z)).toBe(true);
  });
});

describe('tool anchors', () => {
  it('single WellFi sits inside the cased section at the authored lower-run param', () => {
    const expected = paths.cased.getPointAt(WELLFI_TOOL_PARAM);
    expect(paths.wellfiTool.position.distanceTo(expected)).toBeLessThan(1e-6);
    expect(paths.wellfiTool.position.y).toBeLessThan(-3);
  });

  it('tangents are unit-length', () => {
    expect(Math.abs(paths.wellfiTool.tangent.length() - 1)).toBeLessThan(1e-6);
  });
});

describe('telescoping radii', () => {
  it('is strictly monotonic: stub > cased > openHole > lateral', () => {
    expect(RADII.surfaceStub).toBeGreaterThan(RADII.cased);
    expect(RADII.cased).toBeGreaterThan(RADII.openHole);
    expect(RADII.openHole).toBeGreaterThan(RADII.lateral);
  });
});
