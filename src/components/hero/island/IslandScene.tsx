'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, PresentationControls } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { COLORS } from '@/lib/island/layout';
import {
  BREATH,
  CYCLE_S,
  RELAY_END,
  RELAY_START,
  REDUCED_MOTION_T,
  cycleState,
  smooth,
  type CycleState,
} from '@/lib/island/cycle';
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
import PressureReadout, { type PressureState } from './PressureReadout';

interface IslandSceneProps {
  tier: GpuTier;
  reducedMotion: boolean;
  compact: boolean; // mobile framing
}

const CAMERA = {
  desktop: { position: [25.1, 19.9, 28.3] as const, target: new THREE.Vector3(-1.8, -1.5, 2.2) },
  compact: { position: [15.5, 11.5, 17.5] as const, target: new THREE.Vector3(0.5, -1.4, 0.5) },
};

const pulseShape = (p: number) => 2.6 * Math.sin(Math.PI * Math.min(1, Math.max(0, p)));

// Downhole pressure readout (kPa) shown when each relay pulse reaches surface.
// A live-sensor feel: a base reading, a small per-breath step, and a faint tick.
// Well within the tool's 10,000 psia (~68,950 kPa) rating. Tunable.
const PRESSURE_BASE = 8450;
const PRESSURE_STEPS = [0, 95, -55]; // one per relay breath (3 per cycle)

export default function IslandScene({ tier, reducedMotion, compact }: IslandSceneProps) {
  const paths = useMemo(() => buildWellPaths(), []);
  const cycleRef = useRef<CycleState>(cycleState(REDUCED_MOTION_T));
  const pressureRef = useRef<PressureState>({ intensity: 0, kpa: PRESSURE_BASE });

  const casedPulse = useMemo(
    () =>
      createPulseMaterial({
        base: { color: COLORS.casing, roughness: 0.35, metalness: 0.85 },
        pulseColor: COLORS.emGlow,
        flowCount: 10,
      }),
    [],
  );
  const lateralPulse = useMemo(
    () =>
      createPulseMaterial({
        base: { color: COLORS.lateral, roughness: 0.9, metalness: 0 },
        pulseColor: COLORS.signalRed,
        flowCount: 8,
      }),
    [],
  );
  const motherboreFlow = useMemo(
    () =>
      createPulseMaterial({
        base: { color: COLORS.openHole, roughness: 0.9, metalness: 0 },
        pulseColor: COLORS.emGlow,
        flowCount: 12,
      }),
    [],
  );
  const lateralFlow = useMemo(
    () =>
      createPulseMaterial({
        base: { color: COLORS.lateral, roughness: 0.9, metalness: 0 },
        pulseColor: COLORS.emGlow,
        flowCount: 8,
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

    // Lit-phase production-flow chevrons on every bore (freeze time under reduced motion).
    // Wrap at 20 s: the dash shader is periodic in uTime*0.45, and 20*0.45 = 9.0 (an
    // integer number of dash periods), so the wrap is seamless AND keeps uTime small —
    // raw unbounded elapsedTime would lose fragment-shader fract() precision (dash jitter)
    // after a long session.
    const flowTime = reducedMotion ? REDUCED_MOTION_T : state.clock.elapsedTime % 20;
    const flowStrength = 0.9 * s.flow;
    casedPulse.setFlow(flowStrength, flowTime);
    lateralPulse.setFlow(flowStrength, flowTime);
    motherboreFlow.setFlow(flowStrength, flowTime);
    lateralFlow.setFlow(flowStrength, flowTime);

    // Downhole pressure readout — appears as the transmit (dark) phase begins and
    // HOLDS through all three pulses so it's actually readable, then fades at relight.
    // The value steps per pulse (+ a faint tick) so it reads as a live data feed —
    // "the tool is delivering a real downhole pressure to surface."
    if (!reducedMotion && t >= RELAY_START - 0.4 && t < RELAY_END + 0.5) {
      const appear = smooth(RELAY_START - 0.4, RELAY_START + 0.6, t);
      const leave = 1 - smooth(RELAY_END - 0.2, RELAY_END + 0.5, t);
      pressureRef.current.intensity = appear * leave;
      const breath = Math.min(2, Math.max(0, Math.floor((t - RELAY_START) / BREATH)));
      pressureRef.current.kpa = PRESSURE_BASE + PRESSURE_STEPS[breath] + 4 * Math.sin(t * 9);
    } else {
      pressureRef.current.intensity = 0;
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
            openHoleMaterial={motherboreFlow.material}
            lateralMaterial={lateralFlow.material}
          />
          <WellFiTools toolA={paths.toolA} toolB={paths.toolB} cycleRef={cycleRef} />
          <SignalRelay cycleRef={cycleRef} wellhead={paths.wellhead} />
          <LeasePad />
          <IslandLabels paths={paths} compact={compact} />
          <PressureReadout pressureRef={pressureRef} anchor={paths.wellhead} />
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
