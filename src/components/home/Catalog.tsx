import Reveal, { SectionHead } from './Reveal';
import Section from './Section';
import {
  MASTER_ECTS,
  MICROS,
  SIMULATOR_ECTS,
  TOTAL_ECTS,
  TOTAL_MICROS,
  groupByArea,
} from '@/lib/bim';

/** "El Máster BIM, en 23 microcredenciales": el catálogo completo agrupado por área. */
export default function Catalog() {
  const groups = groupByArea(MICROS);

  return (
    <Section field="white" id="catalogo" labelledBy="catalogo-title">
      <div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <SectionHead
            eyebrow="Catálogo de microcredenciales"
            title={
              <span id="catalogo-title">
                El Máster BIM, en <span className="ui-hl">{TOTAL_MICROS}</span> microcredenciales
              </span>
            }
          />
          <Reveal className="lg:text-right space-y-1.5 shrink-0">
            <p className="font-kinetic font-semibold text-base md:text-lg">
              {TOTAL_MICROS} microcredenciales · {TOTAL_ECTS} ECTS
            </p>
            <p className="text-sm text-white/60">
              + Simulador profesional (proyecto fin de máster) · {SIMULATOR_ECTS} ECTS = <strong className="text-white">Máster BIM · {MASTER_ECTS} ECTS</strong>
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(({ area, micros, ects }, i) => (
            <Reveal key={area.id} delay={(i % 3) * 0.08} className="h-full">
              <article className="ui-card h-full p-6">
                <header className="flex items-baseline justify-between gap-3">
                  <h3 className="font-kinetic font-semibold text-base leading-snug">{area.name}</h3>
                  <span className="text-sm font-semibold text-[var(--signal)] whitespace-nowrap">{ects} ECTS</span>
                </header>
                <ul className="mt-5 space-y-2.5">
                  {micros.map((m) => (
                    <li key={m.code} className="flex justify-between gap-3 text-sm leading-snug">
                      <span>
                        <b className="text-[var(--signal)] font-kinetic text-xs mr-1.5">{m.code}</b>
                        {m.title}
                      </span>
                      <span className="text-white/50 whitespace-nowrap">{m.ects} ECTS</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
