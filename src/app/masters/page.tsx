import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SubPageShell, PageHero, CtaBand } from '@/components/home/SubPage';
import Section from '@/components/home/Section';
import Reveal, { SectionHead } from '@/components/home/Reveal';
import ComingSoon from '@/components/home/ComingSoon';
import { MASTERS } from '@/lib/masters';
import { CONTACT } from '@/lib/bim';

const TITLE = 'Másteres BIM: presencial y online | IDESIE';
const DESCRIPTION = 'Máster BIM, Máster BIM & Building Engineering y Máster BIM Online: compara duración, metodología, prácticas y salidas, y descubre cómo enseñamos la IA dentro de cada máster.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

const COMPARE = [
  { label: 'Duración', mbim: '10 + 6 meses', mbbe: '10 + 6 meses', online: '12 meses, a tu ritmo' },
  { label: 'Dirigido a', mbim: 'Recién graduados (menores de 30 años o con menos de 3 años de experiencia)', mbbe: 'Recién graduados (menores de 30 años o con menos de 3 años de experiencia)', online: 'Profesionales que buscan flexibilidad horaria' },
  { label: 'Metodología', mbim: 'Presencial: coaching, trabajo y formación', mbbe: 'Presencial: coaching, trabajo y formación', online: 'Online: vídeos, tutorías y documentación' },
  { label: 'Contenidos', mbim: 'Metodología BIM en todas las fases de vida del activo', mbbe: 'BIM aplicado a instalaciones de edificación + gestión de proyectos', online: 'Metodología BIM en todas las fases de vida del activo' },
  { label: 'Prácticas / empleo', mbim: '10 meses + 6 meses de prácticas remuneradas en empresa', mbbe: '10 meses + 6 meses de prácticas remuneradas en empresa', online: 'Bolsa de empleo IDESIE Alumni' },
  { label: 'Certificación', mbim: 'Título propio IDESIE + Cualificam', mbbe: 'Título propio IDESIE', online: 'Título IDESIE' },
];

const GUIDE = [
  { when: 'Eres recién graduado y quieres experiencia laboral', slug: 'mbim', text: 'Los másteres presenciales incluyen prácticas remuneradas en empresa.' },
  { when: 'Te interesan las instalaciones MEP', slug: 'mbbe', text: 'El MBBE se especializa en BIM aplicado a instalaciones de edificación.' },
  { when: 'Trabajas y necesitas flexibilidad', slug: 'mbim-online', text: 'El MBIM Online te permite estudiar a tu ritmo sin dejar tu trabajo actual.' },
] as const;

export default function MastersPage() {
  return (
    <SubPageShell>
      <PageHero
        eyebrow="Másteres · Presencial y online"
        title={
          <>
            Elige el máster que te lleva <span className="ui-hl">a tu puesto</span>
          </>
        }
        lead="Del primer modelo al proyecto que defiendes ante un tribunal. Y con la IA aplicada dentro de cada programa, no como extra."
      />

      <Section field="white" id="programas" labelledBy="programas-title">
        <SectionHead
          eyebrow="Programas"
          title={
            <span id="programas-title">
              Cuatro formas de <span className="ui-hl">formarte</span>
            </span>
          }
        />
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          {Object.values(MASTERS).map((m, i) => (
            <Reveal key={m.slug} delay={i * 0.08} className="h-full">
              <Link
                href={`/masters/${m.slug}`}
                className="group ui-card h-full p-7 md:p-8 flex flex-col gap-3 hover:bg-[#0a1f44] hover:text-[#fff] transition-colors"
              >
                <span className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">{m.mode}</span>
                <h3 className="font-kinetic font-bold text-2xl leading-tight">{m.name}</h3>
                <p className="font-semibold leading-snug">
                  {m.headline.pre} {m.headline.mark}.
                </p>
                <p className="text-sm opacity-80 leading-relaxed">{m.lead}</p>
                <span className="mt-auto pt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--signal)] group-hover:text-[#ffba08]">
                  Ver el máster <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </Reveal>
          ))}
          <Reveal id="mbbe-online" delay={0.32} className="ui-card h-full p-7 md:p-8 flex flex-col gap-3 scroll-mt-28">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60">Online</span>
            <h3 className="font-kinetic font-bold text-2xl leading-tight">Máster BIM & Building Engineering Online</h3>
            <p className="text-sm text-white/70 leading-relaxed">La especialización en instalaciones MEP, en formato 100 % online.</p>
            <ComingSoon className="self-start mt-auto" />
          </Reveal>
        </div>
      </Section>

      <Section field="tint" id="comparativa" labelledBy="comparativa-title">
        <SectionHead
          eyebrow="Comparativa"
          title={
            <span id="comparativa-title">
              Lo que cambia de uno a <span className="ui-hl">otro</span>
            </span>
          }
        />
        <div className="mt-10 overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[44rem] text-left text-[15px] border-separate border-spacing-0">
            <caption className="sr-only">Comparativa de los másteres de IDESIE</caption>
            <thead>
              <tr>
                <th scope="col" className="sr-only">Característica</th>
                {(['mbim', 'mbbe', 'mbim-online'] as const).map((s) => (
                  <th key={s} scope="col" className="bg-[#0a1f44] text-[#fff] font-kinetic font-semibold px-5 py-4 first:rounded-tl-2xl last:rounded-tr-2xl">
                    {MASTERS[s].code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="sr-only">{row.label}</th>
                  {[row.mbim, row.mbbe, row.online].map((cell, i) => (
                    <td key={i} className="bg-[#fff] align-top px-5 py-4 border-t border-[#0a1f44]/10">
                      <span className="block text-xs font-semibold tracking-[0.16em] uppercase text-white/50 mb-1">{row.label}</span>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section field="white" id="guia" labelledBy="guia-title">
        <SectionHead
          eyebrow="Guía rápida"
          title={
            <span id="guia-title">
              ¿No sabes cuál <span className="ui-hl">elegir</span>?
            </span>
          }
        />
        <ul className="mt-10 grid md:grid-cols-3 gap-5">
          {GUIDE.map((g) => (
            <li key={g.slug}>
              <Link href={`/masters/${g.slug}`} className="group ui-card h-full p-7 flex flex-col gap-3 hover:bg-[#0a1f44] hover:text-[#fff] transition-colors">
                <span className="font-kinetic font-semibold text-lg leading-snug">Si {g.when.charAt(0).toLowerCase() + g.when.slice(1)}</span>
                <span className="text-sm opacity-80">{g.text}</span>
                <span className="mt-auto pt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--signal)] group-hover:text-[#ffba08]">
                  {MASTERS[g.slug].name} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand title="¿Necesitas ayuda para elegir?" text="Nuestro equipo te asesora de forma personalizada para encontrar el máster que mejor se adapta a tu perfil." label="Solicitar asesoramiento" />
    </SubPageShell>
  );
}
