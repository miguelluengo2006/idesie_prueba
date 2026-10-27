/**
 * Utilidades de servidor del CRM (contactos y campañas). Todas reciben el cliente de Supabase con permisos de
 * servicio y filtran SIEMPRE por `owner_id`: nunca confíes en un id que venga del navegador sin comprobarlo.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { isValidEmail, sanitizeString } from '@/lib/validation';
import { normalizeEmail, normalizeTags } from '@/lib/contacts';

/** Columnas de un contacto que se envían al panel (sin el token de baja, que solo va en los emails). */
export const CONTACT_COLUMNS =
  'id, email, name, phone, company, tags, source, subscribed, consent_at, unsubscribed_at, notes, created_at';

/** Columnas de una campaña que se envían al panel. */
export const CAMPAIGN_COLUMNS =
  'id, name, subject, body, audience_tags, exclude_campaign_ids, status, total, sent_count, failed_count, sent_at, created_at, updated_at';

const PAGE = 1000;
/** Tope de seguridad por consulta (PostgREST devuelve como mucho 1000 filas por petición). */
const MAX_ROWS = 50000;

/** Lee todas las filas de una consulta paginando de 1000 en 1000. */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const all: T[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    all.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  return all;
}

export interface ContactInput {
  email: string;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  tags?: unknown;
}

export interface UpsertResult {
  created: number;
  updated: number;
  /** Entradas con un email no válido */
  invalid: number;
}

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

const clean = (v: unknown, max: number) => (typeof v === 'string' ? sanitizeString(v, max) : '');

/**
 * Da de alta o fusiona contactos por email.
 *  - Nuevo: se crea; queda suscrito solo si `consent` es true (quien lo da de alta responde del consentimiento).
 *  - Ya existe: se rellenan los datos que faltaban y se suman las etiquetas, sin pisar lo que ya tenía.
 *    Si estaba sin consentimiento y ahora hay `consent`, se suscribe. Quien se dio de baja NUNCA se resuscribe.
 */
export async function upsertContacts(
  supabase: SupabaseClient,
  ownerId: string,
  inputs: ContactInput[],
  opts: { source: string; consent: boolean; extraTags?: string[] }
): Promise<UpsertResult> {
  const now = new Date().toISOString();
  const byEmail = new Map<string, ContactInput & { email: string }>();
  let invalid = 0;
  for (const input of inputs) {
    const email = normalizeEmail(typeof input.email === 'string' ? input.email : '');
    if (!isValidEmail(email)) {
      invalid += 1;
      continue;
    }
    const prev = byEmail.get(email);
    byEmail.set(email, {
      email,
      name: prev?.name || clean(input.name, 200) || null,
      phone: prev?.phone || clean(input.phone, 25) || null,
      company: prev?.company || clean(input.company, 200) || null,
      tags: normalizeTags([...normalizeTags(prev?.tags), ...normalizeTags(input.tags), ...(opts.extraTags || [])]),
    });
  }
  const items = [...byEmail.values()];
  if (items.length === 0) return { created: 0, updated: 0, invalid };

  // Los que ya existen
  const existing = new Map<string, any>();
  for (const emails of chunk(items.map((i) => i.email), 200)) {
    const { data, error } = await supabase
      .from('contacts')
      .select('id, email, name, phone, company, tags, subscribed, unsubscribed_at, consent_at')
      .eq('owner_id', ownerId)
      .in('email', emails);
    if (error) throw new Error(error.message);
    for (const row of data || []) existing.set(row.email, row);
  }

  const toInsert: Record<string, unknown>[] = [];
  const toUpdate: Record<string, unknown>[] = [];
  for (const item of items) {
    const prev = existing.get(item.email);
    if (!prev) {
      toInsert.push({
        owner_id: ownerId,
        email: item.email,
        name: item.name,
        phone: item.phone,
        company: item.company,
        tags: item.tags,
        source: opts.source,
        subscribed: opts.consent,
        consent_at: opts.consent ? now : null,
      });
      continue;
    }
    const resubscribe = opts.consent && !prev.subscribed && !prev.unsubscribed_at;
    toUpdate.push({
      id: prev.id,
      owner_id: ownerId,
      email: prev.email,
      name: prev.name || item.name,
      phone: prev.phone || item.phone,
      company: prev.company || item.company,
      tags: normalizeTags([...(prev.tags || []), ...normalizeTags(item.tags)]),
      subscribed: prev.subscribed || resubscribe,
      consent_at: resubscribe ? now : prev.consent_at,
      updated_at: now,
    });
  }

  for (const rows of chunk(toInsert, 500)) {
    const { error } = await supabase.from('contacts').insert(rows);
    if (error) throw new Error(error.message);
  }
  for (const rows of chunk(toUpdate, 500)) {
    const { error } = await supabase.from('contacts').upsert(rows, { onConflict: 'id' });
    if (error) throw new Error(error.message);
  }
  return { created: toInsert.length, updated: toUpdate.length, invalid };
}

/** URL pública de la web: variable de entorno o, si no, el origen de la petición. */
export function siteUrlFrom(req: Request): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin).replace(/\/+$/, '');
}
