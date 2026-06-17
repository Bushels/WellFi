'use client';

import { useCallback, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, PerspectiveCamera, PresentationControls } from '@react-three/drei';
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
import { buildWellPaths, WELLFI_TOOL_PARAM } from '@/lib/island/wellPath';
import { createPulseMaterial } from '@/lib/island/pulseMaterial';
import type { GpuTier } from '@/lib/island/quality';
import Terrain from './Terrain';
import Forest from './Forest';
import WellSystem from './WellSystem';
import WellFiTools from './WellFiTools';
import SignalRelay from './SignalRelay';
import LeasePad from './LeasePad';
import IslandLabels from './IslandLabels';
import TelemetryReadout, { type TelemetryState } from './TelemetryReadout';

interface IslandSceneProps {
  tier: GpuTier;
  reducedMotion: boolean;
  compact: boolean; // mobile framing
  forcedTime: number | null;
}

const CAMERA = {
  desktop: { position: [25.1, 19.9, 28.3] as const, target: new THREE.Vector3(-1.8, -1.5, 2.2) },
  compact: { position: [15.5, 11.5, 17.5] as const, target: new THREE.Vector3(0.5, -1.4, 0.5) },
};

const FOCUS_CAMERA = {
  desktop: { offset: new THREE.Vector3(7.6, 4.4, 6.35), targetOffset: new THREE.Vector3(0.08, 0.2, -0.02), fov: 18 },
  compact: { offset: new THREE.Vector3(5.8, 3.55, 5.2), targetOffset: new THREE.Vector3(0.18, -0.3, -0.08), fov: 22 },
};

const pulseShape = (p: number) => 3.8 * Math.sin(Math.PI * Math.min(1, Math.max(0, p)));
const ARRIVAL_F = 0.74; // within-breath fraction where the pulse reaches the active readout row

interface CameraRig {
  widePosition: THREE.Vector3;
  wideTarget: THREE.Vector3;
  focusPosition: THREE.Vector3;
  focusTarget: THREE.Vector3;
  focusFov: number;
}

function FocusCameraController({
  rig,
  cycleRef,
}: {
  rig: CameraRig;
  cycleRef: MutableRefObject<CycleState>;
}) {
  const cameraPosition = useRef(new THREE.Vector3());
  const cameraTarget = useRef(new THREE.Vector3());

  useFrame((state) => {
    const focus = cycleRef.current.focus;
    cameraPosition.current.copy(rig.widePosition).lerp(rig.focusPosition, focus);
    cameraTarget.current.copy(rig.wideTarget).lerp(rig.focusTarget, focus);
    state.camera.position.copy(cameraPosition.current);
    state.camera.lookAt(cameraTarget.current);
    state.camera.updateMatrixWorld();
    if (state.camera instanceof THREE.PerspectiveCamera) {
      state.camera.fov = THREE.MathUtils.lerp(20, rig.focusFov, focus);
      state.camera.updateProjectionMatrix();
    }
  }, 1);

  return null;
}

