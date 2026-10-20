'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react';
import IdesieLogo from '@/components/home/IdesieLogo';
import { BookCallButton } from '@/components/home/BookCall';
import CartLink from '@/components/shop/CartLink';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { CONTACT, PROFILES } from '@/lib/bim';

/**
 * Menú de la web: exactamente el de la propuesta de la home (`contenido /2026`).
 * Barra superior: Agenda, Alumni, Talento IDESIE, Empresas, Consultoría BIM, Campus Virtual.
 * Barra principal: Programas (desplegable) · Microcredenciales · Perfiles Profesionales · Simulador Profesional · Certificación.
 */

interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

const ACCESOS: NavLink[] = [
  { href: '/#agenda', label: 'Agenda' },
  { href: '/#alumni', label: 'Alumni' },
  { href: '/empresas', label: 'Talento IDESIE' },
  { href: '/#empresas', label: 'Empresas' },
  { href: '/#empresas', label: 'Consultoría BIM' },
  { href: 'https://aula.idesie.com/', label: 'Campus Virtual', external: true },
];

const MASTERS_PRESENCIALES: NavLink[] = [
  { href: '/masters/mbim', label: 'MBIM' },
  { href: '/masters/mbbe', label: 'MBBE' },
];
const MASTERS_ONLINE: NavLink[] = [
  { href: '/masters/mbim-online', label: 'MBIM' },
  { href: '/masters#mbbe-online', label: 'MBBE' },
];
const AREAS: NavLink[] = ['Ingeniería', 'Arquitectura', 'Construcción', 'Gestión de Proyectos', 'Operación y Mantenimiento'].map((label) => ({
  href: '/microcredenciales',
  label,
}));
const profileLink = (p: { code: string; name: string }): NavLink => ({ href: `/perfiles/${p.code.toLowerCase()}`, label: p.name });
const PERFILES_CERTIFICABLES = PROFILES.filter((p) => p.certifiable).map(profileLink);
const PERFILES_ITINERARIOS = PROFILES.filter((p) => !p.certifiable).map(profileLink);

const NAV_PLAIN: NavLink[] = [
  { href: '/microcredenciales', label: 'Microcredenciales' },
  { href: '/perfiles', label: 'Perfiles Profesionales' },
  { href: '/simulador', label: 'Simulador Profesional' },
  { href: '/certificacion', label: 'Certificación' },
];

const PANEL_BUTTONS: NavLink[] = [
  { href: '/certificacion', label: 'Certificación Universitaria' },
  { href: '/perfiles', label: 'Elige tu perfil' },
  { href: '/certificacion', label: 'Certificación Profesional' },
];

// Colores propios y fijos: `.home-root` reasigna white/black/gray, así que aquí no se usan esos tokens.
const NAVY = '#0a1f44';
const INK = '#0d1522';
const EASE = [0.22, 1, 0.36, 1] as const;

const GROUP_TITLE = 'text-[15px] font-bold text-[#0a1f44] pb-3 mb-3 border-b border-[#0a1f44]/12';
const SUBGROUP = 'text-xs font-semibold tracking-[0.16em] uppercase text-[#0d1522]/60 mt-4 mb-1.5';

function PanelLink({ link, onNavigate }: { link: NavLink; onNavigate: () => void }) {
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2 -mx-3 text-[15px] font-medium text-[#0d1522] hover:bg-[#0063e6]/8 hover:text-[#0052cc] focus-visible:bg-[#0063e6]/10 focus-visible:outline-none transition-colors"
    >
      {link.label}
      <ArrowRight
        className="w-4 h-4 shrink-0 text-[#0063e6] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all"
        aria-hidden="true"
      />
    </Link>
  );
}

function PanelButton({ link, onNavigate }: { link: NavLink; onNavigate: () => void }) {
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className="group inline-flex items-center gap-3 rounded-full bg-[#0063e6] text-[#fff] pl-5 pr-4 py-2.5 text-sm font-semibold hover:bg-[#0052cc] transition-colors"
    >
      {link.label}
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </Link>
  );
}

function LinkList({ links, onNavigate }: { links: NavLink[]; onNavigate: () => void }) {
  return (
    <ul>
      {links.map((l) => (
        <li key={l.href + l.label}>
          <PanelLink link={l} onNavigate={onNavigate} />
        </li>
      ))}
    </ul>
  );
}

