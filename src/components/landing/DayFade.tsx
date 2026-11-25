'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type Shot = { src: string; width: number; height: number; alt: string; caption: string };

/**
 * El día del presencial en una sola foto: por la mañana en la empresa, por la tarde en clase.
 * Las dos imágenes se funden despacio (1,6 s) y aguantan unos segundos cada una, como la luz que cambia en una sala.
 * Se pausa con la pestaña oculta; con movimiento reducido se queda la primera.
 */
export default function DayFade({ shots, className = '' }: { shots: Shot[]; className?: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let t: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      stop();
      t = setInterval(() => setI((v) => (v + 1) % shots.length), 5600);
    };
    const stop = () => t && clearInterval(t);
    const onVis = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [shots.length]);

  return (
    <figure className={className}>
      <div className="relative aspect-[16/10] overflow-hidden cut-lg bg-[var(--blue-deep)]">
        {shots.map((s, n) => (
          <Image
            key={s.src}
            src={s.src}
            alt={n === i ? s.alt : ''}
            aria-hidden={n !== i}
            width={s.width}
            height={s.height}
            sizes="(min-width:1024px) 50vw, 100vw"
            className="drift absolute inset-0 w-full h-full object-cover transition-opacity duration-[1600ms] ease-in-out motion-reduce:transition-none"
            style={{ opacity: n === i ? 1 : 0 }}
          />
        ))}
      </div>
      <figcaption className="mt-3 flex gap-5 text-[15px] font-semibold text-white" aria-live="off">
        {shots.map((s, n) => (
          <button
            key={s.caption}
            type="button"
            onClick={() => setI(n)}
            aria-pressed={n === i}
            className={`min-h-11 transition-colors duration-300 ${n === i ? 'text-white underline underline-offset-8 decoration-2' : 'text-white hover:underline underline-offset-8'}`}
          >
            <span className={`inline-block w-2 h-2 rotate-45 mr-2 align-middle transition-colors duration-300 ${n === i ? 'bg-white' : 'bg-[#0042a3]'}`} aria-hidden="true" />
            {s.caption}
          </button>
        ))}
      </figcaption>
    </figure>
  );
}
