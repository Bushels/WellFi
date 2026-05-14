'use client';

import Image from 'next/image';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ToolRevealSection — the close-up.
 *
 * Sits between OneEightTrillionAnchor (the macro fact: "1.8 trillion barrels waiting")
 * and ProofSection (the technical specs). This is where the visitor finally sees
 * the candle up close — the WellFi tool inside production tubing inside the
 * bitumen-saturated formation.
 *
 * Pure visual section. No headline, no copy, no CTA. Image speaks.
 *
 * Animation: slow scroll-triggered fade in, with a faint zoom-out so the image
 * feels like the camera is pulling back to take in the scene. Reduced motion
 * just shows the image plain.
 */
export default function ToolRevealSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      gsap.set(imageRef.current, { autoAlpha: 0, scale: 1.06 });
      gsap.to(imageRef.current, {
        autoAlpha: 1,
        scale: 1,
        duration: 1.4,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          once: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="reveal"
      aria-labelledby="reveal-title"
      className="relative isolate overflow-hidden bg-[#020408] py-[clamp(4rem,10vh,8rem)]"
    >
      <h2 id="reveal-title" className="sr-only">
        The Candle, up close
      </h2>

      {/* Top + bottom vignettes for clean separation from neighboring sections */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[12%] bg-[linear-gradient(180deg,rgba(2,4,8,0.95)_0%,rgba(2,4,8,0)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[12%] bg-[linear-gradient(180deg,rgba(2,4,8,0)_0%,rgba(2,4,8,0.95)_100%)]"
      />

      <div className="relative z-10 mx-auto max-w-[64rem] px-6">
        <div
          ref={imageRef}
          className="invisible aspect-square w-full overflow-hidden rounded-md"
          style={{
            boxShadow:
              '0 24px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(79, 183, 199, 0.08)',
          }}
        >
          <Image
            src="/wellfi/tool-closeup.png"
            alt="A wireless telemetry tool installed inside production tubing in a bitumen-saturated WCSB cold heavy oil reservoir, with a faint cyan glow at the fiberglass collar."
            width={1200}
            height={1200}
            className="block h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
