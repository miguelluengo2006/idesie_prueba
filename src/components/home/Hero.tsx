'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check, Circle } from 'lucide-react';
import Marquee from './Marquee';
import { BookCallButton } from './BookCall';

const TICKER_WORDS = ['MICROCREDENCIALES', 'MÁSTER BIM', 'SIMULADOR PROFESIONAL', 'CERTIFICACIÓN AECOMI', 'LEARNING BY WORKING', 'CONSULTORÍA BIM'];

// Ejemplo del mapa de competencias: las 3 primeras ya acreditadas (1 + 2 + 2 = 5 ECTS de 26)
const MAP_EXAMPLE = [
  { title: 'Fundamentos de la metodología BIM', done: true },
  { title: 'Protocolos y estándares BIM', done: true },
  { title: 'Trabajo colaborativo. CDE', done: true },
  { title: 'Modelado: arquitectura y estructuras', done: false },
  { title: 'Coordinación y revisión de modelos', done: false },
];

export default function Hero() {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 px-4 md:px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.25fr_1fr] gap-12 lg:gap-14 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-[var(--signal)] mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)]" />
            Formación BIM desde 2012 · Learning by Working
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-kinetic font-black uppercase leading-[1.02] tracking-tight text-[1.65rem] sm:text-4xl lg:text-[2.6rem] xl:text-5xl"
          >
            Elige el puesto al que quieres llegar.{' '}
            <span className="home-glow-text text-[var(--signal)]">Te damos el mapa para alcanzarlo.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 space-y-6"
          >
            <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">
              Suma competencias con microcredenciales, cursa nuestro Máster BIM y prepárate para certificar tu perfil
              profesional con AECOMI.
            </p>

            <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
              <span className="font-kinetic font-bold text-sm md:text-base">IDESIE prepara</span>
              <ArrowRight className="w-4 h-4 text-[var(--signal)]" aria-hidden="true" />
              <span className="font-kinetic font-bold text-sm md:text-base text-[var(--signal)]">AECOMI certifica</span>
            </div>
            <p className="text-sm text-white/50">Entidad formativa acreditada por AECOMI</p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/perfiles"
                className="group inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-[var(--signal)] text-black hover:bg-[var(--signal-dim)] transition-colors"
              >
                <span className="text-sm font-medium tracking-wide">Explorar perfiles profesionales</span>
                <span className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center group-hover:rotate-45 transition-transform">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
              <Link
                href="/formacion"
                className="inline-flex items-center px-6 py-3.5 rounded-full border border-white/15 hover:border-[var(--signal)] text-sm font-medium tracking-wide transition-colors"
              >
                Ver el Máster BIM
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-white/10 bg-black/60 p-6 md:p-8 shadow-[0_24px_60px_-34px_rgba(0,40,110,0.55)]"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs tracking-[0.2em] uppercase text-white/50">Tu mapa de competencias</p>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--signal)]/10 text-[var(--signal)]">Ejemplo</span>
          </div>
          <h2 className="font-kinetic font-bold text-xl md:text-2xl mt-5">BIM Design Manager</h2>
          <div className="mt-5 h-2.5 rounded-full bg-white/10 overflow-hidden" role="img" aria-label="3 de 14 microcredenciales completadas">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '19%' }}
              transition={{ duration: 1.1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-[var(--signal)]"
            />
          </div>
          <p className="text-sm text-white/60 mt-3">3 de 14 microcredenciales · 5 de 26 ECTS</p>
          <ul className="mt-5 space-y-3">
            {MAP_EXAMPLE.map((item) => (
              <li key={item.title} className={`flex items-center gap-3 text-[15px] ${item.done ? '' : 'text-white/50'}`}>
                {item.done ? (
                  <Check className="w-5 h-5 shrink-0 text-[var(--signal)]" strokeWidth={2.5} aria-label="Acreditada" />
                ) : (
                  <Circle className="w-5 h-5 shrink-0 text-white/30" aria-label="Pendiente" />
                )}
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 pt-4 border-t border-white/10 text-sm font-medium">Meta: certificación AECOMI del perfil</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-16 md:mt-24 border-y border-white/10 py-5"
      >
        <Marquee
          items={TICKER_WORDS.map((word) => (
            <span key={word} className="flex items-center gap-6 px-6">
              <span className="font-kinetic text-2xl md:text-3xl uppercase text-white/25">{word}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)]" />
            </span>
          ))}
        />
      </motion.div>

    </section>
  );
}
