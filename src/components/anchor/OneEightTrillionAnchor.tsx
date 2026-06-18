'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Radio } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/**
 * OneEightTrillionAnchor
 * 
 * Widescreen (21:9) landscape visual display showcasing the downhole lateral wellbore.
 * Utilizes ScrollTrigger to pan the wellbore schematic horizontally on scroll,
 * with layered telemetry HUD labels moving at different speeds to create 3D parallax.
 */
export default function OneEightTrillionAnchor() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 768px)',
          isMobile: '(max-width: 767px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions as {
            isDesktop: boolean;
            reduceMotion: boolean;
          };

          if (reduceMotion) return;

          // Continuous sweep for the telemetry laser scanner line
          gsap.fromTo(
            '.scanner-line',
            { left: '0%' },
            {
              left: '100%',
              duration: 6,
              repeat: -1,
              yoyo: true,
              ease: 'power1.inOut',
            }
          );

          // Scroll-linked timeline for widescreen pan & parallax
          const scrollTl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom', // Start when section enters screen
              end: 'bottom top',   // End when section leaves screen
              scrub: 1.2,          // Smooth scrolling playback
            },
          });

          // Horizontal pan calculations
          const panAmount = isDesktop ? -23 : -14;
          const hudPanAmount = isDesktop ? -11 : -7;

          // Wellbore image horizontal pan (heel to toe direction)
          scrollTl.to(
            imageRef.current,
            {
              xPercent: panAmount,
              ease: 'none',
            },
            0
          );

          // Telemetry HUD overlay moves slower to create 3D parallax depth
          scrollTl.to(
            hudRef.current,
            {
              xPercent: hudPanAmount,
              ease: 'none',
            },
            0
          );

          // Card reveal animation (scale and fade up) as section triggers
          gsap.fromTo(
            cardRef.current,
            {
              scale: 0.95,
              y: 50,
              autoAlpha: 0.6,
            },
            {
              scale: 1,
              y: 0,
              autoAlpha: 1,
              duration: 1.4,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 80%',
                once: true,
              },
            }
          );

          // Caption reveal animation (staggered text reveal)
          gsap.fromTo(
            captionRef.current ? Array.from(captionRef.current.children) : [],
            {
              y: 30,
              autoAlpha: 0,
            },
            {
              y: 0,
              autoAlpha: 1,
              duration: 1.0,
              stagger: 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: captionRef.current,
                start: 'top 85%',
                once: true,
              },
            }
          );
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="anchor"
      aria-labelledby="anchor-title"
      className="relative isolate w-full overflow-hidden bg-navy-void py-24 md:py-36 z-10"
    >
      {/* Top and Bottom Vignettes to blend section cleanly */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-navy-void to-transparent z-30"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-navy-void to-transparent z-30"
        aria-hidden="true"
      />

      {/* Ambient background glow behind the card for visual depth */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[35rem] rounded-full opacity-20 blur-[130px] z-0"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(34,211,238,0.03) 60%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[95vw] xl:max-w-[1400px] mx-auto px-4 md:px-6">
        
        {/* Widescreen Card */}
        <div
          ref={cardRef}
          className="relative w-full aspect-[21/9] md:aspect-[21/9] aspect-[16/9] min-h-[300px] md:min-h-[400px] rounded-2xl md:rounded-3xl border border-cyan-500/20 bg-charcoal/30 overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.06)]"
        >
          {/* Cyan Glow Overlay Backdrop */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/20 via-transparent to-cyan-950/10 pointer-events-none z-10" />

          {/* Technical Corner Brackets */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-cyan-500/40 pointer-events-none z-20" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-cyan-500/40 pointer-events-none z-20" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-cyan-500/40 pointer-events-none z-20" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-cyan-500/40 pointer-events-none z-20" />

          {/* Decorative Technical HUD Overlay Texts */}
          <div className="absolute top-4 left-10 font-mono text-[9px] text-cyan-400/70 tracking-wider pointer-events-none z-20 uppercase">
            SYS.LOC: NW-CLEARWATER-04
          </div>
          <div className="absolute top-4 right-10 font-mono text-[9px] text-cyan-400/70 tracking-wider pointer-events-none z-20 uppercase">
            STATUS: ACTIVE // EM-FREQ: 3.2Hz
          </div>
          <div className="absolute bottom-4 left-10 font-mono text-[9px] text-cyan-400/70 tracking-wider pointer-events-none z-20 uppercase">
            RESOLVING LATERAL SENSOR ARRAY...
          </div>
          <div className="absolute bottom-4 right-10 font-mono text-[9px] text-cyan-400/70 tracking-wider pointer-events-none z-20 uppercase">
            Rx SIGNAL: -84dBm STABLE
          </div>

          {/* Scanning Telemetry Laser Line */}
          <div 
            className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-60 z-20 pointer-events-none glow-cyan shadow-[0_0_15px_rgba(6,182,212,0.8)] scanner-line" 
            aria-hidden="true"
          />

          {/* 1. Underlying wellbore image container (moves faster) */}
          <div
            ref={imageRef}
            className="relative w-[130%] h-full shrink-0 select-none will-change-transform"
          >
            <Image
              src="/wellfi/wellfi_multilateral_cutaway.png"
              alt="WellFi wireless telemetry carrier assembly deployed inside intermediate casing in the horizontal section of an open hole multilateral wellsite"
              fill
              className="object-cover object-left opacity-85 brightness-[0.82] contrast-[1.05]"
              priority
              sizes="130vw"
            />
          </div>

          {/* 2. HUD Parallax overlay container (moves slower, creating 3D depth) */}
          <div
            ref={hudRef}
            className="absolute inset-0 z-25 w-[115%] h-full pointer-events-none select-none will-change-transform"
          >
            {/* HUD Callout 1: Intermediate Casing */}
            <div className="absolute left-[20%] top-[20%] flex flex-col items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] mb-1" />
              <div className="h-10 md:h-16 w-[1px] bg-gradient-to-b from-cyan-400/40 to-transparent ml-[3px]" />
              
              <div className="bg-slate-950/80 border border-cyan-500/20 backdrop-blur-md rounded-lg p-2.5 w-44 md:w-52 shadow-lg mt-1">
                <div className="font-mono text-[9px] text-cyan-400 tracking-wider uppercase">NODE 00 // VERTICAL</div>
                <div className="text-[11px] font-bold text-text-primary mt-0.5">7&quot; Intermediate Casing</div>
                <div className="text-[10px] text-text-secondary font-mono mt-1">
                  OD: 7.000 inches<br />
                  Secures build section borehole
                </div>
              </div>
            </div>

            {/* HUD Callout 2: WellFi Telemetry Gauge */}
            <div className="absolute left-[48%] bottom-[25%] flex flex-col items-start">
              <div className="bg-slate-950/80 border border-cyan-500/25 backdrop-blur-md rounded-lg p-2.5 w-44 md:w-52 shadow-lg mb-1">
                <div className="font-mono text-[9px] text-cyan-400 tracking-wider uppercase">NODE 01 // TELEMETRY</div>
                <div className="text-[11px] font-bold text-text-primary mt-0.5">WellFi Telemetry Carrier</div>
                <div className="text-[10px] text-text-secondary font-mono mt-1">
                  3-1/2&quot; EUE carrier assembly<br />
                  Fiberglass isolation collar
                </div>
              </div>

              <div className="h-10 md:h-16 w-[1px] bg-gradient-to-t from-cyan-400/40 to-transparent ml-[3px]" />
              <div className="relative mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 relative z-10 shadow-[0_0_8px_rgba(6,182,212,1)]" />
              </div>
            </div>

            {/* HUD Callout 3: Multilateral Open Hole */}
            <div className="absolute left-[78%] top-[25%] flex flex-col items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] mb-1" />
              <div className="h-10 md:h-16 w-[1px] bg-gradient-to-b from-cyan-400/40 to-transparent ml-[3px]" />

              <div className="bg-slate-950/80 border border-cyan-500/20 backdrop-blur-md rounded-lg p-2.5 w-44 md:w-52 shadow-lg mt-1">
                <div className="font-mono text-[9px] text-cyan-400 tracking-wider uppercase">NODE 02 // JUNCTION</div>
                <div className="text-[11px] font-bold text-text-primary mt-0.5">Open-Hole Laterals</div>
                <div className="text-[10px] text-text-secondary font-mono mt-1">
                  Multilateral fan layout<br />
                  Maximizes reservoir contact
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Elegant Asymmetrical Caption Block */}
        <div
          ref={captionRef}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mt-12 w-full"
        >
          {/* Left Column: Title and Pulse fact */}
          <div className="md:col-span-4 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-cyan-400 uppercase tracking-[0.25em]">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
              Real-Time Downhole View
            </div>
            
            <h2
              id="anchor-title"
              className="text-2xl md:text-3xl lg:text-[2.25rem] font-heading font-extrabold text-text-primary leading-[1.15] mt-3 tracking-tight"
            >
              Casing Multilateral Wellbores
            </h2>

            <div className="inline-flex items-center gap-2 mt-5 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              CASING SEGMENT COMPLETED
            </div>
          </div>

          {/* Right Column: Narrative and Spec sheet */}
          <div className="md:col-span-8 flex flex-col justify-between">
            <p className="font-body text-sm md:text-base leading-relaxed text-text-secondary">
              To unlock the vast bitumen deposits locked within the Clearwater and Bluesky formations of Western Canada—holding a staggering 1.8 trillion barrels of oil in place—operators rely on horizontal lateral drilling. In open-hole multilateral designs, a single vertical wellbore is cased with 7&quot; steel intermediate casing to secure the borehole. Below this casing point, multiple horizontal open-hole laterals branch out into the reservoir sand. WellFi is placed directly inside the cutaway of this intermediate casing string to deliver real-time wireless pressure and temperature telemetry from the downhole junction back to the surface, completely bypassing the failure risks of clamped cables in complex multilateral wells.
            </p>

            {/* Spec Sheet Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border-subtle">
              <div>
                <span className="block text-[10px] text-text-secondary font-mono tracking-widest uppercase">Formation</span>
                <span className="block text-text-primary font-mono text-xs md:text-sm mt-1 font-semibold">Clearwater / Bluesky</span>
              </div>
              <div>
                <span className="block text-[10px] text-text-secondary font-mono tracking-widest uppercase">Lateral Length</span>
                <span className="block text-text-primary font-mono text-xs md:text-sm mt-1 font-semibold">1,800m – 3,200m</span>
              </div>
              <div>
                <span className="block text-[10px] text-text-secondary font-mono tracking-widest uppercase">Casing Program</span>
                <span className="block text-text-primary font-mono text-xs md:text-sm mt-1 font-semibold">7&quot; Intermediate Steel</span>
              </div>
              <div>
                <span className="block text-[10px] text-text-secondary font-mono tracking-widest uppercase">Drift Diameter</span>
                <span className="block text-text-primary font-mono text-xs md:text-sm mt-1 font-semibold">6.25&quot; ID Casing</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
