'use client';

import { ArrowRight } from 'lucide-react';
import { metaTrackCustom } from '@/lib/metaPixel';
import { gaEvent } from '@/lib/googleAnalytics';
import { PROGRAM_EVENT, type ProgramKey } from './EnrollForm';

/** Lleva al formulario de inscripción con la modalidad ya elegida. Sin JavaScript, es un enlace normal al formulario. */
export default function ProgramButton({ program, place, className = '', children }: { program?: ProgramKey; place: string; className?: string; children: React.ReactNode }) {
  return (
    <a
      href={program ? `?modalidad=${program}#inscripcion` : '#inscripcion'}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        if (program) window.dispatchEvent(new CustomEvent(PROGRAM_EVENT, { detail: program }));
        metaTrackCustom('EnrollOpen', { place, program: program || 'sin elegir' });
        gaEvent('enroll_open', { place, program: program || 'sin elegir' });
        const target = document.getElementById('inscripcion');
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', '#inscripcion');
        // El foco va al formulario con ratón o teclado; en pantallas táctiles no, para que no salte el teclado antes de leer
        if (window.matchMedia('(pointer: fine)').matches || e.detail === 0) setTimeout(() => target?.querySelector<HTMLInputElement>('input[type="text"]')?.focus({ preventScroll: true }), reduce ? 0 : 650);
      }}
    >
      {children}
      <ArrowRight className="w-5 h-5" aria-hidden="true" />
    </a>
  );
}
