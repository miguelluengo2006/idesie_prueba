import type { Metadata } from 'next';
import { SubPageShell } from '@/components/home/SubPage';
import OrderStatus from '@/components/shop/OrderStatus';

export const metadata: Metadata = { title: 'Tu pedido', robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <SubPageShell>
      <section className="field-tint px-4 md:px-6 pt-32 md:pt-40 pb-20 md:pb-28 min-h-[80svh]">
        <div className="max-w-6xl mx-auto">
          <OrderStatus token={token} />
        </div>
      </section>
    </SubPageShell>
  );
}
