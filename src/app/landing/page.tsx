import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, BriefcaseBusiness, MessageCircle, Plus, Sparkles, Users } from 'lucide-react';
import { BookCallButton, BookCallProvider } from '@/components/home/BookCall';
import IdesieLogo from '@/components/home/IdesieLogo';
import CookieSettingsLink from '@/components/legal/CookieSettingsLink';
import Section from '@/components/home/Section';
import Reveal from '@/components/home/Reveal';
import Tile from '@/components/home/Tile';
import LogoTile from '@/components/home/LogoTile';
import LeadForm from '@/components/landing/LeadForm';
import PickMaster from '@/components/landing/PickMaster';
import StickyCta from '@/components/landing/StickyCta';
import WhatsAppLink from '@/components/landing/WhatsAppLink';
import { CONTACT } from '@/lib/bim';
import { COMPANY_LOGOS, FACTS } from '@/lib/content';
import { MASTERS } from '@/lib/masters';

const TITLE = 'Máster BIM en Madrid y online | IDESIE Business & Tech School';
const DESCRIPTION = 'Somos la innovación en BIM: te enseñamos a adaptarte a la IA. Máster BIM con prácticas remuneradas y certificación AECOMI. Quedan pocas plazas.';

// Página de anuncios: no compite en buscadores con la home.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES' },
};

const CARDS = [
  { slug: 'mbim' as const, facts: [0, 2], tag: 'El más completo' },
  { slug: 'mbbe' as const, facts: [0, 2], tag: 'Especialidad MEP' },
  { slug: 'mbim-online' as const, facts: [0, 1], tag: 'Desde donde estés' },
];

const REASONS = [
  { icon: BriefcaseBusiness, title: 'Aprendes trabajando', text: 'No es un máster con prácticas al final: trabajo y formación empiezan el mismo día, sobre proyectos reales.' },
  { icon: Sparkles, title: 'BIM con IA', text: 'Aprendes a aplicar herramientas de inteligencia artificial para ganar tiempo en cada fase del proyecto.' },
  { icon: BadgeCheck, title: 'Certificación profesional', text: 'IDESIE es entidad formativa acreditada por AECOMI, la asociación que certifica competencias BIM conforme a ISO/IEC 17024.' },
  { icon: Users, title: 'Red de empresas', text: 'Estudios, ingenierías y constructoras colaboran con IDESIE en prácticas y contratación.' },
];

const STEPS = [
  { n: '1', title: 'Cuéntanos tu caso', text: 'Déjanos tus datos: son 30 segundos.' },
  { n: '2', title: 'Hablamos 30 minutos', text: 'Revisamos tu perfil y resolvemos tus dudas, sin presión.' },
  { n: '3', title: 'Eliges con claridad', text: 'Te decimos con franqueza qué máster encaja contigo, o si todavía no.' },
];

const FAQS = MASTERS.mbim.faqs.slice(0, 2).concat(MASTERS.mbim.faqs.slice(3, 5));

