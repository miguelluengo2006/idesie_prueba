'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { MICROS, PROFILES } from '@/lib/bim';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Las 23 microcredenciales como una constelación: posiciones en espiral áurea, siempre las mismas. */
const NODES = MICROS.map((m, i) => {
  const r = Math.sqrt(i + 1.4) * 9.2;
  const a = i * 2.399963;
  return { code: m.code, x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
});

/**
 * Portada de perfiles: la constelación de microcredenciales se enciende perfil a perfil, unidas por una línea.
 * Elegir un perfil en las píldoras detiene el ciclo y lo enciende.
 */
export default function ProfilesHero() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(2);
  const [manual, setManual] = useState(false);
  const profile = PROFILES[idx];
  const lit = useMemo(() => new Set(profile.micros), [profile]);
  const path = useMemo(() => {
    const pts = NODES.filter((n) => lit.has(n.code));
    return pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  }, [lit]);

  useEffect(() => {
    if (reduce || manual) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % PROFILES.length), 3800);
    return () => clearInterval(id);
  }, [reduce, manual]);

  const rise = (d: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: d, ease: EASE },
  });

  return (
    <section className="field-navy relative overflow-hidden px-4 md:px-6 pt-32 md:pt-40 pb-20 md:pb-28 min-h-[92svh] flex items-center">
      <div className="hero-glow pointer-events-none absolute -top-48 -left-40 w-[46rem] h-[46rem]" aria-hidden="true" />
      <div className="hero-glow hero-glow-b pointer-events-none absolute -bottom-64 -right-40 w-[40rem] h-[40rem]" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-8 items-center">
        <div>
          <motion.h1 {...rise(0.05)} className="font-kinetic font-bold text-[clamp(2rem,3.8vw,3.4rem)] leading-[1.12]">
            ¿A qué <span className="ui-hl">perfil</span> quieres llegar?
          </motion.h1>
          <motion.p {...rise(0.2)} className="text-lg md:text-xl text-[#c9d9f0] leading-relaxed mt-7 max-w-xl">
            Cada perfil BIM tiene su mapa de competencias. Marca lo que ya sabes y descubre cuánto te falta para llegar.
          </motion.p>
          <motion.div {...rise(0.35)} className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="#mapa" className="btn btn-blue">
              Probar el mapa
              <span className="btn-dot bg-[#fff]/20">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </Link>
            <Link href="#certificables" className="font-semibold underline underline-offset-[6px] decoration-2 decoration-[#7db4ff] hover:decoration-[#fff] transition-colors">
              Perfiles certificables
            </Link>
          </motion.div>

          <motion.div {...rise(0.5)} role="group" aria-label="Elige un perfil para verlo en la constelación" className="mt-12 flex flex-wrap gap-2">
            {PROFILES.map((p, i) => (
              <button
                key={p.code}
                type="button"
                aria-pressed={i === idx}
                onClick={() => {
                  setManual(true);
                  setIdx(i);
                }}
                className={`min-h-10 px-4 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                  i === idx ? 'bg-[#fff] text-[#0a1f44]' : 'bg-[#fff]/10 text-[#fff] hover:bg-[#fff]/20'
                }`}
              >
                {p.name}
              </button>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
          className="relative"
        >
          <div
            className="relative aspect-square max-w-[34rem] mx-auto rounded-[2rem] bg-[#0d2a5e] ring-1 ring-[#fff]/15"
            role="img"
            aria-label={`Constelación de las ${MICROS.length} microcredenciales. Perfil mostrado: ${profile.name}, ${profile.count} microcredenciales y ${profile.ects} ECTS.`}
          >
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-3 pb-24">
              <AnimatePresence>
                <motion.path
                  key={profile.code}
                  d={path}
                  fill="none"
                  stroke="#4d94ff"
                  strokeWidth="0.35"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0.9 }}
                  animate={{ pathLength: 1, opacity: 0.9 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 1.6, ease: 'easeInOut' }}
                />
              </AnimatePresence>
              {NODES.map((n, i) => {
                const on = lit.has(n.code);
                return (
                  <motion.g key={n.code} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.04 }}>
                    <motion.circle
                      cx={n.x}
                      cy={n.y}
                      animate={{ r: on ? 3.3 : 1.6, fill: on ? '#0063e6' : '#6b88b8' }}
                      transition={{ duration: 0.5, delay: reduce ? 0 : (i % 7) * 0.03 }}
                    />
                    <motion.text
                      x={n.x}
                      y={n.y + 1.1}
                      textAnchor="middle"
                      fontSize="2.8"
                      fontWeight="700"
                      fill="#fff"
                      animate={{ opacity: on ? 1 : 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {n.code}
                    </motion.text>
                  </motion.g>
                );
              })}
            </svg>

            <div className="absolute left-4 right-4 bottom-4 rounded-2xl bg-[#0a1f44]/85 backdrop-blur-md ring-1 ring-[#fff]/15 px-5 py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={profile.code}
                  initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="font-kinetic font-bold text-lg leading-snug">{profile.name}</p>
                  <p className="text-sm text-[#c9d9f0] mt-1">
                    {profile.count} microcredenciales · {profile.ects} ECTS{profile.certifiable ? ' · Certificable AECOMI' : ''}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
