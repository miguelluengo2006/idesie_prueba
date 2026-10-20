'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { AREAS, MASTER_ECTS, MICROS, SIMULATOR_ECTS, TOTAL_ECTS, TOTAL_MICROS } from '@/lib/bim';

const EASE = [0.22, 1, 0.36, 1] as const;
const TONES = ['bg-[#0063e6] text-[#fff]', 'bg-[#4d94ff] text-[#0a1f44]', 'bg-[#fff] text-[#0a1f44]', 'bg-[#0052cc] text-[#fff]'];
const AREA_ORDER = new Map(AREAS.map((a, i) => [a.id, i]));
const PIECES = [...MICROS].sort((a, b) => (AREA_ORDER.get(a.area)! - AREA_ORDER.get(b.area)!) || a.code.localeCompare(b.code));
const TOTAL_STEPS = PIECES.length + 1;

/**
 * Portada de microcredenciales: las 23 piezas caen una a una y se encajan hasta sumar los 44 ECTS de los módulos;
 * la última, el simulador, cierra el Máster BIM de 60 ECTS. Después vuelve a empezar.
 */
export default function MicrosHero() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? TOTAL_STEPS : 0);

  useEffect(() => {
    if (reduce) {
      setN(TOTAL_STEPS);
      return;
    }
    const id = setInterval(() => setN((v) => (v >= TOTAL_STEPS + 9 ? 0 : v + 1)), 230);
    return () => clearInterval(id);
  }, [reduce]);

  const shown = Math.min(n, PIECES.length);
  const ects = PIECES.slice(0, shown).reduce((s, m) => s + m.ects, 0) + (n >= TOTAL_STEPS ? SIMULATOR_ECTS : 0);
  const complete = n >= TOTAL_STEPS;

  const rise = (d: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: d, ease: EASE },
  });

  return (
    <section className="field-navy relative overflow-hidden px-4 md:px-6 pt-32 md:pt-40 pb-20 md:pb-28 min-h-[92svh] flex items-center">
      <div className="hero-glow pointer-events-none absolute -top-48 -right-32 w-[48rem] h-[48rem]" aria-hidden="true" />
      <div className="hero-glow hero-glow-b pointer-events-none absolute -bottom-64 -left-40 w-[38rem] h-[38rem]" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-14 items-center">
        <div>
          <motion.h1 {...rise(0.05)} className="font-kinetic font-bold text-[clamp(2rem,3.8vw,3.4rem)] leading-[1.12]">
            {TOTAL_MICROS} piezas. <span className="ui-hl">Un máster.</span>
          </motion.h1>
          <motion.p {...rise(0.2)} className="text-lg md:text-xl text-[#c9d9f0] leading-relaxed mt-7 max-w-xl">
            Estudia módulo a módulo, a tu ritmo, y súmalos hasta completar el Máster BIM de {MASTER_ECTS} ECTS. Cada microcredencial vale por sí misma y cuenta para el todo.
          </motion.p>
          <motion.div {...rise(0.35)} className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="#monta" className="btn btn-blue">
              Montar mi itinerario
              <span className="btn-dot bg-[#fff]/20">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </Link>
            <Link href="/masters/mbim" className="font-semibold underline underline-offset-[6px] decoration-2 decoration-[#7db4ff] hover:decoration-[#fff] transition-colors">
              Prefiero el máster completo
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: EASE }}
          className="rounded-[2rem] bg-[#0d2a5e] ring-1 ring-[#fff]/15 p-6 md:p-8"
          role="img"
          aria-label={`Animación: las ${TOTAL_MICROS} microcredenciales (${TOTAL_ECTS} ECTS) se suman y, con el simulador profesional de ${SIMULATOR_ECTS} ECTS, forman el Máster BIM de ${MASTER_ECTS} ECTS.`}
        >
          <div className="flex items-end justify-between gap-4">
            <p className="font-kinetic font-bold text-6xl md:text-7xl leading-none tabular-nums">{ects}</p>
            <p className="text-right text-[#c9d9f0] font-semibold leading-snug pb-1">
              ECTS
              <span className="block text-sm font-normal">de {MASTER_ECTS} del Máster BIM</span>
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-1.5 content-start min-h-[11rem]">
            {PIECES.map((m, i) =>
              i < shown ? (
                <motion.span
                  key={m.code}
                  initial={{ opacity: 0, y: reduce ? 0 : -50, scale: reduce ? 1 : 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                  style={{ width: `${m.ects * 3.6 + 1.4}rem` }}
                  className={`h-11 rounded-xl grid place-items-center text-xs font-bold ${TONES[(AREA_ORDER.get(m.area) ?? 0) % TONES.length]}`}
                >
                  {m.code}
                </motion.span>
              ) : null,
            )}
            {complete && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5, y: -60 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                className="h-11 rounded-xl px-4 grid place-items-center text-sm font-bold bg-[#fff] text-[#0a1f44] ring-4 ring-[#4d94ff]"
                style={{ width: '100%' }}
              >
                + Simulador profesional · {SIMULATOR_ECTS} ECTS
              </motion.span>
            )}
          </div>

          <div className="mt-6 h-2.5 rounded-full bg-[#fff]/15 overflow-hidden" aria-hidden="true">
            <motion.div className="h-full rounded-full bg-[#4d94ff]" animate={{ width: `${(ects / MASTER_ECTS) * 100}%` }} transition={{ duration: 0.25 }} />
          </div>
          <p className="mt-3 text-sm font-semibold text-[#c9d9f0] h-5">{complete ? 'Máster BIM completo' : `${shown} de ${TOTAL_MICROS} microcredenciales`}</p>
        </motion.div>
      </div>
    </section>
  );
}
