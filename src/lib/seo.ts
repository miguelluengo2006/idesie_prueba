import { CONTACT } from '@/lib/bim';

/** Dirección pública de la web: base de los canonicals, el sitemap y los datos estructurados. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://idesie.com').replace(/\/+$/, '');

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export const SOCIAL_LINKS = [
  'https://www.linkedin.com/school/idesie-business-school/',
  'https://www.instagram.com/idesiebs/',
  'https://www.facebook.com/idesie/',
];

/** Imagen para compartir en redes (1200×630). Cada página que define su `openGraph` debe incluirla: Next no la hereda del layout. */
export const OG_IMAGES = [{ url: '/og-idesie.png', width: 1200, height: 630, alt: 'IDESIE Business & Technology School · Madrid' }];

export const ORG_ID = `${SITE_URL}/#organization`;

/** La escuela, descrita para buscadores y asistentes de IA (schema.org). */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': ORG_ID,
    name: 'IDESIE Business & Technology School',
    alternateName: ['IDESIE', 'IDESIE Business School'],
    legalName: 'IDESIE BUSINESS SCHOOL SL',
    url: SITE_URL,
    logo: absoluteUrl('/img/idesie-logo.png'),
    image: absoluteUrl('/img/idesie-logo.png'),
    description:
      'Escuela de formación BIM en Madrid: másteres BIM presenciales y online, microcredenciales, simulador profesional y certificación de perfiles BIM con AECOMI, conforme a ISO/IEC 17024.',
    foundingDate: '2012',
    email: CONTACT.email,
    telephone: CONTACT.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Calle San Aquilino, 13',
      postalCode: '28029',
      addressLocality: 'Madrid',
      addressCountry: 'ES',
    },
    areaServed: ['ES', 'LATAM'],
    knowsAbout: ['BIM', 'Building Information Modeling', 'Revit', 'ISO 19650', 'Inteligencia artificial aplicada a la arquitectura', 'Certificación de perfiles BIM'],
    sameAs: SOCIAL_LINKS,
    contactPoint: [
      { '@type': 'ContactPoint', contactType: 'admisiones', telephone: CONTACT.phone, email: CONTACT.email, availableLanguage: 'es' },
    ],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'IDESIE Business & Technology School',
    inLanguage: 'es-ES',
    publisher: { '@id': ORG_ID },
  };
}

/** «16 meses» → «P16M», «8 horas» → «PT8H» (formato que exige schema.org); null si no se reconoce. */
export function isoDuration(text?: string | null): string | null {
  const m = text?.match(/(\d+)\s*(meses|mes|horas|hora|semanas|semana)/i);
  if (!m) return null;
  const unit = m[2].toLowerCase();
  if (unit.startsWith('mes')) return `P${m[1]}M`;
  if (unit.startsWith('sem')) return `P${m[1]}W`;
  return `PT${m[1]}H`;
}

export interface CourseInput {
  name: string;
  description: string;
  path: string;
  online: boolean;
  /** Precio publicado con IVA incluido; null si se pide por admisiones. */
  priceEur?: number | null;
  credential?: string | null;
  duration?: string | null;
}

/** Programa formativo como `Course`, con su oferta si tiene precio publicado. */
export function courseJsonLd(c: CourseInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: c.name,
    description: c.description,
    url: absoluteUrl(c.path),
    inLanguage: 'es-ES',
    provider: { '@type': 'EducationalOrganization', '@id': ORG_ID, name: 'IDESIE Business & Technology School', sameAs: SITE_URL },
    ...(c.credential ? { educationalCredentialAwarded: c.credential } : {}),
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: c.online ? 'online' : 'onsite',
      ...(isoDuration(c.duration) ? { courseWorkload: isoDuration(c.duration) } : {}),
      ...(c.online ? {} : { location: { '@type': 'Place', name: 'IDESIE Business & Technology School', address: 'Calle San Aquilino, 13, 28029 Madrid, España' } }),
    },
    ...(c.priceEur !== null && c.priceEur !== undefined
      ? { offers: { '@type': 'Offer', price: c.priceEur, priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: absoluteUrl(c.path), category: 'Paid' } }
      : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}
