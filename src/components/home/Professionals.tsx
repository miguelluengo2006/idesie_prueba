import Reveal from './Reveal';
import Section from './Section';
import ComingSoon from './ComingSoon';

/** Para profesionales técnicos que quieran publicar sus cursos: aún sin condiciones definidas. */
export default function Professionals() {
  return (
    <Section field="white" id="profesionales" labelledBy="profesionales-title" className="!py-16 md:!py-20">
      <Reveal className="ui-card p-7 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--signal)]">Para profesionales técnicos</span>
          <h2 id="profesionales-title" className="font-kinetic font-bold text-2xl md:text-3xl leading-[1.2] mt-3">
            ¿Quieres publicar tus cursos en la plataforma de IDESIE?
          </h2>
          <p className="text-white/60 mt-3">Estamos definiendo las condiciones para los profesionales que quieran colaborar.</p>
        </div>
        <ComingSoon className="self-start md:self-center shrink-0" />
      </Reveal>
    </Section>
  );
}
