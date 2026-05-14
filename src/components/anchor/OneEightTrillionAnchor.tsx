'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * OneEightTrillionAnchor
 *
 * Recognition section for visitors arriving from the LinkedIn campaign.
 * Mirrors the locked Post 01 caption ("1.8 trillion barrels locked in place / Waiting / Seeing is Believing")
 * structurally so the LinkedIn → site handshake feels deliberate.
 *
 * Design notes:
 * - V2 portrait image as faint blurred background — suggests the formation without competing with text
 * - Three lines of caption use <p> elements (not headings) — they're decorative flourishes mirroring a poem,
 *   not document structure. The page's <h1> is "Know the Unknown" in HeroSection.
 * - "Waiting" gets the strongest visual emphasis; the candle motif visually pulses underneath if motion enabled
 * - No CTA, no link — this section is intentionally a moment of recognition, not a conversion point
 */
export default function OneEightTrillionAnchor() {
  const sectionRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
  const line3Ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      const lines = [line1Ref.current, line2Ref.current, line3Ref.current].filter(Boolean);
      gsap.set(lines, { autoAlpha: 0, y: 16 });

      gsap.to(lines, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.45,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="anchor"
      aria-labelledby="anchor-line-2"
      className="relative isolate overflow-hidden bg-[#020408] py-[clamp(6rem,16vh,12rem)]"
    >
      {/* Faint blurred background — suggests the formation, doesn't compete */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: 'url(/wellfi/hero-v2-portrait.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.55)',
          transform: 'scale(1.04)',
        }}
      />

      {/* Subtle cyan glow underneath "Waiting" */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
        style={{
          background:
            'radial-gradient(circle, rgba(79,183,199,0.35) 0%, rgba(79,183,199,0.08) 40%, rgba(2,4,8,0) 70%)',
        }}
      />

      {/* Bottom + top vignettes for clean separation from neighbors */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[18%] bg-[linear-gradient(180deg,rgba(2,4,8,0.92)_0%,rgba(2,4,8,0)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] bg-[linear-gradient(180deg,rgba(2,4,8,0)_0%,rgba(2,4,8,0.92)_100%)]"
      />

      <div className="relative z-10 mx-auto flex max-w-[42rem] flex-col items-center gap-[clamp(2rem,4vh,3.5rem)] px-6 text-center">
        <p
          ref={line1Ref}
          className="text-[clamp(1.4rem,3.2vw,2.4rem)] font-medium leading-snug tracking-[-0.02em] text-[#c9d7e2]"
        >
          1.8 trillion barrels locked in place
        </p>

        <p
          ref={line2Ref}
          id="anchor-line-2"
          className="text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#f5fbff]"
          style={{
            textShadow:
              '0 0 60px rgba(120, 244, 255, 0.18), 0 0 24px rgba(120, 244, 255, 0.12)',
          }}
        >
          Waiting
        </p>

        <p
          ref={line3Ref}
          className="text-[clamp(1.2rem,2.6vw,2rem)] font-medium italic leading-snug tracking-[-0.01em] text-[#9bb5c7]"
        >
          Seeing is Believing
        </p>
      </div>
    </section>
  );
}
