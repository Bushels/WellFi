'use client';

import { Suspense, useRef, useState, createContext, useContext, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  ScrollControls,
  useScroll,
  Environment,
  Float,
} from '@react-three/drei';
import * as THREE from 'three';
import { Cpu, Radio, Battery, Gauge } from 'lucide-react';
import { WellFiTool } from '../three/WellFiTool';

// Context to share scroll data between Canvas and HTML overlay
const ScrollDataContext = createContext<{ scrollOffset: number }>({ scrollOffset: 0 });

// Component that updates scroll data from within Three.js
function ScrollDataProvider({ children, onScrollUpdate }: { children: React.ReactNode; onScrollUpdate: (offset: number) => void }) {
  const scroll = useScroll();
  const lastOffsetRef = useRef(0);

  useFrame(() => {
    const newOffset = scroll.offset;
    // Only update if there's a meaningful change
    if (Math.abs(newOffset - lastOffsetRef.current) > 0.001) {
      lastOffsetRef.current = newOffset;
      onScrollUpdate(newOffset);
    }
  });

  return <>{children}</>;
}

// Wrapper for the WellFi Tool with scroll-linked animations
function AnimatedWellFiTool() {
  const modelRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  
  // Base rotation to lay the tall cylinder horizontal
  const baseRotationX = Math.PI / 2;

  useFrame((state) => {
    if (!modelRef.current) return;

    const offset = scroll.offset;

    // Continuous slow rotation with scroll-based acceleration
    const scrollRotation = offset * Math.PI * 2;
    
    // Apply rotations with base horizontal orientation
    // Y rotation (spin around vertical axis)
    modelRef.current.rotation.x = baseRotationX + Math.sin(offset * Math.PI * 2) * 0.15;
    modelRef.current.rotation.y = scrollRotation + Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    modelRef.current.rotation.z = Math.PI / 6 + Math.sin(offset * Math.PI * 4) * 0.02;

    // Scale pulse at key moments - model has very large native units
    const scalePulse = 1 + Math.sin(offset * Math.PI * 4) * 0.02;
    modelRef.current.scale.setScalar(scalePulse * 0.015);

    // Vertical position - slight bob
    modelRef.current.position.y = Math.sin(offset * Math.PI * 2) * 0.1;

    // Horizontal drift based on scroll
    modelRef.current.position.x = Math.sin(offset * Math.PI) * 0.3;
  });

  return (
    <group ref={modelRef} position={[0, 0, 0]}>
      {/* 
          Pass stainless steel material props or let the component handle it.
          Since WellFiTool loads the model and might apply its own materials, 
          we rely on it. If we need to force the "stainless steel" look from 
          outside, we might need a prop on WellFiTool, but the shared component 
          is likely already styled correctly or close enough.
      */}
      <WellFiTool />
    </group>
  );
}

