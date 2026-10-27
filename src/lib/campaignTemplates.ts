/**
 * Plantillas de email, bloques del editor y estadísticas de seguimiento. Lógica pura (la usan el panel y la API).
 * Una plantilla es asunto + texto con el mismo formato que una campaña (ver bodyToHtml en campaigns.ts).
 */
import { CONTACT } from '@/lib/bim';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export const TEMPLATE_COLUMNS = 'id, name, subject, body, created_at, updated_at';
export const MAX_TEMPLATE_NAME = 80;
export const MAX_TEMPLATES = 100;

/* ── Bloques que inserta la barra del editor ── */

export type BlockKind = 'heading' | 'image' | 'button' | 'divider' | 'list';

export function buildBlock(kind: BlockKind, o: { text?: string; url?: string; outline?: boolean } = {}): string {
  const text = (o.text || '').replace(/[\r\n|\]]+/g, ' ').trim();
  const url = (o.url || '').trim();
  switch (kind) {
    case 'heading':
      return `# ${text || 'Título'}`;
    case 'image':
      return `![${text.replace(/[[\]()]/g, '')}](${url || 'https://'})`;
    case 'button':
      return `[[${text || 'Ver más'}|${url || 'https://'}${o.outline ? '|outline' : ''}]]`;
    case 'divider':
      return '---';
    case 'list':
      return '- Primer punto\n- Segundo punto\n- Tercer punto';
  }
}

/** Texto + bloque, separados por una línea en blanco (los bloques del formato van siempre en su propio párrafo). */
export function insertBlock(body: string, block: string, at: number): { body: string; cursor: number } {
  const pos = Math.max(0, Math.min(at, body.length));
  const before = body.slice(0, pos).replace(/\s+$/, '');
  const after = body.slice(pos).replace(/^\s+/, '');
  const head = before ? `${before}\n\n` : '';
  const tail = after ? `\n\n${after}` : '\n\n';
  return { body: `${head}${block}${tail}`, cursor: head.length + block.length };
}

/* ── Plantillas de partida ── */

export const STARTER_TEMPLATES: Pick<EmailTemplate, 'id' | 'name' | 'subject' | 'body'>[] = [
  {
    id: 'starter-novedad',
    name: 'Novedad con un botón',
    subject: '{{nombre|Hola}}, una novedad de IDESIE',
    body: `# Una novedad que te puede interesar

Hola {{nombre|}},

Te escribimos para contarte lo último que hemos preparado en IDESIE. Resumido en una frase, para que no pierdas tiempo.

[[Ver la novedad|${'https://idesie.com'}]]

Si prefieres hablarlo, responde a este email y te contestamos.

Un saludo,
El equipo de ${CONTACT.name}`,
  },
  {
    id: 'starter-master',
    name: 'Presentación del máster',
    subject: 'Máster BIM Full Time: solicita información',
    body: `# Convierte el BIM en tu ventaja profesional

Hola {{nombre|}},

Si trabajas en arquitectura, ingeniería o construcción, este es el momento de dar el salto con una formación práctica.

- Aprendes con proyectos reales
- Metodología BIM aplicada de principio a fin
- Acompañamiento de profesores en activo

[[Quiero más información|https://idesie.com]]

[[Reservar una llamada de 30 min|${CONTACT.calendlyUrl}|outline]]

---

¿Dudas? Escríbenos por [WhatsApp](${CONTACT.whatsappHref}) y te respondemos.`,
  },
  {
    id: 'starter-llamada',
    name: 'Invitación a una llamada',
    subject: '{{nombre|Hola}}, ¿hablamos 30 minutos?',
    body: `Hola {{nombre|}},

Vimos que te interesó nuestra formación. Si quieres, te ayudamos a elegir el programa que mejor encaja contigo en una llamada corta y sin compromiso.

[[Elegir día y hora|${CONTACT.calendlyUrl}]]

Un saludo,
El equipo de ${CONTACT.name}`,
  },
  {
    id: 'starter-recordatorio',
    name: 'Recordatorio con fecha límite',
    subject: 'Últimos días para reservar tu plaza',
    body: `# Últimos días para reservar tu plaza

Hola {{nombre|}},

Las plazas de la próxima convocatoria se están cubriendo. Si todavía estás valorando tu decisión, este es un buen momento para resolver tus dudas con nosotros.

[[Reservar mi plaza|https://idesie.com]]

---

Si ya lo has resuelto, ignora este mensaje.`,
  },
];

/* ── Seguimiento ── */

export interface TrackedSend {
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'skipped';
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  complained_at: string | null;
}

export type DeliveryState = 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'failed' | 'skipped';

/** Lo más relevante que le ha pasado a este envío (los problemas pesan más que los avances). */
export function deliveryState(s: TrackedSend): DeliveryState {
  if (s.complained_at) return 'complained';
  if (s.bounced_at) return 'bounced';
  if (s.status === 'failed') return 'failed';
  if (s.status === 'skipped') return 'skipped';
  if (s.clicked_at) return 'clicked';
  if (s.opened_at) return 'opened';
  if (s.delivered_at) return 'delivered';
  if (s.status === 'sent') return 'sent';
  return 'queued';
}

export const DELIVERY_LABEL: Record<DeliveryState, string> = {
  queued: 'En cola',
  sent: 'Enviado',
  delivered: 'Entregado',
  opened: 'Abierto',
  clicked: 'Hizo clic',
  bounced: 'Rebotado',
  complained: 'Marcó spam',
  failed: 'Falló',
  skipped: 'Omitido',
};

export interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
}

/** Cuenta personas, no eventos: quien abre tres veces cuenta una. Un clic implica entrega y apertura. */
export function campaignStats(sends: TrackedSend[]): CampaignStats {
  const stats: CampaignStats = { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, complained: 0 };
  for (const s of sends) {
    if (s.status === 'sent' || s.delivered_at || s.opened_at || s.clicked_at) stats.sent++;
    if (s.delivered_at || s.opened_at || s.clicked_at) stats.delivered++;
    if (s.opened_at || s.clicked_at) stats.opened++;
    if (s.clicked_at) stats.clicked++;
    if (s.bounced_at) stats.bounced++;
    if (s.complained_at) stats.complained++;
  }
  return stats;
}

/** Porcentaje entero de `part` sobre `whole` (0 si no hay base). */
export function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}
