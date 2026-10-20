'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Package } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { crm } from '@/components/portal/crmApi';
import { EmptyState, Page, Panel, Skeleton } from '@/components/portal/ui';
import type { ShopProduct } from '@/lib/shop';
import { cn } from '@/lib/utils';

function Row({ p, token, onSaved }: { p: ShopProduct; token?: string; onSaved: () => void }) {
  const [price, setPrice] = useState(p.priceEur === null ? '' : String(p.priceEur).replace('.', ','));
  const [reserve, setReserve] = useState(p.reservationEur ? String(p.reservationEur).replace('.', ',') : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = p.priceEur === null ? '' : String(p.priceEur).replace('.', ',');

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true);
    setError(null);
    try { await crm(token, `/api/shop/products/${p.id}`, { method: 'PATCH', body }); onSaved(); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar'); }
    finally { setSaving(false); }
  };

  return (
    <li className="py-3.5 flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="min-w-0 flex-1 basis-56">
        <p className={cn('text-sm font-medium', !p.active && 'text-white/45')}>{p.name}</p>
        <p className="text-xs text-white/45 font-mono">{p.slug}</p>
        {error && <p role="alert" className="text-xs text-red-300 mt-1">{error}</p>}
      </div>
      <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); patch({ priceEur: price.trim() === '' ? null : Number(price.replace(',', '.')) }); }}>
        <label className="sr-only" htmlFor={`pr-${p.id}`}>Precio de {p.name}</label>
        <input id={`pr-${p.id}`} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Consultar" className="w-28 min-h-10 rounded-xl bg-white/[0.05] border border-[var(--portal-line-strong)] px-3 text-sm text-right tabular-nums text-white focus:outline-none focus:border-[var(--signal)]" />
        <span className="text-sm text-white/50">€</span>
        <button type="submit" disabled={saving || price === current} className="min-h-10 px-3 rounded-xl text-xs border border-[var(--portal-line-strong)] text-white/75 hover:text-white disabled:opacity-40 cursor-pointer inline-flex items-center gap-1.5">
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />} Guardar
        </button>
      </form>
      <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); patch({ reservationEur: reserve.trim() === '' ? null : Number(reserve.replace(',', '.')) }); }}>
        <label className="text-xs text-white/55" htmlFor={`rs-${p.id}`}>Reserva</label>
        <input id={`rs-${p.id}`} inputMode="decimal" value={reserve} onChange={(e) => setReserve(e.target.value)} placeholder="Sin reserva" className="w-24 min-h-10 rounded-xl bg-white/[0.05] border border-[var(--portal-line-strong)] px-3 text-sm text-right tabular-nums text-white focus:outline-none focus:border-[var(--signal)]" />
        <span className="text-sm text-white/50">€</span>
        <button type="submit" disabled={saving || reserve === (p.reservationEur ? String(p.reservationEur).replace('.', ',') : '')} className="min-h-10 px-3 rounded-xl text-xs border border-[var(--portal-line-strong)] text-white/75 hover:text-white disabled:opacity-40 cursor-pointer">Guardar</button>
      </form>
      <label className="flex items-center gap-2 text-xs text-white/65 cursor-pointer"><input type="checkbox" checked={p.featured} onChange={(e) => patch({ featured: e.target.checked })} /> Destacado</label>
      <label className="flex items-center gap-2 text-xs text-white/65 cursor-pointer"><input type="checkbox" checked={p.active} onChange={(e) => patch({ active: e.target.checked })} /> Visible en la tienda</label>
    </li>
  );
}

export default function ProductsPage() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [products, setProducts] = useState<ShopProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setProducts((await crm<{ products: ShopProduct[] }>(token, '/api/shop/products')).products); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar'); }
  }, [token]);
  useEffect(() => { if (token) load(); }, [token, load]);

  return (
    <Page title="Productos" subtitle="Precios (IVA incluido) y visibilidad de la tienda">
      {error && <p role="alert" className="rounded-xl bg-red-500/15 text-red-300 px-4 py-3 text-sm">{error}</p>}
      <Panel>
        {!products ? <div className="grid gap-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
          : products.length === 0 ? <EmptyState icon={<Package className="w-6 h-6" />} title="Sin productos" />
          : <ul className="divide-y divide-[var(--portal-line)]">{products.map((p) => <Row key={p.id} p={p} token={token} onSaved={load} />)}</ul>}
      </Panel>
      <p className="text-xs text-white/45 px-1">Con reserva, la tienda cobra solo ese importe online (el resto lo acuerda admisiones). Un precio vacío muestra «Solicitar información» en lugar de «Añadir al carrito». Con 0 € la inscripción es gratuita y no pasa por el pago.</p>
    </Page>
  );
}
