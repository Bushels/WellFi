'use client';

import { useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '@/lib/island/layout';
import type { CycleState } from '@/lib/island/cycle';

interface SignalRelayProps {
  cycleRef: MutableRefObject<CycleState>;
  wellhead: THREE.Vector3;
}

export default function SignalRelay({ cycleRef, wellhead }: SignalRelayProps) {
  const ring = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!ring.current || !mat.current) return;
    const p = cycleRef.current.receiver;
    const active = p >= 0;
    ring.current.visible = active;
    if (!active) return;
    ring.current.scale.setScalar(0.5 + 2.6 * p);
    mat.current.opacity = 0.9 * (1 - p) * Math.min(1, p / 0.15);
  });

  return (
    <mesh
      ref={ring}
      visible={false}
      // +0.06 above the (already drape-lifted) wellhead: clears the grade cap, no z-fight
      position={[wellhead.x, wellhead.y + 0.06, wellhead.z]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[0.16, 0.21, 48]} />
      <meshBasicMaterial
        ref={mat}
        color={COLORS.emGlow}
        transparent
        opacity={0}
        toneMapped={false}
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  );
}
