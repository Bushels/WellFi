'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Waves, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const steps = [
  {
    num: 1,
    title: 'Signal Generation',
    description: 'WellFi gauge generates low-frequency EM signal (1-10 Hz) encoded with pressure and temperature data.',
  },
  {
    num: 2,
    title: 'Electrical Isolation',
    description: 'Fiberglass collar forces signal through formation — not up the steel casing.',
  },
  {
    num: 3,
    title: 'Earth Propagation',
    description: 'EM waves propagate through rock and formation to surface with minimal attenuation.',
  },
  {
    num: 4,
    title: 'Surface Detection',
    description: 'Surface Box detects voltage differential between wellhead and ground stake.',
  },
  {
    num: 5,
    title: 'SCADA Output',
    description: 'Clean MODBUS RS-485 or 4-20mA signal feeds directly to your existing infrastructure.',
  },
];

export function TechnologySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const diagramRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      // Header animation
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.tech-header',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      headerTl
        .fromTo('.tech-label',
          { opacity: 0, y: 20, filter: 'blur(10px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }
        )
        .fromTo('.tech-title',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.3'
        )
        .fromTo('.tech-subtitle',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        );

      // Diagram entrance
      gsap.fromTo('.tech-diagram',
        { opacity: 0, scale: 0.9, x: -50 },
        {
          opacity: 1, scale: 1, x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.tech-diagram',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Continuous EM wave animation
      gsap.to('.em-wave', {
        attr: { r: '+=80' },
        opacity: 0,
        duration: 3,
        repeat: -1,
        stagger: {
          each: 0.6,
          repeat: -1,
        },
        ease: 'power1.out',
      });

      // Signal path drawing animation
      if (diagramRef.current) {
        const signalPath = diagramRef.current.querySelector('.signal-path');
        if (signalPath) {
          const pathLength = (signalPath as SVGPathElement).getTotalLength?.() || 500;
          gsap.set(signalPath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

          gsap.to(signalPath, {
            strokeDashoffset: 0,
            duration: 2.5,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: '.tech-diagram',
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          });
        }

        // Glow pulse on key components
        gsap.to('.component-glow', {
          opacity: 0.8,
          scale: 1.1,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: 0.3,
        });
      }

      // Steps animation
      gsap.fromTo('.tech-step',
        { opacity: 0, x: 30, scale: 0.95 },
        {
          opacity: 1, x: 0, scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.tech-steps',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Data flow particles
      gsap.to('.data-particle', {
        motionPath: {
          path: '.signal-path',
          align: '.signal-path',
          alignOrigin: [0.5, 0.5],
        },
        duration: 4,
        repeat: -1,
        ease: 'none',
        stagger: {
          each: 1,
          repeat: -1,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="technology"
      className="relative py-32 px-4 overflow-hidden"
      style={{ background: 'var(--wellfi-slate)' }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />

      {/* Floating EM waves background decoration */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-10">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: `${300 + i * 150}px`,
              height: `${300 + i * 150}px`,
              border: '1px solid var(--wellfi-cyan)',
              opacity: 0.3 - i * 0.05,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="tech-header text-center mb-20">
          <div className="tech-label mb-6">
            <span className="label-text inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
              <Waves className="w-4 h-4 text-[var(--wellfi-cyan)]" />
              EM Telemetry
            </span>
          </div>
          <h2 className="tech-title display-heading text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="text-gradient text-glow">Electromagnetic</span>
            <br />
            <span className="text-[var(--wellfi-white)]">Telemetry</span>
          </h2>
          <p className="tech-subtitle text-lg md:text-xl text-[var(--wellfi-white)]/60 max-w-2xl mx-auto">
            Transmits through steel casing using low-frequency EM signals.
            <span className="text-[var(--wellfi-cyan)]"> The new standard in downhole monitoring.</span>
          </p>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row items-start gap-16">
          {/* Interactive Diagram */}
          <div className="tech-diagram flex-1 flex justify-center relative">
            {/* Glow behind diagram */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[400px] h-[400px] rounded-full bg-[var(--wellfi-cyan)]/5 blur-3xl" />
            </div>

            <svg
              ref={diagramRef}
              viewBox="0 0 400 550"
              className="w-full max-w-md relative z-10"
              aria-label="EM Telemetry Diagram"
            >
              <defs>
                {/* Gradients */}
                <linearGradient id="surfaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--wellfi-slate-800)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="var(--wellfi-slate)" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="formationGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--wellfi-navy)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="var(--wellfi-slate)" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="signalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--wellfi-cyan)" />
                  <stop offset="100%" stopColor="var(--wellfi-teal)" />
                </linearGradient>
                <linearGradient id="casingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#374151" />
                  <stop offset="50%" stopColor="#4b5563" />
                  <stop offset="100%" stopColor="#374151" />
                </linearGradient>

                {/* Glow filter */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Surface layer */}
              <rect x="0" y="0" width="400" height="120" fill="url(#surfaceGrad)" />
              <text x="20" y="30" fill="var(--wellfi-white)" opacity="0.4" fontSize="11" fontFamily="var(--font-ibm-plex-mono)">
                SURFACE
              </text>

              {/* Formation layer */}
              <rect x="0" y="120" width="400" height="430" fill="url(#formationGrad)" />
              <text x="20" y="150" fill="var(--wellfi-white)" opacity="0.4" fontSize="11" fontFamily="var(--font-ibm-plex-mono)">
                FORMATION
              </text>

              {/* Formation texture lines */}
              {[...Array(8)].map((_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={180 + i * 45}
                  x2="400"
                  y2={180 + i * 45}
                  stroke="var(--wellfi-white)"
                  strokeWidth="0.5"
                  opacity="0.1"
                />
              ))}

              {/* Ground stake */}
              <g className="component-glow">
                <line x1="70" y1="70" x2="70" y2="140" stroke="var(--wellfi-white)" strokeWidth="3" />
                <polygon points="70,145 62,130 78,130" fill="var(--wellfi-white)" />
                <rect x="50" y="55" width="40" height="20" rx="3" fill="var(--wellfi-slate-800)" stroke="var(--wellfi-white)" strokeWidth="1" opacity="0.8" />
                <text x="70" y="68" fill="var(--wellfi-white)" fontSize="8" textAnchor="middle" fontFamily="var(--font-ibm-plex-mono)">
                  STAKE
                </text>
              </g>

              {/* Connection cable to ground */}
              <path
                d="M 90 65 Q 120 65 140 60"
                fill="none"
                stroke="var(--wellfi-cyan)"
                strokeWidth="2"
                strokeDasharray="4,3"
                opacity="0.6"
              />

              {/* Wellhead */}
              <g className="component-glow">
                <rect x="170" y="95" width="60" height="35" rx="4" fill="var(--wellfi-slate-800)" stroke="var(--wellfi-cyan)" strokeWidth="2" />
                <rect x="180" y="100" width="40" height="8" rx="2" fill="var(--wellfi-cyan)" opacity="0.3" />
                <text x="200" y="80" fill="var(--wellfi-white)" fontSize="10" textAnchor="middle" fontFamily="var(--font-ibm-plex-mono)">
                  WELLHEAD
                </text>
              </g>

              {/* Steel casing */}
              <rect x="185" y="130" width="30" height="380" fill="url(#casingGrad)" opacity="0.6" />
              <rect x="185" y="130" width="30" height="380" fill="none" stroke="var(--wellfi-white)" strokeWidth="0.5" opacity="0.3" />

              {/* Fiberglass collar */}
              <g className="component-glow">
                <rect x="178" y="340" width="44" height="35" rx="3" fill="var(--wellfi-teal)" stroke="var(--wellfi-cyan)" strokeWidth="2" filter="url(#glow)" />
                <text x="255" y="355" fill="var(--wellfi-cyan)" fontSize="9" fontFamily="var(--font-ibm-plex-mono)">
                  FIBERGLASS
                </text>
                <text x="255" y="367" fill="var(--wellfi-cyan)" fontSize="9" fontFamily="var(--font-ibm-plex-mono)">
                  COLLAR
                </text>
                <line x1="222" y1="358" x2="250" y2="358" stroke="var(--wellfi-cyan)" strokeWidth="1" opacity="0.5" />
              </g>

              {/* WellFi gauge */}
              <g className="component-glow">
                <rect x="180" y="385" width="40" height="100" rx="4" fill="var(--wellfi-blue)" stroke="var(--wellfi-cyan)" strokeWidth="2" filter="url(#glow)" />
                {/* Gauge details */}
                <rect x="186" y="395" width="28" height="6" rx="2" fill="var(--wellfi-cyan)" opacity="0.4" />
                <rect x="186" y="405" width="28" height="6" rx="2" fill="var(--wellfi-cyan)" opacity="0.3" />
                <circle cx="200" cy="430" r="12" fill="none" stroke="var(--wellfi-cyan)" strokeWidth="1" opacity="0.5" />
                <circle cx="200" cy="430" r="6" fill="var(--wellfi-cyan)" opacity="0.6" />
                <text x="200" y="465" fill="var(--wellfi-white)" fontSize="10" textAnchor="middle" fontWeight="bold">
                  WellFi
                </text>
                <text x="200" y="478" fill="var(--wellfi-white)" fontSize="8" textAnchor="middle" opacity="0.7">
                  GAUGE
                </text>
              </g>

              {/* EM waves emanating from gauge */}
              {[...Array(4)].map((_, i) => (
                <circle
                  key={i}
                  className="em-wave"
                  cx="200"
                  cy="430"
                  r={30 + i * 20}
                  fill="none"
                  stroke="var(--wellfi-cyan)"
                  strokeWidth="1.5"
                  opacity={0.5 - i * 0.1}
                />
              ))}

              {/* Signal path through formation */}
              <path
                className="signal-path"
                d="M 200 340 C 120 300 100 200 100 150 C 100 100 130 70 160 60 L 310 60"
                fill="none"
                stroke="url(#signalGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#glowStrong)"
              />

              {/* Data particles along path */}
              {[0, 1, 2].map((i) => (
                <circle
                  key={i}
                  className="data-particle"
                  r="4"
                  fill="var(--wellfi-cyan)"
                  filter="url(#glow)"
                  style={{ opacity: 0 }}
                />
              ))}

              {/* Surface Box */}
              <g className="component-glow">
                <rect x="300" y="40" width="70" height="45" rx="4" fill="var(--wellfi-slate-800)" stroke="var(--wellfi-cyan)" strokeWidth="2" filter="url(#glow)" />
                {/* Status LEDs */}
                <circle cx="315" cy="55" r="4" fill="var(--wellfi-cyan)" filter="url(#glow)" />
                <circle cx="328" cy="55" r="4" fill="var(--wellfi-teal)" opacity="0.6" />
                <rect x="310" y="65" width="50" height="12" rx="2" fill="var(--wellfi-navy)" />
                <text x="335" y="100" fill="var(--wellfi-white)" fontSize="9" textAnchor="middle" fontFamily="var(--font-ibm-plex-mono)">
                  SURFACE BOX
                </text>
              </g>

              {/* SCADA output arrow */}
              <g transform="translate(375, 62)">
                <line x1="0" y1="0" x2="20" y2="0" stroke="var(--wellfi-cyan)" strokeWidth="2" />
                <polygon points="20,0 14,-4 14,4" fill="var(--wellfi-cyan)" />
              </g>
              <text x="385" y="50" fill="var(--wellfi-cyan)" fontSize="8" fontFamily="var(--font-ibm-plex-mono)">
                SCADA
              </text>
            </svg>
          </div>

          {/* Steps */}
          <div className="tech-steps flex-1 space-y-4">
            <h3 className="text-2xl font-semibold text-[var(--wellfi-white)] mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--wellfi-cyan)]/10 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-[var(--wellfi-cyan)]" />
              </div>
              How It Works
            </h3>

            {steps.map((step) => (
              <div
                key={step.num}
                className="tech-step group glass-card p-5 rounded-xl hover-lift cursor-default"
              >
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--wellfi-cyan)]/20 to-[var(--wellfi-teal)]/10 flex items-center justify-center border border-[var(--wellfi-cyan)]/30 group-hover:border-[var(--wellfi-cyan)]/60 transition-colors">
                      <span className="tech-text text-[var(--wellfi-cyan)] font-semibold">
                        {step.num}
                      </span>
                    </div>
                    {step.num < 5 && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full h-4 w-px bg-gradient-to-b from-[var(--wellfi-cyan)]/30 to-transparent" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-[var(--wellfi-white)] font-medium mb-1 group-hover:text-[var(--wellfi-cyan)] transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-sm text-[var(--wellfi-white)]/60 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Key advantage callout */}
            <div className="mt-8 p-6 rounded-2xl glass border border-[var(--wellfi-cyan)]/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--wellfi-cyan)] to-transparent" />
              <div className="flex items-center gap-3 mb-3">
                <Waves className="w-5 h-5 text-[var(--wellfi-cyan)]" />
                <span className="text-[var(--wellfi-cyan)] font-medium">Key Advantage</span>
              </div>
              <p className="text-[var(--wellfi-white)]/80">
                Unlike acoustic or pressure pulse systems, EM telemetry works through{' '}
                <span className="text-[var(--wellfi-cyan)]">any completion type</span> — including{' '}
                <span className="text-[var(--wellfi-cyan)]">solid steel casing</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
