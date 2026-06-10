'use client';

import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODEL_PATH = '/models/wellfi-sideclamp.glb';
const MODEL_SCALE = 0.006; // ~461mm real → ~2.8 units in scene

useGLTF.setDecoderPath('/draco/');
useGLTF.preload(MODEL_PATH);

// ---------------------------------------------------------------------------
// Easing helpers
// ---------------------------------------------------------------------------

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// ---------------------------------------------------------------------------
// Production tubing — dark pipe running through the clamp
// ---------------------------------------------------------------------------

const TUBING_RADIUS = 0.18; // ~30mm at model scale
const TUBING_LENGTH = 5.0; // extends well beyond the tool

const tubingGeometry = new THREE.CylinderGeometry(
  TUBING_RADIUS,
  TUBING_RADIUS,
  TUBING_LENGTH,
  32,
);
const tubingMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#0A0A0A'),
  roughness: 0.9,
  metalness: 0.1,
});

// ---------------------------------------------------------------------------
// WellFiSideClampModel
// ---------------------------------------------------------------------------

interface WellFiSideClampModelProps {
  groupRef?: RefObject<THREE.Group | null>;
}

export default function WellFiSideClampModel({
  groupRef,
}: WellFiSideClampModelProps) {
  const { scene } = useGLTF(MODEL_PATH);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const prepared = useRef(false);
  const materialRefs = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const { size } = useThree();
  const mobile = size.width / size.height < 0.9;

  // -----------------------------------------------------------------------
  // Apply materials to all meshes (once)
  // Detect green signal collar by original material color and suppress it
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (prepared.current) return;
    materialRefs.current = [];

    cloned.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;

      // Detect green-hued materials (signal collar) by checking original color
      const origMat = object.material as THREE.MeshStandardMaterial;
      const origColor = origMat?.color;
      // Green collar: high green, low red/blue
      const isGreenCollar =
        origColor &&
        origColor.g > 0.3 &&
        origColor.g > origColor.r * 1.5 &&
        origColor.g > origColor.b * 1.5;

      // Blue marker bands: high blue, low red/green — also suppress
      const isBlueMarker =
        origColor &&
        origColor.b > 0.3 &&
        origColor.b > origColor.r * 2 &&
        origColor.b > origColor.g * 1.5;

      const isSuppressed = isGreenCollar || isBlueMarker;

      let mat: THREE.MeshPhysicalMaterial;

      if (isSuppressed) {
        // Suppress green collar — dark shadow, barely visible
        mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#0D1117'),
          roughness: 0.7,
          metalness: 0.3,
          clearcoat: 0.2,
          clearcoatRoughness: 0.4,
          envMapIntensity: 0.2,
          emissive: new THREE.Color('#000000'),
          emissiveIntensity: 0,
        });
      } else {
        // Stainless steel — the hero material
        mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#D8E4EE'),
          roughness: 0.14,
          metalness: 0.97,
          clearcoat: 1.0,
          clearcoatRoughness: 0.06,
          envMapIntensity: 0,
          emissive: new THREE.Color('#FF3333'),
          emissiveIntensity: 0,
        });
      }

      object.material = mat;
      materialRefs.current.push(mat);
    });

    prepared.current = true;

    return () => {
      materialRefs.current.forEach((mat) => mat.dispose());
      materialRefs.current = [];
      prepared.current = false;
    };
  }, [cloned]);

  // -----------------------------------------------------------------------
  // Per-frame animation: fade in envMapIntensity + emissiveIntensity
  // -----------------------------------------------------------------------
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    const envReveal = smoothstep(0.2, 1.2, elapsed);
    const envTarget = 0.3 + 1.5 * envReveal;
    const emissiveReveal = smoothstep(1.0, 2.0, elapsed);

    materialRefs.current.forEach((mat) => {
      mat.envMapIntensity = envTarget;
      mat.emissiveIntensity = Math.max(0, 0.025 * emissiveReveal);
    });
  });

  return (
    <group ref={groupRef} scale={mobile ? 0.95 : 1}>
      {/* Model: rotate -90° on X so GLB Z-axis (longest) maps to scene Y-axis (up) */}
      <group rotation={[-Math.PI / 2, 0, 0]} scale={MODEL_SCALE}>
        <primitive object={cloned} />
      </group>

      {/* Production tubing — runs vertically through the clamp bore */}
      <mesh
        geometry={tubingGeometry}
        material={tubingMaterial}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
}
