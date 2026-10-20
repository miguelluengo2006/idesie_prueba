import Reveal, { SectionHead } from './Reveal';
import Section from './Section';
import { COMPANY_LOGOS } from '@/lib/content';
import LogoTile from './LogoTile';

const OFFERS = [
  { title: 'Captad talento', text: 'Participad como cliente en el simulador y ved trabajar a los candidatos antes de contratarlos.' },
  { title: 'Concursos y licitaciones', text: 'Equipos con perfiles certificados, cada vez más exigidos.' },
  { title: 'Formación in-company', text: 'Itinerarios por perfil profesional para vuestros equipos.' },
  { title: 'Consultoría BIM', text: 'ISO 19650, BIM Management Office, modelado, auditoría y 4D/5D.' },
];

/** Empresas: quién confía en nosotros y qué ofrecemos a las empresas. */
export default function Companies() {
  return (
    <Section field="navy" id="empresas" labelledBy="empresas-title">
      <SectionHead
        eyebrow="Empresas"
        title={
          <span id="empresas-title">
            Las empresas referentes del sector <span className="ui-hl">confían</span> en nosotros
          </span>
        }
      />

      <ul className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3" aria-label="Empresas que confían en IDESIE">
        {COMPANY_LOGOS.map((l, i) => (
          <li key={l.name}>
            <Reveal delay={(i % 5) * 0.05}>
              <LogoTile logo={l} />
            </Reveal>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {OFFERS.map((o, i) => (
          <Reveal key={o.title} delay={i * 0.06} className="h-full">
            <div className="ui-card h-full p-6">
              <h3 className="font-kinetic font-semibold text-base leading-snug">{o.title}</h3>
              <p className="text-sm text-[#c9d9f0] leading-relaxed mt-3">{o.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
