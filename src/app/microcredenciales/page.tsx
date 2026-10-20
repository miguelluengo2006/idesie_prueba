import type { Metadata } from 'next';
import MicrosPage from '@/components/home/MicrosPage';
import { OG_IMAGES } from '@/lib/seo';
import { CONTACT } from '@/lib/bim';

const TITLE = 'Catálogo de microcredenciales BIM';
const DESCRIPTION = '23 microcredenciales de 1 a 3 ECTS, acumulables hasta completar el Máster BIM de 60 ECTS.';

export const metadata: Metadata = {
  alternates: { canonical: '/microcredenciales' },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES', images: OG_IMAGES },
  twitter: { card: 'summary_large_image', images: ['/og-idesie.png'], title: TITLE, description: DESCRIPTION },
};

export default function Page() {
  return <MicrosPage />;
}
