'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { HeroScene } from '@/components/three/HeroScene';
import { Battery, Gauge, Thermometer, Radio } from 'lucide-react';

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // State to track if intro is done
  const [introComplete, setIntroComplete] = useState(false);
  
  // Only trigger content animations after intro (morph) is done
  useGSAP(
    () => {
      if (!introComplete) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.hero-content-group',
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 1, stagger: 0.2 }
      );
      
      tl.fromTo(
          '.hero-scroll',
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          '-=0.5'
        );
    },
    { scope: sectionRef, dependencies: [introComplete] }
  );

  const specs = [
    { value: '5+', label: 'Year Battery', icon: Battery },
    { value: '69', label: 'MPa Rating', icon: Gauge },
    { value: '150°C', label: 'Temp Rating', icon: Thermometer },
    { value: 'SCADA', label: 'Ready', icon: Radio },
  ];

  return (
    <section
      ref={sectionRef}
      id="hero-section"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'var(--wellfi-slate-900)' }}
    >
      {/* 3D Scene Overlay - Handles Background and Hero Object */}
      <HeroScene onIntroComplete={() => setIntroComplete(true)} />
      
      {/* Overlay Content - Hidden initially, appears after morph */}
      <div
        ref={contentRef}
        className={`relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none transition-opacity duration-1000 ${introComplete ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             {/* Left Column: Text Content */}
             <div className="hero-content-group pointer-events-auto">
                 {/* Label */}
                <div className="mb-6 inline-block">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--wellfi-cyan)]/20 bg-[var(--wellfi-slate-900)]/50 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-[var(--wellfi-cyan)] animate-pulse shadow-[0_0_10px_var(--wellfi-cyan)]" />
                    <span className="text-sm font-medium tracking-wide text-[var(--wellfi-cyan)]">Electromagnetic Telemetry</span>
                  </span>
                </div>

                {/* Headline */}
                <h1 className="display-heading text-5xl md:text-7xl lg:text-8xl mb-8 leading-tight">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--wellfi-white)] to-[var(--wellfi-white)]/70">Wireless Below.</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--wellfi-cyan)] to-[var(--wellfi-blue)] drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">Insight Above.</span>
                </h1>

                {/* Tagline */}
                <p className="text-xl md:text-2xl text-[var(--wellfi-white)]/70 mb-10 max-w-lg leading-relaxed font-light">
                  Real-time downhole monitoring.
                  <span className="block mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--wellfi-cyan)] to-[var(--wellfi-teal)]">
                    Truly Wireless.
                  </span>
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                   {specs.map((spec, i) => {
                    const Icon = spec.icon;
                    return (
                      <div key={i} className="glass-card p-4 rounded-xl border border-[var(--wellfi-white)]/5 bg-[var(--wellfi-slate-800)]/40">
                        <Icon className="w-5 h-5 text-[var(--wellfi-cyan)] mb-2" strokeWidth={1.5} />
                        <div className="text-2xl md:text-3xl font-bold text-[var(--wellfi-white)] mb-1">{spec.value}</div>
                        <div className="text-xs uppercase tracking-wider text-[var(--wellfi-white)]/50 font-medium">{spec.label}</div>
                      </div>
                    );
                   })}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="#contact"
                    className="btn-primary group relative px-8 py-4 rounded-xl bg-[var(--wellfi-cyan)] text-[var(--wellfi-slate-900)] font-bold text-lg overflow-hidden transition-transform hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                       Get Started
                       <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--wellfi-cyan)] to-[var(--wellfi-teal)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  
                  <a
                    href="#technology"
                    className="group px-8 py-4 rounded-xl border border-[var(--wellfi-white)]/20 text-[var(--wellfi-white)] font-semibold text-lg hover:bg-[var(--wellfi-white)]/10 transition-colors"
                  >
                    See How It Works
                  </a>
                </div>
             </div>
             
             {/* Right Column: Empy for 3D tool visualization */}
             <div className="hidden lg:block h-[80vh]">
                {/* 3D Tool is positioned here by the camera and implementation in Experience.tsx */}
             </div>
        </div>
      </div>

       {/* Scroll indicator */}
       <div className="hero-scroll absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-opacity">
        <span className="text-[10px] text-[var(--wellfi-white)]/30 uppercase tracking-[0.2em]">
          Scroll
        </span>
        <div className="w-6 h-10 rounded-full border border-[var(--wellfi-cyan)]/30 flex items-start justify-center p-1.5 relative overflow-hidden">
          <div className="w-1.5 h-3 rounded-full bg-[var(--wellfi-cyan)] animate-bounce" />
        </div>
      </div>
    </section>
  );
}
