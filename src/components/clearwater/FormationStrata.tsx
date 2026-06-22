import { STRATA } from '@/lib/clearwater/descent';

/**
 * Stacked column of Clearwater strata as CSS gradients. Fills its parent's
 * height; the parent (a ref'd wrapper in ClearwaterDescent) owns positioning
 * and the scroll-driven translate. Purely decorative.
 */
export default function FormationStrata() {
  return (
    <div aria-hidden="true" className="flex h-full flex-col">
      {STRATA.map((layer) => (
        <div
          key={layer.id}
          className="relative flex-1"
          style={{
            backgroundColor: layer.color,
            backgroundImage: layer.laminated
              ? 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 7px)'
              : undefined,
          }}
        >
          <span className="absolute left-4 top-3 text-[0.6rem] uppercase tracking-[0.12em] text-white/25">
            {layer.label}
          </span>
        </div>
      ))}
    </div>
  );
}
