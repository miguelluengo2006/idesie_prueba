'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { BookCallButton } from './BookCall';
import LogoTile from './LogoTile';
import { COMPANY_LOGOS } from '@/lib/content';

const EASE = [0.22, 1, 0.36, 1] as const;
const FEATURED = ['Ferrovial', 'IDOM', 'Accenture', 'Schneider Electric', 'Estudio Lamela', 'Daikin'].map((n) => COMPANY_LOGOS.find((l) => l.name === n)!);

/** Portada de empresas: titular y un racimo de logos que entran escalonados y flotan con distinto ritmo. */
export default function EmpresasHero() {
  const reduce = useReducedMotion();
  const rise = (d: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: d, ease: EASE },
  });

  return (
    <section className="field-navy relative overflow-hidden px-4 md:px-6 pt-32 md:pt-40 pb-20 md:pb-28 min-h-[88svh] flex items-center">
      <div className="hero-glow pointer-events-none absolute -top-48 -right-32 w-[48rem] h-[48rem]" aria-hidden="true" />
      <div className="hero-glow hero-glow-b pointer-events-none absolute -bottom-64 -left-40 w-[38rem] h-[38rem]" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-14 items-center">
        <div>
          <motion.h1 {...rise(0.05)} className="font-kinetic font-bold text-[clamp(2rem,3.8vw,3.4rem)] leading-[1.12]">
            Definid con nosotros los <span className="ui-hl">perfiles</span> que necesitáis
          </motion.h1>
          <motion.p {...rise(0.2)} className="text-lg md:text-xl text-[#c9d9f0] leading-relaxed mt-7 max-w-xl">
            Formación in-company, talento y consultoría BIM en un mismo interlocutor: el puente entre la escuela y la empresa, con la IA integrada en cada servicio.
          </motion.p>
          <motion.div {...rise(0.35)} className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
            <BookCallButton pack="Empresas" className="btn btn-blue">
              Hablar con nosotros
              <span className="btn-dot bg-[#fff]/20">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </BookCallButton>
            <Link href="#confian" className="font-semibold underline underline-offset-[6px] decoration-2 decoration-[#7db4ff] hover:decoration-[#fff] transition-colors">
              Quién confía en IDESIE
            </Link>
          </motion.div>
        </div>

        <ul className="grid grid-cols-2 gap-3 md:gap-4" aria-label="Algunas de las empresas que confían en IDESIE">
          {FEATURED.map((l, i) => (
            <motion.li
              key={l.name}
              initial={{ opacity: 0, y: reduce ? 0 : 40, scale: reduce ? 1 : 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: EASE }}
              className={i % 2 ? 'mt-6 md:mt-10' : ''}
            >
              <div className={i % 2 ? 'hero-float-b' : 'hero-float-a'}>
                <LogoTile logo={l} className="shadow-[0_30px_60px_-30px_rgba(0,40,130,0.9)]" />
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
