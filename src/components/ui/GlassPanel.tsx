'use client';

import { cn } from '@/lib/utils';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function GlassPanel({
  children,
  className,
  hover = false,
  glow = false,
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        hover ? 'glass-card' : 'glass-panel',
        glow && 'glow-cyan',
        className,
      )}
    >
      {children}
    </div>
  );
}
