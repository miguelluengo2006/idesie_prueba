'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { whenConsented } from '@/lib/cookieConsent';
import { GA_ID, loadGoogleAnalytics } from '@/lib/googleAnalytics';
import { PIXEL_EXCLUDED_PREFIXES } from '@/lib/metaPixel';

/**
 * Carga Google Analytics solo con consentimiento de análisis y nunca en el panel ni en el acceso.
 * Una vez cargado, GA4 cuenta solo las páginas vistas al navegar (medición mejorada).
 */
export default function GoogleAnalytics() {
  const pathname = usePathname() || '/';
  const excluded = PIXEL_EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!GA_ID) return;
    // Si GA ya se cargó en la web pública y se entra al panel sin recargar, deja de medir ahí
    (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = excluded;
    if (excluded) return;
    return whenConsented('analytics', () => loadGoogleAnalytics(GA_ID)); // idempotente
  }, [excluded]);

  return null;
}
