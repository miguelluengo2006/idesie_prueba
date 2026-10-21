'use client';

import { useEffect } from 'react';
import { metaTrack, metaTrackCustom, whenPixelReady } from '@/lib/metaPixel';
import { FULL_TIME_SLUG } from '@/lib/shop';

/**
 * Eventos de Meta de la landing, sin tocar el contenido:
 *  · ViewContent al cargar (qué programa se mira), para el público «vio el máster».
 *  · ScrollDepth al 50 % y al 90 %, para medir cuánta gente lee de verdad.
 *  · OfferView cuando la oferta entra en pantalla, para retargeting de quien llegó hasta el precio.
 * Todos esperan al consentimiento de publicidad y se envían una sola vez.
 */
export default function LandingTracker({ name }: { name: string }) {
  useEffect(() => {
    const stops: Array<() => void> = [];
    stops.push(whenPixelReady(() => metaTrack('ViewContent', { content_ids: [FULL_TIME_SLUG], content_type: 'product', content_name: name })));

    const sent = new Set<string>();
    const once = (key: string, fn: () => void) => {
      if (sent.has(key)) return;
      sent.add(key);
      whenPixelReady(fn);
    };

    const onScroll = () => {
      const h = document.documentElement;
      const pct = (window.scrollY + window.innerHeight) / Math.max(h.scrollHeight, 1);
      if (pct >= 0.5) once('s50', () => metaTrackCustom('ScrollDepth', { percent: 50 }));
      if (pct >= 0.9) once('s90', () => metaTrackCustom('ScrollDepth', { percent: 90 }));
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const offer = document.getElementById('reserva');
    let io: IntersectionObserver | undefined;
    if (offer && 'IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          once('offer', () => metaTrackCustom('OfferView', { content_ids: [FULL_TIME_SLUG] }));
          io?.disconnect();
        }
      }, { threshold: 0.35 });
      io.observe(offer);
    }

    return () => {
      stops.forEach((s) => s());
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  }, [name]);
  return null;
}
