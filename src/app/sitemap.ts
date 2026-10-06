import type { MetadataRoute } from 'next';
import { PROFILES } from '@/lib/bim';

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
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    ...profiles,
    ...legal,
  ];
}
