import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { resolveLeadMailer, sendLeadMail } from '@/lib/leadMailer';

const supabase = (profile: Record<string, unknown> | null) =>
  ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: profile }) }) }) }) }) as any;

const KEYS = ['RESEND_API_KEY', 'RESEND_FROM', 'LEAD_NOTIFY_EMAIL', 'ADMIN_EMAIL'];
let saved: Record<string, string | undefined> = {};
beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  KEYS.forEach((k) => delete process.env[k]);
});
afterEach(() => {
  KEYS.forEach((k) => (saved[k] === undefined ? delete process.env[k] : (process.env[k] = saved[k])));
  vi.unstubAllGlobals();
});

describe('resolveLeadMailer — Resend', () => {
  it('usa Resend cuando hay RESEND_API_KEY, con el remitente y el destinatario configurados', async () => {
    process.env.RESEND_API_KEY = 're_123';
    process.env.RESEND_FROM = 'samgple <leads@samgple.com>';
    process.env.LEAD_NOTIFY_EMAIL = 'yo@samgple.com, socio@samgple.com';
    const m = await resolveLeadMailer(supabase({ email: 'duena@agencia.com' }), 'o1');
    expect(m).toMatchObject({ from: 'samgple <leads@samgple.com>', to: 'yo@samgple.com, socio@samgple.com' });
  });

  it('sin LEAD_NOTIFY_EMAIL avisa al correo de la cuenta y, sin RESEND_FROM, usa el remitente de pruebas', async () => {
    process.env.RESEND_API_KEY = 're_123';
    const m = await resolveLeadMailer(supabase({ email: 'duena@agencia.com' }), 'o1');
    expect(m?.to).toBe('duena@agencia.com');
    expect(m?.from).toContain('onboarding@resend.dev');
  });

  it('sin RESEND_API_KEY no hay correo, aunque exista un SMTP antiguo', async () => {
    process.env.ADMIN_EMAIL = 'a@b.es';
    const m = await resolveLeadMailer(
      supabase({ email: 'a@b.es', agency_smtp_enabled: true, agency_smtp_host: 'h', agency_smtp_user: 'u', agency_smtp_pass_encrypted: 'p' }),
      'o1'
    );
    expect(m).toBeNull();
  });

  it('sin nada configurado devuelve null', async () => {
    expect(await resolveLeadMailer(supabase({ email: 'a@b.es' }), 'o1')).toBeNull();
  });
});

describe('sendLeadMail', () => {
  const resendMailer = { resendApiKey: 're_123', from: 'samgple <leads@samgple.com>', to: 'a@x.es, b@x.es' };

  it('envía a la API de Resend con clave, destinatarios en lista, reply_to e Idempotency-Key', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'e1' }) });
    vi.stubGlobal('fetch', fetchMock);
    await sendLeadMail(resendMailer, { subject: 'S', html: '<p>h</p>', text: 't', replyTo: 'cli@x.es', idempotencyKey: 'lead-1' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer re_123');
    expect(init.headers['Idempotency-Key']).toBe('lead-1');
    expect(JSON.parse(init.body)).toEqual({ from: 'samgple <leads@samgple.com>', to: ['a@x.es', 'b@x.es'], subject: 'S', html: '<p>h</p>', text: 't', reply_to: 'cli@x.es' });
  });

  it('si Resend rechaza el envío, lanza un error legible', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403, json: async () => ({ message: 'The samgple.com domain is not verified.' }) }));
    await expect(sendLeadMail(resendMailer, { subject: 'S', html: 'h' })).rejects.toThrow('Resend 403: The samgple.com domain is not verified.');
  });

  it('devuelve el id del email para seguirlo con el webhook', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'e1' }) }));
    expect(await sendLeadMail(resendMailer, { subject: 'S', html: 'h' })).toBe('e1');
  });
});
