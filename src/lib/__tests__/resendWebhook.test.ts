import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import { parseResendEvent, verifyResendSignature } from '../resendWebhook';

const secret = `whsec_${Buffer.from('clave-de-prueba-32-bytes-xxxxxxxx').toString('base64')}`;
const sign = (id: string, ts: string, raw: string) =>
  `v1,${createHmac('sha256', Buffer.from(secret.slice(6), 'base64')).update(`${id}.${ts}.${raw}`).digest('base64')}`;

describe('firma del webhook de Resend', () => {
  const raw = '{"type":"email.delivered"}';
  const now = 1_800_000_000;
  const ts = String(now);

  it('acepta una firma correcta', () => {
    expect(verifyResendSignature(raw, { id: 'msg_1', timestamp: ts, signature: sign('msg_1', ts, raw) }, secret, now)).toBe(true);
  });

  it('acepta si una de varias firmas es válida', () => {
    const signature = `v1,AAAA ${sign('msg_1', ts, raw)}`;
    expect(verifyResendSignature(raw, { id: 'msg_1', timestamp: ts, signature }, secret, now)).toBe(true);
  });

  it('rechaza un cuerpo alterado, otra clave o cabeceras ausentes', () => {
    const signature = sign('msg_1', ts, raw);
    expect(verifyResendSignature(raw + ' ', { id: 'msg_1', timestamp: ts, signature }, secret, now)).toBe(false);
    expect(verifyResendSignature(raw, { id: 'msg_2', timestamp: ts, signature }, secret, now)).toBe(false);
    expect(verifyResendSignature(raw, { id: 'msg_1', timestamp: ts, signature }, 'whsec_b3Rh', now)).toBe(false);
    expect(verifyResendSignature(raw, { id: null, timestamp: ts, signature }, secret, now)).toBe(false);
    expect(verifyResendSignature(raw, { id: 'msg_1', timestamp: ts, signature: null }, secret, now)).toBe(false);
  });

  it('rechaza avisos fuera de la ventana de tiempo', () => {
    const old = String(now - 3600);
    expect(verifyResendSignature(raw, { id: 'msg_1', timestamp: old, signature: sign('msg_1', old, raw) }, secret, now)).toBe(false);
  });
});

describe('lectura del evento', () => {
  it('lee entrega, clic y rebote', () => {
    expect(parseResendEvent({ type: 'email.delivered', created_at: '2026-10-01T10:00:00Z', data: { email_id: 'e1' } })).toEqual({
      type: 'delivered',
      emailId: 'e1',
      at: '2026-10-01T10:00:00.000Z',
    });
    expect(parseResendEvent({ type: 'email.clicked', created_at: '2026-10-01T10:00:00Z', data: { email_id: 'e1', click: { link: 'https://idesie.com' } } })).toMatchObject({
      type: 'clicked',
      url: 'https://idesie.com',
    });
    expect(parseResendEvent({ type: 'email.bounced', created_at: '2026-10-01T10:00:00Z', data: { email_id: 'e1', bounce: { message: 'Buzón inexistente' } } })).toMatchObject({
      type: 'bounced',
      reason: 'Buzón inexistente',
    });
  });

  it('ignora tipos desconocidos y avisos sin id', () => {
    expect(parseResendEvent({ type: 'domain.updated', data: { email_id: 'e1' } })).toBeNull();
    expect(parseResendEvent({ type: 'email.opened', data: {} })).toBeNull();
    expect(parseResendEvent(null)).toBeNull();
  });
});
