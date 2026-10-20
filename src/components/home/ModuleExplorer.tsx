'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Master } from '@/lib/masters';

/** Cada fase del máster tiñe sus plantas de un color de marca. */
const TONES = [
  { floor: 'bg-[#0063e6] text-[#fff]', chip: 'bg-[#0063e6] text-[#fff]' },
  { floor: 'bg-[#0a1f44] text-[#fff]', chip: 'bg-[#0a1f44] text-[#fff]' },
  { floor: 'bg-[#7db4ff] text-[#0a1f44]', chip: 'bg-[#7db4ff] text-[#0a1f44]' },
];

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * El máster como un edificio: cada módulo es una planta. Al entrar en pantalla el edificio se construye planta a planta;
 * después pulsas una planta (o las flechas) para ver qué haces en ese módulo.
 */
export default function ModuleExplorer({ master }: { master: Master }) {
  const reduce = useReducedMotion();
  const total = master.modules.length;
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-120px' });
  const [built, setBuilt] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!seen) return;
    if (reduce) {
      setBuilt(total);
      return;
    }
    const id = setInterval(() => setBuilt((b) => (b >= total ? b : b + 1)), 380);
    return () => clearInterval(id);
  }, [seen, reduce, total]);

  const m = master.modules[active];
  const tone = TONES[Math.max(0, master.phases.indexOf(m.phase)) % TONES.length];
  const done = built >= total;
  const go = (d: number) => setActive((a) => Math.min(total - 1, Math.max(0, a + d)));

  return (
    <div ref={ref} className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12 items-start">
      <div className="lg:sticky lg:top-28">
        <div className="flex flex-col-reverse gap-1.5" role="list" aria-label="Plantas del edificio: un módulo por planta">
          {master.modules.map((mod, i) => {
            const isBuilt = i < built;
            const on = i === active;
            const t = TONES[Math.max(0, master.phases.indexOf(mod.phase)) % TONES.length];
            return (
              <motion.button
                key={mod.title}
                type="button"
                role="listitem"
                disabled={!isBuilt}
                aria-current={on ? 'true' : undefined}
                onClick={() => setActive(i)}
                initial={false}
                animate={{ opacity: isBuilt ? 1 : 0.55, scaleX: isBuilt ? 1 : 0.9, x: on ? 10 : 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                style={{ transformOrigin: 'left center' }}
                className={`min-h-12 px-4 py-2.5 rounded-xl text-left font-semibold leading-tight transition-shadow cursor-pointer disabled:cursor-default ${
                  isBuilt ? t.floor : 'border-2 border-dashed border-[#0a1f44]/25 text-[#0a1f44]/45'
                } ${on ? 'ring-4 ring-[#0063e6]/35 shadow-[0_14px_30px_-14px_rgba(0,99,230,0.8)]' : ''}`}
              >
                <span className="block text-sm md:text-base">{mod.title}</span>
              </motion.button>
            );
          })}
          <div className="h-14 flex items-end" aria-hidden="true">
            <svg viewBox="0 0 52 56" className="h-full w-auto overflow-visible">
              <motion.path d="M8 56V4" stroke="#0a1f44" strokeWidth="3" strokeLinecap="round" fill="none" initial={false} animate={{ pathLength: done ? 1 : 0 }} transition={{ duration: 0.5 }} />
              <motion.path d="M8 4h32l-8 10 8 10H8" fill="#0063e6" initial={false} animate={{ opacity: done ? 1 : 0, x: done ? 0 : -12 }} transition={{ duration: 0.6, delay: 0.3, ease: EASE }} />
            </svg>
            <motion.span initial={false} animate={{ opacity: done ? 1 : 0 }} transition={{ delay: 0.6 }} className="ml-2 pb-1 text-sm font-semibold text-[#0a1f44]">
              Obra entregada
            </motion.span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-[#fff] p-6 md:p-10 min-h-[26rem] flex flex-col">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[#0a1f44]/70">
            Planta {active + 1} de {total}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => go(-1)} disabled={active === 0} aria-label="Módulo anterior" className="w-11 h-11 rounded-full grid place-items-center bg-[#e9f0fc] text-[#0a1f44] hover:bg-[#0063e6] hover:text-[#fff] disabled:opacity-35 disabled:hover:bg-[#e9f0fc] disabled:hover:text-[#0a1f44] transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => go(1)} disabled={active === total - 1 || !done} aria-label="Módulo siguiente" className="w-11 h-11 rounded-full grid place-items-center bg-[#0063e6] text-[#fff] hover:bg-[#0052cc] disabled:opacity-35 transition-colors cursor-pointer">
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-[#e9f0fc] overflow-hidden" aria-hidden="true">
          <motion.div className="h-full rounded-full bg-[#0063e6]" initial={false} animate={{ width: `${((active + 1) / total) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -12 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="mt-8"
            aria-live="polite"
          >
            <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${tone.chip}`}>{m.phase}</span>
            <h3 className="font-kinetic font-bold text-2xl md:text-4xl leading-tight mt-4 text-[#0a1f44]">{m.title}</h3>
            <p className="text-lg font-semibold text-[#0063e6] leading-snug mt-3">{m.tagline}</p>
            <ul className="mt-6 space-y-3">
              {m.points.map((pt, i) => (
                <motion.li
                  key={pt}
                  initial={{ opacity: 0, x: reduce ? 0 : -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease: EASE }}
                  className="flex gap-3 text-base md:text-lg leading-snug text-[#0a1f44]"
                >
                  <span className="mt-2.5 w-2 h-2 rounded-full bg-[#0063e6] shrink-0" aria-hidden="true" />
                  {pt}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
