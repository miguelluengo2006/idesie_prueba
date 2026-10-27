/**
 * Campañas de email: tipos y renderizado (texto del editor → email HTML y texto plano, con variables y enlace
 * de baja). Lógica pura: la usan la vista previa del panel y el envío del servidor, así que se ve igual que se envía.
 */
import { CONTACT } from '@/lib/bim';

export type CampaignStatus = 'draft' | 'sending' | 'sent';

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  audience_tags: string[];
  status: CampaignStatus;
  total: number;
  sent_count: number;
  failed_count: number;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: 'Borrador',
  sending: 'Enviando',
  sent: 'Enviada',
};

export interface Recipient {
  email: string;
  name?: string | null;
  company?: string | null;
}

export const CAMPAIGN_VARIABLES = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'empresa', label: 'Empresa' },
] as const;

export const MAX_SUBJECT_LENGTH = 150;
export const MAX_BODY_LENGTH = 20000;

const BRAND = { blue: '#006cff', ink: '#0b1b3a', muted: '#5b6b85', line: '#dbe5f5', bg: '#f0f4ff' };

/** Primer nombre de «Ana María Pérez» → «Ana». */
export function firstName(name?: string | null): string {
  return (name || '').trim().split(/\s+/)[0] || '';
}

/** Sustituye {{nombre}}, {{empresa}} y {{email}}; con `|texto` se da un valor si falta: {{nombre|amigo}}. */
export function applyVariables(text: string, r: Recipient): string {
  const values: Record<string, string> = {
    nombre: firstName(r.name),
    empresa: (r.company || '').trim(),
    email: r.email,
  };
  const out = text.replace(/\{\{\s*([a-záéíóúñ]+)\s*(?:\|([^}]*))?\}\}/gi, (_m, key: string, fallback?: string) => {
    const v = values[key.toLowerCase()];
    return v ? v : (fallback ?? '').trim();
  });
  // «Hola ,» cuando falta el nombre → «Hola,»
  return out.replace(/[ \t]+([,.;:!?])/g, '$1');
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const safeUrl = (url: string): string | null => (/^(https?:\/\/|mailto:)/i.test(url.trim()) ? url.trim() : null);

/** Texto ya escapado → enlaces [texto](url), URLs sueltas y **negrita**. */
function inline(escaped: string): string {
  return escaped
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label: string, url: string) => {
      const href = safeUrl(url.replace(/&amp;/g, '&'));
      return href ? `<a href="${escapeHtml(href)}" style="color:${BRAND.blue};text-decoration:underline">${label}</a>` : m;
    })
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (_m, pre: string, url: string) => {
      const clean = url.replace(/[.,;:!?]+$/, '');
      const tail = url.slice(clean.length);
      return `${pre}<a href="${clean}" style="color:${BRAND.blue};text-decoration:underline">${clean}</a>${tail}`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/** [[Texto|https://…]] o [[Texto|https://…|outline]] (botón con borde, para la acción secundaria) */
const BUTTON_RE = /^\[\[\s*([^|\]]+?)\s*\|\s*([^|\]\s]+)\s*(?:\|\s*(outline)\s*)?\]\]$/;
const IMAGE_RE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
const HEADING_RE = /^(#{1,2})\s+(.+)$/;
const DIVIDER_RE = /^(-{3,}|\*{3,})$/;

/**
 * Cuerpo del editor → HTML del email. Formato: párrafos separados por una línea en blanco, **negrita**,
 * [texto](https://…), listas con «- », títulos con «# », imágenes con ![descripción](https://…), separador con «---»
 * y botones con [[Texto del botón|https://…]] (o …|outline para uno con borde).
 */
export function bodyToHtml(body: string): string {
  const blocks = body.replace(/\r\n?/g, '\n').trim().split(/\n{2,}/);
  const p = `margin:0 0 16px;font-size:16px;line-height:1.6;color:${BRAND.ink}`;
  return blocks
    .filter((b) => b.trim())
    .map((block) => {
      const lines = block.split('\n');
      const trimmed = block.trim();
      const button = trimmed.match(BUTTON_RE);
      if (button) {
        const href = safeUrl(button[2]);
        if (href) {
          const look = button[3]
            ? `background:#ffffff;color:${BRAND.blue};border:2px solid ${BRAND.blue};padding:12px 24px`
            : `background:${BRAND.blue};color:#ffffff;padding:14px 26px`;
          return `<p style="margin:8px 0 24px"><a href="${escapeHtml(href)}" style="display:inline-block;${look};text-decoration:none;font-weight:700;font-size:16px;border-radius:999px">${escapeHtml(button[1])}</a></p>`;
        }
      }
      if (DIVIDER_RE.test(trimmed)) {
        return `<hr style="border:0;border-top:1px solid ${BRAND.line};margin:8px 0 24px">`;
      }
      const image = trimmed.match(IMAGE_RE);
      if (image) {
        const src = /^https:\/\//i.test(image[2]) ? image[2] : null;
        if (src) {
          return `<p style="margin:0 0 20px"><img src="${escapeHtml(src)}" alt="${escapeHtml(image[1])}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:12px"></p>`;
        }
      }
      const heading = lines.length === 1 ? trimmed.match(HEADING_RE) : null;
      if (heading) {
        const size = heading[1].length === 1 ? 28 : 21;
        return `<h${heading[1].length} style="margin:0 0 14px;font-size:${size}px;line-height:1.25;letter-spacing:-0.3px;color:${BRAND.ink}">${inline(escapeHtml(heading[2]))}</h${heading[1].length}>`;
      }
      if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
        const items = lines.map((l) => `<li style="margin:0 0 6px">${inline(escapeHtml(l.replace(/^\s*[-•]\s+/, '')))}</li>`).join('');
        return `<ul style="${p};padding-left:22px">${items}</ul>`;
      }
      return `<p style="${p}">${lines.map((l) => inline(escapeHtml(l))).join('<br>')}</p>`;
    })
    .join('\n');
}

