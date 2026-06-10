// Dependency-free GPU tier heuristic (spec §9 explicitly rejects drei's
// useDetectGPU — it fetches an external benchmark list at runtime, wrong
// for a static-export landing page).

export type GpuTier = 'high' | 'low';

const WEAK_GPU = /Mali|Adreno [1-5]\d\d|PowerVR|Intel\(R\) (U?HD|HD) Graphics [2-6]\d{3}/i;

export function tierFromSignals(s: {
  coarsePointer: boolean;
  dpr: number;
  renderer: string;
}): GpuTier {
  if (s.coarsePointer) return 'low';
  if (WEAK_GPU.test(s.renderer)) return 'low';
  return 'high';
}

export function detectTier(): GpuTier {
  if (typeof window === 'undefined') return 'low';
  let renderer = '';
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (gl) {
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      if (info) {
        renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch {
    // renderer stays '' — heuristic falls through on pointer type alone
  }
  return tierFromSignals({
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    dpr: window.devicePixelRatio ?? 1,
    renderer,
  });
}
