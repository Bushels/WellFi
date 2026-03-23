import type { Metadata } from 'next';
import Link from 'next/link';
import QuickCalculator from '@/components/calculator/QuickCalculator';

export const metadata: Metadata = {
  title: 'WellFi Calculator | MPS Group',
  description: 'Check your well economics against WellFi. One well, your numbers, instant results.',
};

export default function CalculatorPage() {
  return (
    <main className="bg-gradient-mesh min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header — compact */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link href="/" className="calc-segment">
            Back to Home
          </Link>
          <a href="mailto:kylegronning@mpsgroup.ca" className="calc-segment">
            Request a Quote
          </a>
        </div>

        <div className="mb-8">
          <p className="label-text mb-3">Retrofit economics</p>
          <h1 className="display-heading text-[clamp(1.8rem,4vw,3rem)] text-text-primary">
            Check Your Well Economics
            <span className="text-gradient"> Against WellFi.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#7a919e]">
            Enter one well you know. Results based on all current data from WellFi deployments.
          </p>
        </div>

        <QuickCalculator />
      </div>
    </main>
  );
}
