import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three-stdlib';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MeshSurfaceSampler } from 'three-stdlib';

gsap.registerPlugin(ScrollTrigger);

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Soft glow
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);
    
    gl_FragColor = vec4(vColor, vAlpha * glow);
  }
`;

const vertexShader = `
  attribute vec3 targetPosition;
  attribute float size;
  attribute vec3 color;
  
  uniform float uProgress;
  uniform float uTime;
  
  varying vec3 vColor;
  varying float vAlpha;

  // Pseudo-random function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // Simplex-like noise for cloud movement
  vec3 noiseVec3(vec3 p) {
      float r = random(p.xy);
      float g = random(p.yz);
      float b = random(p.zx);
      return vec3(r, g, b) * 2.0 - 1.0;
  }

  void main() {
    vColor = color;
    
    // Calculate morph state
    vec3 startPos = position;
    vec3 endPos = targetPosition;
    
    // Explosion / Cloud phase
    // Maximum chaos around uProgress = 0.5
    float explosionState = sin(uProgress * 3.14159); // 0 at 0, 1 at 0.5, 0 at 1
    float explodePower = 4.0;
    
    vec3 noiseDir = noiseVec3(position + uTime * 0.1);
    vec3 explosionOffset = noiseDir * explodePower * explosionState;
    
    // Standard Morph
    vec3 mixedPos = mix(startPos, endPos, uProgress);
    
    // Combine
    vec3 finalPos = mixedPos + explosionOffset;
    
    // Floating movement ONLY during transition (not at start or end)
    // Use explosionState to fade in/out the floating effect
    float floatSpeed = 0.5;
    float floatAmp = 0.15 * explosionState; // Only float during transition
    finalPos.x += sin(uTime * floatSpeed + position.y) * floatAmp;
    finalPos.y += cos(uTime * floatSpeed + position.x) * floatAmp;

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    vAlpha = 1.0;
  }
