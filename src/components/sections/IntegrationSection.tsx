'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Network, Server, Database, Monitor, Wifi, ArrowRight, Cpu } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const flowNodes = [
  {
    id: 'wellhead',
    label: 'Wellhead',
    sublabel: 'BNC Connection',
    icon: Wifi,
    description: 'Signal from downhole gauge',
  },
  {
    id: 'surfacebox',
    label: 'Surface Box',
    sublabel: 'Signal Processing',
    icon: Cpu,
    description: 'Decodes EM telemetry',
    highlight: true,
  },
  {
    id: 'rtu',
    label: 'RTU',
    sublabel: 'MODBUS RS-485',
    icon: Server,
    description: 'Remote Terminal Unit',
  },
  {
    id: 'scada',
    label: 'SCADA',
    sublabel: 'Your System',
    icon: Monitor,
    description: 'Control & monitoring',
  },
];

const outputs = [
  {
    title: 'Standard Output',
    protocol: 'MODBUS RS-485',
    description: 'Direct connection to your existing RTU. Industry-standard protocol, no converters needed.',
    icon: Database,
    primary: true,
  },
  {
    title: 'Optional Output',
    protocol: '4-20mA Analog',
    description: 'For legacy systems or additional redundancy requirements.',
    icon: Network,
    primary: false,
  },
];

const surfaceBoxSpecs = [
  { value: '7,768', label: 'Event Memory', suffix: 'events' },
  { value: '2', label: 'BNC Connections', suffix: 'ports' },
  { value: '24/7', label: 'Continuous', suffix: 'monitoring' },
  { value: '<1s', label: 'Update Rate', suffix: 'latency' },
];

