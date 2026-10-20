'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import CertCard from './CertCard';

const STEPS = [
  { t: 'Elige tu perfil', x: 'Decide el puesto al que quieres llegar y consulta su mapa de competencias.', link: { href: '/perfiles', label: 'Ver perfiles' } },
  { t: 'Fórmate en competencias', x: 'Microcredenciales o máster en IDESIE, con certificación universitaria.', link: { href: '/masters', label: 'Ver programas' } },
  { t: 'Suma experiencia', x: 'Learning by Working en empresa o el simulador profesional.', link: { href: '/simulador', label: 'Ver simulador' } },
  { t: 'Certifícate con AECOMI', x: 'Evaluación independiente de tus competencias. Requisitos y proceso, en su web.', link: { href: 'https://www.aecomi.org', label: 'aecomi.org ↗', external: true } },
];

function Step({ i, active, onEnter }: { i: number; active: boolean; onEnter: (i: number) => void }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  useEffect(() => {
    if (inView) onEnter(i);
  }, [inView, i, onEnter]);
  const s = STEPS[i];
  return (
    <li ref={ref} className="min-h-[55svh] flex items-center">
      <motion.div
        animate={{ opacity: active ? 1 : 0.35, x: active || reduce ? 0 : -12 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        <p className="font-kinetic font-bold text-6xl md:text-8xl leading-none text-[#0063e6]">{i + 1}</p>
        <h3 className="font-kinetic font-bold text-2xl md:text-4xl leading-tight mt-4">{s.t}</h3>
        <p className="text-lg text-white/60 leading-relaxed mt-4">{s.x}</p>
        {'external' in s.link ? (
          <a href={s.link.href} target="_blank" rel="noopener noreferrer" className="group mt-5 inline-flex items-center gap-2 font-semibold underline underline-offset-[6px] decoration-2">
            {s.link.label}
          </a>
        ) : (
          <Link href={s.link.href} className="group mt-5 inline-flex items-center gap-2 font-semibold underline underline-offset-[6px] decoration-2">
            {s.link.label}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        )}
      </motion.div>
    </li>
  );
}

/** Cuatro pasos: el texto avanza con el scroll y el carnet de la derecha, que se queda fijo, se va completando. */
export default function CertSteps() {
  const [active, setActive] = useState(0);
  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-16">
      <ol>
        {STEPS.map((_, i) => (
          <Step key={i} i={i} active={i === active} onEnter={setActive} />
        ))}
      </ol>
      <div className="lg:sticky lg:top-0 lg:h-svh flex items-center order-first lg:order-none py-6 lg:py-0 sticky top-16 z-10 lg:z-auto">
        <div className="w-full">
          <CertCard profile="BIM Design Manager" holder="Tu nombre" stage={active + 1} />
          <p className="mt-3 text-xs text-[#0a1f44]/70">Ejemplo ilustrativo.</p>
        </div>
      </div>
    </div>
  );
}
