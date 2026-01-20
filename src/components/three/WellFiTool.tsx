import { useGLTF } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import React from 'react';

export function WellFiTool(props: React.ComponentProps<'group'>) {
  const { scene } = useGLTF('/models/wellfi-gauge.glb');
  const group = useRef<THREE.Group>(null);

  // Clone the scene to ensure each instance is independent
  // This prevents scene graph conflicts (one node having multiple parents)
  // and allows for per-instance material modifications if needed.
  const clone = useMemo(() => {
    const clonedScene = scene.clone();
    
    // Apply default stainless steel finish to all meshes if not already set
    // This ensures consistency across usage in Hero and Explore sections
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        
        // Check if we should apply the standard material
        // We do this here to ensure the "WellFi Tool" always looks right
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#e8eaef'), // Stainless steel
          metalness: 1.0,
          roughness: 0.15,
          envMapIntensity: 2.0,
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    
    return clonedScene;
  }, [scene]);

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={clone} />
    </group>
  );
}

useGLTF.preload('/models/wellfi-gauge.glb');
