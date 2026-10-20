import { createHmac, timingSafeEqual } from 'node:crypto';
import type { OrderStatus } from '@/lib/shop';

/**
 * Cobro con Flywire (Pay-by-Link). IDESIE ya tiene su portal dado de alta: el código de destinatario es `IBT`.
 * El navegador nunca decide el importe: lo calcula el servidor y bloquea los campos en la página de Flywire.
 */

export const FLYWIRE_RECIPIENT = (process.env.FLYWIRE_RECIPIENT || 'IBT').trim();
const FLYWIRE_BASE = 'https://payment.flywire.com/pay/payment';

export const flywireSecret = () => (process.env.FLYWIRE_SHARED_SECRET || '').trim();
export const flywireWebhookEnabled = () => flywireSecret().length > 0;

export function buildFlywireUrl(o: {
  totalCents: number;
  firstName: string;
  lastName: string;
  email: string;
  orderNumber: string;
  token: string;
  siteUrl: string;
  /** Si hay secreto del webhook, se pide a Flywire que avise del estado del pago. */
  callbacks: boolean;
}): string {
  const q: [string, string][] = [
    ['recipient', FLYWIRE_RECIPIENT],
    ['amount', String(o.totalCents)],
    ['student_first_name', o.firstName],
    ['student_last_name', o.lastName],
    ['student_email', o.email],
    ['read_only', 'amount,student_first_name,student_last_name,student_email'],
    ['return_cta', `${o.siteUrl}/pedido/${o.token}`],
    ['return_cta_name', 'Volver a IDESIE'],
  ];
  if (o.callbacks) {
    q.push(['callback_id', o.orderNumber], ['callback_url', `${o.siteUrl}/api/webhooks/flywire`], ['callback_version', '2']);
  }
  return `${FLYWIRE_BASE}?${q.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
}

/** X-Flywire-Digest: HMAC-SHA256 del cuerpo exacto recibido con el secreto compartido, en base64. */
export function flywireDigest(rawBody: string, secret: string): string {
  return createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
}

export function verifyFlywireDigest(rawBody: string, header: string | null | undefined, secret: string): boolean {
  if (!secret || !header) return false;
  const expected = Buffer.from(flywireDigest(rawBody, secret));
  const got = Buffer.from(header.trim());
  return expected.length === got.length && timingSafeEqual(expected, got);
}

export interface FlywireEvent {
  eventType: string;
  eventDate: string;
  status: string;
  paymentId: string;
  /** Nuestro número de pedido (el `callback_id` del enlace). */
  reference: string;
  amountToCents: number | null;
  currencyTo: string | null;
}

export function parseFlywireEvent(body: unknown): FlywireEvent | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, any>;
  const d = (b.data && typeof b.data === 'object' ? b.data : {}) as Record<string, any>;
  const status = String(d.status || b.event_type || '').toLowerCase();
  const reference = String(d.external_reference || d.callback_id || '').trim();
  const paymentId = String(d.payment_id || '').trim();
  if (!status || !reference || !paymentId) return null;
  const amount = Number(d.amount_to);
  return {
    eventType: String(b.event_type || status).toLowerCase(),
    eventDate: String(b.event_date || ''),
    status,
    paymentId,
    reference,
    amountToCents: Number.isFinite(amount) ? Math.round(amount) : null,
    currencyTo: d.currency_to ? String(d.currency_to).toUpperCase() : null,
  };
}

/** Estado del pedido que corresponde a un estado de Flywire (null = solo se anota, no cambia el pedido). */
export function orderStatusFromFlywire(status: string): OrderStatus | null {
  switch (status) {
    case 'guaranteed':
    case 'delivered':
      return 'paid';
    case 'failed':
      return 'failed';
    case 'cancelled':
      return 'cancelled';
    case 'reversed':
      return 'refunded';
    default:
      return null; // initiated, processed, authorized, adjusted
  }
}
