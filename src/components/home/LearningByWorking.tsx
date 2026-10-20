import Image from 'next/image';
import Reveal from './Reveal';
import Section from './Section';
import { PHOTOS } from '@/lib/content';

const VALUES = ['Excelencia técnica', 'Gestión y comunicación', 'Ética profesional', 'Sostenibilidad'];

/** Learning by Working · Profesorado: aprendes de quien hace el trabajo cada día. */
export default function LearningByWorking() {
  const p = PHOTOS.auditorio;
  return (
    <Section field="white" id="profesorado" labelledBy="profesorado-title">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
        <Reveal>
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--signal)]">Learning by Working · Profesorado</span>
          <h2 id="profesorado-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.15] mt-4">
            Aprendes de quien <span className="ui-hl">hace el trabajo</span> cada día
          </h2>
          <p className="text-white/60 mt-5 text-base md:text-lg leading-relaxed">
            Nuestros profesores no son académicos: son profesionales de empresas referentes del sector AECO, expertos en lo que enseñan.
            En los másteres presenciales trabajas en empresa desde el primer día.
          </p>
          <p className="text-white/60 mt-4 leading-relaxed">
            Formamos grandes profesionales: la mejor formación técnica, reforzada en gestión y comunicación, con la ética profesional y la
            sostenibilidad siempre presentes.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {VALUES.map((v) => (
              <li key={v} className="rounded-full bg-[#0a1f44] text-[#fff] text-sm font-semibold px-4 py-2">
                {v}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.15} className="overflow-hidden rounded-2xl">
          <Image src={p.src} width={p.width} height={p.height} alt={p.alt} sizes="(min-width: 1024px) 40vw, 100vw" className="w-full h-auto" />
        </Reveal>
      </div>
    </Section>
  );
}
