'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Save, Trash2 } from 'lucide-react';
import Modal from '@/components/portal/Modal';
import { crm } from '@/components/portal/crmApi';
import { STARTER_TEMPLATES, type EmailTemplate } from '@/lib/campaignTemplates';

type Choice = { subject: string; body: string };

/**
 * Plantillas: las de partida de IDESIE y las que has guardado tú. Elegir una sustituye asunto y texto
 * (pide confirmación si ya hay algo escrito); «Guardar como plantilla» guarda lo que hay ahora.
 */
export default function TemplatePicker({
  token,
  current,
  onPick,
  onClose,
}: {
  token: string | undefined;
  current: Choice;
  onPick: (t: Choice) => void;
  onClose: () => void;
}) {
  const [saved, setSaved] = useState<EmailTemplate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Choice | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const hasContent = !!(current.subject.trim() || current.body.trim());

  const load = useCallback(async () => {
    try {
      setSaved((await crm<{ templates: EmailTemplate[] }>(token, '/api/templates')).templates);
    } catch (err: any) {
      setSaved([]);
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const choose = (t: Choice) => (hasContent ? setPending(t) : onPick(t));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await crm(token, '/api/templates', { method: 'POST', body: { name, subject: current.subject, body: current.body } });
      setName('');
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await crm(token, `/api/templates/${id}`, { method: 'DELETE' });
      setSaved((list) => (list || []).filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (pending) {
    return (
      <Modal title="¿Reemplazar el contenido?" onClose={() => setPending(null)}>
        <p className="text-sm text-white/70 leading-relaxed">El asunto y el texto actuales se sustituirán por los de la plantilla. Se pueden recuperar con Ctrl/⌘+Z en el texto.</p>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setPending(null)} className="px-5 h-10 rounded-full border border-white/15 text-sm cursor-pointer">Volver</button>
          <button onClick={() => onPick(pending)} className="px-6 h-10 rounded-full portal-cta text-sm cursor-pointer">Usar plantilla</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Plantillas" onClose={onClose} wide>
      <div className="space-y-6">
        {error && <p role="alert" className="text-sm rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 px-4 py-3">{error}</p>}

        <section>
          <h3 className="text-xs uppercase tracking-widest text-white/40 mb-2">De partida</h3>
          <ul className="grid sm:grid-cols-2 gap-2">
            {STARTER_TEMPLATES.map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => choose(t)} className="w-full text-left rounded-2xl border border-[var(--portal-line-strong)] hover:border-[var(--signal)]/60 px-4 py-3 cursor-pointer transition-colors">
                  <span className="block text-sm font-semibold">{t.name}</span>
                  <span className="block text-xs text-white/50 mt-0.5 truncate">{t.subject}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-xs uppercase tracking-widest text-white/40 mb-2">Tus plantillas</h3>
          {saved === null ? (
            <Loader2 className="w-4 h-4 animate-spin text-white/40" />
          ) : saved.length === 0 ? (
            <p className="text-sm text-white/45">Aún no has guardado ninguna. Escribe un email y guárdalo aquí abajo para reutilizarlo.</p>
          ) : (
            <ul className="space-y-2">
              {saved.map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <button type="button" onClick={() => choose(t)} className="flex-1 min-w-0 text-left rounded-2xl border border-[var(--portal-line-strong)] hover:border-[var(--signal)]/60 px-4 py-3 cursor-pointer transition-colors">
                    <span className="block text-sm font-semibold truncate">{t.name}</span>
                    <span className="block text-xs text-white/50 mt-0.5 truncate">{t.subject || 'Sin asunto'}</span>
                  </button>
                  <button type="button" onClick={() => remove(t.id)} aria-label={`Borrar la plantilla ${t.name}`} className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-white/[0.06] cursor-pointer transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form onSubmit={save} className="pt-4 border-t border-white/10">
          <label htmlFor="tpl-name" className="block text-xs uppercase tracking-widest text-white/40 mb-1.5">Guardar el email actual como plantilla</label>
          <div className="flex gap-2">
            <input id="tpl-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Nombre de la plantilla" className="flex-1 min-w-0 px-4 py-2.5 border border-[var(--portal-line-strong)] rounded-xl text-sm outline-none placeholder:text-white/30" />
            <button type="submit" disabled={saving || !name.trim() || !current.body.trim()} className="px-5 h-10 rounded-full portal-cta text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 shrink-0">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
