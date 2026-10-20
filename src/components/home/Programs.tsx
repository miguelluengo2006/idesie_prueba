import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Reveal, { SectionHead } from './Reveal';
import Section from './Section';
import { PRICE_PER_ECTS, PROFILES, formatEuro } from '@/lib/bim';

const certifiable = PROFILES.filter((p) => p.certifiable);
const pathways = PROFILES.filter((p) => !p.certifiable);
const profileHref = (code: string) => `/perfiles/${code.toLowerCase()}`;

const row =
  'flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium hover:bg-[#0a1f44] hover:text-[#fff] transition-colors';

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-2">{title}</p>
      <ul className="-mx-3">{children}</ul>
    </div>
  );
}

function Item({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className={`group ${row}`}>
        {children}
        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" aria-hidden="true" />
      </Link>
    </li>
  );
}

/** Casilla de programas: banda de título y, debajo, la lista de enlaces. */
function Tile({ title, delay, children }: { title: string; delay: number; children: React.ReactNode }) {
  return (
    <Reveal delay={delay} className="h-full flex flex-col overflow-hidden rounded-2xl">
      <h3 className="bg-[#0a1f44] text-[#fff] font-kinetic font-bold text-xl md:text-2xl px-7 md:px-8 py-5">{title}</h3>
      <div className="ui-card !rounded-t-none flex-1 p-7 md:p-8 flex flex-col gap-6">{children}</div>
    </Reveal>
  );
}

/** "Másteres, microcredenciales y perfiles profesionales": las tres puertas al catálogo. */
export default function Programs() {
  return (
    <Section field="tint" id="formacion" labelledBy="formacion-title">
      <SectionHead
        eyebrow="Programas"
        title={
          <span id="formacion-title">
            Másteres, microcredenciales y <span className="ui-hl">perfiles profesionales</span>
          </span>
        }
        lead="Todos con certificación universitaria de UTAMED y alineados con los perfiles que certifica AECOMI."
      />

      <div className="mt-12 grid lg:grid-cols-3 gap-5">
        <Tile title="Másteres" delay={0}>
          <Group title="Programas presenciales">
            <Item href="/masters/mbim">MBIM · Máster BIM presencial</Item>
            <Item href="/masters/mbbe">MBBE · Building Engineering</Item>
          </Group>
          <Group title="Programas online">
            <Item href="/masters/mbim-online">MBIM Online</Item>
          </Group>
          <p className="text-sm text-white/60 mt-auto">Learning by Working: en el presencial trabajas en empresa desde el primer día.</p>
        </Tile>

        <Tile title="Microcredenciales" delay={0.1}>
          <Group title="Por áreas">
            <Item href="/microcredenciales">Ingeniería</Item>
            <Item href="/microcredenciales">Arquitectura</Item>
            <Item href="/microcredenciales">Construcción</Item>
            <Item href="/microcredenciales">Gestión de proyectos</Item>
            <Item href="/microcredenciales">Operación y mantenimiento</Item>
          </Group>
          <p className="text-sm font-semibold text-[var(--signal)] mt-auto">
            Desde {formatEuro(PRICE_PER_ECTS)} · {formatEuro(PRICE_PER_ECTS)} por ECTS
          </p>
        </Tile>

        <Tile title="Perfiles profesionales" delay={0.2}>
          <Group title="Certificables AECOMI">
            {certifiable.map((p) => (
              <Item key={p.code} href={profileHref(p.code)}>{p.name}</Item>
            ))}
          </Group>
          <Group title="Itinerarios formativos">
            {pathways.map((p) => (
              <Item key={p.code} href={profileHref(p.code)}>{p.name}</Item>
            ))}
          </Group>
          <p className="text-sm font-semibold text-[var(--signal)] mt-auto">Certificación universitaria UTAMED</p>
        </Tile>
      </div>
    </Section>
  );
}
