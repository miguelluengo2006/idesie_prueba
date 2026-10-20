import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';
import Section from './Section';
import { CONTACT } from '@/lib/bim';

const EQUATION = [
  { tag: 'Formación', title: 'Competencias', text: 'Microcredenciales y másteres de IDESIE, entidad formativa acreditada por AECOMI.', sign: '+' },
  { tag: 'Experiencia', title: 'Práctica profesional', text: 'Learning by Working en empresa o el simulador profesional.', sign: '=' },
  { tag: 'Meta', title: 'Certificado profesional', text: 'Tu carnet digital de competencias, emitido por AECOMI.', sign: '' },
];

const QUESTIONS = [
  { q: '¿Quién me forma?', a: 'IDESIE, como entidad formativa acreditada por AECOMI. Profesores que trabajan en las empresas referentes del sector.' },
  { q: '¿Quién me certifica?', a: 'AECOMI, entidad independiente que certifica perfiles profesionales del sector AECO.', link: true },
  { q: '¿Por qué certificarme?', a: 'Porque demuestras a la empresa que tienes las competencias que necesita para el puesto. Y cada vez más concursos y proyectos lo exigen.' },
];

/** Novedad · Certificado profesional: formación + experiencia = carnet digital emitido por AECOMI. */
export default function CertificateSection() {
  return (
    <Section field="navy" id="certificado" labelledBy="certificado-title">
      <Reveal className="max-w-3xl">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#ffba08]">Novedad · Certificado profesional</span>
        <h2 id="certificado-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.15] mt-4">
          Las empresas ya no buscan currículum. Buscan que <span className="ui-hl">sepas hacer</span> el trabajo.
        </h2>
        <p className="text-[#c9d9f0] mt-5 text-base md:text-lg leading-relaxed">
          El presente y el futuro del empleo técnico es el certificado profesional: un carnet digital que acredita las competencias que has
          adquirido y que cualquier empresa puede verificar.
        </p>
      </Reveal>

      <div className="mt-12 grid md:grid-cols-3 gap-4 md:gap-0 md:items-stretch">
        {EQUATION.map((e, i) => (
          <Reveal key={e.title} delay={i * 0.12} className="relative">
            <div className={`ui-card h-full p-6 md:p-7 md:mx-3 ${i === 2 ? '!bg-[#ffba08] !text-[#0a1f44]' : ''}`}>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">{e.tag}</p>
              <h3 className="font-kinetic font-semibold text-xl mt-2">{e.title}</h3>
              <p className={`text-sm leading-relaxed mt-2 ${i === 2 ? 'text-[#0a1f44]' : 'text-[#c9d9f0]'}`}>{e.text}</p>
            </div>
            {e.sign && (
              <span
                className="hidden md:grid absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 place-items-center rounded-full bg-[#0a1f44] border border-[#7db4ff]/40 font-kinetic font-bold"
                aria-hidden="true"
              >
                {e.sign}
              </span>
            )}
          </Reveal>
        ))}
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-4">
        {QUESTIONS.map((x) => (
          <div key={x.q} className="rounded-2xl border border-[#7db4ff]/30 p-6">
            <h3 className="font-kinetic font-semibold text-base">{x.q}</h3>
            <p className="text-sm text-[#c9d9f0] leading-relaxed mt-2">{x.a}</p>
            {x.link && (
              <a href={CONTACT.aecomiUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#ffba08] mt-3 hover:underline">
                aecomi.org <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
