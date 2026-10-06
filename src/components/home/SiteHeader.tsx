import Link from 'next/link';
import KineticWordmark from '@/components/home/KineticWordmark';
import { BookCallButton } from '@/components/home/BookCall';
import { CONTACT } from '@/lib/bim';

const NAV = [
  { href: '/#perfiles', label: 'Perfiles' },
  { href: '/#formacion', label: 'Formación' },
  { href: '/#simulador', label: 'Simulador' },
  { href: '/#certificacion', label: 'Certificación' },
  { href: '/#empresas', label: 'Empresas' },
];

/** Cabecera fija de la web pública (home y páginas de perfil). Debe ir dentro de un BookCallProvider. */
export default function SiteHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" aria-label={`${CONTACT.name} · ${CONTACT.tagline}`} className="flex items-baseline gap-3 shrink-0">
          <KineticWordmark name={CONTACT.name} className="text-xl" />
          <span className="hidden xl:inline text-xs text-white/50 tracking-wide">{CONTACT.tagline}</span>
        </Link>
        <nav className="flex items-center gap-1 md:gap-1.5" aria-label="Principal">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden lg:inline-block px-3 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/auth" className="px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
            Acceder
          </Link>
          <Link
            href="/#perfiles"
            className="ml-1 px-4 py-2 min-h-10 inline-flex items-center rounded-full bg-[var(--signal)] text-black text-sm font-medium hover:bg-[var(--signal-dim)] transition-colors whitespace-nowrap"
          >
            <span className="sm:hidden">Tu perfil</span>
            <span className="hidden sm:inline">Encuentra tu perfil</span>
          </Link>
          <BookCallButton className="hidden md:inline-flex ml-1 px-4 py-2 min-h-10 items-center rounded-full border border-white/20 text-sm font-medium hover:border-[var(--signal)] transition-colors whitespace-nowrap">
            Agendar llamada
          </BookCallButton>
        </nav>
      </div>
    </header>
  );
}