// Animated feature callouts that appear at scroll positions
function FeatureCallouts() {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const offset = scroll.offset;

    // Fade in/out based on scroll position
    groupRef.current.children.forEach((child, i) => {
      const targetOpacity = offset > 0.2 + i * 0.15 && offset < 0.5 + i * 0.15 ? 1 : 0;
      if ((child as THREE.Mesh).material) {
        const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.1);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Feature indicator rings */}
      <mesh position={[0.5, 0.3, 0]}>
        <ringGeometry args={[0.08, 0.1, 32]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.5, 0, 0]}>
        <ringGeometry args={[0.08, 0.1, 32]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.3, -0.4, 0]}>
        <ringGeometry args={[0.08, 0.1, 32]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Animated particle field for tech ambiance
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const scroll = useScroll();
  
  // Create geometry once using useMemo to avoid impure calculations during render
  const geometry = useMemo(() => {
    // Simple seeded pseudo-random for deterministic positions
    let seed = 12345;
    const seededRandom = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    
    const count = 200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Distribute in a cylinder around the model
      const angle = seededRandom() * Math.PI * 2;
      const radius = 2 + seededRandom() * 3;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (seededRandom() - 0.5) * 4;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Cyan to teal gradient
      const t = seededRandom();
      colors[i * 3] = 0.13 + t * 0.05;     // R
      colors[i * 3 + 1] = 0.58 + t * 0.25; // G
      colors[i * 3 + 2] = 0.93 - t * 0.4;  // B
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;

    const offset = scroll.offset;

    // Rotate particle field opposite to model
    particlesRef.current.rotation.y = -offset * Math.PI + state.clock.elapsedTime * 0.05;

    // Pulse opacity based on scroll
    const material = particlesRef.current.material as THREE.PointsMaterial;
    material.opacity = 0.4 + Math.sin(offset * Math.PI * 2) * 0.2;
  });

  if (!geometry) return null;

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

// Cyan glow ring that pulses with scroll
function GlowRing() {
  const ringRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame((state) => {
    if (!ringRef.current) return;

    const offset = scroll.offset;

    // Pulsing scale
    const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    ringRef.current.scale.setScalar(scale);

    // Rotate with scroll
    ringRef.current.rotation.x = Math.PI / 2;
    ringRef.current.rotation.z = offset * Math.PI * 4;

    // Position follows model slightly
    ringRef.current.position.y = Math.sin(offset * Math.PI * 2) * 0.1;
  });

  return (
    <mesh ref={ringRef} position={[0, 0, 0]}>
      <torusGeometry args={[1.5, 0.02, 16, 100]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.3} />
    </mesh>
  );
}

// Main 3D scene setup
function Scene({ onScrollUpdate }: { onScrollUpdate: (offset: number) => void }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={1} color="#22d3ee" />
      <pointLight position={[0, 2, 3]} intensity={1} color="#0d9488" />

      {/* Environment for reflections - City preset provides sharper contrasts for metal */}
      <Environment preset="city" environmentIntensity={1.2} />

      {/* Main content */}
      <ScrollControls pages={3} damping={0.25}>
        <ScrollDataProvider onScrollUpdate={onScrollUpdate}>
          {/* 3D Layer */}
          <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
            <AnimatedWellFiTool />
          </Float>
          <GlowRing />
          <ParticleField />
          <FeatureCallouts />
        </ScrollDataProvider>
      </ScrollControls>
    </>
  );
}

