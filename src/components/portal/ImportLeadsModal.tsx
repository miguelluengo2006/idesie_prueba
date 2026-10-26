'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, FileSpreadsheet, Loader2, Upload } from 'lucide-react';
import Modal from '@/components/portal/Modal';
import { crm } from '@/components/portal/crmApi';
import { PIPELINE, type Cohort, type LeadStatus } from '@/lib/admissions';
import { decodeCsvBytes, parseLeadsCsv, type ParsedImport } from '@/lib/leadsImport';

const fieldClass = 'w-full px-4 py-2.5 border border-[var(--portal-line-strong)] rounded-xl text-sm outline-none';
const labelClass = 'block text-xs uppercase tracking-widest text-white/40 mb-1.5';
const BATCH = 500;

interface Totals {
  created: number;
  duplicates: number;
  invalid: number;
}

/** Sube el CSV de leads de Facebook (Meta): lo lee en el navegador, enseña lo que ha entendido y lo importa por tandas. */
export default function ImportLeadsModal({
  token,
  cohorts,
  onClose,
  onImported,
}: {
  token: string | undefined;
  cohorts: Cohort[];
  onClose: () => void;
  onImported: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParsedImport | null>(null);
  const [cohortId, setCohortId] = useState('');
  const [status, setStatus] = useState<LeadStatus>('new');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setParsed(null);
    setFileName(file.name);
    try {
      const result = parseLeadsCsv(decodeCsvBytes(await file.arrayBuffer()));
      if (result.rows.length === 0) {
        setError(
          result.skipped > 0
            ? 'Ninguna fila tiene email ni teléfono, así que no se puede contactar a nadie. Comprueba que el archivo es el de leads de Meta.'
            : 'No he encontrado leads en el archivo. Descarga el CSV desde Leads Center o desde el Administrador de anuncios.'
        );
        return;
      }
      setParsed(result);
    } catch {
      setError('No he podido leer el archivo. Pruébalo con un CSV.');
    }
  };

  const run = async () => {
    if (!parsed) return;
    setBusy(true);
    setError(null);
    const sum: Totals = { created: 0, duplicates: 0, invalid: 0 };
    try {
      for (let i = 0; i < parsed.rows.length; i += BATCH) {
        const res = await crm<Totals>(token, '/api/leads/import', {
          method: 'POST',
          body: { rows: parsed.rows.slice(i, i + BATCH), cohort_id: cohortId || null, status },
        });
        sum.created += res.created;
        sum.duplicates += res.duplicates;
        sum.invalid += res.invalid;
      }
      setTotals(sum);
    } catch (err: any) {
      // Lo ya importado se queda; si había avance se dice
      setTotals(sum.created + sum.duplicates > 0 ? sum : null);
      setError(err.message);
    } finally {
      setBusy(false);
      onImported();
    }
  };

  if (totals && !error) {
    return (
      <Modal title="Importación terminada" onClose={onClose}>
        <div className="flex flex-col items-center text-center py-4" role="status">
          <CheckCircle2 className="w-10 h-10 text-green-400 mb-3" aria-hidden="true" />
          <p className="text-lg font-semibold">{totals.created} {totals.created === 1 ? 'lead importado' : 'leads importados'}</p>
          <p className="text-sm text-white/55 mt-1">
            {totals.duplicates > 0 && `${totals.duplicates} ya estaban en el panel. `}
            {totals.invalid > 0 && `${totals.invalid} no se pudieron importar por datos no válidos.`}
            {totals.duplicates === 0 && totals.invalid === 0 && 'Ya los tienes en el embudo.'}
          </p>
          <button onClick={onClose} className="mt-6 px-6 h-11 rounded-full portal-cta text-sm cursor-pointer">Ver los leads</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Importar leads de Facebook" onClose={onClose} wide>
      <div className="space-y-5">
        <p className="text-sm text-white/55">
          En Meta, abre <strong className="text-white/80">Leads Center</strong> (o el Administrador de anuncios → Formularios instantáneos) y pulsa
          <strong className="text-white/80"> Descargar CSV</strong>. Sube aquí ese archivo: los que ya estén en el panel (mismo email o teléfono) se ignoran.
        </p>

        <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/csv" className="sr-only" aria-label="Archivo de leads" onChange={(e) => onFile(e.target.files?.[0])} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center gap-3 rounded-2xl border border-dashed border-[var(--portal-line-strong)] hover:border-[var(--signal)] px-4 py-5 text-left cursor-pointer transition-colors"
        >
          <span className="w-10 h-10 rounded-2xl bg-[var(--signal)]/10 text-[var(--signal)] flex items-center justify-center shrink-0">
            {fileName ? <FileSpreadsheet className="w-5 h-5" aria-hidden="true" /> : <Upload className="w-5 h-5" aria-hidden="true" />}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium truncate">{fileName || 'Elegir el archivo CSV'}</span>
            <span className="block text-xs text-white/45">{fileName ? 'Pulsa para elegir otro' : 'Descargado de Meta (UTF-8 o UTF-16)'}</span>
          </span>
        </button>

        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        {error && totals && (
          <p className="text-sm text-white/60">Antes del fallo se importaron {totals.created} leads. Si vuelves a subir el archivo, esos se ignorarán.</p>
        )}

        {parsed && (
          <>
            <div>
              <p className="text-sm">
                <strong className="text-base">{parsed.rows.length}</strong> {parsed.rows.length === 1 ? 'lead listo' : 'leads listos'} para importar
                {parsed.skipped > 0 && <span className="text-white/45"> · {parsed.skipped} sin email ni teléfono (se omiten)</span>}
              </p>
              <ul className="flex flex-wrap gap-1.5 mt-2" aria-label="Columnas reconocidas">
                {parsed.recognized.map((r) => <li key={r} className="px-2.5 py-0.5 rounded-full border border-white/15 text-xs text-white/65">{r}</li>)}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="pn-title text-left border-b border-white/10">
                    <th scope="col" className="px-3 py-2 font-medium">Nombre</th>
                    <th scope="col" className="px-3 py-2 font-medium">Contacto</th>
                    <th scope="col" className="px-3 py-2 font-medium">Campaña</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {parsed.rows.slice(0, 5).map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 max-w-[160px] truncate">{r.name}</td>
                      <td className="px-3 py-2 text-white/60 max-w-[200px] truncate">{r.phone || r.email}</td>
                      <td className="px-3 py-2 text-white/60 max-w-[180px] truncate">{r.campaign || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.rows.length > 5 && <p className="px-3 py-2 text-xs text-white/40 border-t border-white/10">y {parsed.rows.length - 5} más</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="imp-stage" className={labelClass}>Etapa inicial</label>
                <select id="imp-stage" value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} className={fieldClass}>
                  {PIPELINE.map((p) => <option key={p.status} value={p.status}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="imp-cohort" className={labelClass}>Convocatoria</label>
                <select id="imp-cohort" value={cohortId} onChange={(e) => setCohortId(e.target.value)} className={fieldClass}>
                  <option value="">Sin convocatoria</option>
                  {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <p className="text-xs text-white/40">
              Los que tengan email entran también en Contactos, sin consentimiento para campañas: rellenar un formulario de anuncio no es aceptar emails.
            </p>

            <div className="flex justify-end">
              <button onClick={run} disabled={busy} className="inline-flex items-center gap-2 px-6 h-11 rounded-full portal-cta text-sm cursor-pointer disabled:opacity-60">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Importar {parsed.rows.length} {parsed.rows.length === 1 ? 'lead' : 'leads'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
