import { CONTACT } from '@/lib/bim';

/** Origen desde el que Calendly avisa de lo que ocurre en el calendario incrustado. */
export const CALENDLY_ORIGIN = 'https://calendly.com';

/** El aviso de Calendly cuando la persona termina de reservar (el resto de eventos no interesan). */
export function isCalendlyScheduled(origin: string, data: unknown): boolean {
  return origin === CALENDLY_ORIGIN && typeof data === 'object' && data !== null && (data as { event?: unknown }).event === 'calendly.event_scheduled';
}

/**
 * Enlace del calendario con los datos de quien ya rellenó el formulario, para que no los escriba dos veces.
 * `embedDomain` es el dominio de la web que lo incrusta (obligatorio para el modo incrustado); sin él se abre como página normal.
 */
export function calendlyUrl(opts: { name?: string; email?: string; embedDomain?: string } = {}): string {
  const url = new URL(CONTACT.calendlyUrl);
  if (opts.name) url.searchParams.set('name', opts.name);
  if (opts.email) url.searchParams.set('email', opts.email);
  if (opts.embedDomain) {
    url.searchParams.set('embed_domain', opts.embedDomain);
    url.searchParams.set('embed_type', 'Inline');
    url.searchParams.set('hide_gdpr_banner', '1');
  }
  return url.toString();
}
