'use client';

import { LEAD_EVENT } from './LeadForm';

/** Botón que preselecciona un máster en el formulario y sube a él. */
export default function PickMaster({ slug, className = '', children }: { slug: string; className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.dispatchEvent(new CustomEvent(LEAD_EVENT, { detail: slug }));
        document.getElementById('info')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        window.setTimeout(() => document.getElementById('info')?.querySelector<HTMLElement>('input[type=radio]:checked, input')?.focus({ preventScroll: true }), 500);
      }}
    >
      {children}
    </button>
  );
}