`;

const PARTICLE_COUNT = 12000;

// SVG URL
const LOGO_URL = '/wellfi-logo.svg';

export function ParticleMorphHero() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { scene: toolScene } = useGLTF('/models/wellfi-gauge.glb');

  // Use useMemo for stable object references
  const geometryData = useMemo(() => ({
    logoPoints: new Float32Array(PARTICLE_COUNT * 3),
    toolPoints: new Float32Array(PARTICLE_COUNT * 3),
    colors: new Float32Array(PARTICLE_COUNT * 3),
    sizes: new Float32Array(PARTICLE_COUNT),
    linePositions: new Float32Array(0), // Will be set dynamically
    lineColors: new Float32Array(0), // Will be set dynamically
  }), []);

  const [ready, setReady] = useState(false);
  const [lineData, setLineData] = useState<{ positions: Float32Array; colors: Float32Array } | null>(null);
  
  // Initialize Geometry
  useEffect(() => {
    async function init() {
      // 1. Generate Logo Points using SVGLoader
      const loader = new SVGLoader();
      
      let svgData: { paths: THREE.ShapePath[] } | null = null;
      try {
        svgData = await new Promise((resolve, reject) => {
          loader.load(LOGO_URL, resolve, undefined, reject);
        });
        console.log('SVG loaded successfully, paths:', svgData?.paths?.length);
      } catch (e) {
        console.error('SVG load failed:', e);
      }

      const logoPositions: number[] = [];
      const logoColors: number[] = []; // Store colors per particle
      const linePositions: number[] = [];
      const lineColors: number[] = [];
      const tempVec = new THREE.Vector3();

      if (svgData && svgData.paths && svgData.paths.length > 0) {
        // First, create all shapes and calculate unified bounding box
        interface PathData {
          shapes: THREE.Shape[];
          color: THREE.Color;
          fillColor?: string;
          strokeColor?: string;
        }
        const pathsWithColors: PathData[] = [];
        const allShapes: THREE.Shape[] = [];
        
        for (const path of svgData.paths) {
          const shapes = SVGLoader.createShapes(path);
          if (shapes.length > 0) {
            // Get color from path - check fill first, then stroke
            let colorValue = '#ffffff'; // Default white
            const fillColor = path.userData?.style?.fill;
            const strokeColor = path.userData?.style?.stroke;

            // Check for cyan WiFi color
            if (fillColor === '#00f2ff' || strokeColor === '#00f2ff' || 
                fillColor === 'rgb(0, 242, 255)' || strokeColor === 'rgb(0, 242, 255)') {
              colorValue = '#00f2ff';
            } else if (fillColor === '#0b2c58' || strokeColor === '#0b2c58') {
               colorValue = '#ffffff'; // Text matches navy -> make white
            } else {
               colorValue = fillColor || strokeColor || '#ffffff';
            }

            pathsWithColors.push({
              shapes,
              color: new THREE.Color(colorValue),
              fillColor,
              strokeColor
            });
            allShapes.push(...shapes);
          }
        }
        
        // Calculate unified bounding box and transform
        const unifiedGeo = new THREE.ShapeGeometry(allShapes);
        unifiedGeo.computeBoundingBox();
        
        // Define transform variables in scope
        let centerX = 0;
        let centerY = 0; 
        let scaleValue = 1;

        if (unifiedGeo.boundingBox) {
          const center = new THREE.Vector3();
          unifiedGeo.boundingBox.getCenter(center);
          centerX = center.x;
          centerY = center.y;
          
          const size = new THREE.Vector3();
          unifiedGeo.boundingBox.getSize(size);
          scaleValue = 8 / Math.max(size.x, size.y);
        }

        if (Number.isFinite(scaleValue) === false || scaleValue <= 0) scaleValue = 1;
        if (Number.isFinite(centerX) === false) centerX = 0;
        if (Number.isFinite(centerY) === false) centerY = 0;

        // Calculate areas for proportional distribution
        let totalArea = 0;
        const pathAreas: number[] = [];
        
        for (const { shapes } of pathsWithColors) {
          const geo = new THREE.ShapeGeometry(shapes);
          geo.computeBoundingBox();
          const size = new THREE.Vector3();
          geo.boundingBox?.getSize(size);
          const area = Math.max(size.x * size.y, 1);
          pathAreas.push(area);
          totalArea += area;
        }

        // Sample particles from each path proportionally
        let particlesAssigned = 0;
        
        for (let i = 0; i < pathsWithColors.length; i++) {
          const { shapes, color } = pathsWithColors[i];
          const proportion = pathAreas[i] / totalArea;
          let particleCount = Math.floor(PARTICLE_COUNT * proportion);
          
          if (particleCount < 50 && proportion > 0) particleCount = 50;
          if (i === pathsWithColors.length - 1) particleCount = PARTICLE_COUNT - particlesAssigned;
          
          if (particleCount <= 0) continue;
          
          // Create geometry for this path with unified transform
          const shapeGeometry = new THREE.ShapeGeometry(shapes);
          shapeGeometry.translate(-centerX, -centerY, 0);
          shapeGeometry.scale(scaleValue, -scaleValue, scaleValue);
          
          const tempMesh = new THREE.Mesh(shapeGeometry);
          const sampler = new MeshSurfaceSampler(tempMesh).build();
          
          for (let j = 0; j < particleCount; j++) {
            sampler.sample(tempVec);
            logoPositions.push(tempVec.x, tempVec.y, tempVec.z);
            // Dim particles by 25% (multiply by 0.75)
            logoColors.push(color.r * 0.75, color.g * 0.75, color.b * 0.75);
          }
          particlesAssigned += particleCount;
        }

        // Apply particle data to geometry
        geometryData.logoPoints.set(logoPositions);
        geometryData.colors.set(logoColors);

        // Initialize line data arrays (already declared above)


        // --- Generate Outlines using the scoped variables ---
        // Trace outlines for ALL paths relative to the unified transform
        let outlineSegmentCount = 0;
        const MAX_OUTLINE_SEGMENTS = 40000; // Increased limit for smoother lines

        for (const path of svgData.paths) {
           if (outlineSegmentCount >= MAX_OUTLINE_SEGMENTS) break;

           // Determine color based on path style
           let r=4, g=4, b=4; // Default bright white (boosted > 1 for Bloom)
           const fillColor = path.userData?.style?.fill;
           const strokeColor = path.userData?.style?.stroke;

           if (fillColor === '#00f2ff' || strokeColor === '#00f2ff' || 
               fillColor === 'rgb(0, 242, 255)' || strokeColor === 'rgb(0, 242, 255)') {
              r=0; g=10; b=15; // Super bright Cyan for Bloom
           }
           
           for (const subPath of path.subPaths) {
             const curves = subPath.curves;
             for (const curve of curves) {
               const divisions = 16; // Smoother lines (increased from 6)
               for (let t = 0; t < divisions; t++) {
                 const t1 = t / divisions;
                 const t2 = (t + 1) / divisions;
                 const p1 = curve.getPoint(t1);
                 const p2 = curve.getPoint(t2);
                 
                 const x1 = (p1.x - centerX) * scaleValue;
                 const y1 = -(p1.y - centerY) * scaleValue;
                 const x2 = (p2.x - centerX) * scaleValue;
                 const y2 = -(p2.y - centerY) * scaleValue;
                 
                 // Skip invalid points
                 if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) continue;

                 linePositions.push(x1, y1, 0, x2, y2, 0);
                 lineColors.push(r, g, b, r, g, b);
                 outlineSegmentCount++;
               }
             }
           }
        }
      }

      
      // Fallback if SVG failed or no positions generated
      if (logoPositions.length === 0) {
        console.warn('Using fallback logo positions');
        const fallbackColor = new THREE.Color('#0b2c58');
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          logoPositions.push(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 0.5
          );
          logoColors.push(fallbackColor.r, fallbackColor.g, fallbackColor.b);
        }
        geometryData.logoPoints.set(logoPositions);
        geometryData.colors.set(logoColors);
      }

      
      console.log('Generated outline segments:', linePositions.length / 6);

      // Second: Add network connection lines between particles
      const maxLineDistance = 0.55;
      const maxNetworkLines = 2500; // Increased for better connectivity
      const sampleStep = Math.max(1, Math.floor(PARTICLE_COUNT / 600));
      let lineCount = 0;
      
      const lineStartIdx = linePositions.length; // Start network lines after outlines

      for (let i = 0; i < PARTICLE_COUNT && lineCount < maxNetworkLines; i += sampleStep) {
        const x1 = logoPositions[i * 3];
        const y1 = logoPositions[i * 3 + 1];
        const z1 = logoPositions[i * 3 + 2];
        const c1r = geometryData.colors[i * 3];
        const c1g = geometryData.colors[i * 3 + 1];
        const c1b = geometryData.colors[i * 3 + 2];
        
        for (let j = i + sampleStep; j < PARTICLE_COUNT && lineCount < maxNetworkLines; j += sampleStep) {
          const x2 = logoPositions[j * 3];
          const y2 = logoPositions[j * 3 + 1];
          const z2 = logoPositions[j * 3 + 2];
          
          const dist = Math.sqrt((x2-x1)**2 + (y2-y1)**2 + (z2-z1)**2);
          
          if (dist < maxLineDistance && dist > 0.08) {
            linePositions.push(x1, y1, z1, x2, y2, z2);
            // Use particle color for the lines (Cyan or White)
            lineColors.push(c1r, c1g, c1b, c1r, c1g, c1b);
            lineCount++;
          }
        }
      }
      
      console.log('Generated network lines:', lineCount);

      setLineData({
        positions: new Float32Array(linePositions),
        colors: new Float32Array(lineColors)
      });

      // 2. Generate Tool Points from the GLB model
      const toolPositions: number[] = [];
      let targetMesh: THREE.Mesh | null = null;
      
      toolScene.traverse((child) => {
        if (!targetMesh && (child as THREE.Mesh).isMesh) {
          targetMesh = child as THREE.Mesh;
        }
      });
      
      if (targetMesh) {
        const sampler = new MeshSurfaceSampler(targetMesh as THREE.Mesh).build();
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          sampler.sample(tempVec);
          tempVec.multiplyScalar(3.0);
          toolPositions.push(tempVec.x, tempVec.y, tempVec.z);
        }
        console.log('Sampled tool positions:', toolPositions.length / 3);
      } else {
        // Fallback sphere
        console.warn('Using fallback tool positions (sphere)');
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const u = Math.random();
          const v = Math.random();
          const theta = 2 * Math.PI * u;
          const phi = Math.acos(2 * v - 1);
          const radius = 3;
          toolPositions.push(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
          );
        }
      }
      geometryData.toolPoints.set(toolPositions);

      // 3. Colors from SVG & Sizes
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Use colors extracted from SVG paths
        if (logoColors.length >= (i + 1) * 3) {
          geometryData.colors[i * 3] = logoColors[i * 3];
          geometryData.colors[i * 3 + 1] = logoColors[i * 3 + 1];
          geometryData.colors[i * 3 + 2] = logoColors[i * 3 + 2];
        } else {
          // Fallback color
          const c = new THREE.Color('#0b2c58');
          geometryData.colors[i * 3] = c.r;
          geometryData.colors[i * 3 + 1] = c.g;
          geometryData.colors[i * 3 + 2] = c.b;
        }
        geometryData.sizes[i] = Math.random() * 0.12 + 0.04;
      }
      
      setReady(true);
    }

    init();
  }, [toolScene, geometryData]);


  // Animation uniforms - useMemo for stable object reference
  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uTime: { value: 0 }
  }), []);

  useFrame((state) => {
    if (pointsRef.current) {
      uniforms.uTime.value = state.clock.getElapsedTime();
      
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uProgress.value = uniforms.uProgress.value;
      material.uniforms.uTime.value = uniforms.uTime.value;
    }
  });

  useEffect(() => {
    if (!ready) return;
    
    // Refresh ScrollTrigger since geometry is newly loaded
    ScrollTrigger.refresh();

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero-section', 
        start: 'top top',
        end: '+=3000', // Long scroll for controllable morph
        scrub: 1.5,
        pin: true,
      }
    });

    tl.to(uniforms.uProgress, {
      value: 1,
      ease: 'power1.inOut',
    });

    return () => {
      tl.kill(); 
    }
  }, [ready, uniforms]);

  if (!ready) return null;

  return (
    <group>
      {/* Connecting lines (node network effect) */}
      {lineData && lineData.positions.length > 0 && (
        <lineSegments ref={linesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[lineData.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[lineData.colors, 3]} />
          </bufferGeometry>
          <lineBasicMaterial 
            vertexColors 
            transparent 
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </lineSegments>
      )}
      
      {/* Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[geometryData.logoPoints, 3]} />
          <bufferAttribute attach="attributes-targetPosition" args={[geometryData.toolPoints, 3]} />
          <bufferAttribute attach="attributes-color" args={[geometryData.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[geometryData.sizes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
