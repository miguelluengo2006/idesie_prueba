import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sanitizeString, isValidEmail } from '@/lib/validation';
import { upsertContacts } from '@/lib/crmServer';
import { resolveLeadMailer, sendLeadMail, mailerFor } from '@/lib/leadMailer';
import { sendTelegram, purchaseAlertText } from '@/lib/telegram';
import { orderPaidEmail } from '@/lib/shopEmail';
import { buildFlywireUrl, flywireWebhookEnabled, orderStatusFromFlywire, type FlywireEvent } from '@/lib/flywire';
import {
  SEED_PRODUCTS, buildQuote, fromCents, normalizeCouponCode, toCents, validateCouponInput,
  type CouponCheck, type DiscountType, type OrderStatus, type Quote, type ShopCoupon, type ShopProduct,
} from '@/lib/shop';

const PHONE_RE = /^[+()\d\s.-]{6,25}$/;

/* ── Filas de la base de datos ──────────────────────────────────────────── */

type Row = Record<string, any>;

export const productFromRow = (r: Row): ShopProduct => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  kind: r.kind,
  category: r.category ?? null,
  summary: r.summary ?? '',
  priceEur: r.price_eur === null || r.price_eur === undefined ? null : Number(r.price_eur),
  reservationEur: r.reservation_eur === null || r.reservation_eur === undefined ? null : Number(r.reservation_eur),
  duration: r.duration ?? null,
  modality: r.modality ?? null,
  certification: r.certification ?? null,
  programHref: r.program_href ?? null,
  featured: !!r.featured,
  active: !!r.active,
  sortOrder: Number(r.sort_order) || 0,
});

export const couponFromRow = (r: Row): ShopCoupon => ({
  id: r.id,
  code: r.code,
  description: r.description ?? '',
  discountType: r.discount_type as DiscountType,
  discountValue: Number(r.discount_value),
  appliesTo: Array.isArray(r.applies_to) && r.applies_to.length ? r.applies_to : null,
  active: !!r.active,
  validFrom: r.valid_from ?? null,
  validUntil: r.valid_until ?? null,
  maxUses: r.max_uses ?? null,
});

/* ── Catálogo ───────────────────────────────────────────────────────────── */

export async function getProducts(opts: { all?: boolean } = {}): Promise<ShopProduct[]> {
  let q = supabaseAdmin.from('shop_products').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true });
  if (!opts.all) q = q.eq('active', true);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data || []).map(productFromRow);
}

export async function getProduct(slug: string): Promise<ShopProduct | null> {
  const { data } = await supabaseAdmin.from('shop_products').select('*').eq('slug', slug).eq('active', true).maybeSingle();
  return data ? productFromRow(data) : null;
}

/* ── Cupones y presupuesto ──────────────────────────────────────────────── */

export async function loadCouponCheck(rawCode: string): Promise<CouponCheck | null> {
  const code = normalizeCouponCode(rawCode);
  if (!code) return null;
  const { data } = await supabaseAdmin.from('shop_coupons').select('*').eq('code', code).maybeSingle();
  if (!data) return null;
  const { data: uses } = await supabaseAdmin.rpc('shop_coupon_uses', { p_coupon: data.id });
  return { coupon: couponFromRow(data), uses: Number(uses) || 0 };
}

/** El presupuesto con los precios reales de la base de datos: lo único que decide el importe. */
export async function quoteFor(slugs: string[], couponCode?: string): Promise<Quote> {
  const products = await getProducts();
  const check = couponCode?.trim() ? await loadCouponCheck(couponCode) : null;
  return buildQuote(products, slugs, check, couponCode);
}

/* ── Crear el pedido ────────────────────────────────────────────────────── */

export interface NewOrderInput {
  slugs: string[];
  couponCode?: string;
  buyer: { firstName: string; lastName: string; email: string; phone?: string };
  acceptedTerms: boolean;
  marketing: boolean;
}

export type CreateOrderResult =
  | { ok: true; number: string; token: string; totalCents: number; free: boolean; paymentUrl: string | null }
  | { ok: false; error: string; status: number };

async function ownerId(): Promise<string | null> {
  const { data } = await supabaseAdmin.from('profiles').select('id').order('created_at', { ascending: true }).limit(1).maybeSingle();
  return data?.id ?? null;
}

