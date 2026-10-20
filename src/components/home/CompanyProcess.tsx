'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;
const STEPS = [
  { title: 'Diagnóstico', text: 'Analizamos vuestros proyectos, el nivel técnico del equipo y los objetivos de la organización.' },
  { title: 'Perfiles y mapa', text: 'Definimos las competencias de cada puesto y el mapa formativo que las cubre, incluida la IA aplicada a BIM.' },
  { title: 'Entrega', text: 'Formación en vuestras instalaciones, en nuestras aulas o en línea, según el calendario de vuestra operación.' },
  { title: 'Medición', text: 'El programa se diseña contra objetivos concretos, así que el resultado se mide contra ellos.' },
];
const MODES = ['En tu empresa', 'En nuestras aulas', 'Online'];
const MODE_TEXT = ['Nuestro equipo se desplaza a vuestras instalaciones.', 'Espacios equipados en Madrid para formación intensiva.', 'Con los mismos recursos del programa presencial.'];

/** Las cuatro fases de la formación in-company, como una línea que avanza sola (o al pulsar) con un panel que cambia. */
export default function CompanyProcess() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (reduce || !auto) return;
    const t = setTimeout(() => setI((v) => (v + 1) % STEPS.length), 5200);
    return () => clearTimeout(t);
  }, [i, auto, reduce]);

  return (
    <div>
      <div role="tablist" aria-label="Fases de la formación in-company" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STEPS.map((s, n) => {
          const on = n === i;
          return (
            <button
              key={s.title}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                setAuto(false);
                setI(n);
              }}
              className="text-left cursor-pointer group"
            >
              <span className="block h-1.5 rounded-full bg-[#0a1f44]/15 overflow-hidden">
                <motion.span
                  key={`${n}-${on}-${auto}`}
                  className="block h-full bg-[#0063e6]"
                  initial={{ width: n < i ? '100%' : '0%' }}
                  animate={{ width: n < i ? '100%' : on ? '100%' : '0%' }}
                  transition={{ duration: on && auto && !reduce ? 5.2 : 0.4, ease: on && auto && !reduce ? 'linear' : EASE }}
                />
              </span>
              <span className={`block mt-3 font-kinetic font-bold text-lg leading-snug transition-colors ${on ? 'text-[#0a1f44]' : 'text-[#0a1f44]/45 group-hover:text-[#0a1f44]'}`}>{s.title}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid lg:grid-cols-[1.2fr_0.8fr] gap-3">
        <div className="rounded-3xl bg-[#0a1f44] text-[#fff] p-7 md:p-10 min-h-[15rem] flex flex-col justify-between" role="tabpanel">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: reduce ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -14 }} transition={{ duration: 0.4, ease: EASE }}>
              <p className="font-kinetic font-bold text-[#7db4ff] text-lg">Fase {i + 1} de {STEPS.length}</p>
              <h3 className="font-kinetic font-bold text-3xl md:text-5xl leading-tight mt-2">{STEPS[i].title}</h3>
              <p className="text-lg md:text-xl text-[#c9d9f0] leading-relaxed mt-4 max-w-xl">{STEPS[i].text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <ul className="grid gap-3">
          {MODES.map((m, n) => (
            <li key={m} className={`rounded-3xl p-6 ${['bg-[#0063e6] text-[#fff]', 'bg-[#fff]', 'bg-[#dbe8ff]'][n]}`}>
              <h3 className="font-kinetic font-bold text-lg">{m}</h3>
              <p className="mt-1.5 leading-snug opacity-90">{MODE_TEXT[n]}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
