import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import IdesieLogo from '@/components/home/IdesieLogo';
import CookieSettingsLink from '@/components/legal/CookieSettingsLink';
import SlabTower, { SlabBullet } from '@/components/landing/SlabTower';
import FloorPicker from '@/components/landing/FloorPicker';
import DayFade from '@/components/landing/DayFade';
import EnrollForm from '@/components/landing/EnrollForm';
import ProgramButton from '@/components/landing/ProgramButton';
import FaqCards from '@/components/landing/FaqCards';
import StickyCta from '@/components/landing/StickyCta';
import LandingTracker from '@/components/landing/LandingTracker';
import Rise from '@/components/landing/Rise';
import { CONTACT } from '@/lib/bim';
import { PHOTOS } from '@/lib/content';
import { OG_IMAGES } from '@/lib/seo';
import { MASTERS } from '@/lib/masters';
import './landing.css';

const TITLE = 'Máster BIM con IA, presencial u online: sal con experiencia real';
const DESCRIPTION =
  'Máster BIM de IDESIE en Madrid o desde casa. En el presencial trabajas en una empresa del sector con trabajo remunerado desde el primer mes. Inscríbete en la próxima convocatoria.';

// Página de anuncios: no compite en buscadores con la home.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES', images: OG_IMAGES },
};

const M = MASTERS.mbim;
const FLOORS = M.modules.map((m) => ({ title: m.title, tagline: m.tagline, ai: m.ai, points: m.points }));
const LOGOS = (M.extras?.legacy?.logos ?? []).filter((l) => ['Ferrovial', 'IDOM', 'Accenture', 'Hill International', 'Estudio Lamela', 'Uponor', 'Lantania', 'Daikin', 'Valladares Ingeniería', 'TROX'].includes(l.name));
const FACULTY = (M.extras?.faculty?.people ?? []).filter((p) => p.photo);

const STAGES = [
  {
    name: 'Entras en el equipo',
    text: 'No llegas a un aula con un caso inventado: te integras en el equipo de un proyecto real, con sus planos, sus plazos y sus decisiones.',
    photo: PHOTOS.clase,
    tile: 'bg-[var(--ground-2)]',
    h: 'lg:h-[34vh]',
    span: 'lg:col-span-3',
  },
  {
    name: 'Lo construyes con IA',
    text: 'Modelas, coordinas y planificas con IA lo que después se levanta en obra. Cada entrega es trabajo de verdad, no un ejercicio.',
    photo: PHOTOS.tableta,
    tile: 'bg-[var(--blue-deep)]',
    h: 'lg:h-[46vh]',
    span: 'lg:col-span-4',
  },
  {
    name: 'Sales sabiendo dirigirlo',
    text: 'Terminas con un portfolio que puedes enseñar en cualquier entrevista y con el criterio de quien ya ha dirigido un proceso BIM.',
    photo: PHOTOS.reunion,
    tile: 'bg-[var(--blue)]',
    h: 'lg:h-[60vh]',
    span: 'lg:col-span-5',
  },
];

