'use client';

import { useState } from 'react';
import ProductCard from '@/components/shop/ProductCard';
import type { ShopProduct } from '@/lib/shop';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'master', label: 'Másteres' },
  { id: 'curso', label: 'Cursos y títulos' },
] as const;

/** Catálogo con filtro por tipo: los másteres primero, los cursos y títulos después. */
export default function Catalog({ products }: { products: ShopProduct[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const shown = products.filter((p) => filter === 'all' || (filter === 'master' ? p.kind === 'master' : p.kind !== 'master'));
  return (
    <div>
      <div role="tablist" aria-label="Tipo de programa" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`min-h-11 px-5 rounded-full text-sm font-semibold cursor-pointer transition-colors ${filter === f.id ? 'bg-[#0a1f44] text-[#fff]' : 'bg-[#fff] text-[#0a1f44] hover:bg-[#dbe8ff]'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <ul className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4" key={filter}>
        {shown.map((p, i) => (
          <li key={p.slug} className="flex"><div className="flex w-full [&>*]:w-full"><ProductCard product={p} delay={i * 0.06} /></div></li>
        ))}
      </ul>
    </div>
  );
}
