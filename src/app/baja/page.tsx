import type { Metadata } from 'next';
import { Suspense } from 'react';
import BajaClient from './BajaClient';

export const metadata: Metadata = {
  title: 'Darme de baja',
  robots: { index: false, follow: false },
};

export default function BajaPage() {
  return (
    <div className="home-root min-h-screen relative flex items-center justify-center px-4 py-16">
      <main className="relative z-[2] w-full max-w-md rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl p-8 md:p-10 shadow-[0_24px_60px_-34px_rgba(0,40,110,0.55)]">
        <Suspense fallback={null}>
          <BajaClient />
        </Suspense>
      </main>
    </div>
  );
}