export default function IslandScene({ tier, reducedMotion, compact, forcedTime }: IslandSceneProps) {
  const paths = useMemo(() => buildWellPaths(), []);
  const cycleRef = useRef<CycleState>(cycleState(REDUCED_MOTION_T));
  const readoutRef = useRef<TelemetryState>({ intensity: 0, channel: -1 });
  const [composerCamera, setComposerCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const cam = compact ? CAMERA.compact : CAMERA.desktop;
  const setPerspectiveCamera = useCallback((camera: THREE.PerspectiveCamera | null) => {
    setComposerCamera(camera);
  }, []);
  const cameraRig = useMemo(() => {
    const focus = compact ? FOCUS_CAMERA.compact : FOCUS_CAMERA.desktop;
    const focusTarget = paths.wellfiTool.position.clone().add(focus.targetOffset);
    return {
      widePosition: new THREE.Vector3(...cam.position),
      wideTarget: cam.target.clone(),
      focusPosition: focusTarget.clone().add(focus.offset),
      focusTarget,
      focusFov: focus.fov,
    };
  }, [cam.position, cam.target, compact, paths]);

  const casedPulse = useMemo(
    () =>
      createPulseMaterial({
        base: { color: COLORS.casing, roughness: 0.35, metalness: 0.85, transparent: true, opacity: 1 },
        pulseColor: COLORS.signalRed,
        flowCount: 10,
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
  const rim = useRef<THREE.DirectionalLight>(null);
  const parallax = useRef<THREE.Group>(null);

  // The one clock: priority -1 runs before every other useFrame consumer.
  useFrame((state) => {
    const t = forcedTime ?? (reducedMotion ? REDUCED_MOTION_T : state.clock.elapsedTime % CYCLE_S);
    const s = cycleState(t);
    cycleRef.current = s;

    if (sun.current) sun.current.intensity = 0.12 + 2.5 * s.sun;
    if (hemi.current) hemi.current.intensity = 0.16 + 0.6 * s.sky;
    if (rim.current) rim.current.intensity = 0.22 + 0.6 * (1 - s.sun);

    if (s.pulseCased >= 0) {
      casedPulse.setPulse(WELLFI_TOOL_PARAM * (1 - s.pulseCased), pulseShape(s.pulseCased), 0.105);
    } else {
      casedPulse.setPulse(-1, 0);
    }

    const flowTime = forcedTime ?? (reducedMotion ? REDUCED_MOTION_T : state.clock.elapsedTime % 20);
    const flowStrength = 1.15 * s.flow;
    casedPulse.setFlow(flowStrength, flowTime);
    casedPulse.setCutaway(1 - 0.72 * s.focus, s.focus < 0.05);
    motherboreFlow.setFlow(flowStrength, flowTime);
    lateralFlow.setFlow(flowStrength, flowTime);

    const telemetryEnabled = !reducedMotion || forcedTime !== null;
    if (telemetryEnabled) {
      readoutRef.current.intensity =
        smooth(3.9, 4.75, t) * (1 - smooth(RELAY_END + 0.75, RELAY_END + 1.45, t));
      readoutRef.current.channel = -1;

      if (t >= RELAY_START && t < RELAY_END + 0.5) {
        const progress = (t - RELAY_START) / BREATH;
        const breath = Math.floor(progress);
        const within = progress - breath;
        const arrived = Math.min(3, breath + (within >= ARRIVAL_F ? 1 : 0));
        readoutRef.current.channel = Math.max(-1, Math.min(2, arrived - 1));
      }
    } else {
      readoutRef.current.intensity = 0;
      readoutRef.current.channel = -1;
    }

    if (parallax.current && !reducedMotion && forcedTime === null) {
      const focusDamping = 1 - 0.72 * s.focus;
      const idleY = Math.sin(state.clock.elapsedTime * 0.18) * (compact ? 0.018 : 0.026) * focusDamping;
      const idleX = Math.sin(state.clock.elapsedTime * 0.13 + 0.8) * (compact ? 0.006 : 0.01) * focusDamping;
      const targetY = state.pointer.x * 0.05 * focusDamping;
      const targetX = -state.pointer.y * 0.025 * focusDamping;
      parallax.current.rotation.y += (targetY + idleY - parallax.current.rotation.y) * 0.04;
      parallax.current.rotation.x += (targetX + idleX - parallax.current.rotation.x) * 0.04;
    }
  }, -1);

  return (
    <>
      <color attach="background" args={[COLORS.void]} />
      <PerspectiveCamera
        ref={setPerspectiveCamera}
        key={compact ? 'compact' : 'desktop'}
        makeDefault
        fov={20}
        near={0.5}
        far={120}
        position={[...cam.position]}
        onUpdate={(c) => c.lookAt(cam.target)}
      />
      <FocusCameraController rig={cameraRig} cycleRef={cycleRef} />

      <hemisphereLight ref={hemi} color={COLORS.skyFill} groundColor={COLORS.ground} intensity={0.7} />
      <directionalLight ref={sun} color={COLORS.sunWarm} position={[-7, 10, 5]} intensity={2.6} />
      <directionalLight ref={rim} color="#5e86c4" position={[8, 4, -7]} intensity={0.22} />

      <PresentationControls global={false} cursor snap speed={1.2} polar={[-0.08, 0.1]} azimuth={[-0.3, 0.3]}>
        <group ref={parallax}>
          <Terrain />
          {tier === 'high' && (
            <ContactShadows
              position={[0, 0.05, 0]}
              scale={17}
              resolution={1024}
              blur={2.6}
              far={3.2}
              opacity={0.5}
              color="#05140c"
              frames={1}
            />
          )}
          <Forest tier={tier} />
          <WellSystem
            paths={paths}
            casedMaterial={casedPulse.material}
            openHoleMaterial={motherboreFlow.material}
            lateralMaterial={lateralFlow.material}
          />
          <WellFiTools
            tool={paths.wellfiTool}
            readBoost={(s) => Math.max(s.collarWellFi, 0.72 * s.focus)}
            cycleRef={cycleRef}
          />
          <SignalRelay cycleRef={cycleRef} wellhead={paths.wellhead} />
          <LeasePad />
          <IslandLabels paths={paths} compact={compact} />
          <TelemetryReadout readoutRef={readoutRef} anchor={paths.wellfiTool.position} compact={compact} />
        </group>
      </PresentationControls>

      {tier === 'high' && composerCamera && (
        <EffectComposer camera={composerCamera}>
          <Bloom mipmapBlur intensity={1.05} luminanceThreshold={0.95} luminanceSmoothing={0.18} />
        </EffectComposer>
      )}
    </>
  );
}
