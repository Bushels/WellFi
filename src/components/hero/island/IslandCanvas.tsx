'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { detectTier, type GpuTier } from '@/lib/island/quality';
import IslandScene from './IslandScene';

interface IslandCanvasProps {
  reducedMotion: boolean;
  compact: boolean;
  onReady: () => void;
}

export default function IslandCanvas({ reducedMotion, compact, onReady }: IslandCanvasProps) {
  const container = useRef<HTMLDivElement>(null);
  // null until client-mounted — the post-mount gate is load-bearing: it keeps
  // the Canvas subtree out of the static-export prerender entirely.
  const [tier, setTier] = useState<GpuTier | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // detectTier() is browser-only; the effect gate is load-bearing for SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTier(detectTier());
  }, []);

  // Pause the render loop when the hero scrolls out of view.
  useEffect(() => {
    if (!container.current) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.02,
    });
    io.observe(container.current);
    return () => io.disconnect();
  }, [tier]);

  // Lazy-mounted canvases sometimes miss the first ResizeObserver tick.
  useEffect(() => {
    if (tier === null) return;
    const id = setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    return () => clearTimeout(id);
  }, [tier]);

  if (tier === null) return <div ref={container} className="absolute inset-0" />;

  return (
    <div ref={container} className="absolute inset-0">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={onReady}
      >
        <IslandScene tier={tier} reducedMotion={reducedMotion} compact={compact} />
      </Canvas>
    </div>
  );
}