export async function createOrder(input: NewOrderInput, siteUrl: string): Promise<CreateOrderResult> {
  const firstName = sanitizeString(input.buyer.firstName || '', 100);
  const lastName = sanitizeString(input.buyer.lastName || '', 120);
  const email = (input.buyer.email || '').trim().toLowerCase();
  const phone = sanitizeString(input.buyer.phone || '', 25);
  if (!firstName) return { ok: false, error: 'Escribe tu nombre.', status: 400 };
  if (!lastName) return { ok: false, error: 'Escribe tus apellidos.', status: 400 };
  if (!isValidEmail(email)) return { ok: false, error: 'Introduce un email válido.', status: 400 };
  if (phone && !PHONE_RE.test(phone)) return { ok: false, error: 'El teléfono no es válido.', status: 400 };
  if (!input.acceptedTerms) return { ok: false, error: 'Acepta los términos y la política de privacidad para continuar.', status: 400 };

  const products = await getProducts();
  const check = input.couponCode?.trim() ? await loadCouponCheck(input.couponCode) : null;
  const quote = buildQuote(products, input.slugs, check, input.couponCode);
  if (!quote.ok) return { ok: false, error: quote.error || 'No se pudo calcular el pedido.', status: 409 };
  // Si pidió un código y no vale, no se sigue con otro importe del que ha visto: que lo quite o lo corrija
  if (quote.couponError) return { ok: false, error: quote.couponError, status: 409 };

  const free = quote.totalCents === 0;
  const now = new Date().toISOString();
  const { data: order, error } = await supabaseAdmin
    .from('shop_orders')
    .insert({
      status: free ? 'paid' : 'pending',
      paid_at: free ? now : null,
      provider: free ? 'none' : 'flywire',
      buyer_first_name: firstName,
      buyer_last_name: lastName,
      buyer_email: email,
      buyer_phone: phone || null,
      subtotal_eur: fromCents(quote.subtotalCents),
      discount_eur: fromCents(quote.discountCents),
      total_eur: fromCents(quote.totalCents),
      coupon_id: quote.coupon?.id ?? null,
      coupon_code: quote.coupon?.code ?? null,
      terms_accepted_at: now,
      marketing_consent: input.marketing === true,
    })
    .select('id, number, public_token')
    .single();
  if (error || !order) {
    console.error('Shop: no se pudo guardar el pedido:', error);
    return { ok: false, error: 'No se pudo registrar el pedido. Inténtalo de nuevo.', status: 500 };
  }

  const { error: itemsError } = await supabaseAdmin.from('shop_order_items').insert(
    quote.lines.map((l) => ({
      order_id: order.id,
      product_id: products.find((p) => p.slug === l.slug)?.id ?? null,
      product_slug: l.slug,
      product_name: l.name,
      quantity: 1,
      unit_price_eur: fromCents(l.unitCents),
      full_price_eur: l.fullCents ? fromCents(l.fullCents) : null,
    }))
  );
  if (itemsError) {
    console.error('Shop: no se pudieron guardar las líneas del pedido:', itemsError);
    await supabaseAdmin.from('shop_orders').delete().eq('id', order.id);
    return { ok: false, error: 'No se pudo registrar el pedido. Inténtalo de nuevo.', status: 500 };
  }

  // Dos compras a la vez con el último uso de un cupón: el pedido que lo pasa de máximo se deshace
  if (check?.coupon.maxUses != null) {
    const { data: uses } = await supabaseAdmin.rpc('shop_coupon_uses', { p_coupon: check.coupon.id });
    if (Number(uses) > check.coupon.maxUses) {
      await supabaseAdmin.from('shop_orders').delete().eq('id', order.id);
      return { ok: false, error: 'Este código ya se ha agotado.', status: 409 };
    }
  }

  // CRM: el comprador entra en Contactos (suscrito a campañas solo si marcó la casilla)
  try {
    const owner = await ownerId();
    if (owner) {
      await upsertContacts(supabaseAdmin, owner, [{ email, name: `${firstName} ${lastName}`, phone }], {
        source: 'web',
        consent: input.marketing === true,
        extraTags: ['Tienda'],
      });
    }
  } catch (e) {
    console.error('Shop: pedido guardado, pero no se pudo crear el contacto:', e);
  }

  if (free) {
    await onOrderPaid(order.id);
    return { ok: true, number: order.number, token: order.public_token, totalCents: 0, free: true, paymentUrl: null };
  }

  const paymentUrl = buildFlywireUrl({
    totalCents: quote.totalCents,
    firstName,
    lastName,
    email,
    orderNumber: order.number,
    token: order.public_token,
    siteUrl,
    callbacks: flywireWebhookEnabled(),
  });
  return { ok: true, number: order.number, token: order.public_token, totalCents: quote.totalCents, free: false, paymentUrl };
}

/* ── Pedido pagado ──────────────────────────────────────────────────────── */

