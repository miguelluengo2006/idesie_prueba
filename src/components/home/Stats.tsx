import Reveal from './Reveal';

const STATS = [
  { value: '1.000+', label: 'alumnos formados' },
  { value: '100%', label: 'inserción laboral' },
  { value: '~50', label: 'empresas colaboradoras' },
  { value: '1.º', label: 'Máster BIM con sello CUALIFICAM', accent: true },
];

export default function Stats() {
  return (
    <section aria-label="IDESIE en cifras" className="px-4 md:px-6 py-10 md:py-12">
      <dl className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <dt className="sr-only">{s.label}</dt>
            <dd>
              <p className={`font-kinetic font-black text-3xl md:text-4xl ${s.accent ? 'text-[var(--signal)]' : ''}`}>{s.value}</p>
              <p className="text-sm text-white/60 mt-1.5 max-w-[16rem]">{s.label}</p>
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
