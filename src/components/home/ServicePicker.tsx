'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Check, Plus } from 'lucide-react';
import { BookCallButton } from './BookCall';

const SERVICES = [
  'Implantación ISO 19650',
  'BIM Management Office',
  'Producción de modelos',
  'Auditoría y coordinación',
  '4D y 5D',
  'Calidad y apoyo en obra',
  'Project Management',
  'Facility Management',
  'Recursos externos',
  'Automatización e IA aplicada',
];

/** Consultoría BIM: marca lo que necesitáis y la petición llega con esos servicios ya escritos. */
export default function ServicePicker() {
  const reduce = useReducedMotion();
  const [on, setOn] = useState<Set<string>>(new Set());
  const toggle = (s: string) =>
    setOn((cur) => {
      const n = new Set(cur);
      if (n.has(s)) n.delete(s);
      else n.add(s);
      return n;
    });
  const pack = on.size ? `Consultoría BIM: ${[...on].join(', ')}` : 'Empresas · consultoría BIM';

  return (
    <div>
      <ul className="flex flex-wrap gap-2.5">
        {SERVICES.map((s) => {
          const sel = on.has(s);
          return (
            <li key={s}>
              <motion.button
                type="button"
                aria-pressed={sel}
                onClick={() => toggle(s)}
                whileTap={reduce ? undefined : { scale: 0.95 }}
                className={`inline-flex items-center gap-2.5 min-h-14 px-6 rounded-full font-kinetic font-bold text-base md:text-lg transition-colors cursor-pointer ${sel ? 'bg-[#0063e6] text-[#fff]' : 'bg-[#e9f0fc] text-[#0a1f44] hover:bg-[#dbe8ff]'}`}
              >
                {sel ? <Check className="w-5 h-5" aria-hidden="true" /> : <Plus className="w-5 h-5 text-[#0063e6]" aria-hidden="true" />}
                {s}
              </motion.button>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <BookCallButton pack={pack} className="btn btn-blue">
          {on.size ? `Pedir propuesta (${on.size})` : 'Pedir propuesta'}
          <span className="btn-dot bg-[#fff]/20">
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </span>
        </BookCallButton>
        <p className="text-[#0a1f44]/70">{on.size ? 'La petición llegará con estos servicios.' : 'Elige los servicios que os interesan o cuéntanos el reto.'}</p>
      </div>
    </div>
  );
}
