import Reveal from './Reveal';
import { FACTS } from '@/lib/content';

const STATS = [
  { value: String(FACTS.founded), label: 'Formando arquitectos e ingenieros' },
  { value: FACTS.students, label: 'Alumnos formados' },
  { value: FACTS.placement, label: 'Inserción laboral' },
  { value: '1.º', label: 'Máster BIM en España. Elegido por las empresas.' },
];

/** Cifras: tarjetas que montan sobre el borde inferior del carrusel. La sombra es la única de la web: indica que flotan sobre el hero. */
export default function Stats() {
  return (
    <section
      aria-label="IDESIE en cifras"
      className="relative z-10 px-4 md:px-6 pb-16 md:pb-20 -mt-16 md:-mt-20 [background:linear-gradient(to_bottom,transparent_4rem,#fff_4rem)] md:[background:linear-gradient(to_bottom,transparent_5rem,#fff_5rem)]"
    >
      <dl className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="rounded-2xl bg-[#fff] text-[#0d1522] p-6 md:p-8 shadow-[0_30px_60px_-30px_rgba(10,31,68,0.45)]">
            <dt className="sr-only">{s.label}</dt>
            <dd>
              <p className="font-kinetic font-bold text-3xl md:text-4xl lg:text-[2.75rem] leading-none text-[#0052cc]">{s.value}</p>
              <p className="text-sm md:text-base text-[#0d1522]/75 mt-4 max-w-[16rem] leading-snug">{s.label}</p>
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
