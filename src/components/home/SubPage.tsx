import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import SiteHeader from '@/components/home/SiteHeader';
import SiteFooter from '@/components/home/SiteFooter';
import { BookCallButton, BookCallProvider } from '@/components/home/BookCall';
import Reveal from '@/components/home/Reveal';
import { CONTACT } from '@/lib/bim';

/** Armazón común de las páginas interiores: cabecera, contenido y pie de la web, con el diálogo de llamada montado. */
export function SubPageShell({ children }: { children: React.ReactNode }) {
  return (
    <BookCallProvider businessName={CONTACT.name}>
      <div className="home-root min-h-screen relative">
        <SiteHeader />
        <main className="relative z-[2]">{children}</main>
        <SiteFooter className="w-[calc(100%-clamp(20px,5vw,72px))] max-w-[1320px] mx-auto mt-3 mb-4" />
      </div>
    </BookCallProvider>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="px-4 md:px-6 pt-28 pb-16 md:pt-36 md:pb-20">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Inicio
        </Link>
        <p className="text-xs tracking-[0.25em] uppercase text-[var(--signal)]">{eyebrow}</p>
        <h1 className="font-kinetic font-black uppercase text-3xl sm:text-4xl md:text-6xl leading-[1.02] mt-4 max-w-4xl">{title}</h1>
        <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed mt-6">{lead}</p>
        {children}
      </div>
    </section>
  );
}

/** Cierre de página: llamada a la acción sobre fondo oscuro, igual que los bloques destacados de la home. */
export function CtaBand({ title, text, pack, label = 'Agendar llamada' }: { title: string; text: string; pack?: string; label?: string }) {
  return (
    <section className="px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <Reveal className="rounded-[28px] bg-[var(--ink-solid)] text-[#f4f8ff] p-7 md:p-12 flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
          <div className="max-w-2xl">
            <h2 className="font-kinetic font-black uppercase text-2xl md:text-4xl leading-[1.08]">{title}</h2>
            <p className="text-[#c9d9f0] mt-4 leading-relaxed">{text}</p>
          </div>
          <BookCallButton
            pack={pack}
            className="group shrink-0 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[var(--yellow)] text-[#0a1f44] text-sm font-semibold hover:brightness-95 transition cursor-pointer"
          >
            {label}
            <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" aria-hidden="true" />
          </BookCallButton>
        </Reveal>
      </div>
    </section>
  );
}

/** Página que muestra una sección de la home tal cual, con su propia dirección limpia (sin #). */
export function SectionPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SubPageShell>
      <h1 className="sr-only">{title}</h1>
      <div className="pt-16" aria-hidden="true" />
      {children}
    </SubPageShell>
  );
}