export function IntegrationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Header animation
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.integration-header',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      headerTl
        .fromTo('.integration-label',
          { opacity: 0, y: 20, filter: 'blur(10px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }
        )
        .fromTo('.integration-title',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.3'
        )
        .fromTo('.integration-subtitle',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        );

      // Flow nodes animation
      gsap.fromTo('.flow-node',
        { opacity: 0, scale: 0.8, y: 30 },
        {
          opacity: 1, scale: 1, y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: '.flow-container',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Connection lines drawing
      gsap.fromTo('.flow-connector',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.4,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.flow-container',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Data pulse animation - continuous
      gsap.to('.data-pulse', {
        x: '100%',
        duration: 2,
        repeat: -1,
        ease: 'none',
        stagger: {
          each: 0.5,
          repeat: -1,
        },
      });

      // Output cards
      gsap.fromTo('.output-card',
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.output-cards',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Surface box specs
      gsap.fromTo('.spec-item',
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.surface-box-specs',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Highlight glow
      gsap.to('.node-highlight', {
        boxShadow: '0 0 40px rgba(34, 211, 238, 0.5), 0 0 80px rgba(34, 211, 238, 0.2)',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="integration"
      className="relative py-32 px-4 overflow-hidden"
      style={{ background: 'var(--wellfi-slate)' }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute inset-0 bg-gradient-radial opacity-20" />

      {/* EM wave decorations */}
      <div className="absolute left-1/2 top-1/4 -translate-x-1/2 pointer-events-none opacity-10">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: `${400 + i * 200}px`,
              height: `${400 + i * 200}px`,
              border: '1px solid var(--wellfi-cyan)',
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="integration-header text-center mb-20">
          <div className="integration-label mb-6">
            <span className="label-text inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
              <Network className="w-4 h-4 text-[var(--wellfi-cyan)]" />
              Seamless Integration
            </span>
          </div>
          <h2 className="integration-title display-heading text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="text-gradient text-glow">Plug and Play</span>
          </h2>
          <p className="integration-subtitle text-lg md:text-xl text-[var(--wellfi-white)]/60 max-w-2xl mx-auto">
            Connect to your existing SCADA infrastructure.
            <span className="text-[var(--wellfi-cyan)]"> No custom software required.</span>
          </p>
        </div>

        {/* Data Flow Visualization */}
        <div ref={flowRef} className="flow-container mb-20">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {flowNodes.map((node, index) => {
              const Icon = node.icon;
              const isHighlight = node.highlight;

              return (
                <div key={node.id} className="flex items-center">
                  {/* Node */}
                  <div className="flow-node group relative">
                    <div
                      className={`relative w-32 h-32 md:w-40 md:h-40 rounded-2xl glass-card flex flex-col items-center justify-center p-4 cursor-default ${isHighlight ? 'node-highlight' : ''}`}
                      style={{
                        border: isHighlight
                          ? '2px solid var(--wellfi-cyan)'
                          : '1px solid rgba(255,255,255,0.1)',
                        boxShadow: isHighlight
                          ? '0 0 30px rgba(34, 211, 238, 0.3), inset 0 0 30px rgba(34, 211, 238, 0.05)'
                          : 'none',
                      }}
                    >
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110`}
                        style={{
                          background: isHighlight
                            ? 'linear-gradient(135deg, var(--wellfi-cyan), var(--wellfi-teal))'
                            : 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(13, 148, 136, 0.1))',
                        }}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{
                            color: isHighlight ? 'var(--wellfi-slate)' : 'var(--wellfi-cyan)',
                          }}
                        />
                      </div>

                      {/* Label */}
                      <span className="text-sm font-semibold text-[var(--wellfi-white)] text-center">
                        {node.label}
                      </span>
                      <span className="text-[10px] text-[var(--wellfi-cyan)] text-center mt-1">
                        {node.sublabel}
                      </span>

                      {/* Tooltip on hover */}
                      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="px-3 py-1.5 rounded-lg glass text-xs text-[var(--wellfi-white)]/80 whitespace-nowrap">
                          {node.description}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connector */}
                  {index < flowNodes.length - 1 && (
                    <div className="flow-connector relative w-8 md:w-16 h-1 mx-2 origin-left hidden md:block">
                      {/* Base line */}
                      <div className="absolute inset-0 bg-[var(--wellfi-cyan)]/30 rounded-full" />

                      {/* Animated data pulse */}
                      <div className="absolute inset-0 overflow-hidden rounded-full">
                        <div
                          className="data-pulse absolute h-full w-8 -left-8 rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, transparent, var(--wellfi-cyan), transparent)',
                          }}
                        />
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--wellfi-cyan)]" />
                    </div>
                  )}

                  {/* Mobile arrow */}
                  {index < flowNodes.length - 1 && (
                    <div className="md:hidden my-2">
                      <ArrowRight className="w-5 h-5 text-[var(--wellfi-cyan)] rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Output Options */}
        <div className="output-cards grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {outputs.map((output) => {
            const Icon = output.icon;
            return (
              <div
                key={output.title}
                className={`output-card group glass-card p-6 rounded-2xl hover-lift cursor-default relative overflow-hidden ${output.primary ? 'border-2 border-[var(--wellfi-cyan)]/50' : ''}`}
              >
                {/* Primary badge */}
                {output.primary && (
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] text-[var(--wellfi-cyan)] bg-[var(--wellfi-cyan)]/10 px-2 py-1 rounded-full uppercase tracking-wider">
                      Primary
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--wellfi-cyan)]/20 to-[var(--wellfi-teal)]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-[var(--wellfi-cyan)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--wellfi-white)] mb-1">
                      {output.title}
                    </h3>
                    <p className="tech-text text-xl text-[var(--wellfi-cyan)] mb-2">
                      {output.protocol}
                    </p>
                    <p className="text-sm text-[var(--wellfi-white)]/60">
                      {output.description}
                    </p>
                  </div>
                </div>

                {/* Glow effect for primary */}
                {output.primary && (
                  <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: 'inset 0 0 40px rgba(34, 211, 238, 0.1)' }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Surface Box Specs */}
        <div className="surface-box-specs max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-8 relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--wellfi-cyan)] to-transparent" />

            <h3 className="text-xl font-semibold text-[var(--wellfi-white)] text-center mb-8 flex items-center justify-center gap-3">
              <Cpu className="w-5 h-5 text-[var(--wellfi-cyan)]" />
              Surface Box Capabilities
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {surfaceBoxSpecs.map((spec) => (
                <div key={spec.label} className="spec-item text-center group">
                  <div className="text-3xl md:text-4xl font-bold text-gradient mb-1 group-hover:scale-110 transition-transform">
                    {spec.value}
                  </div>
                  <div className="text-sm text-[var(--wellfi-white)] mb-0.5">
                    {spec.label}
                  </div>
                  <div className="text-[10px] text-[var(--wellfi-white)]/40 uppercase tracking-wider">
                    {spec.suffix}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
