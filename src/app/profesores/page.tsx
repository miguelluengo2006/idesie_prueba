import type { Metadata } from 'next';
import Reveal, { SectionHead } from '@/components/home/Reveal';
import { CtaBand, PageHero, SubPageShell } from '@/components/home/SubPage';
import { CONTACT } from '@/lib/bim';
import { OG_IMAGES } from '@/lib/seo';
import { PROFESSORS, initials, type Professor } from '@/lib/professors';

const TITLE = 'Claustro de profesores';
const DESCRIPTION =
  'Dirección de IDESIE y profesionales en activo de Hill International, ISG, L35, Sir Robert McAlpine y más: enseñan lo que hacen cada día en el sector AEC.';

export const metadata: Metadata = {
  alternates: { canonical: '/profesores' },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES', images: OG_IMAGES },
  twitter: { card: 'summary_large_image', images: ['/og-idesie.png'], title: TITLE, description: DESCRIPTION },
};

function Card({ p, delay }: { p: Professor; delay: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="h-full ui-card p-6 hover:border-[var(--signal)]/50 transition-colors">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="w-12 h-12 shrink-0 rounded-full bg-[var(--signal)]/10 text-[var(--signal)] font-kinetic font-bold flex items-center justify-center"
          >
            {initials(p.name)}
          </span>
          <div>
            <h3 className="font-kinetic font-bold text-sm md:text-base leading-snug">{p.name}</h3>
            <p className="text-xs text-[var(--signal)] mt-0.5">{p.organization}</p>
          </div>
        </div>
        <p className="text-sm font-semibold mt-4 leading-snug">{p.title}</p>
        <p className="text-sm text-white/60 leading-relaxed mt-2">{p.bio}</p>
      </article>
    </Reveal>
  );
}

export default function ProfesoresPage() {
  const direccion = PROFESSORS.filter((p) => p.group === 'direccion');
  const claustro = PROFESSORS.filter((p) => p.group === 'claustro');

  return (
    <SubPageShell>
      <PageHero
        eyebrow="Claustro de profesores"
        title="Aprende de quien lo hace todos los días"
        lead="Nuestro claustro combina la dirección de IDESIE con profesionales en activo de empresas de referencia del sector AEC. No enseñan lo que leyeron: enseñan lo que hacen."
      />

      <section aria-labelledby="direccion-title" className="field-white px-4 md:px-6 py-10 md:py-16">
        <div className="max-w-6xl mx-auto">
          <SectionHead eyebrow="Dirección" title={<span id="direccion-title">Quién dirige IDESIE</span>} />
          <div className="mt-10 grid md:grid-cols-2 gap-4">
            {direccion.map((p, i) => (
              <Card key={p.name} p={p} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="claustro-title" className="field-tint px-4 md:px-6 py-10 md:py-16">
        <div className="max-w-6xl mx-auto">
          <SectionHead eyebrow="Profesionales en activo" title={<span id="claustro-title">Claustro</span>} />
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {claustro.map((p, i) => (
              <Card key={p.name} p={p} delay={(i % 3) * 0.08} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="¿Quieres conocernos?"
        text="Agenda una llamada de 30 minutos y te contamos cómo trabajamos y qué perfil encaja contigo."
      />
    </SubPageShell>
  );
}
