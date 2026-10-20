import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { SubPageShell } from './SubPage';
import Section from './Section';
import Reveal from './Reveal';
import Tile from './Tile';
import { BookCallButton } from './BookCall';
import SimulatorHero from './SimulatorHero';
import SimulatorJourney from './SimulatorJourney';
import SimulatorAudience from './SimulatorAudience';
import { SIMULATOR } from '@/lib/content';

const LIVE = [
  { t: 'Clientes reales', x: 'Profesionales de las empresas colaboradoras hacen de cliente: fijan requisitos, revisan entregas y piden cambios.' },
  { t: 'Tu rol en el equipo', x: 'Asumes el rol del perfil al que aspiras: Information Delivery Manager, BIM Design Manager o BIM Construction Manager.' },
  { t: 'Proceso ISO 19650', x: 'Trabajas sobre un entorno común de datos real, con hitos, actas, versiones y auditorías.' },
  { t: 'Evidencias de tu desempeño', x: 'Todo queda registrado: entregas, revisiones y evaluación del cliente.' },
];

const FAQS = [
  { q: '¿Es un proyecto real?', a: 'Es un proyecto completo con todos sus procesos y con profesionales de empresas reales haciendo de cliente: requisitos, entregas, reuniones, cambios, auditoría y defensa final.' },
  { q: '¿Convalida experiencia profesional?', a: `Está diseñado para convalidarse como experiencia en la certificación profesional, según los criterios que AECOMI establece para cada perfil.` },
  { q: '¿Cuánto dura y cuánto cuesta?', a: `Es el proyecto fin de máster del Máster BIM: ${SIMULATOR.ects} ECTS. Escríbenos y te contamos la duración y las condiciones de la próxima edición.` },
  { q: '¿Puedo hacerlo si soy un profesional con experiencia?', a: 'Sí. Está pensado también para perfiles senior que quieren orientar su carrera hacia un nuevo perfil.' },
  { q: '¿Cómo puede participar mi empresa?', a: 'Aportando profesionales que hagan de cliente en los proyectos. Escríbenos y te contamos el formato de colaboración.' },
];

