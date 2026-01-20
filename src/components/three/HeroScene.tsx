import { Canvas } from '@react-three/fiber';
import { ParticleMorphHero } from './ParticleMorphHero';
import { Suspense } from 'react';
import { Loader, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

export function HeroScene({ onIntroComplete }: { onIntroComplete?: () => void }) {
  // Directly trigger intro complete since we start visible
  if (onIntroComplete) setTimeout(onIntroComplete, 500);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]} 
      >
        <Suspense fallback={null}>
          {/* Lighting for metallic materials */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-3, 2, -2]} intensity={0.8} color="#22d3ee" />
          
          {/* Environment map for metallic reflections */}
          <Environment preset="city" background={false} />
          
          <ParticleMorphHero />
        </Suspense>
        <EffectComposer>
          <Bloom 
            mipmapBlur 
            intensity={1.5} 
            luminanceThreshold={0.8} 
            luminanceSmoothing={0.9} 
          />
        </EffectComposer>
      </Canvas>
      <Loader 
        containerStyles={{ background: 'var(--wellfi-slate-900)' }}
        dataStyles={{ fontSize: '1.5rem', fontFamily: 'var(--font-sans)', color: 'var(--wellfi-cyan)' }}
        barStyles={{ height: '5px', background: 'var(--wellfi-cyan)' }} 
      />
    </div>
  );
}
