/**
 * Redirecciones 301 de las URLs que Google ya conoce de idesie.com (las `-page` de la web anterior y las del WordPress original)
 * a su página equivalente en esta web. Así no se pierde el posicionamiento ni los enlaces entrantes.
 * Las que no tienen página equivalente apuntan a la más cercana en contenido, nunca a una 404.
 */
export interface Redirect {
  source: string;
  destination: string;
}

const MBIM = '/masters/mbim';
const MBIM_ONLINE = '/masters/mbim-online';
const MBBE = '/masters/mbbe';
const EXECUTIVE = '/tienda/executive-master-bim';

export const REDIRECTS: Redirect[] = [
  // Programas
  { source: '/mbim-page', destination: MBIM },
  { source: '/master-bim-building-information-modeling', destination: MBIM },
  { source: '/masters-full-time', destination: MBIM },
  { source: '/mbim-online-page', destination: MBIM_ONLINE },
  { source: '/master-bim-manager-online', destination: MBIM_ONLINE },
  { source: '/mbbe-page', destination: MBBE },
  { source: '/mbbe-master-bim-building-engineering', destination: MBBE },
  { source: '/executive-master-direccion-estrategica-energia', destination: MBBE },
  { source: '/master-direccion-estrategica-energia', destination: MBBE },
  { source: '/embim-page', destination: EXECUTIVE },
  { source: '/executive-master-building-information-modeling', destination: EXECUTIVE },
  { source: '/executive-master-building-information-engineering', destination: EXECUTIVE },
  { source: '/masters-executive', destination: EXECUTIVE },
  { source: '/comparativa-masters-page', destination: '/masters' },
  { source: '/comparativa-master-bim', destination: '/masters' },
  { source: '/short-courses-page', destination: '/microcredenciales' },
  { source: '/cursos-cortos', destination: '/microcredenciales' },

  // Tienda: las fichas conservan el mismo slug
  { source: '/producto/:slug', destination: '/tienda/:slug' },
  { source: '/categoria-producto/:path*', destination: '/tienda' },
  { source: '/pago-directo', destination: '/tienda' },

  // Empresas y servicios
  { source: '/empresas-page', destination: '/empresas' },
  { source: '/in-company-page', destination: '/empresas' },
  { source: '/formacion-in-company', destination: '/empresas' },
  { source: '/bim-consulting-page', destination: '/empresas' },
  { source: '/consultoria-bim', destination: '/empresas' },
  { source: '/bolsa-de-empleo-page', destination: '/empresas' },
  { source: '/bolsa-de-empleo-idesie', destination: '/empresas' },
  { source: '/jobs', destination: '/empresas' },

  // Escuela
  { source: '/nuestra-metodologia-page', destination: '/metodologia' },
  { source: '/profesores-page', destination: '/profesores' },
  { source: '/claustro', destination: '/profesores' },
  { source: '/sobre-idesie-page', destination: '/' },
  { source: '/sobre-idesie', destination: '/' },
  { source: '/alumni-page', destination: '/#alumni' },
  { source: '/alianzas-page', destination: '/#alianzas' },
  { source: '/partners', destination: '/#alianzas' },
  { source: '/opiniones-page', destination: '/#alumni' },
  { source: '/opiniones-master-bim-arquitectura-ingenieria', destination: '/#alumni' },

  // Admisiones, contacto y financiación (se atiende por admisiones)
  { source: '/contact-page', destination: '/contacto' },
  { source: '/contacto-idesie', destination: '/contacto' },
  { source: '/peticion-informacion', destination: '/contacto' },
  { source: '/financiacion-y-becas-page', destination: '/contacto' },
  { source: '/financiacion-becas', destination: '/contacto' },
  { source: '/financiacion-con-metodologia-isa', destination: '/contacto' },

  // Legal
  { source: '/aviso-legal-page', destination: '/aviso-legal' },
  { source: '/politica-privacidad-page', destination: '/privacidad' },
  { source: '/politica-cookies-page', destination: '/cookies' },
  { source: '/politica-de-cookies', destination: '/cookies' },
  { source: '/solicitud-baja-page', destination: '/baja' },

  // Rutas antiguas de esta misma web
  { source: '/formacion', destination: '/masters' },
  { source: '/carrito', destination: '/checkout' },

  // Contenido que ya no existe como página propia
  { source: '/blog', destination: '/' },
  { source: '/blog/:path*', destination: '/' },
  { source: '/wp-content/uploads/:path*', destination: '/contacto' },
];
