'use client';

import { useRef, type CSSProperties, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type * as THREE from 'three';

/** Live telemetry the scene clock writes each frame; read here to drive the DOM. */
export interface PressureState {
  intensity: number; // 0..1 — visibility/scale envelope (0 = hidden)
  kpa: number; // displayed downhole pressure
}

interface PressureReadoutProps {
  pressureRef: MutableRefObject<PressureState>;
  anchor: THREE.Vector3; // wellhead — the box floats above this at surface
}

// Inline style objects (not a CSS-in-JS lib) — same convention as IslandLabels.
const BOX: CSSProperties = {
  position: 'relative',
  padding: '7px 13px 8px',
  borderRadius: '9px',
  background: 'rgba(2, 8, 14, 0.82)',
  border: '1px solid rgba(34, 211, 238, 0.55)',
  boxShadow: '0 0 22px rgba(34, 211, 238, 0.28), inset 0 0 12px rgba(34, 211, 238, 0.06)',
  backdropFilter: 'blur(2px)',
  fontFamily: 'var(--font-mono), monospace',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  transformOrigin: 'center bottom',
  willChange: 'opacity, transform',
  opacity: 0,
};

const LABEL: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '5px',
  fontSize: '8.5px',
  fontWeight: 600,
  letterSpacing: '0.16em',
  color: 'rgba(155, 210, 225, 0.85)',
  marginBottom: '3px',
};

const DOT: CSSProperties = {
  width: '5px',
  height: '5px',
  borderRadius: '50%',
  background: '#22D3EE',
  boxShadow: '0 0 7px #22D3EE',
};

const READ: CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  lineHeight: 1.05,
  letterSpacing: '0.01em',
  color: '#22D3EE',
};

const UNIT: CSSProperties = {
  fontSize: '11px',
  fontWeight: 500,
  marginLeft: '3px',
  color: 'rgba(155, 210, 225, 0.85)',
};

// Downward speech-bubble pointer aimed at the wellhead below.
const POINTER: CSSProperties = {
  position: 'absolute',
  bottom: '-6px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 0,
  height: 0,
  borderLeft: '6px solid transparent',
  borderRight: '6px solid transparent',
  borderTop: '6px solid rgba(34, 211, 238, 0.55)',
};

export default function PressureReadout({ pressureRef, anchor }: PressureReadoutProps) {
  const box = useRef<HTMLDivElement>(null);
  const value = useRef<HTMLSpanElement>(null);
  const lastShown = useRef(-1);

  // Default-priority useFrame (runs after the scene clock at priority -1, so
  // pressureRef is already fresh this frame). Mutate the DOM directly — no React
  // state per frame.
  useFrame(() => {
    const { intensity, kpa } = pressureRef.current;
    if (box.current) {
      box.current.style.opacity = intensity.toFixed(3);
      box.current.style.transform = `scale(${(0.82 + 0.18 * intensity).toFixed(3)})`;
    }
    if (value.current) {
      const rounded = Math.round(kpa);
      if (rounded !== lastShown.current) {
        lastShown.current = rounded;
        value.current.textContent = rounded.toLocaleString('en-US');
      }
    }
  });

  return (
    <Html
      position={[anchor.x, anchor.y + 1.75, anchor.z]}
      center
      distanceFactor={13}
      zIndexRange={[30, 0]}
    >
      <div ref={box} style={BOX}>
        <div style={LABEL}>
          <span style={DOT} />
          DOWNHOLE PRESSURE
        </div>
        <div style={READ}>
          <span ref={value}>0</span>
          <span style={UNIT}>kPa</span>
        </div>
        <div style={POINTER} />
      </div>
    </Html>
  );
}
