import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import Section from './Section';
import Reveal, { SectionHead } from './Reveal';
import Tile from './Tile';
import LogoTile from './LogoTile';
import type { MasterExtras } from '@/lib/masters';

type X = Required<MasterExtras>;

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--signal)]">{children}</span>
);

/** «Prueba, no promesa»: la IA que modela, en tres verbos y una frase. */
export function AiProof({ data }: { data: X['aiProof'] }) {
  return (
    <Section field="navy" id="ia" labelledBy="ia-title">
      <Reveal className="max-w-4xl">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <h2 id="ia-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1] mt-4">
          {data.title.pre} <span className="ui-hl">{data.title.mark}</span>.
        </h2>
        <p className="text-[#c9d9f0] mt-6 text-lg md:text-xl leading-relaxed max-w-3xl">{data.lead}</p>
      </Reveal>
      <ol className="mt-12 grid md:grid-cols-3 gap-4">
        {data.pillars.map((p, i) => (
          <Tile as="li" key={p.title} delay={i * 0.1} className={`p-7 md:p-8 ${i === 1 ? 'bg-[#0063e6] text-[#fff]' : 'bg-[var(--card)]'}`}>
            <p className={`text-sm font-semibold ${i === 1 ? 'text-[#fff]/85' : 'text-[#7db4ff]'}`}>{p.kicker}</p>
            <h3 className="font-kinetic font-bold text-xl md:text-2xl leading-snug mt-3">{p.title}</h3>
            <p className={`leading-relaxed mt-3 ${i === 1 ? 'text-[#fff]/90' : 'text-[#c9d9f0]'}`}>{p.text}</p>
          </Tile>
        ))}
      </ol>
      <Reveal className="mt-14">
        <blockquote className="font-kinetic font-bold text-2xl md:text-4xl leading-[1.2] max-w-4xl border-l-4 border-[#0063e6] pl-6 md:pl-8">
          “{data.quote}”
        </blockquote>
      </Reveal>
    </Section>
  );
}

