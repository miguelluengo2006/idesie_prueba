import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { SubPageShell } from './SubPage';
import Section from './Section';
import Reveal from './Reveal';
import Tile from './Tile';
import { BookCallButton } from './BookCall';
import CertHero from './CertHero';
import CertCompare from './CertCompare';
import CertSteps from './CertSteps';
import { CONTACT, PROFILES, formatEuro } from '@/lib/bim';
import { SIMULATOR } from '@/lib/content';
import JsonLd from '@/components/JsonLd';
import { faqJsonLd } from '@/lib/seo';

const CERT = PROFILES.filter((p) => p.certifiable);
const NOW = [
  { t: 'Las empresas buscan competencias', x: 'Ya no basta con el currículum. Necesitan saber que el profesional domina las funciones del puesto desde el primer día.' },
  { t: 'Concursos y licitaciones lo exigen', x: 'Cada vez más proyectos, especialmente los licitados por las administraciones públicas, piden acreditar los perfiles del equipo.' },
  { t: 'Un estándar internacional', x: 'Certificación conforme a la norma ISO/IEC 17024: comparable y reconocible en cualquier país y mercado.' },
];
const CARD = [
  { t: 'Digital y verificable', x: 'Cualquier empresa puede comprobarlo en el registro público de AECOMI.' },
  { t: 'Independiente', x: 'Lo emite AECOMI, entidad certificadora independiente de quien te forma.' },
  { t: 'Vivo', x: 'Vigente 3 años y renovable, para que tus competencias estén siempre al día.' },
  { t: 'Internacional', x: 'Conforme a ISO/IEC 17024. Acreditación ENAC de AECOMI en curso.' },
];
const FAQS = [
  { q: '¿En qué se diferencia de un título?', a: 'El título acredita la formación que has cursado. El certificado profesional acredita que tienes las competencias para desempeñar un puesto concreto: formación y experiencia, evaluadas de forma independiente.' },
  { q: '¿Quién emite el certificado?', a: 'AECOMI, entidad independiente especializada en certificar perfiles profesionales del sector AECO. IDESIE forma; AECOMI certifica.' },
  { q: '¿Tengo que formarme en IDESIE para certificarme?', a: 'No. Cualquier profesional que cumpla los requisitos puede presentarse. Formarte en IDESIE, entidad formativa acreditada por AECOMI, te asegura una formación alineada con cada perfil. La formación no es requisito ni garantía de aprobar.' },
  { q: '¿Y si no tengo experiencia profesional?', a: 'Puedes adquirirla con la metodología Learning by Working de nuestros másteres presenciales o con el simulador profesional.' },
  { q: '¿Cuánto tiempo es válido?', a: 'Tres años, con renovación periódica para mantener tus competencias actualizadas.' },
];

