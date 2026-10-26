'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/portal/Modal';
import { crm } from '@/components/portal/crmApi';
import type { Cohort } from '@/lib/admissions';

const fieldClass = 'w-full px-4 py-2.5 border border-[var(--portal-line-strong)] rounded-xl text-sm outline-none placeholder:text-white/30';
const labelClass = 'block text-xs uppercase tracking-widest text-white/40 mb-1.5';

/** Crea o edita una convocatoria del máster: nombre, día de inicio y plazas. */
export default function CohortModal({
  token,
  cohort,
  onClose,
  onSaved,
}: {
  token: string | undefined;
  /** Sin convocatoria = alta nueva */
  cohort?: Cohort;
  onClose: () => void;
  onSaved: (id?: string) => void;
}) {
  const [name, setName] = useState(cohort?.name || '');
  const [startsAt, setStartsAt] = useState(cohort?.starts_at || '');
  const [capacity, setCapacity] = useState(cohort ? String(cohort.capacity || '') : '');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = { name, starts_at: startsAt, capacity: capacity.trim() === '' ? 0 : Number(capacity) };
      const res = cohort
        ? await crm<{ cohort: Cohort }>(token, `/api/cohorts/${cohort.id}`, { method: 'PATCH', body })
        : await crm<{ cohort: Cohort }>(token, '/api/cohorts', { method: 'POST', body });
      onSaved(res.cohort.id);
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!cohort) return;
    setBusy(true);
    setError(null);
    try {
      await crm(token, `/api/cohorts/${cohort.id}`, { method: 'DELETE' });
      onSaved();
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={cohort ? 'Editar convocatoria' : 'Nueva convocatoria'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="co-name" className={labelClass}>Nombre</label>
          <input id="co-name" required value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} autoFocus placeholder="Máster BIM Full Time · 2026" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="co-date" className={labelClass}>Empieza el</label>
            <input id="co-date" type="date" required value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="co-cap" className={labelClass}>Plazas</label>
            <input id="co-cap" type="number" inputMode="numeric" min={0} step={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} className={fieldClass} placeholder="25" />
          </div>
        </div>
        <p className="text-xs text-white/40">Las plazas se cuentan con los leads en Matriculado y Pagado. Déjalo vacío si no hay límite.</p>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <div className="flex items-center justify-between gap-3">
          {cohort ? (
            confirmDelete ? (
              <span className="flex items-center gap-2 text-xs">
                <button type="button" onClick={remove} disabled={busy} className="px-3 h-9 rounded-full bg-red-500/90 text-white font-semibold cursor-pointer disabled:opacity-60">Sí, eliminar</button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="px-3 h-9 rounded-full text-white/60 hover:text-white cursor-pointer">No</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="text-xs text-red-400 hover:text-red-300 cursor-pointer">Eliminar convocatoria</button>
            )
          ) : <span />}
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 px-6 h-11 rounded-full portal-cta text-sm cursor-pointer disabled:opacity-60">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} {cohort ? 'Guardar' : 'Crear convocatoria'}
          </button>
        </div>
        {confirmDelete && <p className="text-xs text-white/45">Los leads de esta convocatoria no se borran: se quedan sin convocatoria.</p>}
      </form>
    </Modal>
  );
}
