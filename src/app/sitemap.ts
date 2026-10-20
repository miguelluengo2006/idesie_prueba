import type { MetadataRoute } from 'next';
import { PROFILES } from '@/lib/bim';
import { MASTER_SLUGS } from '@/lib/masters';
import { SEED_PRODUCTS } from '@/lib/shop';
import { SITE_URL } from '@/lib/seo';

// Fecha de la última revisión de contenidos: estable entre despliegues (una fecha nueva en cada visita le resta valor al sitemap)
const UPDATED = new Date('2026-10-20');

type Entry = MetadataRoute.Sitemap[number];
const entry = (path: string, priority: number, changeFrequency: Entry['changeFrequency'] = 'monthly'): Entry => ({
  url: `${SITE_URL}${path}`,
  lastModified: UPDATED,
  changeFrequency,
  priority,
});

/** Solo páginas indexables: sin redirecciones, sin carrito ni pedidos, sin /landing (noindex) ni el panel. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    entry('', 1, 'weekly'),
    entry('/masters', 0.9),
    ...MASTER_SLUGS.map((slug) => entry(`/masters/${slug}`, 0.9)),
    entry('/tienda', 0.9, 'weekly'),
    ...SEED_PRODUCTS.filter((p) => p.active).map((p) => entry(`/tienda/${p.slug}`, 0.8)),
    entry('/microcredenciales', 0.8),
    entry('/perfiles', 0.8),
    ...PROFILES.map((p) => entry(`/perfiles/${p.code.toLowerCase()}`, 0.7)),
    entry('/simulador', 0.8),
    entry('/certificacion', 0.8),
    entry('/ia-bim', 0.8),
    entry('/metodologia', 0.7),
    entry('/profesores', 0.7),
    entry('/empresas', 0.7),
    entry('/contacto', 0.6),
    ...['aviso-legal', 'privacidad', 'cookies', 'terminos'].map((s) => entry(`/${s}`, 0.2, 'yearly')),
  ];
}
