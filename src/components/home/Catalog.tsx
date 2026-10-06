import Reveal, { SectionHead } from './Reveal';
import {
  MASTER_ECTS,
  MASTER_PRICE_ONLINE,
  MASTER_PRICE_PARTS,
  MICROS,
  PRICE_PER_ECTS,
  SIMULATOR_ECTS,
  TOTAL_ECTS,
  TOTAL_MICROS,
  formatEuro,
  groupByArea,
} from '@/lib/bim';

/** "El Máster BIM, en 23 microcredenciales": el catálogo completo agrupado por área. */
export default function Catalog() {
  const groups = groupByArea(MICROS);

  return (
    <section id="catalogo" aria-labelledby="catalogo-title" className="px-4 md:px-6 py-20 md:py-28 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <SectionHead
            eyebrow="Catálogo de microcredenciales"
            title={<span id="catalogo-title">El Máster BIM, en {TOTAL_MICROS} microcredenciales</span>}
          />
          <Reveal className="lg:text-right space-y-1.5 shrink-0">
            <p className="font-kinetic font-bold text-base md:text-lg">
              {TOTAL_MICROS} microcredenciales · {TOTAL_ECTS} ECTS
            </p>
            <p className="text-sm text-white/60">
              + Simulador profesional (proyecto fin de máster) · {SIMULATOR_ECTS} ECTS = <strong className="text-white">Máster BIM · {MASTER_ECTS} ECTS</strong>
            </p>
            <p className="text-sm text-white/60">
              Por partes: {formatEuro(PRICE_PER_ECTS)} por ECTS ({formatEuro(MASTER_PRICE_PARTS)}) · De una vez:{' '}
              <strong className="text-white">{formatEuro(MASTER_PRICE_ONLINE)}</strong>
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(({ area, micros, ects }, i) => (
            <Reveal key={area.id} delay={(i % 3) * 0.08} className="h-full">
              <article className="h-full rounded-2xl border border-white/10 bg-black/40 p-6 hover:border-[var(--signal)]/50 transition-colors">
                <header className="flex items-baseline justify-between gap-3">
                  <h3 className="font-kinetic font-bold text-sm md:text-base uppercase leading-snug">{area.name}</h3>
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
    </section>
  );
}
