'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Search } from 'lucide-react';
import Modal from '@/components/portal/Modal';
import { crm } from '@/components/portal/crmApi';
import { contactKeys, statusMeta } from '@/components/portal/leadMeta';
import type { Lead } from '@/app/portal/leads/context';
import { PIPELINE, type Cohort, type LeadStatus } from '@/lib/admissions';
import type { Contact } from '@/lib/contacts';
import { cn } from '@/lib/utils';

const SHOWN = 50;

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '?';

/**
 * Mete en el proceso a gente de Contactos: eliges la etapa, buscas y pulsas «Añadir». Si esa persona ya tiene un lead
 * (mismo email o teléfono) no se duplica: se mueve a la etapa elegida. El diálogo sigue abierto para añadir varios seguidos.
 */
export default function AddToProcessModal({
  token,
  leads,
  cohorts,
  initialStage,
  cohortId,
  onClose,
  onChanged,
}: {
  token: string | undefined;
  leads: Lead[];
  cohorts: Cohort[];
  initialStage: LeadStatus;
  /** Convocatoria que se está viendo: a ella van los nuevos */
  cohortId: string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [stage, setStage] = useState<LeadStatus>(initialStage);
  const [cohort, setCohort] = useState(cohortId || '');
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  // Qué se ha hecho en esta sesión del diálogo, para confirmarlo en la fila: contacto → etapa
  const [done, setDone] = useState<Record<string, LeadStatus>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    crm<{ contacts: Contact[] }>(token, '/api/contacts')
      .then((d) => !cancelled && setContacts(d.contacts))
      .catch((e) => !cancelled && setLoadError(e.message));
    return () => { cancelled = true; };
  }, [token]);

  // Lead existente de cada persona, por email o teléfono
  const leadByKey = useMemo(() => {
    const map = new Map<string, Lead>();
    for (const l of leads) for (const k of contactKeys(l)) if (!map.has(k)) map.set(k, l);
    return map;
  }, [leads]);
  const leadOf = (c: Contact) => contactKeys(c).map((k) => leadByKey.get(k)).find(Boolean) || null;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = contacts || [];
    return q ? all.filter((c) => [c.name, c.email, c.phone, c.company].some((v) => v?.toLowerCase().includes(q))) : all;
  }, [contacts, query]);

  const add = async (contact: Contact) => {
    setBusyId(contact.id);
    setError(null);
    try {
      const existing = leadOf(contact);
      if (existing) {
        await crm(token, `/api/leads/${existing.id}`, { method: 'PATCH', body: { status: stage, ...(cohort ? { cohort_id: cohort } : {}) } });
      } else {
        await crm(token, '/api/leads', {
          method: 'POST',
          body: {
            name: contact.name || contact.email,
            email: contact.email,
            phone: contact.phone || '',
            company: contact.company || '',
            message: 'Añadido desde Contactos.',
            status: stage,
            cohort_id: cohort || null,
          },
        });
      }
      setDone((d) => ({ ...d, [contact.id]: stage }));
      onChanged();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Modal title="Añadir contactos al proceso" onClose={onClose} wide>
      <div className="space-y-4">
        <div>
          <div className="block text-xs uppercase tracking-widest text-white/40 mb-2" id="add-stage-label">Añadir en la etapa</div>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="add-stage-label">
            {PIPELINE.map((p) => (
              <button key={p.status} type="button" onClick={() => setStage(p.status)} aria-pressed={stage === p.status} className="pn-chip">
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {cohorts.length > 0 && (
          <div>
            <label htmlFor="add-cohort" className="block text-xs uppercase tracking-widest text-white/40 mb-2">Convocatoria</label>
            <select id="add-cohort" value={cohort} onChange={(e) => setCohort(e.target.value)} className="h-10 w-full sm:w-auto sm:min-w-64 rounded-xl border border-[var(--portal-line-strong)] bg-transparent pl-3 pr-8 text-sm cursor-pointer">
              <option value="">Sin convocatoria</option>
              {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        <div className="relative">
          <Search className="w-4 h-4 text-white/35 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, email, teléfono o empresa…"
            aria-label="Buscar contactos"
            autoFocus
            className="w-full pl-10 pr-3 py-2.5 border border-[var(--portal-line-strong)] rounded-full text-sm outline-none placeholder:text-white/30"
          />
        </div>

        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

        {contacts === null && !loadError ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-white/45"><Loader2 className="w-4 h-4 animate-spin" /> Cargando contactos…</div>
        ) : loadError ? (
          <p role="alert" className="text-sm text-red-400 py-6 text-center">{loadError}</p>
        ) : matches.length === 0 ? (
          <p className="text-sm text-white/50 text-center py-10">{(contacts || []).length === 0 ? 'Aún no tienes contactos. Créalos o impórtalos en Contactos.' : 'Ningún contacto coincide con la búsqueda.'}</p>
        ) : (
          <>
            <ul className="max-h-[46dvh] overflow-y-auto -mx-1 px-1 divide-y divide-black/[0.06]">
              {matches.slice(0, SHOWN).map((c) => {
                const lead = leadOf(c);
                const justDone = done[c.id];
                const inStage = !justDone && lead?.status === stage;
                const current = lead ? statusMeta(lead.status) : null;
                return (
                  <li key={c.id} className="flex items-center gap-3 py-2.5">
                    <span className="w-9 h-9 rounded-full bg-[var(--signal)]/12 text-[var(--signal)] text-xs font-semibold flex items-center justify-center shrink-0" aria-hidden="true">
                      {initials(c.name || c.email)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate">{c.name || c.email}</span>
                      <span className="block text-xs text-white/50 truncate">{[c.name ? c.email : '', c.phone, c.company].filter(Boolean).join(' · ')}</span>
                    </span>
                    {justDone ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400 shrink-0" role="status">
                        <Check className="w-4 h-4" aria-hidden="true" /> En {statusMeta(justDone).label}
                      </span>
                    ) : (
                      <>
                        {current && <span className={cn('hidden sm:inline-flex px-2 py-0.5 text-xs rounded-full shrink-0', current.badgeClass)}>{current.label}</span>}
                        <button
                          type="button"
                          onClick={() => add(c)}
                          disabled={busyId === c.id || inStage}
                          className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer border border-[var(--portal-line-strong)] hover:border-[var(--signal)] hover:text-[var(--signal)] disabled:opacity-45 disabled:cursor-default disabled:hover:border-[var(--portal-line-strong)] disabled:hover:text-inherit transition-colors"
                        >
                          {busyId === c.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          {inStage ? 'Ya está aquí' : lead ? 'Mover aquí' : 'Añadir'}
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
            {matches.length > SHOWN && <p className="text-xs text-white/40 text-center">Mostrando {SHOWN} de {matches.length}. Afina la búsqueda para ver el resto.</p>}
          </>
        )}
      </div>
    </Modal>
  );
}
