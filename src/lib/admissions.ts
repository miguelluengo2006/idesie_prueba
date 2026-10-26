/**
 * Embudo de admisión de los leads y convocatorias del máster.
 * Lo comparten el panel y la API, así que no importa nada del navegador.
 */

export const LEAD_STATUSES = ['new', 'contacted', 'admission', 'call', 'followup', 'enrolled', 'paid', 'lost'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export function isLeadStatus(v: unknown): v is LeadStatus {
  return typeof v === 'string' && (LEAD_STATUSES as readonly string[]).includes(v);
}

/** Las etapas del camino, sin «Descartado». */
export type Stage = Exclude<LeadStatus, 'lost'>;

/** Etapas por orden, de la primera a la última. «Descartado» queda fuera: no es un paso del camino. */
export const PIPELINE: { status: Stage; label: string; hint: string }[] = [
  { status: 'new', label: 'Nuevo', hint: 'Sin atender' },
  { status: 'contacted', label: 'Contactado', hint: 'Ya hemos hablado con él' },
  { status: 'admission', label: 'Admisión', hint: 'En proceso de admisión' },
  { status: 'call', label: 'Llamada', hint: 'Llamada agendada o hecha' },
  { status: 'followup', label: 'Seguimiento', hint: 'Pendiente de decidir' },
  { status: 'enrolled', label: 'Matriculado', hint: 'Ha dado el paso' },
  { status: 'paid', label: 'Pagado', hint: 'Ya está en clase' },
];

/** Siguiente etapa del camino (null en la última o en descartado). */
export function nextStatus(status: LeadStatus): LeadStatus | null {
  const i = PIPELINE.findIndex((p) => p.status === status);
  return i >= 0 && i < PIPELINE.length - 1 ? PIPELINE[i + 1].status : null;
}

/** Ha llegado al menos a esa etapa (un pagado cuenta como matriculado, y así hacia atrás). */
export function reachedStatus(status: LeadStatus, at: LeadStatus): boolean {
  const a = PIPELINE.findIndex((p) => p.status === status);
  const b = PIPELINE.findIndex((p) => p.status === at);
  return a >= 0 && b >= 0 && a >= b;
}

export interface Cohort {
  id: string;
  name: string;
  /** Día de inicio, YYYY-MM-DD */
  starts_at: string;
  /** Plazas del grupo (0 = sin límite fijado) */
  capacity: number;
  created_at: string;
}

export interface CohortStats {
  /** Leads asignados a la convocatoria, sin los descartados */
  total: number;
  enrolled: number;
  /** Han pagado: los que están en clase */
  paid: number;
  /** Plazas que quedan según las pagadas; null si no hay plazas fijadas */
  free: number | null;
}

export function cohortStats(cohort: Cohort, leads: { cohort_id?: string | null; status: string }[]): CohortStats {
  let total = 0;
  let enrolled = 0;
  let paid = 0;
  for (const l of leads) {
    if (l.cohort_id !== cohort.id || l.status === 'lost') continue;
    total += 1;
    if (l.status === 'enrolled') enrolled += 1;
    if (l.status === 'paid') paid += 1;
  }
  return { total, enrolled, paid, free: cohort.capacity > 0 ? Math.max(0, cohort.capacity - enrolled - paid) : null };
}

const DAY_MS = 86400000;

/** Días que faltan para el inicio (negativo si ya empezó). Compara días naturales, sin horas. */
export function daysUntil(startsAt: string, now: Date = new Date()): number {
  const [y, m, d] = startsAt.split('-').map(Number);
  const start = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((start - today) / DAY_MS);
}

/** «empieza hoy», «empieza mañana», «empieza en 12 días», «empezó hace 3 días»… */
export function startLabel(startsAt: string, now: Date = new Date()): string {
  const n = daysUntil(startsAt, now);
  if (n === 0) return 'Empieza hoy';
  if (n === 1) return 'Empieza mañana';
  if (n > 1) return `Empieza en ${n} días`;
  if (n === -1) return 'Empezó ayer';
  return `Empezó hace ${-n} días`;
}

/** «15 de septiembre de 2026» */
export function formatStartDate(startsAt: string): string {
  const [y, m, d] = startsAt.split('-').map(Number);
  return new Intl.DateTimeFormat('es-ES', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** La convocatoria que toca mostrar por defecto: la próxima que empieza o, si todas han empezado, la más reciente. */
export function defaultCohort(cohorts: Cohort[], now: Date = new Date()): Cohort | null {
  if (cohorts.length === 0) return null;
  const sorted = cohorts.slice().sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  return sorted.find((c) => daysUntil(c.starts_at, now) >= 0) || sorted[sorted.length - 1];
}

/** Cuántos han llegado al menos a cada etapa (un pagado cuenta en todas las anteriores). Los descartados no cuentan. */
export function reachCounts(leads: { status: string }[]): Record<Stage, number> {
  const out: Record<Stage, number> = { new: 0, contacted: 0, admission: 0, call: 0, followup: 0, enrolled: 0, paid: 0 };
  for (const l of leads) {
    if (!isLeadStatus(l.status) || l.status === 'lost') continue;
    for (const p of PIPELINE) if (reachedStatus(l.status, p.status)) out[p.status] += 1;
  }
  return out;
}

/** De cada 100 que llegaron a una etapa, cuántos pasaron a la siguiente. Null si nadie llegó a la primera. */
export function passRate(from: number, to: number): number | null {
  return from > 0 ? Math.round((Math.min(to, from) / from) * 100) : null;
}

/** «hoy», «ayer», «hace 3 días», «hace 2 semanas», «hace 4 meses»: cuánto lleva algo en su etapa. */
export function sinceLabel(iso: string | null | undefined, now: Date = new Date()): string {
  const t = iso ? Date.parse(iso) : NaN;
  if (Number.isNaN(t)) return '';
  const days = Math.floor((now.getTime() - t) / DAY_MS);
  if (days <= 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 14) return `hace ${days} días`;
  if (days < 60) return `hace ${Math.floor(days / 7)} semanas`;
  return `hace ${Math.floor(days / 30)} meses`;
}
