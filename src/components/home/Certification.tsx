import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';
import Section from './Section';
import { CONTACT, PROFILES } from '@/lib/bim';

const CERT_PROFILES = [
  { code: 'IDM', text: 'Gestión de la información, supervisión del CDE y cumplimiento de ISO 19650.' },
  { code: 'BDM', text: 'Coordinación interdisciplinar en diseño y auditoría de modelos federados.' },
  { code: 'BCM', text: 'BIM en fase de construcción, control de calidad y modelo federado.' },
].map((c) => ({ ...c, profile: PROFILES.find((p) => p.code === c.code)! }));

/** Certificación de perfiles: AECOMI certifica, IDESIE forma. */
export default function Certification() {
  return (
    <Section field="navy" id="certificacion" labelledBy="certificacion-title">
      <Reveal>
        <div className="flex flex-col lg:flex-row gap-10 lg:items-center justify-between">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#ffba08]">Certificación de perfiles</span>
            <h2 id="certificacion-title" className="font-kinetic font-bold text-3xl md:text-5xl leading-[1.15] mt-4">
              Demuestra a la empresa que <span className="ui-hl">sabes hacer</span> el trabajo
            </h2>
            <p className="text-[#c9d9f0] mt-5 leading-relaxed text-base md:text-lg">
              AECOMI es la entidad que certifica los perfiles profesionales; no imparte formación. IDESIE es entidad formativa
              acreditada por AECOMI: nuestra formación está alineada con sus perfiles.
            </p>
          </div>
          <div className="lg:w-80 shrink-0 flex flex-col gap-3">
            <a href={CONTACT.aecomiUrl} target="_blank" rel="noopener noreferrer" className="btn btn-cta justify-between">
              Requisitos y proceso en aecomi.org
              <span className="btn-dot">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </a>
            <p className="text-xs text-[#c9d9f0] text-center">Te llevamos a la web de AECOMI, la entidad certificadora.</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#fff]/15">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#c9d9f0]">Tres perfiles para todo el ciclo de vida BIM</p>
          <div className="mt-5 grid md:grid-cols-3 gap-4">
            {CERT_PROFILES.map(({ code, text, profile }) => (
              <div key={code} className="ui-card p-6">
                <span className="font-kinetic font-bold text-sm text-[#ffba08]">{code}</span>
                <h3 className="font-kinetic font-semibold text-base mt-2 leading-snug">{profile.name}</h3>
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
    </Section>
  );
}
