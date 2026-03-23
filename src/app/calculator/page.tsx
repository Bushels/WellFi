import type { Metadata } from 'next';
import Link from 'next/link';
import WellFiCalculator from '@/components/calculator/WellFiCalculator';
import { calculator as calculatorCopy } from '@/lib/content';

export const metadata: Metadata = {
  title: 'WellFi Calculator | MPS Group',
  description: calculatorCopy.pageDescription,
};

export default function CalculatorPage() {
  return (
    <main className="bg-gradient-mesh min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,rgba(8,14,25,0.92),rgba(8,14,25,0.78))] px-6 py-8 shadow-[0_35px_100px_rgba(0,0,0,0.35)] sm:px-8 lg:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_83%_18%,rgba(217,119,6,0.12),transparent_24%)]"
          />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href="/" className="calc-segment">
                {calculatorCopy.buttons.backHome}
              </Link>
              <a href="mailto:kylegronning@mpsgroup.ca" className="calc-segment">
                {calculatorCopy.buttons.requestQuote}
              </a>
            </div>

            <div className="mt-10 max-w-4xl">
              <p className="label-text mb-4">{calculatorCopy.pageEyebrow}</p>
              <h1 className="display-heading text-[clamp(2.5rem,6vw,5.4rem)] text-[#f7fbff]">
                {calculatorCopy.pageTitle}
              </h1>
              <p className="mt-5 max-w-3xl text-[1.04rem] leading-8 text-[#c7d6e2]">
                {calculatorCopy.pageDescription}
              </p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-text-secondary">
                {calculatorCopy.pageBody}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <WellFiCalculator />
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          {calculatorCopy.notes.map((note) => (
            <article
              key={note}
              className="rounded-[1.4rem] border border-white/8 bg-white/4 px-5 py-4 text-sm leading-6 text-[#d4dfe9]"
            >
              {note}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
