'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, FileText, Thermometer, Gauge, Battery, Ruler, Cpu, Cable } from 'lucide-react';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

const specs = [
  {
    category: 'Environmental Ratings',
    icon: Thermometer,
    items: [
      { label: 'Temperature Rating', value: '302°F', subvalue: '150°C', progress: 85 },
      { label: 'Pressure Rating', value: '10,000', subvalue: 'psi', progress: 100 },
    ],
  },
  {
    category: 'Sensor Performance',
    icon: Gauge,
    items: [
      { label: 'Piezo Resolution', value: '0.04', subvalue: 'psi', progress: 60 },
      { label: 'Quartz Resolution', value: '0.006', subvalue: 'psi', progress: 95 },
    ],
  },
  {
    category: 'Power & Memory',
    icon: Battery,
    items: [
      { label: 'Battery Life', value: '5+', subvalue: 'years', progress: 100 },
      { label: 'Event Memory', value: '7,768', subvalue: 'events', progress: 80 },
    ],
  },
  {
    category: 'Physical',
    icon: Ruler,
    items: [
      { label: 'Outer Diameter', value: '1.83"', subvalue: '46mm', progress: 45 },
      { label: 'Thread', value: '2-3/8"', subvalue: '8RD EUE', progress: 60 },
    ],
  },
];

const outputOptions = [
  { icon: Cpu, label: 'Standard Output', value: 'MODBUS RS-485' },
  { icon: Cable, label: 'Optional Output', value: '4-20mA Analog' },
];

export function SpecificationsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Header animation
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.specs-header',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      headerTl
        .fromTo('.specs-label',
          { opacity: 0, y: 20, filter: 'blur(10px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }
        )
        .fromTo('.specs-title',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.3'
        )
        .fromTo('.specs-subtitle',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        );

      // Product image animation
      gsap.fromTo('.specs-product',
        { opacity: 0, x: -50 },
        {
          opacity: 1, x: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.specs-product',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Spec cards stagger
      gsap.fromTo('.spec-category',
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.specs-grid',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Progress bar animation
      gsap.fromTo('.progress-fill',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.specs-grid',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Output options
      gsap.fromTo('.output-option',
        { opacity: 0, x: -20 },
        {
          opacity: 1, x: 0,
          duration: 0.5,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.output-section',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Download CTA
      gsap.fromTo('.download-cta',
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: '.download-cta',
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="specifications"
      className="relative py-32 px-4 overflow-hidden"
      style={{ background: 'var(--wellfi-slate)' }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute inset-0 bg-gradient-radial opacity-20" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="specs-header text-center mb-16">
          <div className="specs-label mb-6">
            <span className="label-text inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
              <FileText className="w-4 h-4 text-[var(--wellfi-cyan)]" />
              Technical Details
            </span>
          </div>
          <h2 className="specs-title display-heading text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="text-[var(--wellfi-white)]">The Details.</span>
            <br />
            <span className="text-gradient text-glow">For When You&apos;re Ready.</span>
          </h2>
          <p className="specs-subtitle text-lg md:text-xl text-[var(--wellfi-white)]/60 max-w-2xl mx-auto">
            Built to withstand the harshest downhole conditions.
            <span className="text-[var(--wellfi-cyan)]"> Engineered for reliability.</span>
          </p>
        </div>

        {/* Specifications with Product Image */}
        <div className="flex flex-col lg:flex-row gap-8 mb-16">
          {/* Product Image - Technical Profile View */}
          <div className="specs-product lg:w-1/4 flex-shrink-0 hidden lg:flex items-center justify-center">
            <div className="relative h-[500px] w-full">
              <Image
                src="/renders/profile-technical.png"
                alt="WellFi Gauge Technical Profile"
                fill
                className="object-contain"
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(34, 211, 238, 0.2))',
                }}
              />
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="specs-grid grid md:grid-cols-2 gap-6 flex-1">
          {specs.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.category}
                className="spec-category glass-card p-6 rounded-2xl hover-lift cursor-default"
              >
                {/* Category header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--wellfi-cyan)]/20 to-[var(--wellfi-teal)]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[var(--wellfi-cyan)]" />
                  </div>
                  <h3 className="font-semibold text-[var(--wellfi-white)]">
                    {category.category}
                  </h3>
                </div>

                {/* Spec items */}
                <div className="space-y-5">
                  {category.items.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--wellfi-white)]/60">
                          {item.label}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="tech-text text-xl font-bold text-[var(--wellfi-cyan)]">
                            {item.value}
                          </span>
                          <span className="text-xs text-[var(--wellfi-white)]/40">
                            {item.subvalue}
                          </span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 rounded-full bg-[var(--wellfi-slate-800)] overflow-hidden">
                        <div
                          className="progress-fill h-full rounded-full origin-left"
                          style={{
                            width: `${item.progress}%`,
                            background: 'linear-gradient(90deg, var(--wellfi-cyan), var(--wellfi-teal))',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Output Options */}
        <div className="output-section mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {outputOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.label}
                  className="output-option glass-card px-6 py-4 rounded-xl flex items-center gap-4 hover-lift cursor-default"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--wellfi-cyan)]/20 to-[var(--wellfi-teal)]/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[var(--wellfi-cyan)]" />
                  </div>
                  <div>
                    <div className="text-xs text-[var(--wellfi-white)]/50 uppercase tracking-wider">
                      {option.label}
                    </div>
                    <div className="tech-text text-lg font-semibold text-[var(--wellfi-white)]">
                      {option.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Download CTA */}
        <div className="download-cta text-center">
          <div className="glass rounded-2xl p-8 max-w-lg mx-auto relative overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--wellfi-cyan)] to-transparent" />

            <div className="mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--wellfi-cyan)] to-[var(--wellfi-teal)] flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-[var(--wellfi-slate)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--wellfi-white)] mb-2">
                Full Technical Specifications
              </h3>
              <p className="text-sm text-[var(--wellfi-white)]/60">
                Complete specs, dimensions, and installation requirements
              </p>
            </div>

            <a
              href="/documents/wellfi-tech-sheet.pdf"
              className="btn-primary inline-flex items-center gap-2 glow-cyan-pulse"
              download
            >
              <Download className="w-5 h-5" />
              Download Tech Sheet (PDF)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
