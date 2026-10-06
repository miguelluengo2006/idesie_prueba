/**
 * Contactos del CRM: tipos y lógica pura (importar/exportar CSV, etiquetas, filtros, estado).
 * Sin dependencias de React ni del servidor: la usan las páginas del panel y las rutas de la API.
 */
import { isValidEmail } from '@/lib/validation';

export interface Contact {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  tags: string[];
  /** manual | import | lead | web */
  source: string;
  subscribed: boolean;
  consent_at: string | null;
  unsubscribed_at: string | null;
  notes: string | null;
  created_at: string;
}

export type ContactStatus = 'subscribed' | 'unsubscribed' | 'no-consent';

export const CONTACT_SOURCES: Record<string, string> = {
  manual: 'Manual',
  import: 'Importado',
  lead: 'Lead',
  web: 'Web',
};

export const MAX_TAGS = 20;
export const MAX_TAG_LENGTH = 40;

/** Suscrito (acepta emails), dado de baja (lo pidió él) o sin consentimiento (nunca lo ha dado). */
export function contactStatus(c: Pick<Contact, 'subscribed' | 'unsubscribed_at'>): ContactStatus {
  if (c.unsubscribed_at) return 'unsubscribed';
  return c.subscribed ? 'subscribed' : 'no-consent';
}

export const STATUS_LABEL: Record<ContactStatus, string> = {
  subscribed: 'Suscrito',
  unsubscribed: 'De baja',
  'no-consent': 'Sin consentimiento',
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Etiquetas limpias: sin repetir (sin distinguir mayúsculas), sin vacías, con longitud y número acotados. */
export function normalizeTags(input: unknown): string[] {
  const raw = Array.isArray(input) ? input : typeof input === 'string' ? input.split(/[,;|]/) : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of raw) {
    if (typeof t !== 'string') continue;
    const tag = t.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, MAX_TAG_LENGTH);
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}

/** Todas las etiquetas en uso con cuántos contactos tiene cada una, de más a menos usada. */
export function tagCounts(contacts: Pick<Contact, 'tags'>[]): { tag: string; count: number }[] {
  const map = new Map<string, { tag: string; count: number }>();
  for (const c of contacts) {
    for (const tag of c.tags || []) {
      const key = tag.toLowerCase();
      const cur = map.get(key);
      if (cur) cur.count += 1;
      else map.set(key, { tag, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'es'));
}

/** ¿Recibe una campaña con estas etiquetas? Solo suscritos y no dados de baja; sin etiquetas = todos ellos. */
export function inAudience(c: Pick<Contact, 'subscribed' | 'unsubscribed_at' | 'tags'>, audienceTags: string[]): boolean {
  if (!c.subscribed || c.unsubscribed_at) return false;
  if (audienceTags.length === 0) return true;
  const wanted = new Set(audienceTags.map((t) => t.toLowerCase()));
  return (c.tags || []).some((t) => wanted.has(t.toLowerCase()));
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function matchesQuery(c: Pick<Contact, 'name' | 'email' | 'company' | 'phone' | 'tags'>, query: string): boolean {
  const q = norm(query.trim());
  if (!q) return true;
  return [c.name, c.email, c.company, c.phone, ...(c.tags || [])].some((v) => v && norm(v).includes(q));
}

/* ───────────────────────────── CSV ───────────────────────────── */

export interface ParsedContact {
  email: string;
  name: string;
  phone: string;
  company: string;
  tags: string[];
}

export interface ParsedImport {
  contacts: ParsedContact[];
  /** Filas sin un email válido */
  invalid: number;
  /** Filas con un email ya visto en el mismo archivo (se fusionan en una) */
  duplicates: number;
}

/** CSV → filas de celdas. Admite `,` `;` o tabulador, comillas con `""` y saltos de línea dentro de comillas. */
export function parseCsvRows(text: string): string[][] {
  const src = text.replace(/^﻿/, '');
  const firstLine = src.split(/\r?\n/, 1)[0] || '';
  const delimiter = [';', '\t', ','].reduce((best, d) => (firstLine.split(d).length > firstLine.split(best).length ? d : best), ',');

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(cell);
      cell = '';
      rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

type Field = 'email' | 'name' | 'phone' | 'company' | 'tags';

const HEADER_ALIASES: Record<Field, string[]> = {
  email: ['email', 'e-mail', 'correo', 'correo electronico', 'mail'],
  name: ['nombre', 'name', 'nombre y apellidos', 'nombre completo', 'contacto'],
  phone: ['telefono', 'phone', 'movil', 'celular', 'tel'],
  company: ['empresa', 'company', 'organizacion', 'centro'],
  tags: ['etiquetas', 'etiqueta', 'tags', 'tag', 'grupo', 'segmento'],
};

function fieldOfHeader(header: string): Field | null {
  const h = norm(header).trim();
  for (const field of Object.keys(HEADER_ALIASES) as Field[]) {
    if (HEADER_ALIASES[field].includes(h)) return field;
  }
  return null;
}

/**
 * Contactos a partir de un CSV. Reconoce las columnas por su cabecera (email/correo, nombre, teléfono, empresa,
 * etiquetas); si no hay cabecera, asume el orden email, nombre, teléfono, empresa. Descarta filas sin email
 * válido y fusiona las repetidas.
 */
export function parseContactsCsv(text: string): ParsedImport {
  const rows = parseCsvRows(text);
  if (rows.length === 0) return { contacts: [], invalid: 0, duplicates: 0 };

  const mapped = rows[0].map(fieldOfHeader);
  const hasHeader = mapped.includes('email');
  const columns: (Field | null)[] = hasHeader ? mapped : (['email', 'name', 'phone', 'company'] as Field[]);
  const body = hasHeader ? rows.slice(1) : rows;

  const byEmail = new Map<string, ParsedContact>();
  let invalid = 0;
  let duplicates = 0;
  for (const row of body) {
    const rec: Record<Field, string> = { email: '', name: '', phone: '', company: '', tags: '' };
    columns.forEach((field, i) => {
      if (field && row[i] !== undefined && !rec[field]) rec[field] = row[i].trim();
    });
    const email = normalizeEmail(rec.email);
    if (!isValidEmail(email)) {
      invalid += 1;
      continue;
    }
    const tags = normalizeTags(rec.tags);
    const prev = byEmail.get(email);
    if (prev) {
      duplicates += 1;
      prev.name ||= rec.name;
      prev.phone ||= rec.phone;
      prev.company ||= rec.company;
      prev.tags = normalizeTags([...prev.tags, ...tags]);
    } else {
      byEmail.set(email, { email, name: rec.name, phone: rec.phone, company: rec.company, tags });
    }
  }
  return { contacts: [...byEmail.values()], invalid, duplicates };
}

const csvCell = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;

/** Contenido del CSV de exportación (cabecera incluida, sin BOM). */
export function contactsToCsv(contacts: Contact[]): string {
  const headers = ['Email', 'Nombre', 'Teléfono', 'Empresa', 'Etiquetas', 'Estado', 'Origen', 'Alta'];
  const rows = contacts.map((c) =>
    [
      c.email,
      c.name || '',
      c.phone || '',
      c.company || '',
      (c.tags || []).join(', '),
      STATUS_LABEL[contactStatus(c)],
      CONTACT_SOURCES[c.source] || c.source,
      new Date(c.created_at).toLocaleDateString('es-ES'),
    ]
      .map(csvCell)
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

/** Descarga los contactos como CSV compatible con Excel. */
export function exportContactsCsv(contacts: Contact[]) {
  const blob = new Blob([`﻿${contactsToCsv(contacts)}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `contactos-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
