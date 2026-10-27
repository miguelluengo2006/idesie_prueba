'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { crm } from '@/components/portal/crmApi';
import { DELIVERY_BADGE } from '@/components/portal/campaignMeta';
import { DELIVERY_LABEL, campaignStats, deliveryState, pct, type DeliveryState, type TrackedSend } from '@/lib/campaignTemplates';

interface Recipient extends TrackedSend {
  id: string;
  email: string;
  name: string | null;
  error: string | null;
  sent_at: string | null;
  open_count: number;
  click_count: number;
  bounce_reason: string | null;
  links: string[];
}

type Filter = 'all' | 'opened' | 'clicked' | 'unopened' | 'problems';

const FILTERS: { id: Filter; label: string; test: (state: DeliveryState) => boolean }[] = [
  { id: 'all', label: 'Todos', test: () => true },
  { id: 'opened', label: 'Abrieron', test: (s) => s === 'opened' || s === 'clicked' },
  { id: 'clicked', label: 'Hicieron clic', test: (s) => s === 'clicked' },
  { id: 'unopened', label: 'No han abierto', test: (s) => s === 'sent' || s === 'delivered' },
  { id: 'problems', label: 'Con problemas', test: (s) => s === 'bounced' || s === 'complained' || s === 'failed' },
];

const POLL_MS = 30_000;
/** Pasado este tiempo sin ningún aviso de entrega, lo normal es que el webhook no esté configurado */
const SILENT_AFTER_MS = 10 * 60_000;

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

