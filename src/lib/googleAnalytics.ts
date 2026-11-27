/**
 * Google Analytics 4. Solo se carga si hay ID y la persona ha aceptado las cookies de análisis
 * (ver src/lib/cookieConsent.ts y src/components/GoogleAnalytics.tsx).
 *
 * El ID de medición (G-XXXXXXXXXX) va en la variable de entorno NEXT_PUBLIC_GA_ID
 * (Vercel → Settings → Environment Variables). Vacío = GA apagado. Al ser NEXT_PUBLIC_, hay que volver a desplegar tras cambiarla.
 *
 * Las páginas vistas al navegar sin recargar las cuenta GA4 por su cuenta (medición mejorada, «cambios del historial»).
 */

export const GA_ID = (process.env.NEXT_PUBLIC_GA_ID || '').trim();

/** Un ID de medición de GA4 válido: evita inyectar en la URL del script cualquier cosa que no lo sea. */
export const isValidGaId = (id: string) => /^G-[A-Z0-9]{4,16}$/.test(id);

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

/** Instala gtag.js una sola vez. Publicidad de Google denegada: aquí solo se pide permiso para análisis. */
export function loadGoogleAnalytics(id: string) {
  if (typeof window === 'undefined' || window.gtag || !isValidGaId(id)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js espera el objeto `arguments`, no un array
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('js', new Date());
  window.gtag('config', id, { anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

/** Envía un evento a GA4; no hace nada si GA no está cargado (sin consentimiento o sin ID). */
export function gaEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params ?? {});
}