/** Tras confirmarse un pago (webhook, pedido gratuito o a mano): contacto «Cliente», aviso al equipo y correo al comprador. */
export async function onOrderPaid(orderId: string): Promise<void> {
  const { data: order } = await supabaseAdmin.from('shop_orders').select('*').eq('id', orderId).maybeSingle();
  if (!order) return;
  const { data: items } = await supabaseAdmin.from('shop_order_items').select('product_name, unit_price_eur').eq('order_id', orderId);
  const lines = (items || []).map((i: Row) => ({ name: String(i.product_name), unitCents: toCents(Number(i.unit_price_eur)) }));

  try {
    const owner = await ownerId();
    if (owner) {
      await upsertContacts(
        supabaseAdmin,
        owner,
        [{ email: order.buyer_email, name: `${order.buyer_first_name} ${order.buyer_last_name}`, phone: order.buyer_phone }],
        { source: 'web', consent: order.marketing_consent === true, extraTags: ['Cliente'] }
      );
    }
  } catch (e) {
    console.error('Shop: pago confirmado, pero no se pudo actualizar el contacto:', e);
  }

  const siteBase = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  await sendTelegram(
    purchaseAlertText({
      packName: lines.map((l) => l.name).join(' + ') || order.number,
      amountEur: Number(order.total_eur),
      customer: `${order.buyer_first_name} ${order.buyer_last_name} · ${order.number}`,
      email: order.buyer_email,
      phone: order.buyer_phone,
      livemode: true,
    }),
    siteBase ? { label: 'Ver pedidos', url: `${siteBase}/portal/orders` } : undefined
  ).catch(() => false);

  try {
    const owner = await ownerId();
    const mailer = owner ? await resolveLeadMailer(supabaseAdmin, owner) : null;
    if (mailer) {
      const mail = orderPaidEmail({
        number: order.number,
        buyerFirstName: order.buyer_first_name,
        totalCents: toCents(Number(order.total_eur)),
        discountCents: toCents(Number(order.discount_eur)),
        couponCode: order.coupon_code,
        items: lines,
      });
      await sendLeadMail(mailerFor(mailer, order.buyer_email), { ...mail, idempotencyKey: `order-paid-${order.id}` });
    }
  } catch (e) {
    console.error('Shop: pago confirmado, pero no se pudo enviar el correo al comprador:', e);
  }
}

/* ── Avisos de Flywire ──────────────────────────────────────────────────── */

export type PaymentEventOutcome = 'paid' | 'status_updated' | 'recorded' | 'duplicate' | 'unknown_order' | 'amount_mismatch' | 'ignored';

/**
 * Procesa un aviso ya verificado (firma correcta). Idempotente: un mismo aviso repetido no hace nada.
 * Solo marca «pagado» si el importe y la moneda que cobró Flywire coinciden con los del pedido.
 */
