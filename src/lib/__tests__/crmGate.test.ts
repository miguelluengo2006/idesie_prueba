import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { gateEnabled, isGated, safeEqual, signGate, verifyGate } from '../crmGate';

const KEY = 'k'.repeat(32);

describe('puerta oculta del CRM', () => {
  beforeEach(() => { process.env.CRM_ENTRY_KEY = KEY; });
  afterEach(() => { delete process.env.CRM_ENTRY_KEY; });

  it('sin clave, o con una corta, la puerta no se aplica', () => {
    delete process.env.CRM_ENTRY_KEY;
    expect(gateEnabled()).toBe(false);
    process.env.CRM_ENTRY_KEY = 'corta';
    expect(gateEnabled()).toBe(false);
  });

  it('una cookie firmada vale y una manipulada, caducada o ajena no', async () => {
    const c = await signGate();
    expect(await verifyGate(c)).toBe(true);
    const [exp, sig] = c.split('.');
    expect(await verifyGate(`${Number(exp) + 10}.${sig}`)).toBe(false);
    expect(await verifyGate(c, Date.now() + 31 * 24 * 3600 * 1000)).toBe(false);
    expect(await verifyGate(undefined)).toBe(false);
    expect(await verifyGate('basura')).toBe(false);
    process.env.CRM_ENTRY_KEY = 'z'.repeat(32);
    expect(await verifyGate(c)).toBe(false);
  });

  it('esconde el login, el panel y las APIs de acceso, pero no los enlaces de los correos ni la web', () => {
    for (const p of ['/auth', '/portal', '/portal/leads', '/api/auth/login', '/api/auth/passkey/login/options', '/api/auth-config']) expect(isGated(p)).toBe(true);
    for (const p of ['/', '/masters/mbim', '/auth/callback', '/auth/confirm', '/auth/set-password', '/invite/accept-team', '/api/public/contact']) expect(isGated(p)).toBe(false);
  });

  it('compara claves sin atajos', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });
});
