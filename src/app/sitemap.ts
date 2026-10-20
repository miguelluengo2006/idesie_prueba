import type { MetadataRoute } from 'next';
import { PROFILES } from '@/lib/bim';
import { MASTER_SLUGS } from '@/lib/masters';
import { SEED_PRODUCTS } from '@/lib/shop';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const legal: MetadataRoute.Sitemap = ['aviso-legal', 'privacidad', 'cookies', 'terminos'].map((slug) => ({
    url: `${siteUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.2,
  }));
  const profiles: MetadataRoute.Sitemap = PROFILES.map((p) => ({
    url: `${siteUrl}/perfiles/${p.code.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  const pages: MetadataRoute.Sitemap = ['ia-bim', 'metodologia', 'profesores', 'empresas', 'perfiles', 'masters', 'microcredenciales', 'simulador', 'certificacion', 'contacto', 'tienda'].map((slug) => ({
    url: `${siteUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));
  const products: MetadataRoute.Sitemap = SEED_PRODUCTS.map((p) => ({
    url: `${siteUrl}/tienda/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  const masters: MetadataRoute.Sitemap = MASTER_SLUGS.map((slug) => ({
    url: `${siteUrl}/masters/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    ...pages,
    ...masters,
    ...products,
    ...profiles,
    ...legal,
  ];
}
