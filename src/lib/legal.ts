/**
 * Datos legales del titular de la web (Aviso legal, Privacidad, Cookies y Términos los leen de aquí).
 * Edita este archivo para cambiarlos. Un dato que empiece por «[COMPLETAR» se enseña resaltado en amarillo
 * en las páginas legales, para que no se publique a medias sin darte cuenta.
 */

export const LEGAL = {
  /** Nombre comercial */
  brand: 'IDESIE',
  /** Dominio de la web */
  domain: 'idesie.com',
  /** Razón social o nombre y apellidos del autónomo */
  name: 'IDESIE BUSINESS SCHOOL SL',
  /** NIF / CIF */
  taxId: 'B86143210',
  /** Domicilio completo */
  address: 'Calle Montalbán 3, 1º derecha, 28014 Madrid, España',
  /** Email de contacto y de ejercicio de derechos de protección de datos */
  email: 'info@idesie.com',
  /** Teléfono (opcional) */
  phone: '+34 91 485 91 32',
  /** Datos de inscripción en el Registro Mercantil (solo sociedades; opcional) */
  registry: 'Registro Mercantil de Madrid, Tomo 28534, Libro 0, Folio 206, Sección 8, Hoja M-513103, Inscripción 1ª (22/01/2011)',
  /** Fecha de la última revisión de los textos */
  updated: '20 de octubre de 2026',
} as const;

export const isPending = (v: string) => v.startsWith('[COMPLETAR');
