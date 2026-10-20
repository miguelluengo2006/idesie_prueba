import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Tile from '@/components/home/Tile';
import AddButton from '@/components/shop/AddButton';
import { priceLabel, reservationLabel, type ShopProduct } from '@/lib/shop';

/** Ficha de producto del catálogo: precio con IVA incluido y botón de compra según el caso. */
export default function ProductCard({ product, delay = 0 }: { product: ShopProduct; delay?: number }) {
  const dark = product.featured;
  const price = priceLabel(product.priceEur);
  const reserve = reservationLabel(product);
  return (
    <Tile delay={delay} className={`flex flex-col p-7 md:p-8 ${dark ? 'bg-[#0a1f44] text-[#fff]' : 'bg-[#fff] text-[#0a1f44]'}`}>
      <p className={`text-xs font-semibold tracking-[0.16em] uppercase ${dark ? 'text-[#7db4ff]' : 'text-[#0052cc]'}`}>{product.category ?? (product.kind === 'master' ? 'Máster' : 'Curso')}</p>
      <h3 className="font-kinetic font-bold text-2xl leading-tight mt-3">
        <Link href={`/tienda/${product.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">{product.name}</Link>
      </h3>
      <p className={`mt-3 leading-relaxed ${dark ? 'text-[#c9d9f0]' : 'text-[#0a1f44]/75'}`}>{product.summary}</p>
      <dl className={`mt-5 grid gap-1.5 text-sm ${dark ? 'text-[#c9d9f0]' : 'text-[#0a1f44]/80'}`}>
        {product.duration && <div className="flex gap-2"><dt className="font-semibold">Duración</dt><dd>{product.duration}</dd></div>}
        {product.modality && <div className="flex gap-2"><dt className="font-semibold">Modalidad</dt><dd>{product.modality}</dd></div>}
        {product.certification && <div className="flex gap-2"><dt className="font-semibold">Titulación</dt><dd>{product.certification}</dd></div>}
      </dl>
      <div className="mt-auto pt-8">
        <p className="flex items-baseline gap-2">
          <span className="font-kinetic font-bold text-3xl tabular-nums">{price}</span>
          {product.priceEur !== null && product.priceEur > 0 && <span className={`text-sm ${dark ? 'text-[#c9d9f0]' : 'text-[#0a1f44]/65'}`}>IVA incluido</span>}
        </p>
        {reserve && <p className={`mt-1.5 text-sm font-semibold ${dark ? 'text-[#9fd8ff]' : 'text-[#0052cc]'}`}>Reserva tu plaza hoy con {reserve}</p>}
        <div className="relative z-10 mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <AddButton product={product} tone="blue" />
          <Link href={`/tienda/${product.slug}`} className={`relative z-10 inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4 ${dark ? 'text-[#fff]' : 'text-[#0a1f44]'}`}>
            Ver detalle <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Tile>
  );
}
