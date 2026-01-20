'use client';

import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Only register on client side
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================================================
// CONFIGURATION - Easy to iterate on values
// ITERATION 2: Refined lighting for premium stainless steel look
// ============================================================================
const CONFIG = {
  // Material - Stainless Steel (polished, high-end industrial)
  material: {
    color: '#e4e4e7',          // Slightly brighter zinc-200 for more reflectivity
    metalness: 1.0,             // Full metalness
    roughness: 0.08,            // Smoother for sharper reflections (was 0.12)
    clearcoat: 0.4,             // Increased clearcoat for that "showroom" look
    clearcoatRoughness: 0.05,   // Very sharp clearcoat reflections
    envMapIntensity: 3.0,       // Stronger environment reflections (was 2.5)
  },
  // Lighting - Professional 4-point setup with 3:1 key-to-fill ratio
  lighting: {
    key: {
      position: [6, 10, 6] as [number, number, number],  // Higher, more dramatic angle
      intensity: 3.5,           // Increased for stronger specular highlights
      color: '#fff8f0',         // Warm white (adds "warmth" to metal)
    },
    fill: {
      position: [-6, 4, -4] as [number, number, number], // Wider angle
      intensity: 1.0,           // 3:1 ratio with key
      color: '#e0f2fe',         // Cool cyan tint for dimension
    },
    rim: {
      position: [-4, 6, -10] as [number, number, number], // Behind and higher
      intensity: 3.0,           // Strong rim for edge pop
      color: '#22d3ee',         // Brand cyan - creates that edge glow
      angle: 0.35,              // Tighter spotlight
      penumbra: 0.6,            // Soft edge falloff
    },
    under: {
      position: [0, -4, 3] as [number, number, number],
      intensity: 1.0,           // Subtle uplighting
      color: '#0d9488',         // Brand teal
    },
    accent: {
      // NEW: Additional accent light for more dynamic reflections
      position: [8, 2, -4] as [number, number, number],
      intensity: 1.5,
      color: '#fef3c7',         // Warm amber accent
    },
    ambient: { intensity: 0.3, color: '#f8fafc' },  // Reduced for more contrast
    hemisphere: {
      skyColor: '#f0f9ff',
      groundColor: '#0f172a',   // Darker ground for more drama
      intensity: 0.5,           // Reduced to let directional lights dominate
    },
  },
  // Scroll Animation
  scroll: {
    distance: 2500,
    scrub: 1.5,
    rotations: 2,
  },
  // Camera - Positioned for clean product shot
  camera: {
    position: [0, 0, 8] as [number, number, number],  // Pulled back for full view
    fov: 45,                    // Standard FOV
  },
  // Model scale and position
  model: {
    scale: 0.4,                 // Scale down to fit nicely
    position: [0, 0, 0] as [number, number, number],
  },
  // Environment - Clean studio for product photography look
  environment: {
    preset: 'studio' as const,
    intensity: 1.5,
  },
  // Contact Shadows - Subtle grounding
  shadows: {
    position: [0, -1.2, 0] as [number, number, number],
    opacity: 0.4,
    scale: 8,
    blur: 2,
    far: 4,
  },
  // Post-Processing - ITERATION 3 (simplified for stability)
  postProcessing: {
    bloom: {
      intensity: 0.35,          // Subtle - only affects brightest highlights
      luminanceThreshold: 0.85, // Only brightest pixels bloom
      luminanceSmoothing: 0.4,  // Smooth transition
      radius: 0.85,             // Glow spread
    },
    vignette: {
      offset: 0.25,             // How far from center darkness starts
      darkness: 0.45,           // Intensity of edge darkening
    },
  },
  // Micro-Animations - ITERATION 4
  animations: {
    cameraBreathing: {
      enabled: true,
      amplitude: { x: 0.03, y: 0.02 },  // Very subtle movement
      frequency: { x: 0.08, y: 0.12 },  // Slow, organic timing
    },
    modelFloat: {
      enabled: true,
      amplitude: 0.015,                  // Tiny vertical movement
      frequency: 0.3,                    // Gentle rhythm
    },
    entranceFade: {
      duration: 0.8,                     // Smooth entrance
      delay: 0.2,
    },
  },
};