export default function LandingPage() {
  return (
    <BookCallProvider businessName={CONTACT.name}>
      <div className="home-root min-h-screen relative">
        <header className="absolute inset-x-0 top-0 z-20 field-navy !bg-transparent">
          <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
            <Link href="/" aria-label="IDESIE, inicio">
              <IdesieLogo tone="white" className="h-10" priority />
            </Link>
            <div className="flex items-center gap-3">
              <WhatsAppLink label="Escribir por WhatsApp" className="btn min-h-11 gap-2 px-4 bg-[#25D366] text-[#0a1f44] font-semibold hover:bg-[#3ae07a] transition-colors">
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                <span className="hidden sm:inline">WhatsApp</span>
              </WhatsAppLink>
              <a href="#info" className="btn btn-ghost min-h-11 text-[#fff] border-[#7db4ff]/60">Pedir información</a>
            </div>
          </div>
        </header>

        <main>
          {/* 1 · Promesa y formulario a la vista */}
          <section className="field-navy relative overflow-hidden px-4 md:px-6 pt-24 pb-14 md:pt-28 md:pb-20">
            <div className="hero-glow" aria-hidden="true" />
            <div className="relative max-w-6xl mx-auto">
              <div className="max-w-3xl">
                <h1 className="font-kinetic font-bold text-[clamp(2rem,5vw,4rem)] leading-[1.08] text-[#fff]">
                  Somos la innovación en BIM. <span className="text-[#7db4ff]">Te enseñamos a adaptarte a la IA.</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-[#c9d9f0] max-w-xl leading-relaxed">
                  El Máster BIM de IDESIE, en Madrid y online: trabajas por la mañana, te formas por la tarde y sales siendo BIM Manager, con la inteligencia artificial como herramienta de cada día.
                </p>
                <p className="mt-6 flex items-center gap-3 text-lg font-semibold text-[#fff]">
                  <span className="relative flex w-3 h-3 shrink-0" aria-hidden="true">
                    <span className="absolute inset-0 rounded-full bg-[#ff6b5b] motion-safe:animate-ping opacity-75" />
                    <span className="relative w-3 h-3 rounded-full bg-[#ff6b5b]" />
                  </span>
                  Quedan pocas plazas para la próxima convocatoria
                </p>
                <ul className="mt-8 space-y-3 text-[#fff] text-base md:text-lg">
                  {['IA aplicada a cada fase del proyecto, no solo teoría', 'Prácticas remuneradas desde el primer mes (másteres presenciales)', `Desde ${FACTS.founded} · ${FACTS.students} alumnos formados`].map((t) => (
                    <li key={t} className="flex gap-3">
                      <BadgeCheck className="w-6 h-6 shrink-0 text-[#7db4ff] mt-0.5" aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <a href="#info" className="btn btn-blue min-h-14 px-7 text-base">
                    Quiero información <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </a>
                  <WhatsAppLink className="btn min-h-14 gap-2 px-6 text-base bg-[#25D366] text-[#0a1f44] font-semibold hover:bg-[#3ae07a] transition-colors">
                    <MessageCircle className="w-5 h-5" aria-hidden="true" /> Escríbenos por WhatsApp
                  </WhatsAppLink>
                </div>
              </div>
            </div>
          </section>

          {/* 2 · Prueba social */}
          <Section field="tint" labelledBy="proof-title" className="!py-14 md:!py-20">
            <h2 id="proof-title" className="font-kinetic font-bold text-2xl md:text-3xl text-center max-w-3xl mx-auto leading-tight">
              Empresas del sector colaboran con IDESIE
            </h2>
            <ul className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" aria-label="Empresas que colaboran con IDESIE">
              {COMPANY_LOGOS.slice(0, 10).map((l) => (
                <li key={l.name}>
                  <LogoTile logo={l} />
                </li>
              ))}
            </ul>
          </Section>

          {/* 3 · Elegir máster */}
          <Section field="white" id="masters" labelledBy="masters-title">
            <Reveal className="max-w-3xl">
              <h2 id="masters-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12]">
                Tres caminos, <span className="ui-hl">un mismo objetivo</span>
              </h2>
              <p className="text-lg text-white/60 mt-5 leading-relaxed">Elige el que encaja con tu situación. Si dudas, te ayudamos en la llamada.</p>
            </Reveal>
            <ul className="mt-12 grid lg:grid-cols-3 gap-4">
              {CARDS.map((c, i) => {
                const m = MASTERS[c.slug];
                return (
                  <Tile as="li" key={c.slug} delay={i * 0.1} className="bg-[var(--card)] p-6 md:p-7 flex flex-col">
                    <span className="self-start rounded-full bg-[#e9f0fc] text-[#0052cc] text-xs font-bold px-3 py-1">{c.tag}</span>
                    <h3 className="font-kinetic font-bold text-2xl leading-snug mt-4">{m.name}</h3>
                    <p className="text-sm font-semibold text-[#0063e6] mt-1">{m.mode}</p>
                    <p className="text-white/60 leading-relaxed mt-4">{m.lead}</p>
                    <dl className="mt-5 space-y-3 flex-1">
                      {c.facts.map((fi) => (
                        <div key={fi}>
                          <dt className="font-kinetic font-bold text-xl">{m.facts[fi].value}</dt>
                          <dd className="text-sm text-white/60 leading-snug">{m.facts[fi].label}</dd>
                        </div>
                      ))}
                    </dl>
                    <PickMaster slug={c.slug} className="btn btn-blue mt-6 w-full justify-center min-h-12">
                      Quiero este máster <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </PickMaster>
                    <Link href={`/masters/${c.slug}`} className="mt-3 text-center text-sm font-semibold text-[#0063e6] hover:underline min-h-11 inline-flex items-center justify-center">
                      Ver el programa completo
                    </Link>
                  </Tile>
                );
              })}
            </ul>
          </Section>

          {/* 4 · Por qué IDESIE */}
          <section className="field-blue px-4 md:px-6 py-20 md:py-28" aria-labelledby="why-title">
            <div className="max-w-6xl mx-auto">
              <h2 id="why-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12] max-w-3xl">
                Por qué formarte en IDESIE
              </h2>
              <ul className="mt-12 grid sm:grid-cols-2 gap-4">
                {REASONS.map((r, i) => (
                  <Tile as="li" key={r.title} delay={i * 0.08} className={`p-7 ${i % 3 === 0 ? 'bg-[#0a1f44] text-[#fff]' : 'bg-[#fff] text-[#0a1f44]'}`}>
                    <r.icon className={`w-8 h-8 ${i % 3 === 0 ? 'text-[#7db4ff]' : 'text-[#0063e6]'}`} aria-hidden="true" />
                    <h3 className="font-kinetic font-bold text-xl mt-4">{r.title}</h3>
                    <p className="mt-2 leading-relaxed opacity-85">{r.text}</p>
                  </Tile>
                ))}
              </ul>
              <p className="mt-6 text-sm text-[#fff]">Ejercer con certificación profesional depende de superar el proceso de evaluación de AECOMI; la acreditación del centro no lo garantiza.</p>
            </div>
          </section>

          {/* 5 · Salidas */}
          <Section field="white" labelledBy="roles-title">
            <h2 id="roles-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12] max-w-3xl">
              Salidas profesionales del <span className="ui-hl">Máster BIM</span>
            </h2>
            <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {MASTERS.mbim.outcomes.roles.map((r, i) => (
                <Tile as="li" key={r.role} delay={i * 0.08} className={`p-6 flex flex-col justify-between gap-6 min-h-44 ${i % 2 ? 'bg-[#e9f0fc] text-[#0a1f44]' : 'bg-[#0a1f44] text-[#fff]'}`}>
                  <div>
                    <h3 className="font-kinetic font-bold text-xl leading-snug">{r.role}</h3>
                    <p className="mt-1 opacity-80">{r.focus}</p>
                  </div>
                  <p className={`font-kinetic font-bold text-lg ${i % 2 ? 'text-[#0063e6]' : 'text-[#7db4ff]'}`}>
                    {r.salary}
                    <span className="block text-sm font-sans font-normal opacity-80">bruto anual</span>
                  </p>
                </Tile>
              ))}
            </ul>
            <p className="text-white/60 mt-5 max-w-2xl text-sm">{MASTERS.mbim.outcomes.note}</p>
          </Section>

          {/* 6 · Cómo funciona */}
          <Section field="tint" labelledBy="steps-title">
            <h2 id="steps-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12] max-w-3xl">Así de fácil es empezar</h2>
            <ol className="mt-12 grid md:grid-cols-3 gap-4">
              {STEPS.map((s, i) => (
                <Tile as="li" key={s.n} delay={i * 0.1} className="bg-[#fff] text-[#0a1f44] p-7">
                  <span className="font-kinetic font-bold text-5xl text-[#0063e6] leading-none">{s.n}</span>
                  <h3 className="font-kinetic font-bold text-xl mt-5">{s.title}</h3>
                  <p className="mt-2 text-[#0a1f44]/75 leading-relaxed">{s.text}</p>
                </Tile>
              ))}
            </ol>
          </Section>

          {/* 7 · Objeciones */}
          <Section field="white" labelledBy="faq-title">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-start">
              <h2 id="faq-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12]">Lo que suelen preguntarnos</h2>
              <div className="space-y-2.5">
                {FAQS.map((f) => (
                  <details key={f.q} name="faq" className="group rounded-2xl bg-[var(--card)] [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center gap-4 cursor-pointer px-5 md:px-6 py-4 md:py-5 min-h-16 font-semibold text-base md:text-lg leading-snug">
                      <span className="flex-1">{f.q}</span>
                      <span className="w-9 h-9 shrink-0 rounded-full bg-[#0a1f44] text-[#fff] grid place-items-center transition-transform duration-300 group-open:rotate-45">
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </summary>
                    <p className="px-5 md:px-6 pb-5 text-white/60 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Section>

          {/* 8 · Cierre */}
          <section className="field-navy relative overflow-hidden px-4 md:px-6 py-20 md:py-28" aria-labelledby="final-title">
            <div className="hero-glow-b" aria-hidden="true" />
            <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1fr_0.9fr] gap-10 lg:gap-14 items-center">
              <div>
                <h2 id="final-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12] text-[#fff]">
                  Quedan pocas plazas: ¿hablamos y te decimos si encaja contigo?
                </h2>
                <p className="mt-5 text-lg text-[#c9d9f0] max-w-lg leading-relaxed">
                  30 minutos, sin compromiso. Si prefieres elegir tú el día y la hora, reserva directamente.
                </p>
                <BookCallButton pack="Máster BIM · landing" className="btn btn-ghost mt-8 min-h-12 text-[#fff] border-[#7db4ff]/60 w-fit">
                  Reservar mi llamada <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </BookCallButton>
                <WhatsAppLink className="btn mt-4 min-h-12 gap-2 px-5 w-fit bg-[#25D366] text-[#0a1f44] font-semibold hover:bg-[#3ae07a] transition-colors">
                  <MessageCircle className="w-5 h-5" aria-hidden="true" /> Escríbenos por WhatsApp
                </WhatsAppLink>
                <p className="mt-3 text-sm text-[#c9d9f0]">WhatsApp: {CONTACT.whatsapp}</p>
              </div>
              <div id="info" className="scroll-mt-24">
                <LeadForm />
              </div>
            </div>
          </section>
        </main>

        <footer className="field-navy border-t border-[#7db4ff]/20 px-4 md:px-6 py-8 pb-28 md:pb-8">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-[#c9d9f0]">
            <p>© {new Date().getFullYear()} {CONTACT.name} {CONTACT.tagline} · {CONTACT.address}</p>
            <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-1">
              <Link href="/privacidad" className="hover:text-[#fff] min-h-11 inline-flex items-center">Privacidad</Link>
              <Link href="/aviso-legal" className="hover:text-[#fff] min-h-11 inline-flex items-center">Aviso legal</Link>
              <Link href="/cookies" className="hover:text-[#fff] min-h-11 inline-flex items-center">Cookies</Link>
              <CookieSettingsLink />
            </nav>
          </div>
        </footer>
        <StickyCta />
      </div>
    </BookCallProvider>
  );
}
