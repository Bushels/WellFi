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

const TOOL_LENGTH = 0.62; // scene units

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
      <capsuleGeometry args={[0.06, TOOL_LENGTH - 0.09, 6, 12]} />
      <meshStandardMaterial color="#d9e5ef" metalness={0.85} roughness={0.32} />
    </mesh>
  );
}

interface ToolProps {
  anchor: ToolAnchor;
  glowColor: string;
  /** reads the live collar boost off the cycle state */
  readBoost: (s: CycleState) => number;
  cycleRef: MutableRefObject<CycleState>;
}

function Tool({ anchor, glowColor, readBoost, cycleRef }: ToolProps) {
  const sleeve = useRef<THREE.MeshBasicMaterial>(null);
  const witness = useRef<THREE.MeshBasicMaterial>(null);
  const inspectionSleeve = useRef<THREE.MeshBasicMaterial>(null);
  const inspectionRingA = useRef<THREE.MeshBasicMaterial>(null);
  const inspectionRingB = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const base = useMemo(() => new THREE.Color(glowColor), [glowColor]);
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), anchor.tangent),
    [anchor],
  );

  useFrame(() => {
    const k = Math.max(EMBER, readBoost(cycleRef.current));
    const focus = cycleRef.current.focus;
    if (sleeve.current) sleeve.current.color.copy(base).multiplyScalar(0.4 + 2.4 * k);
    if (witness.current) witness.current.opacity = Math.min(0.75, 0.08 + 0.82 * k);
    if (inspectionSleeve.current) inspectionSleeve.current.opacity = 0.03 + 0.21 * focus;
    const ringOpacity = 0.08 + 0.72 * focus;
    if (inspectionRingA.current) inspectionRingA.current.opacity = ringOpacity;
    if (inspectionRingB.current) inspectionRingB.current.opacity = ringOpacity;
    if (light.current) light.current.intensity = 2.2 * k;
  });

  return (
    <group position={[anchor.position.x, anchor.position.y, anchor.position.z]} quaternion={quaternion}>
      <mesh renderOrder={21} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.17, 0.17, TOOL_LENGTH * 1.25, 24, 1, true]} />
        <meshBasicMaterial
          ref={inspectionSleeve}
          color={COLORS.emGlow}
          transparent
          opacity={0.03}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh renderOrder={26} position={[-TOOL_LENGTH * 0.58, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.17, 0.008, 8, 32]} />
        <meshBasicMaterial
          ref={inspectionRingA}
          color={COLORS.emGlow}
          transparent
          opacity={0.08}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh renderOrder={26} position={[TOOL_LENGTH * 0.58, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.17, 0.008, 8, 32]} />
        <meshBasicMaterial
          ref={inspectionRingB}
          color={COLORS.emGlow}
          transparent
          opacity={0.08}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <GlbBoundary fallback={<CapsuleStandIn />}>
        <Suspense fallback={<CapsuleStandIn />}>
          <GaugeGlb />
        </Suspense>
      </GlbBoundary>
      {/* Emissive collar sleeve — independent of the GLB, never fails. At peak pulse the color exceeds 1.0 (×2.8) BY DESIGN: that's what trips the Bloom threshold for the candle halo. */}
      <mesh renderOrder={24} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.05, TOOL_LENGTH * 0.62, 8, 16]} />
        <meshBasicMaterial
          ref={witness}
          color="#d9e5ef"
          transparent
          opacity={0.25}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh renderOrder={25} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.075, 0.075, 0.12, 16]} />
        <meshBasicMaterial ref={sleeve} color={glowColor} depthTest={false} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight ref={light} color={glowColor} intensity={0} distance={1.8} decay={2} />
    </group>
  );
}

interface WellFiToolsProps {
  tool: ToolAnchor;
  readBoost: (s: CycleState) => number;
  cycleRef: MutableRefObject<CycleState>;
}

export default function WellFiTools({ tool, readBoost, cycleRef }: WellFiToolsProps) {
  return (
    <group>
      <Tool anchor={tool} glowColor={COLORS.signalRed} readBoost={readBoost} cycleRef={cycleRef} />
    </group>
  );
}
