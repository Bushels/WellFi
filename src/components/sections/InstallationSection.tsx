'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Wrench, ArrowDown, Cable, Clock, CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: 1,
    icon: Wrench,
    title: 'Makeup on Surface',
    description: 'Attach WellFi assembly to pup joints using standard 2-3/8" 8RD EUE connections. Visual inspection and torque verification.',
    time: '15 min',
  },
  {
    num: 2,
    icon: ArrowDown,
    title: 'Run with Tubing',
    description: 'Lower assembly with tubing string during pump changeout. No special handling required - standard rig operations.',
    time: '0 min extra',
  },
  {
    num: 3,
    icon: Cable,
    title: 'Connect Surface Box',
    description: 'Connect BNC cables from Surface Box to wellhead and ground stake. Power up and verify signal acquisition.',
    time: '30 min',
  },
];

const assemblyComponents = [
  { id: 'tubing', label: 'Tubing', color: 'slate', type: 'standard' },
  { id: 'pup1', label: 'Pup Joint #1', color: 'navy', type: 'connector' },
  { id: 'clamp1', label: 'Top Clamp', color: 'teal', type: 'wellfi', small: true },
  { id: 'collar', label: 'Signal Collar', color: 'cyan', type: 'wellfi' },
  { id: 'sonde', label: 'Electronics Sonde', color: 'blue', type: 'wellfi', highlight: true },
  { id: 'battery', label: 'Battery Barrel', color: 'blue', type: 'wellfi' },
  { id: 'peek', label: 'PEEK Clamp', color: 'teal', type: 'wellfi', small: true },
  { id: 'fiberglass', label: 'Fiberglass Collar', color: 'teal', type: 'wellfi' },
  { id: 'clamp2', label: 'Bottom Clamp', color: 'teal', type: 'wellfi', small: true },
  { id: 'pup2', label: 'Pup Joint #2', color: 'navy', type: 'connector' },
  { id: 'pump', label: 'Pump / Tail Pipe', color: 'slate', type: 'standard' },
];

