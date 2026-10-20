import Reveal, { SectionHead } from './Reveal';
import Section from './Section';
import ComingSoon from './ComingSoon';
import { EVENTS } from '@/lib/content';

/** Agenda: próximos eventos. Las fechas llegan cuando estén confirmadas. */
export default function Agenda() {
  return (
    <Section field="tint" id="agenda" labelledBy="agenda-title">
      <SectionHead
        eyebrow="Agenda"
        title={
          <span id="agenda-title">
            Próximos <span className="ui-hl">eventos</span>
          </span>
        }
      />
      <div role="list" className="mt-12 grid md:grid-cols-3 gap-5">
        {EVENTS.map((e, i) => (
          <Reveal key={e.title} delay={i * 0.1} className="h-full">
            <div role="listitem" className="ui-card h-full p-7 flex flex-col gap-3">
              {e.date ? <p className="font-kinetic font-bold text-[var(--signal)]">{e.date}</p> : <ComingSoon className="self-start">Fecha próximamente</ComingSoon>}
              <span className="block w-10 h-0.5 bg-[#0063e6]" aria-hidden="true" />
              <h3 className="font-kinetic font-semibold text-lg leading-snug">{e.title}</h3>
              <p className="text-sm text-white/60 mt-auto">{e.mode}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
