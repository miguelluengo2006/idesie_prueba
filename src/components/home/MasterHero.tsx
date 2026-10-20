'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { BookCallButton } from './BookCall';
import { PHOTOS } from '@/lib/content';
import type { Master } from '@/lib/masters';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Portada del máster: campo marino con luz azul en movimiento lento, titular que entra escalonado,
 * foto enmarcada con paralaje suave y dos tarjetas de cristal. Sin amarillo: solo la paleta azul de marca.
 */
export default function MasterHero({ master }: { master: Master }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 70]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section ref={ref} className="field-navy relative overflow-hidden px-4 md:px-6 pt-32 md:pt-40 pb-20 md:pb-28">
      <motion.div style={{ y: glowY }} className="hero-glow pointer-events-none absolute -top-40 -right-40 w-[46rem] h-[46rem]" aria-hidden="true" />
      <div className="hero-glow hero-glow-b pointer-events-none absolute -bottom-56 -left-40 w-[36rem] h-[36rem]" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-16 items-center">
        <div>
          <motion.h1 {...rise(0.05)} className="font-kinetic font-bold text-[clamp(2rem,4vw,3.5rem)] leading-[1.12]">
            {master.headline.pre} <span className="ui-hl">{master.headline.mark}</span>
            {master.headline.post}
          </motion.h1>
          <motion.p {...rise(0.2)} className="text-lg md:text-xl text-[#c9d9f0] leading-relaxed mt-7 max-w-xl">
            {master.lead}
          </motion.p>
          <motion.div {...rise(0.35)} className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
            <BookCallButton pack={master.name} className="btn btn-blue">
              Solicitar información
              <span className="btn-dot bg-[#fff]/20">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </BookCallButton>
            <Link href="#recorrido" className="font-semibold underline underline-offset-[6px] decoration-2 decoration-[#7db4ff] hover:decoration-[#fff] transition-colors">
              Ver el recorrido
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: reduce ? 1 : 0.95, y: reduce ? 0 : 36 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          className="relative"
        >
          <motion.div style={{ y: photoY }} className="relative aspect-[3/2] lg:aspect-[4/5] rounded-[2rem] overflow-hidden ring-1 ring-[#fff]/20 shadow-[0_40px_80px_-30px_rgba(0,40,120,0.8)]">
            <Image src={PHOTOS.clase.src} alt={PHOTOS.clase.alt} fill priority sizes="(min-width: 1024px) 42vw, 92vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f44]/70 via-transparent to-transparent" aria-hidden="true" />
          </motion.div>

          <div className="hero-float-a absolute left-3 md:-left-10 bottom-10 rounded-2xl bg-[#fff]/12 backdrop-blur-xl ring-1 ring-[#fff]/25 px-5 py-4 max-w-[15rem]">
            <p className="font-kinetic font-bold text-3xl">{master.facts[0].value}</p>
            <p className="text-sm text-[#f4f8ff] leading-snug mt-1">{master.facts[0].label}</p>
          </div>
          <div className="hero-float-b absolute right-3 md:-right-6 top-10 rounded-2xl bg-[#0063e6] px-5 py-3 font-kinetic font-bold text-lg shadow-[0_20px_40px_-16px_rgba(0,99,230,0.9)]">
            {master.mode}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
