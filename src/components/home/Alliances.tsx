import Reveal, { SectionHead } from './Reveal';
import Section from './Section';
import ComingSoon from './ComingSoon';
import { ALLIANCES } from '@/lib/content';

/** Alianzas estratégicas: respaldo académico y profesional. */
export default function Alliances() {
  return (
    <Section field="white" id="alianzas" labelledBy="alianzas-title">
      <SectionHead
        eyebrow="Alianzas estratégicas"
        title={
          <span id="alianzas-title">
            Respaldo académico y profesional a <span className="ui-hl">ambos lados</span> del Atlántico
          </span>
        }
      />
      <div className="mt-12 grid md:grid-cols-3 gap-5">
        {ALLIANCES.map((a, i) => (
          <Reveal key={a.name} delay={i * 0.1} className="ui-card h-full p-7 md:p-8 flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--signal)]">{a.kind}</p>
            <span className="block w-10 h-0.5 bg-[#0063e6]" aria-hidden="true" />
            <h3 className="font-kinetic font-bold text-2xl leading-tight">{a.name}</h3>
            <p className="text-sm font-semibold text-white/50">{a.where}</p>
            {a.text ? <p className="text-white/60 leading-relaxed">{a.text}</p> : <ComingSoon className="self-start" />}
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
