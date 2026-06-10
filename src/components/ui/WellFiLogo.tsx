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
    <img
      src="/wellfi/wellfi_logo_cropped.jpg"
      alt="WellFi Logo"
      className={cn('object-contain', className)}
    />
  );
}
