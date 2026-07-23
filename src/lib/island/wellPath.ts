// Authored well geometry (gate-v9 read): left-entry on the front section face,
// J-build half-proud of the z=+5 plane, heel into the cavity, then a ~65° wide fan —
// a pilot open-hole motherbore + 5 laterals from a tight junction cluster (5+1, the
// real architecture for this application). Informed by OBE 102 HZ but deliberately
// precomputed — smaller, deterministic, art-directable.
// "Visual storytelling beats literal 11° parallelism — Kyle's annotation is the spec."

import { CatmullRomCurve3, Vector3 } from 'three';
import { floorY } from './layout';

export const RADII = {
  surfaceStub: 0.15,
  cased: 0.125,
  openHole: 0.085,
  lateral: 0.068,
} as const;

export interface ToolAnchor {
  position: Vector3;
  tangent: Vector3;
}

export const WELLFI_VIEW_IDS = ['below-pump', 'outside-intermediate', 'dual-wellfi'] as const;
export type WellFiViewId = (typeof WELLFI_VIEW_IDS)[number];
export const DEFAULT_WELLFI_VIEW: WellFiViewId = 'below-pump';

export function isWellFiViewId(value: string | null): value is WellFiViewId {
  return WELLFI_VIEW_IDS.includes(value as WellFiViewId);
}

export interface WellFiToolPlacement extends ToolAnchor {
  id: string;
  label: string;
  tone: 'primary' | 'secondary';
}

// Returned vectors/curves are live objects — treat them as read-only.
export interface WellPaths {
  cased: CatmullRomCurve3;
  openHole: CatmullRomCurve3;
  laterals: CatmullRomCurve3[];
  shoe: Vector3;
  wellhead: Vector3;
  wellfiTools: {
    belowPump: ToolAnchor;
    outsideIntermediate: ToolAnchor;
    lateralToe: ToolAnchor;
  };
}

const Z_FACE = 5; // front section plane — the cased bore rides ON it (half-proud)

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);
const drape = (x: number, z: number, lift = 0.07) => v(x, floorY(x, z) + lift, z);

export const KOP_PARAMS = [0.05, 0.08, 0.11, 0.14, 0.16] as const;
// Centred in the visible intermediate-casing run. Larger values read as a
// casing-shoe installation once the J-build turns into the horizontal section.
export const WELLFI_BELOW_PUMP_CASING_PARAM = 0.34;
export const WELLFI_OUTSIDE_INTERMEDIATE_PARAM = 0.03;
export const WELLFI_LATERAL_PARAM = 0.75;
export const WELLFI_UPLINK_CASING_PARAMS: Record<WellFiViewId, number> = {
  'below-pump': WELLFI_BELOW_PUMP_CASING_PARAM,
  'outside-intermediate': 1,
  'dual-wellfi': 1,
};

// Lateral toes arc along the cavity floor edge, front-left → right-wall run.
const LATERAL_TOES: [number, number][] = [
  [3.4, 4.3],   // L1 — hardest kick (earliest KOP turns hardest)
  [5.0, 3.7],   // L2
  [6.2, 2.8],   // L3
  [6.5, 1.6],   // L4
  [6.5, -0.3],  // L5 — longest, hugs the right wall run
];

function buildLateral(kop: Vector3, toe2d: [number, number]): CatmullRomCurve3 {
  const toe = drape(toe2d[0], toe2d[1]);
  const m1 = drape(
    kop.x + (toe.x - kop.x) * 0.35,
    kop.z + (toe.z - kop.z) * 0.35,
  );
  const m2 = drape(
    kop.x + (toe.x - kop.x) * 0.7,
    kop.z + (toe.z - kop.z) * 0.7,
  );
  // tension 0.5 = centripetal CatmullRom: loop/cusp-free through tight control spacing
  return new CatmullRomCurve3([kop.clone(), m1, m2, toe], false, 'catmullrom', 0.5);
}

function toolAnchor(curve: CatmullRomCurve3, param: number): ToolAnchor {
  return {
    position: curve.getPointAt(param),
    tangent: curve.getTangentAt(param).normalize().clone(),
  };
}

// Allocates fresh curves/vectors each call — call once and memoize (useMemo) in React.
export function buildWellPaths(): WellPaths {
  if (KOP_PARAMS.length !== LATERAL_TOES.length) throw new Error('KOP_PARAMS and LATERAL_TOES must stay in lock-step');
  const wellhead = v(-5.2, 0.05, Z_FACE);

  const heel = drape(-0.9, 3.4, 0.12); // extra lift: cased/open-hole transition needs clearance
  const cased = new CatmullRomCurve3(
    [
      wellhead.clone(),
      v(-5.2, -1.3, Z_FACE),
      v(-5.05, -2.5, Z_FACE),     // vertical run, on the face
      v(-4.3, -3.15, Z_FACE),     // J-build starts
      v(-3.0, heel.y, 4.55),      // landing, curving inboard
      heel.clone(),
    ],
    false,
    'catmullrom',
    0.5,
  );

  const openHole = new CatmullRomCurve3(
    [
      heel.clone(),
      drape(0.6, 2.9),
      drape(2.2, 2.4),
      drape(4.0, 1.7),
      drape(5.5, 1.0),
      drape(6.6, 0.5),            // pilot toe
    ],
    false,
    'catmullrom',
    0.5,
  );

  const laterals = KOP_PARAMS.map((p, i) =>
    buildLateral(openHole.getPointAt(p), LATERAL_TOES[i]),
  );

  const shoe = cased.getPointAt(1);

  const wellfiTools = {
    belowPump: toolAnchor(cased, WELLFI_BELOW_PUMP_CASING_PARAM),
    outsideIntermediate: toolAnchor(openHole, WELLFI_OUTSIDE_INTERMEDIATE_PARAM),
    lateralToe: toolAnchor(laterals[4], WELLFI_LATERAL_PARAM),
  };

  return { cased, openHole, laterals, shoe, wellhead, wellfiTools };
}

export function getWellFiToolsForView(paths: WellPaths, view: WellFiViewId): WellFiToolPlacement[] {
  if (view === 'below-pump') {
    return [{ ...paths.wellfiTools.belowPump, id: 'below-pump', label: 'WellFi', tone: 'primary' }];
  }

  if (view === 'dual-wellfi') {
    return [
      { ...paths.wellfiTools.outsideIntermediate, id: 'outside-intermediate', label: 'WellFi A', tone: 'primary' },
      { ...paths.wellfiTools.lateralToe, id: 'lateral-toe', label: 'WellFi B', tone: 'secondary' },
    ];
  }

  return [{ ...paths.wellfiTools.outsideIntermediate, id: 'outside-intermediate', label: 'WellFi', tone: 'primary' }];
}
