'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  BellRing,
  Building2,
  Check,
  CreditCard,
  Download,
  Inbox,
  KanbanSquare,
  List,
  Mail,
  MessageCircle,
  Phone,
  PhoneCall,
  Plus,
  Search,
  Upload,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useLeadsContext } from './context';
import type { Lead } from './context';
import { isPendingCall, upcomingCalls } from './context';
import { cn } from '@/lib/utils';
import LeadDetailModal from '@/components/portal/LeadDetailModal';
import NewLeadModal from '@/components/portal/NewLeadModal';
import ImportLeadsModal from '@/components/portal/ImportLeadsModal';
import CohortModal from '@/components/portal/CohortModal';
import CohortPanel, { COHORT_ALL, COHORT_NONE } from '@/components/portal/CohortPanel';
import { PIPELINE, nextStatus, type Cohort } from '@/lib/admissions';
import { contactKeys, leadChannel, leadInterest, leadNote, statusMeta, statusOptions, timeAgo, whatsappUrl } from '@/components/portal/leadMeta';
import { EmptyState, Page, Skeleton } from '@/components/portal/ui';
import { addDays, callDayKey, formatCallDate, formatCallTime, todayInBookingTz } from '@/lib/booking';
import { exportLeadsCsv } from '@/lib/leadsCsv';

type StatusFilter = 'all' | Lead['status'];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  ...PIPELINE.map((p) => ({ value: p.status as StatusFilter, label: p.label })),
  { value: 'lost', label: 'Descartados' },
];

// Tablero: una columna por etapa y, al final, los descartados. «Pasar a…» lleva a la etapa siguiente.
const BOARD: { status: Lead['status']; title: string; next: Lead['status'] | null; nextLabel: string }[] = [
  ...PIPELINE.map((p) => {
    const next = nextStatus(p.status);
    return { status: p.status, title: p.label, next, nextLabel: PIPELINE.find((x) => x.status === next)?.label || '' };
  }),
  { status: 'lost', title: 'Descartados', next: null, nextLabel: '' },
];

/** «Hoy 17:00», «Mañana 10:00» o «mar 14 oct 17:00». */
function callWhen(iso: string): string {
  const today = todayInBookingTz();
  const key = callDayKey(iso);
  const day = key === today ? 'Hoy' : key === addDays(today, 1) ? 'Mañana' : formatCallDate(iso).split(',')[0];
  return `${day} ${formatCallTime(iso)}`;
}

/** De dónde viene el lead, para la fila de la lista. */
const originOf = (l: Lead) => {
  if (l.source === 'manual') return 'Añadido a mano';
  if (l.source === 'facebook') return 'Facebook';
  return l.kind === 'call' ? 'Llamada desde la web' : 'Formulario de la web';
};

