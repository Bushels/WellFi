'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  PerspectiveCamera,
} from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  N8AO,
  DepthOfField,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import SignalRing from './SignalRing';
import WellFiSideClampModel from './WellFiSideClampModel';

// ---------------------------------------------------------------------------
// Easing helpers
// ---------------------------------------------------------------------------

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// ---------------------------------------------------------------------------
// Scratch vectors — reused every frame to avoid GC pressure
// ---------------------------------------------------------------------------

const _cameraStart = new THREE.Vector3();
const _cameraEnd = new THREE.Vector3();
const _basePos = new THREE.Vector3();
const _lookStart = new THREE.Vector3();
const _lookEnd = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

// ---------------------------------------------------------------------------
// Animated Lighting Rig — staggered reveal, then steady-state
// ---------------------------------------------------------------------------

function LightingRig() {
  const rimRef = useRef<THREE.SpotLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const topRef = useRef<THREE.SpotLight>(null);
  const accentRef = useRef<THREE.SpotLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const barrelRef = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Dramatic staggered reveal — rim FIRST catches the steel edge,
    // then other lights build up over 1.5s for cinematic sweep feeling
    if (rimRef.current) rimRef.current.intensity = 2.0 * smoothstep(0.0, 0.4, t);
    if (ambientRef.current) ambientRef.current.intensity = 0.15 * smoothstep(0.3, 0.8, t);
    if (keyRef.current) keyRef.current.intensity = 2.8 * smoothstep(0.4, 1.2, t);
    if (fillRef.current) fillRef.current.intensity = 0.8 * smoothstep(0.5, 1.3, t);
    if (topRef.current) topRef.current.intensity = 1.4 * smoothstep(0.6, 1.4, t);
    if (accentRef.current) accentRef.current.intensity = 0.6 * smoothstep(0.7, 1.5, t);
    if (barrelRef.current) barrelRef.current.intensity = 1.1 * smoothstep(0.35, 1.0, t);
  });

  return (
    <>
      {/* Very low ambient — darkness is the default state */}
      <ambientLight ref={ambientRef} intensity={0} />
      <hemisphereLight intensity={0.08} color="#8fdfff" groundColor="#020610" />

      {/* Rim — cold edge catch from behind-left — FIRST visible light */}
      <spotLight
        ref={rimRef}
        position={[-2.5, 2, -3]}
        intensity={0}
        color="#E8F4FF"
        angle={0.22}
        penumbra={0.9}
        castShadow
      />

      {/* Key — main illumination from upper right, dramatic */}
      <directionalLight ref={keyRef} position={[3, 5, 4]} intensity={0} color="#F7FBFF" castShadow />

      {/* Fill — cyan from the left, subtle industrial accent */}
      <directionalLight ref={fillRef} position={[-4, 1, 3]} intensity={0} color="#6DF2FF" />

      {/* Top — specular highlight catching the clamp windows */}
      <spotLight ref={topRef} position={[0.3, 6, 2]} intensity={0} color="#EFFBFF" angle={0.25} penumbra={1} />

      {/* Accent — cyan rim from lower right, adds depth */}
      <spotLight ref={accentRef} position={[2.5, -1.5, 2.5]} intensity={0} color="#67F4FF" angle={0.3} penumbra={1} />

      {/* Barrel — long specular highlight running parallel to tool body */}
      <spotLight ref={barrelRef} position={[1.5, 0.5, 1]} intensity={0} color="#FFFFFF" angle={0.12} penumbra={0.65} castShadow />
    </>
  );
}

// ---------------------------------------------------------------------------
// Camera Rig — entrance dolly, then subtle float (no mouse parallax)
// ---------------------------------------------------------------------------

