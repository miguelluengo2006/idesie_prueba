import Reveal, { SectionHead } from './Reveal';

const TRACKS = [
  {
    label: 'Formación acreditada',
    tone: 'signal' as const,
    items: [
      { title: 'Máster BIM dual', text: 'Formación acreditada por AECOMI desde el primer módulo.' },
      { title: 'Microcredenciales', text: 'Las competencias que te falten, a tu ritmo.' },
    ],
  },
  {
    label: 'Experiencia',
    tone: 'soft' as const,
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
    <section id="ruta" aria-labelledby="ruta-title" className="px-4 md:px-6 py-20 md:py-28 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <SectionHead
          eyebrow="Tu ruta hacia la certificación"
          title={<span id="ruta-title">No hace falta certificarse ya. Sí saber qué te falta.</span>}
          lead="Para cada perfil sabrás qué competencias debes acreditar y qué experiencia necesitas. Así puedes proyectar en el tiempo cuándo llegarás al puesto que buscas."
        />

        <div className="mt-12 grid lg:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {TRACKS.map((track, ti) => (
              <Reveal key={track.label} delay={ti * 0.1} className="flex flex-col sm:flex-row gap-4">
                <div
                  className={`sm:w-44 shrink-0 flex items-center rounded-2xl px-5 py-5 font-kinetic font-bold text-xs tracking-[0.12em] uppercase ${
                    track.tone === 'signal' ? 'bg-[var(--signal)] text-black' : 'bg-[var(--signal)]/10 text-[var(--signal)]'
                  }`}
                >
                  {track.label}
                </div>
                <div className="flex-1 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {track.items.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-black/40 p-5">
                      <h3 className="font-kinetic font-bold text-sm uppercase leading-snug">{item.title}</h3>
                      <p className="text-sm text-white/60 leading-relaxed mt-2">{item.text}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2} className="rounded-3xl bg-[var(--ink-solid)] text-[#f4f8ff] p-7 md:p-8 flex flex-col justify-center gap-3">
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--yellow)]">Meta</p>
            <p className="font-kinetic font-black uppercase text-xl md:text-2xl leading-tight">Certificación AECOMI de tu perfil</p>
            <p className="text-sm text-[#c9d9f0] leading-relaxed">Cuando reúnes la formación y la experiencia exigidas.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
