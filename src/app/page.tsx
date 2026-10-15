import type { Metadata } from 'next';
import SiteHeader from '@/components/home/SiteHeader';
import SiteFooter from '@/components/home/SiteFooter';
import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import ProfileExplorer from '@/components/home/ProfileExplorer';
import Route from '@/components/home/Route';
import Simulator from '@/components/home/Simulator';
import Programs from '@/components/home/Programs';
import Catalog from '@/components/home/Catalog';
import Certification from '@/components/home/Certification';
import Companies from '@/components/home/Companies';
import PaymentNotice from '@/components/home/PaymentNotice';
import ContactSection from '@/components/home/ContactSection';
import { BookCallProvider } from '@/components/home/BookCall';
import { CONTACT } from '@/lib/bim';

const TITLE = 'IDESIE Business & Tech School — Máster BIM, microcredenciales y certificación de perfiles';
const DESCRIPTION =
  'Elige el puesto al que quieres llegar y te damos el mapa: microcredenciales, Máster BIM y certificación de tu perfil profesional con AECOMI. Formación BIM en Madrid desde 2012.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function HomePage() {
  return (
    <BookCallProvider businessName={CONTACT.name}>
      <div className="home-root min-h-screen relative">
        <SiteHeader />
        <PaymentNotice />

        <main className="relative z-[2]">
          <Hero />
          <Stats />
          <ProfileExplorer />
          <Route />
          <Simulator />
          <Programs />
          <Catalog />
          <Certification />
          <Companies />

          {/* Contact */}
          <ContactSection />
        </main>

        <SiteFooter className="w-[calc(100%-clamp(20px,5vw,72px))] max-w-[1320px] mx-auto mt-3 mb-4" />
      </div>
    </BookCallProvider>
  );
}
