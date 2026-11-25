'use client';

import { useState } from 'react';
import SlabTower from './SlabTower';
import { metaTrackCustom } from '@/lib/metaPixel';

export type Floor = { title: string; tagline: string; ai?: string; points?: string[] };

/**
 * El temario como edificio: cada módulo es una planta. Al elegir uno, su planta sale del modelo
 * (vista explosionada) y al lado aparece qué haces en ella y dónde entra la IA.
 * Escritorio: lista · edificio · ficha. Móvil: fichas de módulo que saltan de línea, edificio y ficha.
 */
export default function FloorPicker({ floors }: { floors: Floor[] }) {
  const [active, setActive] = useState(0);
  const f = floors[active];

  const pick = (i: number) => {
    setActive(i);
    metaTrackCustom('FloorPick', { module: floors[i].title });
  };

  return (
    <div className="grid lg:grid-cols-12 gap-x-8 gap-y-8 lg:items-end">
      <div className="lg:col-span-4">
        <h2 id="temario-title" className="display text-[clamp(1.9rem,3.6vw,3.4rem)]">
          Una planta por módulo
        </h2>
        <p className="mt-5 text-[17px] leading-relaxed text-[var(--ink)] max-w-[40ch]">
          El temario se construye como un modelo: el primer módulo es la planta baja y el último, la cubierta. Elige una planta y mira qué haces en ella.
        </p>

        <div role="tablist" aria-label="Módulos del máster" className="mt-8 flex flex-wrap lg:flex-col gap-1.5 lg:gap-1">
          {floors.map((m, i) => {
            const on = i === active;
            return (
              <button
                key={m.title}
                type="button"
                role="tab"
                id={`floor-tab-${i}`}
                aria-selected={on}
                aria-controls="floor-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => pick(i)}
                onKeyDown={(e) => {
                  const next = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
                  if (!next) return;
                  e.preventDefault();
                  const n = (active + next + floors.length) % floors.length;
                  pick(n);
                  document.getElementById(`floor-tab-${n}`)?.focus();
                }}
                className={`text-left min-h-11 flex items-center gap-3 px-4 py-2 transition-colors duration-200 cut ${
                  on ? 'bg-[var(--blue)] text-white' : 'bg-[var(--ground-2)] lg:bg-transparent text-[var(--ink)] hover:bg-[var(--ground-3)]'
                }`}
              >
                <span className={`hidden lg:inline-block w-2.5 h-2.5 shrink-0 rotate-45 transition-colors duration-200 ${on ? 'bg-white' : 'bg-[var(--blue-lo)]'}`} aria-hidden="true" />
                <span className="font-semibold text-[15px] lg:text-[17px]">{m.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-5 order-3 lg:order-none">
        <SlabTower
          floors={floors.length}
          active={active}
          title={`Modelo del edificio del máster con la planta «${f.title}» desplazada hacia fuera`}
          className="w-full h-auto max-h-[48svh] lg:max-h-[80vh]"
        />
      </div>

      <div id="floor-panel" role="tabpanel" aria-labelledby={`floor-tab-${active}`} aria-live="polite" className="lg:col-span-3 order-2 lg:order-none bg-[var(--ground-2)] p-6 md:p-7 cut-lg lg:mb-10">
        <p className="display text-[21px] leading-tight">{f.title}</p>
        <p className="mt-3 text-[17px] leading-relaxed text-[var(--ink)]">{f.tagline}</p>
        {f.points && f.points.length > 0 && (
          <ul className="mt-4 space-y-2 text-[15px] leading-snug text-[var(--ink)]">
            {f.points.slice(0, 3).map((pt) => (
              <li key={pt} className="flex gap-2.5">
                <span className="w-2 h-2 mt-1.5 shrink-0 rotate-45 bg-[var(--blue-hi)]" aria-hidden="true" />
                {pt}
              </li>
            ))}
          </ul>
        )}
        {f.ai && (
          <p className="mt-4 text-[17px] leading-relaxed text-[var(--ink)]">
            <span className="font-semibold text-[var(--sky)]">Con IA. </span>
            {f.ai}
          </p>
        )}
      </div>
    </div>
  );
}
