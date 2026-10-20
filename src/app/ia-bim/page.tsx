import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import Reveal, { SectionHead } from '@/components/home/Reveal';
import { CtaBand, PageHero, SubPageShell } from '@/components/home/SubPage';
import { OG_IMAGES } from '@/lib/seo';
import { CONTACT, MICROS, PROFILES, formatEuro, PRICE_PER_ECTS } from '@/lib/bim';

const TITLE = 'BIM con IA para el sector AEC';
const DESCRIPTION =
  'Aprende a usar la inteligencia artificial en proyectos BIM de arquitectura, ingeniería y construcción: automatización, revisión de modelos, datos y documentación, con criterio profesional.';

export const metadata: Metadata = {
  alternates: { canonical: '/ia-bim' },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES', images: OG_IMAGES },
  twitter: { card: 'summary_large_image', images: ['/og-idesie.png'], title: TITLE, description: DESCRIPTION },
};

const ia = MICROS.find((m) => m.code === '21')!;
const AI_MICROS = ['21', '18', '19', '20'].map((code) => MICROS.find((m) => m.code === code)!);
const AI_PROFILES = PROFILES.filter((p) => p.micros.includes('21'));

const STAGES = [
  {
    stage: 'Modelado y automatización',
    text: 'Scripts y flujos de Dynamo y Python generados y depurados con asistentes de IA, para repetir menos y revisar más.',
    micros: ['18', '19'],
  },
  {
    stage: 'Coordinación y revisión',
    text: 'Apoyo de la IA para clasificar incidencias y priorizar conflictos entre disciplinas; la decisión técnica sigue siendo tuya.',
    micros: ['06', '21'],
  },
  {
    stage: 'Datos del modelo',
    text: 'Extracción y análisis de la información del modelo, y cuadros de mando que convierten datos en decisiones.',
    micros: ['20', '07'],
  },
  {
    stage: 'Documentación y estándares',
    text: 'Borradores de planes de ejecución BIM y protocolos con IA, contrastados siempre con ISO 19650 y los requisitos del cliente.',
    micros: ['02', '03'],
  },
  {
    stage: 'Gestión del proyecto',
    text: 'Planificación, costes y seguimiento con herramientas de IA, sin perder el control de la información del proyecto.',
    micros: ['14', '15', '16'],
  },
];

const PRINCIPLES = [
  { title: 'La IA propone, tú decides', text: 'Un resultado generado no es un resultado validado. Aprendes a revisar, contrastar y firmar con criterio.' },
  { title: 'Sobre proyectos reales', text: 'Las herramientas se practican con la metodología Learning by Working y cierran en el simulador profesional.' },
  { title: 'Información bajo control', text: 'Confidencialidad, protección de datos y cumplimiento de ISO 19650 al usar IA con información de proyecto.' },
];

const title = (code: string) => MICROS.find((m) => m.code === code)!.title;

export default function IaBimPage() {
  return (
    <SubPageShell>
      <PageHero
        eyebrow="Novedad · IA aplicada al sector AEC"
        title={
          <>
            BIM con IA. <span className="ui-hl">Más criterio</span>, menos tarea repetida.
          </>
        }
        lead="La inteligencia artificial ya está en los flujos de trabajo de arquitectura, ingeniería y construcción. En IDESIE la integramos en el Máster BIM y en las microcredenciales, para que la uses con método y con responsabilidad profesional."
      >
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/microcredenciales"
            className="btn btn-blue"
          >
            Ver el catálogo <span className="btn-dot bg-[#fff]/20"><ArrowRight className="w-4 h-4" aria-hidden="true" /></span>
          </Link>
        </div>
      </PageHero>

      <section aria-labelledby="etapas-title" className="field-white px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <SectionHead
            eyebrow="Dónde aplicarás la IA"
            title={<span id="etapas-title">En todo el ciclo de un proyecto BIM</span>}
            lead="Cada bloque se apoya en microcredenciales del catálogo: sumas competencias concretas, no teoría genérica."
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STAGES.map((s, i) => (
              <Reveal key={s.stage} delay={(i % 3) * 0.08} className="h-full">
                <article className="h-full ui-card p-6 hover:border-[var(--signal)]/50 transition-colors">
                  <h3 className="font-kinetic font-semibold text-base leading-snug">{s.stage}</h3>
                  <p className="text-sm text-white/60 leading-relaxed mt-3">{s.text}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {s.micros.map((code) => (
                      <li key={code} className="text-xs rounded-full bg-[var(--signal)]/10 text-[var(--signal)] px-3 py-1">
                        <b className="font-kinetic mr-1">{code}</b>
                        {title(code)}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="micro-title" className="field-tint px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
          <div>
            <SectionHead
              eyebrow="Microcredencial 21"
              title={<span id="micro-title">{ia.title}</span>}
              lead={`${ia.ects} ECTS · ${formatEuro(ia.ects * PRICE_PER_ECTS)}. Puedes cursarla suelta o dentro del mapa de tu perfil, y se acumula hasta completar el Máster BIM.`}
            />
            <Reveal className="mt-8 ui-card p-6">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50">Se combina con</p>
              <ul className="mt-4 divide-y divide-white/10">
                {AI_MICROS.filter((m) => m.code !== '21').map((m) => (
                  <li key={m.code} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="font-kinetic font-bold text-xs text-[var(--signal)] w-6 shrink-0">{m.code}</span>
                    <span className="flex-1 font-medium">{m.title}</span>
                    <span className="text-white/50 whitespace-nowrap">{m.ects} ECTS</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="field-navy rounded-2xl p-7 md:p-8">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--yellow)]">Perfiles que la incluyen</p>
            <ul className="mt-4 space-y-3">
              {AI_PROFILES.map((p) => (
                <li key={p.code}>
                  <Link href={`/perfiles/${p.code.toLowerCase()}`} className="group flex items-center justify-between gap-3 hover:text-[var(--yellow)] transition-colors">
                    <span className="font-kinetic font-semibold text-base">{p.name}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-sm text-[#c9d9f0] leading-relaxed mt-6">
              Los perfiles certificables por AECOMI incluyen esta competencia en su mapa formativo.
            </p>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="principios-title" className="field-white px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <SectionHead eyebrow="Nuestro enfoque" title={<span id="principios-title">IA con método profesional</span>} />
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08} className="h-full">
                <div className="h-full ui-card p-6">
                  <h3 className="font-kinetic font-semibold text-base leading-snug">{p.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed mt-3">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Cuéntanos qué quieres automatizar"
        text="En 30 minutos te orientamos sobre las microcredenciales y el perfil que mejor encajan con tu trabajo o con tu equipo."
        pack="BIM con IA"
      />
    </SubPageShell>
  );
}