// HTML Overlay that syncs with scroll
function HTMLOverlay() {
  const { scrollOffset } = useContext(ScrollDataContext);
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Page 1: Introduction */}
      <div 
        className="h-screen w-full flex items-center transition-opacity duration-500"
        style={{ 
          opacity: scrollOffset < 0.33 ? 1 - (scrollOffset * 3) : 0,
          transform: `translateY(${-scrollOffset * 100}vh)`
        }}
      >
        <div className="ml-[5%] max-w-lg pointer-events-auto">
          <div className="mb-4">
            <span className="label-text inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
              <Radio className="w-4 h-4 text-[var(--wellfi-cyan)]" />
              Interactive 3D
            </span>
          </div>
          <h2 className="display-heading text-4xl md:text-5xl mb-6">
            <span className="text-gradient text-glow">Explore</span>
            <br />
            <span className="text-[var(--wellfi-white)]">Every Detail</span>
          </h2>
          <p className="text-lg text-[var(--wellfi-white)]/60 mb-6">
            Scroll to rotate the WellFi gauge and discover the engineering
            that makes wireless downhole monitoring possible.
          </p>
          <div className="flex items-center gap-2 text-sm text-[var(--wellfi-cyan)]">
            <span className="w-6 h-6 rounded-full border border-[var(--wellfi-cyan)]/50 flex items-center justify-center">
              <span className="w-1.5 h-3 rounded-full bg-[var(--wellfi-cyan)] animate-bounce" />
            </span>
            Scroll to explore
          </div>
        </div>
      </div>

      {/* Page 2: Features highlight */}
      <div 
        className="h-screen w-full flex items-center justify-end transition-opacity duration-500"
        style={{ 
          opacity: scrollOffset >= 0.25 && scrollOffset < 0.66 ? Math.min((scrollOffset - 0.25) * 4, 1 - (scrollOffset - 0.33) * 3) : 0,
          transform: `translateY(${-scrollOffset * 100 + 100}vh)`
        }}
      >
        <div className="mr-[5%] max-w-md space-y-6 pointer-events-auto">
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--wellfi-cyan)]/20 to-[var(--wellfi-teal)]/10 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-[var(--wellfi-cyan)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--wellfi-white)]">Electronics Sonde</h3>
                <p className="text-sm text-[var(--wellfi-white)]/50">High-precision sensors</p>
              </div>
            </div>
            <p className="text-sm text-[var(--wellfi-white)]/60">
               Quartz and piezo pressure sensors with 0.006 PSI resolution for accurate
              bottomhole measurements.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--wellfi-cyan)]/20 to-[var(--wellfi-teal)]/10 flex items-center justify-center">
                <Radio className="w-6 h-6 text-[var(--wellfi-cyan)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--wellfi-white)]">EM Telemetry</h3>
                <p className="text-sm text-[var(--wellfi-white)]/50">Through-casing signal</p>
              </div>
            </div>
            <p className="text-sm text-[var(--wellfi-white)]/60">
               Proprietary electromagnetic transmission through steel casing.
              No cables required.
            </p>
          </div>
        </div>
      </div>

      {/* Page 3: Specifications */}
      <div 
        className="h-screen w-full flex items-center transition-opacity duration-500"
        style={{ 
          opacity: scrollOffset >= 0.66 ? (scrollOffset - 0.66) * 3 : 0,
          transform: `translateY(${-scrollOffset * 100 + 200}vh)`
        }}
      >
        <div className="ml-[5%] max-w-md space-y-6 pointer-events-auto">
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--wellfi-cyan)]/20 to-[var(--wellfi-teal)]/10 flex items-center justify-center">
                <Battery className="w-6 h-6 text-[var(--wellfi-cyan)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--wellfi-white)]">5+ Year Battery</h3>
                <p className="text-sm text-[var(--wellfi-white)]/50">Long-term deployment</p>
              </div>
            </div>
            <p className="text-sm text-[var(--wellfi-white)]/60">
               Lithium thionyl chloride cells rated for extreme temperatures,
              ensuring years of continuous operation.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--wellfi-cyan)]/20 to-[var(--wellfi-teal)]/10 flex items-center justify-center">
                <Gauge className="w-6 h-6 text-[var(--wellfi-cyan)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--wellfi-white)]">10,000 PSI Rating</h3>
                <p className="text-sm text-[var(--wellfi-white)]/50">Extreme conditions</p>
              </div>
            </div>
            <p className="text-sm text-[var(--wellfi-white)]/60">
               Built for the harshest downhole environments with 302°F temperature
              rating and robust stainless steel construction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-2 border-[var(--wellfi-cyan)]/30 border-t-[var(--wellfi-cyan)] animate-spin mx-auto mb-4" />
        <p className="text-[var(--wellfi-white)]/60">Loading 3D Model...</p>
      </div>
    </div>
  );
}

// Main exported component
export function ProductExplorerSection() {
  const [scrollOffset, setScrollOffset] = useState(0);

  return (
    <ScrollDataContext.Provider value={{ scrollOffset }}>
      <section
        id="product-explorer"
        className="relative h-[300vh]"
        style={{ background: 'var(--wellfi-slate-900)' }}
      >
        {/* Background elements */}
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="absolute inset-0 bg-gradient-radial opacity-30" />

          {/* 3D Canvas disabled to prevent WebGL Context Lost conflicts */}
          {/* Using a gradient fallback until single-canvas architecture is implemented */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Gradient orb as placeholder for 3D model */}
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-cyan-400/20 via-teal-500/30 to-blue-600/20 blur-3xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-gradient-to-t from-slate-600 via-slate-400 to-slate-300 shadow-2xl opacity-80" />
              </div>
            </div>
          </div>

          {/* HTML Overlay synced with scroll */}
          <HTMLOverlay />
        </div>
      </section>
    </ScrollDataContext.Provider>
  );
}
