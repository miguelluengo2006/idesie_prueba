/**
 * Tienda de IDESIE: catálogo, cupones y cálculo del pedido. Todo en céntimos enteros (nunca decimales).
 * Lo usan tanto el servidor (que decide el importe real) como el navegador (que solo lo enseña).
 */

export type ProductKind = 'master' | 'curso';

export interface ShopProduct {
  id?: string;
  slug: string;
  name: string;
  kind: ProductKind;
  category: string | null;
  summary: string;
  /** Euros con IVA incluido. null = sin precio publicado (se solicita información); 0 = gratuito. */
  priceEur: number | null;
  /** Euros que se pagan online para reservar plaza (el resto se acuerda con admisiones). null = se paga el precio completo. */
  reservationEur?: number | null;
  duration: string | null;
  modality: string | null;
  certification: string | null;
  /** Ficha del programa en esta web (null = no hay). */
  programHref: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
}

/** Catálogo real de idesie.com (precios con IVA incluido). La migración inserta estos mismos datos. */
export const SEED_PRODUCTS: ShopProduct[] = [
  {
    slug: 'master-bim-full-time',
    name: 'Máster BIM Full Time',
    kind: 'master',
    category: 'BIM',
    summary: 'Trabajas por la mañana, te formas por la tarde y sales siendo BIM Manager, con prácticas remuneradas desde el primer mes.',
    priceEur: 15000,
    reservationEur: 3000,
    duration: '16 meses',
    modality: 'Learning by Working · presencial en Madrid',
    certification: 'Título propio IDESIE + certificación CUALIFICAM',
    programHref: '/masters/mbim',
    featured: true,
    active: true,
    sortOrder: 10,
  },
  {
    slug: 'master-bim-building-engineering',
    name: 'Máster BIM & Building Engineering',
    kind: 'master',
    category: 'BIM',
    summary: 'Especialízate en instalaciones (MEP) con metodología BIM: hidráulica, eléctrica, térmica, PCI y renovables.',
    priceEur: 15000,
    reservationEur: 3000,
    duration: '16 meses',
    modality: 'Learning by Working · presencial en Madrid',
    certification: 'Título propio IDESIE',
    programHref: '/masters/mbbe',
    featured: true,
    active: true,
    sortOrder: 20,
  },
  {
    slug: 'master-bim-online',
    name: 'Máster BIM Online',
    kind: 'master',
    category: 'BIM',
    summary: 'Fórmate como BIM Manager desde donde estés, con los mismos mentores y la misma bolsa de empleo que el máster presencial.',
    priceEur: 4500,
    reservationEur: 3000,
    duration: '12 meses',
    modality: '100 % online · flexible',
    certification: 'Título de Máster BIM de IDESIE',
    programHref: '/masters/mbim-online',
    featured: true,
    active: true,
    sortOrder: 30,
  },
  {
    slug: 'executive-master-bim',
    name: 'Executive Master BIM',
    kind: 'master',
    category: 'BIM',
    summary: 'Máster BIM en formato ejecutivo: clases en viernes por la tarde y sábados, 12 meses.',
    priceEur: null,
    duration: '12 meses',
    modality: 'Fines de semana · viernes tarde y sábados',
    certification: 'Título propio IDESIE',
    programHref: null,
    featured: false,
    active: true,
    sortOrder: 40,
  },
  {
    slug: 'titulo-profesional-cualificam',
    name: 'Título Profesional CUALIFICAM',
    kind: 'curso',
    category: 'BIM',
    summary: 'Obtén el título profesional CUALIFICAM.',
    priceEur: 262.5,
    duration: null,
    modality: null,
    certification: 'CUALIFICAM',
    programHref: null,
    featured: false,
    active: true,
    sortOrder: 50,
  },
  {
    slug: 'curso-revit-gratis',
    name: 'Curso de Revit Gratis · Iniciación',
    kind: 'curso',
    category: 'Programación',
    summary: 'Primer contacto con Revit en 8 horas. Gratuito y 100 % online.',
    priceEur: 0,
    duration: '8 horas',
    modality: '100 % online · gratuito',
    certification: 'Certificado de participación',
    programHref: null,
    featured: false,
    active: true,
    sortOrder: 60,
  },
];

/* ── Dinero ─────────────────────────────────────────────────────────────── */

