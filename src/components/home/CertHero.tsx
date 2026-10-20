'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import CertCard from './CertCard';
import { PROFILES } from '@/lib/bim';

const EASE = [0.22, 1, 0.36, 1] as const;
const CERT = PROFILES.filter((p) => p.certifiable);

/** Portada de certificación: tu carnet digital, que se personaliza con tu nombre y el perfil que elijas. */
export default function CertHero() {
  const reduce = useReducedMotion();
  const [name, setName] = useState('');
  const [idx, setIdx] = useState(0);

  const rise = (d: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: d, ease: EASE },
  });

  return (
    <section className="field-navy relative overflow-hidden px-4 md:px-6 pt-32 md:pt-40 pb-20 md:pb-28 min-h-[92svh] flex items-center">
      <div className="hero-glow pointer-events-none absolute -top-48 -left-40 w-[46rem] h-[46rem]" aria-hidden="true" />
      <div className="hero-glow hero-glow-b pointer-events-none absolute -bottom-64 -right-32 w-[40rem] h-[40rem]" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-14 items-center">
        <div>
          <motion.h1 {...rise(0.05)} className="font-kinetic font-bold text-[clamp(2rem,3.7vw,3.3rem)] leading-[1.12]">
            Tu carnet digital de <span className="ui-hl">competencias</span>
          </motion.h1>
          <motion.p {...rise(0.2)} className="text-lg md:text-xl text-[#c9d9f0] leading-relaxed mt-7 max-w-xl">
            Las empresas ya no buscan currículum: buscan que sepas hacer el trabajo. El certificado profesional lo demuestra, y cualquier empresa puede verificarlo.
          </motion.p>
          <motion.div {...rise(0.35)} className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="#pasos" className="btn btn-blue">
              Cómo se obtiene
              <span className="btn-dot bg-[#fff]/20">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </Link>
            <a href="https://www.aecomi.org" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-[6px] decoration-2 decoration-[#7db4ff] hover:decoration-[#fff] transition-colors">
              aecomi.org ↗
            </a>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: reduce ? 0 : 50, scale: reduce ? 1 : 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1, delay: 0.25, ease: EASE }}>
          <CertCard profile={CERT[idx].name} holder={name.trim() || 'Tu nombre'} />
          <div className="mt-6 grid sm:grid-cols-[1fr_auto] gap-3 items-end">
            <label className="block">
              <span className="text-sm font-semibold text-[#c9d9f0]">Escribe tu nombre y míralo en el carnet</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 32))}
                maxLength={32}
                autoComplete="off"
                placeholder="Tu nombre"
                className="mt-2 w-full min-h-12 rounded-full bg-[#fff]/10 ring-1 ring-[#fff]/25 px-5 text-[#fff] placeholder:text-[#c9d9f0]/60 focus:bg-[#fff]/16"
              />
            </label>
            <div role="group" aria-label="Perfil del carnet" className="flex flex-wrap gap-2">
              {CERT.map((p, i) => (
                <button
                  key={p.code}
                  type="button"
                  aria-pressed={i === idx}
                  onClick={() => setIdx(i)}
                  className={`min-h-12 px-4 rounded-full text-sm font-bold transition-colors cursor-pointer ${i === idx ? 'bg-[#fff] text-[#0a1f44]' : 'bg-[#fff]/12 hover:bg-[#fff]/24'}`}
                >
                  {p.code}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-[#c9d9f0]/80">Ejemplo ilustrativo: no es un certificado real. Tu nombre no se envía a ningún sitio.</p>
        </motion.div>
      </div>
    </section>
  );
}
