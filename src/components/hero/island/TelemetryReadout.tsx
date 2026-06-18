'use client';

import { useEffect, useRef, type CSSProperties, type MutableRefObject } from 'react';

/**
 * Live telemetry the scene clock writes each frame. `channel` highlights the
 * measurement being transmitted during each pulse while the panel stays in the
 * surface receiver zone above the surface casing area. This remains screen-
 * anchored so it is stable in the exported MP4/GIF overlays.
 */
export interface TelemetryState {
  intensity: number; // 0..1 visibility/scale envelope
  channel: number; // -1 = panel only, 0 pressure, 1 temperature, 2 water cut
}

interface Channel {
  label: string;
  value: string;
  unit: string;
}

const CHANNELS: Channel[] = [
  { label: 'PRESSURE', value: '226', unit: 'kPa' },
  { label: 'TEMPERATURE', value: '20', unit: 'C' },
  { label: 'WATER CUT', value: '6', unit: '%' },
];

// Inline style objects (not a CSS-in-JS lib) - same convention as IslandLabels.
const BOX: CSSProperties = {
  position: 'relative',
  minWidth: '204px',
  padding: '9px 10px 10px',
  borderRadius: '8px',
  background: 'rgba(2, 8, 14, 0.82)',
  border: '1px solid rgba(34, 211, 238, 0.55)',
  boxShadow: '0 0 28px rgba(34, 211, 238, 0.34), inset 0 0 14px rgba(34, 211, 238, 0.1)',
  backdropFilter: 'blur(2px)',
  fontFamily: 'var(--font-mono), monospace',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  transformOrigin: 'right top',
  willChange: 'opacity, transform',
  opacity: 0,
};

const HEADER: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  fontSize: '8px',
  fontWeight: 600,
  letterSpacing: '0.17em',
  color: 'rgba(155, 210, 225, 0.85)',
  marginBottom: '6px',
};

const DOT: CSSProperties = {
  width: '5px',
  height: '5px',
  borderRadius: '50%',
  background: '#22D3EE',
  boxShadow: '0 0 7px #22D3EE',
};

const ROW: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'baseline',
  gap: '10px',
  padding: '5px 6px',
  borderRadius: '5px',
  border: '1px solid transparent',
  background: 'rgba(2, 8, 14, 0.32)',
  transition: 'none',
};

const ROW_LABEL: CSSProperties = {
  fontSize: '8.5px',
  fontWeight: 600,
  letterSpacing: '0.12em',
  color: 'rgba(155, 210, 225, 0.78)',
};

const VALUE: CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  lineHeight: 1.05,
  letterSpacing: '0.01em',
  color: '#22D3EE',
};

const UNIT: CSSProperties = {
  fontSize: '8.5px',
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
  compact = false,
}: {
  readoutRef: MutableRefObject<TelemetryState>;
  compact?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const rowEls = useRef<Array<HTMLDivElement | null>>([]);
  const dotEls = useRef<Array<HTMLSpanElement | null>>([]);
  const shownChannel = useRef(-2);
  const flash = useRef(0); // 0..1 arrival pop, set on channel change, decays

  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    const render = (now: number) => {
      const delta = Math.min(0.1, (now - last) / 1000);
      last = now;
      const { intensity, channel } = readoutRef.current;
      const visible = Math.min(1, Math.max(0, intensity));

      if (shownChannel.current !== channel) {
        shownChannel.current = channel;
        flash.current = channel >= 0 ? 1 : 0;
      }
      flash.current = Math.max(0, flash.current - delta / 0.45);

      if (box.current) {
        box.current.style.opacity = visible.toFixed(3);
        const pop = 1 + 0.22 * flash.current;
        const compactScale = compact ? 0.78 : 1;
        box.current.style.transform = `scale(${(((0.86 + 0.14 * visible) * pop) * compactScale).toFixed(3)})`;
        box.current.style.boxShadow =
          flash.current > 0.01
            ? `0 0 ${(28 + 38 * flash.current).toFixed(0)}px rgba(34,211,238,${(0.34 + 0.58 * flash.current).toFixed(2)}), inset 0 0 14px rgba(34,211,238,0.1)`
            : '0 0 28px rgba(34, 211, 238, 0.34), inset 0 0 14px rgba(34, 211, 238, 0.1)';
      }

      rowEls.current.forEach((row, i) => {
        if (!row) return;
        const active = visible > 0.05 && i === channel;
        row.style.opacity = visible > 0.05 ? '1' : '0.72';
        row.style.background = active ? 'rgba(34, 211, 238, 0.16)' : 'rgba(2, 8, 14, 0.32)';
        row.style.borderColor = active ? 'rgba(34, 211, 238, 0.58)' : 'transparent';
      });

      dotEls.current.forEach((dot, i) => {
        if (!dot) return;
        const active = visible > 0.05 && i === channel;
        dot.style.background = active ? '#22D3EE' : 'rgba(155, 210, 225, 0.38)';
        dot.style.boxShadow = active ? `0 0 ${(8 + 14 * flash.current).toFixed(0)}px #22D3EE` : 'none';
      });

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [compact, readoutRef]);

  const slot: CSSProperties = {
    position: 'absolute',
    top: compact ? '118px' : 'clamp(136px, 21vh, 228px)',
    left: compact ? '24px' : 'clamp(500px, 31vw, 640px)',
    pointerEvents: 'none',
    zIndex: 20,
  };

  return (
    <div aria-hidden="true" style={slot}>
      <div ref={box} style={BOX} data-wellfi-export-overlay="telemetry">
        <div style={POINTER} />
        <div style={HEADER}>
          <span>SURFACE RECEIVER</span>
          <span style={{ color: '#EF4444' }}>WellFi</span>
        </div>
        {CHANNELS.map((channel, i) => (
          <div
            key={channel.label}
            ref={(el) => {
              rowEls.current[i] = el;
            }}
            style={ROW}
          >
            <span style={ROW_LABEL}>
              <span
                ref={(el) => {
                  dotEls.current[i] = el;
                }}
                style={{ ...DOT, display: 'inline-block', marginRight: '6px' }}
              />
              {channel.label}
            </span>
            <span style={VALUE}>
              {channel.value}
              <span style={UNIT}>{channel.unit}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
