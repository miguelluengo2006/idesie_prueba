'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpenCheck, ChevronDown, GraduationCap, Layers, Rocket, Sparkles, Users, Workflow } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';

interface Item {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  badge?: string;
}

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: 'Programas',
    items: [
      { href: '/formacion', label: 'Másteres BIM', desc: 'Blended (50% presencial) y 100% online', icon: GraduationCap },
      { href: '/microcredenciales', label: 'Microcredenciales', desc: '23 módulos acumulables de 1 a 3 ECTS', icon: Layers },
      { href: '/ia-bim', label: 'BIM con IA', desc: 'Inteligencia artificial aplicada al sector AEC', icon: Sparkles, badge: 'Nuevo' },
      { href: '/simulador', label: 'Simulador profesional', desc: 'Proyecto fin de máster con cliente real', icon: Rocket },
    ],
  },
  {
    title: 'Cómo formamos',
    items: [
      { href: '/metodologia', label: 'Metodología', desc: 'Learning by Working: aprender trabajando', icon: Workflow },
      { href: '/profesores', label: 'Profesores', desc: 'Profesionales en activo del sector AEC', icon: Users },
      { href: '/certificacion', label: 'Ruta a la certificación', desc: 'Formación y experiencia hasta AECOMI', icon: BookOpenCheck },
    ],
  },
];

/** Menú desplegable "Formación" de la cabecera (escritorio): se abre al pasar el ratón, al hacer clic o con el teclado. */
export default function FormacionMenu({ triggerClass }: { triggerClass: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useEscapeKey(open, close);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative hidden lg:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="formacion-menu"
        onClick={() => setOpen((v) => !v)}
        className={`${triggerClass} inline-flex items-center gap-1 cursor-pointer`}
      >
        Formación
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div id="formacion-menu" className="absolute left-0 top-full pt-3 w-[min(680px,calc(100vw-2rem))]">
          {/* Colores propios (no los del tema): el panel siempre es claro, con tinta oscura y acento azul */}
          <div className="overflow-hidden rounded-2xl border border-[#0a1f44]/10 bg-[#ffffff] shadow-[0_30px_70px_-20px_rgba(10,31,68,0.45)] text-[#0d1522]">
            <div className="grid grid-cols-2 gap-x-2 p-3">
              {GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="px-3 pt-2 pb-2 text-[11px] font-bold tracking-[0.2em] uppercase text-[#0a1f44]/50">{group.title}</p>
                  <ul>
                    {group.items.map(({ href, label, desc, icon: Icon, badge }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          onClick={close}
                          className="group flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-[#0063e6]/8 focus-visible:bg-[#0063e6]/10 focus-visible:outline-none transition-colors"
                        >
                          <span className="mt-0.5 w-9 h-9 shrink-0 rounded-lg bg-[#0063e6]/10 text-[#0063e6] flex items-center justify-center transition-colors group-hover:bg-[#0063e6] group-hover:text-[#ffffff]">
                            <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-2 text-sm font-semibold leading-tight text-[#0d1522]">
                              {label}
                              {badge && (
                                <span className="text-[10px] font-bold tracking-wide uppercase rounded-full bg-[#ffc933] text-[#0a1f44] px-2 py-0.5">
                                  {badge}
                                </span>
                              )}
                            </span>
                            <span className="block text-xs text-[#0d1522]/65 leading-snug mt-1">{desc}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Link
              href="/perfiles"
              onClick={close}
              className="group flex items-center justify-between gap-4 bg-[#0a1f44] text-[#f4f8ff] px-6 py-3.5 text-sm hover:bg-[#0d2a5c] transition-colors"
            >
              <span>
                <b className="font-semibold">¿No sabes por dónde empezar?</b>{' '}
                <span className="text-[#c9d9f0]">Elige el puesto al que quieres llegar y te damos el mapa.</span>
              </span>
              <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