/** Los tres bloques del desplegable Programas, con su subtítulo y sus enlaces. Se reutiliza en escritorio y en móvil. */
function ProgramGroups({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <div>
        <p className={GROUP_TITLE}>Másteres</p>
        <p className={`${SUBGROUP} !mt-0`}>Programas presenciales</p>
        <LinkList links={MASTERS_PRESENCIALES} onNavigate={onNavigate} />
        <p className={SUBGROUP}>Programas online</p>
        <LinkList links={MASTERS_ONLINE} onNavigate={onNavigate} />
      </div>
      <div>
        <p className={GROUP_TITLE}>Microcredenciales</p>
        <p className={`${SUBGROUP} !mt-0`}>Áreas</p>
        <LinkList links={AREAS} onNavigate={onNavigate} />
      </div>
      <div>
        <p className={GROUP_TITLE}>Perfiles profesionales</p>
        <p className={`${SUBGROUP} !mt-0`}>Certificables AECOMI</p>
        <LinkList links={PERFILES_CERTIFICABLES} onNavigate={onNavigate} />
        <p className={SUBGROUP}>Itinerarios formativos</p>
        <LinkList links={PERFILES_ITINERARIOS} onNavigate={onNavigate} />
      </div>
    </>
  );
}

function ProgramasPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-x-12 p-8 pb-6">
        <ProgramGroups onNavigate={onNavigate} />
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-[#0a1f44]/12 px-8 py-5">
        {PANEL_BUTTONS.map((b) => (
          <PanelButton key={b.label} link={b} onNavigate={onNavigate} />
        ))}
      </div>
    </>
  );
}

