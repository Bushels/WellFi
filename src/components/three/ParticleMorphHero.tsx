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
  attribute vec3 targetPosition;  // Tool target (not used in new animation)
  attribute vec3 cylinderTarget;  // Cylinder position for "i" morph
  attribute float size;
  attribute vec3 color;
  attribute float letterGroup;    // 0=W, 1=e, 2=l1, 3=l2, 4=F, 5=i_body, 6=wifi
  
  uniform float uProgress;        // Overall scroll progress 0-1
  uniform float uTime;
  uniform float uWifiPulse;       // 0-1 repeating pulse for WiFi arcs
  
  varying vec3 vColor;
  varying float vAlpha;

  // Pseudo-random function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vColor = color;
    
    vec3 startPos = position;
    vec3 endPos = cylinderTarget;
    
    // Calculate per-letter fade based on progress
    // Letters fade out: W(0.1-0.3), e(0.15-0.35), l1(0.2-0.4), l2(0.25-0.45), F(0.3-0.5)
    // i_body and wifi stay visible and morph
    float letterAlpha = 1.0;
    float morphAmount = 0.0;
    
    // Phase 1: 0.0 - 0.5: Letters fade out sequentially
    // Phase 2: 0.5 - 1.0: "i" morphs to cylinder
    
    if (letterGroup < 5.0) {
      // W, e, l1, l2, F - these fade out
      float fadeStart = 0.1 + letterGroup * 0.08;  // Stagger start times
      float fadeEnd = fadeStart + 0.25;
      letterAlpha = 1.0 - smoothstep(fadeStart, fadeEnd, uProgress);
    } else {
      // i_body (5) and wifi (6) - these stay and morph
      letterAlpha = 1.0;
      
      // Start morphing after letters fade (around 0.4)
      morphAmount = smoothstep(0.35, 0.9, uProgress);
    }
    
    // Calculate position
    vec3 finalPos;
    
    if (letterGroup >= 5.0) {
      // "i" and wifi: morph toward center cylinder
      finalPos = mix(startPos, endPos, morphAmount);
      
      // Add subtle floating during morph
      float floatAmp = 0.1 * sin(morphAmount * 3.14159); // Max at mid-morph
      finalPos.x += sin(uTime * 0.7 + position.y * 2.0) * floatAmp;
      finalPos.y += cos(uTime * 0.5 + position.x * 2.0) * floatAmp;
      
      // WiFi pulse effect (only for letterGroup 6)
      if (letterGroup > 5.5 && uProgress > 0.8) {
        // Pulse the WiFi arcs - scale outward rhythmically
        float pulse = sin(uWifiPulse * 6.28318) * 0.5 + 0.5;
        float scaleBoost = 1.0 + pulse * 0.15;
        finalPos.x *= scaleBoost;
        finalPos.y *= scaleBoost;
      }
    } else {
      // Other letters: disperse as they fade
      vec3 disperseDir = normalize(position + vec3(0.001)); // Prevent zero normal
      float disperseAmount = (1.0 - letterAlpha) * 5.0;
      finalPos = startPos + disperseDir * disperseAmount;
      
      // Add noise to dispersion
      float noise = random(position.xy + uTime * 0.1);
      finalPos += vec3(noise - 0.5, noise * 0.5, 0.0) * disperseAmount * 0.5;
    }

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    vAlpha = letterAlpha;
  }
