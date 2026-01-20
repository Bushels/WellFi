'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Zap,
  Radio,
  Battery,
  Plug,
  Clock,
  TrendingUp,
  Settings,
  Sparkles,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Zap,
    title: 'Instant Data',
    hook: 'No more waiting. No more guessing.',
    description: 'Real-time pressure and temperature transmitted through steel casing. See what\'s happening thousands of meters down — right now.',
    stat: '< 1 sec',
    statLabel: 'Update rate',
    accent: 'cyan',
  },
  {
    icon: Radio,
    title: 'Through-Casing EM',
    hook: 'Where other systems fail, WellFi delivers.',
    description: 'Electromagnetic signals penetrate steel, cement, and formation. No acoustic limitations. No pressure pulse restrictions.',
    stat: '100%',
    statLabel: 'Steel compatible',
    accent: 'teal',
  },
  {
    icon: Battery,
    title: '5+ Year Battery',
    hook: 'Deploy it. Forget it. Trust it.',
    description: 'Modular battery packs rated for extended deployment. No intervention required. No production interruption.',
    stat: '5+',
    statLabel: 'Years runtime',
    accent: 'cyan',
  },
  {
    icon: Plug,
    title: 'SCADA-Ready',
    hook: 'Plug into your existing infrastructure.',
    description: 'MODBUS RS-485 or 4-20mA output feeds directly to your control systems. No new software. No learning curve.',
    stat: '0',
    statLabel: 'New systems needed',
    accent: 'blue',
  },
  {
    icon: Clock,
    title: 'Minimal Rig Time',
    hook: 'Install during your next pump changeout.',
    description: 'No dedicated rig time. No additional wireline runs. Drops in like any other tubing component.',
    stat: '< 30',
    statLabel: 'Min installation',
    accent: 'cyan',
  },
  {
    icon: TrendingUp,
    title: 'Production Uplift',
    hook: 'Data drives decisions. Decisions drive production.',
    description: 'Optimize pump speed, detect gas interference, prevent premature failures. Turn data into barrels.',
    stat: '+15%',
    statLabel: 'Avg. production gain',
    accent: 'teal',
  },
  {
    icon: Settings,
    title: 'Extended Pump Life',
    hook: 'Stop burning up ESPs.',
    description: 'Real-time intake pressure prevents cavitation. Head management extends pump life by months — sometimes years.',
    stat: '2x',
    statLabel: 'Longer pump life',
    accent: 'blue',
  },
];

