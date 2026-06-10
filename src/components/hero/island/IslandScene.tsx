'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, PresentationControls } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { COLORS } from '@/lib/island/layout';
import { CYCLE_S, REDUCED_MOTION_T, cycleState, type CycleState } from '@/lib/island/cycle';
import { buildWellPaths, TOOL_B_PARAM } from '@/lib/island/wellPath';
import { createPulseMaterial } from '@/lib/island/pulseMaterial';
import type { GpuTier } from '@/lib/island/quality';
import Terrain from './Terrain';
import Forest from './Forest';
import WellSystem from './WellSystem';
import WellFiTools from './WellFiTools';
import SignalRelay from './SignalRelay';
import LeasePad from './LeasePad';
import IslandLabels from './IslandLabels';

interface IslandSceneProps {
  tier: GpuTier;
  reducedMotion: boolean;
  compact: boolean; // mobile framing
}

const CAMERA = {
  desktop: { position: [13.5, 9.5, 15.5] as const, target: new THREE.Vector3(0.8, -1.6, 0.6) },
  compact: { position: [15.5, 11.5, 17.5] as const, target: new THREE.Vector3(0.5, -1.4, 0.5) },
};

const pulseShape = (p: number) => 2.6 * Math.sin(Math.PI * Math.min(1, Math.max(0, p)));

export default function IslandScene({ tier, reducedMotion, compact }: IslandSceneProps) {
  const paths = useMemo(() => buildWellPaths(), []);
  const cycleRef = useRef<CycleState>(cycleState(REDUCED_MOTION_T));

  const casedPulse = useMemo(
    () =>
      createPulseMaterial({
        base: { color: COLORS.casing, roughness: 0.35, metalness: 0.85 },
        pulseColor: COLORS.emGlow,
      }),
    [],
  );
  const lateralPulse = useMemo(
    () =>
      createPulseMaterial({
        base: { color: COLORS.lateral, roughness: 0.9, metalness: 0 },
        pulseColor: COLORS.signalRed,
      }),
    [],
  );

  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const parallax = useRef<THREE.Group>(null);

  // The one clock — priority -1 runs before every other useFrame consumer.
  useFrame((state) => {
    const t = reducedMotion ? REDUCED_MOTION_T : state.clock.elapsedTime % CYCLE_S;
    const s = cycleState(t);
    cycleRef.current = s;

    if (sun.current) sun.current.intensity = 0.12 + 2.5 * s.sun;
    if (hemi.current) hemi.current.intensity = 0.16 + 0.6 * s.sky;

    // Red pulse runs from WellFi B (u≈0.75) back toward the junction (u=0).
    if (s.pulseLateral >= 0) {
      lateralPulse.setPulse(TOOL_B_PARAM * (1 - s.pulseLateral), pulseShape(s.pulseLateral));
    } else {
      lateralPulse.setPulse(-1, 0);
    }
    // Cyan pulse climbs the cased section: shoe (u=1) up to the wellhead (u=0).
    if (s.pulseCased >= 0) {
      casedPulse.setPulse(1 - s.pulseCased, pulseShape(s.pulseCased));
    } else {
      casedPulse.setPulse(-1, 0);
    }

    if (parallax.current && !reducedMotion) {
      const targetY = state.pointer.x * 0.05;
      const targetX = -state.pointer.y * 0.025;
      parallax.current.rotation.y += (targetY - parallax.current.rotation.y) * 0.04;
      parallax.current.rotation.x += (targetX - parallax.current.rotation.x) * 0.04;
    }
  }, -1);

  const cam = compact ? CAMERA.compact : CAMERA.desktop;

  return (
    <>
      <color attach="background" args={[COLORS.void]} />
      {/* key forces a remount when framing flips — drei's onUpdate (and thus
          lookAt) only fires on mount/camera-change, not on prop updates. */}
      <PerspectiveCamera
        key={compact ? 'compact' : 'desktop'}
        makeDefault
        fov={20}
        near={0.5}
        far={120}
        position={[...cam.position]}
        onUpdate={(c) => c.lookAt(cam.target)}
      />

      <hemisphereLight ref={hemi} color={COLORS.skyFill} groundColor={COLORS.ground} intensity={0.7} />
      <directionalLight ref={sun} color={COLORS.sunWarm} position={[-7, 10, 5]} intensity={2.6} />
      <directionalLight color="#4a6e8a" position={[8, 4, -7]} intensity={0.22} />

      {/* Drag stays enabled even under reduced-motion (user-initiated motion
          is fine per spec §7) — only the cycle and idle parallax freeze. */}
      <PresentationControls
        global={false}
        cursor
        snap
        speed={1.2}
        polar={[-0.08, 0.1]}
        azimuth={[-0.3, 0.3]}
      >
        <group ref={parallax}>
          <Terrain />
          <Forest tier={tier} />
          <WellSystem
            paths={paths}
            casedMaterial={casedPulse.material}
            lateralFiveMaterial={lateralPulse.material}
          />
          <WellFiTools toolA={paths.toolA} toolB={paths.toolB} cycleRef={cycleRef} />
          <SignalRelay cycleRef={cycleRef} wellhead={paths.wellhead} />
          <LeasePad />
          <IslandLabels paths={paths} />
        </group>
      </PresentationControls>

      {tier === 'high' && (
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.85} luminanceThreshold={1.05} luminanceSmoothing={0.2} />
        </EffectComposer>
      )}
    </>
  );
}
