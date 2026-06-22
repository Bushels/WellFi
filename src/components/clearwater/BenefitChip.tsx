import type { ClearwaterBenefit } from '@/lib/content';

/**
 * One benefit as a glass card. Presentational only — the same card is used in
 * descent mode (parent wraps it in a positioned, ref'd div it animates) and in
 * the static fallback (parent wraps it in an <li>).
 */
export default function BenefitChip({ benefit }: { benefit: ClearwaterBenefit }) {
  return (
    <div
      className="mx-auto w-[min(90vw,30rem)] rounded-xl border border-white/12 bg-[rgba(10,16,22,0.72)] px-5 py-4 text-center backdrop-blur-sm"
      style={{ boxShadow: '0 0 28px -8px rgba(34,211,238,0.35)' }}
    >
      <h3 className="font-heading text-lg font-semibold text-text-primary">{benefit.label}</h3>
      <p className="mt-1 text-sm text-text-secondary">{benefit.detail}</p>
    </div>
  );
}
