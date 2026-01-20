import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Center, Float, Sparkles, Text3D } from '@react-three/drei';
import * as THREE from 'three';
import { WellFiTool } from './WellFiTool';
import gsap from 'gsap';

export function Experience({ onIntroComplete }: { onIntroComplete?: () => void }) {
  const { camera } = useThree();
  const logoGroup = useRef<THREE.Group>(null);
  const toolGroup = useRef<THREE.Group>(null);
  
  
  // Animation sequences
  useEffect(() => {
    // Initial states
    if (toolGroup.current) {
        toolGroup.current.scale.set(0,0,0);
        toolGroup.current.position.set(0,0,0);
    }

    const tl = gsap.timeline({
      delay: 0.5,
      onComplete: () => {
         if (onIntroComplete) onIntroComplete();
      }
    });

    // 1. Logo Entrance
    tl.fromTo(logoGroup.current?.scale || {}, 
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 1, ease: "elastic.out(1, 0.75)" }
    );

    // Wait for user to read
    tl.to({}, { duration: 1.5 });

    // 2. Morph transition (Logo shrinks, spins, and disappears)
    tl.to(logoGroup.current?.rotation || {}, {
        y: Math.PI * 2,
        duration: 0.8,
        ease: "back.in(2)"
    }, "morph");
    
    tl.to(logoGroup.current?.scale || {}, {
      x: 0, y: 0, z: 0, 
      duration: 0.5, 
      ease: "power2.in"
    }, "morph+=0.3");

    // 3. Tool appears (Explodes in from center)
    
    tl.to(toolGroup.current?.scale || {}, 
      { x: 1, y: 1, z: 1, duration: 1.2, ease: "elastic.out(1, 0.5)" },
      "-=0.1"
    );
    
    // 4. Move tool to the side for the main layout
    tl.to(toolGroup.current?.position || {}, {
      x: 3, // Move right
      duration: 1.5,
      ease: "power3.inOut"
    }, "+=0.5");

    // Rotate tool to hero angle
    tl.to(toolGroup.current?.rotation || {}, {
      y: -0.5,
      z: 0.1,
      duration: 1.5,
      ease: "power3.inOut"
    }, "<");

  }, [onIntroComplete]);

  return (
    <>
      <color attach="background" args={['#0c1322']} /> {/* Match wellfi-slate-900 */}
      
      {/* Lights */}
      <ambientLight intensity={0.5} color="#22d3ee" />
      <pointLight position={[10, 10, 10]} intensity={1} color="#2563eb" />
      <spotLight position={[-10, 10, 5]} intensity={2} color="#0d9488" angle={0.5} penumbra={1} />
      
      {/* Logo removed - was causing 404 font errors */}
      {/* Using simple placeholder instead */}
      <group>
        <mesh>
          <boxGeometry args={[3, 1, 0.3]} />
          <meshStandardMaterial 
            color="#ffffff"
            emissive="#22d3ee"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Stage: Tool */}
      <group ref={toolGroup}>
         <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            {/* Rotate -90 on X if needed, depending on model orientation. Assuming standard upright for now or fixing visually */}
            <WellFiTool scale={[10, 10, 10]} /> {/* Increased scale based on likely unit diffs */}
         </Float>
      </group>

      {/* Environmental Effects */}
      <Sparkles count={50} scale={10} size={4} speed={0.4} opacity={0.5} color="#22d3ee" />
    </>
  );
}
