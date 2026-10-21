'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import { formatEur, toCents } from '@/lib/shop';
import { CONTACT } from '@/lib/bim';
import { metaTrackOnce, whenPixelReady } from '@/lib/metaPixel';

interface Info { number: string; status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'; totalEur: number; firstName: string; items: { name: string; priceEur: number }[] }

const POLL_MS = 4000;
const POLL_MAX = 30;

/** Estado del pedido tras volver de la pasarela. Mientras llega el aviso de Flywire consulta cada pocos segundos. */
export default function OrderStatus({ token }: { token: string }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [missing, setMissing] = useState(false);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    let stop = false;
    let n = 0;
    const tick = async () => {
      try {
        const res = await fetch(`/api/public/shop/order?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
        if (res.status === 404) { if (!stop) setMissing(true); return; }
        const data = await res.json();
        if (stop) return;
        setInfo(data);
        n += 1;
        setTries(n);
        if (data.status === 'pending' && n < POLL_MAX) setTimeout(tick, POLL_MS);
      } catch {
        if (!stop && n < POLL_MAX) setTimeout(tick, POLL_MS * 2);
      }
    };
    tick();
    return () => { stop = true; };
  }, [token]);

  // La compra se cuenta una sola vez, y solo cuando el pago está confirmado (no al ir a la pasarela)
  const paid = info?.status === 'paid' ? info : null;
  useEffect(() => {
    if (!paid || paid.totalEur <= 0) return;
    return whenPixelReady(() => metaTrackOnce(`order-${paid.number}`, 'Purchase', { value: paid.totalEur, currency: 'EUR', content_type: 'product', content_name: paid.items.map((i) => i.name).join(', ') }));
  }, [paid]);

  if (missing) {
    return <Box icon={<XCircle className="w-12 h-12 text-[#c0392b]" aria-hidden="true" />} title="No encontramos este pedido" text="Revisa el enlace o escríbenos y lo localizamos." />;
  }
  if (!info) return <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#0063e6]" aria-label="Cargando" /></div>;

  const list = (
    <ul className="mt-6 text-left divide-y divide-[#dbe8ff] border-y border-[#dbe8ff]">
      {info.items.map((i) => <li key={i.name} className="py-3 flex justify-between gap-4"><span>{i.name}</span><span className="tabular-nums font-semibold">{i.priceEur === 0 ? 'Gratis' : formatEur(toCents(i.priceEur))}</span></li>)}
      <li className="py-3 flex justify-between gap-4 font-bold"><span>Total</span><span className="tabular-nums">{info.totalEur === 0 ? 'Gratis' : formatEur(toCents(info.totalEur))}</span></li>
    </ul>
  );

  if (info.status === 'paid') {
    return <Box icon={<CheckCircle2 className="w-12 h-12 text-[#0063e6]" aria-hidden="true" />} title={`¡Gracias, ${info.firstName}! Pedido ${info.number} confirmado`} text="Te hemos enviado un correo de confirmación. El equipo de IDESIE se pondrá en contacto contigo para los siguientes pasos de tu matrícula.">{list}</Box>;
  }
  if (info.status === 'pending') {
    return (
      <Box icon={<Clock className="w-12 h-12 text-[#0063e6]" aria-hidden="true" />} title={tries >= POLL_MAX ? `Pedido ${info.number} pendiente de confirmación` : 'Estamos confirmando tu pago…'} text={tries >= POLL_MAX ? `Aún no hemos recibido la confirmación del pago. Si ya has pagado, no te preocupes: cuando llegue te lo notificaremos por email. Si tienes dudas, escríbenos a ${CONTACT.email}.` : 'La pasarela suele tardar unos segundos. No cierres esta página.'}>
        {list}
        {tries < POLL_MAX && <p role="status" className="mt-5 inline-flex items-center gap-2 text-sm text-[#0a1f44]/70"><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />Comprobando…</p>}
      </Box>
    );
  }
  return (
    <Box icon={<XCircle className="w-12 h-12 text-[#c0392b]" aria-hidden="true" />} title={info.status === 'refunded' ? `Pedido ${info.number} reembolsado` : `El pago del pedido ${info.number} no se ha completado`} text={info.status === 'refunded' ? 'El importe se ha devuelto. Si tienes dudas, escríbenos.' : 'No se ha realizado ningún cargo. Puedes volver a intentarlo desde la tienda.'}>
      <Link href="/tienda" className="btn btn-blue mt-7 justify-center">Volver a la tienda</Link>
    </Box>
  );
}

function Box({ icon, title, text, children }: { icon: React.ReactNode; title: string; text: string; children?: React.ReactNode }) {
  return (
    <div role="status" className="max-w-xl mx-auto rounded-3xl bg-[#fff] text-[#0a1f44] p-7 md:p-10 text-center">
      <div className="flex justify-center">{icon}</div>
      <h2 className="font-kinetic font-bold text-2xl md:text-3xl mt-5 leading-tight">{title}</h2>
      <p className="mt-3 text-[#0a1f44]/75 leading-relaxed">{text}</p>
      {children}
    </div>
  );
}
