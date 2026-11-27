// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function load(id = 'G-ABC123XYZ') {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_GA_ID', id);
  return import('../googleAnalytics');
}

/** Lo que gtag ha encolado en dataLayer, como arrays normales. */
const queued = () => (window.dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>));
const gaScripts = () => [...document.querySelectorAll('script')].filter((s) => s.src.includes('googletagmanager.com/gtag/js'));

describe('Google Analytics', () => {
  beforeEach(() => {
    delete window.gtag;
    delete window.dataLayer;
    document.head.innerHTML = '';
  });
  afterEach(() => vi.unstubAllEnvs());

  it('lee el ID de la variable de entorno y lo valida', async () => {
    const ga = await load(' G-ABC123XYZ ');
    expect(ga.GA_ID).toBe('G-ABC123XYZ');
    expect(ga.isValidGaId('G-ABC123XYZ')).toBe(true);
    expect(ga.isValidGaId('UA-12345-1')).toBe(false);
    expect(ga.isValidGaId('G-abc"><script>')).toBe(false);
  });

  it('instala gtag una sola vez, con la publicidad de Google denegada', async () => {
    const ga = await load();
    ga.loadGoogleAnalytics('G-ABC123XYZ');
    ga.loadGoogleAnalytics('G-ABC123XYZ');
    expect(gaScripts()).toHaveLength(1);
    expect(gaScripts()[0].src).toContain('id=G-ABC123XYZ');
    const consent = queued().find((c) => c[0] === 'consent');
    expect(consent?.[2]).toMatchObject({ analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    expect(queued().some((c) => c[0] === 'config' && c[1] === 'G-ABC123XYZ')).toBe(true);
  });

  it('no carga nada con un ID que no es de GA4', async () => {
    const ga = await load();
    ga.loadGoogleAnalytics('G-<mal>');
    expect(gaScripts()).toHaveLength(0);
    expect(window.gtag).toBeUndefined();
  });

  it('los eventos no hacen nada sin GA cargado (sin consentimiento o sin ID)', async () => {
    const ga = await load();
    expect(() => ga.gaEvent('generate_lead', { program: 'Máster BIM Online' })).not.toThrow();
    expect(window.dataLayer).toBeUndefined();
  });

  it('envía los eventos cuando GA está cargado', async () => {
    const ga = await load();
    ga.loadGoogleAnalytics('G-ABC123XYZ');
    ga.gaEvent('generate_lead', { program: 'Máster BIM Online' });
    expect(queued()).toContainEqual(['event', 'generate_lead', { program: 'Máster BIM Online' }]);
  });
});
