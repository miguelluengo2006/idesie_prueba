'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Check, RotateCcw } from 'lucide-react';
import { AREAS, CONTACT, MICROS, PRICE_PER_ECTS, PROFILES, formatEuro } from '@/lib/bim';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * El mapa interactivo: eliges un perfil de destino y marcas las microcredenciales que ya tienes.
 * Cada perfil muestra en tiempo real cuánto llevas hecho y cuánto te falta.
 */
export default function ProfileStudio() {
  const reduce = useReducedMotion();
  const [code, setCode] = useState('BDM');
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const profile = PROFILES.find((p) => p.code === code) ?? PROFILES[0];
  const inProfile = useMemo(() => new Set(profile.micros), [profile]);

  const progress = (p: (typeof PROFILES)[number]) => {
    const done = p.microList.filter((m) => owned.has(m.code));
    const doneEcts = done.reduce((s, m) => s + m.ects, 0);
    return { done: done.length, doneEcts, pct: p.ects ? Math.round((doneEcts / p.ects) * 100) : 0 };
  };
  const cur = progress(profile);
  const missingEcts = profile.ects - cur.doneEcts;
  const missingCount = profile.count - cur.done;
  const ranking = [...PROFILES].sort((a, b) => progress(b).pct - progress(a).pct);

  const toggle = (c: string) =>
    setOwned((s) => {
      const n = new Set(s);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });

  return (
    <div className="grid lg:grid-cols-[0.78fr_1.22fr] gap-6 lg:gap-10 items-start">
      <div className="lg:sticky lg:top-28 space-y-4">
        <p className="font-kinetic font-bold text-xl">1. Elige tu destino</p>
        <ul className="space-y-2" aria-label="Perfiles">
          {ranking.map((p) => {
            const pr = progress(p);
            const on = p.code === code;
            return (
              <motion.li layout={!reduce} key={p.code} transition={{ duration: 0.5, ease: EASE }}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCode(p.code)}
                  className={`w-full text-left rounded-2xl px-5 py-4 transition-colors cursor-pointer ${on ? 'bg-[#0a1f44] text-[#fff]' : 'bg-[#fff] text-[#0a1f44] hover:bg-[#dbe8ff]'}`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-kinetic font-bold leading-snug">{p.name}</span>
                    <span className="font-kinetic font-bold text-lg tabular-nums">{pr.pct}%</span>
                  </span>
                  <span className={`block mt-3 h-2 rounded-full overflow-hidden ${on ? 'bg-[#fff]/20' : 'bg-[#e9f0fc]'}`}>
                    <motion.span
                      className={`block h-full rounded-full ${on ? 'bg-[#4d94ff]' : 'bg-[#0063e6]'}`}
                      initial={false}
                      animate={{ width: `${pr.pct}%` }}
                      transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
                    />
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-5">
        <div className="rounded-3xl bg-[#0a1f44] text-[#fff] p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#7db4ff]">{profile.certifiable ? 'Certificable AECOMI' : profile.code === 'BM' ? 'Máster BIM' : 'Itinerario formativo'}</p>
              <h3 className="font-kinetic font-bold text-2xl md:text-3xl leading-tight mt-1">{profile.name}</h3>
            </div>
            <button
              type="button"
              onClick={() => setOwned(new Set())}
              disabled={owned.size === 0}
              className="inline-flex items-center gap-2 min-h-10 px-4 rounded-full bg-[#fff]/12 text-sm font-semibold hover:bg-[#fff]/22 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-default"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" /> Empezar de cero
            </button>
          </div>
          <p className="text-[#c9d9f0] leading-relaxed mt-4 max-w-2xl">{profile.desc}</p>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center sm:text-left">
            {[
              { v: cur.done === 0 ? String(profile.count) : String(missingCount), l: cur.done === 0 ? 'microcredenciales' : 'te faltan' },
              { v: cur.done === 0 ? String(profile.ects) : String(missingEcts), l: cur.done === 0 ? 'ECTS' : 'ECTS por cursar' },
              { v: formatEuro(Math.max(0, missingEcts) * PRICE_PER_ECTS), l: 'módulo a módulo' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-[#fff]/10 px-4 py-3">
                <motion.p key={s.v} initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} className="font-kinetic font-bold text-xl md:text-2xl tabular-nums">
                  {s.v}
                </motion.p>
                <p className="text-xs md:text-sm text-[#c9d9f0] mt-1">{s.l}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-[#c9d9f0] leading-relaxed mt-5">
            {profile.certifiable ? (
              <>
                Perfil certificable por AECOMI ({profile.experience}). Requisitos y proceso en{' '}
                <a href={CONTACT.aecomiUrl} target="_blank" rel="noopener noreferrer" className="text-[#fff] underline underline-offset-2 whitespace-nowrap">
                  aecomi.org ↗
                </a>
                . Al completar el mapa obtienes la certificación universitaria del perfil.
              </>
            ) : (
              'Al completar el mapa obtienes la certificación universitaria del perfil.'
            )}
          </p>
          <Link href={`/perfiles/${profile.code.toLowerCase()}`} className="btn btn-blue mt-5 w-fit">
            Ver el mapa completo
            <span className="btn-dot bg-[#fff]/20">
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </span>
          </Link>
        </div>

        <p className="font-kinetic font-bold text-xl pt-2">2. Marca lo que ya tienes</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {AREAS.map((area) => {
            const list = MICROS.filter((m) => m.area === area.id);
            return (
              <div key={area.id} className="rounded-3xl bg-[#fff] p-5">
                <h4 className="font-kinetic font-bold text-base leading-snug">{area.name}</h4>
                <ul className="mt-3 space-y-1.5">
                  {list.map((m) => {
                    const need = inProfile.has(m.code);
                    const has = owned.has(m.code);
                    return (
                      <li key={m.code}>
                        <button
                          type="button"
                          aria-pressed={has}
                          onClick={() => toggle(m.code)}
                          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium leading-snug transition-all duration-300 cursor-pointer ${
                            has
                              ? 'bg-[#0063e6] text-[#fff]'
                              : need
                                ? 'bg-[#dbe8ff] text-[#0a1f44] ring-2 ring-[#0063e6]/50 hover:bg-[#c8dcff]'
                                : 'bg-[#f2f6fd] text-[#0a1f44]/45 hover:text-[#0a1f44]'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full grid place-items-center shrink-0 text-xs font-bold ${has ? 'bg-[#fff] text-[#0063e6]' : 'bg-[#0a1f44]/10'}`}>
                            {has ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : m.code}
                          </span>
                          <span className="flex-1">{m.title}</span>
                          <span className="text-xs font-semibold whitespace-nowrap opacity-80">{m.ects} ECTS</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="text-sm text-[#0a1f44]/70">
          Los módulos con borde azul son los que pide {profile.name}. Es una guía orientativa para ver tu distancia; la convalidación real la valora el equipo académico.
        </p>
      </div>
    </div>
  );
}
