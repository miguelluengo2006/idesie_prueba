import { describe, expect, it } from 'vitest';
import { passRate, reachCounts, sinceLabel, cohortStats, daysUntil, defaultCohort, formatStartDate, isLeadStatus, nextStatus, reachedStatus, startLabel, type Cohort } from '../admissions';

const cohort = (over: Partial<Cohort> = {}): Cohort => ({ id: 'c1', name: 'Máster BIM 2026', starts_at: '2026-11-16', capacity: 25, created_at: '2026-01-01T00:00:00Z', ...over });
const day = (iso: string) => new Date(`${iso}T10:00:00`);

describe('etapas del embudo', () => {
  it('reconoce solo las etapas válidas', () => {
    expect(isLeadStatus('paid')).toBe(true);
    expect(isLeadStatus('won')).toBe(false);
    expect(isLeadStatus(undefined)).toBe(false);
  });

  it('avanza de una etapa a la siguiente y se detiene en pagado', () => {
    expect(nextStatus('new')).toBe('admission');
    expect(nextStatus('admission')).toBe('call');
    expect(nextStatus('call')).toBe('enrolled');
    expect(nextStatus('enrolled')).toBe('paid');
    expect(nextStatus('paid')).toBeNull();
    expect(nextStatus('lost')).toBeNull();
  });

  it('un pagado cuenta como haber llegado a matriculado, no al revés', () => {
    expect(reachedStatus('paid', 'enrolled')).toBe(true);
    expect(reachedStatus('enrolled', 'paid')).toBe(false);
    expect(reachedStatus('lost', 'new')).toBe(false);
  });
});

describe('convocatorias', () => {
  it('cuenta matriculados, pagados y plazas libres, sin los descartados ni los de otra convocatoria', () => {
    const leads = [
      { cohort_id: 'c1', status: 'paid' },
      { cohort_id: 'c1', status: 'paid' },
      { cohort_id: 'c1', status: 'enrolled' },
      { cohort_id: 'c1', status: 'admission' },
      { cohort_id: 'c1', status: 'lost' },
      { cohort_id: 'c2', status: 'paid' },
      { cohort_id: null, status: 'paid' },
    ];
    expect(cohortStats(cohort(), leads)).toEqual({ total: 4, enrolled: 1, paid: 2, free: 22 });
  });

  it('sin plazas fijadas no calcula plazas libres, y nunca salen negativas', () => {
    expect(cohortStats(cohort({ capacity: 0 }), []).free).toBeNull();
    expect(cohortStats(cohort({ capacity: 1 }), [{ cohort_id: 'c1', status: 'paid' }, { cohort_id: 'c1', status: 'paid' }]).free).toBe(0);
  });

  it('cuenta los días hasta el inicio por fecha, no por horas', () => {
    expect(daysUntil('2026-11-16', day('2026-11-16'))).toBe(0);
    expect(daysUntil('2026-11-16', new Date('2026-11-15T23:59:00'))).toBe(1);
    expect(daysUntil('2026-11-16', day('2026-11-06'))).toBe(10);
    expect(daysUntil('2026-11-16', day('2026-11-20'))).toBe(-4);
  });

  it('dice cuándo empieza en lenguaje natural', () => {
    expect(startLabel('2026-11-16', day('2026-11-16'))).toBe('Empieza hoy');
    expect(startLabel('2026-11-16', day('2026-11-15'))).toBe('Empieza mañana');
    expect(startLabel('2026-11-16', day('2026-11-04'))).toBe('Empieza en 12 días');
    expect(startLabel('2026-11-16', day('2026-11-17'))).toBe('Empezó ayer');
    expect(startLabel('2026-11-16', day('2026-11-19'))).toBe('Empezó hace 3 días');
  });

  it('da formato a la fecha de inicio', () => {
    expect(formatStartDate('2026-11-16')).toBe('16 de noviembre de 2026');
  });

  it('elige por defecto la próxima convocatoria y, si todas empezaron, la más reciente', () => {
    const a = cohort({ id: 'a', starts_at: '2026-03-01' });
    const b = cohort({ id: 'b', starts_at: '2026-11-16' });
    const c = cohort({ id: 'c', starts_at: '2027-02-01' });
    expect(defaultCohort([c, a, b], day('2026-10-26'))?.id).toBe('b');
    expect(defaultCohort([a, b], day('2027-01-01'))?.id).toBe('b');
    expect(defaultCohort([], day('2026-10-26'))).toBeNull();
  });
});

describe('línea de tiempo del proceso', () => {
  it('cuenta cuántos han llegado a cada etapa, sin los descartados', () => {
    const leads = [{ status: 'new' }, { status: 'admission' }, { status: 'call' }, { status: 'paid' }, { status: 'paid' }, { status: 'lost' }];
    expect(reachCounts(leads)).toEqual({ new: 5, admission: 4, call: 3, enrolled: 2, paid: 2 });
    expect(reachCounts([])).toEqual({ new: 0, admission: 0, call: 0, enrolled: 0, paid: 0 });
  });

  it('calcula qué porcentaje pasa a la siguiente etapa', () => {
    expect(passRate(4, 3)).toBe(75);
    expect(passRate(3, 1)).toBe(33);
    expect(passRate(0, 0)).toBeNull();
    expect(passRate(2, 5)).toBe(100);
  });

  it('dice cuánto lleva en la etapa', () => {
    const now = new Date('2026-10-26T12:00:00Z');
    expect(sinceLabel('2026-10-26T08:00:00Z', now)).toBe('hoy');
    expect(sinceLabel('2026-10-25T08:00:00Z', now)).toBe('ayer');
    expect(sinceLabel('2026-10-21T08:00:00Z', now)).toBe('hace 5 días');
    expect(sinceLabel('2026-10-05T08:00:00Z', now)).toBe('hace 3 semanas');
    expect(sinceLabel('2026-05-01T08:00:00Z', now)).toBe('hace 5 meses');
    expect(sinceLabel(null, now)).toBe('');
  });
});
