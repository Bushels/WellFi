'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SignalRingProps {
  /** Time (clock.elapsedTime) when the ring should start moving */
  startTime: number;
  /** Y position where the ring spawns (bottom of tool) */
  startY?: number;
  /** Y position where the ring ends (top of tool) */
  endY?: number;
  /** Radius of the ring (slightly larger than tool body) */
  radius?: number;
  /** Duration of the travel in seconds */
  duration?: number;
  /** Color of the ring */
  color?: string;
  /** Max opacity */
  maxOpacity?: number;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function SignalRing({
  startTime,
  startY = -1.2,
  endY = 1.4,
  radius = 0.25,
  duration = 0.4,
  color = '#22D3EE',
  maxOpacity = 0.6,
}: SignalRingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const [done, setDone] = useState(false);

  useFrame((state) => {
    if (done || !meshRef.current || !materialRef.current) return;

    const elapsed = state.clock.getElapsedTime();
    const t = (elapsed - startTime) / duration;

    if (t < 0) {
      materialRef.current.opacity = 0;
      return;
    }

    if (t > 1) {
      materialRef.current.opacity = 0;
      meshRef.current.visible = false;
      setDone(true);
      return;
    }

    const progress = easeOutCubic(t);

    // Position: travel from startY to endY
    meshRef.current.position.y = THREE.MathUtils.lerp(startY, endY, progress);

    // Opacity: quick fade in, hold, quick fade out
    let opacity: number;
    if (t < 0.1) {
      opacity = (t / 0.1) * maxOpacity;
    } else if (t > 0.8) {
      opacity = ((1 - t) / 0.2) * maxOpacity;
    } else {
      opacity = maxOpacity;
    }
    materialRef.current.opacity = opacity;
  });

  if (done) return null;

  return (
    <mesh ref={meshRef} position={[0, startY, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 8, 32]} />
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