export async function processFlywireEvent(event: FlywireEvent, payload: unknown): Promise<PaymentEventOutcome> {
  const { data: order } = await supabaseAdmin.from('shop_orders').select('id, status, total_eur').eq('number', event.reference).maybeSingle();

  const dedupe = `${event.paymentId}:${event.status}:${event.eventDate}`;
  const { error: dupError } = await supabaseAdmin.from('shop_payment_events').insert({
    order_id: order?.id ?? null,
    dedupe_key: dedupe,
    status: event.status,
    provider_ref: event.paymentId,
    amount_cents: event.amountToCents,
    outcome: order ? 'recorded' : 'unknown_order',
    payload,
  });
  if (dupError) {
    if (dupError.code === '23505') return 'duplicate';
    throw new Error(dupError.message);
  }
  if (!order) return 'unknown_order';

  const setOutcome = async (outcome: PaymentEventOutcome) => {
    await supabaseAdmin.from('shop_payment_events').update({ outcome }).eq('dedupe_key', dedupe);
    return outcome;
  };

  await supabaseAdmin.from('shop_orders').update({ provider_ref: event.paymentId, provider_status: event.status, updated_at: new Date().toISOString() }).eq('id', order.id);

  const next = orderStatusFromFlywire(event.status);
  if (!next) return setOutcome('status_updated');

  if (next === 'paid') {
    const matches = event.amountToCents === toCents(Number(order.total_eur)) && (!event.currencyTo || event.currencyTo === 'EUR');
    if (!matches) {
      await supabaseAdmin.from('shop_orders').update({ notes: `Aviso de Flywire con importe distinto al del pedido (${event.amountToCents ?? '?'} ${event.currencyTo ?? ''}). Revisar a mano.` }).eq('id', order.id);
      return setOutcome('amount_mismatch');
    }
    const { data: changed } = await supabaseAdmin
      .from('shop_orders')
      .update({ status: 'paid', paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', order.id)
      .neq('status', 'paid')
      .select('id');
    if (changed?.length) {
      await onOrderPaid(order.id);
      return setOutcome('paid');
    }
    return setOutcome('status_updated');
  }

  // failed / cancelled solo cierran un pedido que sigue pendiente; reembolso solo de uno pagado
  const from: OrderStatus = next === 'refunded' ? 'paid' : 'pending';
  const { data: changed } = await supabaseAdmin
    .from('shop_orders')
    .update({ status: next, updated_at: new Date().toISOString() })
    .eq('id', order.id)
    .eq('status', from)
    .select('id');
  return setOutcome(changed?.length ? 'status_updated' : 'ignored');
}

/* ── Acciones del equipo desde el CRM ───────────────────────────────────── */

export type OrderAction = 'mark_paid' | 'cancel' | 'refund';

const TRANSITIONS: Record<OrderAction, { from: OrderStatus[]; to: OrderStatus; note: string }> = {
  mark_paid: { from: ['pending', 'failed', 'cancelled'], to: 'paid', note: 'Marcado como pagado a mano' },
  cancel: { from: ['pending', 'failed'], to: 'cancelled', note: 'Cancelado a mano' },
  refund: { from: ['paid'], to: 'refunded', note: 'Marcado como reembolsado a mano' },
};

export async function applyOrderAction(orderId: string, action: OrderAction, byEmail: string): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const t = TRANSITIONS[action];
  if (!t) return { ok: false, error: 'Acción no válida.', status: 400 };
  const { data: order } = await supabaseAdmin.from('shop_orders').select('id, status, notes').eq('id', orderId).maybeSingle();
  if (!order) return { ok: false, error: 'Pedido no encontrado.', status: 404 };
  if (!t.from.includes(order.status)) return { ok: false, error: 'Ese cambio no es posible con el estado actual del pedido.', status: 409 };

  const note = `${new Date().toLocaleDateString('es-ES')}: ${t.note} (${byEmail})`;
  const { data: changed } = await supabaseAdmin
    .from('shop_orders')
    .update({
      status: t.to,
      paid_at: t.to === 'paid' ? new Date().toISOString() : undefined,
      notes: order.notes ? `${order.notes}\n${note}` : note,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .in('status', t.from)
    .select('id');
  if (!changed?.length) return { ok: false, error: 'El pedido cambió mientras tanto. Recarga la lista.', status: 409 };
  if (t.to === 'paid') await onOrderPaid(orderId);
  return { ok: true };
}

/* ── Cupones: del formulario del CRM a la fila ──────────────────────────── */

/** Valida el cuerpo que manda el CRM y lo convierte en fila de `shop_coupons`; con `partial` solo las claves enviadas. */
export function couponRowFromBody(body: any, partial = false): { row: Row } | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Petición no válida' };
  const full = {
    code: String(body.code ?? ''),
    discountType: String(body.discountType ?? ''),
    discountValue: Number(body.discountValue),
    validFrom: body.validFrom || null,
    validUntil: body.validUntil || null,
    maxUses: body.maxUses === '' || body.maxUses == null ? null : Number(body.maxUses),
  };
  if (!partial) {
    const err = validateCouponInput(full);
    if (err) return { error: err };
  }
  const has = (k: string) => !partial || k in body;
  const row: Row = {};
  if (has('code')) row.code = normalizeCouponCode(full.code);
  if (has('description')) row.description = sanitizeString(String(body.description ?? ''), 200);
  if (has('discountType')) row.discount_type = full.discountType;
  if (has('discountValue')) row.discount_value = full.discountValue;
  if (has('appliesTo')) {
    const list = Array.isArray(body.appliesTo) ? body.appliesTo.filter((s: unknown) => typeof s === 'string').slice(0, 20) : [];
    row.applies_to = list.length ? list : null;
  }
  if (has('active')) row.active = body.active !== false;
  if (has('validFrom')) row.valid_from = full.validFrom ? new Date(full.validFrom).toISOString() : null;
  if (has('validUntil')) row.valid_until = full.validUntil ? new Date(full.validUntil).toISOString() : null;
  if (has('maxUses')) row.max_uses = full.maxUses;
  if (partial) {
    const merged = { ...full, ...(has('code') ? {} : { code: 'AAA' }) };
    if ('discountType' in body || 'discountValue' in body) {
      const err = validateCouponInput({ ...merged, discountType: full.discountType, discountValue: full.discountValue });
      if (err) return { error: err };
    }
  }
  return { row };
}

/** Catálogo para las páginas públicas: si la base de datos no responde se muestra el de reserva en lugar de una página rota. */
export async function getCatalog(): Promise<ShopProduct[]> {
  try {
    const rows = await getProducts();
    if (rows.length) return rows;
  } catch (e) {
    console.error('Shop: catálogo de reserva por error de base de datos:', e);
  }
  return SEED_PRODUCTS.filter((p) => p.active).map((p) => ({ ...p, id: p.slug }));
}
