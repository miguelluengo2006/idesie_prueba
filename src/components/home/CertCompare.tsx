'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';

const AYER = ['Títulos y cursos que no garantizan el desempeño', 'Experiencia difícil de comprobar', 'Procesos de selección largos e inciertos'];
const HOY = ['Competencias evaluadas por una entidad independiente', 'Credencial digital verificable en un registro público', 'Un lenguaje común entre profesionales y empresas'];

/** Ayer / hoy: un deslizador que descubre un lado u otro. Con teclado funciona como cualquier control de rango. */
export default function CertCompare() {
  const [v, setV] = useState(50);

  return (
    <div>
      <div className="relative rounded-[2rem] overflow-hidden min-h-[26rem] md:min-h-[22rem] select-none">
        <div className="absolute inset-0 bg-[#fff] text-[#0a1f44] p-7 md:p-12 flex flex-col justify-center">
          <div className="w-full md:w-1/2 pr-4">
            <p className="font-kinetic font-bold text-sm text-[#0a1f44]/60">AYER</p>
            <h3 className="font-kinetic font-bold text-2xl md:text-3xl leading-tight mt-2">Te contratan por lo que dice tu CV</h3>
            <ul className="mt-5 space-y-3">
              {AYER.map((t) => (
                <li key={t} className="flex gap-3 leading-snug">
                  <X className="w-5 h-5 shrink-0 text-[#0a1f44]/50 mt-0.5" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="absolute inset-0 bg-[#0063e6] text-[#fff] p-7 md:p-12 flex flex-col justify-center items-end" style={{ clipPath: `inset(0 0 0 ${v}%)` }}>
          <div className="w-full md:w-1/2 pl-0 md:pl-6 md:ml-auto">
            <p className="font-kinetic font-bold text-sm text-[#fff]/80">HOY</p>
            <h3 className="font-kinetic font-bold text-2xl md:text-3xl leading-tight mt-2">Te contratan por lo que demuestras</h3>
            <ul className="mt-5 space-y-3">
              {HOY.map((t) => (
                <li key={t} className="flex gap-3 leading-snug">
                  <Check className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="absolute top-0 bottom-0 w-1 bg-[#0a1f44] pointer-events-none" style={{ left: `calc(${v}% - 2px)` }} aria-hidden="true">
          <span className="absolute top-1/2 -translate-y-1/2 -left-4 w-9 h-9 rounded-full bg-[#0a1f44] text-[#fff] grid place-items-center text-xs font-bold ring-4 ring-[#e9f0fc]">↔</span>
        </div>

        <input
          type="range"
          min={8}
          max={92}
          value={v}
          onChange={(e) => setV(Number(e.target.value))}
          aria-label="Desliza para comparar ayer y hoy"
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>
      <p className="mt-3 text-sm text-[#0a1f44]/70">Desliza, o usa las flechas del teclado, para comparar.</p>
    </div>
  );
}
