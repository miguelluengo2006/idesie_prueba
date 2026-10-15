import type { Metadata } from 'next';
import { SectionPage } from '@/components/home/SubPage';
import Programs from '@/components/home/Programs';
import { CONTACT } from '@/lib/bim';

const TITLE = 'Másteres BIM: blended y online';
const DESCRIPTION = 'Máster BIM blended (50% presencial, 50% online) y Máster BIM online, con metodología dual y bolsa de empleo.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function Page() {
  return (
    <SectionPage title="Másteres BIM: blended y online">
      <Programs />
    </SectionPage>
  );
}
