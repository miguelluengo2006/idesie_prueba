'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useBookCall } from '@/components/home/BookCall';
import { metaTrack } from '@/lib/metaPixel';

export const INTERESTS = [
  { id: 'mbim', label: 'Máster BIM · presencial' },
  { id: 'mbbe', label: 'Máster BIM & Building Engineering' },
  { id: 'mbim-online', label: 'Máster BIM · online' },
  { id: 'dudo', label: 'Aún no lo sé' },
] as const;

const CHK = "appearance-none shrink-0 w-5 h-5 rounded-md border-2 border-[#7f98bd] bg-[#fff] checked:border-[#0063e6] checked:bg-[#0063e6] checked:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 10.5l3.2 3.2L15 6.8'/%3E%3C/svg%3E\")] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0063e6]";
const RAD = "appearance-none shrink-0 w-5 h-5 rounded-full border-2 border-[#7f98bd] bg-[#fff] checked:border-[6px] checked:border-[#0063e6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0063e6]";

export const LEAD_EVENT = 'landing:interest';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];

/** Guarda la atribución de la primera visita (los anuncios llegan con ?utm_…) para enviarla con el lead. */
function readUtm(): Record<string, string> {
  try {
    const stored = sessionStorage.getItem('idesie_utm');
    if (stored) return JSON.parse(stored);
    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) found[k] = v;
    }
    if (Object.keys(found).length) sessionStorage.setItem('idesie_utm', JSON.stringify(found));
    return found;
  } catch {
    return {};
  }
}

/** Formulario corto de captación: tres datos y una casilla. Lo demás lo aclara el equipo en la llamada. */
export default function LeadForm({ idSuffix = 'main' }: { idSuffix?: string }) {
  const uid = useId();
  const { open } = useBookCall();
  const [interest, setInterest] = useState<(typeof INTERESTS)[number]['id']>('mbim');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onPick = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      if (INTERESTS.some((i) => i.id === slug)) setInterest(slug as (typeof INTERESTS)[number]['id']);
    };
    window.addEventListener(LEAD_EVENT, onPick);
    return () => window.removeEventListener(LEAD_EVENT, onPick);
  }, []);

  const label = INTERESTS.find((i) => i.id === interest)!.label;
  const field =
    'w-full min-h-11 rounded-xl border border-[#c9d9f0] bg-[#fff] text-[#0a1f44] px-4 text-base placeholder:text-[#566782] focus:outline-none focus:border-[#0063e6] focus:ring-2 focus:ring-[#0063e6]/25';
  const lbl = 'block text-sm font-semibold text-[#0a1f44] mb-1.5';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setError(null);
    if (!consent) return setError('Acepta la política de privacidad para que podamos contactarte.');
    setStatus('sending');
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'landing',
          kind: 'proposal',
          name,
          phone,
          email,
          message: `Interés: ${label}\nOrigen: /landing`,
          utm: readUtm(),
          marketing,
          website: trap,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar. Inténtalo de nuevo.');
      metaTrack('Lead', { content_name: label });
      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar. Inténtalo de nuevo.');
      setStatus('idle');
    }
  };

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-3xl bg-[#fff] text-[#0a1f44] p-6 md:p-8 text-center">
        <CheckCircle2 className="w-12 h-12 mx-auto text-[#0063e6]" aria-hidden="true" />
        <h3 className="font-kinetic font-bold text-2xl mt-4">¡Recibido, {name.split(' ')[0]}!</h3>
        <p className="mt-3 text-[#0a1f44]/75 leading-relaxed">
          Te contactamos pronto para contarte cómo es el <strong>{label}</strong> y resolver tus dudas. Si prefieres no esperar, elige tú el momento.
        </p>
        <button type="button" onClick={() => open(label)} className="btn btn-blue mt-6 w-full justify-center">
          Agendar mi llamada ahora
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate={false} className="rounded-3xl bg-[#fff] text-[#0a1f44] p-5 md:p-7 shadow-[0_30px_80px_-30px_rgba(0,20,70,0.55)]" aria-label="Solicitar información">
      <h2 className="font-kinetic font-bold text-xl md:text-2xl leading-tight">Pide información, sin compromiso</h2>
      <p className="text-sm text-[#0a1f44]/70 mt-1.5">Tarda 30 segundos. Te respondemos por teléfono o WhatsApp.</p>

      <fieldset className="mt-4">
        <legend className={lbl}>¿Qué te interesa?</legend>
        <div className="grid gap-1.5">
          {INTERESTS.map((o) => (
            <label
              key={o.id}
              className={`flex items-center gap-3 min-h-10 rounded-xl border px-3.5 cursor-pointer text-sm transition-colors ${
                interest === o.id ? 'border-[#0063e6] bg-[#e9f0fc] font-semibold' : 'border-[#c9d9f0] hover:border-[#0063e6]/60'
              }`}
            >
              <input type="radio" name={`${uid}-interest`} value={o.id} checked={interest === o.id} onChange={() => setInterest(o.id)} className={RAD} />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-3.5 grid gap-3">
        <div>
          <label htmlFor={`${uid}-name-${idSuffix}`} className={lbl}>Nombre</label>
          <input id={`${uid}-name-${idSuffix}`} className={field} required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
        </div>
        <div>
          <label htmlFor={`${uid}-phone-${idSuffix}`} className={lbl}>Teléfono / WhatsApp</label>
          <input id={`${uid}-phone-${idSuffix}`} className={field} required type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="600 000 000" />
        </div>
        <div>
          <label htmlFor={`${uid}-email-${idSuffix}`} className={lbl}>
            Email <span className="font-normal text-[#0a1f44]/80">(opcional, para enviarte el dossier)</span>
          </label>
          <input id={`${uid}-email-${idSuffix}`} className={field} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
        </div>
        {/* Trampa para bots: las personas no la ven */}
        <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} className="absolute -left-[9999px] w-px h-px opacity-0" name="website" />
      </div>

      <label className="mt-4 flex items-start gap-3 text-sm leading-snug cursor-pointer">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className={`${CHK} mt-0.5`} />
        <span>
          He leído la <Link href="/privacidad" target="_blank" className="underline font-semibold">política de privacidad</Link> y acepto que IDESIE me contacte sobre mi solicitud.
        </span>
      </label>
      <label className="mt-2.5 flex items-start gap-3 text-sm leading-snug cursor-pointer text-[#0a1f44]/75">
        <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className={`${CHK} mt-0.5`} />
        <span>Quiero recibir novedades y convocatorias de IDESIE (opcional).</span>
      </label>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-[#fde8e8] text-[#8a1c1c] px-4 py-3 text-sm font-medium">
          {error}
        </p>
      )}

      <button type="submit" disabled={status === 'sending'} className="btn btn-blue mt-5 w-full justify-center min-h-14 text-base disabled:opacity-70">
        {status === 'sending' ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : null}
        {status === 'sending' ? 'Enviando…' : 'Quiero información'}
        {status !== 'sending' && <ArrowRight className="w-5 h-5" aria-hidden="true" />}
      </button>
      <p className="mt-3 text-xs text-center text-[#0a1f44]/80">Sin compromiso. Puedes darte de baja cuando quieras.</p>
    </form>
  );
}