const FAQS = [
  {
    topic: 'Modalidades',
    q: '¿Qué cambia entre el presencial y el online?',
    a: 'Los dos comparten temario e IA aplicada. El presencial es en Madrid: por la mañana trabajas en una empresa del sector, con trabajo remunerado, y por la tarde vienes a clase; incluye la certificación Cualificam. El online es totalmente a distancia, a tu ritmo y con tutoría personal, sin trabajo remunerado durante el programa y con acceso a la bolsa de empleo al terminar.',
  },
  {
    topic: 'Trabajo',
    q: '¿El trabajo remunerado del presencial está garantizado?',
    a: 'Sí. IDESIE tiene acuerdos con estudios de arquitectura, ingenierías, constructoras y empresas de gestión de proyectos, y te asigna la empresa desde el primer mes teniendo en cuenta tu perfil y tus preferencias. No tienes que buscarla tú. En el online no hay trabajo remunerado durante el programa.',
  },
  {
    topic: 'IA',
    q: '¿Necesito saber de IA para entrar?',
    a: 'No. El máster arranca con un módulo de fundamentos de IA para arquitectos e ingenieros y, a partir de ahí, la aplicas en cada módulo sobre el proyecto: modelado en Revit, protocolos, planificación y dirección de equipos.',
  },
  {
    topic: 'Título',
    q: '¿Qué título obtengo?',
    a: 'En el presencial, el título propio de IDESIE y la certificación de Máster Profesional de Cualificam (Fundación para el Conocimiento madri+d), alineado con ISO 19650 y respaldado por AEEN, UDIT y AECOMI. En el online, el título de Máster BIM de IDESIE.',
  },
  {
    topic: 'Requisitos',
    q: '¿Qué necesito para entrar?',
    a: 'Titulación universitaria en arquitectura, ingeniería o equivalente. Para el presencial, poder vivir en Madrid durante el programa; si vienes de fuera de la UE, te ayudamos con el visado de estudiante. Para el online, unas horas a la semana compatibles con tu trabajo.',
  },
  {
    topic: 'Admisión',
    q: '¿Qué pasa después de inscribirme?',
    a: 'Admisiones revisa tu inscripción y te contacta por WhatsApp o por teléfono. Habláis de tu perfil, resolvemos tus dudas y, si encajas, te explicamos cómo reservar tu plaza en la próxima convocatoria.',
  },
];

const NAV = [
  { href: '#experiencia', label: 'Experiencia' },
  { href: '#temario', label: 'Temario' },
  { href: '#modalidades', label: 'Modalidades' },
  { href: '#preguntas', label: 'Preguntas' },
];