export function InstallationSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Header animation
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.install-header',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      headerTl
        .fromTo('.install-label',
          { opacity: 0, y: 20, filter: 'blur(10px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }
        )
        .fromTo('.install-title',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.3'
        )
        .fromTo('.install-subtitle',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        );

      // Steps animation - staggered slide in
      gsap.fromTo('.install-step',
        { opacity: 0, x: -40, scale: 0.95 },
        {
          opacity: 1, x: 0, scale: 1,
          duration: 0.7,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.install-steps',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Assembly animation - components appear in sequence
      gsap.fromTo('.assembly-part',
        { opacity: 0, x: 30, scale: 0.8 },
        {
          opacity: 1, x: 0, scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: '.assembly-visual',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Glow pulse on WellFi components
      gsap.to('.wellfi-glow', {
        boxShadow: '0 0 30px rgba(34, 211, 238, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.1)',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Connection lines animation
      gsap.fromTo('.connection-line',
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.3,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.assembly-visual',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Note animation
      gsap.fromTo('.install-note',
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: '.install-note',
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    },
    { scope: sectionRef }
  );

  const getComponentStyles = (comp: typeof assemblyComponents[0]) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      slate: {
        bg: 'var(--wellfi-slate-800)',
        border: 'rgba(255,255,255,0.15)',
        text: 'var(--wellfi-white)',
      },
      navy: {
        bg: 'var(--wellfi-navy)',
        border: 'var(--wellfi-cyan)',
        text: 'var(--wellfi-white)',
      },
      teal: {
        bg: 'var(--wellfi-teal)',
        border: 'var(--wellfi-cyan)',
        text: 'var(--wellfi-white)',
      },
      cyan: {
        bg: 'linear-gradient(135deg, var(--wellfi-cyan), var(--wellfi-teal))',
        border: 'var(--wellfi-cyan)',
        text: 'var(--wellfi-slate)',
      },
      blue: {
        bg: 'var(--wellfi-blue)',
        border: 'var(--wellfi-cyan)',
        text: 'var(--wellfi-white)',
      },
    };

    return colors[comp.color] || colors.slate;
  };

  return (
    <section
      ref={sectionRef}
      id="installation"
      className="relative py-32 px-4 overflow-hidden"
      style={{ background: 'var(--wellfi-slate-800)' }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* EM waves decoration */}
      <div className="absolute right-0 top-1/3 pointer-events-none opacity-10">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute right-0 top-0 rounded-full"
            style={{
              width: `${200 + i * 120}px`,
              height: `${200 + i * 120}px`,
              border: '1px solid var(--wellfi-cyan)',
              transform: 'translateX(50%)',
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="install-header text-center mb-20">
          <div className="install-label mb-6">
            <span className="label-text inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
              <Wrench className="w-4 h-4 text-[var(--wellfi-cyan)]" />
              Simple Setup
            </span>
          </div>
          <h2 className="install-title display-heading text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="text-[var(--wellfi-white)]">Quicker Install.</span>
            <br />
            <span className="text-gradient text-glow">No Strings Attached.</span>
          </h2>
          <p className="install-subtitle text-lg md:text-xl text-[var(--wellfi-white)]/60 max-w-2xl mx-auto">
            Deploy during routine pump changeout.
            <span className="text-[var(--wellfi-cyan)]"> Under 45 minutes total install time.</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-16">
          {/* Installation Steps */}
          <div className="install-steps flex-1 space-y-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="install-step group glass-card p-6 rounded-2xl hover-lift cursor-default relative overflow-hidden"
                >
                  {/* Step number glow */}
                  <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-[var(--wellfi-cyan)]/5 blur-2xl pointer-events-none" />

                  <div className="relative flex items-start gap-5">
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--wellfi-cyan)]/20 to-[var(--wellfi-teal)]/10 flex items-center justify-center border border-[var(--wellfi-cyan)]/30 group-hover:border-[var(--wellfi-cyan)]/60 transition-all group-hover:scale-105">
                        <Icon className="w-7 h-7 text-[var(--wellfi-cyan)]" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--wellfi-cyan)] flex items-center justify-center text-xs font-bold text-[var(--wellfi-slate)]">
                        {step.num}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-[var(--wellfi-white)] group-hover:text-[var(--wellfi-cyan)] transition-colors">
                          {step.title}
                        </h3>
                        <span className="flex items-center gap-1.5 text-xs text-[var(--wellfi-cyan)] bg-[var(--wellfi-cyan)]/10 px-3 py-1 rounded-full">
                          <Clock className="w-3 h-3" />
                          {step.time}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--wellfi-white)]/60 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connector line to next step */}
                  {step.num < 3 && (
                    <div className="absolute left-10 -bottom-6 w-0.5 h-6 bg-gradient-to-b from-[var(--wellfi-cyan)]/30 to-transparent z-20" />
                  )}
                </div>
              );
            })}

            {/* Total time summary */}
            <div className="flex items-center gap-4 p-4 rounded-xl glass border border-[var(--wellfi-cyan)]/20">
              <CheckCircle2 className="w-8 h-8 text-[var(--wellfi-cyan)]" />
              <div>
                <div className="text-2xl font-bold text-gradient">&lt; 45 min</div>
                <div className="text-sm text-[var(--wellfi-white)]/60">Total additional rig time</div>
              </div>
            </div>
          </div>

          {/* Completion String Assembly Visual */}
          <div className="assembly-visual flex-1 flex justify-center">
            <div className="relative">
              {/* Background glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-96 rounded-full bg-[var(--wellfi-cyan)]/5 blur-3xl" />
              </div>

              {/* Assembly stack */}
              <div className="relative space-y-1">
                {assemblyComponents.map((comp, index) => {
                  const styles = getComponentStyles(comp);
                  const isWellFi = comp.type === 'wellfi';
                  const isHighlight = comp.highlight;

                  return (
                    <div key={comp.id} className="flex flex-col items-center">
                      {/* Connection line above (except first) */}
                      {index > 0 && (
                        <div
                          className="connection-line w-1 h-3 origin-top"
                          style={{
                            background: isWellFi
                              ? 'linear-gradient(to bottom, var(--wellfi-cyan), var(--wellfi-teal))'
                              : 'rgba(255,255,255,0.2)',
                          }}
                        />
                      )}

                      {/* Component */}
                      <div
                        className={`assembly-part relative ${isHighlight ? 'wellfi-glow' : ''}`}
                        style={{
                          background: styles.bg,
                          border: `2px solid ${styles.border}`,
                          borderRadius: comp.small ? '6px' : '10px',
                          padding: comp.small ? '8px 16px' : '12px 24px',
                          minWidth: comp.small ? '120px' : '160px',
                          textAlign: 'center',
                          boxShadow: isWellFi
                            ? '0 0 20px rgba(34, 211, 238, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
                            : 'none',
                        }}
                      >
                        <span
                          className={`font-medium ${comp.small ? 'text-xs' : 'text-sm'}`}
                          style={{ color: styles.text }}
                        >
                          {comp.label}
                        </span>

                        {/* WellFi badge for main gauge */}
                        {isHighlight && (
                          <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <div className="w-6 h-px bg-[var(--wellfi-cyan)]" />
                            <span className="text-[10px] text-[var(--wellfi-cyan)] uppercase tracking-wider whitespace-nowrap">
                              WellFi Gauge
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Labels */}
              <div className="absolute -left-20 top-0 flex flex-col justify-between h-full py-4 text-right">
                <span className="text-[10px] text-[var(--wellfi-white)]/40 uppercase tracking-wider">Surface</span>
                <span className="text-[10px] text-[var(--wellfi-white)]/40 uppercase tracking-wider">Downhole</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="install-note mt-16 p-6 rounded-2xl glass border border-[var(--wellfi-cyan)]/20 text-center max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--wellfi-cyan)] to-transparent" />
          <p className="text-[var(--wellfi-white)]/80">
            Install during PCP pump changeout — <span className="text-[var(--wellfi-cyan)]">minimal additional rig time</span>.
            Standard <span className="tech-text text-[var(--wellfi-cyan)]">2-3/8" 8RD EUE</span> connections.
            No specialized equipment or training required.
          </p>
        </div>
      </div>
    </section>
  );
}
