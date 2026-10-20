import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { REDIRECTS } from '../redirects';
import { SEED_PRODUCTS } from '../shop';
import { MASTER_SLUGS } from '../masters';

/** Rutas que existen como página en src/app (sin grupos ni parámetros dinámicos). */
function pages(dir = join(process.cwd(), 'src/app'), base = ''): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...pages(full, `${base}/${name}`));
    else if (name === 'page.tsx') out.push(base || '/');
  }
  return out;
}

describe('redirecciones 301', () => {
  const routes = pages();
  const matchesRoute = (path: string) =>
    routes.some((r) => r === path || new RegExp('^' + r.replace(/\[[^\]]+\]/g, '[^/]+') + '$').test(path));

  it('ningún origen se repite', () => {
    const sources = REDIRECTS.map((r) => r.source);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it('todo destino es una página real (o su ancla) y no hay cadenas ni bucles', () => {
    const sources = new Set(REDIRECTS.map((r) => r.source.replace(/\/:.*$/, '')));
    for (const r of REDIRECTS) {
      const path = r.destination.split('#')[0].replace(':slug', 'x') || '/';
      expect(matchesRoute(path), `${r.source} → ${r.destination}`).toBe(true);
      expect(sources.has(path === '/' ? '//' : path), `cadena en ${r.source} → ${r.destination}`).toBe(false);
    }
  });

  it('cubre todas las URLs del sitemap anterior de idesie.com', () => {
    const old = ['alianzas-page', 'alumni-page', 'aviso-legal-page', 'bim-consulting-page', 'bolsa-de-empleo-page', 'comparativa-masters-page', 'contact-page', 'embim-page', 'empresas-page', 'financiacion-y-becas-page', 'in-company-page', 'mbbe-page', 'mbim-online-page', 'mbim-page', 'nuestra-metodologia-page', 'opiniones-page', 'politica-cookies-page', 'politica-privacidad-page', 'profesores-page', 'short-courses-page', 'sobre-idesie-page', 'solicitud-baja-page'];
    const sources = new Set(REDIRECTS.map((r) => r.source));
    for (const p of old) expect(sources.has(`/${p}`), p).toBe(true);
  });

  it('las fichas de producto antiguas conservan su slug en la tienda', () => {
    const old = ['curso-revit-gratis', 'executive-master-bim', 'master-bim-building-engineering', 'master-bim-full-time', 'master-bim-online', 'titulo-profesional-cualificam'];
    expect(SEED_PRODUCTS.map((p) => p.slug).sort()).toEqual(old);
    expect(REDIRECTS.find((r) => r.source === '/producto/:slug')?.destination).toBe('/tienda/:slug');
  });

  it('los másteres apuntan a sus páginas', () => {
    for (const slug of MASTER_SLUGS) expect(REDIRECTS.some((r) => r.destination === `/masters/${slug}`)).toBe(true);
  });
});

describe('datos estructurados', () => {
  it('convierte la duración al formato de schema.org', async () => {
    const { isoDuration } = await import('../seo');
    expect(isoDuration('16 meses')).toBe('P16M');
    expect(isoDuration('8 horas')).toBe('PT8H');
    expect(isoDuration('a tu ritmo')).toBeNull();
  });
});
