'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CONTACT, PROFILES, formatEuro, profileBadge } from '@/lib/bim';
import { SectionHead } from './Reveal';

/** "¿Qué perfil quieres alcanzar?" — pestañas por perfil con su mapa de microcredenciales. */
export default function ProfileExplorer() {
  const [code, setCode] = useState('BDM');
  const profile = PROFILES.find((p) => p.code === code) ?? PROFILES[2];

  return (
    <section id="perfiles" aria-labelledby="perfiles-title" className="px-4 md:px-6 py-20 md:py-28 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <SectionHead
          eyebrow="Perfiles profesionales"
          title={<span id="perfiles-title">¿Qué perfil quieres alcanzar?</span>}
          lead="Cada perfil tiene su mapa: las microcredenciales que necesitas y los ECTS que suman. Si el perfil es certificable, te enlazamos con AECOMI."
        />

        <div role="tablist" aria-label="Perfiles profesionales" className="mt-10 flex flex-wrap gap-2.5">
          {PROFILES.map((p) => {
            const on = p.code === code;
            return (
              <button
                key={p.code}
                type="button"
                role="tab"
                id={`tab-${p.code}`}
                aria-selected={on}
                aria-controls="perfil-panel"
                onClick={() => setCode(p.code)}
                className={`px-4 py-2.5 min-h-11 rounded-full border text-sm font-medium transition-colors cursor-pointer ${
                  on
                    ? 'bg-[var(--signal)] border-[var(--signal)] text-black'
                    : 'border-white/15 text-white/70 hover:border-[var(--signal)] hover:text-white'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>

        <div
          id="perfil-panel"
          role="tabpanel"
          aria-labelledby={`tab-${profile.code}`}
          className="mt-6 grid lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12 rounded-3xl border border-white/10 bg-black/40 p-6 md:p-10"
        >
          <div className="flex flex-col gap-5">
            <span
              className={`self-start text-[11px] font-semibold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full ${
                profile.certifiable ? 'bg-[var(--ink-solid)] text-[var(--yellow)]' : 'bg-[var(--signal)]/10 text-[var(--signal)]'
              }`}
            >
              {profileBadge(profile)}
            </span>
            <h3 className="font-kinetic font-black uppercase text-2xl md:text-3xl leading-tight">{profile.name}</h3>
            <p className="text-white/60 leading-relaxed">{profile.desc}</p>

            <dl className="grid grid-cols-3 gap-2.5">
              {[
                { v: String(profile.count), l: 'microcredenciales' },
                { v: String(profile.ects), l: 'ECTS' },
                { v: formatEuro(profile.price), l: 'módulo a módulo' },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-white/10 bg-black/40 p-3.5">
                  <dd className="font-kinetic font-bold text-lg md:text-xl">{s.v}</dd>
                  <dt className="text-xs text-white/50 mt-1">{s.l}</dt>
                </div>
              ))}
            </dl>

            <p className="text-sm font-medium leading-relaxed">
              {profile.certifiable ? (
                <>
                  Perfil certificable por AECOMI ({profile.experience}). Requisitos y proceso en aecomi.org.{' '}
                  <a
                    href={CONTACT.aecomiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--signal)] underline underline-offset-2 whitespace-nowrap"
                  >
                    Ir a AECOMI ↗
                  </a>
                </>
              ) : (
                'Perfil sin certificación AECOMI por ahora: el mapa acredita la formación.'
              )}
            </p>

            <Link
              href={`/perfiles/${profile.code.toLowerCase()}`}
              className="group self-start inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-[var(--signal)] text-black hover:bg-[var(--signal-dim)] transition-colors"
            >
              <span className="text-sm font-medium tracking-wide">Ver el mapa completo</span>
              <span className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center group-hover:rotate-45 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-white/50 mb-4">Mapa formativo · microcredenciales</p>
            <ul className="grid sm:grid-cols-2 gap-2.5">
              {profile.microList.map((m) => (
                <li key={m.code} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3.5 py-3">
                  <span className="font-kinetic font-bold text-xs text-[var(--signal)] w-6 shrink-0">{m.code}</span>
                  <span className="flex-1 text-sm font-medium leading-snug">{m.title}</span>
                  <span className="text-xs font-semibold text-white/50 whitespace-nowrap">{m.ects} ECTS</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
