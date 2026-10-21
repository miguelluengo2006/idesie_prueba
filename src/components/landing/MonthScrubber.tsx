'use client';

import { useState } from 'react';
import { BadgeCheck, Briefcase, GraduationCap } from 'lucide-react';
import { metaTrackCustom } from '@/lib/metaPixel';

const TOTAL = 16;
const HALF = 10;

/** Los 16 meses del máster: se desliza por ellos y se ve qué haces en cada tramo (10 de media jornada + 6 de jornada completa). */
export default function MonthScrubber() {
  const [m, setM] = useState(1);
  const phase = m <= HALF ? 0 : 1;

  return (
    <section aria-labelledby="months-title" className="field-white px-4 md:px-6 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-bold tracking-wide uppercase text-[#0052cc]">Tu recorrido</p>
        <h2 id="months-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12] mt-3 max-w-3xl">
          16 meses para pasar de estudiante a <span className="ui-hl">BIM Manager</span>
        </h2>

        <div className="mt-12 rounded-3xl bg-[#eef3fc] p-5 md:p-9">
          <div className="flex items-end justify-between gap-4">
            <p className="font-kinetic font-bold text-5xl md:text-7xl leading-none text-[#0a1f44] tabular-nums">
              <span className="sr-only">Mes </span>
              {String(m).padStart(2, '0')}
              <span className="text-2xl md:text-3xl text-[#0a1f44]/55"> / {TOTAL}</span>
            </p>
            <p className="text-right text-sm md:text-base font-bold text-[#0052cc]">{phase === 0 ? 'Formación + prácticas a media jornada' : 'Prácticas a jornada completa'}</p>
          </div>

          <div className="mt-6" aria-hidden="true">
            <div className="flex gap-1">
              {Array.from({ length: TOTAL }, (_, i) => {
                const n = i + 1;
                const done = n <= m;
                return <span key={n} className={`h-3 md:h-4 flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none ${done ? (n <= HALF ? 'bg-[#0063e6]' : 'bg-[#0a1f44]') : 'bg-[#c9d9f0]'}`} />;
              })}
            </div>
            <div className="mt-2 flex text-xs md:text-sm font-semibold text-[#0a1f44]/75">
              <span style={{ flex: HALF }}>Meses 1 a 10</span>
              <span style={{ flex: TOTAL - HALF }}>Meses 11 a 16</span>
            </div>
          </div>

          <input
            type="range"
            min={1}
            max={TOTAL}
            step={1}
            value={m}
            aria-label="Mes del máster"
            aria-valuetext={`Mes ${m} de ${TOTAL}`}
            onChange={(e) => setM(Number(e.target.value))}
            onPointerUp={() => metaTrackCustom('MonthScrubber', { month: m })}
            className="mt-4 w-full h-11 accent-[#0063e6] cursor-grab active:cursor-grabbing"
          />

          <div aria-live="polite" className="mt-4 grid md:grid-cols-2 gap-4 min-h-[13rem]">
            {phase === 0 ? (
              <>
                <Card icon={Briefcase} title="Por la mañana, trabajas" text="Prácticas remuneradas a media jornada en una empresa del sector AEC, desde el primer mes." />
                <Card icon={GraduationCap} title="Por la tarde, estudias" text="Clases presenciales en Madrid con profesionales en activo. Fundamentos, ejecución, liderazgo e inteligencia artificial aplicada." />
              </>
            ) : (
              <>
                <Card icon={Briefcase} title="Jornada completa en la empresa" text="Terminada la formación, seis meses de prácticas remuneradas a jornada completa, con las responsabilidades de un perfil BIM." />
                <Card icon={BadgeCheck} title="Y después, tu puesto" text="Incorporación en empresas colaboradoras del sector, muchas veces en la misma donde hiciste las prácticas." />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ icon: Icon, title, text }: { icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-[#fff] p-6 text-[#0a1f44]">
      <Icon className="w-7 h-7 text-[#0063e6]" aria-hidden="true" />
      <h3 className="font-kinetic font-bold text-xl mt-3">{title}</h3>
      <p className="mt-2 leading-relaxed text-[#0a1f44]/80">{text}</p>
    </div>
  );
}
