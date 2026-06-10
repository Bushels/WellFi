'use client';

import { Component, Suspense, useMemo, useRef, type MutableRefObject, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '@/lib/island/layout';
import { EMBER, type CycleState } from '@/lib/island/cycle';
import type { ToolAnchor } from '@/lib/island/wellPath';

const MODEL_PATH = '/wellfi/models/wellfi-gauge.glb';
useGLTF.setDecoderPath('/wellfi/draco/');
useGLTF.preload(MODEL_PATH, true);

const TOOL_LENGTH = 0.55; // scene units

class GlbBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function GaugeGlb() {
  const { scene } = useGLTF(MODEL_PATH, true);
  const prepared = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true); // detached clone: recompute world matrices before measuring
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const longest = Math.max(size.x, size.y, size.z);
    const axis =
      longest === size.x ? new THREE.Vector3(1, 0, 0)
      : longest === size.y ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(0, 0, 1);
    const center = box.getCenter(new THREE.Vector3());
    // Recenter, align long axis to +X (the outer group maps +X onto the tube tangent).
    const group = new THREE.Group();
    clone.position.sub(center);
    group.add(clone);
    group.quaternion.setFromUnitVectors(axis, new THREE.Vector3(1, 0, 0));
    group.scale.setScalar(TOOL_LENGTH / longest);
    clone.traverse((o) => {
      if (o instanceof THREE.Mesh && o.material instanceof THREE.MeshStandardMaterial) {
        const m = o.material.clone();
        m.color = new THREE.Color('#d9e5ef');
        m.metalness = 0.88;
        m.roughness = 0.3;
        o.material = m;
      }
    });
    return group;
  }, [scene]);
  return <primitive object={prepared} />;
}

function CapsuleStandIn() {
  return (
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <capsuleGeometry args={[0.045, TOOL_LENGTH - 0.09, 6, 12]} />
      <meshStandardMaterial color="#d9e5ef" metalness={0.85} roughness={0.32} />
    </mesh>
  );
}

interface ToolProps {
  anchor: ToolAnchor;
  glowColor: string;
  /** reads collarA or collarB off the live cycle state */
  readBoost: (s: CycleState) => number;
  cycleRef: MutableRefObject<CycleState>;
}

function Tool({ anchor, glowColor, readBoost, cycleRef }: ToolProps) {
  const sleeve = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const base = useMemo(() => new THREE.Color(glowColor), [glowColor]);
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), anchor.tangent),
    [anchor],
  );

  useFrame(() => {
    const k = Math.max(EMBER, readBoost(cycleRef.current));
    if (sleeve.current) sleeve.current.color.copy(base).multiplyScalar(0.4 + 2.4 * k);
    if (light.current) light.current.intensity = 2.2 * k;
  });

  return (
    <group position={[anchor.position.x, anchor.position.y, anchor.position.z]} quaternion={quaternion}>
      <GlbBoundary fallback={<CapsuleStandIn />}>
        <Suspense fallback={<CapsuleStandIn />}>
          <GaugeGlb />
        </Suspense>
      </GlbBoundary>
      {/* Emissive collar sleeve — independent of the GLB, never fails. At peak pulse the color exceeds 1.0 (×2.8) BY DESIGN: that's what trips the Bloom threshold for the candle halo. */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.062, 0.062, 0.15, 16]} />
        <meshBasicMaterial ref={sleeve} color={glowColor} toneMapped={false} />
      </mesh>
      <pointLight ref={light} color={glowColor} intensity={0} distance={1.8} decay={2} />
    </group>
  );
}

interface WellFiToolsProps {
  toolA: ToolAnchor;
  toolB: ToolAnchor;
  cycleRef: MutableRefObject<CycleState>;
}

export default function WellFiTools({ toolA, toolB, cycleRef }: WellFiToolsProps) {
  return (
    <group>
      <Tool anchor={toolA} glowColor={COLORS.emGlow} readBoost={(s) => s.collarA} cycleRef={cycleRef} />
      <Tool anchor={toolB} glowColor={COLORS.signalRed} readBoost={(s) => s.collarB} cycleRef={cycleRef} />
    </group>
  );
}
