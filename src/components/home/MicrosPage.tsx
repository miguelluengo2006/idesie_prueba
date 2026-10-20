import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { SubPageShell } from './SubPage';
import Section from './Section';
import Reveal from './Reveal';
import Tile from './Tile';
import { BookCallButton } from './BookCall';
import MicrosHero from './MicrosHero';
import MicrosBuilder from './MicrosBuilder';
import { MASTER_ECTS, PRICE_PER_ECTS, SIMULATOR_ECTS, TOTAL_ECTS, TOTAL_MICROS } from '@/lib/bim';

/** Página de microcredenciales: portada que encaja las piezas, constructor de itinerario, tres escalones y cierre. */
export default function MicrosPage() {
  return (
    <SubPageShell>
      <MicrosHero />

      <Section field="tint" id="monta" labelledBy="monta-title">
        <Reveal className="max-w-4xl mb-12">
          <h2 id="monta-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
            Monta tu <span className="ui-hl">itinerario</span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 leading-relaxed mt-6 max-w-2xl">
            Elige los módulos que necesitas y mira al instante cuántos ECTS suman, cuánto cuestan módulo a módulo ({PRICE_PER_ECTS} € por ECTS) y qué perfiles vas desbloqueando.
          </p>
        </Reveal>
        <MicrosBuilder />
      </Section>

      <section className="field-blue px-4 md:px-6 py-20 md:py-28" aria-labelledby="escalera-title">
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-4xl">
            <h2 id="escalera-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
              De un módulo al <span className="ui-hl">máster</span>
            </h2>
          </Reveal>
          <ul className="mt-12 grid md:grid-cols-3 gap-3 items-end">
            {[
              { t: 'Empiezas con uno', x: `Módulos de 1 a 3 ECTS que haces a tu ritmo, sin comprometerte con el programa completo.`, h: 'md:min-h-56', c: 'bg-[#fff] text-[#0a1f44]' },
              { t: 'Los acumulas', x: `Las ${TOTAL_MICROS} microcredenciales suman ${TOTAL_ECTS} ECTS. Cada perfil profesional agrupa las que necesita.`, h: 'md:min-h-72', c: 'bg-[#0a1f44] text-[#fff]' },
              { t: 'Completas el Máster BIM', x: `Con el simulador profesional (${SIMULATOR_ECTS} ECTS) como proyecto fin de máster llegas a los ${MASTER_ECTS} ECTS.`, h: 'md:min-h-96', c: 'bg-[#0052cc] text-[#fff]' },
            ].map((s, i) => (
              <Tile as="li" key={s.t} delay={i * 0.12} className={`${s.c} ${s.h} p-7 md:p-9 flex flex-col`}>
                <h3 className="font-kinetic font-bold text-2xl leading-snug">{s.t}</h3>
                <p className="mt-auto pt-8 text-lg leading-relaxed opacity-90">{s.x}</p>
              </Tile>
            ))}
          </ul>
          <Reveal className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            <Link href="/perfiles" className="group inline-flex items-center gap-2 font-semibold underline underline-offset-[6px] decoration-2">
              Ver los perfiles profesionales
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link href="/simulador" className="group inline-flex items-center gap-2 font-semibold underline underline-offset-[6px] decoration-2">
              Conocer el simulador
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="field-navy px-4 md:px-6 py-20 md:py-28" aria-labelledby="cta-micro-title">
        <div className="max-w-6xl mx-auto">
          <h2 id="cta-micro-title" className="font-kinetic font-bold text-2xl md:text-4xl leading-[1.15] max-w-3xl">
            ¿Por dónde empezar? Cuéntanos tu punto de partida y te armamos el itinerario.
          </h2>
          <BookCallButton
            pack="Microcredenciales · orientación"
            className="group mt-8 inline-flex items-center gap-4 md:gap-6 font-kinetic font-bold text-[clamp(3rem,12vw,9rem)] leading-none text-[#fff] hover:text-[#7db4ff] transition-colors cursor-pointer text-left"
          >
            Empezar
            <ArrowUpRight className="w-[0.6em] h-[0.6em] transition-transform duration-300 group-hover:translate-x-2 group-hover:-translate-y-2" aria-hidden="true" />
          </BookCallButton>
        </div>
      </section>
    </SubPageShell>
  );
}
