'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { COLORS } from '@/lib/island/layout';
import { RADII, type WellPaths } from '@/lib/island/wellPath';

interface WellSystemProps {
  paths: WellPaths;
  // Pulse-carrying materials, owned by IslandScene (created via createPulseMaterial).
  casedMaterial: THREE.Material;
  lateralFiveMaterial: THREE.Material;
}

export default function WellSystem({ paths, casedMaterial, lateralFiveMaterial }: WellSystemProps) {
  const geoms = useMemo(() => {
    const cased = new THREE.TubeGeometry(paths.cased, 72, RADII.cased, 12, false);
    const shell = new THREE.TubeGeometry(paths.cased, 72, RADII.cased * 1.55, 12, false);
    const openHole = new THREE.TubeGeometry(paths.openHole, 80, RADII.openHole, 10, false);
    const laterals = paths.laterals.map(
      (c) => new THREE.TubeGeometry(c, 64, RADII.lateral, 10, false),
    );
    const troughs = [paths.openHole, ...paths.laterals].map(
      (c) => new THREE.TubeGeometry(c, 64, RADII.lateral * 2.3, 8, false),
    );
    return { cased, shell, openHole, laterals, troughs };
  }, [paths]);

  const shoeQuaternion = useMemo(() => {
    const tangent = paths.cased.getTangentAt(1).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
  }, [paths]);

  return (
    <group>
      {/* Translucent things render first in JSX so alpha ordering is predictable */}
      <mesh geometry={geoms.shell}>
        <meshStandardMaterial
          color={COLORS.casingShell}
          transparent
          opacity={0.16}
          depthWrite={false}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Trough gouges the legs rest in — squashed wide tubes, tan, sunk */}
      {geoms.troughs.map((g, i) => (
        <mesh key={`trough-${i}`} geometry={g} scale={[1, 0.32, 1]} position={[0, -0.05, 0]}>
          <meshStandardMaterial color={COLORS.trough} roughness={0.95} metalness={0} />
        </mesh>
      ))}

      {/* Cased section — carries the cyan uplink pulse */}
      <mesh geometry={geoms.cased} material={casedMaterial} />

      {/* Open-hole pilot */}
      <mesh geometry={geoms.openHole}>
        <meshStandardMaterial color={COLORS.openHole} roughness={0.9} metalness={0} />
      </mesh>

      {/* Laterals — L5 (index 4) carries the red pulse from WellFi B */}
      {geoms.laterals.map((g, i) =>
        i === 4 ? (
          <mesh key={`lat-${i}`} geometry={g} material={lateralFiveMaterial} />
        ) : (
          <mesh key={`lat-${i}`} geometry={g}>
            <meshStandardMaterial color={COLORS.lateral} roughness={0.9} metalness={0} />
          </mesh>
        ),
      )}

      {/* Casing shoe — the OD step engineers look for */}
      <mesh position={[paths.shoe.x, paths.shoe.y, paths.shoe.z]} quaternion={shoeQuaternion}>
        <torusGeometry args={[RADII.cased * 1.35, 0.028, 10, 24]} />
        <meshStandardMaterial color="#d7e3ea" roughness={0.35} metalness={0.85} />
      </mesh>

      {/* Surface stub + wellhead block at grade */}
      <group position={[paths.wellhead.x, 0, paths.wellhead.z]}>
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[RADII.surfaceStub, RADII.surfaceStub, 0.5, 12]} />
          <meshStandardMaterial color="#5b6770" roughness={0.5} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.16, 0.3, 0.16]} />
          <meshStandardMaterial color="#39424a" roughness={0.45} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
