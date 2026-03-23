import Link from 'next/link';
import { calculator as calculatorCopy } from '@/lib/content';
import { spacing } from '@/lib/design-tokens';

export default function CalculatorTeaserSection() {
  return (
    <section
      id="calculator"
      className="relative overflow-hidden bg-section-alt"
      style={{ padding: `${spacing.sectionY} ${spacing.containerX}` }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_78%_12%,rgba(217,119,6,0.08),transparent_22%),linear-gradient(180deg,rgba(4,10,18,0.9)_0%,rgba(10,14,26,1)_100%)]"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-8 xl:grid-cols-[0.85fr_1fr] xl:items-start">
          <div className="max-w-xl">
            <p className="label-text mb-4">{calculatorCopy.teaserEyebrow}</p>
            <h2 className="display-heading text-[clamp(2.2rem,5vw,4.1rem)] text-text-primary">
              {calculatorCopy.teaserTitle}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-8 text-[#c7d6e2]">
              {calculatorCopy.teaserDescription}
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {calculatorCopy.teaserChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-[#dce8f1]"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-3">
              <p className="rounded-[1.15rem] border border-white/8 bg-white/4 px-4 py-3 text-sm leading-6 text-[#d1dde8]">
                {calculatorCopy.benchmarkSummary}
              </p>
              <p className="rounded-[1.15rem] border border-white/8 bg-white/4 px-4 py-3 text-sm leading-6 text-[#d1dde8]">
                {calculatorCopy.contactPrompt}
              </p>
            </div>
          </div>

          <div className="calc-panel calc-panel--accent">
            <p className="label-text mb-3">Run your own numbers</p>
            <h3 className="display-heading text-[clamp(1.8rem,4vw,3rem)] text-[#f7fbff]">
              Keep the screen simple. Let the engineer do the exercise.
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#d6e3ec]">
              The calculator asks for their own netback, drill benchmark, WellFi capital assumption, expected uplift, and PCP run-life improvement. The page shows the value case without publishing our canned assumptions.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {['Payout', 'Capex / incr. bbl/d', 'Program value'].map((item) => (
                <article
                  key={item}
                  className="rounded-[1.15rem] border border-white/8 bg-white/4 p-4"
                >
                  <p className="tech-text text-[0.68rem] uppercase tracking-[0.2em] text-[#88e6f4]">
                    {item}
                  </p>
                  <p className="mt-3 display-heading text-[clamp(1.3rem,3vw,2rem)] text-[#f6fbff]">
                    Your result
                  </p>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    Calculated from the engineer&apos;s own assumptions.
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/calculator" className="btn-primary inline-flex items-center text-sm">
                {calculatorCopy.buttons.openFull}
              </Link>
              <a
                href="mailto:kylegronning@mpsgroup.ca"
                className="btn-secondary inline-flex items-center text-sm"
              >
                {calculatorCopy.buttons.requestQuote}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