function PersistentCameraRig() {
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const aspect = state.size.width / state.size.height;
    const mobile = aspect < 0.9;

    // Entrance: camera sweeps from dramatic angle to tight settled position
    const entranceProgress = easeOutCubic(THREE.MathUtils.clamp(elapsed / 1.8, 0, 1));

    // Moved MUCH closer for 30-40% tool visibility with foreshortening
    // Slight X offset to show side-clamp profile, slight Y offset for ~10-15 deg angle
    _cameraStart.set(mobile ? 1.05 : 1.35, mobile ? 0.16 : 0.26, mobile ? 3.5 : 4.0);
    _cameraEnd.set(mobile ? 0.84 : 1.05, mobile ? 0.08 : 0.14, mobile ? 2.95 : 3.25);
    _basePos.lerpVectors(_cameraStart, _cameraEnd, entranceProgress);

    // Subtle float after settle
    if (elapsed > 2.0) {
      _basePos.y += Math.sin(elapsed * 0.4) * 0.004;
    }

    state.camera.position.copy(_basePos);

    // Look at the clamp zone (slightly above center where the clamp detail is)
    _lookStart.set(mobile ? 0.12 : 0.18, mobile ? 0.05 : 0.12, 0.08);
    _lookEnd.set(mobile ? 0.08 : 0.14, mobile ? 0.04 : 0.08, 0.04);
    _lookTarget.lerpVectors(_lookStart, _lookEnd, entranceProgress);

    state.camera.lookAt(_lookTarget);

    // Tight FOV for dramatic foreshortening (narrower = more compression)
    const cam = state.camera as THREE.PerspectiveCamera;
    const startFov = mobile ? 34 : 30;
    const endFov = mobile ? 28 : 24;
    const targetFov = THREE.MathUtils.lerp(startFov, endFov, entranceProgress);
    if (Math.abs(cam.fov - targetFov) > 0.05) {
      cam.fov = targetFov;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}

// ---------------------------------------------------------------------------
// Tool Stage — Side-Clamp Model with entrance animation
// ---------------------------------------------------------------------------

function ToolStage() {
  const rigRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const aspect = state.size.width / state.size.height;
    const mobile = aspect < 0.9;

    const entranceProgress = easeOutCubic(THREE.MathUtils.clamp(elapsed / 1.8, 0, 1));

    if (rigRef.current) {
      rigRef.current.rotation.x = THREE.MathUtils.lerp(0.04, 0.01, entranceProgress);
      rigRef.current.rotation.y = THREE.MathUtils.lerp(-1.05, -0.88, entranceProgress);
      rigRef.current.rotation.z = THREE.MathUtils.lerp(0.02, 0, entranceProgress);

      const xOffset = mobile
        ? THREE.MathUtils.lerp(0.08, 0.12, entranceProgress)
        : THREE.MathUtils.lerp(0.16, 0.28, entranceProgress);
      rigRef.current.position.x = xOffset;
      rigRef.current.position.y = THREE.MathUtils.lerp(0.02, 0, entranceProgress);

      // Very subtle continuous float after settle
      if (elapsed > 2.0) {
        const breathe = Math.sin(elapsed * 0.4) * 0.005;
        rigRef.current.position.y += breathe;
        rigRef.current.rotation.y += Math.sin(elapsed * 0.3) * 0.001;
      }
    }
  });

  return (
    <group ref={rigRef} position={[0.16, 0.02, 0]} rotation={[0.04, -1.05, 0.02]}>
      <WellFiSideClampModel />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Post-Processing — cinematic lens quality
// ---------------------------------------------------------------------------

function CinematicEffects() {
  const { size } = useThree();
  const mobile = size.width / size.height < 0.9;

  return (
    <EffectComposer multisampling={0}>
      {/* DOF: focus on the near end, blur the far end — macro photography feel */}
      <DepthOfField
        focusDistance={0}
        focalLength={mobile ? 0.015 : 0.025}
        bokehScale={mobile ? 2.5 : 4.5}
        height={mobile ? 240 : 480}
      />

      {/* Bloom: catches specular highlights and signal ring */}
      <Bloom
        intensity={mobile ? 0.25 : 0.5}
        luminanceThreshold={0.75}
        luminanceSmoothing={0.3}
        mipmapBlur
      />

      {/* SSAO: grounding, desktop only (zeroed on mobile — EffectComposer requires stable children) */}
      <N8AO
        aoRadius={mobile ? 0 : 0.06}
        intensity={mobile ? 0 : 0.65}
        distanceFalloff={0.5}
        halfRes
      />

      {/* Vignette: darkened edges, cinematic framing */}
      <Vignette
        offset={0.25}
        darkness={mobile ? 0.55 : 0.7}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}

// ---------------------------------------------------------------------------
// Exported Canvas — persistent, never disposed
// ---------------------------------------------------------------------------

export default function HeroCinematicCanvas() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.85,
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'transparent',
      }}
    >
      <color attach="background" args={['#020610']} />
      <fog attach="fog" args={['#020610', 2, 8]} />
      <PerspectiveCamera makeDefault position={[0.5, 0.3, 3.2]} fov={32} />

      <LightingRig />

      <Suspense fallback={null}>
        <Environment preset="warehouse" background={false} />
        <PersistentCameraRig />
        <ToolStage />
        <SignalRing
          startTime={1.1}
          startY={-0.7}
          endY={0.94}
          radius={0.09}
          duration={0.4}
          maxOpacity={0.58}
        />
        <ContactShadows
          position={[0, -1.4, 0]}
          opacity={0.3}
          scale={6}
          blur={2.5}
          far={3.5}
        />
      </Suspense>

      <CinematicEffects />
    </Canvas>
  );
}
