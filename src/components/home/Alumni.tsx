import Reveal, { SectionHead } from './Reveal';
import Section from './Section';
import { ALUMNI } from '@/lib/content';

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Alumni: dónde están hoy nuestros alumnos. */
export default function Alumni() {
  return (
    <Section field="tint" id="alumni" labelledBy="alumni-title">
      <SectionHead
        eyebrow="Alumni"
        title={
          <span id="alumni-title">
            Dónde están <span className="ui-hl">hoy</span> nuestros alumnos
          </span>
        }
        lead="El éxito de nuestros alumnos es nuestro éxito."
      />
      <div role="list" className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ALUMNI.map((a, i) => (
          <Reveal key={a.name} delay={i * 0.08} className="h-full">
            <div role="listitem" className="ui-card h-full p-6">
              <span className="w-12 h-12 rounded-full bg-[#0a1f44] text-[#fff] font-kinetic font-bold grid place-items-center" aria-hidden="true">
                {initials(a.name)}
              </span>
              <span className="block w-10 h-0.5 bg-[#0063e6] mt-5" aria-hidden="true" />
              <h3 className="font-kinetic font-semibold text-lg mt-3 leading-snug">{a.name}</h3>
              <p className="text-sm font-semibold text-[var(--signal)] mt-1">{a.role}</p>
              <p className="text-sm text-white/60 mt-1">{a.where}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
