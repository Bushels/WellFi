'use client';

import { cn } from '@/lib/utils';

interface WellFiLogoProps {
  className?: string;
  animateSignal?: boolean;
  interactiveSignal?: boolean;
  wordmarkColor?: string;
  signalColor?: string;
}

export default function WellFiLogo({
  className,
}: WellFiLogoProps) {
  return (
    <div
      className={cn(
        'wellfi-logo-container wellfi-logo-animated group/wellfi-logo inline-block relative vertical-align-middle',
        className
      )}
    >
      {/* Load the transparent WebP version of the exact current site logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/wellfi/wellfi_logo_transparent.webp"
        alt="WellFi Logo"
        className="wellfi-logo-img block w-full h-full object-contain pointer-events-none"
      />
      {/* Masked shimmer overlay that sweeps across only the logo shapes on load or hover */}
      <div className="wellfi-logo-shimmer" />

      <style dangerouslySetInnerHTML={{ __html: `
        .wellfi-logo-container {
          position: relative;
          display: inline-block;
          overflow: hidden;
        }

        /* Entrance fade-in and subtle scale-up on load */
        .wellfi-logo-animated {
          opacity: 0;
          transform: scale(0.96);
          animation: wellfi-logo-entrance 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* The shimmer sweep highlight */
        .wellfi-logo-shimmer {
          position: absolute;
          top: 0;
          left: 0;
          width: 200%; /* Wider than container to allow smooth sweep */
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.45) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: translateX(-100%);
          pointer-events: none;
          mix-blend-mode: overlay;
          
          /* Masks the gradient to the exact transparent shape of the logo */
          -webkit-mask-image: url('/wellfi/wellfi_logo_transparent.webp');
          mask-image: url('/wellfi/wellfi_logo_transparent.webp');
          -webkit-mask-size: contain;
          mask-size: contain;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-position: center;
          mask-position: center;
        }

        /* Trigger a single shimmer sweep upon page load (0.8s delay after entrance starts) */
        .wellfi-logo-animated .wellfi-logo-shimmer {
          animation: wellfi-logo-shimmer-sweep-once 1.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          animation-delay: 0.8s;
        }

        /* Trigger repeating shimmer sweeps when hovered or touched */
        .wellfi-logo-container:hover .wellfi-logo-shimmer,
        .wellfi-logo-container:active .wellfi-logo-shimmer {
          animation: wellfi-logo-shimmer-sweep-loop 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }

        @keyframes wellfi-logo-entrance {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes wellfi-logo-shimmer-sweep-once {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(50%);
          }
        }

        @keyframes wellfi-logo-shimmer-sweep-loop {
          0% {
            transform: translateX(-100%);
          }
          70%, 100% {
            transform: translateX(50%);
          }
        }
      ` }} />
    </div>
  );
}