/** Página del simulador profesional: una experiencia a pantalla completa, de la portada animada al recorrido por hitos. */
export default function SimulatorPage() {
  return (
    <SubPageShell>
      <SimulatorHero />

      <Section field="tint" id="problema" labelledBy="problema-title">
        <Reveal className="max-w-4xl">
          <h2 id="problema-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
            Formación sí. Pero también te piden <span className="ui-hl">experiencia</span>.
          </h2>
          <p className="text-lg md:text-xl text-white/60 leading-relaxed mt-6 max-w-2xl">
            Muchos profesionales, jóvenes y no tan jóvenes, no pueden crecer porque las empresas no solo piden formación: piden experiencia demostrable en el puesto.
          </p>
        </Reveal>

        <div className="mt-14 grid lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-10 items-center">
          <Tile className="bg-[#fff] p-7 md:p-9">
            <h3 className="font-kinetic font-bold text-2xl leading-snug">Sin experiencia no te contratan. Sin contrato no hay experiencia.</h3>
            <p className="text-white/60 leading-relaxed mt-4">Terminas tu formación con ganas y talento, pero el primer puesto exige una experiencia que nadie te deja conseguir.</p>
          </Tile>
          <div className="relative w-40 h-40 mx-auto grid place-items-center" aria-hidden="true">
            <span className="sim-ring absolute inset-0 rounded-full border-[3px] border-dashed border-[#0063e6]" />
            <span className="sim-ring-rev absolute inset-5 rounded-full border-[3px] border-dashed border-[#0a1f44]/40" />
            <span className="font-kinetic font-bold text-sm text-center leading-tight text-[#0a1f44]">el círculo<br />vicioso</span>
          </div>
          <Tile className="bg-[#0a1f44] text-[#fff] p-7 md:p-9" delay={0.1}>
            <h3 className="font-kinetic font-bold text-2xl leading-snug">Tu experiencia no es la que pide tu nuevo perfil.</h3>
            <p className="text-[#c9d9f0] leading-relaxed mt-4">Quieres orientar tu carrera hacia otro puesto, pero la falta de experiencia en ese ámbito no te deja crecer en esa dirección.</p>
          </Tile>
        </div>
      </Section>

      <section className="field-blue px-4 md:px-6 py-20 md:py-28" aria-labelledby="solucion-title">
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-4xl">
            <h2 id="solucion-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
              Por eso hemos creado el <span className="ui-hl">simulador profesional</span>
            </h2>
            <p className="text-lg md:text-xl leading-relaxed mt-6 max-w-2xl text-[#fff]/90">
              Varias empresas se unen para desarrollar contigo un proyecto completo, con todos sus procesos. Una experiencia real que resuelve los dos lados del problema.
            </p>
          </Reveal>
          <ul className="mt-12 grid md:grid-cols-3 gap-3">
            {[
              { t: 'Convalida experiencia profesional', x: 'Diseñado para convalidarse como experiencia en la certificación profesional de AECOMI.*', c: 'bg-[#fff] text-[#0a1f44]' },
              { t: 'Cantera para las empresas', x: 'Las empresas te ven trabajar en condiciones reales antes de contratarte.', c: 'bg-[#0a1f44] text-[#fff]' },
              { t: 'Proyecto fin de máster', x: `${SIMULATOR.ects} ECTS que cierran el Máster BIM con un proyecto completo, no con un trabajo académico.`, c: 'bg-[#0052cc] text-[#fff]' },
            ].map((s, i) => (
              <Tile as="li" key={s.t} delay={i * 0.1} className={`${s.c} p-7 md:p-9 min-h-60 flex flex-col`}>
                <h3 className="font-kinetic font-bold text-xl md:text-2xl leading-snug">{s.t}</h3>
                <p className="mt-auto pt-6 leading-relaxed opacity-90">{s.x}</p>
              </Tile>
            ))}
          </ul>
          <p className="mt-6 text-sm text-[#fff]/85">* {SIMULATOR.convalidationNote}</p>
        </div>
      </section>

      <SimulatorJourney />

      <Section field="white" id="vivir" labelledBy="vivir-title">
        <Reveal className="max-w-4xl">
          <h2 id="vivir-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
            Como en un proyecto real, <span className="ui-hl">porque lo es</span>
          </h2>
        </Reveal>
        <ul className="mt-12 grid sm:grid-cols-2 gap-3">
          {LIVE.map((l, i) => (
            <Tile as="li" key={l.t} delay={i * 0.08} className={`p-7 md:p-9 min-h-56 flex flex-col ${['bg-[#e9f0fc]', 'bg-[#0a1f44] text-[#fff]', 'bg-[#0063e6] text-[#fff]', 'bg-[#e9f0fc]'][i]}`}>
              <h3 className="font-kinetic font-bold text-2xl leading-snug">{l.t}</h3>
              <p className="mt-auto pt-6 text-lg leading-relaxed opacity-90">{l.x}</p>
            </Tile>
          ))}
        </ul>
      </Section>

      <Section field="tint" id="para-quien" labelledBy="quien-title">
        <Reveal className="max-w-4xl mb-10">
          <h2 id="quien-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
            ¿Para quién es el simulador?
          </h2>
        </Reveal>
        <SimulatorAudience />
      </Section>

      <section className="field-blue px-4 md:px-6 py-20 md:py-28" aria-labelledby="ecuacion-title">
        <div className="max-w-6xl mx-auto">
          <h2 id="ecuacion-title" className="sr-only">Formación en competencias más experiencia profesional igual a certificado profesional</h2>
          <div className="grid lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 lg:gap-6 items-stretch" aria-hidden="true">
            {[
              { t: 'Formación en competencias', c: 'bg-[#fff] text-[#0a1f44]' },
              { op: '+' },
              { t: 'Experiencia profesional', c: 'bg-[#0a1f44] text-[#fff]' },
              { op: '=' },
              { t: 'Certificado profesional', c: 'bg-[#4d94ff] text-[#0a1f44]' },
            ].map((e, i) =>
              'op' in e ? (
                <Reveal key={i} delay={i * 0.12} className="font-kinetic font-bold text-5xl md:text-7xl text-center self-center leading-none">
                  {e.op}
                </Reveal>
              ) : (
                <Tile key={e.t} delay={i * 0.12} className={`${e.c} p-7 md:p-9 min-h-40 grid place-items-center text-center`}>
                  <p className="font-kinetic font-bold text-xl md:text-3xl leading-tight">{e.t}</p>
                </Tile>
              ),
            )}
          </div>
          <Reveal className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <p className="text-xl md:text-2xl font-semibold max-w-2xl leading-snug">IDESIE forma y te da la experiencia. AECOMI certifica tu perfil.</p>
            <Link href="/certificacion" className="group inline-flex items-center gap-2 font-semibold underline underline-offset-[6px] decoration-2">
              Ver el certificado profesional
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      <Section field="white" id="faq" labelledBy="faq-title">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16 items-start">
          <Reveal>
            <h2 id="faq-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12]">
              Lo que necesitas saber
            </h2>
          </Reveal>
          <div className="space-y-2.5">
            {FAQS.map((f) => (
              <details key={f.q} name="sim-faq" className="group rounded-2xl bg-[var(--card)] [&_summary::-webkit-details-marker]:hidden">
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

      <section className="field-navy px-4 md:px-6 py-20 md:py-28" aria-labelledby="cta-sim-title">
        <div className="max-w-6xl mx-auto">
          <h2 id="cta-sim-title" className="font-kinetic font-bold text-2xl md:text-4xl leading-[1.15] max-w-3xl">
            Plazas limitadas. Como alumno o como empresa, te contamos la próxima edición.
          </h2>
          <BookCallButton
            pack="Simulador profesional"
            className="group mt-8 inline-flex items-center gap-4 md:gap-6 font-kinetic font-bold text-[clamp(3rem,12vw,9rem)] leading-none text-[#fff] hover:text-[#7db4ff] transition-colors cursor-pointer text-left"
          >
            Participar
            <ArrowRight className="w-[0.6em] h-[0.6em] transition-transform duration-300 group-hover:translate-x-2" aria-hidden="true" />
          </BookCallButton>
        </div>
      </section>
    </SubPageShell>
  );
}
