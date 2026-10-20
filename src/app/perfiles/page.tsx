import type { Metadata } from 'next';
import ProfilesPage from '@/components/home/ProfilesPage';
import { OG_IMAGES } from '@/lib/seo';
import { CONTACT } from '@/lib/bim';

const TITLE = 'Perfiles profesionales BIM';
const DESCRIPTION = 'Elige el puesto al que quieres llegar: cada perfil BIM tiene su mapa de microcredenciales, ECTS y certificación AECOMI.';

export const metadata: Metadata = {
  alternates: { canonical: '/perfiles' },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES', images: OG_IMAGES },
  twitter: { card: 'summary_large_image', images: ['/og-idesie.png'], title: TITLE, description: DESCRIPTION },
};

export default function Page() {
  return <ProfilesPage />;
}
