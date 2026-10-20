'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { CONTACT, MICROS } from '@/lib/bim';
import { PHOTOS, SIMULATOR, type Photo } from '@/lib/content';

const EASE = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_MS = 4000;

const AI_MICROS = ['21', '18', '19', '20'].map((code) => MICROS.find((m) => m.code === code)!);

interface Slide {
  id: string;
  tab: string;
  bg: string;
  pre?: string;
  mark: string;
  post?: string;
  text: string;
  cta: { href: string; label: string };
  badge?: string;
  photo: Photo;
  visual: React.ReactNode;
}

/** Tarjeta blanca común a los fragmentos de interfaz del carrusel: la elevación se declara una sola vez, con sombra. */
function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#fff] text-[#0d1522] rounded-2xl p-7 shadow-[0_40px_70px_-34px_rgba(0,10,40,0.7)] ${className}`}>{children}</div>
  );
}

/** Foto de la diapositiva con una tarjeta pequeña montada en la esquina: la imagen cuenta la historia y la tarjeta la concreta. */
function PhotoVisual({ photo, priority = false, children }: { photo: Photo; priority?: boolean; children: React.ReactNode }) {
  return (
    <div className="relative max-w-lg ml-auto pb-10 pl-10">
      <div className="overflow-hidden rounded-2xl shadow-[0_40px_70px_-34px_rgba(0,10,40,0.7)] aspect-[4/3]">
        <Image
          src={photo.src}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          priority={priority}
          sizes="(min-width: 1024px) 40vw, 0px"
          className="w-full h-full object-cover"
        />
      </div>
      <Panel className="absolute left-0 bottom-0 max-w-[17rem] !p-5">{children}</Panel>
    </div>
  );
}

const CardLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#0d1522]/60">{children}</p>
);

const SLIDES: Slide[] = [
  {
    id: 'competencias',
    tab: 'Formamos en competencias',
    bg: '#0a1f44',
    mark: 'Formamos en competencias',
    text: 'La escuela tecnológica para arquitectos e ingenieros. Certificación universitaria UTAMED · Certificación profesional AECOMI.',
    cta: { href: '/masters', label: 'Programas' },
    badge: 'Business & Tech School · Learning by Working',
    photo: PHOTOS.clase,
    visual: <PhotoVisual photo={PHOTOS.clase} priority>
        <CardLabel>Doble certificación</CardLabel>
        <p className="font-kinetic font-bold text-lg mt-2 leading-snug">UTAMED + AECOMI</p>
        <p className="text-[13px] text-[#0d1522]/70 mt-1">Universitaria y profesional</p>
      </PhotoVisual>,
  },
  {
    id: 'simulador',
    tab: 'Simulador profesional',
    bg: '#0042a3',
    pre: 'Te damos la',
    mark: 'experiencia profesional',
    post: 'que necesitas',
    badge: 'Novedad · Simulador profesional',
    text: 'Un proyecto completo con empresas reales como cliente, antes de tu primer contrato.',
    cta: { href: '/simulador', label: 'Leer más' },
    photo: PHOTOS.reunion,
    visual: <PhotoVisual photo={PHOTOS.reunion}>
        <CardLabel>Un proyecto completo</CardLabel>
        <p className="font-kinetic font-bold text-lg mt-2 leading-snug">{SIMULATOR.steps.length} pasos con cliente real</p>
        <p className="text-[13px] text-[#0d1522]/70 mt-1">De los requisitos a la defensa</p>
      </PhotoVisual>,
  },
  {
    id: 'certificacion',
    tab: 'Certifica tu perfil',
    bg: '#00132e',
    pre: 'Certifica tu',
    mark: 'perfil profesional',
    text: 'Las empresas ya no buscan currículum. Buscan que sepas hacer el trabajo.',
    cta: { href: '/certificacion', label: 'Leer más' },
    photo: PHOTOS.auditorio,
    visual: <PhotoVisual photo={PHOTOS.auditorio}>
        <CardLabel>Certificado profesional</CardLabel>
        <p className="font-kinetic font-bold text-lg mt-2 leading-snug">Tu carnet digital</p>
        <p className="text-[13px] text-[#0d1522]/70 mt-1">Emitido por AECOMI y verificable</p>
      </PhotoVisual>,
  },
  {
    id: 'ia',
    tab: 'IA aplicada',
    bg: '#0052cc',
    pre: 'No te contamos la IA.',
    mark: 'La aplicamos',
    badge: 'Novedad · IA aplicada a la arquitectura y la ingeniería',
    text: 'Del estudio previo a la operación del edificio, la inteligencia artificial ya forma parte de nuestros programas.',
    cta: { href: '/ia-bim', label: 'Programas de IA' },
    photo: PHOTOS.tableta,
    visual: <PhotoVisual photo={PHOTOS.tableta}>
        <CardLabel>Herramientas que aprenderás</CardLabel>
        <ul className="mt-2 space-y-1">
          {AI_MICROS.slice(0, 3).map((m) => (
            <li key={m.code} className="text-[14px] font-semibold leading-snug">{m.title}</li>
          ))}
        </ul>
      </PhotoVisual>,
  },
];

