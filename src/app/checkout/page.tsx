import type { Metadata } from 'next';
import { SubPageShell } from '@/components/home/SubPage';
import Checkout from '@/components/shop/Checkout';

export const metadata: Metadata = { title: 'Finalizar compra', robots: { index: false, follow: false } };

export default function Page() {
  return (
    <SubPageShell>
      <section className="field-tint px-4 md:px-6 pt-28 md:pt-36 pb-20 md:pb-28 min-h-[80svh]">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12] mb-10">Finalizar compra</h1>
          <Checkout />
        </div>
      </section>
    </SubPageShell>
  );
}