`;

const PARTICLE_COUNT = 12000;

// SVG URL
const LOGO_URL = '/wellfi-logo.svg';

// Letter X-position ranges in original SVG coordinates (viewBox 0 0 820 400)
// Used to detect which letter a particle belongs to
const LETTER_X_RANGES = {
  W: { min: 56, max: 286 },
  e: { min: 294, max: 424 },
  l1: { min: 452, max: 491 },
  l2: { min: 527, max: 567 },
  F: { min: 604, max: 717 },
  i_body: { min: 725, max: 765 },
  wifi: { min: 685, max: 810, maxY: 170 } // WiFi arcs are above y=170
};

// Letter group IDs: 0=W, 1=e, 2=l1, 3=l2, 4=F, 5=i_body, 6=wifi
function getLetterGroup(svgX: number, svgY: number): number {
  // Check WiFi arcs first (they overlap with F and i in X but are above)
  if (svgX >= LETTER_X_RANGES.wifi.min && svgX <= LETTER_X_RANGES.wifi.max && svgY < LETTER_X_RANGES.wifi.maxY) {
    return 6; // wifi
  }
  if (svgX >= LETTER_X_RANGES.W.min && svgX <= LETTER_X_RANGES.W.max) return 0;
  if (svgX >= LETTER_X_RANGES.e.min && svgX <= LETTER_X_RANGES.e.max) return 1;
  if (svgX >= LETTER_X_RANGES.l1.min && svgX <= LETTER_X_RANGES.l1.max) return 2;
  if (svgX >= LETTER_X_RANGES.l2.min && svgX <= LETTER_X_RANGES.l2.max) return 3;
  if (svgX >= LETTER_X_RANGES.F.min && svgX <= LETTER_X_RANGES.F.max) return 4;
  if (svgX >= LETTER_X_RANGES.i_body.min && svgX <= LETTER_X_RANGES.i_body.max) return 5;
  return 0; // Default to W group
}

// Clean WiFi signal at top of tool - arcs pulse sequentially like broadcasting
function WiFiSignal({ uniforms }: { uniforms: { uProgress: { value: number } } }) {
  const groupRef = useRef<THREE.Group>(null);
  const arcRefs = useRef<THREE.Mesh[]>([]);
  const dotRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const progress = uniforms.uProgress.value;
    const time = state.clock.getElapsedTime();
    
    // WiFi signal appears after 70% scroll progress (earlier start)
    const fadeIn = Math.max(0, Math.min(1, (progress - 0.7) / 0.1));
    
    arcRefs.current.forEach((arc, i) => {
      if (!arc) return;
      const mat = arc.material as THREE.MeshBasicMaterial;
      
      // Sequential pulse: each arc lights up in sequence
      // Creates a "broadcasting" effect from inner to outer
      const pulsePhase = (time * 2.5 + i * 0.35) % 1.5;
      const isPulsing = pulsePhase < 0.5;
      const pulseIntensity = isPulsing ? Math.sin(pulsePhase * Math.PI / 0.5) : 0;
      
      // Higher base opacity and brighter pulses
      mat.opacity = fadeIn * (0.5 + pulseIntensity * 0.5);
    });
    
    // Animate the center dot
    if (dotRef.current) {
      const dotMat = dotRef.current.material as THREE.MeshBasicMaterial;
      dotMat.opacity = fadeIn * 0.95;
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 3.3, 0]}>
      {/* Three WiFi arcs - like the dot of the "i" from WellFi logo */}
      {[1, 2, 3].map((arcNum, i) => (
        <mesh 
          key={arcNum} 
          ref={(el) => { if (el) arcRefs.current[i] = el; }}
          position={[0, arcNum * 0.35, 0]} 
          rotation={[0, 0, 0]}
        >
          {/* Larger radius and thicker tube */}
          <torusGeometry args={[arcNum * 0.4, 0.06, 8, 32, Math.PI]} />
          <meshBasicMaterial 
            color="#22d3ee" 
            transparent 
            opacity={0}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      
      {/* Small dot at center (like WiFi icon center) */}
      <mesh ref={dotRef} position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial 
          color="#22d3ee" 
          transparent 
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}




export function ParticleMorphHero() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const cylinderRef = useRef<THREE.Mesh>(null);
  const { scene: toolScene } = useGLTF('/models/wellfi-gauge.glb');

  // Use useMemo for stable object references
  const geometryData = useMemo(() => ({
    logoPoints: new Float32Array(PARTICLE_COUNT * 3),
    toolPoints: new Float32Array(PARTICLE_COUNT * 3),
    cylinderPoints: new Float32Array(PARTICLE_COUNT * 3), // Target for "i" -> cylinder morph
    colors: new Float32Array(PARTICLE_COUNT * 3),
    sizes: new Float32Array(PARTICLE_COUNT),
    letterGroups: new Float32Array(PARTICLE_COUNT), // 0=W, 1=e, 2=l1, 3=l2, 4=F, 5=i_body, 6=wifi
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
      const letterGroups: number[] = []; // Track which letter each particle belongs to
      const cylinderPositions: number[] = []; // Target positions for cylinder morph
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
            const fillColor = (path as any).userData?.style?.fill;
            const strokeColor = (path as any).userData?.style?.stroke;

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
          
          // Sample from UNTRANSFORMED geometry first to get original SVG coords
          const rawGeometry = new THREE.ShapeGeometry(shapes);
          const rawMesh = new THREE.Mesh(rawGeometry);
          const rawSampler = new MeshSurfaceSampler(rawMesh).build();
          
          // Create transformed geometry for final positions
          const shapeGeometry = new THREE.ShapeGeometry(shapes);
          shapeGeometry.translate(-centerX, -centerY, 0);
          shapeGeometry.scale(scaleValue, -scaleValue, scaleValue);
          
          const tempMesh = new THREE.Mesh(shapeGeometry);
          const sampler = new MeshSurfaceSampler(tempMesh).build();
          
          // Calculate center of "i" letter in transformed space (for moving to center)
          const iCenterSvgX = (LETTER_X_RANGES.i_body.min + LETTER_X_RANGES.i_body.max) / 2;
          const iOffsetX = (iCenterSvgX - centerX) * scaleValue; // X offset of "i" from center
          
          for (let j = 0; j < particleCount; j++) {
            // Sample from raw geometry to get original SVG coordinates
            rawSampler.sample(tempVec);
            const svgX = tempVec.x;
            const svgY = tempVec.y;
            
            // Determine which letter this particle belongs to
            const letterGroup = getLetterGroup(svgX, svgY);
            letterGroups.push(letterGroup);
            
            // Sample from transformed geometry for final position
            sampler.sample(tempVec);
            logoPositions.push(tempVec.x, tempVec.y, tempVec.z);
            
            // Generate cylinder target position for "i" body and wifi particles
            // These will move to screen center when morphing
            if (letterGroup === 5 || letterGroup === 6) { // i_body or wifi
              // Cylinder centered at (0,0,0) 
              const height = 6.0;
              const radius = 0.6;
              
              if (letterGroup === 5) { // i_body -> cylinder body
                const theta = Math.random() * Math.PI * 2;
                const y = (Math.random() - 0.5) * height;
                const r = radius * (0.95 + Math.random() * 0.1);
                cylinderPositions.push(
                  Math.cos(theta) * r,
                  y,
                  Math.sin(theta) * r
                );
              } else { // wifi -> stays above cylinder as arcs
                // WiFi arcs stay in relative position above the tool
                cylinderPositions.push(
                  tempVec.x - iOffsetX, // Center the x position
                  tempVec.y + 1.0, // Shift up slightly
                  tempVec.z
                );
              }
            } else {
              // Other letters: cylinder position is just dispersed (they fade out anyway)
              cylinderPositions.push(
                (Math.random() - 0.5) * 20, // Scatter far away
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10
              );
            }
            
            // Dim particles by 25% (multiply by 0.75)
            logoColors.push(color.r * 0.75, color.g * 0.75, color.b * 0.75);
          }
          particlesAssigned += particleCount;
        }

        // Apply particle data to geometry
        geometryData.logoPoints.set(logoPositions);
        geometryData.colors.set(logoColors);
        geometryData.letterGroups.set(letterGroups);
        geometryData.cylinderPoints.set(cylinderPositions);

        // Initialize line data arrays (already declared above)


        // --- Generate Outlines using the scoped variables ---
        // Trace outlines for ALL paths relative to the unified transform
        let outlineSegmentCount = 0;
        const MAX_OUTLINE_SEGMENTS = 40000; // Increased limit for smoother lines

        for (const path of svgData.paths) {
           if (outlineSegmentCount >= MAX_OUTLINE_SEGMENTS) break;

           // Determine color based on path style
           let r=4, g=4, b=4; // Default bright white (boosted > 1 for Bloom)
           const fillColor = (path as any).userData?.style?.fill;
           const strokeColor = (path as any).userData?.style?.stroke;

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
    uTime: { value: 0 },
    uWifiPulse: { value: 0 }
  }), []);

  useFrame((state) => {
    if (pointsRef.current) {
      const elapsed = state.clock.getElapsedTime();
      uniforms.uTime.value = elapsed;
      uniforms.uWifiPulse.value = (elapsed * 0.8) % 1.0; // Repeating pulse
      
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uProgress.value = uniforms.uProgress.value;
      material.uniforms.uTime.value = uniforms.uTime.value;
      material.uniforms.uWifiPulse.value = uniforms.uWifiPulse.value;
    }
    
    // Fade lines out early (0-30% scroll)
    if (linesRef.current) {
      const lineMat = linesRef.current.material as THREE.LineBasicMaterial;
      const lineOpacity = Math.max(0, 1 - (uniforms.uProgress.value / 0.3));
      lineMat.opacity = lineOpacity * 0.4; // Base opacity was 0.4
    }
    
    // Fade in cylinder at end (80-100% scroll)
    if (cylinderRef.current) {
      const cylMat = cylinderRef.current.material as THREE.MeshStandardMaterial;
      const cylOpacity = Math.max(0, (uniforms.uProgress.value - 0.8) / 0.2);
      cylMat.opacity = cylOpacity;
      cylinderRef.current.visible = cylOpacity > 0.01;
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
    <group position={[3.5, 0, 0]}>
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
          <bufferAttribute attach="attributes-cylinderTarget" args={[geometryData.cylinderPoints, 3]} />
          <bufferAttribute attach="attributes-color" args={[geometryData.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[geometryData.sizes, 1]} />
          <bufferAttribute attach="attributes-letterGroup" args={[geometryData.letterGroups, 1]} />
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

      {/* Solid Stainless Steel Cylinder - fades in at end */}
      <mesh ref={cylinderRef} position={[0, 0, 0]} rotation={[0, 0, 0]} visible={false}>
        <cylinderGeometry args={[0.55, 0.55, 6, 32]} />
        <meshStandardMaterial 
          color="#e8eef2"
          metalness={0.98}
          roughness={0.08}
          envMapIntensity={1.5}
          transparent
          opacity={0}
        />
      </mesh>
      
      {/* WiFi signal at top of tool */}
      <WiFiSignal uniforms={uniforms} />
    </group>
  );
}
