import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'WellFi Candidate Review | MPS Group',
  description: 'Contact MPS Group to review candidate wells for WellFi deployment fit.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CalculatorPage() {
  return (
    <main className="bg-gradient-mesh min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl flex-col justify-center">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="calc-segment">
            Back to WellFi
          </Link>
          <a href="mailto:kylegronning@mpsgroup.ca" className="calc-segment">
            Contact MPS Group
          </a>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,34,0.92)_0%,rgba(24,30,42,0.94)_100%)] p-8 shadow-[0_22px_80px_rgba(0,0,0,0.44)] sm:p-10">
          <p className="label-text mb-3">Candidate review</p>
          <h1 className="display-heading text-[clamp(1.8rem,4vw,3rem)] text-text-primary">
            WellFi calculator is parked.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#9fb0bb] md:text-base md:leading-7">
            The public calculator is offline while benchmark assumptions and public claim boundaries are locked. For candidate wells, contact MPS Group directly with the well type, changeout timing, and the pressure data you want to see at surface.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="mailto:kylegronning@mpsgroup.ca" className="btn-primary">
              Start Candidate Review
            </a>
            <Link href="/" className="btn-secondary">
              Return to WellFi
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
