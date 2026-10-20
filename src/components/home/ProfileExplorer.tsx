'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CONTACT, PROFILES, formatEuro, profileBadge } from '@/lib/bim';
import { SectionHead } from './Reveal';
import Section from './Section';

/** "¿Qué perfil quieres alcanzar?" — pestañas por perfil con su mapa de microcredenciales. */
export default function ProfileExplorer() {
  const [code, setCode] = useState('BDM');
  const profile = PROFILES.find((p) => p.code === code) ?? PROFILES[2];

  return (
    <Section field="white" id="perfiles" labelledBy="perfiles-title">
      <div>
        <SectionHead
          eyebrow="Perfiles profesionales"
          title={
            <span id="perfiles-title">
              ¿Qué <span className="ui-hl">perfil</span> quieres alcanzar?
            </span>
          }
          lead="Cada perfil tiene su mapa de competencias. Sabrás qué microcredenciales necesitas y cuánto te falta para llegar. Al completarlo, obtienes la certificación universitaria del perfil."
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
                    ? 'bg-[#0a1f44] border-[#0a1f44] text-[#fff]'
                    : 'bg-[#eef3fc] border-transparent text-white/70 hover:bg-[#0a1f44] hover:text-[#fff]'
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
          className="mt-6 grid lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12 ui-card p-6 md:p-10"
        >
          <div className="flex flex-col gap-5">
            <span
              className={`self-start text-xs font-semibold px-3 py-1.5 rounded-full ${
                profile.certifiable ? 'bg-[#0a1f44] text-[#ffba08]' : 'bg-[#0063e6]/10 text-[#0052cc]'
              }`}
            >
              {profileBadge(profile)}
            </span>
            <h3 className="font-kinetic font-bold text-2xl md:text-3xl leading-tight">{profile.name}</h3>
            <p className="text-white/60 leading-relaxed">{profile.desc}</p>

            <dl className="grid grid-cols-3 gap-2.5">
              {[
                { v: String(profile.count), l: 'microcredenciales' },
                { v: String(profile.ects), l: 'ECTS' },
                { v: formatEuro(profile.price), l: 'módulo a módulo' },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-[#fff] p-3.5">
                  <dd className="font-kinetic font-bold text-lg md:text-xl">{s.v}</dd>
                  <dt className="text-xs text-white/50 mt-1">{s.l}</dt>
                </div>
              ))}
            </dl>

            <p className="text-sm font-semibold text-[var(--signal)]">Certificación universitaria UTAMED al completar el mapa del perfil</p>
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
              className="btn btn-blue self-start"
            >
              Ver el mapa completo
              <span className="btn-dot bg-[#fff]/20">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </Link>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-4">Mapa de competencias · microcredenciales</p>
            <ul className="grid sm:grid-cols-2 gap-2.5">
              {profile.microList.map((m) => (
                <li key={m.code} className="flex items-center gap-3 rounded-xl bg-[#fff] px-3.5 py-3">
                  <span className="font-kinetic font-bold text-xs text-[var(--signal)] w-6 shrink-0">{m.code}</span>
                  <span className="flex-1 text-sm font-medium leading-snug">{m.title}</span>
                  <span className="text-xs font-semibold text-white/50 whitespace-nowrap">{m.ects} ECTS</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
