'use client';

import { Mail } from 'lucide-react';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { footer, specs } from '@/lib/content';
import { animation, spacing } from '@/lib/design-tokens';
import WellFiLogo from '@/components/ui/WellFiLogo';

gsap.registerPlugin(ScrollTrigger);

const featuredSpecs = specs.filter((row) => [
  'Tool OD',
  'Temperature',
  'Pressure',
  'Battery Life',
  'Data Output',
  'Surface Receiver',
].includes(row.parameter));

export default function SpecsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const targets = sectionRef.current.querySelectorAll('.details-copy, .details-spec, .details-cta');
    gsap.fromTo(
      targets,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: animation.entrance.duration,
        ease: animation.entrance.ease,
        stagger: 0.08,
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
      id="details"
      className="relative"
      style={{ padding: `${spacing.sectionY} ${spacing.containerX}` }}
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
        <div className="details-copy max-w-[27rem]">
          <p className="label-text mb-4">Details + contact</p>
          <h2 className="display-heading text-[clamp(2rem,4vw,3.5rem)] text-text-primary">
            Straight-line specs for a <span className="text-gradient">straight-line decision.</span>
          </h2>
          <p className="mt-5 text-base leading-7 text-text-secondary md:text-lg">
            No oversized table, no dashboard theater, and no mystery about field fit. The shortlist below is enough to start the right technical conversation.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {featuredSpecs.map((row) => (
              <div
                key={row.parameter}
                className="details-spec rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-4"
              >
                <p className="label-text mb-2">{row.parameter}</p>
                <p className="tech-text text-sm leading-6 text-[#f2f6fb]">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          id="contact"
          className="details-cta rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,34,0.92)_0%,rgba(24,30,42,0.94)_100%)] p-8 shadow-[0_22px_80px_rgba(0,0,0,0.44)]"
        >
          <h3 className="display-heading text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.02] text-text-primary">
            Start the first <span className="text-gradient">Canadian install.</span>
          </h3>
          <p className="mt-4 max-w-[34rem] text-base leading-7 text-text-secondary">
            Talk directly with MPS Group about candidate wells, changeout timing, and the fastest path to a clean first deployment.
          </p>

          <a
            href={`mailto:${footer.email}`}
            className="btn-primary mt-8 inline-flex items-center gap-2 text-base"
          >
            <Mail size={18} />
            {footer.email}
          </a>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-text-secondary">
              130+ tools installed globally
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-text-secondary">
              Planned PCP changeout installs
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-text-secondary">
              Exclusive Canadian distributor
            </span>
          </div>

          <div className="mt-12 border-t border-white/8 pt-6">
            <WellFiLogo className="h-8 w-auto opacity-55" />
            <div className="mt-4 flex flex-col gap-1 text-sm text-text-secondary">
              <span>{footer.distributor}</span>
              <span>{footer.copyright}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
