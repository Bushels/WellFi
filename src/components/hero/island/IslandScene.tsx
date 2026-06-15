'use client';

import { useMemo, useRef } from 'react';
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
import TelemetryReadout, { type TelemetryState } from './TelemetryReadout';

interface IslandSceneProps {
  tier: GpuTier;
  reducedMotion: boolean;
  compact: boolean; // mobile framing
}

const CAMERA = {
  desktop: { position: [25.1, 19.9, 28.3] as const, target: new THREE.Vector3(-1.8, -1.5, 2.2) },
  compact: { position: [15.5, 11.5, 17.5] as const, target: new THREE.Vector3(0.5, -1.4, 0.5) },
};

// On desktop the readout floats above the wellhead. On mobile the wellhead projects
// off-screen left, so use a central in-frame anchor so the telemetry value-prop still
// shows (tuned to the clear upper zone above the copy column). See TelemetryReadout.
const READOUT_COMPACT_ANCHOR = new THREE.Vector3(2.4, 2.2, 1.2);

const pulseShape = (p: number) => 2.6 * Math.sin(Math.PI * Math.min(1, Math.max(0, p)));

// Telemetry channels carried up by the 3 relay pulses — the readout SNAPS to the
// next channel only when each uplink reaches surface. Values are tunable.
//   0 pressure (hydrostatic head, kPa) · 1 temperature (°C) · 2 WATER CUT (%)
// Pulse 3 shows water cut directly (derived from the tool's fluid-resistivity
// measurement against an operator water-sample baseline; the raw Ω·m stays off-screen).
const CHANNEL_VALUES = [223, 24, 35];
const ARRIVAL_F = 0.74; // within-breath fraction where the uplink hits surface

export default function IslandScene({ tier, reducedMotion, compact }: IslandSceneProps) {
  const paths = useMemo(() => buildWellPaths(), []);
  const cycleRef = useRef<CycleState>(cycleState(REDUCED_MOTION_T));
  const readoutRef = useRef<TelemetryState>({ intensity: 0, channel: 0, value: CHANNEL_VALUES[0] });

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
  const rim = useRef<THREE.DirectionalLight>(null);
  const parallax = useRef<THREE.Group>(null);

  // The one clock — priority -1 runs before every other useFrame consumer.
  useFrame((state) => {
    const t = reducedMotion ? REDUCED_MOTION_T : state.clock.elapsedTime % CYCLE_S;
    const s = cycleState(t);
    cycleRef.current = s;

    if (sun.current) sun.current.intensity = 0.12 + 2.5 * s.sun;
    if (hemi.current) hemi.current.intensity = 0.16 + 0.6 * s.sky;
    // Cool rim brightens as the scene darkens — catches the tool/island silhouettes
    // in the dark phase so the product reads against the void (per Codex review).
    if (rim.current) rim.current.intensity = 0.22 + 0.6 * (1 - s.sun);

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
    // Slightly dimmer than the relay pulses so the B→A→surface story stays the lead
    // and the lit-phase chevrons read as supporting "production flow" (pulse hierarchy).
    const flowStrength = 0.7 * s.flow;
    casedPulse.setFlow(flowStrength, flowTime);
    lateralPulse.setFlow(flowStrength, flowTime);
    motherboreFlow.setFlow(flowStrength, flowTime);
    lateralFlow.setFlow(flowStrength, flowTime);

    // Telemetry readout — the channel/value SNAP only at the instant each uplink
    // reaches surface (pulse 1 → pressure, 2 → temperature, 3 → resistivity), so the
    // numbers change exactly when the signal "hits", then the box holds, then fades
    // at relight. This shows the tool delivering real downhole data, one reading per
    // transmission.
    if (!reducedMotion && t >= RELAY_START && t < RELAY_END + 0.5) {
      const progress = (t - RELAY_START) / BREATH;
      const breath = Math.floor(progress);
      const within = progress - breath;
      const arrived = Math.min(3, breath + (within >= ARRIVAL_F ? 1 : 0)); // 0..3
      const channel = arrived - 1; // -1 until the first uplink lands
      const firstArrival = RELAY_START + ARRIVAL_F * BREATH;
      // Hold the last reading (resistivity → water cut, the most info-dense) well
      // into the relight so it's actually readable, then fade.
      const env =
        smooth(firstArrival - 0.04, firstArrival + 0.28, t) * (1 - smooth(RELAY_END + 0.6, RELAY_END + 1.4, t));
      readoutRef.current.intensity = channel >= 0 ? env : 0;
      readoutRef.current.channel = Math.max(0, Math.min(2, channel));
      readoutRef.current.value = CHANNEL_VALUES[readoutRef.current.channel];
    } else {
      readoutRef.current.intensity = 0;
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
      <directionalLight ref={rim} color="#5e86c4" position={[8, 4, -7]} intensity={0.22} />

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
          {/* Grounds the forest/pad onto the grass with a soft baked contact shadow
              (high-tier only; baked once — trees are static relative to the cap).
              Sits just above grass; transparent where nothing casts, so it doesn't
              veil the cut-away cavity below. */}
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
            lateralFiveMaterial={lateralPulse.material}
            openHoleMaterial={motherboreFlow.material}
            lateralMaterial={lateralFlow.material}
          />
          <WellFiTools toolA={paths.toolA} toolB={paths.toolB} cycleRef={cycleRef} />
          <SignalRelay cycleRef={cycleRef} wellhead={paths.wellhead} />
          <LeasePad />
          <IslandLabels paths={paths} compact={compact} />
          <TelemetryReadout
            readoutRef={readoutRef}
            anchor={compact ? READOUT_COMPACT_ANCHOR : paths.wellhead}
            compact={compact}
          />
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