/** Producto que vende la landing de anuncios. */
export const FULL_TIME_SLUG = 'master-bim-full-time';

export const toCents = (eur: number) => Math.round(eur * 100);
export const fromCents = (cents: number) => cents / 100;

export function formatEur(cents: number): string {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat('es-ES', {
    useGrouping: 'always',
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Precio para enseñar en una ficha: «15.000 €», «Gratis» o «A consultar». */
/** «Reserva con 3.000 €» si el producto se reserva online; null si se paga completo. */
export function reservationLabel(p: Pick<ShopProduct, 'priceEur' | 'reservationEur'>): string | null {
  if (!p.reservationEur || p.priceEur === null || toCents(p.reservationEur) >= toCents(p.priceEur)) return null;
  return formatEur(toCents(p.reservationEur));
}

export function priceLabel(priceEur: number | null): string {
  if (priceEur === null) return 'A consultar';
  if (priceEur === 0) return 'Gratis';
  return formatEur(toCents(priceEur));
}

/* ── Cupones ────────────────────────────────────────────────────────────── */

export type DiscountType = 'percent' | 'amount' | 'fixed_price';

export const DISCOUNT_TYPES: Record<DiscountType, string> = {
  percent: 'Porcentaje',
  amount: 'Importe fijo de descuento',
  fixed_price: 'Precio final especial',
};

export interface ShopCoupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  /** % (1–100), euros de descuento o euros del precio final, según el tipo. */
  discountValue: number;
  /** Slugs a los que se aplica; null = a todos los productos. */
  appliesTo: string[] | null;
  active: boolean;
  validFrom: string | null;
  validUntil: string | null;
  maxUses: number | null;
}

export const COUPON_CODE_RE = /^[A-Z0-9_-]{3,40}$/;
export const normalizeCouponCode = (raw: string) => raw.trim().toUpperCase().replace(/\s+/g, '');

export function describeCoupon(c: Pick<ShopCoupon, 'discountType' | 'discountValue'>): string {
  if (c.discountType === 'percent') return `${c.discountValue.toLocaleString('es-ES')} % de descuento`;
  if (c.discountType === 'amount') return `${formatEur(toCents(c.discountValue))} de descuento`;
  return `Precio especial: ${formatEur(toCents(c.discountValue))}`;
}

/** Errores de validación de un cupón al crearlo o editarlo (vacío = correcto). */
export function validateCouponInput(i: { code: string; discountType: string; discountValue: number; validFrom?: string | null; validUntil?: string | null; maxUses?: number | null }): string | null {
  if (!COUPON_CODE_RE.test(normalizeCouponCode(i.code))) return 'El código debe tener entre 3 y 40 caracteres: letras, números, guion o guion bajo.';
  if (!(i.discountType in DISCOUNT_TYPES)) return 'Elige el tipo de descuento.';
  if (!Number.isFinite(i.discountValue) || i.discountValue <= 0) return 'El valor del descuento debe ser mayor que 0.';
  if (i.discountType === 'percent' && i.discountValue > 100) return 'El porcentaje no puede pasar de 100.';
  if (i.validFrom && i.validUntil && new Date(i.validUntil) <= new Date(i.validFrom)) return 'La fecha de fin debe ser posterior a la de inicio.';
  if (i.maxUses != null && (!Number.isInteger(i.maxUses) || i.maxUses < 1)) return 'El máximo de usos debe ser un número entero de 1 o más.';
  return null;
}

/* ── Presupuesto del pedido ─────────────────────────────────────────────── */

export interface QuoteLine {
  slug: string;
  name: string;
  /** Lo que se paga ahora por este producto: la reserva si la tiene, si no el precio completo. */
  unitCents: number;
  /** Precio completo del programa cuando lo que se paga ahora es solo una reserva. */
  fullCents?: number;
}

export interface Quote {
  ok: boolean;
  lines: QuoteLine[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  coupon: { id: string; code: string; description: string } | null;
  /** Qué ha impedido calcular el pedido (producto no disponible, carrito vacío…). */
  error?: string;
  /** Por qué no vale el código que se ha probado (el pedido sí se calcula, sin descuento). */
  couponError?: string;
}

export const MAX_CART_ITEMS = 10;

export const RESERVATION_PREFIX = 'Reserva de plaza · ';

export interface CouponCheck {
  coupon: ShopCoupon;
  /** Usos ya contados (pagados + pendientes recientes). */
  uses: number;
}

/** Descuento que da un cupón sobre unas líneas, o el motivo por el que no vale. */
export function applyCoupon(
  check: CouponCheck,
  lines: QuoteLine[],
  now: Date = new Date()
): { ok: true; discountCents: number } | { ok: false; error: string } {
  const { coupon, uses } = check;
  if (!coupon.active) return { ok: false, error: 'Este código ya no está activo.' };
  if (coupon.validFrom && new Date(coupon.validFrom) > now) return { ok: false, error: 'Este código todavía no es válido.' };
  if (coupon.validUntil && new Date(coupon.validUntil) < now) return { ok: false, error: 'Este código ha caducado.' };
  if (coupon.maxUses != null && uses >= coupon.maxUses) return { ok: false, error: 'Este código ya se ha agotado.' };

  const eligible = lines.filter((l) => l.unitCents > 0 && (!coupon.appliesTo || coupon.appliesTo.includes(l.slug)));
  if (eligible.length === 0) return { ok: false, error: 'Este código no se aplica a los productos de tu carrito.' };
  const base = eligible.reduce((s, l) => s + l.unitCents, 0);

  let discount: number;
  if (coupon.discountType === 'percent') discount = Math.round((base * coupon.discountValue) / 100);
  else if (coupon.discountType === 'amount') discount = toCents(coupon.discountValue);
  else {
    const target = toCents(coupon.discountValue);
    discount = eligible.reduce((s, l) => s + Math.max(0, l.unitCents - target), 0);
  }
  discount = Math.min(Math.max(0, discount), base);
  if (discount === 0) return { ok: false, error: 'Este código no aplica ningún descuento a tu carrito.' };
  return { ok: true, discountCents: discount };
}

/**
 * Calcula el pedido desde cero con los precios reales del catálogo. Es la única fuente del importe:
 * el carrito del navegador solo aporta los `slug`.
 */
export function buildQuote(products: ShopProduct[], slugs: string[], coupon?: CouponCheck | null, couponCodeTried?: string, now: Date = new Date()): Quote {
  const empty: Quote = { ok: false, lines: [], subtotalCents: 0, discountCents: 0, totalCents: 0, coupon: null };
  const unique = [...new Set(slugs.filter((s) => typeof s === 'string' && s))];
  if (unique.length === 0) return { ...empty, error: 'Tu carrito está vacío.' };
  if (unique.length > MAX_CART_ITEMS) return { ...empty, error: 'Hay demasiados productos en el carrito.' };

  const lines: QuoteLine[] = [];
  for (const slug of unique) {
    const p = products.find((x) => x.slug === slug);
    if (!p || !p.active) return { ...empty, error: 'Un producto de tu carrito ya no está disponible. Quítalo para continuar.' };
    if (p.priceEur === null) return { ...empty, error: `«${p.name}» no se compra online: solicita información y te asesoramos.` };
    const full = toCents(p.priceEur);
    const reserve = p.reservationEur ? Math.min(toCents(p.reservationEur), full) : null;
    lines.push(reserve !== null && reserve < full ? { slug: p.slug, name: `${RESERVATION_PREFIX}${p.name}`, unitCents: reserve, fullCents: full } : { slug: p.slug, name: p.name, unitCents: full });
  }
  const subtotalCents = lines.reduce((s, l) => s + l.unitCents, 0);
  const base: Quote = { ok: true, lines, subtotalCents, discountCents: 0, totalCents: subtotalCents, coupon: null };

  if (!couponCodeTried?.trim()) return base;
  if (!coupon) return { ...base, couponError: 'Código no válido.' };
  const result = applyCoupon(coupon, lines, now);
  if ('error' in result) return { ...base, couponError: result.error };
  return {
    ...base,
    discountCents: result.discountCents,
    totalCents: subtotalCents - result.discountCents,
    coupon: { id: coupon.coupon.id, code: coupon.coupon.code, description: describeCoupon(coupon.coupon) },
  };
}

/* ── Pedidos ────────────────────────────────────────────────────────────── */

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendiente de pago',
  paid: 'Pagado',
  failed: 'Pago fallido',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

/** Un pedido pendiente reserva el uso de su cupón durante este tiempo; pasado, el uso se libera. */
export const PENDING_HOLD_HOURS = 24;

export const isValidBuyerEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 200;
