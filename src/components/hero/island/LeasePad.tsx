'use client';

import { PAD_RECT, ROAD_RECT } from '@/lib/island/layout';

const steel = { color: '#aab4ba', roughness: 0.45, metalness: 0.7 } as const;

export default function LeasePad() {
  const padCx = (PAD_RECT.minX + PAD_RECT.maxX) / 2;
  const padCz = (PAD_RECT.minZ + PAD_RECT.maxZ) / 2;
  const roadCx = (ROAD_RECT.minX + ROAD_RECT.maxX) / 2;
  const roadLen = ROAD_RECT.maxZ - ROAD_RECT.minZ;

  return (
    <group>
      {/* Gravel pad */}
      <mesh position={[padCx, 0.03, padCz]}>
        <boxGeometry args={[PAD_RECT.maxX - PAD_RECT.minX, 0.06, PAD_RECT.maxZ - PAD_RECT.minZ]} />
        <meshStandardMaterial color="#8d816c" roughness={0.95} />
      </mesh>
      {/* Gravel road through the cleared forest corridor */}
      <mesh position={[roadCx, 0.025, ROAD_RECT.minZ + roadLen / 2]}>
        <boxGeometry args={[ROAD_RECT.maxX - ROAD_RECT.minX, 0.05, roadLen]} />
        <meshStandardMaterial color="#6e655a" roughness={0.95} />
      </mesh>
      {/* PCP drive head over the bore (wellhead at x -5.2, z 5) */}
      <group position={[-5.2, 0, 4.6]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.2, 0.34, 0.2]} />
          <meshStandardMaterial {...steel} />
        </mesh>
        <mesh position={[0.16, 0.62, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.18, 10]} />
          <meshStandardMaterial color="#7a2c20" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>
      {/* Tank battery: two oil-red, one produced-water white */}
      {([
        [-6.0, 3.4, '#7a2c20'],
        [-5.3, 3.2, '#7a2c20'],
        [-5.65, 4.1, '#cfd6da'],
      ] as const).map(([x, z, color], i) => (
        <mesh key={`tank-${i}`} position={[x, 0.31, z]}>
          <cylinderGeometry args={[0.28, 0.28, 0.5, 16]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.35} />
        </mesh>
      ))}
      {/* Horizontal separator on saddles */}
      <mesh position={[-4.4, 0.24, 3.1]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.13, 0.5, 4, 12]} />
        <meshStandardMaterial {...steel} />
      </mesh>
      {/* Unlit flare stack */}
      <mesh position={[-3.95, 0.48, 2.8]}>
        <cylinderGeometry args={[0.022, 0.022, 0.9, 8]} />
        <meshStandardMaterial {...steel} />
      </mesh>
    </group>
  );
}
