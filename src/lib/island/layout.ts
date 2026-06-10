// Geometric single-source-of-truth for the island hero.
// Y-up scene; slab top (grass) = y 0; front section face = z +5.
// Composition tracks Blender gate v9: wide slab, corner cavity bite,
// left-entry well on the front face (see the design spec §5).

export const SLAB = { minX: -7, maxX: 7, minZ: -5, maxZ: 5, baseY: -4.4 } as const;

export interface Stratum {
  name: string;
  topY: number;
  bottomY: number;
  color: string;
  roughness: number;
}

// Top → bottom, contiguous. Geology per the Bluesky reference:
// thin boreal topsoil, cool laminated Wilrich-style overburden, tan sand,
// then the dark bitumen-saturated zone the cavity is dug into.
export const STRATA: readonly Readonly<Stratum>[] = [
  { name: 'topsoil',    topY: 0.0,   bottomY: -0.35, color: '#4a6b35', roughness: 0.95 },
  { name: 'overburden', topY: -0.35, bottomY: -1.5,  color: '#8d9499', roughness: 0.9 },
  { name: 'sand',       topY: -1.5,  bottomY: -2.3,  color: '#c8a35e', roughness: 0.92 },
  { name: 'bitumenUp',  topY: -2.3,  bottomY: -3.6,  color: '#3a2a1c', roughness: 0.55 },
];

// FLOOR_Y is the REFERENCE level of the dug cavity floor — floorY() oscillates
// around it (range ≈ [-3.545, -3.275]). The solid blocks butt flush at -3.6,
// safely below that whole range so the LOWER top face can never poke through
// the displaced floor patch, and the outer slab walls show no sliver gap.
export const FLOOR_Y = -3.3;
// NOTE: LOWER is deliberately NOT a Stratum (no name; never iterated with STRATA).
export const LOWER = { topY: -3.6, bottomY: SLAB.baseY, color: '#241a10', roughness: 0.6 } as const;
export const COAL_YS = [-3.7, -4.0] as const; // Gething coal stringers (Peace River signature)

// Cavity bite (plan view). Opens to the front (z=+5) and right (x=+7) faces.
export const CAVITY: readonly (readonly [number, number])[] = [
  [-1.6, 5.0], [-2.2, 3.0], [-1.8, 0.9], [0.4, -0.6], [3.2, -1.3],
  [5.6, -1.0], [7.0, -0.2], [7.0, 5.0],
];

// Footprint of the upper strata = slab rect minus the cavity bite (concave, single ring).
export const CAP_OUTLINE: readonly (readonly [number, number])[] = [
  [-7, -5], [7, -5], [7, -0.2], [5.6, -1.0], [3.2, -1.3],
  [0.4, -0.6], [-1.8, 0.9], [-2.2, 3.0], [-1.6, 5.0], [-7, 5],
];

// Lease pad + road exclusion rects (forest never plants here).
export const PAD_RECT = { minX: -6.3, maxX: -3.8, minZ: 2.6, maxZ: 5.0 } as const;
export const ROAD_RECT = { minX: -4.6, maxX: -4.0, minZ: -5.0, maxZ: 2.6 } as const;

export function pointInPolygon(x: number, z: number, poly: readonly (readonly [number, number])[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    const intersects = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function inCavity(x: number, z: number): boolean {
  return pointInPolygon(x, z, CAVITY);
}

// Minimum setback from the slab edge for any placed object (trees, props).
const EDGE_MARGIN = 0.4;

export function onCap(x: number, z: number): boolean {
  return (
    x > SLAB.minX + EDGE_MARGIN &&
    x < SLAB.maxX - EDGE_MARGIN &&
    z > SLAB.minZ + EDGE_MARGIN &&
    z < SLAB.maxZ - EDGE_MARGIN &&
    !inCavity(x, z)
  );
}

// Cavity floor: faint-swell dished bowl (no mound — Kyle's v3 verdict) + gentle ripple.
export function floorY(x: number, z: number): number {
  const cx = 2.6;
  const cz = 1.9;
  const dish = -0.22 * Math.exp(-(((x - cx) ** 2) / 9 + ((z - cz) ** 2) / 5));
  const ripple = 0.025 * Math.sin(x * 2.1) * Math.sin(z * 2.7);
  return FLOOR_Y + dish + ripple;
}

export const COLORS = {
  emCyan: '#06B6D4',
  emGlow: '#22D3EE',
  signalRed: '#EF4444',
  casing: '#9fb6c4',
  casingShell: '#7dd3e8',
  openHole: '#c2ab7d',
  lateral: '#b59a6b',
  trough: '#6b5436',
  void: '#020408',
  sunWarm: '#ffd9a8',
  skyFill: '#bfd9e8',
  ground: '#1a130b',
} as const;
