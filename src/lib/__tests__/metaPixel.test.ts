// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Call = unknown[];

// Node 26 define su propio localStorage global y tapa el de jsdom: se usa uno en memoria
const store = new Map<string, string>();
const memoryStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

async function load(id = '1234567890') {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', id);
  return import('../metaPixel');
}

const consent = (marketing: boolean) => {
  localStorage.setItem('cookie_consent', JSON.stringify({ v: 1, analytics: false, marketing, ts: Date.now() }));
};
const calls = (): Call[] => {
  const q = (window.fbq as unknown as { queue?: Call[] } | undefined)?.queue;
  return q ? [...q] : [];
};

describe('Meta Pixel', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage);
    store.clear();
    delete window.fbq;
    delete window._fbq;
    document.head.innerHTML = '';
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('no carga nada sin consentimiento de publicidad', async () => {
    const px = await load();
    consent(false);
    const fn = vi.fn();
    px.whenPixelReady(fn);
    expect(fn).not.toHaveBeenCalled();
    expect(window.fbq).toBeUndefined();
  });

  it('con consentimiento instala el píxel con su ID y ejecuta el evento', async () => {
    const px = await load('987654321');
    consent(true);
    px.whenPixelReady(() => px.metaTrack('ViewContent', { content_name: 'x' }));
    expect(document.querySelector('script[src^="https://connect.facebook.net"]')).toBeTruthy();
    expect(calls()).toEqual([['init', '987654321'], ['track', 'ViewContent', { content_name: 'x' }]]);
  });

  it('sin ID de píxel no hace nada, aunque haya consentimiento', async () => {
    const px = await load('');
    consent(true);
    const fn = vi.fn();
    px.whenPixelReady(fn);
    expect(fn).not.toHaveBeenCalled();
  });

  it('espera al consentimiento y entonces envía el evento', async () => {
    const px = await load();
    const fn = vi.fn();
    px.whenPixelReady(fn);
    expect(fn).not.toHaveBeenCalled();
    const { saveConsent } = await import('../cookieConsent');
    saveConsent({ analytics: false, marketing: true });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(window.fbq).toBeTypeOf('function');
  });

  it('metaTrackOnce envía una sola vez y no gasta el aviso si el píxel aún no está', async () => {
    const px = await load();
    px.metaTrackOnce('order-1', 'Purchase', { value: 3000 }); // sin píxel: no se marca
    consent(true);
    px.whenPixelReady(() => {});
    px.metaTrackOnce('order-1', 'Purchase', { value: 3000, currency: 'EUR' });
    px.metaTrackOnce('order-1', 'Purchase', { value: 3000, currency: 'EUR' });
    const purchases = calls().filter((c) => c[1] === 'Purchase');
    expect(purchases).toEqual([['track', 'Purchase', { value: 3000, currency: 'EUR' }, { eventID: 'order-1' }]]);
  });

  it('los eventos propios usan trackCustom', async () => {
    const px = await load();
    consent(true);
    px.whenPixelReady(() => px.metaTrackCustom('OfferView', { value: 3000 }));
    expect(calls()).toContainEqual(['trackCustom', 'OfferView', { value: 3000 }]);
  });
});
