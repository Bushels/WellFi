'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * CuriosityHintSection
 *
 * Interactive curiosity beat. The visitor's cursor (or touch) acts as a candle —
 * small cyan illumination follows their pointer. The dark formation glimpses fragments
 * around their cursor, hinting at what's there but never fully revealing.
 *
 * Voice rules apply: no personal pronouns, max brevity, ambiguity > clarity.
 * Hint text is deliberately fragmentary — leaves visitors with more questions than answers.
 *
 * On mobile (touch): touch-and-hold reveals the area under the touch point.
 * Reduced motion: glow follows pointer but without animated reveal.
 */
export default function CuriosityHintSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const fragmentRef = useRef<HTMLParagraphElement>(null);
  const hintTextRef = useRef<HTMLParagraphElement>(null);
  const promptRef = useRef<HTMLParagraphElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  // Track pointer movement on the stage — translate cursor position into glow position
  useEffect(() => {
    const stage = stageRef.current;
    const glow = glowRef.current;
    if (!stage || !glow) return undefined;

    let frame = 0;
    let pendingX = 0;
    let pendingY = 0;
    let active = false;

    const updateGlow = () => {
      if (active) {
        glow.style.transform = `translate(${pendingX}px, ${pendingY}px)`;
      }
      frame = 0;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      pendingX = event.clientX - rect.left;
      pendingY = event.clientY - rect.top;
      active = true;
      glow.style.opacity = '1';

      if (!hasInteracted) setHasInteracted(true);

      if (frame === 0) {
        frame = requestAnimationFrame(updateGlow);
      }
    };

    const handlePointerLeave = () => {
      active = false;
      glow.style.opacity = '0';
    };

    stage.addEventListener('pointermove', handlePointerMove);
    stage.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      stage.removeEventListener('pointermove', handlePointerMove);
      stage.removeEventListener('pointerleave', handlePointerLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [hasInteracted]);

  // Reveal hint fragment after first interaction
  useGSAP(
    () => {
      if (!hasInteracted || prefersReducedMotion) return;
      const targets = [fragmentRef.current, hintTextRef.current].filter(Boolean);
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.45, ease: 'power2.out', delay: 0.4 },
      );
      // Fade out the prompt once they've discovered the interaction
      if (promptRef.current) {
        gsap.to(promptRef.current, { autoAlpha: 0, duration: 0.5, ease: 'power2.out' });
      }
    },
    { scope: sectionRef, dependencies: [hasInteracted, prefersReducedMotion] },
  );

  return (
    <section
      ref={sectionRef}
      id="hint"
      aria-labelledby="hint-title"
      className="relative isolate overflow-hidden bg-[#020408] py-[clamp(5rem,12vh,9rem)]"
    >
      <h2 id="hint-title" className="sr-only">
        A glimpse — interactive
      </h2>

      <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-8 px-6">
        {/* Interactive stage — cursor-aware cyan illumination */}
        <div
          ref={stageRef}
          role="presentation"
          className="relative aspect-[4/3] w-full max-w-[48rem] cursor-none overflow-hidden rounded-lg"
          style={{
            background: '#020408',
            touchAction: 'none',
          }}
        >
          {/* Background image, very dim */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/wellfi/hero-v2-portrait.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.32) saturate(1.1)',
            }}
          />

          {/* Heavy darkening layer that the candle "burns through" */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/72"
          />

          {/* The candle — cursor-following cyan glow that locally lifts the dark layer */}
          <div
            ref={glowRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-[20rem] w-[20rem] rounded-full opacity-0 mix-blend-screen transition-opacity duration-300"
            style={{
              marginLeft: '-10rem',
              marginTop: '-10rem',
              background:
                'radial-gradient(circle, rgba(252,241,233,0.55) 0%, rgba(239,68,68,0.28) 30%, rgba(220,38,38,0.06) 60%, rgba(2,4,8,0) 78%)',
            }}
          />

          {/* Prompt text — visible until first interaction */}
          <p
            ref={promptRef}
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(0.95rem,1.6vw,1.2rem)] font-medium uppercase tracking-[0.18em] text-[#9bb5c7]"
          >
            Move closer
          </p>
        </div>

        {/* Hint text — appears after first interaction */}
        <div className="flex flex-col items-center gap-4 text-center">
          <p
            ref={fragmentRef}
            className="invisible max-w-[40ch] text-[clamp(1.4rem,2.6vw,2rem)] font-semibold leading-snug tracking-[-0.02em] text-[#f5fbff]"
            style={{
              textShadow: '0 0 40px rgba(239, 68, 68, 0.16)',
            }}
          >
            A faint signal in deep formation.
          </p>

          <p
            ref={hintTextRef}
            className="invisible max-w-[36ch] text-[clamp(0.95rem,1.6vw,1.15rem)] font-medium italic leading-relaxed tracking-[-0.01em] text-[#9bb5c7]"
          >
            More soon.
          </p>
        </div>
      </div>
    </section>
  );
}
