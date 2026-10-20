import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { SubPageShell } from './SubPage';
import Section from './Section';
import Reveal from './Reveal';
import Tile from './Tile';
import { BookCallButton } from './BookCall';
import ProfilesHero from './ProfilesHero';
import ProfileStudio from './ProfileStudio';
import { CONTACT, PROFILES } from '@/lib/bim';

const CERT = PROFILES.filter((p) => p.certifiable);
const PATHS = PROFILES.filter((p) => !p.certifiable);
const TONES = ['bg-[#0a1f44] text-[#fff]', 'bg-[#0052cc] text-[#fff]', 'bg-[#fff] text-[#0a1f44]'];

/** Página de perfiles profesionales: portada con constelación, mapa interactivo, certificables, itinerarios y cierre. */
export default function ProfilesPage() {
  return (
    <SubPageShell>
      <ProfilesHero />

      <Section field="tint" id="mapa" labelledBy="mapa-title">
        <Reveal className="max-w-4xl mb-12">
          <h2 id="mapa-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
            Tu mapa, <span className="ui-hl">a tu medida</span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 leading-relaxed mt-6 max-w-2xl">
            Elige el perfil al que quieres llegar y marca las microcredenciales que ya tienes. Verás al instante cuánto te falta y qué perfil te queda más cerca.
          </p>
        </Reveal>
        <ProfileStudio />
      </Section>

      <section id="certificables" className="field-blue px-4 md:px-6 py-20 md:py-28 scroll-mt-24" aria-labelledby="cert-prof-title">
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-4xl">
            <h2 id="cert-prof-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
              Tres perfiles que <span className="ui-hl">certifica AECOMI</span>
            </h2>
            <p className="text-lg md:text-xl leading-relaxed mt-6 max-w-2xl text-[#fff]/90">
              IDESIE te forma y AECOMI certifica tu perfil. Cada uno exige experiencia profesional, que puedes ganar con el simulador.
            </p>
          </Reveal>
          <ul className="mt-12 grid md:grid-cols-3 gap-3">
            {CERT.map((p, i) => (
              <Tile as="li" key={p.code} delay={i * 0.1} className={`${TONES[i % 3]} p-7 md:p-8 min-h-80 flex flex-col`}>
                <h3 className="font-kinetic font-bold text-2xl leading-snug">{p.name}</h3>
                <p className="mt-4 leading-relaxed opacity-90">{p.desc}</p>
                <p className="mt-auto pt-6 font-semibold">Experiencia: {p.experience}</p>
                <p className="opacity-85">{p.count} microcredenciales · {p.ects} ECTS</p>
                <Link href={`/perfiles/${p.code.toLowerCase()}`} className="group mt-5 inline-flex items-center gap-2 font-semibold underline underline-offset-[6px] decoration-2">
                  Ver su mapa
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </Tile>
            ))}
          </ul>
          <p className="mt-6 text-sm text-[#fff]/85">
            Requisitos y proceso de certificación en{' '}
            <a href={CONTACT.aecomiUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              aecomi.org ↗
            </a>
            . La formación no es requisito ni garantía de aprobar.
          </p>
        </div>
      </section>

      <Section field="white" id="itinerarios" labelledBy="itin-title">
        <Reveal className="max-w-4xl">
          <h2 id="itin-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
            Itinerarios formativos
          </h2>
          <p className="text-lg md:text-xl text-white/60 leading-relaxed mt-6 max-w-2xl">
            Perfiles sin certificación AECOMI por ahora: el mapa acredita tu formación y te marca el camino.
          </p>
        </Reveal>
        <ul className="mt-12 grid sm:grid-cols-2 gap-3">
          {PATHS.map((p, i) => (
            <Tile as="li" key={p.code} delay={i * 0.08} className={`p-7 md:p-8 min-h-56 flex flex-col ${i % 3 === 0 ? 'bg-[#e9f0fc]' : i % 3 === 1 ? 'bg-[#0a1f44] text-[#fff]' : 'bg-[#e9f0fc]'}`}>
              <h3 className="font-kinetic font-bold text-2xl leading-snug">{p.name}</h3>
              <p className="mt-3 leading-relaxed opacity-85">{p.desc}</p>
              <Link href={`/perfiles/${p.code.toLowerCase()}`} className="group mt-auto pt-5 inline-flex items-center gap-2 font-semibold underline underline-offset-[6px] decoration-2 w-fit">
                {p.count} microcredenciales · {p.ects} ECTS
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </Tile>
          ))}
        </ul>
      </Section>

      <section className="field-navy px-4 md:px-6 py-20 md:py-28" aria-labelledby="cta-perf-title">
        <div className="max-w-6xl mx-auto">
          <h2 id="cta-perf-title" className="font-kinetic font-bold text-2xl md:text-4xl leading-[1.15] max-w-3xl">
            ¿No sabes qué perfil te conviene? Cuéntanos de dónde vienes y te orientamos.
          </h2>
          <BookCallButton
            pack="Perfiles profesionales · orientación"
            className="group mt-8 inline-flex items-center gap-4 md:gap-6 font-kinetic font-bold text-[clamp(3rem,12vw,9rem)] leading-none text-[#fff] hover:text-[#7db4ff] transition-colors cursor-pointer text-left"
          >
            Orientarme
            <ArrowUpRight className="w-[0.6em] h-[0.6em] transition-transform duration-300 group-hover:translate-x-2 group-hover:-translate-y-2" aria-hidden="true" />
          </BookCallButton>
        </div>
      </section>
    </SubPageShell>
  );
}
