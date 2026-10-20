'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, Lock, ShoppingBag, Tag, X } from 'lucide-react';
import { useShopCart, clearShopCart } from '@/lib/shopCart';
import { formatEur, type Quote } from '@/lib/shop';
import { metaTrack } from '@/lib/metaPixel';

const CHK = "appearance-none shrink-0 w-5 h-5 rounded-md border-2 border-[#7f98bd] bg-[#fff] checked:border-[#0063e6] checked:bg-[#0063e6] checked:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 10.5l3.2 3.2L15 6.8'/%3E%3C/svg%3E\")] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0063e6]";
const FIELD = 'w-full min-h-12 rounded-xl border border-[#c9d9f0] bg-[#fff] text-[#0a1f44] px-4 text-base placeholder:text-[#566782] focus:outline-none focus:border-[#0063e6] focus:ring-2 focus:ring-[#0063e6]/25';
const LBL = 'block text-sm font-semibold text-[#0a1f44] mb-1.5';
const money = (c: number) => (c === 0 ? 'Gratis' : formatEur(c));

/** Pago en una sola pantalla: datos del comprador, cupón y resumen. El importe siempre lo calcula el servidor. */
export default function Checkout() {
  const uid = useId();
  const { slugs, remove } = useShopCart();
  const [mounted, setMounted] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [trap, setTrap] = useState('');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tracked = useRef(false);

  useEffect(() => setMounted(true), []);

  const key = slugs.join(',');
  useEffect(() => {
    if (!mounted) return;
    if (slugs.length === 0) { setQuote(null); return; }
    let cancelled = false;
    setLoadingQuote(true);
    fetch('/api/public/shop/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slugs, coupon }) })
      .then((r) => r.json())
      .then((q: Quote) => {
        if (cancelled) return;
        setQuote(q);
        // Un producto que ya no se vende no puede quedarse en el carrito
        if (!q.ok && q.error) setError(q.error);
        else setError(null);
      })
      .catch(() => !cancelled && setError('No se pudo calcular el pedido. Recarga la página.'))
      .finally(() => !cancelled && setLoadingQuote(false));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, key, coupon]);

  useEffect(() => {
    if (quote?.ok && !tracked.current) {
      tracked.current = true;
      metaTrack('InitiateCheckout', { value: quote.totalCents / 100, currency: 'EUR', num_items: quote.lines.length });
    }
  }, [quote]);

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCoupon(couponInput.trim());
  };

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (paying || !quote?.ok) return;
    setError(null);
    if (!terms) return setError('Acepta los términos y la política de privacidad para continuar.');
    setPaying(true);
    try {
      const res = await fetch('/api/public/shop/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs, coupon, firstName, lastName, email, phone, acceptedTerms: terms, marketing, website: trap }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo registrar el pedido. Inténtalo de nuevo.');
      metaTrack('Purchase', { value: data.totalCents / 100, currency: 'EUR' }, `order-${data.number}`);
      clearShopCart();
      // Gratis: ya está confirmado. De pago: a la pasarela de Flywire; al volver, /pedido/<token> muestra el estado.
      window.location.assign(data.free || !data.paymentUrl ? `/pedido/${data.token}` : data.paymentUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el pedido. Inténtalo de nuevo.');
      setPaying(false);
    }
  }, [paying, quote, terms, slugs, coupon, firstName, lastName, email, phone, marketing, trap]);

  if (!mounted) return <div className="min-h-[40vh]" aria-busy="true" />;

  if (slugs.length === 0) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <ShoppingBag className="w-12 h-12 mx-auto text-[#0063e6]" aria-hidden="true" />
        <h2 className="font-kinetic font-bold text-2xl mt-5">Tu carrito está vacío</h2>
        <p className="mt-3 text-[#0a1f44]/75">Elige un programa en la tienda y vuelve aquí para pagar.</p>
        <Link href="/tienda" className="btn btn-blue mt-7 justify-center">Ver la tienda <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
      </div>
    );
  }

  const free = quote?.ok && quote.totalCents === 0;
  return (
    <form onSubmit={submit} className="grid lg:grid-cols-[1.25fr_1fr] gap-8 lg:gap-12 items-start">
      <div className="grid gap-8">
        <fieldset className="rounded-3xl bg-[#fff] p-6 md:p-8">
          <legend className="sr-only">Tus datos</legend>
          <h2 className="font-kinetic font-bold text-xl md:text-2xl">Tus datos</h2>
          <p className="text-sm text-[#0a1f44]/70 mt-1.5">Los usaremos para tu matrícula y para enviarte la confirmación.</p>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div><label htmlFor={`${uid}-fn`} className={LBL}>Nombre</label><input id={`${uid}-fn`} className={FIELD} required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
            <div><label htmlFor={`${uid}-ln`} className={LBL}>Apellidos</label><input id={`${uid}-ln`} className={FIELD} required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
            <div><label htmlFor={`${uid}-em`} className={LBL}>Email</label><input id={`${uid}-em`} className={FIELD} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" /></div>
            <div><label htmlFor={`${uid}-ph`} className={LBL}>Teléfono <span className="font-normal text-[#0a1f44]/65">(opcional)</span></label><input id={`${uid}-ph`} className={FIELD} type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="600 000 000" /></div>
          </div>
          <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} className="absolute -left-[9999px] w-px h-px opacity-0" name="website" />
        </fieldset>

        <div className="rounded-3xl bg-[#fff] p-6 md:p-8 grid gap-3">
          <label className="flex items-start gap-3 text-sm leading-snug cursor-pointer">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className={`${CHK} mt-0.5`} />
            <span>He leído y acepto los <Link href="/terminos" target="_blank" className="underline font-semibold">términos y condiciones</Link> y la <Link href="/privacidad" target="_blank" className="underline font-semibold">política de privacidad</Link>.</span>
          </label>
          <label className="flex items-start gap-3 text-sm leading-snug cursor-pointer text-[#0a1f44]/75">
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className={`${CHK} mt-0.5`} />
            <span>Quiero recibir novedades y convocatorias de IDESIE (opcional).</span>
          </label>
        </div>
      </div>

      <aside className="rounded-3xl bg-[#0a1f44] text-[#fff] p-6 md:p-8 lg:sticky lg:top-28" aria-label="Resumen del pedido">
        <h2 className="font-kinetic font-bold text-xl md:text-2xl">Tu pedido</h2>
        <ul className="mt-5 divide-y divide-[#fff]/15" aria-busy={loadingQuote}>
          {(quote?.lines ?? slugs.map((s) => ({ slug: s, name: '…', unitCents: 0 }))).map((l) => (
            <li key={l.slug} className="py-3.5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold leading-snug">{l.name}</p>
                {'fullCents' in l && typeof l.fullCents === 'number' ? <p className="text-xs text-[#c9d9f0] mt-0.5">Precio del programa: {formatEur(l.fullCents)} (IVA incl.). El resto se acuerda con admisiones.</p> : null}
                <button type="button" onClick={() => remove(l.slug)} className="mt-1 inline-flex items-center gap-1 text-xs text-[#c9d9f0] hover:text-[#fff] underline underline-offset-2 cursor-pointer"><X className="w-3 h-3" aria-hidden="true" />Quitar</button>
              </div>
              <p className="font-semibold tabular-nums shrink-0">{quote?.ok ? money(l.unitCents) : ''}</p>
            </li>
          ))}
        </ul>

        {!free && (
          <div className="mt-5">
            <label htmlFor={`${uid}-cp`} className="text-sm font-semibold text-[#c9d9f0]">¿Tienes un código de descuento?</label>
            <div className="mt-2 flex gap-2">
              <input id={`${uid}-cp`} value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === 'Enter') applyCoupon(e); }} placeholder="CÓDIGO" autoComplete="off" className="min-w-0 flex-1 min-h-11 rounded-xl border border-[#fff]/25 bg-[#fff]/10 text-[#fff] px-4 uppercase tracking-wider placeholder:text-[#fff]/55 focus:outline-none focus:border-[#7db4ff]" />
              <button type="button" onClick={applyCoupon} className="min-h-11 px-5 rounded-xl bg-[#fff] text-[#0a1f44] font-semibold text-sm cursor-pointer hover:bg-[#dbe8ff]">Aplicar</button>
            </div>
            {quote?.couponError && <p role="alert" className="mt-2 text-sm text-[#ffb4b4]">{quote.couponError}</p>}
            {quote?.coupon && <p className="mt-2 text-sm text-[#9fd8ff] inline-flex items-center gap-1.5"><Tag className="w-4 h-4" aria-hidden="true" />Código {quote.coupon.code} aplicado</p>}
          </div>
        )}

        {quote?.ok && (
          <dl className="mt-6 grid gap-2 text-sm tabular-nums" aria-live="polite">
            {quote.discountCents > 0 && (
              <>
                <div className="flex justify-between text-[#c9d9f0]"><dt>Subtotal</dt><dd>{money(quote.subtotalCents)}</dd></div>
                <div className="flex justify-between text-[#9fd8ff]"><dt>Descuento</dt><dd>−{formatEur(quote.discountCents)}</dd></div>
              </>
            )}
            <div className="flex justify-between items-baseline pt-3 border-t border-[#fff]/20">
              <dt className="font-semibold">Total <span className="font-normal text-[#c9d9f0]">(IVA incluido)</span></dt>
              <dd className="font-kinetic font-bold text-3xl">{money(quote.totalCents)}</dd>
            </div>
          </dl>
        )}

        {error && <p role="alert" className="mt-5 rounded-xl bg-[#fde8e8] text-[#8a1c1c] px-4 py-3 text-sm font-medium">{error}</p>}

        <button type="submit" disabled={paying || !quote?.ok || loadingQuote} className="btn btn-cta mt-6 w-full justify-center min-h-14 text-base">
          {paying ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Lock className="w-4 h-4" aria-hidden="true" />}
          {paying ? 'Un momento…' : free ? 'Confirmar inscripción' : 'Pagar de forma segura'}
        </button>
        {!free && <p className="mt-3 text-xs text-[#c9d9f0] text-center leading-relaxed">Te llevamos a la pasarela segura de Flywire para pagar con tarjeta o transferencia. Al terminar volverás aquí.</p>}
      </aside>
    </form>
  );
}
