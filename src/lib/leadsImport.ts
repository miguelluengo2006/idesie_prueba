/**
 * Importación de leads desde el CSV que se descarga de Meta (Leads Center o Administrador de anuncios).
 * Todo es puro (texto dentro, filas fuera) para poder probarlo; el panel solo lee el archivo y lo envía.
 */

export interface ImportRow {
  name: string;
  email: string;
  phone: string;
  company: string;
  /** Respuestas del formulario de Meta que no son datos de contacto: «Pregunta: respuesta» */
  extra: string[];
  campaign: string;
  adset: string;
  ad: string;
  form: string;
  platform: string;
  /** ISO si la columna de fecha se pudo leer */
  createdAt: string;
}

export interface ParsedImport {
  rows: ImportRow[];
  /** Columnas del archivo que se han reconocido, para enseñarlas antes de importar */
  recognized: string[];
  /** Filas sin email ni teléfono: no se pueden contactar */
  skipped: number;
}

/** Decodifica el archivo: Meta exporta en UTF-8, y el Administrador de anuncios a veces en UTF-16 con tabuladores. */
export function decodeCsvBytes(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes.subarray(2));
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes.subarray(2));
  return new TextDecoder('utf-8').decode(bytes).replace(/^﻿/, '');
}

function detectDelimiter(headerLine: string): string {
  const counts = [',', ';', '\t'].map((d) => [d, headerLine.split(d).length - 1] as const);
  return counts.sort((a, b) => b[1] - a[1])[0][0];
}

/** Lector de CSV con comillas, comillas dobles escapadas y saltos de línea dentro de una celda. */
export function parseCsv(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const delimiter = detectDelimiter(firstLine);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === delimiter) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell);
      cell = '';
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== '')) rows.push(row);
  return rows;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

type Field = 'name' | 'first' | 'last' | 'email' | 'phone' | 'company' | 'campaign' | 'adset' | 'ad' | 'form' | 'platform' | 'createdAt';

// Nombres de columna de Meta (en inglés y en español) y los habituales de otros CRM
const ALIASES: Record<Field, string[]> = {
  name: ['full_name', 'nombre_completo', 'name', 'nombre', 'nombre_y_apellidos'],
  first: ['first_name', 'nombre_de_pila', 'primer_nombre'],
  last: ['last_name', 'apellidos', 'apellido', 'segundo_nombre'],
  email: ['email', 'e_mail', 'correo', 'correo_electronico', 'direccion_de_correo_electronico'],
  phone: ['phone_number', 'phone', 'telefono', 'numero_de_telefono', 'numero_de_telefono_movil', 'movil', 'whatsapp'],
  company: ['company_name', 'company', 'empresa', 'nombre_de_la_empresa'],
  campaign: ['campaign_name', 'nombre_de_la_campana', 'campana', 'campaign'],
  adset: ['adset_name', 'ad_set_name', 'nombre_del_conjunto_de_anuncios', 'conjunto_de_anuncios'],
  ad: ['ad_name', 'nombre_del_anuncio', 'anuncio'],
  form: ['form_name', 'nombre_del_formulario', 'formulario'],
  platform: ['platform', 'plataforma'],
  createdAt: ['created_time', 'fecha_de_creacion', 'fecha', 'created_at', 'hora_de_creacion'],
};

// Columnas internas de Meta que no son respuestas de la persona
const META_INTERNAL = new Set(['id', 'lead_id', 'ad_id', 'adset_id', 'campaign_id', 'form_id', 'page_id', 'is_organic', 'es_organico', 'lead_status', 'estado_del_lead', 'partner_name']);

/** «p:+34600111222» → «+34600111222»; «l:123» → «123» (Meta antepone una letra y dos puntos). */
function stripMetaPrefix(v: string): string {
  return v.trim().replace(/^[a-z]:(?=\S)/i, '').trim();
}

function toIso(v: string): string {
  if (!v.trim()) return '';
  const t = Date.parse(v);
  if (Number.isNaN(t)) return '';
  // Fechas razonables: ni del futuro ni anteriores a 2015 (un valor roto no debe falsear la antigüedad del lead)
  return t > Date.now() + 86400000 || t < Date.UTC(2015, 0, 1) ? '' : new Date(t).toISOString();
}

export function parseLeadsCsv(text: string): ParsedImport {
  const table = parseCsv(text);
  if (table.length < 2) return { rows: [], recognized: [], skipped: 0 };

  const headers = table[0].map((h) => h.trim());
  const keys = headers.map(norm);
  const fieldAt = new Map<Field, number>();
  for (const field of Object.keys(ALIASES) as Field[]) {
    const idx = keys.findIndex((k) => ALIASES[field].includes(k));
    if (idx >= 0) fieldAt.set(field, idx);
  }
  const used = new Set(fieldAt.values());
  const extraCols = headers
    .map((h, i) => ({ h, i, k: keys[i] }))
    .filter(({ i, k, h }) => !used.has(i) && h && !META_INTERNAL.has(k));

  const get = (cells: string[], field: Field) => {
    const i = fieldAt.get(field);
    return i === undefined ? '' : (cells[i] || '').trim();
  };

  const rows: ImportRow[] = [];
  let skipped = 0;
  for (const cells of table.slice(1)) {
    const email = get(cells, 'email').toLowerCase();
    const phone = stripMetaPrefix(get(cells, 'phone'));
    const name = get(cells, 'name') || [get(cells, 'first'), get(cells, 'last')].filter(Boolean).join(' ');
    if (!email && !phone) {
      skipped += 1;
      continue;
    }
    const extra = extraCols
      .map(({ h, i }) => ({ q: h.replace(/_/g, ' ').trim(), a: (cells[i] || '').trim() }))
      .filter(({ a }) => a !== '')
      .map(({ q, a }) => `${q}: ${a.replace(/_/g, ' ')}`);
    rows.push({
      name: name || email || phone,
      email,
      phone,
      company: get(cells, 'company'),
      extra,
      campaign: get(cells, 'campaign'),
      adset: get(cells, 'adset'),
      ad: get(cells, 'ad'),
      form: get(cells, 'form'),
      platform: get(cells, 'platform'),
      createdAt: toIso(get(cells, 'createdAt')),
    });
  }

  const labels: Record<Field, string> = {
    name: 'Nombre', first: 'Nombre', last: 'Apellidos', email: 'Email', phone: 'Teléfono', company: 'Empresa',
    campaign: 'Campaña', adset: 'Conjunto de anuncios', ad: 'Anuncio', form: 'Formulario', platform: 'Plataforma', createdAt: 'Fecha',
  };
  const recognized = Array.from(new Set(Array.from(fieldAt.keys()).map((f) => labels[f])));
  if (extraCols.length > 0) recognized.push(`${extraCols.length} ${extraCols.length === 1 ? 'pregunta' : 'preguntas'} del formulario`);
  return { rows, recognized, skipped };
}

/** Misma persona: mismo email o mismas últimas 9 cifras del teléfono (como en el resto del panel). */
export function identityKeys(l: { email?: string | null; phone?: string | null }): string[] {
  const keys: string[] = [];
  const email = (l.email || '').trim().toLowerCase();
  const phone = (l.phone || '').replace(/\D/g, '').slice(-9);
  if (email) keys.push(`e:${email}`);
  if (phone.length === 9) keys.push(`p:${phone}`);
  return keys;
}
