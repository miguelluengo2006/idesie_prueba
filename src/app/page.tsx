import Link from 'next/link';
import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';
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
import BookCallForm from '@/components/home/BookCallForm';
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
          <section id="contacto" className="px-4 md:px-6 py-24 md:py-32 scroll-mt-24">
            <div className="max-w-4xl mx-auto">
              <span className="text-xs tracking-[0.25em] uppercase text-[var(--signal)]">Hablemos</span>
              <h2 className="font-kinetic font-black uppercase text-3xl md:text-5xl leading-[1.05] mt-4 mb-4">Agenda tu llamada</h2>
              <p className="text-white/60 max-w-lg mb-8">
                Elige un hueco y respóndenos unas preguntas rápidas: en 30 minutos te orientamos sobre el perfil que mejor encaja contigo
                o con tu equipo. ¿Prefieres explorar antes?{' '}
                <a href="#perfiles" className="text-[var(--signal)] hover:underline">Mira los perfiles profesionales</a>.
              </p>

              <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70 mb-12">
                <li className="inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--signal)]" aria-hidden="true" /> {CONTACT.address}
                </li>
                <li>
                  <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 hover:text-white transition-colors">
                    <Phone className="w-4 h-4 text-[var(--signal)]" aria-hidden="true" /> {CONTACT.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 hover:text-white transition-colors">
                    <Mail className="w-4 h-4 text-[var(--signal)]" aria-hidden="true" /> {CONTACT.email}
                  </a>
                </li>
              </ul>

              <BookCallForm businessName={CONTACT.name} />
              <p className="text-sm text-white/40 mt-12 pt-8 border-t border-white/10">
                ¿Ya eres alumno o cliente?{' '}
                <Link href="/auth" className="text-[var(--signal)] hover:underline">Accede a tu cuenta</Link>.
              </p>
            </div>
          </section>
        </main>

        <SiteFooter className="w-[calc(100%-clamp(20px,5vw,72px))] max-w-[1320px] mx-auto mt-3 mb-4" />
      </div>
    </BookCallProvider>
  );
}