export default function LandingPage() {
  return (
    <div className="lx min-h-svh">
      <LandingTracker name="Máster BIM · landing presencial + online" />
      <Rise />

      <header className="relative z-20">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 h-20 flex items-center justify-between gap-6">
          <Link href="/" aria-label="IDESIE, inicio" className="shrink-0">
            <IdesieLogo tone="white" className="h-9 md:h-10" priority />
          </Link>
          <nav aria-label="Secciones" className="hidden lg:flex items-center gap-8 text-[17px] font-medium text-[var(--muted)]">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-white transition-colors duration-200 min-h-11 inline-flex items-center">
                {n.label}
              </a>
            ))}
          </nav>
          <ProgramButton place="cabecera" className="btn-slab min-h-12 px-5 text-[15px]">
            Inscribirme
          </ProgramButton>
        </div>
      </header>

      <main>
        {/* 1 · Qué es y qué te llevas */}
        <section aria-labelledby="hero-title" className="relative overflow-hidden lg:min-h-[calc(100svh-5rem)] flex flex-col">
          {/* El edificio: entero a la derecha en escritorio; en móvil, debajo del texto y cortado por abajo */}
          <div className="pointer-events-none hidden lg:block absolute right-[1vw] top-[4%] bottom-[-12%] w-[42vw] max-w-[700px]" aria-hidden="true">
            <SlabTower floors={7} assemble className="w-full h-full" />
          </div>

          <div className="relative mx-auto w-full max-w-[1440px] px-4 md:px-8 flex-1 flex flex-col justify-center pt-10 pb-6 md:py-16 lg:py-20">
            <div className="lg:max-w-[64%]">
              <h1 id="hero-title" className="display text-[8.2vw] md:text-[7.6vw] lg:text-[5.6vw] 2xl:text-[5.25rem] rise">
                Máster BIM con experiencia
              </h1>
              <p className="mt-8 text-[17px] md:text-[21px] leading-[1.5] text-[var(--ink)] max-w-[40ch] rise" style={{ ['--d' as string]: '90ms' }}>
                Presencial en Madrid, trabajando en una empresa del sector con trabajo remunerado desde el primer mes, u online desde donde estés. En los dos, aprendes a modelar y dirigir proyectos BIM con IA.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4 rise" style={{ ['--d' as string]: '180ms' }}>
                <ProgramButton place="hero" className="btn-slab min-h-14 px-7 text-[17px]">
                  Quiero inscribirme
                </ProgramButton>
                <a href="#modalidades" className="link text-[17px] font-semibold text-white min-h-11 inline-flex items-center">
                  Comparar presencial y online
                </a>
              </div>
            </div>
          </div>

          <div className="lg:hidden relative h-[46svh] md:h-[52svh] overflow-hidden" aria-hidden="true">
            <SlabTower floors={10} assemble className="absolute left-1/2 top-4 -translate-x-1/2 w-[88vw] md:w-[60vw] h-auto" />
          </div>
        </section>

        {/* 2 · Cómo se gana la experiencia */}
        <section id="experiencia" aria-labelledby="exp-title" className="mx-auto max-w-[1440px] px-4 md:px-8 pt-28 md:pt-44 scroll-mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[10px] lg:items-end">
            <h2 id="exp-title" className="display text-[clamp(1.9rem,3.6vw,3.4rem)] lg:col-span-7 lg:row-start-1 lg:self-start mb-8 lg:mb-0 rise">
              La experiencia no se estudia. Se gana.
            </h2>
            <p className="lg:col-span-5 lg:row-start-1 lg:self-start text-[17px] md:text-[21px] leading-relaxed text-[var(--ink)] mb-8 lg:mb-0 rise">
              En el presencial la ganas dentro de una empresa y de un proyecto real. En el online, con un proyecto completo que defiendes ante tribunal y que se queda en tu portfolio.
            </p>
            {STAGES.map((s, i) => (
              <div key={s.name} className={`${s.span} lg:row-start-2 rise`} style={{ ['--d' as string]: `${i * 90}ms` }}>
                <div className={`${s.tile} ${s.h} relative overflow-hidden cut-lg aspect-[4/3] lg:aspect-auto`}>
                  <Image
                    src={s.photo.src}
                    alt={s.photo.alt}
                    width={s.photo.width}
                    height={s.photo.height}
                    sizes="(min-width:1024px) 42vw, 100vw"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-90"
                  />
                </div>
                <h3 className="mt-5 text-[21px] font-semibold text-white">{s.name}</h3>
                <p className="mt-2 text-[17px] leading-relaxed text-[var(--muted)] max-w-[40ch]">{s.text}</p>
              </div>
            ))}
                      </div>
          <p className="mt-14 text-[17px] md:text-[21px] leading-relaxed max-w-[60ch] text-[var(--ink)] rise">
            Este curso, la promoción del presencial trabaja sobre el <strong className="text-white">Hospital La Laguna</strong>: diseño y construcción, con las obras empezando en otoño. Lo que modelas en clase es lo que se construye.
          </p>
        </section>

        {/* 3 · La IA, en una frase con sus pruebas dentro */}
        <section aria-labelledby="ia-title" className="mx-auto max-w-[1440px] px-4 md:px-8 pt-32 md:pt-48">
          <h2 id="ia-title" className="sr-only">La IA en el máster</h2>
          <p className="text-[21px] md:text-[clamp(1.5rem,2.5vw,2.25rem)] leading-[1.32] font-medium tracking-[-0.015em] max-w-[56ch] rise">
            Aprendes de quien dirige el BIM cada día{' '}
            <span className="inline-flex align-[-0.22em] gap-1">
              {FACULTY.slice(0, 3).map((p) => (
                <Image key={p.name} src={p.photo!} alt={p.name} width={96} height={96} className="w-[1.2em] h-[1.2em] object-cover rounded-full" />
              ))}
            </span>
            , modelas en Revit con IA a partir de los planos{' '}
            <Image src={PHOTOS.tableta.src} alt="" width={240} height={130} className="inline-block align-[-0.22em] w-[2.4em] h-[1.2em] object-cover cut" />{' '}
            y practicas cómo dirigir un equipo que ya trabaja así{' '}
            <Image src={PHOTOS.reunion.src} alt="" width={240} height={130} className="inline-block align-[-0.22em] w-[2.4em] h-[1.2em] object-cover cut" />.
          </p>
          <div className="mt-14 grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 rise">
              <p className="text-[17px] leading-relaxed text-[var(--muted)] max-w-[46ch]">
                En la mayoría de estudios la IA solo revisa modelos. Aquí también los hace, y aprendes a decidir qué se deja a la máquina y qué decides tú.
              </p>
              <ProgramButton place="ia" className="btn-slab mt-7">
                Quiero inscribirme
              </ProgramButton>
            </div>
          </div>
        </section>

        {/* 4 · El temario como edificio (lo que el visitante puede tocar) */}
        <section id="temario" aria-labelledby="temario-title" className="mx-auto max-w-[1440px] px-4 md:px-8 pt-32 md:pt-48 scroll-mt-6">
          <FloorPicker floors={FLOORS} />
        </section>

        {/* 5 · Las dos modalidades, cada una en su campo de color */}
        <section id="modalidades" aria-labelledby="mod-title" className="pt-32 md:pt-48 scroll-mt-6">
          <div className="mx-auto max-w-[1440px] px-4 md:px-8">
            <h2 id="mod-title" className="display text-[clamp(1.9rem,3.6vw,3.4rem)] max-w-[20ch] rise">
              Elige cómo lo vives
            </h2>
            <p className="mt-5 text-[17px] md:text-[21px] leading-relaxed text-[var(--muted)] max-w-[52ch] rise" style={{ ['--d' as string]: '90ms' }}>
              El mismo temario y la misma IA. Cambia dónde estás y, en el presencial, que además trabajas y cobras desde el primer mes.
            </p>
          </div>

          <div className="mt-14 grid lg:grid-cols-12">
            <article aria-labelledby="presencial-title" className="lg:col-span-7 bg-[var(--blue)] text-white px-4 md:px-10 lg:pl-[max(2rem,calc((100vw-1440px)/2+2rem))] py-14 md:py-16 flex flex-col">
              <h3 id="presencial-title" className="display text-[clamp(2.6rem,5.6vw,5.25rem)]">Presencial</h3>
              <p className="mt-4 text-[21px] leading-snug max-w-[30ch] font-medium">Para quien quiere empezar a trabajar en el sector mientras se forma.</p>
              <DayFade
                className="mt-10"
                shots={[
                  { ...PHOTOS.reunion, caption: 'Mañana · en la empresa' },
                  { ...PHOTOS.aula, caption: 'Tarde · en clase' },
                ]}
              />
              <ul className="mt-8 space-y-3 text-[17px] leading-relaxed">
                {[
                  'Trabajo remunerado desde el primer mes, en una empresa del sector que te asigna IDESIE.',
                  'Por la tarde, clase en Madrid con profesionales en activo, sobre el mismo proyecto real.',
                  'Experiencia que cuenta en tu currículum desde el principio, no al final.',
                  'Título propio IDESIE y certificación Cualificam.',
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <SlabBullet className="w-4 h-4 mt-1.5 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <ProgramButton program="presencial" place="modalidad-presencial" className="btn-slab on-blue min-h-14">
                  Inscribirme al presencial
                </ProgramButton>
              </div>
            </article>

            <article aria-labelledby="online-title" className="lg:col-span-5 bg-[var(--paper)] text-[var(--paper-ink)] px-4 md:px-10 lg:pr-[max(2rem,calc((100vw-1440px)/2+2rem))] py-14 md:py-16 flex flex-col">
              <h3 id="online-title" className="display text-[clamp(2.6rem,5.6vw,5.25rem)]">Online</h3>
              <p className="mt-4 text-[21px] leading-snug max-w-[26ch] font-medium">Para quien necesita formarse desde donde está, sin dejar su trabajo.</p>
              <div className="mt-10 relative aspect-[16/10] overflow-hidden cut-lg bg-[var(--paper-ink)]">
                <Image src={PHOTOS.tableta.src} alt={PHOTOS.tableta.alt} width={PHOTOS.tableta.width} height={PHOTOS.tableta.height} sizes="(min-width:1024px) 38vw, 100vw" className="drift absolute inset-0 w-full h-full object-cover" />
              </div>
              <p className="mt-3 text-[15px] font-semibold text-[var(--paper-muted)]">A tu ritmo, con clases en directo y grabadas</p>
              <ul className="mt-8 space-y-3 text-[17px] leading-relaxed">
                {[
                  'El temario del máster, pensado para avanzar en remoto.',
                  'Tutoría personal y proyecto final defendido ante tribunal.',
                  'Bolsa de empleo de IDESIE al terminar.',
                  'Título de Máster BIM de IDESIE. No incluye trabajo remunerado.',
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <SlabBullet className="w-4 h-4 mt-1.5 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 lg:mt-auto lg:pt-10">
                <ProgramButton program="online" place="modalidad-online" className="btn-slab on-paper min-h-14">
                  Inscribirme al online
                </ProgramButton>
              </div>
            </article>
          </div>
        </section>

        {/* 6 · Quién contrata */}
        <section aria-labelledby="empresas-title" className="mx-auto max-w-[1440px] px-4 md:px-8 pt-32 md:pt-48">
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <li className="col-span-2 bg-[var(--blue)] p-6 md:p-8 min-h-[8rem] lg:min-h-0 flex flex-col justify-between cut-lg rise">
              <h2 id="empresas-title" className="display text-[clamp(1.75rem,3.6vw,3.4rem)]">
                Quién contrata a los alumnos
              </h2>
              <p className="mt-4 text-[17px] text-white max-w-[44ch]">Estudios, ingenierías y constructoras que contratan a alumnos de IDESIE y recomiendan el máster a quien quiere entrar en el sector.</p>
            </li>
            {LOGOS.map((l, i) => (
              <li key={l.name} className="bg-[var(--paper)] aspect-[3/2] grid place-items-center p-6 cut rise" style={{ ['--d' as string]: `${(i % 4) * 60}ms` }}>
                <Image src={l.src} alt={l.name} width={l.width} height={l.height} className="max-h-11 md:max-h-[4.5rem] w-auto max-w-[78%] object-contain grayscale contrast-125 mix-blend-multiply" />
              </li>
            ))}
          </ul>
        </section>

        {/* 7 · Inscripción: un cupón para recortar */}
        <section id="inscripcion" aria-labelledby="ins-title" className="mx-auto max-w-[1440px] px-4 md:px-8 pt-32 md:pt-48 scroll-mt-4">
          <div className="coupon grid lg:grid-cols-[46%_54%] lg:min-h-[36rem]">
            <span className="perforation hidden lg:block" aria-hidden="true" />
            <div className="p-7 md:p-12 flex flex-col justify-between gap-8">
              <h2 id="ins-title" className="display text-[clamp(1.9rem,3.6vw,3.4rem)]">
                Reserva tu plaza
              </h2>
              <div>
                <p className="text-[17px] leading-relaxed text-white max-w-[36ch]">Elige modalidad y déjanos tus datos. Así sigue:</p>
                <ul className="mt-5 space-y-3 text-[17px] leading-snug text-white">
                  {['Admisiones te contacta por WhatsApp o por teléfono.', 'Hablamos de tu perfil y resolvemos tus dudas, sin compromiso.', 'Si encajas, reservas tu plaza en la próxima convocatoria.'].map((t) => (
                    <li key={t} className="flex gap-3">
                      <SlabBullet className="w-4 h-4 mt-1 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <span className="perforation-row lg:hidden" aria-hidden="true" />
            <div className="p-7 md:p-12 lg:pl-14">
              <EnrollForm />
            </div>
          </div>
        </section>

        {/* 8 · Dudas, archivadas como fichas */}
        <section id="preguntas" aria-labelledby="faq-title" className="mx-auto max-w-[1440px] px-4 md:px-8 pt-32 md:pt-48 scroll-mt-6">
          <div className="lg:mx-[16.666%] [--tab-step:44px] [--tab-width:128px] md:[--tab-step:96px] md:[--tab-width:180px] lg:[--tab-step:140px] lg:[--tab-width:200px]">
            <h2 id="faq-title" className="display text-[clamp(1.9rem,3.6vw,3.4rem)] mb-12 rise">
              Lo que nos preguntan
            </h2>
            <FaqCards items={FAQS} />
          </div>
        </section>
      </main>

      {/* 9 · Cierre: la marca construida con bloques, como las losas */}
      <footer className="mt-32 md:mt-48 bg-[var(--ground-2)] pb-28 md:pb-10">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 pt-16 md:pt-20">
          <p className="sr-only">IDESIE</p>
          <div className="flex items-end gap-1 h-[22svh] md:h-[32svh]" aria-hidden="true">
            {[
              ['I', 'h-[78%]', 'bg-[var(--blue-lo)]'],
              ['D', 'h-full', 'bg-[var(--blue)]'],
              ['E', 'h-[64%]', 'bg-[var(--blue-mid)]'],
              ['S', 'h-[88%]', 'bg-[var(--blue-hi)]'],
              ['I', 'h-[70%]', 'bg-[var(--blue-lo)]'],
              ['E', 'h-[94%]', 'bg-[var(--blue)]'],
            ].map(([ch, h, bg], i) => (
              <span key={i} className={`mark-block ${h} ${bg} flex-1 flex items-end justify-center pb-[2%] overflow-hidden`}>
                <span className="display text-[clamp(3rem,12vw,13rem)] leading-[0.8] text-[var(--ground-2)]">{ch}</span>
              </span>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-10 text-[15px]">
            <nav aria-label="Esta página" className="lg:col-span-3">
              <p className="font-semibold text-white">El máster</p>
              <ul className="mt-3 space-y-1">
                {NAV.map((n) => (
                  <li key={n.href}>
                    <a href={n.href} className="text-[var(--muted)] hover:text-white min-h-11 inline-flex items-center">
                      {n.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Legal" className="lg:col-span-3">
              <p className="font-semibold text-white">Legal</p>
              <ul className="mt-3 space-y-1 text-[var(--muted)]">
                <li><Link href="/terminos" className="hover:text-white min-h-11 inline-flex items-center">Términos</Link></li>
                <li><Link href="/privacidad" className="hover:text-white min-h-11 inline-flex items-center">Privacidad</Link></li>
                <li><Link href="/aviso-legal" className="hover:text-white min-h-11 inline-flex items-center">Aviso legal</Link></li>
                <li><Link href="/cookies" className="hover:text-white min-h-11 inline-flex items-center">Cookies</Link></li>
                <li className="min-h-11 inline-flex items-center"><CookieSettingsLink /></li>
              </ul>
            </nav>
            <div className="col-span-2 lg:col-span-4 lg:col-start-9 text-[var(--muted)] space-y-2">
              <p className="font-semibold text-white">{CONTACT.name} {CONTACT.tagline}</p>
              <p>{CONTACT.address}</p>
              <p>
                <a href={CONTACT.phoneHref} className="hover:text-white">{CONTACT.phone}</a> ·{' '}
                <a href={`mailto:${CONTACT.email}`} className="hover:text-white">{CONTACT.email}</a>
              </p>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[15px] text-[var(--muted)]">© {new Date().getFullYear()} {CONTACT.name}</p>
            <ProgramButton place="pie" className="btn-slab min-h-12 px-5 text-[15px]">
              Inscribirme
            </ProgramButton>
          </div>
        </div>
      </footer>

      <StickyCta />
    </div>
  );
}
