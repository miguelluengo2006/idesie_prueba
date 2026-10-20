import type { Metadata } from 'next';
import { ShieldCheck, CreditCard, BadgeCheck } from 'lucide-react';
import { SubPageShell, CtaBand } from '@/components/home/SubPage';
import Section from '@/components/home/Section';
import Reveal from '@/components/home/Reveal';
import Catalog from '@/components/shop/Catalog';
import { getCatalog } from '@/lib/shopServer';
import { OG_IMAGES } from '@/lib/seo';
import { CONTACT } from '@/lib/bim';

export const dynamic = 'force-dynamic';

const TITLE = 'Tienda: másteres y cursos BIM';
const DESCRIPTION = 'Matricúlate online en los másteres BIM de IDESIE, el título profesional CUALIFICAM o empieza gratis con el curso de Revit. Precios con IVA incluido.';

export const metadata: Metadata = {
  alternates: { canonical: '/tienda' },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: CONTACT.name, locale: 'es_ES', images: OG_IMAGES },
};

const PROMISES = [
  { icon: CreditCard, t: 'Pago seguro con Flywire', x: 'Tarjeta o transferencia en la pasarela de pago. IDESIE nunca ve los datos de tu tarjeta.' },
  { icon: BadgeCheck, t: 'Precio final, IVA incluido', x: 'Lo que ves es lo que pagas. Si tienes un código de descuento, lo aplicas antes de pagar.' },
  { icon: ShieldCheck, t: 'Te acompañamos después', x: 'Al confirmarse el pago, el equipo de admisiones se pone en contacto contigo para completar tu matrícula.' },
];

export default async function Page() {
  const products = await getCatalog();
  return (
    <SubPageShell>
      <section className="field-navy px-4 md:px-6 pt-32 md:pt-40 pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-3xl">
            <h1 className="font-kinetic font-bold text-4xl md:text-6xl leading-[1.1]">
              Matricúlate en IDESIE, <span className="ui-hl">sin papeleo</span>
            </h1>
            <p className="text-lg md:text-xl text-[#c9d9f0] leading-relaxed mt-6 max-w-2xl">
              Elige tu programa, paga online y reserva tu plaza. Si prefieres hablarlo antes, te llamamos sin compromiso.
            </p>
          </Reveal>
        </div>
      </section>

      <Section field="tint" labelledBy="catalogo">
        <h2 id="catalogo" className="sr-only">Programas disponibles</h2>
        <Catalog products={products} />
      </Section>

      <Section field="white" labelledBy="garantias">
        <h2 id="garantias" className="font-kinetic font-bold text-2xl md:text-4xl leading-[1.15] max-w-2xl">Comprar es sencillo y seguro</h2>
        <ul className="mt-10 grid md:grid-cols-3 gap-4">
          {PROMISES.map((p) => (
            <li key={p.t} className="ui-card p-7">
              <p.icon className="w-6 h-6 text-[#0063e6]" aria-hidden="true" />
              <h3 className="font-kinetic font-bold text-lg mt-4">{p.t}</h3>
              <p className="mt-2 text-[#0a1f44]/75 leading-relaxed">{p.x}</p>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand title="¿Dudas sobre qué programa te conviene?" text="Cuéntanos tu perfil y te orientamos. También podemos explicarte las opciones de financiación y becas." label="Hablar con admisiones" />
    </SubPageShell>
  );
}