// ============================================================================
// CLEAN STUDIO LIGHTING - Simple 3-point setup for marketable look
// ============================================================================
function PremiumLightingRig() {
  return (
    <>
      {/* Key Light - Main soft light from front-right */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={2}
        color="#ffffff"
      />

      {/* Fill Light - Softer from left */}
      <directionalLight
        position={[-5, 3, 3]}
        intensity={1}
        color="#f0f9ff"
      />

      {/* Back/Rim Light - Subtle edge definition */}
      <directionalLight
        position={[0, 5, -5]}
        intensity={1.5}
        color="#e0f2fe"
      />

      {/* Ambient for base illumination */}
      <ambientLight intensity={0.5} color="#ffffff" />
    </>
  );
}

// ============================================================================
// PREMIUM TOOL MODEL - ITERATION 4: With micro-animations
// ============================================================================
function PremiumToolModel({ reducedMotion }: { reducedMotion: boolean }) {
  const { scene } = useGLTF('/models/wellfi-gauge.glb');
  const modelRef = useRef<THREE.Group>(null);
  const floatOffset = useRef(0);

  // Create premium stainless steel material
  const premiumMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(CONFIG.material.color),
      metalness: CONFIG.material.metalness,
      roughness: CONFIG.material.roughness,
      clearcoat: CONFIG.material.clearcoat,
      clearcoatRoughness: CONFIG.material.clearcoatRoughness,
      envMapIntensity: CONFIG.material.envMapIntensity,
    });
  }, []);

  // Clone scene and apply premium stainless steel material
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Premium polished stainless steel
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#d4d4d8'),   // Zinc-300 - clean steel
          metalness: 1.0,
          roughness: 0.18,                      // Smooth but not mirror
          clearcoat: 0.3,                       // Adds depth/shine
          clearcoatRoughness: 0.1,
          envMapIntensity: 1.8,
          reflectivity: 0.9,
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  // Subtle floating animation (runs every frame)
  useFrame((state) => {
    if (!modelRef.current || reducedMotion || !CONFIG.animations.modelFloat.enabled) return;

    const t = state.clock.elapsedTime;
    floatOffset.current = Math.sin(t * CONFIG.animations.modelFloat.frequency) *
      CONFIG.animations.modelFloat.amplitude;
    modelRef.current.position.y = floatOffset.current;
  });

  // GSAP ScrollTrigger rotation
  useEffect(() => {
    if (!modelRef.current || reducedMotion) return;

    const ctx = gsap.context(() => {
      // Main rotation animation
      gsap.to(modelRef.current!.rotation, {
        y: Math.PI * 2 * CONFIG.scroll.rotations,
        ease: 'none',
        scrollTrigger: {
          trigger: '#premium-tool-section',
          start: 'top top',
          end: `+=${CONFIG.scroll.distance}`,
          scrub: CONFIG.scroll.scrub,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Subtle entrance animation
      gsap.fromTo(
        modelRef.current!.scale,
        { x: 0.8, y: 0.8, z: 0.8 },
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#premium-tool-section',
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <group ref={modelRef} scale={CONFIG.model.scale} position={CONFIG.model.position}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload the model
useGLTF.preload('/models/wellfi-gauge.glb');

// ============================================================================
// CAMERA BREATHING - ITERATION 4
// Subtle camera movement that makes the scene feel alive
// ============================================================================
function CameraBreathing({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera } = useThree();
  const basePosition = useRef(new THREE.Vector3(...CONFIG.camera.position));

  useFrame((state) => {
    if (reducedMotion || !CONFIG.animations.cameraBreathing.enabled) return;

    const t = state.clock.elapsedTime;
    const { amplitude, frequency } = CONFIG.animations.cameraBreathing;

    // Subtle sinusoidal movement
    camera.position.x = basePosition.current.x + Math.sin(t * frequency.x) * amplitude.x;
    camera.position.y = basePosition.current.y + Math.cos(t * frequency.y) * amplitude.y;

    // Keep looking at center
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ============================================================================
// MAIN SHOWCASE COMPONENT
// ============================================================================
export function PremiumToolShowcase() {
  const [sectionHeight, setSectionHeight] = useState('300vh');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Set proper height on client side
    setSectionHeight(`${CONFIG.scroll.distance + window.innerHeight}px`);

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <section
      id="premium-tool-section"
      className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
      style={{ height: sectionHeight }}
    >
      {/* Sticky canvas container */}
      <div className="sticky top-0 h-screen w-full">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent" />

        {/* 3D Canvas */}
        <Canvas
          camera={{
            position: CONFIG.camera.position,
            fov: CONFIG.camera.fov,
            near: 0.1,
            far: 100,
          }}
          shadows
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
          }}
          dpr={[1, 2]}
          className="!absolute inset-0"
          style={{ background: '#0f172a' }}
        >
          <Suspense fallback={
              <>
                <ambientLight intensity={0.5} />
                <mesh>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color="#22d3ee" />
                </mesh>
              </>
            }>
            {/* Camera breathing animation - ITERATION 4 */}
            <CameraBreathing reducedMotion={reducedMotion} />

            {/* Lighting */}
            <PremiumLightingRig />

            {/* Environment for clean reflections */}
            <Environment
              preset={CONFIG.environment.preset}
              environmentIntensity={CONFIG.environment.intensity}
            />

            {/* The Tool - with reduced motion support */}
            <PremiumToolModel reducedMotion={reducedMotion} />

            {/* Ground shadow for grounding */}
            <ContactShadows
              position={CONFIG.shadows.position}
              opacity={CONFIG.shadows.opacity}
              scale={CONFIG.shadows.scale}
              blur={CONFIG.shadows.blur}
              far={CONFIG.shadows.far}
              color="#000000"
            />

            {/* Post-Processing - temporarily disabled for debugging */}
            {/*
            <EffectComposer multisampling={4}>
              <Bloom
                mipmapBlur
                intensity={CONFIG.postProcessing.bloom.intensity}
                luminanceThreshold={CONFIG.postProcessing.bloom.luminanceThreshold}
                luminanceSmoothing={CONFIG.postProcessing.bloom.luminanceSmoothing}
                radius={CONFIG.postProcessing.bloom.radius}
              />
              <Vignette
                offset={CONFIG.postProcessing.vignette.offset}
                darkness={CONFIG.postProcessing.vignette.darkness}
                blendFunction={BlendFunction.NORMAL}
              />
            </EffectComposer>
            */}
          </Suspense>
        </Canvas>

        {/* Optional: Section title overlay */}
        <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none">
          <p className="text-slate-400 text-sm uppercase tracking-widest mb-2">
            Scroll to Explore
          </p>
          <div className="w-6 h-10 mx-auto border-2 border-slate-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default PremiumToolShowcase;
