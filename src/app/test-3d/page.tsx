'use client';

import dynamic from 'next/dynamic';

// Dynamically import with no SSR to avoid hydration issues
const PremiumToolShowcase = dynamic(
  () => import('@/components/three/PremiumToolShowcase'),
  { ssr: false }
);

export default function Test3DPage() {
  return (
    <main className="bg-slate-950">
      <div className="h-screen flex items-center justify-center">
        <h1 className="text-4xl text-white">Scroll down to see the tool</h1>
      </div>
      <PremiumToolShowcase />
      <div className="h-screen flex items-center justify-center">
        <h1 className="text-4xl text-white">End of test</h1>
      </div>
    </main>
  );
}
