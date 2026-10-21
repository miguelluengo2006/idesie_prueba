'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Building2, Moon, Sun } from 'lucide-react';
import { PHOTOS } from '@/lib/content';
import { metaTrackCustom } from '@/lib/metaPixel';

const SCENES = [
  {
    key: 'manana',
    label: 'Mañana',
    verb: 'Trabajas',
    text: 'Prácticas remuneradas en estudios, ingenierías y constructoras con las que IDESIE tiene acuerdo. Desde el primer mes, no al final del programa.',
    points: ['Cobras por nómina cada mes', 'IDESIE te asigna la empresa según tu perfil', 'Proyectos reales, no ejercicios de clase'],
    photo: PHOTOS.tableta,
  },
  {
    key: 'tarde',
    label: 'Tarde',
    verb: 'Estudias',
    text: 'Clases presenciales en Madrid, de lunes a viernes, con profesionales en activo del sector. Lo que ves por la tarde lo aplicas a la mañana siguiente.',
    points: ['Metodología Learning by Working', 'IA aplicada a cada fase del proyecto', 'Título propio IDESIE y certificación Cualificam'],
    photo: PHOTOS.clase,
  },
] as const;

/**
 * El día del alumno, de mañana a tarde. Se arrastra el sol (o se pulsa Mañana / Tarde) y el campo pasa de claro a azul marino
 * mientras una foto se funde con la otra. Al soltar se ajusta a uno de los dos extremos, que son los que tienen buen contraste.
 */
export default function DayScrubber() {
  const [t, setT] = useState(0); // 0 = mañana, 100 = tarde
  const [dragging, setDragging] = useState(false);
  const afternoon = t >= 50;
  const scene = SCENES[afternoon ? 1 : 0];
  const snap = () => {
    setDragging(false);
    setT((v) => (v >= 50 ? 100 : 0));
  };
  const go = (v: number) => {
    setT(v);
    metaTrackCustom('DayScrubber', { part: v >= 50 ? 'tarde' : 'manana' });
  };

  return (
    <section
      aria-labelledby="day-title"
      className={`px-4 md:px-6 py-20 md:py-28 ${dragging ? '' : 'transition-colors duration-700 motion-reduce:transition-none'}`}
      style={{ background: `color-mix(in srgb, #0a1f44 ${t}%, #e9f0fc)`, colorScheme: afternoon ? 'dark' : 'light' }}
    >
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-16 items-center">
        <div className={afternoon ? 'text-[#fff]' : 'text-[#0a1f44]'}>
          <p className={`text-sm font-bold tracking-wide uppercase ${afternoon ? 'text-[#7db4ff]' : 'text-[#0052cc]'}`}>Cómo es tu día</p>
          <h2 id="day-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.12] mt-3">
            Un día partido en dos. <span className={afternoon ? 'text-[#7db4ff]' : 'text-[#0063e6]'}>Esa es toda la metodología.</span>
          </h2>

          <div role="group" aria-label="Elige el momento del día" className="mt-8 flex gap-2">
            {SCENES.map((s, i) => (
              <button
                key={s.key}
                type="button"
                aria-pressed={afternoon === (i === 1)}
                onClick={() => go(i * 100)}
                className={`min-h-11 inline-flex items-center gap-2 rounded-full px-5 text-sm font-bold border-2 transition-colors ${
                  afternoon === (i === 1)
                    ? afternoon ? 'bg-[#fff] text-[#0a1f44] border-[#fff]' : 'bg-[#0a1f44] text-[#fff] border-[#0a1f44]'
                    : afternoon ? 'border-[#7db4ff]/60 text-[#fff] hover:border-[#fff]' : 'border-[#0a1f44]/35 text-[#0a1f44] hover:border-[#0a1f44]'
                }`}
              >
                {i === 0 ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
                {s.label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Sun className="w-5 h-5 shrink-0" aria-hidden="true" />
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={t}
              aria-label="Desliza de la mañana a la tarde"
              aria-valuetext={scene.label}
              onChange={(e) => { setDragging(true); setT(Number(e.target.value)); }}
              onPointerUp={snap}
              onKeyUp={snap}
              onBlur={snap}
              onTouchEnd={snap}
              className="w-full h-11 accent-[#0063e6] cursor-grab active:cursor-grabbing"
            />
            <Moon className="w-5 h-5 shrink-0" aria-hidden="true" />
          </div>

          <div aria-live="polite" className="mt-6 min-h-[17rem]">
            <h3 className="font-kinetic font-bold text-2xl md:text-3xl">{scene.label}: {scene.verb.toLowerCase()}</h3>
            <p className={`mt-3 leading-relaxed text-lg ${afternoon ? 'text-[#dbe8ff]' : 'text-[#0a1f44]/80'}`}>{scene.text}</p>
            <ul className="mt-5 space-y-2.5">
              {scene.points.map((p) => (
                <li key={p} className="flex gap-3">
                  <Building2 className={`w-5 h-5 shrink-0 mt-0.5 ${afternoon ? 'text-[#7db4ff]' : 'text-[#0063e6]'}`} aria-hidden="true" />
                  <span className="font-semibold">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#0a1f44]">
          {SCENES.map((s, i) => (
            <Image
              key={s.key}
              src={s.photo.src}
              alt={i === (afternoon ? 1 : 0) ? s.photo.alt : ''}
              aria-hidden={i !== (afternoon ? 1 : 0)}
              width={s.photo.width}
              height={s.photo.height}
              sizes="(min-width:1024px) 560px, 100vw"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: i === 0 ? 1 - t / 100 : t / 100, transition: dragging ? 'none' : 'opacity 700ms' }}
            />
          ))}
          <span className="absolute left-4 bottom-4 rounded-full bg-[#0a1f44]/90 text-[#fff] text-sm font-bold px-4 py-2">{scene.label} · {scene.verb}</span>
        </div>
      </div>
    </section>
  );
}
