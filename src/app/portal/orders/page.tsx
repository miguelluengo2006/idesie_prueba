'use client';

import { useCallback, useEffect, useState } from 'react';
import { Receipt } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { crm } from '@/components/portal/crmApi';
import { EmptyState, Page, Panel, Skeleton } from '@/components/portal/ui';
import { ORDER_STATUS_LABEL, formatEur, toCents, type OrderStatus } from '@/lib/shop';
import { cn } from '@/lib/utils';

interface Order {
  id: string; number: string; status: OrderStatus; createdAt: string; paidAt: string | null;
  buyer: { name: string; email: string; phone: string | null };
  subtotalEur: number; discountEur: number; totalEur: number; couponCode: string | null;
  providerRef: string | null; providerStatus: string | null; notes: string | null;
  items: { name: string; priceEur: number }[];
}

const STATUS_CLS: Record<OrderStatus, string> = {
  pending: 'text-amber-300 bg-amber-400/10',
  paid: 'text-emerald-300 bg-emerald-400/10',
  failed: 'text-red-300 bg-red-400/10',
  cancelled: 'text-white/50 bg-white/[0.06]',
  refunded: 'text-sky-300 bg-sky-400/10',
};
const FILTERS: { id: OrderStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' }, { id: 'paid', label: 'Pagados' }, { id: 'pending', label: 'Pendientes' }, { id: 'failed', label: 'Fallidos' }, { id: 'cancelled', label: 'Cancelados' }, { id: 'refunded', label: 'Reembolsados' },
];
const eur = (n: number) => formatEur(toCents(n));

export default function OrdersPage() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await crm<{ orders: Order[] }>(token, '/api/shop/orders');
      setOrders(data.orders);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar');
    }
  }, [token]);
  useEffect(() => { if (token) load(); }, [token, load]);

  const act = async (o: Order, action: 'mark_paid' | 'cancel' | 'refund', confirm: string) => {
    if (!window.confirm(confirm)) return;
    setBusy(o.id);
    try { await crm(token, `/api/shop/orders/${o.id}`, { method: 'PATCH', body: { action } }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo completar'); }
    finally { setBusy(null); }
  };

  const shown = (orders || []).filter((o) => filter === 'all' || o.status === filter);
  const paid = (orders || []).filter((o) => o.status === 'paid');
  const revenue = paid.reduce((s, o) => s + o.totalEur, 0);
  const btn = 'min-h-9 px-3 rounded-lg text-xs border border-[var(--portal-line-strong)] text-white/75 hover:text-white hover:bg-white/[0.06] disabled:opacity-50 cursor-pointer';

  return (
    <Page title="Pedidos" subtitle={orders ? `${paid.length} pagados · ${eur(revenue)} cobrados` : undefined}>
      {error && <p role="alert" className="rounded-xl bg-red-500/15 text-red-300 px-4 py-3 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filtrar por estado">
        {FILTERS.map((f) => (
          <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)} className={cn('min-h-9 px-3.5 rounded-full text-xs font-medium cursor-pointer transition-colors', filter === f.id ? 'bg-[var(--signal)] text-black' : 'bg-white/[0.06] text-white/65 hover:text-white')}>
            {f.label}
          </button>
        ))}
      </div>
      <Panel>
        {!orders ? (
          <div className="grid gap-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
        ) : shown.length === 0 ? (
          <EmptyState icon={<Receipt className="w-6 h-6" />} title="Sin pedidos" text="Cuando alguien pase por la tienda, el pedido aparecerá aquí con su estado de pago." />
        ) : (
          <ul className="divide-y divide-[var(--portal-line)]">
            {shown.map((o) => (
              <li key={o.id} className="py-3">
                <button onClick={() => setOpen(open === o.id ? null : o.id)} aria-expanded={open === o.id} className="w-full text-left flex flex-wrap items-center gap-x-4 gap-y-1.5 cursor-pointer">
                  <span className="font-mono text-sm font-semibold w-28">{o.number}</span>
                  <span className="min-w-0 flex-1 basis-48">
                    <span className="block text-sm truncate">{o.buyer.name}</span>
                    <span className="block text-xs text-white/50 truncate">{o.items.map((i) => i.name).join(' · ')}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{o.totalEur === 0 ? 'Gratis' : eur(o.totalEur)}</span>
                  <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', STATUS_CLS[o.status])}>{ORDER_STATUS_LABEL[o.status]}</span>
                  <span className="text-xs text-white/45 w-24 text-right">{new Date(o.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                </button>
                {open === o.id && (
                  <div className="mt-3 rounded-2xl bg-white/[0.03] border border-[var(--portal-line)] p-4 grid gap-3 text-sm">
                    <div className="grid sm:grid-cols-2 gap-3 text-white/70">
                      <div>
                        <p><a href={`mailto:${o.buyer.email}`} className="underline">{o.buyer.email}</a></p>
                        {o.buyer.phone && <p>{o.buyer.phone}</p>}
                        <p className="text-xs text-white/45 mt-1">Creado {new Date(o.createdAt).toLocaleString('es-ES')}{o.paidAt ? ` · pagado ${new Date(o.paidAt).toLocaleString('es-ES')}` : ''}</p>
                      </div>
                      <div className="tabular-nums">
                        {o.items.map((i) => <p key={i.name} className="flex justify-between gap-4"><span>{i.name}</span><span>{i.priceEur === 0 ? 'Gratis' : eur(i.priceEur)}</span></p>)}
                        {o.discountEur > 0 && <p className="flex justify-between gap-4 text-emerald-300"><span>Cupón {o.couponCode}</span><span>−{eur(o.discountEur)}</span></p>}
                      </div>
                    </div>
                    {(o.providerRef || o.providerStatus) && <p className="text-xs text-white/45">Flywire: {o.providerRef || '—'} · {o.providerStatus || 'sin estado'}</p>}
                    {o.notes && <p className="text-xs text-amber-200/80 whitespace-pre-line">{o.notes}</p>}
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'failed', 'cancelled'].includes(o.status) && <button disabled={busy === o.id} className={btn} onClick={() => act(o, 'mark_paid', `¿Confirmas que ${o.number} está pagado? Se avisará al equipo y al comprador.`)}>Marcar como pagado</button>}
                      {['pending', 'failed'].includes(o.status) && <button disabled={busy === o.id} className={btn} onClick={() => act(o, 'cancel', `¿Cancelar el pedido ${o.number}?`)}>Cancelar</button>}
                      {o.status === 'paid' && <button disabled={busy === o.id} className={btn} onClick={() => act(o, 'refund', `¿Marcar ${o.number} como reembolsado? El dinero se devuelve desde Flywire.`)}>Marcar reembolsado</button>}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </Page>
  );
}
