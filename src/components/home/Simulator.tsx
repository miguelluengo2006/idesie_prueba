import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';
import { BookCallButton } from './BookCall';
import { SIMULATOR_ECTS } from '@/lib/bim';

const STEPS = [
  'Requisitos del cliente',
  'Plan de ejecución BIM',
  'Entregas por hitos',
  'Reuniones con cliente',
  'Cambios e incidencias',
  'Auditoría de modelos',
  'Entrega y defensa',
];

const BENEFITS = [
  { who: 'Para el alumno', text: 'Experiencia de proceso real y evidencias registradas de su desempeño.' },
  { who: 'Para la empresa', text: 'Capta talento con poca inversión y lo ve trabajar antes de contratarlo.' },
  { who: 'Por perfiles', text: 'Los alumnos rotan los roles IDM, BDM y BCM.' },
];

/** Proyecto fin de máster: el simulador profesional. */
export default function Simulator() {
  return (
    <section id="simulador" aria-labelledby="simulador-title" className="px-4 md:px-6 py-20 md:py-28 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <Reveal className="max-w-3xl">
            <span className="text-xs tracking-[0.25em] uppercase text-[var(--signal)]">Proyecto fin de máster · Simulador profesional</span>
            <h2 id="simulador-title" className="font-kinetic font-black uppercase text-3xl md:text-5xl leading-[1.05] mt-4">
              Tu primer proyecto, antes de tu primer contrato
            </h2>
            <p className="text-white/60 mt-5 text-base md:text-lg leading-relaxed">
              Es el proyecto fin de máster del Máster BIM ({SIMULATOR_ECTS} ECTS). Como un simulador de vuelo: vives el proceso completo de
              un encargo BIM y profesionales de grandes empresas hacen de cliente. Entregas, reuniones, cambios y seguimiento, todo
              registrado como evidencia de tu desempeño.
            </p>
          </Reveal>
          <BookCallButton
            pack="Simulador profesional"
            className="group inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-[var(--signal)] text-black hover:bg-[var(--signal-dim)] transition-colors w-fit shrink-0"
          >
            <span className="text-sm font-medium tracking-wide">Quiero participar</span>
            <span className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center group-hover:rotate-45 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </BookCallButton>
        </div>

        <div role="list" className="mt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {STEPS.map((step, i) => (
            <Reveal key={step} delay={i * 0.05}>
              <div role="listitem" className="h-full rounded-2xl border border-white/10 bg-black/40 p-4 md:p-5">
                <span className="font-kinetic font-bold text-sm text-[var(--signal)]">{String(i + 1).padStart(2, '0')}</span>
                <p className="font-semibold text-sm md:text-[15px] leading-snug mt-2">{step}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-3">
          {BENEFITS.map((b) => (
            <div key={b.who} className="rounded-2xl border border-[var(--signal)]/25 bg-[var(--signal)]/5 p-5">
              <p className="text-xs tracking-[0.2em] uppercase text-[var(--signal)]">{b.who}</p>
              <p className="text-sm text-white/70 leading-relaxed mt-2">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
