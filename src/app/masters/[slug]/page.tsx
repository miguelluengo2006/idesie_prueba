import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MasterPage from '@/components/home/MasterPage';
import { MASTER_SLUGS, getMaster } from '@/lib/masters';
import { CONTACT } from '@/lib/bim';

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
    openGraph: { title, description, type: 'website', siteName: CONTACT.name, locale: 'es_ES' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const master = getMaster((await params).slug);
  if (!master) notFound();
  return <MasterPage master={master} />;
}
