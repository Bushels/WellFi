'use client';

import { type CSSProperties, useEffect, useId, useRef, useState } from 'react';
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
  animateSignal = false,
  interactiveSignal = false,
  wordmarkColor,
  signalColor,
}: WellFiLogoProps) {
  const uid = useId().replace(/:/g, '');
  const wordmarkId = `wf-wordmark-${uid}`;
  const pulseResetRef = useRef<number | null>(null);
  const [signalActive, setSignalActive] = useState(false);

  useEffect(() => {
    return () => {
      if (pulseResetRef.current !== null) {
        window.clearTimeout(pulseResetRef.current);
      }
    };
  }, []);

  const triggerSignalPulse = () => {
    if (!interactiveSignal || typeof window === 'undefined') return;

    if (pulseResetRef.current !== null) {
      window.clearTimeout(pulseResetRef.current);
    }

    setSignalActive(false);

    window.requestAnimationFrame(() => {
      setSignalActive(true);
      pulseResetRef.current = window.setTimeout(() => {
        setSignalActive(false);
        pulseResetRef.current = null;
      }, 1100);
    });
  };

  const logoStyle = {
    '--wellfi-logo-wordmark': wordmarkColor ?? 'currentColor',
    '--wellfi-logo-signal': signalColor ?? wordmarkColor ?? 'currentColor',
  } as CSSProperties;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 820 400"
      className={cn(
        'shrink-0 text-white',
        animateSignal && 'wellfi-logo--animated',
        interactiveSignal && 'wellfi-logo--interactive',
        signalActive && 'wellfi-logo--signal-active',
        className,
      )}
      role="img"
      aria-label="WellFi"
      style={logoStyle}
      onPointerEnter={interactiveSignal ? triggerSignalPulse : undefined}
      onPointerDown={interactiveSignal ? triggerSignalPulse : undefined}
      onFocus={interactiveSignal ? triggerSignalPulse : undefined}
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
      </defs>

      <g fill="var(--wellfi-logo-wordmark, currentColor)">
        <use href={`#${wordmarkId}`} />
        <circle cx="745" cy="139" r="14" />
      </g>

      <g fill="none" stroke="var(--wellfi-logo-signal, currentColor)" strokeLinecap="round">
        <path
          d="M 723 118 A 31 31 0 0 1 767 118"
          strokeWidth="10"
          className="wellfi-logo__arc wellfi-logo__arc--1"
        />
        <path
          d="M 705 99 A 56 56 0 0 1 785 99"
          strokeWidth="10"
          className="wellfi-logo__arc wellfi-logo__arc--2"
        />
        <path
          d="M 688 81 A 80 80 0 0 1 802 81"
          strokeWidth="10"
          className="wellfi-logo__arc wellfi-logo__arc--3"
        />
      </g>
    </svg>
  );
}
