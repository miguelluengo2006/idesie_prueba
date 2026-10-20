import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MasterPage from '@/components/home/MasterPage';
import { MASTER_SLUGS, getMaster } from '@/lib/masters';
import { CONTACT } from '@/lib/bim';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, courseJsonLd, OG_IMAGES } from '@/lib/seo';
import { SEED_PRODUCTS } from '@/lib/shop';

// Cada máster y la ficha de su matrícula en la tienda
const PRODUCT_OF: Record<string, string> = { mbim: 'master-bim-full-time', mbbe: 'master-bim-building-engineering', 'mbim-online': 'master-bim-online' };

export function generateStaticParams() {
  return MASTER_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const master = getMaster((await params).slug);
  if (!master) return {};
  const title = `${master.name} (${master.code}) · ${master.mode} | IDESIE`;
  const description = master.lead;
  return {
    title,
    description,
    alternates: { canonical: `/masters/${master.slug}` },
    openGraph: { title, description, type: 'website', siteName: CONTACT.name, locale: 'es_ES', images: OG_IMAGES },
    twitter: { card: 'summary_large_image', images: ['/og-idesie.png'], title, description },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const master = getMaster((await params).slug);
  if (!master) notFound();
  const product = SEED_PRODUCTS.find((p) => p.slug === PRODUCT_OF[master.slug]);
  return (
    <>
      <JsonLd
        data={[
          courseJsonLd({
            name: `${master.name} (${master.code})`,
            description: master.lead,
            path: `/masters/${master.slug}`,
            online: master.mode === 'Online',
            priceEur: product?.priceEur ?? null,
            credential: product?.certification ?? null,
            duration: product?.duration ?? null,
          }),
          breadcrumbJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Másteres', path: '/masters' }, { name: master.name, path: `/masters/${master.slug}` }]),
        ]}
      />
      <MasterPage master={master} />
    </>
  );
}
