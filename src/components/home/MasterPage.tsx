import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import { SubPageShell } from './SubPage';
import Section from './Section';
import Reveal from './Reveal';
import Tile from './Tile';
import { BookCallButton } from './BookCall';
import ModuleExplorer from './ModuleExplorer';
import RhythmToggle from './RhythmToggle';
import MasterHero from './MasterHero';
import AiLab from './AiLab';
import { PHOTOS } from '@/lib/content';
import { MASTERS, MASTER_SLUGS, type Master } from '@/lib/masters';

/** Página de un máster: portada, cifras, ritmo de la semana, recorrido, IA, salida, admisión y cierre. Campos planos a todo el ancho. */
export default function MasterPage({ master }: { master: Master }) {
  const others = MASTER_SLUGS.filter((s) => s !== master.slug).map((s) => MASTERS[s]);
  const online = master.mode === 'Online';

  return (
    <SubPageShell>
      <MasterHero master={master} />

      <section aria-label="El máster en cifras" className="field-blue px-4 md:px-6 py-14 md:py-20">
        <dl className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {master.facts.map((f, i) => (
            <Tile key={f.label} delay={i * 0.09} className={`p-6 md:p-7 ${i % 2 ? 'bg-[#fff] text-[#0a1f44]' : 'bg-[#0a1f44] text-[#fff]'}`}>
              <dd className="font-kinetic font-bold text-[clamp(1.6rem,2.8vw,2.4rem)] leading-none whitespace-nowrap">{f.value}</dd>
              <dt className="mt-4 text-base leading-snug opacity-90">{f.label}</dt>
            </Tile>
          ))}
        </dl>
      </section>

      <RhythmToggle title={master.method.title} lead={master.method.lead} columns={master.method.columns} online={online} />

      <Section field="white" id="como" labelledBy="como-title" className="!py-16 md:!py-24">
        <h2 id="como-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12] max-w-3xl">
          {online ? 'Lo que llevas incluido' : 'Cómo avanzas, paso a paso'}
        </h2>
        <ol className="mt-12 grid md:grid-cols-3 gap-4">
          {master.method.steps.map((st, i) => (
            <Tile as="li" key={st.title} delay={i * 0.12} className="bg-[var(--card)] p-7 md:p-8">
              <h3 className="font-kinetic font-bold text-xl md:text-2xl leading-snug">{st.title}</h3>
              <p className="text-white/60 leading-relaxed mt-3">{st.text}</p>
              <span className="absolute left-0 bottom-0 h-1.5 bg-[#0063e6] w-1/3 transition-all duration-500 group-hover:w-full" aria-hidden="true" />
            </Tile>
          ))}
        </ol>
      </Section>

      <Section field="tint" id="recorrido" labelledBy="recorrido-title">
        <Reveal className="max-w-4xl">
          <h2 id="recorrido-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
            {master.modules.length} módulos, <span className="ui-hl">una sola obra</span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 mt-6 max-w-2xl leading-relaxed">
            Cada módulo es una planta más del mismo edificio, de los cimientos al proyecto que defiendes. Pulsa una planta para ver qué haces en ella.
          </p>
        </Reveal>
        <div className="mt-12">
          <ModuleExplorer master={master} />
        </div>
      </Section>

      <AiLab masterName={master.name} kind={master.ai.kind} where={master.ai.where} />

      <Section field="white" id="salida" labelledBy="salida-title">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-start">
          <Reveal>
            <h2 id="salida-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12]">
              {master.outcomes.title}
            </h2>
            <div className="mt-10 space-y-8">
              {master.outcomes.stats.map((s) => (
                <div key={s.text}>
                  <p className="font-kinetic font-bold text-[clamp(3rem,8vw,6rem)] leading-none text-[var(--signal)]">{s.value}</p>
                  <p className="text-lg text-white/60 leading-snug mt-3 max-w-md">{s.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {master.outcomes.roles.map((r, i) => (
                <Tile as="li" key={r.role} delay={i * 0.08} className={`p-6 flex flex-col justify-between gap-6 min-h-44 ${i === 0 || i === 3 ? 'bg-[#0a1f44] text-[#fff]' : 'bg-[#e9f0fc] text-[#0a1f44]'}`}>
                  <div>
                    <h3 className="font-kinetic font-bold text-xl leading-snug">{r.role}</h3>
                    <p className="mt-1 opacity-80">{r.focus}</p>
                  </div>
                  <p className={`font-kinetic font-bold text-lg ${i === 0 || i === 3 ? 'text-[#7db4ff]' : 'text-[#0063e6]'}`}>
                    {r.salary}
                    <span className="block text-sm font-sans font-normal opacity-80">bruto anual</span>
                  </p>
                </Tile>
              ))}
            </ul>
            <p className="text-white/60 mt-5 max-w-xl">{master.outcomes.note}</p>
          </div>
        </div>
      </Section>

      <section id="certificacion" aria-labelledby="cert-title" className="field-tint px-4 md:px-6 py-20 md:py-28 scroll-mt-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          <Reveal>
            <h2 id="cert-title" className="font-kinetic font-bold text-3xl md:text-4xl leading-[1.15]">
              {master.certification.title}
            </h2>
            <p className="text-lg text-white/60 leading-relaxed mt-6 max-w-2xl">{master.certification.text}</p>
            <ul className="mt-10 grid sm:grid-cols-3 gap-3">
              {master.certification.items.map((it, i) => (
                <Tile as="li" key={it.title} delay={i * 0.1} className={`p-5 ${['bg-[#0063e6] text-[#fff]', 'bg-[#fff] text-[#0a1f44]', 'bg-[#0a1f44] text-[#fff]'][i % 3]}`}>
                  <h3 className="font-kinetic font-bold text-lg leading-snug">{it.title}</h3>
                  <p className="leading-snug mt-2 text-[15px] opacity-85">{it.text}</p>
                </Tile>
              ))}
            </ul>
          </Reveal>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <Image src={PHOTOS.auditorio.src} alt={PHOTOS.auditorio.alt} fill sizes="(min-width: 1024px) 40vw, 92vw" className="object-cover" />
          </div>
        </div>
      </section>

      <Section field="white" id="admision" labelledBy="admision-title">
        <div className="grid lg:grid-cols-[0.9fr_1.2fr] gap-12 lg:gap-16 items-start">
          <Reveal>
            <h2 id="admision-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12]">
              ¿Encajas en el <span className="ui-hl">{master.code}</span>?
            </h2>
            <p className="text-lg text-white/60 leading-relaxed mt-5">Estos son los requisitos. Si dudas, te decimos con franqueza si encaja contigo.</p>
            <ul className="mt-8 space-y-3">
              {master.requirements.map((r) => (
                <li key={r} className="flex gap-3 text-base leading-snug">
                  <span className="mt-2 w-2 h-2 rounded-full bg-[#0063e6] shrink-0" aria-hidden="true" />
                  {r}
                </li>
              ))}
            </ul>
            <BookCallButton pack={`${master.name} · admisión`} className="btn btn-blue mt-9 w-fit">
              Solicitar admisión
              <span className="btn-dot bg-[#fff]/20">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </BookCallButton>
          </Reveal>

          <div className="space-y-2.5">
            {master.faqs.map((f) => (
              <details key={f.q} name="faq" className="group rounded-2xl bg-[var(--card)] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center gap-4 cursor-pointer px-5 md:px-6 py-4 md:py-5 min-h-16 font-semibold text-base md:text-lg leading-snug">
                  <span className="flex-1">{f.q}</span>
                  <span className="w-9 h-9 shrink-0 rounded-full bg-[#0a1f44] text-[#fff] grid place-items-center transition-transform duration-300 group-open:rotate-45">
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  </span>
                </summary>
                <p className="px-5 md:px-6 pb-5 text-white/60 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      <section className="field-navy px-4 md:px-6 py-20 md:py-28" aria-labelledby="cta-title">
        <div className="max-w-6xl mx-auto">
          <h2 id="cta-title" className="font-kinetic font-bold text-2xl md:text-4xl leading-[1.15] max-w-3xl">
            ¿Listo para el {master.code}? Te decimos con franqueza si encaja contigo.
          </h2>
          <BookCallButton
            pack={master.name}
            className="group mt-8 inline-flex items-center gap-4 md:gap-6 font-kinetic font-bold text-[clamp(3.25rem,13vw,10rem)] leading-none text-[#fff] hover:text-[#7db4ff] transition-colors cursor-pointer text-left"
          >
            Empezar
            <ArrowRight className="w-[0.6em] h-[0.6em] transition-transform duration-300 group-hover:translate-x-2" aria-hidden="true" />
          </BookCallButton>
          <p className="mt-12 text-[#c9d9f0]">
            Otros másteres:{' '}
            {others.map((o, i) => (
              <span key={o.slug}>
                {i > 0 && ' · '}
                <Link href={`/masters/${o.slug}`} className="font-semibold text-[#fff] underline underline-offset-4 decoration-2 hover:text-[#7db4ff] transition-colors">
                  {o.name}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </section>
    </SubPageShell>
  );
}
