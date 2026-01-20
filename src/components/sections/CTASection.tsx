'use client';

import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Download, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [particles, setParticles] = useState<Array<{
    width: number;
    height: number;
    background: string;
    left: number;
    top: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    setParticles([...Array(15)].map((_, i) => ({
      width: Math.random() * 4 + 2,
      height: Math.random() * 4 + 2,
      background: i % 2 === 0 ? 'var(--wellfi-cyan)' : 'var(--wellfi-teal)',
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random() * 0.4 + 0.1,
    })));
  }, []);

  useGSAP(
    () => {
      if (particles.length === 0) return;

      // Content entrance
      const contentTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.cta-content',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      contentTl
        .fromTo('.cta-badge',
          { opacity: 0, y: 20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6 }
        )
        .fromTo('.cta-logo',
          { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
          { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' },
          '-=0.3'
        )
        .fromTo('.cta-headline',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.4'
        )
        .fromTo('.cta-description',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        )
        .fromTo('.cta-buttons',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.3'
        )
        .fromTo('.cta-footer',
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          '-=0.2'
        );

      // Floating EM waves animation
      gsap.to('.cta-wave', {
        scale: 1.5,
        opacity: 0,
        duration: 4,
        repeat: -1,
        stagger: {
          each: 1,
          repeat: -1,
        },
        ease: 'power1.out',
      });

      // Button glow pulse
      gsap.to('.cta-primary-btn', {
        boxShadow: '0 0 40px rgba(34, 211, 238, 0.5), 0 0 80px rgba(34, 211, 238, 0.2)',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Floating particles
      gsap.utils.toArray('.cta-particle').forEach((particle) => {
        gsap.to(particle as Element, {
          y: 'random(-30, 30)',
          x: 'random(-20, 20)',
          duration: 'random(3, 5)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    },
    { scope: sectionRef, dependencies: [particles] }
  );

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative min-h-screen py-32 px-4 flex items-center overflow-hidden"
      style={{ background: 'var(--wellfi-slate-900)' }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-mesh-animated" />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-gradient-radial opacity-50" />

      {/* EM Signal waves */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="cta-wave absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: `${200 + i * 150}px`,
              height: `${200 + i * 150}px`,
              border: '1px solid var(--wellfi-cyan)',
              opacity: 0.2 - i * 0.03,
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="cta-particle absolute rounded-full"
            style={{
              width: `${p.width}px`,
              height: `${p.height}px`,
              background: p.background,
              left: `${p.left}%`,
              top: `${p.top}%`,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto w-full relative z-10">
        <div className="cta-content text-center">
          {/* Badge */}
          <div className="cta-badge mb-8">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-[var(--wellfi-cyan)]/30">
              <Sparkles className="w-4 h-4 text-[var(--wellfi-cyan)]" />
              <span className="text-sm text-[var(--wellfi-white)]">Ready to Go Wireless?</span>
            </span>
          </div>

          {/* Logo */}
          <div className="cta-logo mb-10">
            <Image
              src="/WellFi_Logo_V3.png"
              alt="WellFi"
              width={400}
              height={120}
              className="mx-auto drop-shadow-2xl"
              priority
            />
          </div>

          {/* Headline */}
          <h2 className="cta-headline display-heading text-4xl md:text-5xl lg:text-7xl mb-8">
            <span className="text-gradient text-glow">Become Wireless.</span>
          </h2>

          {/* Description */}
          <div className="cta-description mb-12 max-w-2xl mx-auto">
            <p className="text-lg md:text-xl text-[var(--wellfi-white)]/70 leading-relaxed">
              Real-time downhole monitoring.{' '}
              <span className="text-[var(--wellfi-cyan)]">Through steel casing.</span>
              <br className="hidden md:block" />
              5+ year battery life.{' '}
              <span className="text-[var(--wellfi-cyan)]">SCADA-ready.</span>
            </p>
          </div>

          {/* Feature highlights */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            {['No Cables', 'No Workovers', 'No Compromises'].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--wellfi-cyan)]" />
                <span className="text-sm text-[var(--wellfi-white)]/80">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="cta-buttons flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <a
              href="mailto:info@mpsgroup.ca?subject=WellFi%20Inquiry"
              className="cta-primary-btn w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--wellfi-cyan)] to-[var(--wellfi-teal)] text-[var(--wellfi-slate)] font-semibold text-lg transition-all hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              <span>Get in Touch</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <a
              href="/documents/wellfi-tech-sheet.pdf"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-[var(--wellfi-cyan)] text-[var(--wellfi-cyan)] font-semibold text-lg hover:bg-[var(--wellfi-cyan)]/10 transition-all hover:scale-105"
              download
            >
              <Download className="w-5 h-5" />
              <span>Download Tech Sheet</span>
            </a>
          </div>

          {/* Footer */}
          <div className="cta-footer pt-10 border-t border-[var(--wellfi-white)]/10">
            <p className="text-sm text-[var(--wellfi-white)]/40 mb-4">
              A product by
            </p>
            <a
              href="https://mpsgroup.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[var(--wellfi-white)]/60 hover:text-[var(--wellfi-cyan)] transition-colors group"
            >
              <span className="text-lg font-medium">MPS Group</span>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </a>

            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[var(--wellfi-white)]/30">
              <span>© {new Date().getFullYear()} MPS Group</span>
              <span className="w-1 h-1 rounded-full bg-[var(--wellfi-white)]/30" />
              <span>All rights reserved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade to show it's the end */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--wellfi-navy)] to-transparent pointer-events-none" />
    </section>
  );
}
