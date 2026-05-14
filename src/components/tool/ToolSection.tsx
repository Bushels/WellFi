'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animation, spacing } from '@/lib/design-tokens';

gsap.registerPlugin(ScrollTrigger);

const installSteps = [
  'Run it on the planned pump changeout.',
  'Clamp it to the string without a dedicated cable-run intervention.',
  'Start reading downhole pressure at surface right away.',
] as const;

export default function ToolSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const targets = sectionRef.current.querySelectorAll('.install-copy, .install-visual, .install-step');
    gsap.fromTo(
      targets,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: animation.entrance.duration,
        ease: animation.entrance.ease,
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 76%',
        },
      },
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="install"
      className="relative"
      style={{ padding: `${spacing.sectionY} ${spacing.containerX}` }}
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <figure className="install-visual relative aspect-[5/4] overflow-hidden rounded-[2.1rem] border border-white/10 bg-[#0d1520] shadow-[0_34px_90px_rgba(0,0,0,0.46)]">
          <Image
            src="/images/wellfi-photo-031.jpg"
            alt="WellFi side-clamp installed beside carbon-steel pipe and fiberglass isolation section"
            fill
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,7,14,0.72)_0%,rgba(2,7,14,0.18)_42%,rgba(2,7,14,0.76)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_26%,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_62%_42%,rgba(34,211,238,0.08),transparent_28%)]" />
          <div className="absolute bottom-5 left-5 right-5 rounded-[1.35rem] border border-white/10 bg-black/28 px-4 py-4 backdrop-blur-md">
            <p className="label-text mb-2">Installed state</p>
            <p className="max-w-md text-sm leading-6 text-text-primary/88">
              Stainless side-clamp, carbon-steel pipe, fiberglass isolation, and a deployment path that stays operationally simple.
            </p>
          </div>
        </figure>

        <div className="install-copy max-w-[30rem]">
          <p className="label-text mb-4">Product / install</p>
          <h2 className="display-heading text-[clamp(2rem,4vw,3.5rem)] text-text-primary">
            Planned changeout install. <span className="text-gradient">Surface pressure data.</span>
          </h2>
          <p className="mt-5 text-base leading-7 text-text-secondary md:text-lg">
            WellFi is valuable because it fits into work that is already happening. Run it on the planned changeout, keep the install path clean, and start tuning with real pressure instead of surface guesswork.
          </p>

          <div className="mt-8 space-y-3 border-t border-white/8 pt-6">
            {installSteps.map((step, index) => (
              <div key={step} className="install-step flex items-start gap-4 border-b border-white/8 pb-3">
                <span className="tech-text mt-0.5 text-sm uppercase tracking-[0.16em] text-em-glow">
                  0{index + 1}
                </span>
                <p className="text-sm leading-6 text-[#d6dde6] md:text-base">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
