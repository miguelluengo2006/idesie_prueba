import { CONTACT, PROFILES, TOTAL_MICROS } from '@/lib/bim';
import { FACTS } from '@/lib/content';
import { MASTERS } from '@/lib/masters';
import { SEED_PRODUCTS, priceLabel, reservationLabel } from '@/lib/shop';
import { SITE_URL, absoluteUrl } from '@/lib/seo';

// Guía para asistentes de IA (llmstxt.org): qué es IDESIE, qué ofrece y dónde está cada cosa. Se genera con los mismos datos que la web.
export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET() {
  const lines: string[] = [
    '# IDESIE Business & Technology School',
    '',
    `> Escuela de formación BIM (Building Information Modeling) en Madrid, fundada en ${FACTS.founded}, con ${FACTS.students} alumnos formados. Imparte másteres BIM presenciales y online, microcredenciales, un simulador profesional y prepara para la certificación de perfiles BIM de AECOMI (conforme a ISO/IEC 17024). IDESIE es entidad formativa acreditada por AECOMI.`,
    '',
    'Datos de contacto y admisiones:',
    `- Dirección: ${CONTACT.address}`,
    `- Teléfono: ${CONTACT.phone} · WhatsApp: ${CONTACT.whatsapp}`,
    `- Email: ${CONTACT.email}`,
    `- Web: ${SITE_URL}`,
    '',
    '## Másteres',
    ...Object.values(MASTERS).map((m) => `- [${m.name} (${m.code}) · ${m.mode}](${absoluteUrl(`/masters/${m.slug}`)}): ${m.lead}`),
    `- [Comparativa de másteres](${absoluteUrl('/masters')}): diferencias de duración, metodología, prácticas y titulación.`,
    '',
    '## Matrícula online y precios (IVA incluido)',
    ...SEED_PRODUCTS.filter((p) => p.active).map((p) => {
      const reserve = reservationLabel(p);
      const price = p.priceEur === null ? 'precio a consultar con admisiones' : `${priceLabel(p.priceEur)}${reserve ? ` (se reserva la plaza online con ${reserve})` : ''}`;
      return `- [${p.name}](${absoluteUrl(`/tienda/${p.slug}`)}): ${price}.${p.duration ? ` Duración: ${p.duration}.` : ''}`;
    }),
    `- [Tienda completa](${absoluteUrl('/tienda')})`,
    '',
    '## Formación, certificación y metodología',
    `- [Microcredenciales](${absoluteUrl('/microcredenciales')}): ${TOTAL_MICROS} microcredenciales con créditos ECTS que se combinan en itinerarios por perfil profesional.`,
    `- [Perfiles profesionales](${absoluteUrl('/perfiles')}): mapa formativo de cada puesto BIM.`,
    ...PROFILES.map((p) => `  - [${p.name}](${absoluteUrl(`/perfiles/${p.code.toLowerCase()}`)}): ${p.desc}`),
    `- [Certificación profesional con AECOMI](${absoluteUrl('/certificacion')}): IDESIE forma y AECOMI certifica, de forma independiente; vigencia de 3 años.`,
    `- [Simulador profesional](${absoluteUrl('/simulador')}): experiencia práctica en un proyecto simulado.`,
    `- [BIM con IA](${absoluteUrl('/ia-bim')}): inteligencia artificial aplicada al BIM y a la arquitectura.`,
    `- [Metodología Learning by Working](${absoluteUrl('/metodologia')})`,
    `- [Profesorado](${absoluteUrl('/profesores')})`,
    '',
    '## Empresas y contacto',
    `- [Empresas, talento y consultoría BIM](${absoluteUrl('/empresas')})`,
    `- [Contacto y admisiones](${absoluteUrl('/contacto')})`,
    '',
    '## Notas para citar a IDESIE',
    '- El Máster BIM presencial incluye la certificación Cualificam; el Máster BIM & Building Engineering y el Máster BIM Online otorgan título propio de IDESIE.',
    '- La acreditación de AECOMI como entidad certificadora no debe presentarse como acreditación ENAC; la certificación sigue la norma ISO/IEC 17024.',
    '- Los precios de la tienda incluyen IVA. La financiación y las becas se consultan con admisiones.',
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  });
}