export default function LeadsPage() {
  const { session } = useAuth();
  const { leads, cohorts, loading, refetch } = useLeadsContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [mode, setMode] = useState<'list' | 'board'>('list');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [cohortSel, setCohortSel] = useState<string>(COHORT_ALL);
  const [cohortModal, setCohortModal] = useState<{ cohort?: Cohort } | null>(null);

  // La vista (lista o tablero) se recuerda en este navegador
  useEffect(() => {
    try {
      if (localStorage.getItem('leads-mode') === 'board') setMode('board');
    } catch { /* sin almacenamiento */ }
  }, []);
  const changeMode = (m: 'list' | 'board') => {
    setMode(m);
    try { localStorage.setItem('leads-mode', m); } catch { /* ignore */ }
  };

  // /portal/leads?open=<id> — deep link from the dashboard
  const openParam = searchParams?.get('open');
  useEffect(() => {
    if (openParam) setSelectedId(openParam);
  }, [openParam]);

  const closeModal = () => {
    setSelectedId(null);
    if (openParam) router.replace('/portal/leads');
  };

  const move = async (lead: Lead, next: Lead['status']) => {
    if (!session?.access_token) return;
    setBusyId(lead.id);
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ status: next }),
      });
      await refetch();
    } finally {
      setBusyId(null);
    }
  };

  // Llamada próxima de cada persona: la suya propia o la de otra solicitud con el mismo email / teléfono
  const callOf = useMemo(() => {
    const byKey = new Map<string, Lead>();
    for (const c of upcomingCalls(leads.filter((l) => l.kind === 'call'))) {
      for (const k of contactKeys(c)) if (!byKey.has(k)) byKey.set(k, c);
    }
    return (l: Lead): Lead | null => {
      if (isPendingCall(l)) return l;
      for (const k of contactKeys(l)) {
        const c = byKey.get(k);
        if (c) return c;
      }
      return null;
    };
  }, [leads]);

  const cohortName = useMemo(() => new Map(cohorts.map((c) => [c.id, c.name])), [cohorts]);

  const scoped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (cohortSel === COHORT_NONE ? l.cohort_id : cohortSel !== COHORT_ALL && l.cohort_id !== cohortSel) return false;
      if (!q) return true;
      return [l.name, l.email, l.company, l.phone, l.message].some((v) => v?.toLowerCase().includes(q));
    });
  }, [leads, cohortSel, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: scoped.length };
    for (const l of scoped) c[l.status] = (c[l.status] || 0) + 1;
    return c;
  }, [scoped]);

  const sorted = (rows: Lead[]) =>
    rows.slice().sort((a, b) => {
      // Con llamada próxima primero (por fecha); el resto, lo más reciente arriba
      const ca = callOf(a);
      const cb = callOf(b);
      if (ca && cb) return new Date(ca.call_at!).getTime() - new Date(cb.call_at!).getTime();
      if (ca) return -1;
      if (cb) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const filtered = sorted(status === 'all' ? scoped : scoped.filter((l) => l.status === status));
  const selected = selectedId ? leads.find((l) => l.id === selectedId) || null : null;

  const newLeadButton = (
    <button onClick={() => setNewLeadOpen(true)} className="flex items-center gap-1.5 px-4 h-9 rounded-full portal-cta text-xs font-semibold cursor-pointer">
      <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nuevo lead</span><span className="sm:hidden">Nuevo</span>
    </button>
  );
  const newLeadModal = newLeadOpen ? (
    <NewLeadModal
      token={session?.access_token}
      onClose={() => setNewLeadOpen(false)}
      onCreated={() => {
        setNewLeadOpen(false);
        refetch();
      }}
    />
  ) : null;

  const importButton = (
    <button
      onClick={() => setImportOpen(true)}
      className="flex items-center gap-1.5 px-3 h-9 border border-white/15 hover:border-[var(--portal-line-strong)] text-white/70 hover:text-white rounded-full text-xs font-medium transition-colors cursor-pointer"
      aria-label="Importar leads de Facebook"
    >
      <Upload className="w-4 h-4" aria-hidden="true" />
      <span className="hidden md:inline">Importar Facebook</span>
    </button>
  );
  const importModal = importOpen ? (
    <ImportLeadsModal token={session?.access_token} cohorts={cohorts} onClose={() => setImportOpen(false)} onImported={refetch} />
  ) : null;
  const cohortModalEl = cohortModal ? (
    <CohortModal
      token={session?.access_token}
      cohort={cohortModal.cohort}
      onClose={() => setCohortModal(null)}
      onSaved={(id) => {
        setCohortModal(null);
        // Si se acaba de crear una, se enseña; si se eliminó, se vuelve a todos los leads
        if (id && !cohortModal.cohort) setCohortSel(id);
        else if (!id) setCohortSel(COHORT_ALL);
        refetch();
      }}
    />
  ) : null;

  const actions = (
    <>
      {newLeadButton}
      {importButton}
      <div className="hidden sm:flex rounded-full border border-white/12 p-0.5 bg-white/[0.03]" role="group" aria-label="Vista">
        {([['list', List, 'Lista'], ['board', KanbanSquare, 'Tablero']] as const).map(([m, Icon, label]) => (
          <button
            key={m}
            onClick={() => changeMode(m)}
            aria-pressed={mode === m}
            className={cn('flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-medium cursor-pointer transition-colors', mode === m ? 'bg-[var(--signal)] text-black font-semibold' : 'text-white/55 hover:text-white')}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>
      {leads.length > 0 && (
        <button
          onClick={() => exportLeadsCsv(leads)}
          className="flex items-center gap-1.5 px-3 h-9 border border-white/15 hover:border-[var(--portal-line-strong)] text-white/70 hover:text-white rounded-full text-xs font-medium transition-colors cursor-pointer"
          aria-label="Exportar CSV"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Exportar CSV</span>
        </button>
      )}
    </>
  );

  if (loading) {
    return (
      <Page title="Leads">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </Page>
    );
  }

  if (leads.length === 0) {
    return (
      <Page title="Leads" actions={<>{newLeadButton}{importButton}</>}>
        <EmptyState
          icon={<Inbox className="w-6 h-6" />}
          title="Sin leads todavía"
          text="Cuando alguien pida una llamada o información desde la web, aparecerá aquí. También puedes añadir uno a mano o importar los de Facebook."
        />
        {newLeadModal}
        {importModal}
      </Page>
    );
  }

  const Card = ({ lead, compact }: { lead: Lead; compact?: boolean }) => {
    const meta = statusMeta(lead.status, lead.kind);
    const call = callOf(lead);
    const wa = whatsappUrl(lead.phone);
    const interest = leadInterest(lead);
    const note = leadNote(lead.message);
    const step = BOARD.find((b) => b.status === lead.status);
    return (
      <div className={cn('card-liquid rounded-3xl overflow-hidden', compact && 'rounded-2xl')}>
        <div className="flex items-stretch">
          <button onClick={() => setSelectedId(lead.id)} className="flex-1 min-w-0 text-left px-4 py-3.5 hover:bg-white/[0.03] transition-colors cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold truncate">{lead.name}</span>
                  {!compact && (
                    <span className={cn('px-2 py-0.5 text-[11px] rounded-full inline-flex items-center gap-1.5 shrink-0', meta.badgeClass)}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', meta.dotColor)} />
                      {meta.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-x-3 gap-y-0.5 text-xs text-white/50 mt-1 flex-wrap">
                  {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{lead.phone}</span>}
                  {!compact && lead.email && <span className="flex items-center gap-1 truncate max-w-[220px]"><Mail className="w-3 h-3 shrink-0" />{lead.email}</span>}
                  {!compact && lead.company && <span className="flex items-center gap-1 truncate"><Building2 className="w-3 h-3 shrink-0" />{lead.company}</span>}
                </div>
              </div>
              <span className="text-[11px] text-white/40 shrink-0 pt-0.5">{timeAgo(lead.created_at)}</span>
            </div>

            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {call ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-full px-2.5 py-0.5">
                  <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                  Llamada · {callWhen(call.call_at!)}
                </span>
              ) : null}
              <span className="text-xs text-white/50">{originOf(lead)}{interest ? ` · ${interest}` : ''}{lead.cohort_id && cohortName.get(lead.cohort_id) ? ` · ${cohortName.get(lead.cohort_id)}` : ''}</span>
            </div>
            {!compact && note && lead.kind !== 'call' && <p className="text-sm text-white/50 line-clamp-1 mt-2">{note}</p>}
          </button>

          {!compact && (lead.phone || lead.email || lead.status === 'new') && (
            <div className="flex flex-col border-l border-white/10 divide-y divide-white/10 shrink-0 w-12">
              {lead.phone && (
                <a href={`tel:${lead.phone}`} aria-label={`Llamar a ${lead.name}`} className="flex-1 min-h-10 flex items-center justify-center hover:bg-white/[0.06] text-white/70">
                  <Phone className="w-4 h-4" />
                </a>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp a ${lead.name}`} className="flex-1 min-h-10 flex items-center justify-center hover:bg-white/[0.06] text-green-400">
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} aria-label={`Email a ${lead.name}`} className="flex-1 min-h-10 flex items-center justify-center hover:bg-white/[0.06] text-white/70">
                  <Mail className="w-4 h-4" />
                </a>
              )}
              {lead.status === 'new' && (
                <button
                  onClick={() => move(lead, 'admission')}
                  disabled={busyId === lead.id}
                  aria-label="Pasar a admisión"
                  title="Pasar a admisión"
                  className="flex-1 min-h-10 flex items-center justify-center hover:bg-[var(--signal)]/15 text-[var(--signal)] disabled:opacity-40 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
        {compact && step?.next && (
          <button
            onClick={() => move(lead, step.next!)}
            disabled={busyId === lead.id}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[var(--signal)] border-t border-white/10 hover:bg-[var(--signal)]/10 disabled:opacity-40 cursor-pointer"
          >
            Pasar a {step.nextLabel} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  const Table = () => (
    <div className="hidden md:block card-liquid rounded-3xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="pn-title text-left border-b border-white/10">
            <th scope="col" className="px-4 py-3 font-medium">Persona</th>
            <th scope="col" className="px-3 py-3 font-medium">Contacto</th>
            <th scope="col" className="px-3 py-3 font-medium">Interés y origen</th>
            <th scope="col" className="px-3 py-3 font-medium">Estado</th>
            <th scope="col" className="px-3 py-3 font-medium">Llamada</th>
            <th scope="col" className="px-3 py-3 font-medium">Recibido</th>
            <th scope="col" className="px-3 py-3 w-28"><span className="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {filtered.map((lead) => {
            const call = callOf(lead);
            const wa = whatsappUrl(lead.phone);
            const interest = leadInterest(lead);
            const channel = leadChannel(lead);
            const act = 'w-8 h-8 inline-flex items-center justify-center rounded-full hover:bg-white/[0.08] text-white/65 hover:text-white';
            return (
              <tr key={lead.id} className="hover:bg-white/[0.04] transition-colors align-middle">
                <td className="px-4 py-3 max-w-[220px]">
                  <button onClick={() => setSelectedId(lead.id)} className="text-left cursor-pointer block w-full min-w-0">
                    <span className="block font-semibold truncate">{lead.name}</span>
                    {lead.company && <span className="block text-xs text-white/50 truncate">{lead.company}</span>}
                  </button>
                </td>
                <td className="px-3 py-3 text-xs text-white/60 max-w-[220px]">
                  {lead.phone && <span className="block tabular-nums">{lead.phone}</span>}
                  {lead.email && <span className="block truncate">{lead.email}</span>}
                </td>
                <td className="px-3 py-3 max-w-[240px]">
                  {interest && <span className="block text-sm truncate">{interest}</span>}
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-white/50 flex-wrap">
                    <span className="rounded-full border border-white/15 px-2 py-px">{channel.label}</span>
                    {channel.campaign && <span className="truncate text-[var(--signal)]">{channel.campaign}</span>}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <select
                    value={lead.status}
                    disabled={busyId === lead.id}
                    onChange={(e) => move(lead, e.target.value as Lead['status'])}
                    aria-label={`Estado de ${lead.name}`}
                    className={cn('h-8 w-36 rounded-full pl-3 pr-7 text-xs font-medium cursor-pointer disabled:opacity-50', statusMeta(lead.status, lead.kind).badgeClass)}
                  >
                    {statusOptions(lead.kind).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {lead.cohort_id && cohortName.get(lead.cohort_id) && <span className="block mt-1 pl-1 text-[11px] text-white/40 truncate max-w-36">{cohortName.get(lead.cohort_id)}</span>}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {call ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400"><PhoneCall className="w-3.5 h-3.5" />{callWhen(call.call_at!)}</span>
                  ) : (
                    <span className="text-xs text-white/35">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-xs text-white/50 whitespace-nowrap">{timeAgo(lead.created_at)}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-0.5">
                    {lead.phone && <a href={`tel:${lead.phone}`} aria-label={`Llamar a ${lead.name}`} title="Llamar" className={act}><Phone className="w-4 h-4" /></a>}
                    {wa && <a href={wa} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp a ${lead.name}`} title="WhatsApp" className={cn(act, 'text-green-400 hover:text-green-300')}><MessageCircle className="w-4 h-4" /></a>}
                    {lead.email && <a href={`mailto:${lead.email}`} aria-label={`Email a ${lead.name}`} title="Email" className={act}><Mail className="w-4 h-4" /></a>}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <Page title="Leads" subtitle={`${leads.length} en total`} actions={actions}>
      <CohortPanel
        cohorts={cohorts}
        leads={leads}
        selected={cohortSel}
        onSelect={setCohortSel}
        onNew={() => setCohortModal({})}
        onEdit={(cohort) => setCohortModal({ cohort })}
      />

      {/* Resumen por etapa: en la lista, cada tarjeta filtra */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {([
          { v: 'new', label: 'Nuevos', icon: BellRing, tone: 'text-[var(--signal)]' },
          { v: 'admission', label: 'Admisión', icon: Inbox, tone: 'text-yellow-400' },
          { v: 'call', label: 'Llamada', icon: PhoneCall, tone: 'text-blue-400' },
          { v: 'enrolled', label: 'Matriculados', icon: UserCheck, tone: 'text-olive-400' },
          { v: 'paid', label: 'Pagados', icon: CreditCard, tone: 'text-green-400' },
        ] as const).map((k, i) => {
          const body = (
            <>
              <div className="pn-title mb-1.5 flex items-center gap-1.5"><k.icon className={cn('w-3.5 h-3.5', k.tone)} aria-hidden="true" /> {k.label}</div>
              <div className="text-2xl md:text-3xl font-semibold tabular-nums">{counts[k.v] ?? 0}</div>
            </>
          );
          const base = 'card-liquid rounded-3xl p-4 text-left pn-in';
          return mode === 'list' ? (
            <button
              key={k.v}
              onClick={() => setStatus(status === k.v ? 'all' : k.v)}
              aria-pressed={status === k.v}
              className={cn(base, 'cursor-pointer', status === k.v && 'shadow-[0_0_0_2px_var(--signal),0_0_30px_-8px_var(--signal)]')}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {body}
            </button>
          ) : (
            <div key={k.v} className={base} style={{ animationDelay: `${i * 50}ms` }}>{body}</div>
          );
        })}
      </div>

      {/* Barra de filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-1">
          {mode === 'list' ? (
            STATUS_FILTERS.map((f) => (
              <button key={f.value} onClick={() => setStatus(f.value)} aria-pressed={status === f.value} className="pn-chip">
                {f.label}
                <span className={cn('tabular-nums', status === f.value ? 'text-black/60' : 'text-white/35')}>{counts[f.value] ?? 0}</span>
              </button>
            ))
          ) : (
            <span className="text-xs text-white/45">Mueve cada lead de izquierda a derecha con «Pasar a…».</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="sm:hidden flex rounded-full border border-white/12 p-0.5 bg-white/[0.03]" role="group" aria-label="Vista">
            {([['list', List], ['board', KanbanSquare]] as const).map(([m, Icon]) => (
              <button key={m} onClick={() => changeMode(m)} aria-pressed={mode === m} aria-label={m === 'list' ? 'Lista' : 'Tablero'} className={cn('w-9 h-8 flex items-center justify-center rounded-full cursor-pointer', mode === m ? 'bg-[var(--signal)] text-black' : 'text-white/55')}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <div className="relative flex-1 lg:flex-none">
            <Search className="w-4 h-4 text-white/35 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar nombre, email, teléfono…"
              aria-label="Buscar leads"
              className="w-full lg:w-72 pl-10 pr-3 py-2.5 border border-[var(--portal-line-strong)] rounded-full text-sm outline-none placeholder:text-white/30"
            />
          </div>
        </div>
      </div>

      {mode === 'list' ? (
        filtered.length === 0 ? (
          <EmptyState icon={<Search className="w-6 h-6" />} title="Nada coincide" text="Prueba con otros filtros o borra la búsqueda." />
        ) : (
          <>
          {Table()}
          <ul className="space-y-3 md:hidden">
            {filtered.map((lead, i) => (
              <li key={lead.id} className="pn-in" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
                <Card lead={lead} />
              </li>
            ))}
          </ul>
          </>
        )
      ) : (
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 md:mx-0 md:px-0">
          {BOARD.map((col) => {
            const rows = sorted(scoped.filter((l) => l.status === col.status));
            return (
              <section key={col.status} className="snap-start shrink-0 w-[82%] sm:w-[48%] md:w-64 md:flex-1 min-w-0 flex flex-col gap-2.5">
                <h2 className="pn-title flex items-center justify-between px-1">
                  <span className="flex items-center gap-2"><span className={cn('w-1.5 h-1.5 rounded-full', statusMeta(col.status).dotColor)} />{col.title}</span>
                  <span className="tabular-nums text-white/60">{rows.length}</span>
                </h2>
                {rows.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/12 py-8 text-center text-xs text-white/35">Vacío</div>
                ) : (
                  rows.map((lead) => <Card key={lead.id} lead={lead} compact />)
                )}
              </section>
            );
          })}
        </div>
      )}

      {newLeadModal}
      {importModal}
      {cohortModalEl}
      <LeadDetailModal lead={selected} onClose={closeModal} accessToken={session?.access_token} onChange={refetch} allLeads={leads} onOpenLead={setSelectedId} cohorts={cohorts} />
    </Page>
  );
}
