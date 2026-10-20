'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, ShoppingBag } from 'lucide-react';
import { BookCallButton } from '@/components/home/BookCall';
import { useShopCart } from '@/lib/shopCart';
import { metaTrack } from '@/lib/metaPixel';
import type { ShopProduct } from '@/lib/shop';

/** Botón de compra de un producto según su precio: con precio, gratis o a consultar. */
export default function AddButton({ product, tone = 'blue', block = false }: { product: ShopProduct; tone?: 'blue' | 'ghost'; block?: boolean }) {
  const router = useRouter();
  const { add, has } = useShopCart();
  const cls = `btn ${tone === 'blue' ? 'btn-blue' : 'btn-ghost'} ${block ? 'w-full justify-center' : ''}`;

  if (product.priceEur === null) {
    return (
      <BookCallButton pack={product.name} className={cls}>
        Solicitar información
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </BookCallButton>
    );
  }
  if (has(product.slug)) {
    return (
      <Link href="/checkout" className={cls}>
        <Check className="w-4 h-4" aria-hidden="true" />
        En tu carrito · Ir a pagar
      </Link>
    );
  }
  const free = product.priceEur === 0;
  return (
    <button
      type="button"
      className={cls}
      onClick={() => {
        add(product.slug);
        metaTrack('AddToCart', { content_name: product.name, value: product.priceEur ?? 0, currency: 'EUR' });
        if (free) router.push('/checkout');
      }}
    >
      {free ? 'Inscribirme gratis' : <><ShoppingBag className="w-4 h-4" aria-hidden="true" />Añadir al carrito</>}
      {free && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
    </button>
  );
}
