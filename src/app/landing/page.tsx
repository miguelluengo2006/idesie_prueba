import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Check, Clock, MessageCircle, Plus } from 'lucide-react';
import { BookCallProvider } from '@/components/home/BookCall';
import IdesieLogo from '@/components/home/IdesieLogo';
import CookieSettingsLink from '@/components/legal/CookieSettingsLink';
import Section from '@/components/home/Section';
import Reveal from '@/components/home/Reveal';
import Tile from '@/components/home/Tile';
import LogoTile from '@/components/home/LogoTile';
import DayScrubber from '@/components/landing/DayScrubber';
import MonthScrubber from '@/components/landing/MonthScrubber';
import LandingTracker from '@/components/landing/LandingTracker';
import CallButton from '@/components/landing/CallButton';
import StickyCta from '@/components/landing/StickyCta';
import WhatsAppFloat from '@/components/landing/WhatsAppFloat';
import { CONTACT } from '@/lib/bim';
import { COMPANY_LOGOS, FACTS, PHOTOS } from '@/lib/content';
import { OG_IMAGES } from '@/lib/seo';
import { MASTERS } from '@/lib/masters';

const TITLE = 'Máster BIM Full Time en Madrid: cobra mientras estudias';
const DESCRIPTION = 'Trabajas por la mañana, te formas por la tarde y sales siendo BIM Manager. Prácticas remuneradas desde el primer mes. Agenda una llamada con admisiones.';

// Página de anuncios: no compite en buscadores con la home.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES', images: OG_IMAGES },
};

const M = MASTERS.mbim;
const STEPS = [
  { title: 'Agenda una llamada', text: 'Elige día y hora en el calendario. Son 30 minutos.' },
  { title: 'Hablamos de tu caso', text: 'Revisamos tu perfil y resolvemos tus dudas, sin presión.' },
  { title: 'Decidimos juntos', text: 'Si encajas, te explicamos cómo reservar tu plaza en la próxima convocatoria.' },
];

const FAQS = [M.faqs[0], M.faqs[2], M.faqs[3]];

