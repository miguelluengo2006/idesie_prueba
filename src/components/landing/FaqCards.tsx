'use client';

import { useState } from 'react';

const COLORS = ['var(--ground-3)', 'var(--blue-deep)', 'var(--ground-2)'];

/**
 * Las dudas archivadas como fichas en un cajón: cada ficha asoma con su pestaña y su pregunta,
 * y al abrir una se despliega su respuesta y empuja hacia abajo las demás. Solo una abierta a la vez.
 */
export default function FaqCards({ items }: { items: { topic: string; q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="relative">
      {items.map((it, i) => {
        const on = open === i;
        return (
          <div
            key={it.q}
            className="faq-card relative transition-[margin] duration-300"
            style={{
              background: COLORS[i % COLORS.length],
              ['--tab-x' as string]: `calc(${i} * var(--tab-step))`,
              ['--tab-w' as string]: 'var(--tab-width)',
              marginTop: i === 0 ? 0 : -16,
              zIndex: i + 1,
            }}
          >
            <span
              className="absolute top-0 h-10 flex items-center justify-center text-[15px] font-semibold text-white"
              style={{ left: `calc(${i} * var(--tab-step))`, width: 'var(--tab-width)' }}
              aria-hidden="true"
            >
              {it.topic}
            </span>
            <h3 className="pt-10">
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`faq-a-${i}`}
                id={`faq-q-${i}`}
                onClick={() => setOpen(on ? -1 : i)}
                className="group w-full text-left flex items-center gap-4 px-6 md:px-8 py-5 min-h-[4.5rem] text-[17px] md:text-[21px] font-semibold text-white hover:bg-white/5 transition-colors duration-200"
              >
                <span className="flex-1">{it.q}</span>
                <span className="shrink-0 text-[15px] font-semibold text-[var(--sky)] group-hover:text-white">{on ? 'Cerrar' : 'Leer'}</span>
              </button>
            </h3>
            <div
              id={`faq-a-${i}`}
              role="region"
              aria-labelledby={`faq-q-${i}`}
              className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
              style={{ gridTemplateRows: on ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="px-6 md:px-8 pb-8 pt-1 text-[17px] leading-relaxed text-[var(--ink)] max-w-[60ch]">{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
