import { sanitizeString } from '@/lib/validation';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface CohortValues {
  name?: string;
  starts_at?: string;
  capacity?: number;
}

/** Valida el cuerpo de una convocatoria. Con `partial` solo exige lo que venga; sin él, nombre y fecha son obligatorios. */
export function parseCohortBody(body: any, opts: { partial: boolean }): { values: CohortValues } | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Datos no válidos' };
  const values: CohortValues = {};

  if (body.name !== undefined || !opts.partial) {
    const name = sanitizeString(String(body.name ?? ''), 120);
    if (!name) return { error: 'Pon un nombre a la convocatoria' };
    values.name = name;
  }
  if (body.starts_at !== undefined || !opts.partial) {
    const date = String(body.starts_at ?? '');
    if (!DATE_RE.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) return { error: 'Elige una fecha de inicio válida' };
    values.starts_at = date;
  }
  if (body.capacity !== undefined) {
    const capacity = Number(body.capacity);
    if (!Number.isInteger(capacity) || capacity < 0 || capacity > 10000) return { error: 'Las plazas deben ser un número entero (0 si no hay límite)' };
    values.capacity = capacity;
  }
  if (opts.partial && Object.keys(values).length === 0) return { error: 'No hay nada que cambiar' };
  return { values };
}
