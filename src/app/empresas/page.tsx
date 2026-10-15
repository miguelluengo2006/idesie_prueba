import type { Metadata } from 'next';
import Reveal, { SectionHead } from '@/components/home/Reveal';
import { CtaBand, PageHero, SubPageShell } from '@/components/home/SubPage';
import { CONTACT } from '@/lib/bim';

const TITLE = 'Empresas: formación in-company y consultoría BIM con IA';
const DESCRIPTION =
  'Define los perfiles que necesitas, forma a tus equipos con itinerarios in-company, incorpora talento y contrata consultoría BIM: ISO 19650, modelado, auditoría, 4D/5D e IA aplicada.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

const PROCESS = [
  { num: '01', title: 'Diagnóstico', text: 'Analizamos vuestros proyectos, el nivel técnico del equipo y los objetivos de la organización.' },
  { num: '02', title: 'Perfiles y mapa', text: 'Definimos las competencias de cada puesto y el mapa formativo que las cubre, incluida la IA aplicada a BIM.' },
  { num: '03', title: 'Entrega', text: 'Formación en vuestras instalaciones, en nuestras aulas o en línea, según el calendario de vuestra operación.' },
  { num: '04', title: 'Medición', text: 'El programa se diseña contra objetivos concretos, así que el resultado se mide contra ellos.' },
];

const MODES = [
  { title: 'En tu empresa', text: 'Nuestro equipo se desplaza a vuestras instalaciones.' },
  { title: 'En nuestras aulas', text: 'Espacios equipados en Madrid para formación intensiva.' },
  { title: 'Online', text: 'Con los mismos recursos del programa presencial.' },
];

const CONSULTING = [
  'Implantación ISO 19650',
  'BIM Management Office',
  'Producción de modelos',
  'Auditoría y coordinación',
  '4D y 5D',
  'Calidad y apoyo en obra',
  'Project Management',
  'Facility Management',
  'Recursos externos',
  'Automatización e IA aplicada',
];

const GAINS = [
  { title: 'Captar talento con poca inversión', text: 'Participa como cliente en el simulador profesional y ve trabajar a los candidatos antes de contratarlos.' },
  { title: 'Equipos certificados para concursos', text: 'Cada vez más licitaciones piden acreditar los perfiles del equipo: IDM, BDM y BCM con AECOMI.' },
  { title: 'Proyectos reales para el aula', text: 'Los alumnos trabajan en proyectos de clientes, y esos proyectos alimentan los casos prácticos del máster.' },
];

export default function EmpresasPage() {
  return (
    <SubPageShell>
      <PageHero
        eyebrow="Para empresas"
        title="Definid con nosotros los perfiles que necesitáis"
        lead="Formación in-company, talento y consultoría BIM en un mismo interlocutor: el puente entre la escuela y la empresa, con la IA integrada en cada servicio."
      />

      <section aria-labelledby="ganan-title" className="px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <SectionHead eyebrow="Qué ganáis" title={<span id="ganan-title">Lo que consigue una empresa que participa</span>} />
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {GAINS.map((g, i) => (
              <Reveal key={g.title} delay={i * 0.1} className="rounded-3xl bg-[var(--ink-solid)] text-[#f4f8ff] p-7">
                <h3 className="font-kinetic font-black uppercase text-lg leading-tight">{g.title}</h3>
                <p className="text-[#c9d9f0] leading-relaxed mt-3 text-sm">{g.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="incompany-title" className="px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <SectionHead
            eyebrow="Formación in-company"
            title={<span id="incompany-title">El programa se acota, no se improvisa</span>}
            lead="Itinerarios para vuestros equipos sobre el mapa de cada perfil. Más de 50 empresas ya han confiado en la formación in-company de IDESIE."
          />
          <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROCESS.map((s, i) => (
              <li key={s.num} className="list-none">
                <Reveal delay={i * 0.08} className="h-full">
                  <div className="h-full rounded-2xl border border-white/10 bg-black/40 p-6">
                    <span className="font-kinetic font-black text-2xl text-[var(--signal)]">{s.num}</span>
                    <h3 className="font-kinetic font-bold text-sm uppercase mt-3">{s.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed mt-2">{s.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
          <div className="mt-4 grid md:grid-cols-3 gap-4">
            {MODES.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.08} className="h-full">
                <div className="h-full rounded-2xl border border-[var(--signal)]/30 bg-[var(--signal)]/5 p-5">
                  <h3 className="font-kinetic font-bold text-sm uppercase">{m.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed mt-2">{m.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="consultoria-title" className="px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <SectionHead
            eyebrow="Consultoría BIM"
            title={<span id="consultoria-title">El puente entre la escuela y la empresa</span>}
            lead="Los alumnos trabajan en proyectos reales de clientes, supervisados por profesionales, y esos proyectos alimentan los casos prácticos del máster."
          />
          <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {CONSULTING.map((c, i) => (
              <li key={c} className="list-none">
                <Reveal delay={(i % 5) * 0.05} className="h-full">
                  <div className="h-full rounded-2xl border border-white/10 bg-black/40 p-5 font-kinetic font-bold text-sm uppercase leading-snug hover:border-[var(--signal)]/50 transition-colors">
                    {c}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        title="¿Hablamos de tu equipo?"
        text="Cuéntanos los retos de tu empresa y diseñamos juntos el mapa de perfiles, la formación y el apoyo en consultoría."
        pack="Empresas"
      />
    </SubPageShell>
  );
}
