import type { SupabaseClient } from '@supabase/supabase-js';

export interface LeadMailer {
  /** API key de Resend (RESEND_API_KEY) */
  resendApiKey: string;
  from: string;
  /** Where the "new lead" notification goes (varias direcciones separadas por comas) */
  to: string;
}

const RESEND_TEST_SENDER = 'onboarding@resend.dev';

/**
 * Works out how to email the agency about a new lead, or null when Resend isn't configured
 * (the lead is saved regardless — the email is only a convenience).
 *
 * From: RESEND_FROM (must be on a domain verified in Resend; without it the Resend test sender is used,
 * which only delivers to the Resend account owner).
 * To: LEAD_NOTIFY_EMAIL, or the owner's account email, or ADMIN_EMAIL.
 */
export async function resolveLeadMailer(supabase: SupabaseClient, ownerId: string): Promise<LeadMailer | null> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) return null;

  const { data: profile } = await supabase.from('profiles').select('email').eq('id', ownerId).maybeSingle();
  const to = process.env.LEAD_NOTIFY_EMAIL?.trim() || profile?.email || process.env.ADMIN_EMAIL;
  if (!to) return null;

  return {
    resendApiKey: resendKey,
    from: process.env.RESEND_FROM?.trim() || `IDESIE <${RESEND_TEST_SENDER}>`,
    to,
  };
}

export interface LeadMailMessage {
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  /** Evita duplicados si se reintenta el mismo aviso */
  idempotencyKey?: string;
  /** Cabeceras extra (p. ej. List-Unsubscribe en las campañas) */
  headers?: Record<string, string>;
}

/** El mismo remitente y proveedor, pero con otro destinatario (campañas: un email por contacto). */
export function mailerFor(mailer: LeadMailer, to: string): LeadMailer {
  return { ...mailer, to };
}

/**
 * Sends one email through Resend. Throws on failure (callers treat it as best-effort).
 * Devuelve el id del email en Resend, para seguirlo con el webhook.
 */
export async function sendLeadMail(mailer: LeadMailer, msg: LeadMailMessage): Promise<string | null> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mailer.resendApiKey}`,
      'Content-Type': 'application/json',
      ...(msg.idempotencyKey ? { 'Idempotency-Key': msg.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: mailer.from,
      to: mailer.to.split(',').map((a) => a.trim()).filter(Boolean),
      subject: msg.subject,
      html: msg.html,
      ...(msg.text ? { text: msg.text } : {}),
      ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      ...(msg.headers ? { headers: msg.headers } : {}),
    }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(`Resend ${res.status}: ${detail?.message || detail?.name || 'error desconocido'}`);
  }
  const sent = await res.json().catch(() => ({}));
  return typeof sent?.id === 'string' ? sent.id : null;
}
