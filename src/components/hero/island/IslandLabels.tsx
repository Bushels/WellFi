'use client';

import type { CSSProperties } from 'react';
import { Html } from '@react-three/drei';
import { COLORS } from '@/lib/island/layout';
import type { WellPaths } from '@/lib/island/wellPath';

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

const CHIP_A = { ...chip(COLORS.emGlow), transform: 'translateY(-26px)' };
const CHIP_B = { ...chip(COLORS.signalRed), transform: 'translateY(-26px)' };
const CHIP_SHOE = { ...chip(COLORS.casing), transform: 'translateY(22px)' };

export default function IslandLabels({ paths }: { paths: WellPaths }) {
  return (
    <group>
      {/* Labels are deliberately always-visible (no occlude) — persistent
          engineering callouts per the reference image, not depth-tested HUD. */}
      <Html position={paths.toolA.position} center distanceFactor={14}>
        <div style={CHIP_A}>WellFi A</div>
      </Html>
      <Html position={paths.toolB.position} center distanceFactor={14}>
        <div style={CHIP_B}>WellFi B</div>
      </Html>
      <Html position={paths.shoe} center distanceFactor={14}>
        <div style={CHIP_SHOE}>Casing Shoe</div>
      </Html>
    </group>
  );
}