function AccessLink({ link, className }: { link: NavLink; className: string }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 ${className}`}>
        {link.label} <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

/**
 * Cabecera fija de la web pública, en dos barras: accesos arriba y navegación principal debajo. Con `overlay`
 * (la home) es transparente sobre el carrusel y pasa a blanca al hacer scroll; en el resto de páginas es
 * blanca desde el principio. Debe ir dentro de un BookCallProvider.
 */
export default function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [programasOpen, setProgramasOpen] = useState(false);
  const [mobileProgramas, setMobileProgramas] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();

  const closeAll = useCallback(() => {
    setProgramasOpen(false);
    setMobileOpen(false);
  }, []);
  useEscapeKey(programasOpen || mobileOpen, closeAll);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!programasOpen) return;
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setProgramasOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [programasOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setProgramasOpen(false), 140);
  };
  const hoverOpen = () => {
    cancelClose();
    setProgramasOpen(true);
  };

  // Transparente solo sobre el carrusel de la home, sin menús abiertos y arriba del todo.
  const transparent = overlay && !scrolled && !programasOpen && !mobileOpen;
  const textColor = transparent ? '#ffffff' : INK;
  const navLink =
    'relative inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-2 text-[13px] font-semibold uppercase tracking-[0.06em] rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0063e6]';
  const dur = reduce ? 0 : 0.24;
  const drawerRow = 'flex items-center justify-between py-5 font-kinetic font-semibold text-xl';

  return (
    <header
      ref={headerRef}
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
      className={`fixed top-0 inset-x-0 z-40 transition-transform duration-300 ease-out ${scrolled ? 'md:-translate-y-10' : ''}`}
    >
      {/* Barra de accesos */}
      <div className="hidden md:block h-10 text-[13px]" style={{ background: NAVY, color: '#dce8ff' }}>
        <div className="mx-auto max-w-[1320px] px-[clamp(20px,5vw,72px)] h-full flex items-center justify-end">
          <nav aria-label="Accesos" className="flex items-center gap-6">
            {ACCESOS.map((l) => (
              <AccessLink key={l.label} link={l} className="hover:text-[#fff] transition-colors" />
            ))}
          </nav>
        </div>
      </div>

      {/* Barra principal */}
      <div
        className="transition-[background-color,box-shadow] duration-300"
        style={{
          background: transparent ? 'transparent' : '#ffffff',
          color: textColor,
          boxShadow: !transparent && (scrolled || programasOpen) ? '0 10px 30px -18px rgba(10,31,68,0.35)' : 'none',
        }}
      >
        <div className="mx-auto max-w-[1320px] px-[clamp(20px,5vw,72px)] h-16 md:h-20 flex items-center justify-between gap-4">
          <Link href="/" aria-label={`${CONTACT.name} · ${CONTACT.tagline}`} className="flex items-center shrink-0">
            <IdesieLogo tone={transparent ? 'white' : 'blue'} className="h-9 md:h-11" priority />
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Principal">
            <button
              type="button"
              aria-expanded={programasOpen}
              aria-controls="menu-programas"
              onMouseEnter={hoverOpen}
              onFocus={hoverOpen}
              onClick={() => setProgramasOpen((v) => !v)}
              className={`${navLink} cursor-pointer ${programasOpen ? 'text-[#0052cc]' : 'hover:opacity-70'}`}
            >
              Programas
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${programasOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {NAV_PLAIN.map((l) => (
              <Link key={l.href} href={l.href} onMouseEnter={() => setProgramasOpen(false)} className={`${navLink} hover:opacity-70`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 lg:gap-2">
            <CartLink />
            <button
              type="button"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
              aria-controls="menu-movil"
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden w-11 h-11 inline-flex items-center justify-center rounded-full cursor-pointer"
            >
              {mobileOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Desplegable de Programas (escritorio) */}
        <AnimatePresence>
          {programasOpen && (
            <motion.div
              id="menu-programas"
              initial={{ opacity: 0, y: reduce ? 0 : -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -6, transition: { duration: reduce ? 0 : 0.14 } }}
              transition={{ duration: dur, ease: EASE }}
              className="hidden lg:block absolute inset-x-0 top-full"
              style={{ color: INK }}
            >
              <div className="mx-auto max-w-[1320px] px-[clamp(20px,5vw,72px)]">
                <div className="bg-[#fff] rounded-b-2xl overflow-hidden shadow-[0_30px_60px_-30px_rgba(10,31,68,0.5)]">
                  <ProgramasPanel onNavigate={closeAll} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="menu-movil"
            aria-label="Menú móvil"
            initial={{ opacity: 0, y: reduce ? 0 : -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.14 } }}
            transition={{ duration: dur, ease: EASE }}
            className="lg:hidden bg-[#fff] overflow-y-auto h-[calc(100svh-4rem)] px-[clamp(20px,5vw,72px)] pb-10"
            style={{ color: INK }}
          >
            <div className="pt-6 pb-4">
              <Link
                href="/perfiles"
                onClick={closeAll}
                className="flex items-center justify-between gap-4 rounded-2xl bg-[#0063e6] text-[#fff] px-6 py-5"
              >
                <span>
                  <span className="block font-kinetic font-bold text-lg leading-tight">Elige tu perfil</span>
                  <span className="block text-sm text-[#fff]/80 mt-1">Elige el puesto y te damos el mapa</span>
                </span>
                <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
              </Link>

              <ul className="mt-6">
                <li className="border-b border-[#0a1f44]/12">
                  <button
                    type="button"
                    aria-expanded={mobileProgramas}
                    aria-controls="movil-programas"
                    onClick={() => setMobileProgramas((v) => !v)}
                    className={`w-full ${drawerRow} cursor-pointer`}
                  >
                    Programas
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${mobileProgramas ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {mobileProgramas && (
                    <div id="movil-programas" className="pb-5 space-y-6">
                      <ProgramGroups onNavigate={closeAll} />
                    </div>
                  )}
                </li>
                {NAV_PLAIN.map((l) => (
                  <li key={l.href} className="border-b border-[#0a1f44]/12">
                    <Link href={l.href} onClick={closeAll} className={drawerRow}>
                      {l.label}
                      <ArrowRight className="w-5 h-5 text-[#0a1f44]/50" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>

              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-1">
                {ACCESOS.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 py-2.5 text-[15px] font-medium text-[#0d1522]/80">
                        {l.label} <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      <Link href={l.href} onClick={closeAll} className="block py-2.5 text-[15px] font-medium text-[#0d1522]/80">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-4">
                <BookCallButton className="inline-flex items-center justify-center rounded-full px-5 min-h-12 text-base font-semibold bg-[#0a1f44] text-[#fff]">
                  Agendar llamada
                </BookCallButton>
                <a href={CONTACT.phoneHref} className="text-sm text-[#0d1522]/70 text-center">
                  {CONTACT.phone}
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
