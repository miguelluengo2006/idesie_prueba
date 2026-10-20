'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Check } from 'lucide-react';
import { SIMULATOR } from '@/lib/content';

const EASE = [0.22, 1, 0.36, 1] as const;

type Visual =
  | { kind: 'check'; items: string[] }
  | { kind: 'bars'; items: string[] }
  | { kind: 'layers'; items: string[]; result: string }
  | { kind: 'chips'; items: string[]; caption: string }
  | { kind: 'flow'; items: string[] };

interface Scene {
  text: string;
  visual: Visual;
}

/** Una escena por hito. Los ejemplos son ilustrativos; el texto sale de la propuesta del simulador. */
const SCENES: Scene[] = [
  {
    text: 'Profesionales de las empresas colaboradoras hacen de cliente: fijan los requisitos del encargo.',
    visual: { kind: 'check', items: ['Alcance del proyecto', 'Plazos de entrega', 'Nivel de información requerido'] },
  },
  {
    text: 'Defines cómo vas a trabajar sobre un entorno común de datos, siguiendo el proceso de la ISO 19650.',
    visual: { kind: 'bars', items: ['Roles y responsabilidades', 'Entorno común de datos', 'Estándares y nomenclatura'] },
  },
  {
    text: 'Entregas al cliente por hitos y él revisa tu trabajo, como en cualquier encargo profesional.',
    visual: { kind: 'layers', items: ['Arquitectura', 'Estructura', 'Instalaciones'], result: 'Modelo federado · en revisión' },
  },
  {
    text: 'Hay reuniones de seguimiento, actas y versiones. Todo queda registrado en el entorno común de datos.',
    visual: { kind: 'chips', items: ['v1.0', 'v1.1', 'v1.2', 'Acta'], caption: 'Reunión de seguimiento · jueves' },
  },
  {
    text: 'El cliente pide cambios y tú los gestionas: se evalúan, se aplican y se vuelven a entregar.',
    visual: { kind: 'flow', items: ['Solicitado', 'Evaluado', 'Aplicado', 'Entregado'] },
  },
  {
    text: 'El proyecto pasa una auditoría: se revisan los procesos, los entregables y la trazabilidad.',
    visual: { kind: 'bars', items: ['Procesos', 'Entregables', 'Trazabilidad'] },
  },
  {
    text: 'Presentas la entrega final y defiendes tu proyecto. Entregas, revisiones y evaluación del cliente quedan como evidencia.',
    visual: { kind: 'check', items: ['Entrega final', 'Defensa del proyecto', 'Evaluación del cliente'] },
  },
];

