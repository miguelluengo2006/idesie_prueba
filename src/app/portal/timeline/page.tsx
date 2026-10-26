'use client';

import { useMemo, useState } from 'react';
import { Route, Search, UserPlus } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useLeadsContext, type Lead } from '@/app/portal/leads/context';
import LeadDetailModal from '@/components/portal/LeadDetailModal';
import { crm } from '@/components/portal/crmApi';
import { COHORT_ALL, COHORT_NONE } from '@/components/portal/CohortPanel';
import AddToProcessModal from '@/components/portal/process/AddToProcessModal';
import ProcessTimeline from '@/components/portal/process/ProcessTimeline';
import { EmptyState, Page, Skeleton } from '@/components/portal/ui';
import type { LeadStatus } from '@/lib/admissions';

export default function ProcessPage() {
  const { session } = useAuth();
  const token = session?.access_token;
  const { leads, cohorts, loading, refetch } = useLeadsContext();
  const [cohortSel, setCohortSel] = useState<string>(COHORT_ALL);
  const [query, setQuery] = useState('');
  const [addStage, setAddStage] = useState<LeadStatus | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Cambios ya hechos en pantalla y aún sin confirmar por el servidor: así la tarjeta se mueve al soltarla, sin esperar
  const [pending, setPending] = useState<Record<string, LeadStatus>>({});
  const [flashId, setFlashId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads
      .filter((l) => {
        if (cohortSel === COHORT_NONE ? l.cohort_id : cohortSel !== COHORT_ALL && l.cohort_id !== cohortSel) return false;
        if (!q) return true;
        return [l.name, l.email, l.company, l.phone].some((v) => v?.toLowerCase().includes(q));
      })
      .map((l): Lead => (pending[l.id] ? { ...l, status: pending[l.id] } : l))
      .filter((l) => l.status !== 'lost');
  }, [leads, cohortSel, query, pending]);

  const move = async (lead: Lead, to: LeadStatus) => {
    setError(null);
    setPending((p) => ({ ...p, [lead.id]: to }));
    if (to === 'paid') {
      setFlashId(lead.id);
      setTimeout(() => setFlashId((cur) => (cur === lead.id ? null : cur)), 1800);
    }
    try {
      await crm(token, `/api/leads/${lead.id}`, { method: 'PATCH', body: { status: to } });
      await refetch();
    } catch (err: any) {
      setError(`No se pudo mover a ${lead.name}: ${err.message}`);
    } finally {
      setPending(({ [lead.id]: _done, ...rest }) => rest);
    }
  };

  const addButton = (
    <button onClick={() => setAddStage('admission')} className="flex items-center gap-1.5 px-4 h-9 rounded-full portal-cta text-xs font-semibold cursor-pointer">
      <UserPlus className="w-4 h-4" aria-hidden="true" /> <span className="hidden sm:inline">Añadir contacto</span><span className="sm:hidden">Añadir</span>
    </button>
  );

  if (loading) {
    return (
      <Page title="Proceso de admisión">
        <div className="grid gap-3 lg:grid-cols-5">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64" />)}</div>
      </Page>
    );
  }

  const selected = selectedId ? leads.find((l) => l.id === selectedId) || null : null;

  return (
    <Page
      title="Proceso de admisión"
      subtitle={`${shown.length} ${shown.length === 1 ? 'persona' : 'personas'} en el proceso`}
      actions={addButton}
      width="max-w-[1400px]"
    >
      <div className="flex flex-wrap items-center gap-2">
        {cohorts.length > 0 && (
          <>
            <label htmlFor="proc-cohort" className="sr-only">Convocatoria</label>
            <select id="proc-cohort" value={cohortSel} onChange={(e) => setCohortSel(e.target.value)} className="h-9 max-w-[16rem] rounded-full border border-[var(--portal-line-strong)] bg-transparent pl-3 pr-8 text-xs font-medium cursor-pointer">
              <option value={COHORT_ALL}>Todas las convocatorias</option>
              {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              <option value={COHORT_NONE}>Sin convocatoria</option>
            </select>
          </>
        )}
        <div className="relative flex-1 sm:flex-none">
          <Search className="w-4 h-4 text-white/35 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en el proceso…"
            aria-label="Buscar en el proceso"
            className="w-full sm:w-64 pl-10 pr-3 py-2 border border-[var(--portal-line-strong)] rounded-full text-sm outline-none placeholder:text-white/30"
          />
        </div>
        <p className="hidden md:block text-xs text-white/45 ml-auto">Arrastra a cada persona a su etapa, o usa las flechas de la tarjeta.</p>
      </div>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      {shown.length === 0 && !query ? (
        <EmptyState
          icon={<Route className="w-6 h-6" />}
          title="Nadie en el proceso todavía"
          text="Añade contactos a la etapa en la que están y sigue su camino hasta el pago."
          action={addButton}
        />
      ) : (
        <ProcessTimeline leads={shown} onMove={move} onOpen={(l) => setSelectedId(l.id)} onAdd={setAddStage} flashId={flashId} cohorts={cohorts} />
      )}

      {addStage && (
        <AddToProcessModal
          token={token}
          leads={leads}
          cohorts={cohorts}
          initialStage={addStage}
          cohortId={cohortSel !== COHORT_ALL && cohortSel !== COHORT_NONE ? cohortSel : null}
          onClose={() => setAddStage(null)}
          onChanged={refetch}
        />
      )}
      <LeadDetailModal lead={selected} onClose={() => setSelectedId(null)} accessToken={token} onChange={refetch} allLeads={leads} onOpenLead={setSelectedId} cohorts={cohorts} />
    </Page>
  );
}