export default function LandingPage() {
  const NAME = 'Máster BIM Full Time';
  const cta = 'Agendar mi llamada';

  const proof = [
    { value: `${FACTS.founded}`, label: 'formando profesionales BIM' },
    { value: FACTS.students, label: 'alumnos formados' },
    { value: M.outcomes.stats[0].value, label: 'empleo en 6 meses' },
    { value: M.outcomes.stats[1].value, label: 'prácticas garantizadas' },
  ];

  return (
    <BookCallProvider businessName={CONTACT.name}>
      <div className="home-root min-h-screen relative">
        <LandingTracker name={NAME} />

        <header className="absolute inset-x-0 top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
            <Link href="/" aria-label="IDESIE, inicio">
              <IdesieLogo tone="white" className="h-10" priority />
            </Link>
            <div className="flex items-center gap-3">
              <CallButton place="cabecera" className="hidden md:inline-flex btn btn-blue min-h-11">
                Agendar llamada
              </CallButton>
            </div>
          </div>
        </header>

        <main>
          {/* 1 · Promesa y compra a la vista */}
          <section className="field-navy relative overflow-hidden px-4 md:px-6 pt-24 pb-14 md:pt-32 md:pb-24">
            <div className="hero-glow" aria-hidden="true" />
            <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
              <div>
                <p className="flex items-center gap-3 text-base md:text-lg font-semibold text-[#fff]">
                  <span className="relative flex w-3 h-3 shrink-0" aria-hidden="true">
                    <span className="absolute inset-0 rounded-full bg-[#ff6b5b] motion-safe:animate-ping opacity-75" />
                    <span className="relative w-3 h-3 rounded-full bg-[#ff6b5b]" />
                  </span>
                  Plazas limitadas para la próxima convocatoria
                </p>
                <h1 className="mt-5 font-kinetic font-bold text-[clamp(2rem,4.3vw,3.6rem)] leading-[1.06] text-[#fff]">
                  Cobras por la mañana. Aprendes por la tarde. <span className="text-[#7db4ff]">Sales BIM Manager.</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-[#c9d9f0] max-w-xl leading-relaxed">
                  El {NAME} de IDESIE, en Madrid: prácticas remuneradas desde el primer mes y la inteligencia artificial como herramienta de cada día.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <CallButton place="hero" className="btn btn-blue min-h-14 px-7 text-base">
                    {cta}
                  </CallButton>
                  <a href="#dia" className="btn btn-ghost min-h-14 px-6 text-base text-[#fff] border-[#7db4ff]/60">Ver cómo es tu día</a>
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm text-[#c9d9f0]">
                  <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
                  30 minutos, sin compromiso. Decidimos juntos si el máster encaja contigo.
                </p>
              </div>

              <div className="relative">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                  <Image
                    src={PHOTOS.clase.src}
                    alt={PHOTOS.clase.alt}
                    width={PHOTOS.clase.width}
                    height={PHOTOS.clase.height}
                    priority
                    sizes="(min-width:1024px) 480px, 100vw"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-5 left-4 right-4 md:left-auto md:-left-8 md:right-auto md:w-60 rounded-2xl bg-[#fff] text-[#0a1f44] p-5 shadow-[0_24px_60px_-20px_rgba(0,20,70,0.6)]">
                  <p className="font-kinetic font-bold text-3xl text-[#0063e6]">16 meses</p>
                  <p className="text-sm leading-snug mt-1 text-[#0a1f44]/80">Prácticas remuneradas por nómina desde el primer mes.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 2 · Cifras */}
          <section className="field-tint px-4 md:px-6 py-12 md:py-14" aria-label="IDESIE en cifras">
            <ul className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {proof.map((s) => (
                <li key={s.label}>
                  <p className="font-kinetic font-bold text-3xl md:text-4xl text-[#0a1f44]">{s.value}</p>
                  <p className="mt-1 text-sm md:text-base text-[#0a1f44]/75">{s.label}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* 3 · Un día partido en dos */}
          <div id="dia" className="scroll-mt-0">
            <DayScrubber />
          </div>

          {/* 4 · Los 16 meses */}
          <MonthScrubber />

          {/* 5 · Salidas */}
          <Section field="tint" labelledBy="roles-title">
            <Reveal className="max-w-3xl">
              <h2 id="roles-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12]">
                Dónde trabajas cuando <span className="ui-hl">terminas</span>
              </h2>
              <p className="mt-5 text-lg text-[#0a1f44]/75 leading-relaxed">{M.outcomes.stats[0].value} {M.outcomes.stats[0].text}</p>
            </Reveal>
            <ul className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {M.outcomes.roles.map((r, i) => (
                <Tile as="li" key={r.role} delay={i * 0.08} className={`p-6 flex flex-col justify-between gap-6 min-h-36 ${i % 2 ? 'bg-[#fff] text-[#0a1f44]' : 'bg-[#0a1f44] text-[#fff]'}`}>
                  <div>
                    <h3 className="font-kinetic font-bold text-xl leading-snug">{r.role}</h3>
                    <p className="mt-1 opacity-80">{r.focus}</p>
                  </div>
                </Tile>
              ))}
            </ul>
          </Section>

          {/* 6 · Empresas */}
          <Section field="white" labelledBy="proof-title" className="!py-14 md:!py-20">
            <h2 id="proof-title" className="font-kinetic font-bold text-2xl md:text-3xl text-center max-w-3xl mx-auto leading-tight">
              Empresas del sector colaboran con IDESIE
            </h2>
            <ul className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" aria-label="Empresas que colaboran con IDESIE">
              {COMPANY_LOGOS.slice(0, 10).map((l) => (
                <li key={l.name}>
                  <LogoTile logo={l} className="!bg-[var(--card)]" />
                </li>
              ))}
            </ul>
          </Section>

          {/* 7 · Cómo se entra: llamada primero */}
          <section id="reserva" aria-labelledby="offer-title" className="field-blue px-4 md:px-6 py-20 md:py-28 scroll-mt-0">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_0.95fr] gap-10 lg:gap-16 items-center">
              <div>
                <h2 id="offer-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12] text-[#fff]">
                  Primero hablamos. Después decidimos si hay plaza para ti.
                </h2>
                <p className="mt-5 text-lg text-[#fff]/90 leading-relaxed max-w-xl">
                  El máster es selectivo y las plazas son limitadas. En una llamada de 30 minutos conocemos tu perfil y resolvemos tus dudas, y si encajas te explicamos cómo reservar tu plaza.
                </p>
                <ul className="mt-7 space-y-3 text-[#fff]">
                  {[
                    'Prácticas remuneradas garantizadas desde el primer mes',
                    'Título propio IDESIE y certificación Cualificam',
                    'Clases presenciales en Madrid con profesionales en activo',
                    'IA aplicada a cada fase del proyecto BIM',
                  ].map((t) => (
                    <li key={t} className="flex gap-3">
                      <Check className="w-6 h-6 shrink-0 mt-0.5" aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl bg-[#fff] text-[#0a1f44] p-7 md:p-9 shadow-[0_30px_80px_-30px_rgba(0,20,70,0.6)]">
                <p className="text-sm font-bold tracking-wide uppercase text-[#0052cc]">{NAME} · 16 meses</p>
                <ol className="mt-5 space-y-5">
                  {STEPS.map((st, i) => (
                    <li key={st.title} className="flex gap-4">
                      <span className="font-kinetic font-bold text-3xl leading-none text-[#0063e6] w-6 shrink-0">{i + 1}</span>
                      <span>
                        <span className="block font-bold text-lg leading-snug">{st.title}</span>
                        <span className="block mt-1 text-[#0a1f44]/75 leading-relaxed">{st.text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <CallButton place="oferta" className="btn btn-blue mt-7 w-full justify-center min-h-14 text-base">
                  {cta}
                </CallButton>
              </div>
            </div>
          </section>

          {/* 8 · Para quién es + dudas */}
          <Section field="white" labelledBy="faq-title">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                <h2 className="font-kinetic font-bold text-3xl md:text-4xl leading-[1.12]">Es para ti si…</h2>
                <ul className="mt-7 space-y-4">
                  {M.requirements.slice(0, 5).map((r) => (
                    <li key={r} className="flex gap-3 text-lg leading-snug">
                      <BadgeCheck className="w-6 h-6 shrink-0 text-[#0063e6] mt-0.5" aria-hidden="true" />
                      {r}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-[#0a1f44]/70">Ejercer con certificación profesional depende de superar el proceso de evaluación de AECOMI; la acreditación del centro no lo garantiza.</p>
              </div>
              <div>
                <h2 id="faq-title" className="font-kinetic font-bold text-3xl md:text-4xl leading-[1.12]">Lo que suelen preguntarnos</h2>
                <div className="mt-7 space-y-2.5">
                  {FAQS.map((f) => (
                    <details key={f.q} name="faq" className="group rounded-2xl bg-[var(--card)] [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex items-center gap-4 cursor-pointer px-5 md:px-6 py-4 md:py-5 min-h-16 font-semibold text-base md:text-lg leading-snug">
                        <span className="flex-1">{f.q}</span>
                        <span className="w-9 h-9 shrink-0 rounded-full bg-[#0a1f44] text-[#fff] grid place-items-center transition-transform duration-300 group-open:rotate-45">
                          <Plus className="w-4 h-4" aria-hidden="true" />
                        </span>
                      </summary>
                      <p className="px-5 md:px-6 pb-5 text-[#0a1f44]/75 leading-relaxed">{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* 9 · Cierre */}
          <section id="cierre" className="field-navy relative overflow-hidden px-4 md:px-6 py-20 md:py-28 text-center" aria-labelledby="final-title">
            <div className="hero-glow-b" aria-hidden="true" />
            <div className="relative max-w-3xl mx-auto">
              <h2 id="final-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12] text-[#fff]">
                La próxima convocatoria tiene plazas limitadas
              </h2>
              <p className="mt-5 text-lg text-[#c9d9f0] leading-relaxed">
                Agenda tu llamada de 30 minutos y descubre si el Máster BIM Full Time es para ti.
              </p>
              <div className="mt-9 flex flex-wrap justify-center items-center gap-3">
                <CallButton place="cierre" className="btn btn-blue min-h-14 px-8 text-base">
                  {cta}
                </CallButton>
              </div>
              <p className="mt-4 text-sm text-[#c9d9f0]">WhatsApp: {CONTACT.whatsapp}</p>
            </div>
          </section>
        </main>

        <footer className="field-navy border-t border-[#7db4ff]/20 px-4 md:px-6 py-8 pb-28 md:pb-8">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-[#c9d9f0]">
            <p>© {new Date().getFullYear()} {CONTACT.name} {CONTACT.tagline} · {CONTACT.address}</p>
            <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-1">
              <Link href="/terminos" className="hover:text-[#fff] min-h-11 inline-flex items-center">Términos</Link>
              <Link href="/privacidad" className="hover:text-[#fff] min-h-11 inline-flex items-center">Privacidad</Link>
              <Link href="/aviso-legal" className="hover:text-[#fff] min-h-11 inline-flex items-center">Aviso legal</Link>
              <Link href="/cookies" className="hover:text-[#fff] min-h-11 inline-flex items-center">Cookies</Link>
              <CookieSettingsLink />
            </nav>
          </div>
        </footer>
        <StickyCta label={cta} />
        <WhatsAppFloat />
      </div>
    </BookCallProvider>
  );
}
