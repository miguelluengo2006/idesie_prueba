'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Plus, RotateCcw, Sparkles } from 'lucide-react';
import { BookCallButton } from './BookCall';
import { AREAS, MICROS, PRICE_PER_ECTS, PROFILES, SIMULATOR_ECTS, MASTER_ECTS, TOTAL_ECTS, formatEuro } from '@/lib/bim';

const EASE = [0.22, 1, 0.36, 1] as const;
const R = 54;
const C = 2 * Math.PI * R;

/**
 * Monta tu itinerario: añade microcredenciales, mira cómo sube el medidor de ECTS, cuánto cuestan módulo a módulo
 * y qué perfiles vas desbloqueando. Se puede cargar un perfil entero de un toque.
 */
export default function MicrosBuilder() {
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [area, setArea] = useState('todas');

  const list = MICROS.filter((m) => picked.has(m.code));
  const ects = list.reduce((s, m) => s + m.ects, 0);
  const unlocked = useMemo(() => PROFILES.filter((p) => p.micros.every((c) => picked.has(c))), [picked]);
  const all = picked.size === MICROS.length;
  const shown = MICROS.filter((m) => area === 'todas' || m.area === area);

  const toggle = (c: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });
  const load = (codes: string[]) => setPicked((s) => new Set([...s, ...codes]));

  const pack = list.length ? `Microcredenciales ${list.map((m) => m.code).join(', ')} · ${ects} ECTS` : 'Microcredenciales · orientación';

  return (
    <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-6 lg:gap-10 items-start">
      <div>
        <div role="group" aria-label="Filtrar por área" className="flex flex-wrap gap-2">
          {[{ id: 'todas', name: 'Todas' }, ...AREAS].map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={area === a.id}
              onClick={() => setArea(a.id)}
              className={`min-h-10 px-4 rounded-full text-sm font-semibold transition-colors cursor-pointer ${area === a.id ? 'bg-[#0a1f44] text-[#fff]' : 'bg-[#fff] text-[#0a1f44] hover:bg-[#dbe8ff]'}`}
            >
              {a.name}
            </button>
          ))}
        </div>

        <motion.ul layout={!reduce} className="mt-6 grid sm:grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {shown.map((m) => {
              const on = picked.has(m.code);
              return (
                <motion.li
                  key={m.code}
                  layout={!reduce}
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: reduce ? 1 : 0.92 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <motion.button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(m.code)}
                    whileHover={reduce ? undefined : { y: -4 }}
                    whileTap={reduce ? undefined : { scale: 0.97 }}
                    className={`w-full h-full text-left rounded-3xl p-5 flex gap-4 items-start transition-colors duration-300 cursor-pointer ${on ? 'bg-[#0063e6] text-[#fff]' : 'bg-[#fff] text-[#0a1f44] hover:bg-[#f4f8ff]'}`}
                  >
                    <span className={`w-11 h-11 rounded-2xl grid place-items-center shrink-0 font-kinetic font-bold text-sm ${on ? 'bg-[#fff] text-[#0063e6]' : 'bg-[#e9f0fc]'}`}>
                      {on ? <Check className="w-5 h-5" aria-hidden="true" /> : m.code}
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold leading-snug">{m.title}</span>
                      <span className={`block text-sm mt-1.5 ${on ? 'text-[#fff]/85' : 'text-[#0a1f44]/60'}`}>
                        {AREAS.find((a) => a.id === m.area)?.name} · {m.ects} ECTS
                      </span>
                    </span>
                    {!on && <Plus className="w-5 h-5 shrink-0 text-[#0063e6]" aria-hidden="true" />}
                  </motion.button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </div>

      <aside className="lg:sticky lg:top-28 rounded-[2rem] bg-[#0a1f44] text-[#fff] p-6 md:p-7" aria-label="Tu itinerario">
        <div className="flex items-center gap-5">
          <div className="relative w-32 h-32 shrink-0" role="img" aria-label={`${ects} ECTS de ${TOTAL_ECTS} posibles en microcredenciales`}>
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
              <motion.circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke="#4d94ff"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={C}
                initial={false}
                animate={{ strokeDashoffset: C * (1 - ects / TOTAL_ECTS) }}
                transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <motion.p key={ects} initial={{ scale: reduce ? 1 : 1.3 }} animate={{ scale: 1 }} className="font-kinetic font-bold text-3xl leading-none tabular-nums">
                  {ects}
                </motion.p>
                <p className="text-xs text-[#c9d9f0] mt-1">ECTS</p>
              </div>
            </div>
          </div>
          <div>
            <p className="font-kinetic font-bold text-xl leading-tight">{list.length === 0 ? 'Tu itinerario' : `${list.length} ${list.length === 1 ? 'módulo' : 'módulos'}`}</p>
            <motion.p key={ects} initial={{ opacity: 0, y: reduce ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} className="text-[#c9d9f0] mt-1">
              {formatEuro(ects * PRICE_PER_ECTS)} <span className="text-sm">módulo a módulo</span>
            </motion.p>
          </div>
        </div>

        <div className="mt-5 min-h-[4.5rem]">
          {list.length === 0 ? (
            <p className="text-[#c9d9f0] leading-snug">Pulsa los módulos que te interesen y mira cómo suben los ECTS. O empieza por un perfil:</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5" aria-label="Módulos elegidos">
              <AnimatePresence initial={false}>
                {list.map((m) => (
                  <motion.li key={m.code} layout={!reduce} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
                    <button type="button" onClick={() => toggle(m.code)} aria-label={`Quitar ${m.title}`} className="rounded-lg bg-[#fff]/14 hover:bg-[#fff]/28 px-2.5 py-1 text-sm font-bold cursor-pointer transition-colors">
                      {m.code}
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {PROFILES.map((p) => (
            <button key={p.code} type="button" onClick={() => load(p.micros)} className="min-h-9 px-3 rounded-full bg-[#fff]/12 hover:bg-[#fff]/25 text-sm font-semibold transition-colors cursor-pointer">
              {p.name}
            </button>
          ))}
        </div>

        <div aria-live="polite" className="mt-5 space-y-2">
          <AnimatePresence initial={false}>
            {unlocked.map((p) => (
              <motion.p
                key={p.code}
                initial={{ opacity: 0, scale: reduce ? 1 : 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="rounded-2xl bg-[#0063e6] px-4 py-3 text-sm font-semibold flex items-start gap-2"
              >
                <Sparkles className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  Mapa completo de {p.name}
                  {p.certifiable && <span className="block font-normal opacity-90">Para certificarte con AECOMI necesitas además la experiencia que pide el perfil.</span>}
                </span>
              </motion.p>
            ))}
          </AnimatePresence>
          {all && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-[#fff] text-[#0a1f44] px-4 py-3 text-sm font-semibold">
              Con el simulador profesional ({SIMULATOR_ECTS} ECTS) completas el Máster BIM de {MASTER_ECTS} ECTS.
            </motion.p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <BookCallButton pack={pack} className="btn btn-blue">
            {list.length ? 'Solicitar este itinerario' : 'Pedir orientación'}
          </BookCallButton>
          <button type="button" onClick={() => setPicked(new Set())} disabled={list.length === 0} className="inline-flex items-center gap-2 min-h-10 px-3 text-sm font-semibold text-[#c9d9f0] hover:text-[#fff] disabled:opacity-40 cursor-pointer disabled:cursor-default transition-colors">
            <RotateCcw className="w-4 h-4" aria-hidden="true" /> Vaciar
          </button>
        </div>
      </aside>
    </div>
  );
}
