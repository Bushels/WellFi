'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import {
  CAP_OUTLINE, COAL_YS, FLOOR_Y, LOWER, SLAB, STRATA,
  floorY, inCavity,
} from '@/lib/island/layout';

function polyToShape(poly: readonly (readonly [number, number])[]): THREE.Shape {
  const shape = new THREE.Shape();
  poly.forEach(([x, z], i) => (i === 0 ? shape.moveTo(x, z) : shape.lineTo(x, z)));
  shape.closePath();
  return shape;
}

// Extrude a plan-view shape downward from topY to bottomY.
// ExtrudeGeometry extrudes along +Z; rotateX(PI/2) maps that to -Y and
// maps the shape's plan Y axis onto world Z.
function stratumGeometry(shape: THREE.Shape, topY: number, bottomY: number): THREE.BufferGeometry {
  const geom = new THREE.ExtrudeGeometry(shape, { depth: topY - bottomY, bevelEnabled: false });
  geom.rotateX(Math.PI / 2);
  geom.translate(0, topY, 0);
  geom.computeVertexNormals();
  return geom;
}

function makeFloorGeometry(): THREE.BufferGeometry {
  // Plane over the cavity's bounding box, vertices draped on floorY.
  const minX = -2.5;
  const maxX = 7;
  const minZ = -1.6;
  const maxZ = 5;
  const geom = new THREE.PlaneGeometry(maxX - minX, maxZ - minZ, 96, 64);
  geom.rotateX(-Math.PI / 2);
  geom.translate((minX + maxX) / 2, 0, (minZ + maxZ) / 2);
  const pos = geom.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    // Outside the cavity the floor tucks flat under the upper block edge.
    pos.setY(i, inCavity(x, z) ? floorY(x, z) : FLOOR_Y - 0.01);
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();
  return geom;
}

// SSR fallback — the island only mounts client-side (IslandCanvas gates on a
// post-mount effect), but guard anyway so a stray server render can't break
// the static-export build.
function fallbackTexture(): THREE.Texture {
  const tex = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1);
  tex.needsUpdate = true;
  return tex;
}

// One shared grain texture (spec §5) — without it stylized flat-color strata
// read as plastic. Used as a subtle bumpMap on every rock material.
function makeNoiseTexture(): THREE.Texture {
  if (typeof document === 'undefined') return fallbackTexture();
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  let s = 1234567;
  for (let i = 0; i < img.data.length; i += 4) {
    s = (s * 16807) % 2147483647;
    const v = 116 + (s % 80);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

function makeShadowTexture(): THREE.Texture {
  if (typeof document === 'undefined') return fallbackTexture();
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(0.7, 'rgba(0,0,0,0.18)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

export default function Terrain() {
  const capShape = useMemo(() => polyToShape(CAP_OUTLINE), []);
  const rectShape = useMemo(
    () =>
      polyToShape([
        [SLAB.minX, SLAB.minZ], [SLAB.maxX, SLAB.minZ],
        [SLAB.maxX, SLAB.maxZ], [SLAB.minX, SLAB.maxZ],
      ]),
    [],
  );
  const strataGeoms = useMemo(
    () => STRATA.map((s) => stratumGeometry(capShape, s.topY, s.bottomY)),
    [capShape],
  );
  const lowerGeom = useMemo(
    () => stratumGeometry(rectShape, LOWER.topY, LOWER.bottomY),
    [rectShape],
  );
  const coalGeoms = useMemo(
    () => COAL_YS.map((y) => stratumGeometry(rectShape, y, y - 0.07)),
    [rectShape],
  );
  const floorGeom = useMemo(() => makeFloorGeometry(), []);
  const shadowTex = useMemo(() => makeShadowTexture(), []);
  const noiseTex = useMemo(() => makeNoiseTexture(), []);

  // Resources are intentionally not disposed: the hero mounts once per page and
  // lives for its lifetime. (Dev hot-reload remounts leak a little VRAM —
  // acceptable; revisit only if this component ever mounts repeatedly.)
  return (
    <group>
      {STRATA.map((s, i) => (
        <mesh key={s.name} geometry={strataGeoms[i]}>
          <meshStandardMaterial
            color={s.color}
            roughness={s.roughness}
            metalness={0}
            bumpMap={noiseTex}
            bumpScale={0.02}
          />
        </mesh>
      ))}
      <mesh geometry={lowerGeom}>
        <meshStandardMaterial
          color={LOWER.color}
          roughness={LOWER.roughness}
          metalness={0}
          bumpMap={noiseTex}
          bumpScale={0.02}
        />
      </mesh>
      {coalGeoms.map((g, i) => (
        <mesh key={`coal-y${COAL_YS[i]}`} geometry={g} scale={[1.001, 1, 1.001]}>
          <meshStandardMaterial color="#0d0b08" roughness={0.4} metalness={0.1} />
        </mesh>
      ))}
      <mesh geometry={floorGeom}>
        <meshStandardMaterial
          color="#322316"
          roughness={0.62}
          metalness={0}
          bumpMap={noiseTex}
          bumpScale={0.03}
        />
      </mesh>
      {/* Fake contact shadow — the island floats in the void */}
      <mesh position={[0, SLAB.baseY - 0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 17]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}
