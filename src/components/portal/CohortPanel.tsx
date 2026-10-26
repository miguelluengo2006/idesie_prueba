'use client';

import { CalendarDays, Pencil, Plus } from 'lucide-react';
import { cohortStats, daysUntil, defaultCohort, formatStartDate, startLabel, type Cohort } from '@/lib/admissions';
import type { Lead } from '@/app/portal/leads/context';
import { cn } from '@/lib/utils';

/** Valor del selector que no filtra por convocatoria / el de los leads sin ninguna. */
export const COHORT_ALL = 'all';
export const COHORT_NONE = 'none';

/**
 * Cuándo empieza el máster y cuántos hay en clase. Con «Todos los leads» enseña la próxima convocatoria;
 * al elegir una, la lista de leads de debajo se limita a ella.
 */
export default function CohortPanel({
  cohorts,
  leads,
  selected,
  onSelect,
  onNew,
  onEdit,
}: {
  cohorts: Cohort[];
  leads: Lead[];
  selected: string;
  onSelect: (value: string) => void;
  onNew: () => void;
  onEdit: (cohort: Cohort) => void;
}) {
  if (cohorts.length === 0) {
    return (
      <section className="card-liquid rounded-3xl p-4 md:p-5 pn-in flex flex-col sm:flex-row sm:items-center justify-between gap-3" aria-label="Convocatoria">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-2xl bg-[var(--signal)]/10 border border-[var(--portal-line-strong)] text-[var(--signal)] flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Crea la convocatoria del máster</h2>
            <p className="text-xs text-white/50">Con su fecha de inicio y sus plazas verás cuándo empieza y cuántos hay en clase.</p>
          </div>
        </div>
        <button onClick={onNew} className="flex items-center justify-center gap-1.5 px-4 h-9 rounded-full portal-cta text-xs font-semibold cursor-pointer shrink-0">
          <Plus className="w-4 h-4" aria-hidden="true" /> Nueva convocatoria
        </button>
      </section>
    );
  }

  const cohort = cohorts.find((c) => c.id === selected) || defaultCohort(cohorts)!;
  const stats = cohortStats(cohort, leads);
  const inClass = stats.paid;
  const days = daysUntil(cohort.starts_at);
  const capacity = cohort.capacity;
  const fill = (n: number) => (capacity > 0 ? Math.min(100, (n / capacity) * 100) : 0);

  return (
    <section className="card-liquid rounded-3xl p-4 md:p-5 pn-in" aria-label="Convocatoria">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <label htmlFor="cohort-select" className="sr-only">Convocatoria</label>
          <select
            id="cohort-select"
            value={selected}
            onChange={(e) => onSelect(e.target.value)}
            className="h-9 max-w-[16rem] rounded-full border border-[var(--portal-line-strong)] bg-transparent pl-3 pr-8 text-xs font-medium cursor-pointer"
          >
            <option value={COHORT_ALL}>Todos los leads</option>
            {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value={COHORT_NONE}>Sin convocatoria</option>
          </select>
          {selected === COHORT_ALL && <span className="text-xs text-white/45 hidden sm:inline">Se muestra la próxima convocatoria</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onEdit(cohort)} className="flex items-center gap-1.5 px-3 h-9 rounded-full border border-white/15 hover:border-[var(--portal-line-strong)] text-white/70 hover:text-white text-xs font-medium cursor-pointer transition-colors">
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> Editar
          </button>
          <button onClick={onNew} className="flex items-center gap-1.5 px-3 h-9 rounded-full border border-white/15 hover:border-[var(--portal-line-strong)] text-white/70 hover:text-white text-xs font-medium cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Nueva
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:items-end">
        <div className="min-w-0">
          <h2 className="text-sm text-white/55 truncate">{cohort.name}</h2>
          <p className="text-2xl md:text-3xl font-semibold tracking-tight mt-0.5">{formatStartDate(cohort.starts_at)}</p>
          <p className={cn('text-sm mt-1 font-medium', days < 0 ? 'text-white/50' : days <= 14 ? 'text-yellow-400' : 'text-[var(--signal)]')}>{startLabel(cohort.starts_at)}</p>
        </div>

        <div className="min-w-0">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="pn-title mb-1">En clase</div>
              <div className="text-2xl md:text-3xl font-semibold tabular-nums">
                {inClass}
                {capacity > 0 && <span className="text-base text-white/40 font-normal"> / {capacity}</span>}
              </div>
              <div className="text-xs text-white/45">Han pagado</div>
            </div>
            <div>
              <div className="pn-title mb-1">Matriculados</div>
              <div className="text-2xl md:text-3xl font-semibold tabular-nums">{stats.enrolled}</div>
              <div className="text-xs text-white/45">Pendientes de pago</div>
            </div>
            <div>
              <div className="pn-title mb-1">Plazas libres</div>
              <div className="text-2xl md:text-3xl font-semibold tabular-nums">{stats.free ?? '—'}</div>
              <div className="text-xs text-white/45">{stats.free === null ? 'Sin límite fijado' : 'Descontando matriculados'}</div>
            </div>
          </div>
          {capacity > 0 && (
            <div
              className="mt-3 h-2 rounded-full bg-white/[0.06] overflow-hidden flex"
              role="img"
              aria-label={`${inClass} pagados y ${stats.enrolled} matriculados de ${capacity} plazas`}
            >
              <div className="h-full bg-green-400 transition-[width] duration-700" style={{ width: `${fill(stats.paid)}%` }} />
              <div className="h-full bg-[var(--signal)]/60 transition-[width] duration-700" style={{ width: `${Math.min(fill(stats.enrolled), 100 - fill(stats.paid))}%` }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
