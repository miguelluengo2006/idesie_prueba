import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Plus } from 'lucide-react';
import SiteHeader from '@/components/home/SiteHeader';
import SiteFooter from '@/components/home/SiteFooter';
import { BookCallButton, BookCallProvider } from '@/components/home/BookCall';
import {
  CONTACT,
  MASTER_PRICE_ONLINE,
  PRICE_PER_ECTS,
  PROFILES,
  TOTAL_MICROS,
  formatEuro,
  getProfile,
  groupByArea,
} from '@/lib/bim';

type Params = { codigo: string };

// Solo existen los perfiles del catálogo: cualquier otro código es un 404 real (no una página vacía con 200)
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return PROFILES.map((p) => ({ codigo: p.code.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const profile = getProfile((await params).codigo);
  if (!profile) return {};
  const title = `${profile.name} — mapa formativo`;
  const description = `${profile.desc} ${profile.count} microcredenciales · ${profile.ects} ECTS · ${formatEuro(profile.price)} módulo a módulo.`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', siteName: CONTACT.name, locale: 'es_ES' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ProfilePage({ params }: { params: Promise<Params> }) {
  const profile = getProfile((await params).codigo);
  if (!profile) notFound();

  const groups = groupByArea(profile.microList);
  const isFullMaster = profile.count === TOTAL_MICROS;
  // "3+ años en diseño BIM" → "Experiencia profesional en diseño BIM"
  const experienceLabel = profile.experience ? `Experiencia profesional en ${profile.experience.replace(/^.*? en /, '')}` : null;

  const stats = [
    { label: 'Áreas', value: String(groups.length) },
    { label: 'Módulo a módulo', value: formatEuro(profile.price) },
    { label: 'Microcredenciales', value: `${profile.count} · ${profile.ects} ECTS` },
    { label: 'Certificación', value: profile.certifiable ? 'AECOMI' : 'Itinerario formativo' },
  ];

  return (
    <BookCallProvider businessName={CONTACT.name}>
      <div className="home-root min-h-screen relative">
        <SiteHeader />

        <main className="relative z-[2]">
          <section className="px-4 md:px-6 pt-28 pb-16 md:pt-36 md:pb-20">
            <div className="max-w-6xl mx-auto">
              <Link
                href="/#perfiles"
                className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Todos los perfiles
              </Link>

              <p className="text-xs tracking-[0.25em] uppercase text-[var(--signal)]">Perfil profesional · {profile.code}</p>
              <h1 className="font-kinetic font-black uppercase text-3xl sm:text-4xl md:text-6xl leading-[1.02] mt-4">{profile.name}</h1>
              <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed mt-6">{profile.long ?? profile.desc}</p>

              <dl className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-white/10 bg-black/40 p-5">
                    <dt className="text-xs tracking-[0.2em] uppercase text-white/50">{s.label}</dt>
                    <dd className="font-kinetic font-bold text-lg md:text-xl mt-2">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section aria-labelledby="mapa-title" className="px-4 md:px-6 py-16 md:py-24">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-14 items-start">
              <div>
                <span className="text-xs tracking-[0.25em] uppercase text-[var(--signal)]">Mapa formativo</span>
                <h2 id="mapa-title" className="font-kinetic font-black uppercase text-2xl md:text-4xl leading-[1.05] mt-4">
                  Las competencias que necesitas
                </h2>

                <div className="mt-8 space-y-4">
                  {groups.map(({ area, micros, ects }) => (
                    <article key={area.id} className="rounded-2xl border border-white/10 bg-black/40 p-5 md:p-6">
                      <header className="flex items-baseline justify-between gap-3 flex-wrap">
                        <h3 className="font-kinetic font-bold text-sm md:text-base uppercase">{area.name}</h3>
                        <span className="text-xs font-semibold text-white/50">
                          {area.kind} · <span className="text-[var(--signal)]">{ects} ECTS</span>
                        </span>
                      </header>
                      <ul className="mt-4 divide-y divide-white/10">
                        {micros.map((m) => (
                          <li key={m.code} className="flex items-center gap-3 py-2.5 text-sm">
                            <span className="font-kinetic font-bold text-xs text-[var(--signal)] w-6 shrink-0">{m.code}</span>
                            <span className="flex-1 font-medium leading-snug">{m.title}</span>
                            <span className="text-white/50 whitespace-nowrap">{m.ects} ECTS</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}

                  {experienceLabel && (
                    <div className="rounded-2xl border border-[var(--signal)]/30 bg-[var(--signal)]/5 p-5 md:p-6">
                      <p className="flex items-center gap-3 font-kinetic font-bold text-sm md:text-base uppercase">
                        <Plus className="w-5 h-5 text-[var(--signal)] shrink-0" aria-hidden="true" /> {experienceLabel}
                      </p>
                      <p className="text-sm text-white/70 leading-relaxed mt-3">
                        La certificación exige además experiencia profesional; consulta los requisitos en{' '}
                        <a
                          href={CONTACT.aecomiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--signal)] underline underline-offset-2"
                        >
                          aecomi.org ↗
                        </a>
                        . El simulador profesional y la metodología dual te ayudan a empezar antes.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <aside aria-labelledby="llegar-title" className="lg:sticky lg:top-24 space-y-4">
                <h2 id="llegar-title" className="font-kinetic font-black uppercase text-xl md:text-2xl">Cómo llegar</h2>

                <div className="rounded-2xl bg-[var(--ink-solid)] text-[#f4f8ff] p-6">
                  <h3 className="font-kinetic font-bold text-sm uppercase">Máster BIM blended</h3>
                  <p className="text-sm text-[#c9d9f0] leading-relaxed mt-2">
                    {isFullMaster ? 'Las 23 microcredenciales' : `Las ${TOTAL_MICROS} microcredenciales (incluye estas ${profile.count})`} y el
                    simulador profesional como proyecto fin de máster, con trabajo en empresa desde el primer día.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
                  <h3 className="font-kinetic font-bold text-sm uppercase">Máster BIM online · {formatEuro(MASTER_PRICE_ONLINE)}</h3>
                  <p className="text-sm text-white/60 leading-relaxed mt-2">
                    Las {TOTAL_MICROS} microcredenciales y el simulador profesional como proyecto fin de máster, a tu ritmo.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
                  <h3 className="font-kinetic font-bold text-sm uppercase">Módulo a módulo</h3>
                  <p className="text-sm text-white/60 leading-relaxed mt-2">
                    {isFullMaster ? 'Las 23 microcredenciales' : `Solo las ${profile.count} de este perfil, o las que te falten`}.{' '}
                    {formatEuro(PRICE_PER_ECTS)} por ECTS.
                  </p>
                </div>

                <BookCallButton
                  pack={`Perfil ${profile.name}`}
                  className="group w-full inline-flex items-center justify-between gap-3 pl-6 pr-2 py-2 rounded-full bg-[var(--signal)] text-black hover:bg-[var(--signal-dim)] transition-colors cursor-pointer"
                >
                  <span className="text-sm font-medium tracking-wide">Solicitar orientación</span>
                  <span className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center group-hover:rotate-45 transition-transform">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </BookCallButton>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
                  <p className="text-xs tracking-[0.2em] uppercase text-white/50">Certificación AECOMI</p>
                  {profile.certifiable ? (
                    <>
                      <p className="text-sm leading-relaxed mt-2">
                        Este perfil es certificable por AECOMI. Requisitos, proceso y tarifas, en su web.
                      </p>
                      <a
                        href={CONTACT.aecomiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)] mt-3 hover:underline"
                      >
                        Ir a aecomi.org ↗
                      </a>
                    </>
                  ) : (
                    <p className="text-sm leading-relaxed mt-2">
                      Perfil sin certificación AECOMI por ahora: el mapa acredita la formación.
                    </p>
                  )}
                </div>
              </aside>
            </div>
          </section>
        </main>

        <SiteFooter className="w-[calc(100%-clamp(20px,5vw,72px))] max-w-[1320px] mx-auto mt-3 mb-4" />
      </div>
    </BookCallProvider>
  );
}
