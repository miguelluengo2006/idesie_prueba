import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';
import { CONTACT, PROFILES } from '@/lib/bim';

const CERT_PROFILES = [
  { code: 'IDM', text: 'Gestión de la información, supervisión del CDE y cumplimiento de ISO 19650.' },
  { code: 'BDM', text: 'Coordinación interdisciplinar en diseño y auditoría de modelos federados.' },
  { code: 'BCM', text: 'BIM en fase de construcción, control de calidad y modelo federado.' },
].map((c) => ({ ...c, profile: PROFILES.find((p) => p.code === c.code)! }));

/** Certificación de perfiles: AECOMI certifica, IDESIE forma. */
export default function Certification() {
  return (
    <section id="certificacion" aria-labelledby="certificacion-title" className="px-4 md:px-6 py-20 md:py-28 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <Reveal className="rounded-[28px] bg-[var(--ink-solid)] text-[#f4f8ff] p-7 md:p-12">
          <div className="flex flex-col lg:flex-row gap-10 lg:items-center justify-between">
            <div className="max-w-2xl">
              <span className="text-xs tracking-[0.25em] uppercase text-[var(--yellow)]">Certificación de perfiles</span>
              <h2 id="certificacion-title" className="font-kinetic font-black uppercase text-3xl md:text-4xl leading-[1.08] mt-4">
                Demuestra a la empresa que sabes hacer el trabajo
              </h2>
              <p className="text-[#c9d9f0] mt-5 leading-relaxed text-base md:text-lg">
                AECOMI es la entidad que certifica los perfiles profesionales; no imparte formación. IDESIE es entidad formativa
                acreditada por AECOMI: nuestra formación está alineada con sus perfiles.
              </p>
            </div>
            <div className="lg:w-80 shrink-0 flex flex-col gap-3">
              <a
                href={CONTACT.aecomiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[var(--yellow)] text-[#0a1f44] text-sm font-semibold hover:brightness-95 transition"
              >
                Requisitos y proceso en aecomi.org
                <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" aria-hidden="true" />
              </a>
              <p className="text-xs text-[#c9d9f0] text-center">Te llevamos a la web de AECOMI, la entidad certificadora.</p>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/15">
            <p className="text-xs tracking-[0.2em] uppercase text-[#c9d9f0]">Tres perfiles para todo el ciclo de vida BIM</p>
            <div className="mt-5 grid md:grid-cols-3 gap-4">
              {CERT_PROFILES.map(({ code, text, profile }) => (
                <div key={code} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                  <span className="font-kinetic font-bold text-xs text-[var(--yellow)]">{code}</span>
                  <h3 className="font-kinetic font-bold text-base uppercase mt-2 leading-snug">{profile.name}</h3>
                  <p className="text-sm text-[#c9d9f0] leading-relaxed mt-2">{text}</p>
                  <p className="text-sm font-semibold mt-3">{profile.experience}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#c9d9f0] mt-6">
              Examen técnico + entrevista · Vigencia de 3 años · Registro público · Acreditación ENAC en curso
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
