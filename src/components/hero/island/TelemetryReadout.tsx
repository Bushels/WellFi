'use client';

import { useRef, type CSSProperties, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type * as THREE from 'three';

/**
 * Live telemetry the scene clock writes each frame. `channel` switches only when
 * an uplink reaches surface, so the readout snaps to a new measurement per pulse:
 *   0 = downhole pressure, 1 = temperature, 2 = fluid resistivity → water cut.
 */
export interface TelemetryState {
  intensity: number; // 0..1 visibility/scale envelope
  channel: number; // 0 | 1 | 2  (-1 = nothing arrived yet)
  value: number; // numeric reading for the active channel
}

interface Channel {
  label: string;
  unit: string;
  decimals: number;
  // `approx` prefixes the value with "≈" — used for derived/calibration-dependent
  // figures (water cut) so we never imply false precision to an engineer audience.
  approx?: boolean;
}

// Pulse 3 shows WATER CUT directly (the defensible fluid calc resistivity yields —
// per a completions-engineer review: oil/gas insulate, brine conducts, so resistivity
// is a water-presence sensor → water cut; NOT API/density/flow). The raw Ω·m is left
// off-screen by Kyle's call; "≈" flags that it's a derived, salinity-calibrated value.
const CHANNELS: Channel[] = [
  { label: 'DOWNHOLE PRESSURE', unit: 'kPa', decimals: 0 },
  { label: 'TEMPERATURE', unit: '°C', decimals: 0 },
  { label: 'WATER CUT', unit: '%', decimals: 0, approx: true },
];

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

export default function TelemetryReadout({
  readoutRef,
  anchor,
  compact = false,
}: {
  readoutRef: MutableRefObject<TelemetryState>;
  anchor: THREE.Vector3;
  compact?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const labelEl = useRef<HTMLSpanElement>(null);
  const valueEl = useRef<HTMLSpanElement>(null);
  const unitEl = useRef<HTMLSpanElement>(null);
  const shownChannel = useRef(-2);
  const shownValue = useRef('');
  const flash = useRef(0); // 0..1 "arrival hit" pop, set on channel change, decays

  // Default-priority useFrame — runs after the scene clock (priority -1), so the
  // ref is fresh this frame. Mutate the DOM directly; no per-frame React state.
  useFrame((_, delta) => {
    const { intensity, channel, value } = readoutRef.current;
    const ch = CHANNELS[channel];
    if (!ch) return;

    // Channel switched (only happens when a new uplink ARRIVES at surface) — swap the
    // labels and fire an arrival "hit": a quick scale pop + border flash so the new
    // reading lands with emphasis instead of just appearing.
    if (shownChannel.current !== channel) {
      shownChannel.current = channel;
      flash.current = 1;
      if (labelEl.current) labelEl.current.textContent = ch.label;
      if (unitEl.current) unitEl.current.textContent = ch.unit;
    }
    flash.current = Math.max(0, flash.current - delta / 0.32); // ~0.32s decay

    if (box.current) {
      box.current.style.opacity = intensity.toFixed(3);
      const pop = 1 + 0.16 * flash.current;
      box.current.style.transform = `scale(${((0.82 + 0.18 * intensity) * pop).toFixed(3)})`;
      box.current.style.boxShadow =
        flash.current > 0.01
          ? `0 0 ${(22 + 26 * flash.current).toFixed(0)}px rgba(34,211,238,${(0.28 + 0.5 * flash.current).toFixed(2)}), inset 0 0 12px rgba(34,211,238,0.06)`
          : '0 0 22px rgba(34, 211, 238, 0.28), inset 0 0 12px rgba(34, 211, 238, 0.06)';
    }
    const num = ch.decimals ? value.toFixed(ch.decimals) : Math.round(value).toLocaleString('en-US');
    const formatted = (ch.approx ? '≈ ' : '') + num; // "≈" flags a derived/calibrated figure
    if (valueEl.current && shownValue.current !== formatted) {
      shownValue.current = formatted;
      valueEl.current.textContent = formatted;
    }
  });

  return (
    <Html
      // Desktop: lift above the wellhead. Compact: the anchor is already a tuned
      // in-frame point (wellhead projects off-screen on mobile), so use it directly
      // and scale down a touch so it fits the narrow viewport.
      position={[anchor.x, anchor.y + (compact ? 0 : 1.75), anchor.z]}
      center
      distanceFactor={compact ? 9 : 13}
      zIndexRange={[30, 0]}
    >
      <div ref={box} style={BOX}>
        <div style={LABEL}>
          <span style={DOT} />
          <span ref={labelEl}>DOWNHOLE PRESSURE</span>
        </div>
        <div style={READ}>
          <span ref={valueEl}>0</span>
          <span ref={unitEl} style={UNIT}>
            kPa
          </span>
        </div>
        <div style={POINTER} />
      </div>
    </Html>
  );
}
