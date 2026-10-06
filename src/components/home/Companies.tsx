import Reveal, { SectionHead } from './Reveal';

const HIGHLIGHTS = [
  {
    tag: 'Talento',
    title: 'Captad talento con poca inversión',
    text: 'Participad como cliente en el simulador profesional y ved trabajar a los candidatos antes de contratarlos.',
  },
  {
    tag: 'Concursos',
    title: 'Equipos con perfiles certificados',
    text: 'Cada vez más licitaciones y proyectos piden acreditar los perfiles profesionales del equipo.',
  },
];

const SERVICES = [
  { title: 'Definir perfiles', text: 'Identificamos juntos las competencias de cada puesto.' },
  { title: 'Incorporar talento', text: 'Alumnos en formación dual y en el simulador, preparados para certificarse.' },
  { title: 'Formación in-company', text: 'Itinerarios para tus equipos sobre el mapa de cada perfil.' },
  { title: 'Consultoría BIM', text: 'ISO 19650, BIM Management Office, modelado, auditoría, 4D/5D y Facility Management.' },
];

const CLIENTS = [
  'Ferrovial',
  'Acciona',
  'IDOM',
  'Accenture',
  'Banco de España',
  'Savills',
  'Metrovacesa',
  'AEDAS Homes',
  'Hill International',
  'Estudio Lamela',
];

/** Para empresas: perfiles, talento, formación in-company y consultoría. */
export default function Companies() {
  return (
    <section id="empresas" aria-labelledby="empresas-title" className="px-4 md:px-6 py-20 md:py-28 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <SectionHead eyebrow="Para empresas" title={<span id="empresas-title">Definid con nosotros los perfiles que necesitáis</span>} />

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {HIGHLIGHTS.map((h, i) => (
            <Reveal key={h.tag} delay={i * 0.1} className="rounded-3xl bg-[var(--ink-solid)] text-[#f4f8ff] p-7 md:p-9">
              <p className="text-xs tracking-[0.2em] uppercase text-[var(--yellow)]">{h.tag}</p>
              <h3 className="font-kinetic font-black uppercase text-xl md:text-2xl leading-tight mt-3">{h.title}</h3>
              <p className="text-[#c9d9f0] leading-relaxed mt-3">{h.text}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06} className="h-full">
              <div className="h-full rounded-2xl border border-white/10 bg-black/40 p-6 hover:border-[var(--signal)]/50 transition-colors">
                <h3 className="font-kinetic font-bold text-sm uppercase leading-snug">{s.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed mt-3">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-14">
          <p className="text-xs tracking-[0.2em] uppercase text-white/50">Ya confían en nosotros</p>
          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
            {CLIENTS.map((c, i) => (
              <li key={c} className="font-kinetic font-bold text-base md:text-lg flex items-center gap-3">
                {c}
                {i < CLIENTS.length - 1 && <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)]" aria-hidden="true" />}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
