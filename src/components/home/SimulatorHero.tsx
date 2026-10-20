'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import { BookCallButton } from './BookCall';

const EASE = [0.22, 1, 0.36, 1] as const;
const ROLES = ['BIM Design Manager', 'BIM Construction Manager', 'Information Delivery Manager'];
const TOASTS = [
  'El cliente ha pedido un cambio en la fachada',
  'Acta de seguimiento subida al entorno común de datos',
  'Nueva versión del modelo federado',
  'El cliente ha aprobado el plan de ejecución',
];
const ROWS = [
  { label: 'Requisitos del cliente', state: 'Aprobado' },
  { label: 'Plan de ejecución BIM', state: 'Aprobado' },
  { label: 'Entrega a cliente · modelo federado', state: 'En revisión' },
  { label: 'Reunión de seguimiento', state: 'Jueves' },
];

/** Portada del simulador: una consola de proyecto «en curso» que se mueve sola, con un cliente que escribe y un rol que cambia. */
export default function SimulatorHero() {
  const reduce = useReducedMotion();
  const [role, setRole] = useState(0);
  const [toast, setToast] = useState(0);
  const [hito, setHito] = useState(3);

  useEffect(() => {
    if (reduce) return;
    const a = setInterval(() => setRole((r) => (r + 1) % ROLES.length), 3200);
    const b = setInterval(() => setToast((t) => (t + 1) % TOASTS.length), 3800);
    const c = setInterval(() => setHito((h) => (h % 7) + 1), 2600);
    return () => {
      clearInterval(a);
      clearInterval(b);
      clearInterval(c);
    };
  }, [reduce]);

  // Inclinación suave según el puntero.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 90, damping: 18 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 90, damping: 18 });

  const rise = (d: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: d, ease: EASE },
  });

  return (
    <section
      className="field-navy relative overflow-hidden px-4 md:px-6 pt-32 md:pt-40 pb-24 md:pb-32 min-h-[92svh] flex items-center"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
    >
      <div className="hero-glow pointer-events-none absolute -top-48 -right-32 w-[52rem] h-[52rem]" aria-hidden="true" />
      <div className="hero-glow hero-glow-b pointer-events-none absolute -bottom-64 -left-48 w-[40rem] h-[40rem]" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-[1.1fr_1fr] gap-14 lg:gap-12 items-center">
        <div>
          <motion.h1 {...rise(0.05)} className="font-kinetic font-bold text-[clamp(2rem,3.5vw,3.25rem)] leading-[1.12]">
            La experiencia que te piden, <span className="ui-hl">ya puedes tenerla</span>
          </motion.h1>
          <motion.p {...rise(0.2)} className="text-lg md:text-xl text-[#c9d9f0] leading-relaxed mt-7 max-w-xl">
            Un proyecto completo con empresas reales como cliente. Para que la falta de experiencia deje de frenar tu carrera.
          </motion.p>
          <motion.div {...rise(0.35)} className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
            <BookCallButton pack="Simulador profesional" className="btn btn-blue">
              Quiero participar
              <span className="btn-dot bg-[#fff]/20">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </BookCallButton>
            <Link href="#como" className="font-semibold underline underline-offset-[6px] decoration-2 decoration-[#7db4ff] hover:decoration-[#fff] transition-colors">
              Así funciona
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 50, scale: reduce ? 1 : 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.25, ease: EASE }}
          style={{ perspective: 1200 }}
          className="relative"
        >
          <motion.div
            style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
            className="rounded-[2rem] bg-[#0d2a5e] ring-1 ring-[#fff]/20 p-6 md:p-8 shadow-[0_50px_100px_-30px_rgba(0,70,200,0.7)]"
            role="img"
            aria-label="Ejemplo ilustrativo de un proyecto del simulador en curso: rehabilitación de un edificio residencial, hito 3 de 7."
          >
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#c9d9f0]">
                <span className="relative flex w-2.5 h-2.5">
                  <span className="absolute inset-0 rounded-full bg-[#7db4ff] animate-ping" />
                  <span className="relative rounded-full w-2.5 h-2.5 bg-[#7db4ff]" />
                </span>
                Simulador en curso
              </p>
              <p className="text-xs text-[#c9d9f0]/80">Ejemplo ilustrativo</p>
            </div>

            <p className="font-kinetic font-bold text-2xl md:text-3xl leading-tight mt-6">Rehabilitación de edificio residencial</p>
            <p className="mt-3 text-[#c9d9f0] flex flex-wrap items-center gap-x-2">
              Cliente: una empresa colaboradora · Tu rol:
              <span className="relative inline-block min-w-[13.5rem] h-7 align-middle">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={role}
                    initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduce ? 0 : -10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-0 top-0 font-semibold text-[#fff] whitespace-nowrap"
                  >
                    {ROLES[role]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </p>

            <div className="mt-6">
              <p className="text-sm font-semibold text-[#c9d9f0]">Hito {hito} de 7</p>
              <div className="mt-2 grid grid-cols-7 gap-1.5" aria-hidden="true">
                {Array.from({ length: 7 }, (_, i) => (
                  <motion.span key={i} animate={{ backgroundColor: i < hito ? '#4d94ff' : 'rgba(255,255,255,0.15)' }} transition={{ duration: 0.4 }} className="h-2 rounded-full" />
                ))}
              </div>
            </div>

            <ul className="mt-6 space-y-2.5">
              {ROWS.map((r, i) => (
                <motion.li
                  key={r.label}
                  initial={{ opacity: 0, x: reduce ? 0 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + i * 0.15, ease: EASE }}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-[#fff]/8 px-4 py-3"
                >
                  <span className="text-[15px] leading-snug">{r.label}</span>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                      r.state === 'Aprobado' ? 'bg-[#0063e6] text-[#fff]' : r.state === 'En revisión' ? 'bg-[#fff] text-[#0a1f44] hero-float-a' : 'bg-[#fff]/15 text-[#fff]'
                    }`}
                  >
                    {r.state === 'Aprobado' && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                    {r.state}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <div className="absolute -bottom-6 md:-bottom-8 -left-2 md:-left-10 max-w-[17rem] md:max-w-xs" aria-live="off">
            <AnimatePresence mode="wait">
              <motion.p
                key={toast}
                initial={{ opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: reduce ? 0 : -16 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="rounded-2xl bg-[#fff] text-[#0a1f44] px-4 py-3 text-sm font-semibold leading-snug shadow-[0_24px_50px_-20px_rgba(0,20,70,0.8)]"
              >
                {TOASTS[toast]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
