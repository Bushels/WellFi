'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface WellFiLogoProps {
  className?: string;
}

export default function WellFiLogo({ className }: WellFiLogoProps) {
  const uid = useId().replace(/:/g, '');
  const wordmarkId = `wf-wordmark-${uid}`;
  const clipId = `wf-clip-${uid}`;
  const fillId = `wf-fill-${uid}`;
  const signalId = `wf-signal-${uid}`;
  const glowId = `wf-soft-glow-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 820 400"
      className={cn('shrink-0', className)}
      role="img"
      aria-label="WellFi"
    >
      <defs>
        <path
          id={wordmarkId}
          d="
            M 56.6,139.6 L 96.2,139.6 L 123.9,256.2 L 151.4,139.6 L 191.2,139.6 L 218.7,256.2 L 246.5,139.6 L 285.8,139.6 L 248.0,300.0 L 200.3,300.0 L 171.2,178.1 L 142.4,300.0 L 94.7,300.0 L 56.6,139.6 Z
            M 423.3,239.5 L 423.3,250.5 L 333.4,250.5 Q 334.7,264.0 343.1,270.8 Q 351.5,277.6 366.5,277.6 Q 378.7,277.6 391.4,273.9 Q 404.1,270.3 417.6,263.0 L 417.6,292.7 Q 403.9,297.8 390.3,300.5 Q 376.6,303.1 363.0,303.1 Q 330.3,303.1 312.2,286.5 Q 294.1,269.9 294.1,239.9 Q 294.1,210.5 311.9,193.7 Q 329.7,176.8 360.9,176.8 Q 389.2,176.8 406.2,193.9 Q 423.3,210.9 423.3,239.5 Z M 383.7,226.7 Q 383.7,215.8 377.3,209.1 Q 370.9,202.3 360.6,202.3 Q 349.5,202.3 342.5,208.6 Q 335.5,214.9 333.8,226.7 L 383.7,226.7 Z
            M 452.4,132.8 L 490.8,132.8 L 490.8,300.0 L 452.4,300.0 L 452.4,132.8 Z
            M 527.8,132.8 L 566.2,132.8 L 566.2,300.0 L 527.8,300.0 L 527.8,132.8 Z
            M 604.9,139.6 L 716.5,139.6 L 716.5,170.9 L 646.3,170.9 L 646.3,200.7 L 712.4,200.7 L 712.4,232.0 L 646.3,232.0 L 646.3,300.0 L 604.9,300.0 L 604.9,139.6 Z
            M 726,170 L 764,170 L 764,300 L 726,300 Z"
        />
        <clipPath id={clipId}>
          <use href={`#${wordmarkId}`} />
        </clipPath>
        <linearGradient id={fillId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0B2C58" />
          <stop offset="55%" stopColor="#0E4E8C" />
          <stop offset="100%" stopColor="#18BEE5" />
        </linearGradient>
        <linearGradient id={signalId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7DEEFF" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <use href={`#${wordmarkId}`} fill={`url(#${fillId})`} />

      <g clipPath={`url(#${clipId})`}>
        <g
          stroke={`url(#${signalId})`}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.78"
        >
          <path d="M 82 160 L 113 210" />
          <path d="M 82 160 L 173 176" />
          <path d="M 113 210 L 130 284" />
          <path d="M 130 284 L 173 176" />
          <path d="M 173 176 L 203 214" />
          <path d="M 173 176 L 234 223" />
          <path d="M 203 214 L 234 223" />
          <path d="M 234 223 L 247 286" />
          <path d="M 340 209 L 363 197 L 392 214" />
          <path d="M 340 209 L 344 243" />
          <path d="M 344 243 L 364 262 L 391 245" />
          <path d="M 392 214 L 391 245" />
          <path d="M 468 149 L 480 191 L 472 286" />
          <path d="M 544 150 L 556 198 L 548 286" />
          <path d="M 622 165 L 689 165" />
          <path d="M 622 165 L 650 203 L 650 244" />
          <path d="M 650 203 L 689 203" />
          <path d="M 650 244 L 744 211" />
          <path d="M 744 187 L 744 211 L 744 289" />
        </g>

        <g fill="#A5F3FC" filter={`url(#${glowId})`}>
          <circle cx="82" cy="160" r="5.5" />
          <circle cx="113" cy="210" r="5.5" />
          <circle cx="130" cy="284" r="5.5" />
          <circle cx="173" cy="176" r="5.5" />
          <circle cx="203" cy="214" r="5.5" />
          <circle cx="234" cy="223" r="5.5" />
          <circle cx="247" cy="286" r="5.5" />
          <circle cx="340" cy="209" r="5.5" />
          <circle cx="363" cy="197" r="5.5" />
          <circle cx="392" cy="214" r="5.5" />
          <circle cx="344" cy="243" r="5.5" />
          <circle cx="364" cy="262" r="5.5" />
          <circle cx="391" cy="245" r="5.5" />
          <circle cx="468" cy="149" r="5.5" />
          <circle cx="480" cy="191" r="5.5" />
          <circle cx="472" cy="286" r="5.5" />
          <circle cx="544" cy="150" r="5.5" />
          <circle cx="556" cy="198" r="5.5" />
          <circle cx="548" cy="286" r="5.5" />
          <circle cx="622" cy="165" r="5.5" />
          <circle cx="650" cy="203" r="5.5" />
          <circle cx="650" cy="244" r="5.5" />
          <circle cx="689" cy="165" r="5.5" />
          <circle cx="689" cy="203" r="5.5" />
          <circle cx="744" cy="187" r="5.5" />
          <circle cx="744" cy="211" r="5.5" />
          <circle cx="744" cy="289" r="5.5" />
        </g>
      </g>

      <g fill="none" stroke={`url(#${fillId})`} strokeLinecap="round">
        <circle cx="745" cy="139" r="14" fill={`url(#${fillId})`} stroke="none" />
        <path d="M 723 118 A 31 31 0 0 1 767 118" strokeWidth="10" />
        <path d="M 705 99 A 56 56 0 0 1 785 99" strokeWidth="10" />
        <path d="M 688 81 A 80 80 0 0 1 802 81" strokeWidth="10" opacity="0.95" />
      </g>
    </svg>
  );
}