export default function HeroCarousel() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState(false);
  const [touchX, setTouchX] = useState<number | null>(null);

  useEffect(() => setReady(true), []);

  const go = useCallback((i: number) => setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length), []);
  const running = !reduce && !hover;

  const container: Variants = {
    hide: { transition: { duration: 0 } },
    show: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: reduce ? 0 : 0.12 } },
  };
  const rise: Variants = {
    hide: { opacity: 0, y: reduce ? 0 : 26, transition: { duration: 0.2 } },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.75, ease: EASE } },
  };
  const slideIn: Variants = {
    hide: { opacity: 0, x: reduce ? 0 : 48, transition: { duration: 0.2 } },
    show: { opacity: 1, x: 0, transition: { duration: reduce ? 0 : 0.9, ease: EASE, delay: reduce ? 0 : 0.3 } },
  };

  return (
    <section
      role="region"
      aria-roledescription="carrusel"
      aria-label="Programas destacados"
      // Solo se pausa con ratón o teclado: en el móvil un toque dejaba «hover» activo y el carrusel se quedaba parado
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(false)}
      onFocusCapture={(e) => e.target.matches(':focus-visible') && setHover(true)}
      onBlurCapture={() => setHover(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1);
        if (e.key === 'ArrowLeft') go(index - 1);
      }}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        setTouchX(null);
      }}
      className="relative isolate overflow-hidden text-[#fff] min-h-[840px] h-[100svh] max-h-[940px] grid"
    >
      <h1 className="sr-only">
        {CONTACT.name} {CONTACT.tagline}: másteres BIM, microcredenciales y certificación de perfiles
      </h1>

      {SLIDES.map((slide, i) => {
        const active = i === index;
        return (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${SLIDES.length}`}
            aria-hidden={!active}
            inert={!active}
            className="[grid-area:1/1] relative transition-[opacity,visibility] duration-700 ease-out"
            style={{ background: slide.bg, opacity: active ? 1 : 0, visibility: active ? 'visible' : 'hidden', zIndex: active ? 1 : 0 }}
          >
            <div className="hc-grid" aria-hidden="true" />
            <motion.div
              variants={container}
              initial="hide"
              animate={active && ready ? 'show' : 'hide'}
              className="relative mx-auto max-w-[1320px] h-full px-[clamp(20px,5vw,72px)] pt-32 md:pt-40 pb-44 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center"
            >
              <div>
                <motion.h2
                  variants={rise}
                  className="font-kinetic font-bold text-[clamp(1.9rem,3.8vw,3rem)] leading-[1.18] tracking-[-0.02em] text-balance"
                >
                  {slide.pre && <span>{slide.pre} </span>}
                  <span className="inline bg-[#fff] text-[#0a1f44] px-3 box-decoration-clone">{slide.mark}</span>
                  {slide.post && <span> {slide.post}</span>}
                </motion.h2>
                {slide.badge && (
                  <motion.p variants={rise} className="mt-7">
                    <span className="inline-block text-xs font-bold rounded-full bg-[#ffba08] text-[#0a1f44] px-3 py-1">{slide.badge}</span>
                  </motion.p>
                )}
                <motion.p variants={rise} className="mt-8 text-lg md:text-xl leading-relaxed text-[#fff]/85 max-w-[34rem]">
                  {slide.text}
                </motion.p>
                <motion.div variants={rise} className="mt-12">
                  <Link
                    href={slide.cta.href}
                    className="group inline-flex items-center gap-3 rounded-full bg-[#ffba08] text-[#0a1f44] pl-7 pr-3 py-2.5 min-h-12 font-semibold hover:bg-[#fff] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fff]"
                  >
                    {slide.cta.label}
                    <span className="w-9 h-9 rounded-full bg-[#0a1f44] text-[#fff] flex items-center justify-center transition-transform group-hover:translate-x-1">
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </Link>
                </motion.div>
              </div>
              <motion.div variants={slideIn} className="hidden lg:block">
                {slide.visual}
              </motion.div>
            </motion.div>
          </div>
        );
      })}

      {/* Controles: pestañas con progreso, anterior/siguiente y pausa */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto max-w-[1320px] px-[clamp(20px,5vw,72px)] pb-24 flex items-end justify-between gap-8 sm:gap-12">
          <div className="flex items-end gap-3 sm:gap-6 flex-1 min-w-0">
            {SLIDES.map((slide, i) => {
              const active = i === index;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Ir a la diapositiva ${i + 1}: ${slide.tab}`}
                  aria-current={active}
                  className="group relative flex-1 max-w-48 text-left pt-5 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fff] rounded-sm"
                >
                  <span className={`hidden lg:block text-[13px] font-semibold mb-2.5 transition-colors ${active ? 'text-[#fff]' : 'text-[#fff]/65 group-hover:text-[#fff]'}`}>
                    {slide.tab}
                  </span>
                  <span className="block h-[3px] rounded-full bg-[#fff]/25 overflow-hidden">
                    {active && (
                      <span
                        key={index}
                        className={`block h-full bg-[#fff] origin-left ${reduce ? '' : 'hc-progress'}`}
                        style={{
                          transform: reduce ? 'scaleX(1)' : undefined,
                          animationDuration: `${AUTOPLAY_MS}ms`,
                          animationPlayState: running ? 'running' : 'paused',
                        }}
                        onAnimationEnd={() => go(index + 1)}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Diapositiva anterior"
              className="w-11 h-11 inline-flex items-center justify-center rounded-full border border-[#fff]/35 hover:bg-[#fff] hover:text-[#0a1f44] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Diapositiva siguiente"
              className="w-11 h-11 inline-flex items-center justify-center rounded-full border border-[#fff]/35 hover:bg-[#fff] hover:text-[#0a1f44] transition-colors cursor-pointer"
            >
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
