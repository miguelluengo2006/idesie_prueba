import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { flywireDigest } from '@/lib/flywire';

const processFlywireEvent = vi.fn();
vi.mock('@/lib/shopServer', () => ({ processFlywireEvent: (...a: unknown[]) => processFlywireEvent(...a) }));

import { POST } from '../route';

const SECRET = 'test-shared-secret';
const body = JSON.stringify({
  event_type: 'payment',
  event_date: '2026-10-20T10:00:00Z',
  data: { payment_id: 'PAY1', status: 'guaranteed', external_reference: 'IDE-2026-1001', amount_to: 1500000, currency_to: 'EUR' },
});
const req = (raw: string, digest?: string) =>
  new NextRequest('http://localhost/api/webhooks/flywire', { method: 'POST', body: raw, headers: digest ? { 'x-flywire-digest': digest } : {} });

describe('POST /api/webhooks/flywire', () => {
  beforeEach(() => {
    processFlywireEvent.mockReset().mockResolvedValue('paid');
    process.env.FLYWIRE_SHARED_SECRET = SECRET;
  });

  it('responde 503 si no hay secreto configurado', async () => {
    delete process.env.FLYWIRE_SHARED_SECRET;
    expect((await POST(req(body, 'x'))).status).toBe(503);
    expect(processFlywireEvent).not.toHaveBeenCalled();
  });

  it('rechaza una firma incorrecta o ausente sin tocar la base de datos', async () => {
    expect((await POST(req(body, 'firma-falsa'))).status).toBe(401);
    expect((await POST(req(body))).status).toBe(401);
    expect(processFlywireEvent).not.toHaveBeenCalled();
  });

  it('rechaza si el cuerpo se ha modificado tras firmarlo', async () => {
    const digest = flywireDigest(body, SECRET);
    expect((await POST(req(body.replace('1500000', '1'), digest))).status).toBe(401);
  });

  it('procesa un aviso con firma válida', async () => {
    const res = await POST(req(body, flywireDigest(body, SECRET)));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, outcome: 'paid' });
    expect(processFlywireEvent).toHaveBeenCalledWith(expect.objectContaining({ reference: 'IDE-2026-1001', status: 'guaranteed', amountToCents: 1500000 }), expect.anything());
  });

  it('devuelve 500 (para que Flywire reintente) si falla el proceso', async () => {
    processFlywireEvent.mockRejectedValue(new Error('db'));
    expect((await POST(req(body, flywireDigest(body, SECRET)))).status).toBe(500);
  });
});
