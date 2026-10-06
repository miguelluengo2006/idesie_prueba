'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, MailX } from 'lucide-react';

type State = 'loading' | 'ready' | 'done' | 'invalid' | 'error';

/** Página del enlace «Darme de baja» de los emails: confirma de quién es y da de baja con un clic. */
export default function BajaClient() {
  const token = useSearchParams()?.get('t') || '';
  const [state, setState] = useState<State>('loading');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return setState('invalid');
    let cancelled = false;
    fetch(`/api/public/unsubscribe?t=${encodeURIComponent(token)}`)
      .then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) }))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) return setState('invalid');
        setEmail(data.email || '');
        setState(data.unsubscribed ? 'done' : 'ready');
      })
      .catch(() => !cancelled && setState('error'));
    return () => {
      cancelled = true;
    };
  }, [token]);

  const unsubscribe = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/public/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ t: token }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    } finally {
      setBusy(false);
    }
  };

  if (state === 'loading') {
    return (
      <div className="flex justify-center py-6" role="status" aria-label="Cargando">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--signal)]" />
      </div>
    );
  }

  const back = (
    <Link href="/" className="inline-block mt-6 text-sm text-[var(--signal)] hover:underline">
      Volver a la web de IDESIE
    </Link>
  );

  if (state === 'done') {
    return (
      <div className="text-center">
        <CheckCircle2 className="w-10 h-10 text-[var(--signal)] mx-auto mb-4" />
        <h1 className="font-kinetic font-black uppercase text-2xl leading-tight">Te has dado de baja</h1>
        <p className="text-white/60 mt-3 text-sm leading-relaxed">
          {email ? <>No enviaremos más emails a <strong className="text-white">{email}</strong>.</> : 'No enviaremos más emails a esta dirección.'}
        </p>
        {back}
      </div>
    );
  }

  if (state === 'invalid' || state === 'error') {
    return (
      <div className="text-center">
        <MailX className="w-10 h-10 text-white/40 mx-auto mb-4" />
        <h1 className="font-kinetic font-black uppercase text-2xl leading-tight">
          {state === 'invalid' ? 'Enlace no válido' : 'No se pudo completar'}
        </h1>
        <p className="text-white/60 mt-3 text-sm leading-relaxed">
          {state === 'invalid'
            ? 'Este enlace de baja no es correcto o ha caducado. Escríbenos a info@idesie.com y te damos de baja a mano.'
            : 'Ha habido un problema. Inténtalo de nuevo en unos minutos o escríbenos a info@idesie.com.'}
        </p>
        {back}
      </div>
    );
  }

  return (
    <div className="text-center">
      <MailX className="w-10 h-10 text-[var(--signal)] mx-auto mb-4" />
      <h1 className="font-kinetic font-black uppercase text-2xl leading-tight">Darme de baja</h1>
      <p className="text-white/60 mt-3 text-sm leading-relaxed">
        {email ? <>Dejarás de recibir los emails de IDESIE en <strong className="text-white">{email}</strong>.</> : 'Dejarás de recibir los emails de IDESIE.'}
      </p>
      <button
        type="button"
        onClick={unsubscribe}
        disabled={busy}
        className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--signal)] text-black text-sm font-medium hover:bg-[var(--signal-dim)] disabled:opacity-60 transition-colors cursor-pointer"
      >
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} Confirmar la baja
      </button>
      {back}
    </div>
  );
}
