import { ArrowUpRight } from 'lucide-react';
import { SubPageShell } from './SubPage';
import Section from './Section';
import Reveal from './Reveal';
import Tile from './Tile';
import { BookCallButton } from './BookCall';
import EmpresasHero from './EmpresasHero';
import LogoMarquee from './LogoMarquee';
import LogoTile from './LogoTile';
import CompanyProcess from './CompanyProcess';
import ServicePicker from './ServicePicker';
import { COMPANY_LOGOS } from '@/lib/content';

const GAINS = [
  { title: 'Captar talento con poca inversión', text: 'Participa como cliente en el simulador profesional y ve trabajar a los candidatos antes de contratarlos.', c: 'bg-[#0a1f44] text-[#fff]' },
  { title: 'Equipos certificados para concursos', text: 'Cada vez más licitaciones piden acreditar los perfiles del equipo: IDM, BDM y BCM con AECOMI.', c: 'bg-[#0063e6] text-[#fff]' },
  { title: 'Proyectos reales para el aula', text: 'Los alumnos trabajan en proyectos de clientes, y esos proyectos alimentan los casos prácticos del máster.', c: 'bg-[#e9f0fc]' },
];

/** Página de empresas: portada con logos, cinta de empresas, lo que ganan, formación in-company, consultoría y cierre. */
export default function EmpresasPage() {
  return (
    <SubPageShell>
      <EmpresasHero />

      <section id="confian" className="field-tint px-4 md:px-6 py-16 md:py-24 scroll-mt-24 overflow-hidden" aria-labelledby="confian-title">
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-4xl mb-10">
            <h2 id="confian-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
              Las empresas referentes del sector <span className="ui-hl">confían</span> en nosotros
            </h2>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed mt-6 max-w-2xl">Más de 50 empresas ya han confiado en la formación in-company de IDESIE.</p>
          </Reveal>
        </div>
        <LogoMarquee />
      </section>

      <Section field="white" id="ganan" labelledBy="ganan-title">
        <Reveal className="max-w-4xl">
          <h2 id="ganan-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">Lo que consigue una empresa que participa</h2>
        </Reveal>
        <ul className="mt-12 grid md:grid-cols-3 gap-3">
          {GAINS.map((g, i) => (
            <Tile as="li" key={g.title} delay={i * 0.1} className={`${g.c} p-7 md:p-9 min-h-64 flex flex-col`}>
              <h3 className="font-kinetic font-bold text-2xl leading-snug">{g.title}</h3>
              <p className="mt-auto pt-6 text-lg leading-relaxed opacity-90">{g.text}</p>
            </Tile>
          ))}
        </ul>
      </Section>

      <Section field="tint" id="incompany" labelledBy="incompany-title">
        <Reveal className="max-w-4xl mb-12">
          <h2 id="incompany-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
            El programa se acota, <span className="ui-hl">no se improvisa</span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 leading-relaxed mt-6 max-w-2xl">Itinerarios in-company para vuestros equipos sobre el mapa de cada perfil.</p>
        </Reveal>
        <CompanyProcess />
      </Section>

      <Section field="white" id="consultoria" labelledBy="consultoria-title">
        <Reveal className="max-w-4xl mb-10">
          <h2 id="consultoria-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
            Consultoría BIM: el puente entre la escuela y la <span className="ui-hl">empresa</span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 leading-relaxed mt-6 max-w-2xl">
            Los alumnos trabajan en proyectos reales de clientes, supervisados por profesionales, y esos proyectos alimentan los casos prácticos del máster.
          </p>
        </Reveal>
        <ServicePicker />
      </Section>

      <section className="field-blue px-4 md:px-6 py-20 md:py-28" aria-labelledby="muro-title">
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-4xl">
            <h2 id="muro-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">Con quién trabajamos</h2>
          </Reveal>
          <ul className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {COMPANY_LOGOS.map((l, i) => (
              <Tile as="li" key={l.name} delay={(i % 5) * 0.06} className="!rounded-3xl bg-transparent">
                <LogoTile logo={l} />
              </Tile>
            ))}
          </ul>
        </div>
      </section>

      <section className="field-navy px-4 md:px-6 py-20 md:py-28" aria-labelledby="cta-emp-title">
        <div className="max-w-6xl mx-auto">
          <h2 id="cta-emp-title" className="font-kinetic font-bold text-2xl md:text-4xl leading-[1.15] max-w-3xl">
            ¿Hablamos de tu equipo? Diseñamos juntos el mapa de perfiles, la formación y el apoyo en consultoría.
          </h2>
          <BookCallButton
            pack="Empresas"
            className="group mt-8 inline-flex items-center gap-4 md:gap-6 font-kinetic font-bold text-[clamp(3rem,12vw,9rem)] leading-none text-[#fff] hover:text-[#7db4ff] transition-colors cursor-pointer text-left"
          >
            Hablemos
            <ArrowUpRight className="w-[0.6em] h-[0.6em] transition-transform duration-300 group-hover:translate-x-2 group-hover:-translate-y-2" aria-hidden="true" />
          </BookCallButton>
        </div>
      </section>
    </SubPageShell>
  );
}
