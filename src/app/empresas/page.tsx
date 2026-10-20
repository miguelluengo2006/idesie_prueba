import type { Metadata } from 'next';
import EmpresasPage from '@/components/home/EmpresasPage';
import { OG_IMAGES } from '@/lib/seo';
import { CONTACT } from '@/lib/bim';

const TITLE = 'Empresas: formación in-company y consultoría BIM con IA';
const DESCRIPTION =
  'Define los perfiles que necesitas, forma a tus equipos con itinerarios in-company, incorpora talento y contrata consultoría BIM: ISO 19650, modelado, auditoría, 4D/5D e IA aplicada.';

export const metadata: Metadata = {
  alternates: { canonical: '/empresas' },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES', images: OG_IMAGES },
  twitter: { card: 'summary_large_image', images: ['/og-idesie.png'], title: TITLE, description: DESCRIPTION },
};

export default function EmpresasRoute() {
  return <EmpresasPage />;
}