export function BenefitsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // NO PINNING - let the user scroll naturally through the section
      // Each feature card animates as it comes into view

      // Header entrance
      gsap.fromTo(
        '.benefits-header',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.benefits-header',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Spotlight card entrance
      gsap.fromTo(
        '.spotlight-card',
        { opacity: 0, x: -60, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.spotlight-card',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Feature cards stagger in as user scrolls
      gsap.fromTo(
        '.feature-grid-card',
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.feature-grid',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Floating particles animation
      gsap.to('.floating-particle', {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 0.3,
          from: 'random',
        },
      });

      // Stat glow pulse
      gsap.to('.stat-glow', {
        opacity: 0.6,
        scale: 1.2,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    },
    { scope: sectionRef }
  );

  const getAccentColor = (accent: string) => {
    switch (accent) {
      case 'cyan': return 'var(--wellfi-cyan)';
      case 'teal': return 'var(--wellfi-teal)';
      case 'blue': return 'var(--wellfi-blue)';
      default: return 'var(--wellfi-cyan)';
    }
  };

  return (
    <section
      ref={sectionRef}
      id="benefits"
      className="relative bg-[var(--wellfi-slate-800)]"
      style={{ zIndex: 1 }}
    >
      {/* Header - Outside pinned area, user scrolls through this first */}
      <div className="benefits-header pt-32 pb-20 px-4 text-center">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--wellfi-cyan)]/20">
            <Sparkles className="w-4 h-4 text-[var(--wellfi-cyan)]" />
            <span className="text-sm font-medium tracking-wide text-[var(--wellfi-cyan)]">Why Engineers Choose WellFi</span>
          </span>
        </div>
        <h2 className="display-heading text-4xl md:text-5xl lg:text-6xl mb-6">
          <span className="text-[var(--wellfi-white)]">The </span>
          <span className="text-gradient">Wireless</span>
          <span className="text-[var(--wellfi-white)]"> Alternative</span>
        </h2>
        <p className="text-lg md:text-xl text-[var(--wellfi-white)]/60 max-w-2xl mx-auto">
          Every feature designed for one thing: <span className="text-[var(--wellfi-cyan)] font-medium">keeping your wells producing.</span>
        </p>
      </div>

      {/* Main Content - Natural scroll, no pinning */}
      <div ref={containerRef} className="relative pb-32 px-4">
        {/* Background effects */}
        <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="floating-particle absolute w-1 h-1 rounded-full bg-[var(--wellfi-cyan)]"
              style={{
                left: `${15 + (i * 10)}%`,
                top: `${10 + (i % 4) * 20}%`,
                opacity: 0.2 + (i % 3) * 0.15,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative">
          {/* Two-column layout: Spotlight + Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">

            {/* Left: Featured Spotlight Card (larger) */}
            <div className="spotlight-card lg:col-span-2 relative">
              <div
                className="absolute -inset-6 rounded-3xl blur-3xl opacity-30"
                style={{ background: getAccentColor(features[0].accent) }}
              />
              <div className="relative glass-strong p-8 rounded-2xl border border-[var(--wellfi-white)]/10">
                {/* Icon */}
                <div className="relative mb-6">
                  <div
                    className="stat-glow absolute inset-0 rounded-xl blur-xl"
                    style={{ background: getAccentColor(features[0].accent), opacity: 0.3 }}
                  />
                  <div
                    className="relative w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${getAccentColor(features[0].accent)}30, ${getAccentColor(features[0].accent)}10)`,
                      border: `2px solid ${getAccentColor(features[0].accent)}50`,
                    }}
                  >
                    <Zap
                      className="w-8 h-8"
                      style={{ color: getAccentColor(features[0].accent) }}
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-[var(--wellfi-white)] mb-3">
                  {features[0].title}
                </h3>

                <p
                  className="text-lg md:text-xl font-medium mb-4"
                  style={{ color: getAccentColor(features[0].accent) }}
                >
                  {features[0].hook}
                </p>

                <p className="text-[var(--wellfi-white)]/60 leading-relaxed mb-6">
                  {features[0].description}
                </p>

                <div className="flex items-end gap-3 pt-4 border-t border-[var(--wellfi-white)]/10">
                  <span
                    className="text-4xl md:text-5xl font-bold tracking-tight"
                    style={{ color: getAccentColor(features[0].accent) }}
                  >
                    {features[0].stat}
                  </span>
                  <span className="text-[var(--wellfi-white)]/40 text-sm uppercase tracking-wider pb-1">
                    {features[0].statLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Feature Grid */}
            <div className="feature-grid lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
              {features.slice(1).map((feature, index) => {
                const Icon = feature.icon;
                const accentColor = getAccentColor(feature.accent);

                return (
                  <div
                    key={index}
                    className="feature-grid-card group glass-card p-5 rounded-xl border border-[var(--wellfi-white)]/5 hover:border-[var(--wellfi-cyan)]/30 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}05)`,
                        border: `1px solid ${accentColor}30`,
                      }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: accentColor }}
                        strokeWidth={1.5}
                      />
                    </div>

                    <h4 className="font-semibold text-[var(--wellfi-white)] mb-2 group-hover:text-[var(--wellfi-cyan)] transition-colors">
                      {feature.title}
                    </h4>

                    <p className="text-sm text-[var(--wellfi-white)]/50 mb-3 line-clamp-2">
                      {feature.hook}
                    </p>

                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: accentColor }}
                      >
                        {feature.stat}
                      </span>
                      <span className="text-xs text-[var(--wellfi-white)]/40 uppercase tracking-wide">
                        {feature.statLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
