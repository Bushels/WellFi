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

export default function IslandLabels({ paths }: { paths: WellPaths }) {
  return (
    <group>
      <Html position={paths.toolA.position} center distanceFactor={14} style={{ transform: 'translateY(-26px)' }}>
        <div style={chip(COLORS.emGlow)}>WellFi A</div>
      </Html>
      <Html position={paths.toolB.position} center distanceFactor={14} style={{ transform: 'translateY(-26px)' }}>
        <div style={chip(COLORS.signalRed)}>WellFi B</div>
      </Html>
      <Html position={paths.shoe} center distanceFactor={14} style={{ transform: 'translateY(22px)' }}>
        <div style={chip('#9bb5c7')}>Casing Shoe</div>
      </Html>
    </group>
  );
}
