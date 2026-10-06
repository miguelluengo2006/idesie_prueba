import { ArrowRight } from 'lucide-react';
import Reveal, { SectionHead } from './Reveal';
import { BookCallButton } from './BookCall';
import { MASTER_PRICE_ONLINE, PRICE_PER_ECTS, formatEuro } from '@/lib/bim';

/** "Tres formas de recorrer tu mapa": máster blended, máster online y microcredenciales. */
export default function Programs() {
  const link = 'inline-flex items-center gap-2 text-sm font-semibold mt-auto pt-2 cursor-pointer group';
  const arrow = <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />;

  return (
    <section id="formacion" aria-labelledby="formacion-title" className="px-4 md:px-6 py-20 md:py-28 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <SectionHead eyebrow="Formación" title={<span id="formacion-title">Tres formas de recorrer tu mapa</span>} />

        <div className="mt-12 grid lg:grid-cols-3 gap-5">
          <Reveal className="rounded-3xl bg-[var(--ink-solid)] text-[#f4f8ff] p-7 md:p-9 flex flex-col gap-4">
            <span className="self-start text-[11px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full bg-[var(--yellow)] text-[#0a1f44]">
              Programa insignia
            </span>
            <h3 className="font-kinetic font-black uppercase text-xl md:text-2xl">Máster BIM blended</h3>
            <p className="text-[#c9d9f0] leading-relaxed">
              Para recién titulados y jóvenes profesionales. 50% presencial con casos reales y 50% online. Trabajo remunerado en empresa
              desde el primer día.
            </p>
            <ul className="text-sm text-[#c9d9f0] space-y-2">
              <li>
                <strong className="text-[#f4f8ff]">50% presencial:</strong> casos reales, coordinación entre disciplinas y trabajo en
                equipo sobre modelos.
              </li>
              <li>
                <strong className="text-[#f4f8ff]">50% online:</strong> manejo de software y contenidos que no requieren presencialidad,
                a ritmo propio.
              </li>
            </ul>
            <p className="text-sm font-semibold text-[var(--yellow)]">Madrid · Metodología dual</p>
            <BookCallButton pack="Máster BIM blended" className={`${link} text-[#f4f8ff]`}>
              Conocer el máster {arrow}
            </BookCallButton>
          </Reveal>

          <Reveal delay={0.1} className="rounded-3xl border border-white/10 bg-black/40 p-7 md:p-9 flex flex-col gap-4">
            <span className="self-start text-[11px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full bg-[var(--signal)]/10 text-[var(--signal)]">
              Flexible
            </span>
            <h3 className="font-kinetic font-black uppercase text-xl md:text-2xl">Máster BIM online</h3>
            <p className="text-white/60 leading-relaxed">
              El mismo contenido del programa presencial, 100% online y a tu ritmo, con acceso a nuestra bolsa de empleo.
            </p>
            <p className="text-sm font-semibold text-[var(--signal)]">{formatEuro(MASTER_PRICE_ONLINE)} · Online · Bolsa de empleo</p>
            <BookCallButton pack="Máster BIM online" className={`${link} text-[var(--signal)]`}>
              Conocer el máster online {arrow}
            </BookCallButton>
          </Reveal>

          <Reveal delay={0.2} className="rounded-3xl border border-white/10 bg-black/40 p-7 md:p-9 flex flex-col gap-4">
            <span className="self-start text-[11px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full bg-[var(--yellow)]/30 text-[#5c4300]">
              Nuevo
            </span>
            <h3 className="font-kinetic font-black uppercase text-xl md:text-2xl">Microcredenciales</h3>
            <p className="text-white/60 leading-relaxed">
              23 módulos de 1 a 3 ECTS. Elige las competencias que te faltan o completa el máster módulo a módulo, cerrando con el
              simulador profesional como proyecto fin de máster.
            </p>
            <p className="text-sm font-semibold text-[var(--signal)]">
              Desde {formatEuro(PRICE_PER_ECTS)} · {formatEuro(PRICE_PER_ECTS)} por ECTS · Acumulables
            </p>
            <a href="#catalogo" className={`${link} text-[var(--signal)]`}>
              Ver el catálogo {arrow}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