/** Cuerpo del editor → texto plano (para quien no ve HTML y para el filtro antispam). */
export function bodyToText(body: string): string {
  return body
    .replace(/\r\n?/g, '\n')
    .replace(/\[\[\s*([^|\]]+?)\s*\|\s*([^|\]\s]+)\s*(?:\|\s*outline\s*)?\]\]/g, '$1: $2')
    .replace(/^!\[([^\]]*)\]\(([^)\s]+)\)$/gm, '')
    .replace(/^#{1,2}\s+/gm, '')
    .replace(/^(-{3,}|\*{3,})$/gm, '')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1 ($2)')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** Email final para un destinatario: variables aplicadas, plantilla de marca y pie con enlace de baja. */
export function renderCampaignEmail(opts: {
  subject: string;
  body: string;
  recipient: Recipient;
  unsubscribeUrl: string;
}): RenderedEmail {
  const { recipient, unsubscribeUrl } = opts;
  const subject = applyVariables(opts.subject, recipient).replace(/[\r\n]+/g, ' ').trim();
  const body = applyVariables(opts.body, recipient);
  const unsub = escapeHtml(unsubscribeUrl);

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BRAND.line}">
<tr><td style="background:${BRAND.blue};padding:22px 32px"><span style="font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#ffffff">${escapeHtml(CONTACT.name.toLowerCase())}.</span> <span style="font-size:13px;color:#dbe7ff;margin-left:8px">${escapeHtml(CONTACT.tagline)}</span></td></tr>
<tr><td style="padding:32px 32px 12px">${bodyToHtml(body)}</td></tr>
<tr><td style="padding:20px 32px 28px;border-top:1px solid ${BRAND.line};font-size:12px;line-height:1.6;color:${BRAND.muted}">
${escapeHtml(CONTACT.name)} ${escapeHtml(CONTACT.tagline)} · ${escapeHtml(CONTACT.address)}<br>
Recibes este email porque estás en nuestra lista de contactos y aceptaste recibir novedades.
<a href="${unsub}" style="color:${BRAND.muted};text-decoration:underline">Darme de baja</a>.
</td></tr>
</table></td></tr></table></body></html>`;

  const text = `${bodyToText(body)}\n\n--\n${CONTACT.name} ${CONTACT.tagline} · ${CONTACT.address}\nPara darte de baja: ${unsubscribeUrl}\n`;

  return { subject, html, text };
}

/** Enlace público de baja de un contacto. */
export function unsubscribeUrl(siteUrl: string, token: string): string {
  return `${siteUrl.replace(/\/+$/, '')}/baja?t=${encodeURIComponent(token)}`;
}

/** Problemas que impiden enviar la campaña (lista vacía = lista para enviar). */
export function campaignProblems(c: Pick<Campaign, 'subject' | 'body'>, recipients: number): string[] {
  const out: string[] = [];
  if (!c.subject.trim()) out.push('Falta el asunto.');
  if (!c.body.trim()) out.push('Falta el texto del email.');
  if (recipients === 0) out.push('No hay destinatarios: ningún contacto suscrito coincide con la audiencia.');
  return out;
}
