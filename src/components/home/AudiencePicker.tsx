'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AUDIENCES } from '@/lib/content';
import { SectionHead } from './Reveal';
import Section from './Section';

/** "¿En qué momento profesional estás?": eliges tu situación y te mostramos los programas pensados para ti. */
export default function AudiencePicker() {
  const [id, setId] = useState(AUDIENCES[0].id);
  const current = AUDIENCES.find((a) => a.id === id) ?? AUDIENCES[0];

  return (
    <Section field="tint" id="momento" labelledBy="momento-title">
      <SectionHead
        eyebrow="Formación adaptada a ti"
        title={
          <span id="momento-title">
            ¿En qué <span className="ui-hl">momento</span> profesional estás?
          </span>
        }
        lead="Elige tu situación y te mostramos los programas pensados para ti."
      />

      <div className="mt-10 grid lg:grid-cols-[0.9fr_1.4fr] gap-5">
        <div role="radiogroup" aria-label="Tu momento profesional" className="flex flex-col gap-3">
          {AUDIENCES.map((a) => {
            const on = a.id === id;
            return (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setId(a.id)}
                className={`text-left rounded-2xl p-5 transition-colors cursor-pointer ${on ? 'bg-[#0a1f44] text-[#fff]' : 'ui-card hover:bg-[#f4f8ff]'}`}
              >
                <span className="block font-kinetic font-semibold text-base leading-snug">{a.title}</span>
                <span className={`block text-sm mt-1.5 ${on ? 'text-[#c9d9f0]' : 'text-white/60'}`}>{a.subtitle}</span>
              </button>
            );
          })}
        </div>

        <div key={current.id} className="ui-card p-7 md:p-10 flex flex-col gap-6" aria-live="polite">
          <p className="text-lg md:text-xl leading-relaxed">{current.text}</p>
          <ul className="grid sm:grid-cols-2 gap-3 mt-auto">
            {current.recommendations.map((r) => (
              <li key={r.title}>
                <Link href={r.href} className="group h-full flex flex-col gap-2 rounded-xl bg-[#eef3fc] p-5 hover:bg-[#0a1f44] hover:text-[#fff] transition-colors">
                  <span className="font-kinetic font-semibold text-base leading-snug">{r.title}</span>
                  <span className="text-sm text-white/60 group-hover:text-[#c9d9f0]">{r.text}</span>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--signal)] group-hover:text-[#ffba08] mt-auto pt-2">
                    Ver más <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
