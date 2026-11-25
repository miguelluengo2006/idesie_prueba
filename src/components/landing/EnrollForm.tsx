'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Loader2, MessageCircle } from 'lucide-react';
import { CONTACT } from '@/lib/bim';
import { metaTrack } from '@/lib/metaPixel';

export const PROGRAMS = {
  presencial: { label: 'Presencial', interest: 'Máster BIM Presencial (Madrid)', short: 'Máster BIM Presencial' },
  online: { label: 'Online', interest: 'Máster BIM Online', short: 'Máster BIM Online' },
} as const;
export type ProgramKey = keyof typeof PROGRAMS;

/** Evento con el que los botones «Inscribirme al presencial / online» preseleccionan la modalidad del formulario. */
export const PROGRAM_EVENT = 'lx:program';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'] as const;
const UTM_STORE = 'lx-utm';
const PHONE_RE = /^[+()\d\s.-]{6,25}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Atribución del anuncio: la primera visita manda, y se guarda por si el visitante navega antes de inscribirse. */
function readUtm(): Record<string, string> | undefined {
  const fromUrl: Record<string, string> = {};
  try {
    const q = new URLSearchParams(window.location.search);
    for (const k of UTM_KEYS) {
      const v = q.get(k);
      if (v) fromUrl[k] = v.slice(0, 200);
    }
    if (Object.keys(fromUrl).length) {
      sessionStorage.setItem(UTM_STORE, JSON.stringify(fromUrl));
      return fromUrl;
    }
    const saved = sessionStorage.getItem(UTM_STORE);
    return saved ? JSON.parse(saved) : undefined;
  } catch {
    return Object.keys(fromUrl).length ? fromUrl : undefined;
  }
}

type Errors = Partial<Record<'name' | 'email' | 'phone', string>>;

function validate(v: { name: string; email: string; phone: string }): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = 'Escribe tu nombre.';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Revisa el email: falta algo (por ejemplo, la @).';
  if (!PHONE_RE.test(v.phone.trim()) || v.phone.replace(/\D/g, '').length < 9) e.phone = 'Escribe un teléfono con WhatsApp, con prefijo si no es español.';
  return e;
}