/** Resultados de una campaña enviada: cifras por personas y una fila por destinatario con lo que ha pasado con su email. */
export default function CampaignResults({ token, campaignId, sentAt }: { token: string | undefined; campaignId: string; sentAt: string | null }) {
  const [rows, setRows] = useState<Recipient[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [openRow, setOpenRow] = useState<string | null>(null);

  const load = useCallback(
    async (manual = false) => {
      if (manual) setRefreshing(true);
      try {
        setRows((await crm<{ recipients: Recipient[] }>(token, `/api/campaigns/${campaignId}/recipients`)).recipients);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setRows((r) => r ?? []);
      } finally {
        setRefreshing(false);
      }
    },
    [token, campaignId]
  );

  useEffect(() => {
    load();
    // Los avisos de Resend llegan con minutos de retraso: se refresca solo mientras la pestaña está a la vista
    const timer = setInterval(() => document.visibilityState === 'visible' && load(), POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const stats = useMemo(() => campaignStats(rows || []), [rows]);
  const states = useMemo(() => new Map((rows || []).map((r) => [r.id, deliveryState(r)])), [rows]);

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter)!;
    const q = query.trim().toLowerCase();
    return (rows || []).filter((r) => f.test(states.get(r.id)!) && (!q || r.email.includes(q) || (r.name || '').toLowerCase().includes(q)));
  }, [rows, states, filter, query]);

  if (rows === null) {
    return (
      <section className="card-liquid rounded-3xl p-6 flex items-center gap-2 text-sm text-white/55">
        <Loader2 className="w-4 h-4 animate-spin" /> Cargando resultados…
      </section>
    );
  }

  const noSignal = stats.sent > 0 && stats.delivered === 0 && sentAt && Date.now() - new Date(sentAt).getTime() > SILENT_AFTER_MS;
  const cards = [
    { label: 'Enviados', value: stats.sent, sub: `${rows.length} destinatarios` },
    { label: 'Entregados', value: stats.delivered, sub: `${pct(stats.delivered, stats.sent)}% de los enviados` },
    { label: 'Abiertos', value: stats.opened, sub: `${pct(stats.opened, stats.delivered)}% de los entregados` },
    { label: 'Clics', value: stats.clicked, sub: `${pct(stats.clicked, stats.delivered)}% de los entregados` },
    { label: 'Rebotes', value: stats.bounced + stats.complained, sub: stats.complained ? `${stats.complained} marcaron spam` : 'No llegaron', warn: stats.bounced + stats.complained > 0 },
  ];

  return (
    <section className="card-liquid rounded-3xl p-5 md:p-6 space-y-5" aria-labelledby="results-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="results-title" className="font-semibold">Resultados</h2>
        <button onClick={() => load(true)} disabled={refreshing} className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full border border-white/15 hover:border-[var(--portal-line-strong)] text-xs font-medium cursor-pointer disabled:opacity-60">
          <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} /> Actualizar
        </button>
      </div>

      {error && <p role="alert" className="text-sm rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 px-4 py-3">{error}</p>}
      {noSignal && (
        <p className="text-sm rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 px-4 py-3">
          Resend aún no ha avisado de ninguna entrega. Si es la primera campaña, revisa que el webhook esté creado y que <code>RESEND_WEBHOOK_SECRET</code> esté en el servidor (guía en docs/EMAIL_RESEND.md).
        </p>
      )}

      <dl className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-white/10 px-4 py-3">
            <dt className="text-[11px] uppercase tracking-widest text-white/40">{c.label}</dt>
            <dd className={cn('text-2xl font-semibold tabular-nums mt-1', c.warn && 'text-red-400')}>{c.value}</dd>
            <dd className="text-xs text-white/45 mt-0.5">{c.sub}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} className="pn-chip">
            {f.label} <span className="tabular-nums text-white/35">{(rows || []).filter((r) => f.test(states.get(r.id)!)).length}</span>
          </button>
        ))}
        <label className="relative ml-auto w-full sm:w-56">
          <span className="sr-only">Buscar destinatario</span>
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o email" className="w-full pl-9 pr-3 h-9 border border-[var(--portal-line-strong)] rounded-full text-xs outline-none placeholder:text-white/30" />
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-white/45 py-4 text-center">Nadie coincide con este filtro.</p>
      ) : (
        <ul className="divide-y divide-white/[0.07] -mx-1">
          {visible.map((r) => {
            const state = states.get(r.id)!;
            const expanded = openRow === r.id;
            const detail = r.bounce_reason || r.error;
            return (
              <li key={r.id}>
                <button type="button" onClick={() => setOpenRow(expanded ? null : r.id)} aria-expanded={expanded} className="w-full flex items-center gap-3 px-1 py-3 text-left cursor-pointer hover:bg-white/[0.03] rounded-xl transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{r.name || r.email}</div>
                    {r.name && <div className="text-xs text-white/45 truncate">{r.email}</div>}
                  </div>
                  <div className="hidden sm:block text-xs text-white/45 tabular-nums text-right shrink-0">
                    {r.open_count > 0 && <div>{r.open_count} {r.open_count === 1 ? 'apertura' : 'aperturas'}</div>}
                    {r.click_count > 0 && <div>{r.click_count} {r.click_count === 1 ? 'clic' : 'clics'}</div>}
                  </div>
                  <span className={cn('px-2.5 py-1 text-[11px] rounded-full shrink-0', DELIVERY_BADGE[state])}>{DELIVERY_LABEL[state]}</span>
                </button>
                {expanded && (
                  <div className="px-1 pb-3 text-xs text-white/55 space-y-1.5">
                    <p className="tabular-nums">
                      Enviado {when(r.sent_at)} · Entregado {when(r.delivered_at)} · Abierto {when(r.opened_at)} · Clic {when(r.clicked_at)}
                    </p>
                    {r.links.length > 0 && (
                      <p className="break-all">Enlaces pulsados: {r.links.join(' · ')}</p>
                    )}
                    {detail && <p className="text-red-400">{detail}</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-white/40 leading-relaxed">
        Las aperturas se miden con una imagen invisible y no son exactas: Apple Mail y otros clientes pueden marcar como abierto un correo que nadie ha leído, o bloquear la medida. Los clics y las entregas son fiables.
      </p>
    </section>
  );
}
