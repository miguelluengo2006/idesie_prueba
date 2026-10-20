import type { Metadata } from 'next';
import CertPage from '@/components/home/CertPage';
import { CONTACT } from '@/lib/bim';

const TITLE = 'Certificación de perfiles con AECOMI';
const DESCRIPTION = 'IDESIE forma y AECOMI certifica: ruta de formación y experiencia hacia los perfiles IDM, BDM y BCM.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function Page() {
  return <CertPage />;
}