export default function EnrollForm() {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const [program, setProgram] = useState<ProgramKey>('presencial');
  const [values, setValues] = useState({ name: '', email: '', phone: '' });
  const [touched, setTouched] = useState<Partial<Record<keyof Errors, boolean>>>({});
  const [honey, setHoney] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = validate(values);
  const show = (k: keyof Errors) => (touched[k] ? errors[k] : undefined);

  // Los botones de cada modalidad abren el formulario con esa modalidad ya elegida
  useEffect(() => {
    const onPick = (e: Event) => {
      const p = (e as CustomEvent<ProgramKey>).detail;
      if (p in PROGRAMS) setProgram(p);
    };
    window.addEventListener(PROGRAM_EVENT, onPick);
    const fromHash = new URLSearchParams(window.location.search).get('modalidad');
    if (fromHash === 'online' || fromHash === 'presencial') setProgram(fromHash);
    return () => window.removeEventListener(PROGRAM_EVENT, onPick);
  }, []);

  useEffect(() => {
    if (status === 'sent') doneRef.current?.focus();
  }, [status]);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const blur = (k: keyof Errors) => () => setTouched((t) => ({ ...t, [k]: true }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true });
    const first = (['name', 'email', 'phone'] as const).find((k) => errors[k]);
    if (first) {
      formRef.current?.querySelector<HTMLInputElement>(`#${CSS.escape(`${uid}-${first}`)}`)?.focus();
      return;
    }
    setStatus('sending');
    setServerError(null);
    const p = PROGRAMS[program];
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'proposal',
          source: 'landing',
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          interest: p.interest,
          page: '/landing',
          message: `Inscripción desde la landing: ${p.interest}.`,
          utm: readUtm(),
          website: honey,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar. Inténtalo de nuevo.');
      metaTrack('Lead', { content_name: p.short }, data.id ? `lead-${data.id}` : undefined);
      setStatus('sent');
    } catch (err: any) {
      setServerError(err.message || 'No se pudo enviar. Inténtalo de nuevo.');
      setStatus('idle');
    }
  };

  const p = PROGRAMS[program];
  const firstName = values.name.trim().split(/\s+/)[0];
  const waText = `Hola, soy ${values.name.trim()}. Acabo de enviar mi inscripción al ${p.short} desde la web de IDESIE y me interesa mucho la formación. ¿Me contáis los siguientes pasos?`;
  const waHref = `${CONTACT.whatsappHref}?text=${encodeURIComponent(waText)}`;

  if (status === 'sent') {
    return (
      <div role="status" className="flex flex-col h-full">
        <span className="w-12 h-12 grid place-items-center bg-white text-[var(--blue)] cut" aria-hidden="true">
          <Check className="w-6 h-6" strokeWidth={3} />
        </span>
        <h3 ref={doneRef} tabIndex={-1} className="display text-[clamp(1.5rem,2.4vw,2.25rem)] mt-6 outline-none">
          Inscripción recibida, {firstName}.
        </h3>
        <p className="mt-4 text-lg leading-relaxed text-white">
          Ya está en manos de admisiones para el {p.short}. Avísanos por WhatsApp y te atendemos antes: el mensaje va escrito, solo tienes que enviarlo.
        </p>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => metaTrack('Contact', { content_name: `WhatsApp · ${p.short}` })}
          className="btn-slab on-blue mt-8 w-full sm:w-auto self-start text-lg min-h-16 px-8"
        >
          <MessageCircle className="w-6 h-6" aria-hidden="true" />
          Avisar de mi interés por WhatsApp
        </a>
        <p className="mt-4 text-[15px] text-[#e6efff]">
          Se abrirá WhatsApp con el {CONTACT.whatsapp}. Si prefieres esperar, te escribimos nosotros.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-4" aria-describedby={`${uid}-legal`}>
      <fieldset>
        <legend className="text-[15px] font-semibold mb-2 text-white">Modalidad</legend>
        <div className="seg">
          {(Object.keys(PROGRAMS) as ProgramKey[]).map((k) => (
            <label key={k} className="cut">
              <input type="radio" name="modalidad" value={k} checked={program === k} onChange={() => setProgram(k)} />
              {PROGRAMS[k].label}
            </label>
          ))}
        </div>
      </fieldset>

      {(
        [
          { k: 'name', label: 'Nombre y apellidos', type: 'text', auto: 'name', ph: 'Cómo te llamas' },
          { k: 'email', label: 'Email', type: 'email', auto: 'email', ph: 'tu@email.com' },
          { k: 'phone', label: 'Teléfono con WhatsApp', type: 'tel', auto: 'tel', ph: '+34 600 000 000' },
        ] as const
      ).map((f) => {
        const err = show(f.k);
        return (
          <div key={f.k}>
            <label htmlFor={`${uid}-${f.k}`} className="block text-[15px] font-semibold mb-1.5 text-white">
              {f.label}
            </label>
            <input
              id={`${uid}-${f.k}`}
              type={f.type}
              autoComplete={f.auto}
              inputMode={f.k === 'phone' ? 'tel' : undefined}
              placeholder={f.ph}
              value={values[f.k]}
              onChange={set(f.k)}
              onBlur={blur(f.k)}
              aria-invalid={err ? true : undefined}
              aria-describedby={err ? `${uid}-${f.k}-err` : undefined}
              className="field cut"
            />
            {err && (
              <p id={`${uid}-${f.k}-err`} className="mt-1.5 text-[15px] font-semibold text-[var(--warn)]">
                {err}
              </p>
            )}
          </div>
        );
      })}

      {/* Señuelo para bots: las personas no lo ven */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Web
          <input tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
        </label>
      </div>

      {serverError && (
        <p role="alert" className="text-[15px] font-semibold text-[var(--warn)]">
          {serverError}
        </p>
      )}

      <button type="submit" disabled={status === 'sending'} className="btn-slab on-blue w-full min-h-14 mt-2 text-base disabled:opacity-80 disabled:cursor-wait">
        {status === 'sending' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Enviando…
          </>
        ) : (
          <>
            Enviar inscripción al {p.label.toLowerCase()} <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </>
        )}
      </button>
      <p className="text-[15px] font-semibold text-white">Sin compromiso: es el primer paso para hablar con admisiones.</p>
      <p id={`${uid}-legal`} className="text-[15px] leading-snug text-[#e6efff]">
        Usaremos tus datos solo para gestionar tu inscripción. Más en la{' '}
        <Link href="/privacidad" className="link text-white">
          política de privacidad
        </Link>
        .
      </p>
    </form>
  );
}
