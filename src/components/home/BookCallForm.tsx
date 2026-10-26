'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { metaTrack } from '@/lib/metaPixel';
import { ArrowUpRight, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { BUDGET_OPTIONS, NEED_OPTIONS, TIMELINE_OPTIONS } from '@/lib/booking';
import { calendlyUrl, isCalendlyScheduled } from '@/lib/calendly';

const inputClass =
  'w-full bg-transparent border-b border-white/20 focus:border-[var(--signal)] outline-none py-3 text-lg transition-colors placeholder:text-white/25';
const labelClass = 'block text-xs uppercase tracking-widest text-white/40 mb-2';

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`px-4 py-2 rounded-full border text-sm transition-colors ${
        selected
          ? 'bg-[var(--signal)] border-[var(--signal)] text-black font-medium'
          : 'border-white/15 text-white/70 hover:border-white/40 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Reserva de llamada en dos pasos: primero nos deja sus datos (así nunca se pierde un contacto, aunque no llegue
 * a reservar) y después elige el día y la hora en el calendario de Calendly, incrustado ya con su nombre y email.
 * Se muestra en la página y en el diálogo que abren todos los botones de «Agendar llamada».
 */
export default function BookCallForm({
  businessName,
  pack,
  onClose,
}: {
  businessName: string;
  /** Programa por el que pregunta («Máster BIM Full Time · landing»…). Se guarda con el lead. */
  pack?: string;
  onClose?: () => void;
}) {
  // El formulario de la página y el diálogo pueden estar a la vez: los ids no pueden chocar
  const uid = useId();
  const [step, setStep] = useState<1 | 2>(1);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [needs, setNeeds] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [message, setMessage] = useState('');
  const [marketing, setMarketing] = useState(false);

  const [status, setStatus] = useState<'idle' | 'sending'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [calendarLoaded, setCalendarLoaded] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const toggleNeed = (n: string) => setNeeds((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]));

  // El dominio sale del navegador, así que se calcula tras montar (el servidor no lo conoce)
  const [embedDomain, setEmbedDomain] = useState('');
  useEffect(() => setEmbedDomain(window.location.hostname), []);
  const calendarSrc = useMemo(() => calendlyUrl({ name, email, embedDomain }), [name, email, embedDomain]);

  // Calendly avisa desde su iframe cuando la persona termina de reservar
  useEffect(() => {
    if (step !== 2) return;
    const onMessage = (e: MessageEvent) => {
      if (!isCalendlyScheduled(e.origin, e.data)) return;
      setBooked(true);
      metaTrack('Schedule', { content_name: pack || 'Llamada' }, leadId ? `call-${leadId}` : undefined);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [step, pack, leadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'call',
          name, email, phone, company,
          message: pack ? `Interés: ${pack}${message.trim() ? `\n${message.trim()}` : ''}` : message,
          answers: { needs, budget, timeline },
          marketing,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar. Inténtalo de nuevo.');
      // Lead = contacto conseguido; eventID evita duplicados con un posible envío desde servidor
      metaTrack('Lead', { content_name: pack || 'Llamada' }, data.id ? `lead-${data.id}` : undefined);
      setLeadId(data.id || null);
      setStep(2);
      topRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar. Inténtalo de nuevo.');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div ref={topRef}>
      {/* Progreso */}
      <ol className="flex items-center gap-3 mb-8" aria-label={`Paso ${step} de 2`}>
        {[1, 2].map((n) => (
          <li key={n} className="flex items-center gap-3 flex-1 last:flex-none" aria-current={step === n ? 'step' : undefined}>
            <span
              className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center border transition-colors ${
                step >= n ? 'bg-[var(--signal)] border-[var(--signal)] text-black' : 'border-white/20 text-white/40'
              }`}
            >
              {n}
            </span>
            <span className={`text-xs uppercase tracking-widest ${step >= n ? 'text-white' : 'text-white/30'}`}>
              {n === 1 ? 'Tus datos' : 'Día y hora'}
            </span>
            {n === 1 && <span className={`flex-1 h-px ${step > 1 ? 'bg-[var(--signal)]' : 'bg-white/15'}`} />}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          {error && (
            <p role="alert" className="md:col-span-2 text-sm text-red-400">
              {error}
            </p>
          )}

          {pack && (
            <p className="md:col-span-2 text-sm rounded-2xl border border-[var(--signal)]/40 bg-[var(--signal)]/10 px-4 py-3">
              <span className="text-white/60">Interés:</span> <strong className="font-semibold">{pack}</strong>
            </p>
          )}

          <div>
            <label htmlFor={`${uid}-name`} className={labelClass}>Nombre</label>
            <input id={`${uid}-name`} required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Tu nombre" />
          </div>
          <div>
            <label htmlFor={`${uid}-company`} className={labelClass}>Empresa <span className="normal-case tracking-normal text-white/25">(opcional)</span></label>
            <input id={`${uid}-company`} autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} placeholder="Tu empresa o centro" />
          </div>
          <div>
            <label htmlFor={`${uid}-email`} className={labelClass}>Email</label>
            <input id={`${uid}-email`} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="tu@empresa.com" />
          </div>
          <div>
            <label htmlFor={`${uid}-phone`} className={labelClass}>Teléfono</label>
            <input id={`${uid}-phone`} type="tel" required autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+34 600 000 000" />
          </div>

          <fieldset className="md:col-span-2">
            <legend className={labelClass}>¿Qué te interesa? <span className="normal-case tracking-normal text-white/25">(elige las que quieras)</span></legend>
            <div className="flex flex-wrap gap-2">
              {NEED_OPTIONS.map((n) => (
                <Chip key={n} selected={needs.includes(n)} onClick={() => toggleNeed(n)}>{n}</Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className={labelClass}>Inversión aproximada</legend>
            <div className="flex flex-wrap gap-2">
              {BUDGET_OPTIONS.map((b) => (
                <Chip key={b} selected={budget === b} onClick={() => setBudget(budget === b ? '' : b)}>{b}</Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className={labelClass}>¿Cuándo quieres empezar?</legend>
            <div className="flex flex-wrap gap-2">
              {TIMELINE_OPTIONS.map((t) => (
                <Chip key={t} selected={timeline === t} onClick={() => setTimeline(timeline === t ? '' : t)}>{t}</Chip>
              ))}
            </div>
          </fieldset>

          <div className="md:col-span-2">
            <label htmlFor={`${uid}-message`} className={labelClass}>¿Algo más que debamos saber? <span className="normal-case tracking-normal text-white/25">(opcional)</span></label>
            <textarea id={`${uid}-message`} rows={2} value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputClass} resize-none`} placeholder="Cuéntanos qué buscas en una frase" />
          </div>

          <label className="md:col-span-2 flex items-start gap-3 text-sm text-white/60 cursor-pointer">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--signal)] cursor-pointer"
            />
            <span>
              Quiero recibir por email novedades de formación y eventos de {businessName}. Puedo darme de baja cuando quiera.
            </span>
          </label>

          <div className="md:col-span-2 flex items-center justify-between flex-wrap gap-4 mt-2">
            <p className="text-xs text-white/30 max-w-xs">
              Al continuar aceptas que {businessName} te contacte para esta llamada. Después eliges el día y la hora.
            </p>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="group inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-[var(--signal)] text-black hover:bg-[var(--signal-dim)] disabled:opacity-60 transition-colors"
            >
              <span className="text-sm font-medium tracking-wide">
                {status === 'sending' ? 'Enviando…' : 'Elegir día y hora'}
              </span>
              <span className="w-9 h-9 rounded-full bg-[#00132e] text-[var(--signal)] flex items-center justify-center group-hover:rotate-45 transition-transform">
                {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
              </span>
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div>
          <p className="flex items-start gap-2 text-sm text-white/70 mb-5" role="status">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[var(--signal)]" aria-hidden="true" />
            <span>
              {booked
                ? `Llamada reservada, ${name.split(' ')[0]}. Te llega la confirmación a ${email}.`
                : `Gracias, ${name.split(' ')[0]}. Ya tenemos tus datos: elige ahora el día y la hora de la llamada.`}
            </span>
          </p>

          <div className="relative rounded-2xl overflow-hidden bg-white min-h-[640px]">
            {!calendarLoaded && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-[#0a1f44]/60" aria-hidden="true">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando el calendario…
              </div>
            )}
            {embedDomain && (
              <iframe
                src={calendarSrc}
                title="Calendario para elegir el día y la hora de la llamada"
                onLoad={() => setCalendarLoaded(true)}
                className="relative w-full h-[700px] border-0"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
            <a
              href={calendlyUrl({ name, email })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors"
            >
              ¿No se ve bien? Abrir el calendario en otra pestaña <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-white/15 hover:border-white/40 text-sm transition-colors"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
