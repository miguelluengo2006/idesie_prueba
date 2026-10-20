'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Loader2 } from 'lucide-react';
import { PROFILES } from '@/lib/bim';
import Section from './Section';

const field =
  'w-full rounded-xl bg-[#fff] border border-transparent focus:border-[#0063e6] outline-none px-4 py-3 text-base transition-colors';
const label = 'block text-sm font-semibold mb-2';

/** Orientación personalizada: nombre, email y perfil de interés. Entra como lead con el perfil como «Necesita». */
export default function Orientation() {
  const uid = useId();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState(PROFILES[0].name);
  const [honey, setHoney] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'proposal',
          source: 'website',
          name,
          email,
          message: `Solicitud de orientación personalizada. Perfil que le interesa: ${profile}.`,
          interest: profile,
          page: '/',
          website: honey,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar');
      setStatus('sent');
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar. Inténtalo de nuevo.');
      setStatus('idle');
    }
  };

  return (
    <Section field="navy" id="orientacion" labelledBy="orientacion-title">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-start">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#ffba08]">Orientación personalizada</span>
          <h2 id="orientacion-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.15] mt-4">
            Diseña tu ruta hacia tu <span className="ui-hl">perfil</span> profesional
          </h2>
          <p className="text-[#c9d9f0] mt-5 text-base md:text-lg leading-relaxed">
            Cuéntanos dónde estás y adónde quieres llegar. Te proponemos tu mapa de competencias.
          </p>
        </div>

        {status === 'sent' ? (
          <div role="status" className="ui-card p-8 flex gap-4 items-start">
            <span className="w-10 h-10 rounded-full bg-[#ffba08] text-[#0a1f44] grid place-items-center shrink-0">
              <Check className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-kinetic font-semibold text-xl">Recibido, {name.split(' ')[0]}</h3>
              <p className="text-[#c9d9f0] mt-2">Te escribiremos a {email} con una propuesta de mapa para {profile}.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="ui-card p-7 md:p-8 flex flex-col gap-5">
            <div>
              <label htmlFor={`${uid}-name`} className={label}>Nombre</label>
              <input id={`${uid}-name`} required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={`${field} text-[#0d1522]`} />
            </div>
            <div>
              <label htmlFor={`${uid}-email`} className={label}>Email</label>
              <input id={`${uid}-email`} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${field} text-[#0d1522]`} />
            </div>
            <div>
              <label htmlFor={`${uid}-profile`} className={label}>Perfil que te interesa</label>
              <select id={`${uid}-profile`} value={profile} onChange={(e) => setProfile(e.target.value)} className={`${field} text-[#0d1522]`}>
                {PROFILES.map((p) => (
                  <option key={p.code} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Señuelo para bots: las personas no lo ven */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label>
                Web
                <input tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
              </label>
            </div>
            {error && (
              <p role="alert" className="text-sm font-semibold text-[#ffba08]">
                {error}
              </p>
            )}
            <button type="submit" disabled={status === 'sending'} className="btn btn-cta justify-between mt-1">
              {status === 'sending' ? 'Enviando…' : 'Solicitar orientación'}
              <span className="btn-dot">
                {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ArrowUpRight className="w-4 h-4" aria-hidden="true" />}
              </span>
            </button>
            <p className="text-xs text-[#c9d9f0]">
              Usaremos tus datos solo para responderte. Más información en nuestra{' '}
              <Link href="/privacidad" className="underline underline-offset-2">política de privacidad</Link>.
            </p>
          </form>
        )}
      </div>
    </Section>
  );
}
