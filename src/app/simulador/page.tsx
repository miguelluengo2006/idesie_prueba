import type { Metadata } from 'next';
import SimulatorPage from '@/components/home/SimulatorPage';
import { CONTACT } from '@/lib/bim';

const TITLE = 'Simulador profesional · Proyecto fin de máster';
const DESCRIPTION = 'Un encargo BIM completo con un cliente real: requisitos, plan de ejecución, entregas por hitos, auditoría y defensa.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function Page() {
  return <SimulatorPage />;
}
