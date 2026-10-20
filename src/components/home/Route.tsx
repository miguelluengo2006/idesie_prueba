import Reveal, { SectionHead } from './Reveal';
import Section from './Section';

const TRACKS = [
  {
    label: 'Formación acreditada',
    items: [
      { title: 'Máster BIM dual', text: 'Formación acreditada por AECOMI desde el primer módulo.' },
      { title: 'Microcredenciales', text: 'Las competencias que te falten, a tu ritmo.' },
    ],
  },
  {
    label: 'Experiencia',
    items: [
      { title: 'Desde el primer día', text: 'Con la metodología dual trabajas en empresa mientras te formas.' },
      { title: 'Simulador profesional', text: 'Tu proyecto fin de máster: un encargo completo con un cliente real de empresa.' },
      { title: 'Práctica profesional', text: 'Hasta reunir los años que exige tu perfil.' },
    ],
  },
];

/** "Tu ruta hacia la certificación": formación y experiencia en paralelo hasta la meta. */
export default function Route() {
  return (
    <Section field="white" id="ruta" labelledBy="ruta-title">
      <SectionHead
        eyebrow="Tu ruta hacia la certificación"
        title={
          <span id="ruta-title">
            No hace falta certificarse ya. Sí saber <span className="ui-hl">qué te falta</span>.
          </span>
        }
        lead="Para cada perfil sabrás qué competencias debes acreditar y qué experiencia necesitas. Así puedes proyectar en el tiempo cuándo llegarás al puesto que buscas."
      />

      <div className="mt-12 grid lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          {TRACKS.map((track, ti) => (
            <Reveal key={track.label} delay={ti * 0.1} className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-44 shrink-0 flex items-center rounded-2xl px-5 py-5 bg-[#0a1f44] text-[#fff] font-kinetic font-semibold text-sm">
                {track.label}
              </div>
              <div className="flex-1 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {track.items.map((item) => (
                  <div key={item.title} className="ui-card p-5">
                    <h3 className="font-kinetic font-semibold text-base leading-snug">{item.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed mt-2">{item.text}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="field-navy rounded-2xl p-7 md:p-8 flex flex-col justify-center gap-3">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#ffba08]">Meta</p>
          <p className="font-kinetic font-bold text-xl md:text-2xl leading-tight">Certificación AECOMI de tu perfil</p>
          <p className="text-sm text-[#c9d9f0] leading-relaxed">Cuando reúnes la formación y la experiencia exigidas.</p>
        </Reveal>
      </div>
    </Section>
  );
}
