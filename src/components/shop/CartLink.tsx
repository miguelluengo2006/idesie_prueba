'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useShopCart } from '@/lib/shopCart';

/** Bolsa de la cabecera: solo aparece cuando hay algo en el carrito. */
export default function CartLink() {
  const { count } = useShopCart();
  if (count === 0) return null;
  return (
    <Link
      href="/checkout"
      aria-label={`Carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`}
      className="relative inline-flex items-center justify-center w-11 h-11 rounded-full hover:opacity-70 transition-opacity"
    >
      <ShoppingBag className="w-5 h-5" aria-hidden="true" />
      <span className="absolute top-1 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0063e6] text-[#fff] text-[11px] font-bold leading-[18px] text-center tabular-nums">{count}</span>
    </Link>
  );
}
