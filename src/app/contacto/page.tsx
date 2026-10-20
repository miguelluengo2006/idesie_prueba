import type { Metadata } from 'next';
import { SectionPage } from '@/components/home/SubPage';
import ContactSection from '@/components/home/ContactSection';
import { OG_IMAGES } from '@/lib/seo';
import { CONTACT } from '@/lib/bim';

const TITLE = 'Contacto y agenda de llamada';
const DESCRIPTION = 'Agenda una llamada de 30 minutos y te orientamos sobre el perfil que mejor encaja contigo o con tu equipo.';

export const metadata: Metadata = {
  alternates: { canonical: '/contacto' },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES', images: OG_IMAGES },
  twitter: { card: 'summary_large_image', images: ['/og-idesie.png'], title: TITLE, description: DESCRIPTION },
};

export default function Page() {
  return (
    <SectionPage title="Contacto y agenda de llamada">
      <ContactSection />
    </SectionPage>
  );
}
