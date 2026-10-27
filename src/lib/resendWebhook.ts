import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Avisos (webhooks) de Resend: firma Svix y lectura del evento. Lógica pura; la ruta la usa y los tests la cubren.
 * Doc: https://resend.com/docs/webhooks — la firma es HMAC-SHA256 de `${svix-id}.${svix-timestamp}.${cuerpo}`
 * con la clave `whsec_…` (en base64) y llega en `svix-signature` como «v1,<firma>» (puede haber varias).
 */

export const resendWebhookSecret = () => (process.env.RESEND_WEBHOOK_SECRET || '').trim();

/** Margen entre el reloj de Resend y el nuestro; fuera de él se descarta el aviso (anti-repetición). */
const TOLERANCE_SECONDS = 5 * 60;

export function verifyResendSignature(
  raw: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): boolean {
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature || !secret) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowSeconds - ts) > TOLERANCE_SECONDS) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${raw}`).digest();

  return signature.split(' ').some((part) => {
    const [version, value] = part.split(',');
    if (version !== 'v1' || !value) return false;
    const given = Buffer.from(value, 'base64');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

export type TrackedEvent = 'sent' | 'delivered' | 'delayed' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'failed';

export interface ResendEvent {
  type: TrackedEvent;
  /** Id del email en Resend (el que guardamos al enviar) */
  emailId: string;
  at: string;
  /** Enlace pulsado (solo `clicked`) */
  url?: string;
  /** Motivo del rebote o del fallo */
  reason?: string;
}

const TYPES: Record<string, TrackedEvent> = {
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.delivery_delayed': 'delayed',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
  'email.failed': 'failed',
};

/** Evento de Resend → lo que nos interesa, o null si no es un email.* conocido o falta el id. */
export function parseResendEvent(payload: unknown): ResendEvent | null {
  const p = payload as any;
  const type = TYPES[String(p?.type || '')];
  const emailId = p?.data?.email_id;
  if (!type || typeof emailId !== 'string' || !emailId) return null;

  const created = Date.parse(String(p?.created_at || ''));
  const reason = p?.data?.bounce?.message ?? p?.data?.failed?.reason;
  const link = p?.data?.click?.link;
  return {
    type,
    emailId,
    at: new Date(Number.isFinite(created) ? created : Date.now()).toISOString(),
    ...(typeof link === 'string' ? { url: link.slice(0, 2000) } : {}),
    ...(typeof reason === 'string' ? { reason: reason.slice(0, 300) } : {}),
  };
}
