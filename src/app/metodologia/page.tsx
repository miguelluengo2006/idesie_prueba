import type { Metadata } from 'next';
import Reveal, { SectionHead } from '@/components/home/Reveal';
import { CtaBand, PageHero, SubPageShell } from '@/components/home/SubPage';
import { CONTACT, SIMULATOR_ECTS } from '@/lib/bim';

const TITLE = 'Metodología Learning by Working';
const DESCRIPTION =
  'Aprender trabajando: máster blended 50/50, proyectos reales de empresas del sector AEC, tutores profesionales en activo y un simulador profesional como proyecto fin de máster.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

const STATS = [
  { value: '100%', label: 'inserción laboral' },
  { value: '~50', label: 'empresas colaboradoras' },
  { value: '1.000+', label: 'alumnos formados' },
  { value: '50/50', label: 'presencial y online en el máster blended' },
];

const CYCLE = [
  {
    step: '01',
    title: 'Aplicar desde el primer día',
    text: 'Los módulos se combinan con proyectos reales de empresas líderes del sector BIM. Aplicas de inmediato lo aprendido y generas entregables profesionales, sin esperar a terminar.',
  },
  {
    step: '02',
    title: 'Tutelar con profesionales en activo',
    text: 'No son ejercicios académicos: son encargos reales, y cada alumno cuenta con un tutor profesional que le guía mientras el proyecto avanza.',
  },
  {
    step: '03',
    title: 'Consolidar la integración profesional',
    text: 'Las prácticas en empresas del sector AEC consolidan las competencias en un entorno real. Más del 80% de los alumnos continúa en la empresa de sus prácticas finales.',
  },
];

const BLENDED = [
  { value: '50%', title: 'Presencial', text: 'Casos reales, coordinación entre disciplinas y trabajo en equipo sobre modelos.' },
  { value: '50%', title: 'Online', text: 'Manejo de software y contenidos que no requieren presencialidad, a ritmo propio. Incluye el uso de IA aplicada al flujo BIM.' },
];

const BENEFITS = [
  'Experiencia en empresa desde el primer día',
  'Portfolio profesional al terminar',
  'Red de contactos en el sector',
  'Evidencias registradas de tu desempeño',
  'Mapa claro hacia la certificación AECOMI',
  'Competencias digitales y de IA aplicadas',
];

const PLACEMENT = [
  { pct: 40, label: 'Empresas de ingeniería' },
  { pct: 30, label: 'Consultoras' },
  { pct: 20, label: 'Consultoras BIM' },
  { pct: 10, label: 'Otros sectores' },
];

export default function MetodologiaPage() {
  return (
    <SubPageShell>
      <PageHero
        eyebrow="Learning by Working"
        title="Aprender trabajando, no antes de trabajar"
        lead="Un modelo que combina estudios y trabajo: la formación técnica se enriquece con la experiencia real de profesionales en activo y con las últimas tecnologías, IA incluida."
      />

      <section aria-label="Resultados" className="px-4 md:px-6 py-10 md:py-12">
        <dl className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <p className="font-kinetic font-black text-3xl md:text-4xl">{s.value}</p>
                <p className="text-sm text-white/60 mt-1.5 max-w-[16rem]">{s.label}</p>
              </dd>
            </Reveal>
          ))}
        </dl>
      </section>

      <section aria-labelledby="ciclo-title" className="px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <SectionHead
            eyebrow="El ciclo"
            title={<span id="ciclo-title">Un ciclo, no una etapa</span>}
            lead="No es estudiar para trabajar después: es trabajar mientras estudias, en un proceso que se repite con cada proyecto real."
          />
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {CYCLE.map((c, i) => (
              <Reveal key={c.step} delay={i * 0.1} className="h-full">
                <article className="h-full rounded-2xl border border-white/10 bg-black/40 p-6 md:p-7">
                  <span className="font-kinetic font-black text-3xl text-[var(--signal)]">{c.step}</span>
                  <h3 className="font-kinetic font-bold text-base uppercase leading-snug mt-3">{c.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed mt-3">{c.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="blended-title" className="px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <SectionHead eyebrow="Máster blended" title={<span id="blended-title">Learning by Working, ahora en 50/50</span>} />
          <div className="mt-12 grid md:grid-cols-2 gap-5">
            {BLENDED.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.1} className="rounded-3xl bg-[var(--ink-solid)] text-[#f4f8ff] p-7 md:p-9">
                <p className="font-kinetic font-black text-5xl text-[var(--yellow)]">{b.value}</p>
                <h3 className="font-kinetic font-black uppercase text-xl mt-3">{b.title}</h3>
                <p className="text-[#c9d9f0] leading-relaxed mt-3">{b.text}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-6 md:p-7">
            <h3 className="font-kinetic font-bold text-sm uppercase">Proyecto fin de máster · Simulador profesional</h3>
            <p className="text-sm text-white/60 leading-relaxed mt-3 max-w-3xl">
              {SIMULATOR_ECTS} ECTS: un encargo completo con un cliente real, desde los requisitos y el plan de ejecución BIM hasta la
              entrega y defensa, con reuniones, cambios, incidencias y auditoría de modelos. Los alumnos rotan los roles IDM, BDM y BCM.
            </p>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="beneficios-title" className="px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          <div>
            <SectionHead eyebrow="Resultado" title={<span id="beneficios-title">Beneficios tangibles</span>} />
            <ul className="mt-8 grid sm:grid-cols-2 gap-3">
              {BENEFITS.map((b) => (
                <li key={b} className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm font-medium leading-snug">
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHead eyebrow="Promoción 2024" title="Dónde trabajan nuestros alumnos" />
            <ul className="mt-8 space-y-4">
              {PLACEMENT.map((p) => (
                <li key={p.label}>
                  <div className="flex justify-between text-sm font-medium">
                    <span>{p.label}</span>
                    <span className="text-[var(--signal)] font-kinetic font-bold">{p.pct}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[var(--signal)]/10" role="presentation">
                    <div className="h-2 rounded-full bg-[var(--signal)]" style={{ width: `${p.pct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand
        title="Empieza a construir tu perfil desde el primer día"
        text="Cuéntanos tu situación y te orientamos sobre el máster blended, el online o las microcredenciales."
        pack="Metodología Learning by Working"
      />
    </SubPageShell>
  );
}