/** El proyecto real del curso: ficha a la izquierda, los cuatro procesos en los que participas a la derecha. */
export function RealProject({ data }: { data: X['realProject'] }) {
  return (
    <Section field="white" id="proyecto" labelledBy="proyecto-title">
      <SectionHead eyebrow={data.eyebrow} title={<span id="proyecto-title">{data.title}</span>} lead={data.lead} />
      <div className="mt-12 grid lg:grid-cols-[0.85fr_1.15fr] gap-4 lg:gap-6 items-stretch">
        <Tile className="bg-[#0a1f44] text-[#fff] p-7 md:p-9">
          <p className="text-sm font-semibold text-[#7db4ff]">Proyecto del curso</p>
          <h3 className="font-kinetic font-bold text-3xl md:text-4xl leading-tight mt-3">{data.name}</h3>
          <dl className="mt-8 space-y-5">
            {data.specs.map((s) => (
              <div key={s.label} className="border-t border-[#fff]/15 pt-4">
                <dt className="text-sm text-[#c9d9f0]">{s.label}</dt>
                <dd className="font-semibold text-lg leading-snug mt-1">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Tile>
        <ol className="grid sm:grid-cols-2 gap-4">
          {data.steps.map((st, i) => (
            <Tile as="li" key={st.title} delay={i * 0.08} className="bg-[var(--card)] p-6 md:p-7">
              <p className="font-kinetic font-bold text-[#0063e6] text-lg">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="font-kinetic font-bold text-xl leading-snug mt-3">{st.title}</h3>
              <p className="text-white/60 leading-relaxed mt-2">{st.text}</p>
              <span className="absolute left-0 bottom-0 h-1.5 bg-[#0063e6] w-1/3 transition-all duration-500 group-hover:w-full" aria-hidden="true" />
            </Tile>
          ))}
        </ol>
      </div>
      <Reveal className="mt-10">
        <p className="font-semibold text-lg md:text-xl max-w-3xl">{data.note}</p>
      </Reveal>
    </Section>
  );
}

/** Desde 2011: las empresas que contratan y recomiendan, y los tres hitos del máster. */
export function Legacy({ data }: { data: X['legacy'] }) {
  const half = Math.ceil(data.logos.length / 2);
  const rows = [data.logos.slice(0, half), data.logos.slice(half)];
  return (
    <section id="trayectoria" aria-labelledby="trayectoria-title" className="field-tint py-20 md:py-28 scroll-mt-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <SectionHead eyebrow={data.eyebrow} title={<span id="trayectoria-title">{data.title}</span>} lead={data.lead} />
      </div>
      <div className="mt-12 space-y-4" role="list" aria-label={data.logosCaption}>
        {rows.map((row, r) => (
          <div key={r} className="marquee">
            <div className={`marquee-track ${r ? 'rev' : ''}`}>
              {[0, 1].map((copy) =>
                row.map((l) => (
                  <div
                    key={`${copy}-${l.name}`}
                    role={copy ? undefined : 'listitem'}
                    aria-hidden={copy ? true : undefined}
                    className={copy ? 'marquee-dup' : ''}
                  >
                    <LogoTile logo={l} className="w-48 md:w-56 shrink-0" />
                  </div>
                )),
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <p className="mt-5 text-white/60">{data.logosCaption}</p>
        <div className="mt-14 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-center">
          <div className="relative aspect-[3/2] rounded-2xl overflow-hidden">
            <Image
              src="/img/mbim/grupo.jpg"
              alt="Promoción de alumnos del Máster BIM de IDESIE"
              fill
              sizes="(min-width: 1024px) 40vw, 92vw"
              className="object-cover"
            />
          </div>
          <ol className="space-y-6">
            {data.milestones.map((m, i) => (
              <Reveal key={m.year} delay={i * 0.08}>
                <li className="grid grid-cols-[5.5rem_1fr] md:grid-cols-[7rem_1fr] gap-4 items-baseline border-t border-[#0a1f44]/15 pt-5">
                  <span className="font-kinetic font-bold text-3xl md:text-4xl text-[#0063e6]">{m.year}</span>
                  <span className="text-lg leading-snug">{m.text}</span>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** Certificaciones y avales, con el certificado Cualificam a la vista y su enlace de verificación. */
export function Endorsements({ data }: { data: X['endorsements'] }) {
  return (
    <section id="certificacion" aria-labelledby="cert-title" className="field-white px-4 md:px-6 py-20 md:py-28 scroll-mt-24">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-start">
        <div>
          <Reveal>
            <h2 id="cert-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12]">
              {data.title}
            </h2>
            <p className="text-lg text-white/60 leading-relaxed mt-6 max-w-2xl">{data.lead}</p>
          </Reveal>
          <ul className="mt-10 grid sm:grid-cols-2 gap-3">
            {data.items.map((it, i) => (
              <Tile as="li" key={it.name} delay={i * 0.08} className="bg-[var(--card)] p-6 flex flex-col gap-4">
                <div className="h-12 flex items-center">
                  <Image
                    src={it.logo.src}
                    alt={it.name}
                    width={it.logo.width}
                    height={it.logo.height}
                    className="w-auto h-auto max-h-12 max-w-[10rem] object-contain"
                  />
                </div>
                <p className="leading-snug">{it.text}</p>
                <a
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-[#0063e6] underline underline-offset-4 decoration-2 hover:text-[#0a1f44] transition-colors w-fit"
                >
                  {it.url.replace('https://', '')}
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </Tile>
            ))}
          </ul>
        </div>
        <Reveal delay={0.1}>
          <figure className="rounded-2xl bg-[#e9f0fc] p-4 md:p-5">
            <a
              href={data.certificate.src}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl overflow-hidden ring-1 ring-[#0a1f44]/10 bg-[#fff]"
            >
              <Image
                src={data.certificate.src}
                alt="Certificado Cualificam del Máster BIM de IDESIE"
                width={1000}
                height={1414}
                sizes="(min-width: 1024px) 34vw, 92vw"
                className="w-full h-auto"
              />
            </a>
            <figcaption className="mt-4 text-sm leading-snug text-[#0a1f44]/75">
              {data.certificate.caption}
              <a
                href={data.certificate.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1 font-semibold text-[#0063e6] underline underline-offset-4 decoration-2 hover:text-[#0a1f44] transition-colors w-fit"
              >
                Verificar autenticidad en madri+d
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

/** Claustro: foto, nombre, cargo y empresa, y qué enseña en el máster. */
export function Faculty({ data }: { data: X['faculty'] }) {
  return (
    <Section field="white" id="profesores" labelledBy="profesores-title">
      <Reveal className="max-w-4xl">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <h2 id="profesores-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12] mt-4">
          {data.title.pre} <span className="ui-hl">{data.title.mark}</span>.
        </h2>
        <p className="text-lg text-white/60 leading-relaxed mt-6 max-w-2xl">{data.lead}</p>
      </Reveal>
      <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.people.map((p, i) => (
          <Tile as="li" key={p.name} delay={(i % 3) * 0.08} className="bg-[var(--card)] p-6 md:p-7 flex flex-col">
            <div className="flex items-center gap-4">
              {p.photo ? (
                <Image src={p.photo} alt="" width={480} height={480} sizes="64px" className="w-16 h-16 rounded-full object-cover shrink-0" />
              ) : (
                <span
                  className="w-16 h-16 rounded-full bg-[#0a1f44] text-[#fff] grid place-items-center font-kinetic font-bold text-lg shrink-0"
                  aria-hidden="true"
                >
                  {initials(p.name)}
                </span>
              )}
              <div>
                <h3 className="font-kinetic font-bold text-lg leading-snug">
                  {p.linkedin ? (
                    <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[#0063e6] transition-colors">
                      {p.name}
                    </a>
                  ) : (
                    p.name
                  )}
                </h3>
                <p className="text-sm font-semibold text-[#0063e6] leading-snug mt-0.5">{p.company}</p>
              </div>
            </div>
            <p className="text-white/60 leading-snug mt-4">{p.role}</p>
            <p className="mt-5 pt-4 border-t border-[#0a1f44]/10 leading-snug">
              <span className="block text-sm font-semibold text-white/50">En el máster</span>
              {p.teaches}
            </p>
          </Tile>
        ))}
      </ul>
    </Section>
  );
}

/** El perfil que se forma: cuatro competencias y la idea de portfolio en vez de expediente. */
export function Profile({ data }: { data: X['profile'] }) {
  return (
    <section id="perfil" aria-labelledby="perfil-title" className="field-blue px-4 md:px-6 py-20 md:py-28 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <Reveal className="max-w-4xl">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <h2 id="perfil-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12] mt-4">
            {data.title}
          </h2>
          <p className="text-lg md:text-xl leading-relaxed mt-6 max-w-3xl opacity-90">{data.lead}</p>
        </Reveal>
        <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {data.skills.map((s, i) => (
            <Tile as="li" key={s.title} delay={i * 0.09} className={`p-6 md:p-7 ${i % 2 ? 'bg-[#fff] text-[#0a1f44]' : 'bg-[#0a1f44] text-[#fff]'}`}>
              <p className="text-sm font-semibold opacity-70">Competencia {i + 1}</p>
              <h3 className="font-kinetic font-bold text-xl md:text-2xl leading-snug mt-3">{s.title}</h3>
              <p className="leading-snug mt-3 opacity-90">{s.text}</p>
            </Tile>
          ))}
        </ol>
        <Reveal className="mt-14 max-w-3xl">
          <h3 className="font-kinetic font-bold text-2xl md:text-3xl leading-snug">{data.closing.title}</h3>
          <p className="text-lg leading-relaxed mt-4 opacity-90">{data.closing.text}</p>
          <p className="font-semibold text-lg mt-3">{data.closing.punch}</p>
        </Reveal>
      </div>
    </section>
  );
}
