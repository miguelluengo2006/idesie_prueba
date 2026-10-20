import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';
import Section from './Section';
import { BookCallButton } from './BookCall';
import { SIMULATOR } from '@/lib/content';

/** Novedad · Simulador profesional: problema, solución y los siete pasos del proyecto. */
export default function Simulator() {
  return (
    <Section field="white" id="simulador" labelledBy="simulador-title">
      <Reveal className="max-w-3xl">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--signal)]">Novedad · Simulador profesional · Para jóvenes talentos</span>
        <h2 id="simulador-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.15] mt-4">
          Tu primera experiencia profesional, <span className="ui-hl">antes</span> de tu primer contrato.
        </h2>
      </Reveal>

      <div className="mt-10 grid md:grid-cols-2 gap-5">
        <Reveal className="ui-card p-7 md:p-9">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50">El problema</p>
          <p className="mt-3 text-lg leading-relaxed">
            Sin experiencia no te contratan. Y sin contrato no consigues experiencia. Muchos jóvenes con talento se quedan atrapados en ese círculo.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="field-navy rounded-2xl p-7 md:p-9">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#ffba08]">La solución</p>
          <p className="mt-3 text-lg leading-relaxed">
            Varias empresas se unen para desarrollar contigo un proyecto completo, con todos sus procesos. Es el proyecto fin de máster, y una
            experiencia diseñada para convalidarse en la certificación.*
          </p>
        </Reveal>
      </div>

      <div role="list" className="mt-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {SIMULATOR.steps.map((step, i) => (
          <Reveal key={step} delay={i * 0.05}>
            <div role="listitem" className="ui-card h-full p-4 md:p-5">
              <span className="font-kinetic font-bold text-sm text-[var(--signal)]">{String(i + 1).padStart(2, '0')}</span>
              <p className="font-semibold text-sm md:text-[15px] leading-snug mt-2">{step}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <p className="text-sm text-white/60">* {SIMULATOR.convalidationNote}</p>
        <BookCallButton pack="Simulador profesional" className="btn btn-blue w-fit shrink-0">
          Quiero participar
          <span className="btn-dot bg-[#fff]/20">
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </span>
        </BookCallButton>
      </div>
    </Section>
  );
}
