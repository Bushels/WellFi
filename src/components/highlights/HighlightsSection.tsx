'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { highlights } from '@/lib/content';
import { animation, spacing } from '@/lib/design-tokens';

gsap.registerPlugin(ScrollTrigger);

export default function HighlightsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const stats = sectionRef.current.querySelectorAll('.proof-stat');
    gsap.fromTo(
      stats,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: animation.entrance.duration,
        ease: animation.entrance.ease,
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 82%',
        },
      },
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="proof"
      className="relative"
      style={{ padding: `${spacing.sectionY} ${spacing.containerX}` }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="label-text mb-4">Proof without clutter</p>
          <h2 className="display-heading text-[clamp(2rem,4vw,3.5rem)] text-text-primary">
            The simplest deployment path should also be the fastest value case.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 border-t border-b border-white/8 py-8 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.label}
              className="proof-stat border-l border-white/8 pl-5 first:border-l-0 first:pl-0 md:first:pl-0"
            >
              <div className="flex items-baseline gap-2">
                <span className="display-heading text-[clamp(1.7rem,4vw,3rem)] leading-none text-text-primary">
                  {item.value}
                </span>
                <span className="tech-text text-sm uppercase tracking-[0.14em] text-em-glow">
                  {item.unit}
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#dce4ee]">
                {item.label}
              </p>
              <p className="mt-3 max-w-[18rem] text-sm leading-6 text-text-secondary">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
