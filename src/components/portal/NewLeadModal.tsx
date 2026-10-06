'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/portal/Modal';
import { crm } from '@/components/portal/crmApi';

const fieldClass = 'w-full px-4 py-2.5 border border-[var(--portal-line-strong)] rounded-xl text-sm outline-none placeholder:text-white/30';
const labelClass = 'block text-xs uppercase tracking-widest text-white/40 mb-1.5';

/** Alta a mano de un lead (te escribió por teléfono, en una feria, por WhatsApp…). */
export default function NewLeadModal({
  token,
  onClose,
  onCreated,
}: {
  token: string | undefined;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await crm(token, '/api/leads', { method: 'POST', body: { name, email, phone, company, message } });
      onCreated();
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title="Nuevo lead" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="nl-name" className={labelClass}>Nombre</label>
          <input id="nl-name" required value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} autoFocus placeholder="Nombre y apellidos" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nl-email" className={labelClass}>Email</label>
            <input id="nl-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} placeholder="nombre@empresa.com" />
          </div>
          <div>
            <label htmlFor="nl-phone" className={labelClass}>Teléfono</label>
            <input id="nl-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} placeholder="+34 600 000 000" />
          </div>
        </div>
        <div>
          <label htmlFor="nl-company" className={labelClass}>Empresa o centro</label>
          <input id="nl-company" value={company} onChange={(e) => setCompany(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="nl-message" className={labelClass}>¿Qué busca? <span className="normal-case tracking-normal text-white/30">(opcional)</span></label>
          <textarea id="nl-message" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={`${fieldClass} resize-none`} placeholder="Máster BIM online, perfil BIM Manager…" />
        </div>
        <p className="text-xs text-white/40">Hace falta al menos un email o un teléfono. Si pones email, también entra en Contactos (sin consentimiento para campañas).</p>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 px-6 h-11 rounded-full portal-cta text-sm cursor-pointer disabled:opacity-60">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Añadir lead
          </button>
        </div>
      </form>
    </Modal>
  );
}