/** Página de certificación profesional: carnet digital interactivo, quién forma y quién certifica, ayer/hoy, cuatro pasos y perfiles. */
export default function CertPage() {
  return (
    <SubPageShell>
      <JsonLd data={faqJsonLd(FAQS)} />
      <CertHero />

      <section className="field-blue px-4 md:px-6 py-20 md:py-28" aria-labelledby="dos-title">
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-4xl">
            <h2 id="dos-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
              IDESIE forma. <span className="ui-hl">AECOMI certifica.</span>
            </h2>
            <p className="text-lg md:text-xl leading-relaxed mt-6 max-w-2xl text-[#fff]/90">Dos entidades, un mismo objetivo: que demuestres lo que sabes hacer.</p>
          </Reveal>
          <div className="mt-12 grid md:grid-cols-2 gap-3">
            <Tile className="bg-[#0a1f44] text-[#fff] p-7 md:p-10">
              <h3 className="font-kinetic font-bold text-2xl md:text-3xl">IDESIE forma</h3>
              <p className="font-semibold mt-2 text-[#c9d9f0]">Entidad formativa acreditada por AECOMI</p>
              <ul className="mt-6 space-y-3 leading-snug">
                {['Formación en las competencias que exige cada perfil', 'Microcredenciales y másteres con certificación universitaria', 'Experiencia con Learning by Working y el simulador profesional'].map((t) => (
                  <li key={t} className="flex gap-3"><span className="mt-2 w-2 h-2 rounded-full bg-[#4d94ff] shrink-0" aria-hidden="true" />{t}</li>
                ))}
              </ul>
            </Tile>
            <Tile delay={0.1} className="bg-[#fff] text-[#0a1f44] p-7 md:p-10">
              <h3 className="font-kinetic font-bold text-2xl md:text-3xl">AECOMI certifica</h3>
              <p className="font-semibold mt-2 text-[#0a1f44]/70">Entidad certificadora independiente</p>
              <ul className="mt-6 space-y-3 leading-snug">
                {['Evalúa tus competencias de forma independiente', 'Emite el certificado profesional conforme a ISO/IEC 17024', 'Lo publica en un registro verificable por cualquier empresa'].map((t) => (
                  <li key={t} className="flex gap-3"><span className="mt-2 w-2 h-2 rounded-full bg-[#0063e6] shrink-0" aria-hidden="true" />{t}</li>
                ))}
              </ul>
              <a href={CONTACT.aecomiUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block font-semibold underline underline-offset-[6px] decoration-2">aecomi.org ↗</a>
            </Tile>
          </div>
        </div>
      </section>

      <Section field="tint" id="ayer-hoy" labelledBy="ayer-title">
        <Reveal className="max-w-4xl mb-10">
          <h2 id="ayer-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
            Del título al <span className="ui-hl">certificado</span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 leading-relaxed mt-6 max-w-2xl">
            Un título dice lo que estudiaste; un certificado demuestra lo que sabes hacer. El sector está cambiando cómo contrata.
          </p>
        </Reveal>
        <CertCompare />
        <ul className="mt-8 grid md:grid-cols-3 gap-3">
          {NOW.map((n, i) => (
            <Tile as="li" key={n.t} delay={i * 0.1} className={`p-7 min-h-52 flex flex-col ${['bg-[#0a1f44] text-[#fff]', 'bg-[#fff]', 'bg-[#0063e6] text-[#fff]'][i]}`}>
              <h3 className="font-kinetic font-bold text-xl leading-snug">{n.t}</h3>
              <p className="mt-auto pt-5 leading-snug opacity-90">{n.x}</p>
            </Tile>
          ))}
        </ul>
      </Section>

      <Section field="white" id="pasos" labelledBy="pasos-title">
        <Reveal className="max-w-4xl">
          <h2 id="pasos-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
            Cuatro pasos hasta tu <span className="ui-hl">certificado</span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 leading-relaxed mt-6 max-w-2xl">No tienes que certificarte ya. Sabrás desde el principio qué te falta y podrás planificar tu ruta.</p>
        </Reveal>
        <div className="mt-6">
          <CertSteps />
        </div>
      </Section>

      <section id="que-es" className="field-navy px-4 md:px-6 py-20 md:py-28" aria-labelledby="que-es-title">
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-4xl">
            <h2 id="que-es-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">Qué es tu carnet</h2>
          </Reveal>
          <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CARD.map((c, i) => (
              <Tile as="li" key={c.t} delay={i * 0.08} className={`p-7 min-h-56 flex flex-col ${['bg-[#0063e6]', 'bg-[#123069]', 'bg-[#fff] text-[#0a1f44]', 'bg-[#0052cc]'][i]}`}>
                <h3 className="font-kinetic font-bold text-xl leading-snug">{c.t}</h3>
                <p className="mt-auto pt-5 leading-snug opacity-90">{c.x}</p>
              </Tile>
            ))}
          </ul>
        </div>
      </section>

      <Section field="tint" id="perfiles" labelledBy="perf-title">
        <Reveal className="max-w-4xl">
          <h2 id="perf-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">Tres perfiles para todo el ciclo de vida BIM</h2>
          <p className="text-lg text-white/60 mt-6 max-w-2xl leading-relaxed">Y más perfiles en camino: cada nuevo perfil que definamos con las empresas tendrá su mapa y su certificación.</p>
        </Reveal>
        <ul className="mt-12 grid md:grid-cols-3 gap-3">
          {CERT.map((p, i) => (
            <Tile as="li" key={p.code} delay={i * 0.1} className={`p-7 md:p-8 min-h-80 flex flex-col ${['bg-[#0a1f44] text-[#fff]', 'bg-[#0063e6] text-[#fff]', 'bg-[#fff]'][i]}`}>
              <h3 className="font-kinetic font-bold text-2xl leading-snug">{p.name}</h3>
              <p className="mt-4 leading-relaxed opacity-90">{p.desc}</p>
              <p className="mt-auto pt-6 font-semibold">{p.count} microcredenciales · {p.ects} ECTS · {formatEuro(p.price)}</p>
              <p className="opacity-85">Experiencia: {p.experience}</p>
              <Link href={`/perfiles/${p.code.toLowerCase()}`} className="group mt-4 inline-flex items-center gap-2 font-semibold underline underline-offset-[6px] decoration-2 w-fit">
                Ver el mapa de competencias
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </Tile>
          ))}
        </ul>
        <Tile className="mt-3 bg-[#0052cc] text-[#fff] p-7 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <h3 className="font-kinetic font-bold text-2xl md:text-3xl leading-snug">¿Aún no tienes experiencia? El simulador profesional te la da.</h3>
            <p className="mt-3 leading-relaxed opacity-90">Un proyecto completo con empresas reales como cliente, diseñado para convalidarse en la certificación.* </p>
            <p className="mt-2 text-sm opacity-85">* {SIMULATOR.convalidationNote}</p>
          </div>
          <Link href="/simulador" className="btn btn-ghost shrink-0 w-fit">Conoce el simulador</Link>
        </Tile>
      </Section>

      <Section field="white" id="faq" labelledBy="faq-cert-title">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16 items-start">
          <Reveal>
            <h2 id="faq-cert-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12]">Lo que necesitas saber</h2>
          </Reveal>
          <div className="space-y-2.5">
            {FAQS.map((f) => (
              <details key={f.q} name="cert-faq" className="group rounded-2xl bg-[var(--card)] [&_summary::-webkit-details-marker]:hidden">
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

      <section className="field-navy px-4 md:px-6 py-20 md:py-28" aria-labelledby="cta-cert-title">
        <div className="max-w-6xl mx-auto">
          <h2 id="cta-cert-title" className="font-kinetic font-bold text-2xl md:text-4xl leading-[1.15] max-w-3xl">Diseña tu ruta hacia tu certificado profesional.</h2>
          <BookCallButton
            pack="Certificación profesional · orientación"
            className="group mt-8 inline-flex items-center gap-4 md:gap-6 font-kinetic font-bold text-[clamp(3rem,12vw,9rem)] leading-none text-[#fff] hover:text-[#7db4ff] transition-colors cursor-pointer text-left"
          >
            Orientarme
            <ArrowRight className="w-[0.6em] h-[0.6em] transition-transform duration-300 group-hover:translate-x-2" aria-hidden="true" />
          </BookCallButton>
          <p className="mt-8 text-[#c9d9f0]">
            Requisitos, proceso y tarifas, en{' '}
            <a href={CONTACT.aecomiUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#fff] underline underline-offset-4 decoration-2">aecomi.org ↗</a>
          </p>
        </div>
      </section>
    </SubPageShell>
  );
}
