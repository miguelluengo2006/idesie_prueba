'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { BookCallButton } from './BookCall';

const EASE = [0.22, 1, 0.36, 1] as const;

const TABS = [
  {
    id: 'personas',
    label: 'Soy alumno o profesional',
    title: 'Para quien necesita experiencia para dar el siguiente paso',
    pack: 'Simulador profesional · alumno',
    cta: 'Quiero participar',
    items: [
      { t: 'Recién titulados', k: 'Tu primera experiencia profesional', x: 'Llega a tu primer puesto con un proyecto completo a tus espaldas.' },
      { t: 'Profesionales jóvenes', k: 'El salto que estás buscando', x: 'Suma experiencia en el perfil al que quieres llegar.' },
      { t: 'Perfiles senior', k: 'Reorienta tu carrera', x: 'Acredita experiencia en un ámbito nuevo sin empezar de cero.' },
    ],
  },
  {
    id: 'empresas',
    label: 'Soy empresa',
    title: 'Vuestra cantera de talento',
    pack: 'Simulador profesional · empresa',
    cta: 'Quiero participar como empresa',
    items: [
      { t: 'Captad talento con poca inversión', k: '', x: 'Ved trabajar a los candidatos antes de contratarlos.' },
      { t: 'Definid el nivel', k: '', x: 'Vuestros profesionales marcan lo que exige cada perfil.' },
      { t: 'Equipos certificables', k: '', x: 'Profesionales preparados para la certificación que piden los concursos.' },
      { t: 'Posicionamiento', k: '', x: 'Impulsad el estándar profesional del sector AECO.' },
    ],
  },
] as const;

const TONES = ['bg-[#0063e6] text-[#fff]', 'bg-[#fff] text-[#0a1f44]', 'bg-[#0a1f44] text-[#fff]', 'bg-[#4d94ff] text-[#0a1f44]'];

/** «¿Para quién?»: un interruptor entre alumno/profesional y empresa que cambia todo el panel con animación. */
export default function SimulatorAudience() {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState(0);
  const cur = TABS[tab];

  return (
    <div>
      <div role="tablist" aria-label="¿Quién eres?" className="inline-flex rounded-full bg-[#fff]/60 p-1.5 relative">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === i}
            onClick={() => setTab(i)}
            className={`relative z-10 min-h-12 px-5 md:px-7 rounded-full font-semibold transition-colors cursor-pointer ${tab === i ? 'text-[#fff]' : 'text-[#0a1f44]'}`}
          >
            {tab === i && <motion.span layoutId="aud-pill" className="absolute inset-0 rounded-full bg-[#0a1f44]" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={cur.id}
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -16 }}
          transition={{ duration: 0.4, ease: EASE }}
          role="tabpanel"
          className="mt-10"
        >
          <h3 className="font-kinetic font-bold text-2xl md:text-4xl leading-[1.15] max-w-3xl text-[#0a1f44]">{cur.title}</h3>
          <ul className={`mt-8 grid gap-3 ${cur.items.length === 3 ? 'md:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
            {cur.items.map((it, i) => (
              <motion.li
                key={it.t}
                initial={{ opacity: 0, y: reduce ? 0 : 30, scale: reduce ? 1 : 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.09, ease: EASE }}
                whileHover={reduce ? undefined : { y: -6 }}
                className={`rounded-3xl p-6 md:p-7 min-h-52 flex flex-col ${TONES[i % TONES.length]}`}
              >
                <h4 className="font-kinetic font-bold text-xl leading-snug">{it.t}</h4>
                {it.k && <p className="font-semibold mt-3 opacity-90">{it.k}</p>}
                <p className="mt-auto pt-4 leading-snug opacity-90">{it.x}</p>
              </motion.li>
            ))}
          </ul>
          <BookCallButton pack={cur.pack} className="btn btn-blue mt-9 w-fit">
            {cur.cta}
            <span className="btn-dot bg-[#fff]/20">
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </span>
          </BookCallButton>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
