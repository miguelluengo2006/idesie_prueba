import type { Metadata } from 'next';
import SiteHeader from '@/components/home/SiteHeader';
import SiteFooter from '@/components/home/SiteFooter';
import HeroCarousel from '@/components/home/HeroCarousel';
import Stats from '@/components/home/Stats';
import CertificateSection from '@/components/home/CertificateSection';
import Simulator from '@/components/home/Simulator';
import AudiencePicker from '@/components/home/AudiencePicker';
import ProfileExplorer from '@/components/home/ProfileExplorer';
import Programs from '@/components/home/Programs';
import LearningByWorking from '@/components/home/LearningByWorking';
import Alumni from '@/components/home/Alumni';
import Alliances from '@/components/home/Alliances';
import Companies from '@/components/home/Companies';
import Professionals from '@/components/home/Professionals';
import Agenda from '@/components/home/Agenda';
import Orientation from '@/components/home/Orientation';
import BackToTop from '@/components/home/BackToTop';
import ContactSection from '@/components/home/ContactSection';
import { BookCallProvider } from '@/components/home/BookCall';
import { CONTACT } from '@/lib/bim';
import { FACTS } from '@/lib/content';

const TITLE = 'IDESIE Business & Tech School — Máster BIM, microcredenciales y certificación de perfiles';
const DESCRIPTION =
  'Formamos en competencias: la escuela tecnológica para arquitectos e ingenieros. Certificación universitaria UTAMED y certificación profesional AECOMI. Formación BIM en Madrid desde ' + FACTS.founded + '.';

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
        <SiteHeader overlay />
        {/* Fuera de <main>: `.home-root main > section` convierte cada sección en un panel con márgenes y el carrusel va a sangre. */}
        <HeroCarousel />

        <main className="relative z-[2]">
          <Stats />
          <CertificateSection />
          <Simulator />
          <AudiencePicker />
          <ProfileExplorer />
          <Programs />
          <LearningByWorking />
          <Alumni />
          <Alliances />
          <Companies />
          <Professionals />
          <Agenda />
          <Orientation />
        </main>

        <SiteFooter />
        <BackToTop />
      </div>
    </BookCallProvider>
  );
}