function SceneVisual({ visual }: { visual: Visual }) {
  const reduce = useReducedMotion();
  const step = (i: number) => ({
    initial: { opacity: 0, x: reduce ? 0 : -24 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, delay: 0.25 + i * 0.18, ease: EASE },
  });

  if (visual.kind === 'check') {
    return (
      <ul className="space-y-3">
        {visual.items.map((it, i) => (
          <motion.li key={it} {...step(i)} className="flex items-center gap-4 rounded-2xl bg-[#fff]/10 px-5 py-4">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.55 + i * 0.18, type: 'spring', stiffness: 400, damping: 16 }}
              className="w-8 h-8 rounded-full bg-[#0063e6] text-[#fff] grid place-items-center shrink-0"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
            </motion.span>
            <span className="text-lg font-semibold">{it}</span>
          </motion.li>
        ))}
      </ul>
    );
  }

  if (visual.kind === 'bars') {
    return (
      <ul className="space-y-5">
        {visual.items.map((it, i) => (
          <motion.li key={it} {...step(i)}>
            <p className="text-lg font-semibold">{it}</p>
            <div className="mt-2 h-3 rounded-full bg-[#fff]/15 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${[92, 78, 100][i % 3]}%` }}
                transition={{ duration: 1, delay: 0.45 + i * 0.2, ease: EASE }}
                className="h-full rounded-full bg-[#4d94ff]"
              />
            </div>
          </motion.li>
        ))}
      </ul>
    );
  }

  if (visual.kind === 'layers') {
    return (
      <div className="relative h-56 md:h-64">
        {visual.items.map((it, i) => (
          <motion.div
            key={it}
            initial={{ opacity: 0, y: reduce ? 0 : -60 - i * 20, x: reduce ? 0 : (i - 1) * 60 }}
            animate={{ opacity: 1, y: i * 56, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 + i * 0.2, ease: EASE }}
            className={`absolute left-0 right-0 top-0 h-16 rounded-2xl px-5 flex items-center font-semibold text-lg ${
              ['bg-[#0063e6] text-[#fff]', 'bg-[#4d94ff] text-[#0a1f44]', 'bg-[#fff] text-[#0a1f44]'][i % 3]
            }`}
            style={{ zIndex: 3 - i }}
          >
            {it}
          </motion.div>
        ))}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="absolute left-0 bottom-0 rounded-full bg-[#fff]/12 px-4 py-2 text-sm font-semibold"
        >
          {visual.result}
        </motion.p>
      </div>
    );
  }

  if (visual.kind === 'chips') {
    return (
      <div>
        <div className="flex flex-wrap gap-3">
          {visual.items.map((it, i) => (
            <motion.span
              key={it}
              initial={{ opacity: 0, scale: reduce ? 1 : 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.2, type: 'spring', stiffness: 300, damping: 18 }}
              className={`rounded-2xl px-6 py-4 font-kinetic font-bold text-2xl ${i === visual.items.length - 1 ? 'bg-[#fff] text-[#0a1f44]' : 'bg-[#0063e6] text-[#fff]'}`}
            >
              {it}
            </motion.span>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-6 text-[#c9d9f0] font-semibold">
          {visual.caption}
        </motion.p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {visual.items.map((it, i) => (
        <motion.li key={it} {...step(i)} className="flex items-center gap-4">
          <span className="relative w-10 h-10 rounded-full grid place-items-center bg-[#fff]/12 font-kinetic font-bold shrink-0">
            <motion.span
              className="absolute inset-0 rounded-full bg-[#0063e6]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.25, type: 'spring', stiffness: 260, damping: 16 }}
            />
            <Check className="relative w-4 h-4" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold">{it}</span>
        </motion.li>
      ))}
    </ol>
  );
}

/**
 * Los siete hitos del proyecto como una escena fija que avanza con el scroll: la sección ocupa varias pantallas
 * y, mientras la recorres, el proyecto pasa de un hito al siguiente. Con movimiento reducido sigue funcionando por scroll, sin saltos.
 */
export default function SimulatorJourney() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const n = SIMULATOR.steps.length;
  const fill = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useMotionValueEvent(scrollYProgress, 'change', (v) => setActive(Math.min(n - 1, Math.max(0, Math.floor(v * n)))));

  const scrollTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + (total * (i + 0.5)) / n, behavior: reduce ? 'auto' : 'smooth' });
  };

  const scene = SCENES[active];

  return (
    <section id="como" ref={ref} aria-labelledby="como-title" className="field-navy relative scroll-mt-0" style={{ height: `${n * 85 + 40}svh` }}>
      <div className="sticky top-0 h-svh overflow-hidden px-4 md:px-6 pt-24 md:pt-28 pb-8 flex flex-col">
        <div className="hero-glow pointer-events-none absolute -bottom-72 -right-48 w-[44rem] h-[44rem]" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto w-full flex-1 flex flex-col min-h-0">
          <h2 id="como-title" className="font-kinetic font-bold text-2xl md:text-5xl leading-[1.1] max-w-3xl">
            Tu proyecto, <span className="ui-hl">hito a hito</span>
          </h2>

          <div className="mt-6 md:mt-10 flex-1 min-h-0 grid lg:grid-cols-[0.8fr_1.2fr] gap-5 lg:gap-14 items-start lg:items-center content-start">
            <div className="relative hidden lg:block">
              <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-[#fff]/15" aria-hidden="true" />
              <motion.div className="absolute left-[19px] top-3 w-0.5 bg-[#4d94ff]" style={{ height: fill }} aria-hidden="true" />
              <ol className="relative space-y-4">
                {SIMULATOR.steps.map((s, i) => {
                  const on = i === active;
                  const past = i < active;
                  return (
                    <li key={s}>
                      <button type="button" onClick={() => scrollTo(i)} aria-current={on ? 'step' : undefined} className="flex items-center gap-4 text-left cursor-pointer group">
                        <span
                          className={`w-10 h-10 rounded-full grid place-items-center font-kinetic font-bold text-sm shrink-0 transition-colors duration-300 ${
                            on ? 'bg-[#0063e6] text-[#fff] scale-110' : past ? 'bg-[#4d94ff] text-[#0a1f44]' : 'bg-[#0d2a5e] text-[#c9d9f0] ring-1 ring-[#fff]/20'
                          }`}
                        >
                          {past ? <Check className="w-4 h-4" aria-hidden="true" /> : i + 1}
                        </span>
                        <span className={`font-kinetic font-bold leading-snug transition-all duration-300 ${on ? 'text-2xl text-[#fff]' : 'text-base text-[#c9d9f0]/70 group-hover:text-[#fff]'}`}>{s}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="lg:hidden flex items-center gap-1.5" aria-hidden="true">
              {SIMULATOR.steps.map((s, i) => (
                <span key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= active ? 'bg-[#4d94ff]' : 'bg-[#fff]/15'}`} />
              ))}
            </div>

            <div className="relative rounded-[2rem] bg-[#0d2a5e] ring-1 ring-[#fff]/15 p-5 md:p-10 min-h-0 max-h-full overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: reduce ? 0 : 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : -24 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  aria-live="polite"
                >
                  <p className="font-kinetic font-bold text-[#4d94ff] text-lg">
                    Hito {active + 1} de {n}
                  </p>
                  <h3 className="font-kinetic font-bold text-2xl md:text-4xl leading-tight mt-2">{SIMULATOR.steps[active]}</h3>
                  <p className="text-[#c9d9f0] text-base md:text-lg leading-relaxed mt-4 max-w-xl">{scene.text}</p>
                  <div className="mt-5 md:mt-8">
                    <SceneVisual visual={scene.visual} />
                  </div>
                  <p className="mt-6 text-xs text-[#c9d9f0]/70">Ejemplo ilustrativo del tipo de trabajo de cada hito.</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
