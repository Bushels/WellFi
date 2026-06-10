'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { onCap, PAD_RECT, ROAD_RECT, SLAB } from '@/lib/island/layout';
import type { GpuTier } from '@/lib/island/quality';

// Deterministic PRNG — same forest every load (Math.random would reshuffle
// between visits and across hydration).
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SpruceVariant {
  trunk: [radius: number, height: number];
  cones: [radius: number, height: number, atY: number][];
}

const VARIANTS: SpruceVariant[] = [
  { trunk: [0.035, 0.22], cones: [[0.42, 0.55, 0.45], [0.3, 0.45, 0.85], [0.17, 0.4, 1.2]] },
  { trunk: [0.03, 0.18], cones: [[0.34, 0.5, 0.38], [0.22, 0.42, 0.72], [0.12, 0.34, 1.02]] },
  { trunk: [0.04, 0.26], cones: [[0.5, 0.62, 0.5], [0.34, 0.5, 0.95], [0.18, 0.46, 1.35]] },
];

const COUNTS: Record<GpuTier, [number, number, number]> = {
  high: [240, 200, 160],
  low: [130, 110, 80],
};

function spruceGeometry(v: SpruceVariant): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const trunk = new THREE.CylinderGeometry(v.trunk[0], v.trunk[0] * 1.3, v.trunk[1], 6);
  trunk.translate(0, v.trunk[1] / 2, 0);
  parts.push(trunk);
  for (const [r, h, atY] of v.cones) {
    const cone = new THREE.ConeGeometry(r, h, 7);
    cone.translate(0, atY + h / 2, 0);
    parts.push(cone);
  }
  const merged = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());
  return merged;
}

const inRect = (
  x: number,
  z: number,
  r: { minX: number; maxX: number; minZ: number; maxZ: number },
) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ;

export default function Forest({ tier }: { tier: GpuTier }) {
  const geometries = useMemo(() => VARIANTS.map(spruceGeometry), []);
  const meshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);

  const instances = useMemo(() => {
    // One shared PRNG stream across variants: variant 2/3 offsets depend on how
    // many draws variant 1 consumed, so their scatter is NOT tier-stable (fine —
    // tier only changes across page loads).
    const rand = mulberry32(20260610);
    const counts = COUNTS[tier];
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    return counts.map((count, vi) => {
      const matrices: THREE.Matrix4[] = [];
      const colors: THREE.Color[] = [];
      let guard = 0;
      while (matrices.length < count && guard++ < count * 60) {
        const x = SLAB.minX + rand() * (SLAB.maxX - SLAB.minX);
        const z = SLAB.minZ + rand() * (SLAB.maxZ - SLAB.minZ);
        if (!onCap(x, z) || inRect(x, z, PAD_RECT) || inRect(x, z, ROAD_RECT)) continue;
        const s = 0.8 + rand() * 0.7;
        dummy.position.set(x, 0, z);
        dummy.scale.setScalar(s * (rand() < 0.25 ? 1.35 : 1)); // occasional spire
        dummy.rotation.y = rand() * Math.PI * 2;
        dummy.updateMatrix();
        matrices.push(dummy.matrix.clone());
        colors.push(color.setHSL(0.33 + (rand() - 0.5) * 0.06, 0.5, 0.24 + rand() * 0.14).clone());
      }
      if (process.env.NODE_ENV !== 'production' && matrices.length < count) {
        console.warn(
          `Forest: variant ${vi} placed ${matrices.length}/${count} trees — guard exhausted.`,
        );
      }
      return { matrices, colors };
    });
  }, [tier]);

  // Write matrices/colors once per instances change — NOT in an inline ref,
  // which React re-invokes on every parent re-render.
  useEffect(() => {
    meshRefs.current.forEach((mesh, vi) => {
      if (!mesh) return;
      instances[vi].matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
      instances[vi].colors.forEach((c, i) => mesh.setColorAt(i, c));
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  }, [instances]);

  return (
    <group>
      {geometries.map((geom, vi) => (
        <instancedMesh
          key={vi}
          args={[geom, undefined, instances[vi].matrices.length]}
          ref={(mesh) => {
            meshRefs.current[vi] = mesh;
          }}
        >
          <meshStandardMaterial color="#ffffff" roughness={0.95} flatShading />
        </instancedMesh>
      ))}
    </group>
  );
}
