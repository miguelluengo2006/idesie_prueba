import Link from 'next/link';
import KineticWordmark from '@/components/home/KineticWordmark';
import CookieSettingsLink from '@/components/legal/CookieSettingsLink';
import { LEGAL_LINKS } from '@/components/legal/LegalPage';
import { CONTACT } from '@/lib/bim';

/** Pie de página de la web: datos de contacto, navegación, acceso y todos los enlaces legales. */
export default function SiteFooter({ className = '' }: { className?: string }) {
  const link = 'hover:text-white transition-colors';
  return (
    <footer className={`home-slab relative z-[2] ${className}`}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="Inicio">
              <KineticWordmark name={CONTACT.name} className="text-xl" />
            </Link>
            <p className="mt-3 text-sm text-white/70 max-w-xs">{CONTACT.slogan}</p>
            <address className="mt-4 text-sm text-white/50 not-italic leading-relaxed">
              {CONTACT.address}
              <br />
              <a href={CONTACT.phoneHref} className={link}>{CONTACT.phone}</a>
              {' · '}
              <a href={`mailto:${CONTACT.email}`} className={link}>{CONTACT.email}</a>
            </address>
          </div>

          <nav aria-label="Web" className="text-sm text-white/50">
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-white/30">Web</h2>
            <ul className="space-y-2">
              <li><Link href="/perfiles" className={link}>Perfiles profesionales</Link></li>
              <li><Link href="/formacion" className={link}>Másteres y microcredenciales</Link></li>
              <li><Link href="/ia-bim" className={link}>BIM con IA</Link></li>
              <li><Link href="/metodologia" className={link}>Metodología</Link></li>
              <li><Link href="/profesores" className={link}>Profesores</Link></li>
              <li><Link href="/certificacion" className={link}>Certificación</Link></li>
              <li><Link href="/empresas" className={link}>Empresas y consultoría</Link></li>
              <li><Link href="/contacto" className={link}>Contacto</Link></li>
            </ul>
          </nav>

          <nav aria-label="Legal" className="text-sm text-white/50">
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-white/30">Legal</h2>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>
              ))}
              <li><CookieSettingsLink className={`${link} cursor-pointer text-left`} /></li>
            </ul>
          </nav>

          <div className="text-sm text-white/50">
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-white/30">Certificación</h2>
            <p className="leading-relaxed">
              Entidad formativa acreditada por{' '}
              <a href={CONTACT.aecomiUrl} target="_blank" rel="noopener noreferrer" className={`${link} underline underline-offset-2`}>
                AECOMI
              </a>
              , la entidad que certifica los perfiles.
            </p>
          </div>
        </div>

        <p className="mt-10 pt-6 border-t border-white/10 text-xs text-white/30">
          © {new Date().getFullYear()} {CONTACT.name} {CONTACT.tagline}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
