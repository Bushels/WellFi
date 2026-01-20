'use client';

import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Trophy, TrendingUp, Shield, Battery, Clock, Zap, Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  {
    value: 130,
    suffix: '+',
    label: 'Active Installations',
    sublabel: 'and counting',
    icon: Trophy,
    highlight: true,
  },
  {
    value: 0,
    suffix: '',
    label: 'Tool Failures',
    sublabel: 'to date',
    icon: Shield,
    highlight: false,
  },
  {
    value: 5,
    suffix: '+',
    label: 'Year Battery Life',
    sublabel: 'maintenance-free',
    icon: Battery,
    highlight: false,
  },
  {
    value: 24,
    suffix: '/7',
    label: 'Real-Time Monitoring',
    sublabel: 'continuous data',
    icon: Clock,
    highlight: false,
  },
];

const outcomes = [
  { label: 'Less Downtime', description: 'Catch problems before they stop production' },
  { label: 'Fewer Workovers', description: 'Extend equipment life with data-driven decisions' },
  { label: 'Optimized Production', description: 'Maximize output with real-time insights' },
];

export function ResultsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counters, setCounters] = useState(stats.map(() => 0));

  useGSAP(
    () => {
      // Header animation
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.results-header',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      headerTl
        .fromTo('.results-label',
          { opacity: 0, y: 20, filter: 'blur(10px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }
        )
        .fromTo('.results-title',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.3'
        )
        .fromTo('.results-subtitle',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        );

      // Stats cards entrance
      gsap.fromTo('.stat-card',
        { opacity: 0, scale: 0.8, y: 40 },
        {
          opacity: 1, scale: 1, y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: '.stats-grid',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Counter animation trigger
      ScrollTrigger.create({
        trigger: '.stats-grid',
        start: 'top 70%',
        onEnter: () => {
          if (hasAnimated) return;
          setHasAnimated(true);
        },
      });

      // Celebration particles for highlight stat
      gsap.to('.celebration-particle', {
        y: 'random(-100, -200)',
        x: 'random(-50, 50)',
        opacity: 0,
        scale: 0,
        duration: 2,
        stagger: {
          each: 0.1,
          repeat: -1,
          repeatDelay: 3,
        },
        ease: 'power2.out',
      });

      // Glow pulse on highlight
      gsap.to('.stat-highlight', {
        boxShadow: '0 0 60px rgba(34, 211, 238, 0.4), inset 0 0 40px rgba(34, 211, 238, 0.05)',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Outcomes animation
      gsap.fromTo('.outcome-item',
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.outcomes-section',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Quote animation
      gsap.fromTo('.testimonial',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.testimonial',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    },
    { scope: sectionRef, dependencies: [hasAnimated] }
  );

  // Animate counters when triggered
  useEffect(() => {
    if (!hasAnimated) return;

    stats.forEach((stat, index) => {
      const duration = 2000;
      const startTime = Date.now();
      const startValue = 0;
      const endValue = stat.value;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeProgress);

        setCounters(prev => {
          const newCounters = [...prev];
          newCounters[index] = currentValue;
          return newCounters;
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      setTimeout(() => animate(), index * 150);
    });
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      id="results"
      className="relative py-32 px-4 overflow-hidden"
      style={{ background: 'var(--wellfi-slate-800)' }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* EM wave decorations */}
      <div className="absolute left-1/2 top-1/4 -translate-x-1/2 pointer-events-none opacity-10">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: `${300 + i * 150}px`,
              height: `${300 + i * 150}px`,
              border: '1px solid var(--wellfi-cyan)',
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="results-header text-center mb-16">
          <div className="results-label mb-6">
            <span className="label-text inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
              <TrendingUp className="w-4 h-4 text-[var(--wellfi-cyan)]" />
              Proven Results
            </span>
          </div>
          <h2 className="results-title display-heading text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="text-[var(--wellfi-white)]">Less Downtime.</span>
            <br />
            <span className="text-[var(--wellfi-white)]">Fewer Workovers.</span>
            <br />
            <span className="text-gradient text-glow">Optimized Production.</span>
          </h2>
          <p className="results-subtitle text-lg md:text-xl text-[var(--wellfi-white)]/60 max-w-2xl mx-auto">
            Real results from real wells.
            <span className="text-[var(--wellfi-cyan)]"> Data you can trust.</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isHighlight = stat.highlight;

            return (
              <div
                key={stat.label}
                className={`stat-card relative group cursor-default ${isHighlight ? 'col-span-2 lg:col-span-1' : ''}`}
              >
                <div
                  className={`relative h-full p-6 md:p-8 rounded-2xl glass-card overflow-hidden ${isHighlight ? 'stat-highlight' : ''}`}
                  style={{
                    border: isHighlight
                      ? '2px solid var(--wellfi-cyan)'
                      : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {/* Celebration particles for main stat */}
                  {isHighlight && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="celebration-particle absolute bottom-0 left-1/2"
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: i % 2 === 0 ? 'var(--wellfi-cyan)' : 'var(--wellfi-teal)',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`${isHighlight ? 'w-14 h-14' : 'w-10 h-10'} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}
                      style={{
                        background: isHighlight
                          ? 'linear-gradient(135deg, var(--wellfi-cyan), var(--wellfi-teal))'
                          : 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(13, 148, 136, 0.1))',
                      }}
                    >
                      <Icon
                        className={`${isHighlight ? 'w-7 h-7' : 'w-5 h-5'}`}
                        style={{ color: isHighlight ? 'var(--wellfi-slate)' : 'var(--wellfi-cyan)' }}
                      />
                    </div>

                    {isHighlight && (
                      <span className="text-[10px] text-[var(--wellfi-cyan)] bg-[var(--wellfi-cyan)]/10 px-2 py-1 rounded-full uppercase tracking-wider">
                        Milestone
                      </span>
                    )}
                  </div>

                  {/* Counter */}
                  <div className={`${isHighlight ? 'text-5xl md:text-6xl' : 'text-3xl md:text-4xl'} font-bold mb-2`}>
                    <span className="text-gradient">
                      {counters[index]}{stat.suffix}
                    </span>
                  </div>

                  {/* Label */}
                  <div className="text-[var(--wellfi-white)] font-medium mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-[var(--wellfi-white)]/50">
                    {stat.sublabel}
                  </div>

                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 40px rgba(34, 211, 238, 0.1)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Outcomes */}
        <div className="outcomes-section mb-20">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {outcomes.map((outcome, index) => (
              <div key={outcome.label} className="outcome-item flex items-center gap-4">
                <div className="flex items-center gap-3 glass-card px-5 py-3 rounded-xl hover-lift cursor-default">
                  <Zap className="w-5 h-5 text-[var(--wellfi-cyan)]" />
                  <div>
                    <div className="font-semibold text-[var(--wellfi-white)]">{outcome.label}</div>
                    <div className="text-xs text-[var(--wellfi-white)]/50">{outcome.description}</div>
                  </div>
                </div>
                {index < outcomes.length - 1 && (
                  <div className="hidden md:block w-8 h-px bg-[var(--wellfi-cyan)]/30" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="testimonial max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-8 md:p-10 relative overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--wellfi-cyan)] to-transparent" />

            {/* Quote icon */}
            <div className="absolute top-6 left-6 opacity-20">
              <Quote className="w-12 h-12 text-[var(--wellfi-cyan)]" />
            </div>

            <blockquote className="relative">
              <p className="text-lg md:text-xl text-[var(--wellfi-white)]/90 leading-relaxed mb-6 pl-8">
                &quot;With WellFi, we went from flying blind to having{' '}
                <span className="text-[var(--wellfi-cyan)]">real-time insight</span> into our downhole conditions.
                The data helps us prevent pump burnout and optimize our artificial lift strategy.&quot;
              </p>
              <footer className="flex items-center gap-4 pl-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--wellfi-cyan)] to-[var(--wellfi-teal)] flex items-center justify-center">
                  <span className="text-[var(--wellfi-slate)] font-bold">PE</span>
                </div>
                <div>
                  <div className="font-medium text-[var(--wellfi-white)]">Production Engineer</div>
                  <div className="text-sm text-[var(--wellfi-cyan)]">Canadian Heavy Oil Operator</div>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
