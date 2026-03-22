'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Float,
  PresentationControls,
  useGLTF,
} from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/models/wellfi-gauge.glb';

useGLTF.setDecoderPath('/draco/');
useGLTF.preload(MODEL_PATH);

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener('change', update);

    return () => media.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}

interface WellFiToolModelProps {
  onReady?: () => void;
}

function WellFiAssembly({ onReady }: WellFiToolModelProps) {
  const { scene } = useGLTF(MODEL_PATH);
  const prepared = useRef(false);

  useEffect(() => {
    if (prepared.current) {
      return;
    }

    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;

      const material = object.material.clone() as THREE.MeshPhysicalMaterial;
      material.color = new THREE.Color('#d9e5ef');
      material.roughness = 0.26;
      material.metalness = 0.9;
      material.clearcoat = 1;
      material.clearcoatRoughness = 0.12;
      material.envMapIntensity = 1.7;
      material.needsUpdate = true;

      object.material = material;
    });

    if (!prepared.current) {
      prepared.current = true;
      onReady?.();
    }
  }, [onReady, scene]);

  return (
    <group rotation={[0.08, -0.58, 0.03]}>
      <group scale={0.00215} position={[0, -0.15, 0]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

function AssemblyStage({ onReady }: WellFiToolModelProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <PresentationControls
      global
      cursor
      speed={1.15}
      rotation={[0.18, -0.42, 0]}
      polar={[-0.18, 0.82]}
      azimuth={[-0.8, 0.65]}
      damping={0.25}
      snap={0.18}
    >
      <Float
        speed={reducedMotion ? 0 : 1.1}
        rotationIntensity={reducedMotion ? 0 : 0.08}
        floatIntensity={reducedMotion ? 0 : 0.22}
      >
        <WellFiAssembly onReady={onReady} />
      </Float>

      <ContactShadows
        position={[0, -2.3, 0]}
        opacity={0.45}
        scale={12}
        blur={2.8}
        far={4.5}
      />
      <Environment preset="warehouse" background={false} />
    </PresentationControls>
  );
}

export default function WellFiToolModel({ onReady }: WellFiToolModelProps) {
  return (
    <Canvas
      camera={{ position: [0.75, 0.5, 7.05], fov: 34, near: 0.1, far: 40 }}
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ background: 'transparent' }}
    >
      <color attach="background" args={['#050a14']} />
      <fog attach="fog" args={['#050a14', 6, 18]} />
      <ambientLight intensity={0.9} />
      <hemisphereLight intensity={0.9} color="#8cdcff" groundColor="#0a0e1a" />
      <directionalLight position={[4, 7, 6]} intensity={2.1} color="#ffffff" />
      <directionalLight position={[-5, -3, 4]} intensity={0.65} color="#06b6d4" />
      <spotLight
        position={[0, 8, 8]}
        angle={0.4}
        penumbra={1}
        intensity={1.3}
        color="#7de9ff"
      />

      <Suspense fallback={null}>
        <AssemblyStage onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
