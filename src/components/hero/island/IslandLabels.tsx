'use client';

import { useRef, type CSSProperties, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { COLORS } from '@/lib/island/layout';
import type { CycleState } from '@/lib/island/cycle';
import type { WellFiToolPlacement } from '@/lib/island/wellPath';

const chip = (accent: string): CSSProperties => ({
  fontFamily: 'var(--font-mono), monospace',
  fontSize: '11px',
  letterSpacing: '0.08em',
  whiteSpace: 'nowrap',
  padding: '3px 8px',
  borderRadius: '4px',
  border: `1px solid ${accent}55`,
  background: 'rgba(2, 4, 8, 0.72)',
  color: accent,
  pointerEvents: 'none',
});

const TOOL_CHIP = { ...chip(COLORS.signalRed), transform: 'translateY(-42px)' };

function ToolLabel({
  tool,
  cycleRef,
}: {
  tool: WellFiToolPlacement;
  cycleRef: MutableRefObject<CycleState>;
}) {
  const chipRef = useRef<HTMLDivElement>(null);

  useFrame(() => {
    if (!chipRef.current) return;
    chipRef.current.style.opacity = Math.max(0, 1 - cycleRef.current.focus * 1.8).toFixed(3);
  });

  return (
    <Html position={tool.position} center>
      <div ref={chipRef} style={TOOL_CHIP} data-wellfi-export-overlay="wellfi-label">
        {tool.label}
      </div>
    </Html>
  );
}

export default function IslandLabels({
  tools,
  cycleRef,
  compact = false,
}: {
  tools: WellFiToolPlacement[];
  cycleRef: MutableRefObject<CycleState>;
  compact?: boolean;
}) {
  // On mobile (<768px) the copy column spans nearly the full width, so the chips
  // collide with the headline/CTA and read as clutter. Drop them there; desktop keeps
  // the engineering callout. Safe to gate on JS `compact`: labels live inside the
  // client-only canvas, so there's no SSR/hydration markup to mismatch.
  if (compact) return null;
  return (
    <group>
      {/* Labels are deliberately always-visible (no occlude) — product callout,
          not depth-tested HUD. */}
      {tools.map((tool) => (
        <ToolLabel key={tool.id} tool={tool} cycleRef={cycleRef} />
      ))}
    </group>
  );
}
