'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'framer-motion';
import { PHOTOS } from '@/lib/content';

type Column = { when: string; title: string; text: string };

/** Un campo de color por cada momento: el fondo cambia con la pestaña, con el texto en el contraste que toca. */
const FIELDS = [
  { cls: 'field-tint', photo: PHOTOS.tableta, tab: 'bg-[#0a1f44] text-[#fff]', idle: 'text-[#0a1f44] hover:bg-[#0a1f44]/10' },
  { cls: 'field-navy', photo: PHOTOS.aula, tab: 'bg-[#0063e6] text-[#fff]', idle: 'text-[#fff] hover:bg-[#fff]/10' },
  { cls: 'field-blue', photo: PHOTOS.reunion, tab: 'bg-[#fff] text-[#0a1f44]', idle: 'text-[#fff] hover:bg-[#fff]/10' },
] as const;

/**
 * El ritmo del máster como una sola cosa que cambia: pestañas grandes y un campo de color a pantalla completa.
 * Pasa sola de una a otra hasta que la persona toca; con movimiento reducido no se mueve sola.
 */
export default function RhythmToggle({
  title,
  lead,
  columns,
  online,
}: {
  title: string;
  lead: string;
  columns: Column[];
  online: boolean;
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (reduce || !auto || hover) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % columns.length), 6500);
    return () => clearTimeout(t);
  }, [active, auto, hover, reduce, columns.length]);

  const col = columns[active];
  const field = FIELDS[active % FIELDS.length];
  const giant = online ? col.when : col.title;
  const small = online ? col.title : col.when;

  return (
    <section
      id="metodologia"
      aria-labelledby="ritmo-title"
      className={`${field.cls} px-4 md:px-6 py-20 md:py-28 scroll-mt-24 transition-colors duration-500`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="max-w-6xl mx-auto">
        <h2 id="ritmo-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12] max-w-4xl">
          {title}
        </h2>
        <p className="text-lg md:text-xl mt-5 max-w-2xl leading-relaxed opacity-85">{lead}</p>

        <div role="tablist" aria-label={online ? 'Tres semanas distintas' : 'Mañana y tarde'} className="mt-10 flex flex-wrap gap-2">
          {columns.map((c, i) => {
            const on = i === active;
            return (
              <button
                key={c.when}
                type="button"
                role="tab"
                id={`ritmo-tab-${i}`}
                aria-selected={on}
                aria-controls="ritmo-panel"
                onClick={() => {
                  setAuto(false);
                  setActive(i);
                }}
                className={`min-h-12 px-6 rounded-full font-semibold transition-colors cursor-pointer ${
                  on ? FIELDS[active % FIELDS.length].tab : FIELDS[active % FIELDS.length].idle
                }`}
              >
                {c.when}
              </button>
            );
          })}
        </div>

        <div
          id="ritmo-panel"
          role="tabpanel"
          aria-labelledby={`ritmo-tab-${active}`}
          className="mt-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-14 items-center"
        >
          <div key={active} className="rhythm-in">
            <p className="font-kinetic font-bold leading-[1.05] text-[clamp(2.25rem,7vw,5.25rem)] [overflow-wrap:anywhere]">{giant}</p>
            <p className="font-semibold text-lg mt-5">{small}</p>
            <p className="text-lg md:text-xl leading-relaxed mt-3 max-w-xl opacity-90">{col.text}</p>
          </div>
          <div className="relative lg:aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              key={field.photo.src}
              src={field.photo.src}
              alt={field.photo.alt}
              width={field.photo.width}
              height={field.photo.height}
              sizes="(min-width: 1024px) 40vw, 92vw"
              className="w-full h-auto lg:h-full lg:object-cover rhythm-in"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
