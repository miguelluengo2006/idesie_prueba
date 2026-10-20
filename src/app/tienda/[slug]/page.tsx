import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { SubPageShell, CtaBand } from '@/components/home/SubPage';
import Section from '@/components/home/Section';
import Reveal from '@/components/home/Reveal';
import AddButton from '@/components/shop/AddButton';
import { getCatalog } from '@/lib/shopServer';
import { priceLabel, reservationLabel } from '@/lib/shop';
import { CONTACT } from '@/lib/bim';
import JsonLd from '@/components/JsonLd';
import { OG_IMAGES, breadcrumbJsonLd, courseJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getCatalog()).find((x) => x.slug === slug);
  if (!p) return { title: 'Producto no encontrado', robots: { index: false } };
  return {
    title: p.name,
    description: p.summary,
    alternates: { canonical: `/tienda/${p.slug}` },
    openGraph: { title: `${p.name} · ${CONTACT.name}`, description: p.summary, type: 'website', siteName: CONTACT.name, locale: 'es_ES', images: OG_IMAGES },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const p = (await getCatalog()).find((x) => x.slug === slug);
  if (!p) notFound();
  const reserve = reservationLabel(p);
  const facts = [
    ['Duración', p.duration],
    ['Modalidad', p.modality],
    ['Titulación', p.certification],
  ].filter((f): f is [string, string] => !!f[1]);

  return (
    <SubPageShell>
      <JsonLd
        data={[
          courseJsonLd({ name: p.name, description: p.summary, path: `/tienda/${p.slug}`, online: /online/i.test(p.modality ?? ''), priceEur: p.priceEur, credential: p.certification, duration: p.duration }),
          breadcrumbJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Tienda', path: '/tienda' }, { name: p.name, path: `/tienda/${p.slug}` }]),
        ]}
      />
      <section className="field-navy px-4 md:px-6 pt-32 md:pt-40 pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.3fr_1fr] gap-12 items-end">
          <Reveal>
            <Link href="/tienda" className="text-sm text-[#c9d9f0] hover:text-[#fff] transition-colors">← Volver a la tienda</Link>
            <h1 className="font-kinetic font-bold text-4xl md:text-6xl leading-[1.1] mt-6">{p.name}</h1>
            <p className="text-lg md:text-xl text-[#c9d9f0] leading-relaxed mt-6 max-w-2xl">{p.summary}</p>
          </Reveal>
          <Reveal delay={0.1} className="rounded-3xl bg-[#fff] text-[#0a1f44] p-7 md:p-8">
            <p className="font-kinetic font-bold text-4xl tabular-nums">{priceLabel(p.priceEur)}</p>
            {p.priceEur !== null && p.priceEur > 0 && <p className="text-sm text-[#0a1f44]/65 mt-1">IVA incluido</p>}
            {reserve && <p className="mt-3 rounded-xl bg-[#e9f0fc] px-4 py-3 text-sm font-semibold text-[#0a1f44]">Reserva tu plaza hoy con {reserve}. El resto del importe lo acuerdas con admisiones.</p>}
            <div className="mt-6"><AddButton product={p} block /></div>
            <p className="text-sm text-[#0a1f44]/70 mt-4 leading-relaxed">
              {p.priceEur === null
                ? 'Este programa se matricula con una conversación previa con admisiones.'
                : p.priceEur === 0
                  ? 'Inscripción gratuita: no hace falta tarjeta.'
                  : reserve
                    ? 'Pago seguro online de la reserva. El resto puedes abonarlo con las opciones de financiación que te explica admisiones.'
                    : 'Pago seguro online.'}
            </p>
          </Reveal>
        </div>
      </section>

      <Section field="tint" labelledBy="detalle">
        <h2 id="detalle" className="font-kinetic font-bold text-2xl md:text-4xl leading-[1.15]">Qué incluye</h2>
        <dl className="mt-8 grid md:grid-cols-3 gap-4">
          {facts.map(([k, v]) => (
            <div key={k} className="ui-card p-7">
              <dt className="text-xs font-semibold tracking-[0.16em] uppercase text-[#0052cc]">{k}</dt>
              <dd className="font-kinetic font-bold text-xl mt-3 leading-snug">{v}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-8 grid gap-3 max-w-2xl">
          {['Matrícula y confirmación por email al instante', 'El equipo de admisiones te contacta para los siguientes pasos', 'Factura con IVA incluido'].map((t) => (
            <li key={t} className="flex gap-3"><Check className="w-5 h-5 mt-0.5 text-[#0063e6] shrink-0" aria-hidden="true" />{t}</li>
          ))}
        </ul>
        {p.programHref && (
          <Link href={p.programHref} className="mt-10 inline-flex items-center gap-2 font-semibold underline underline-offset-4">
            Ver el programa completo <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        )}
      </Section>

      <CtaBand title="¿Prefieres que te lo expliquemos?" text="Agenda una llamada con admisiones: resolvemos tus dudas y te ayudamos a elegir." label="Agendar llamada" pack={p.name} />
    </SubPageShell>
  );
}
