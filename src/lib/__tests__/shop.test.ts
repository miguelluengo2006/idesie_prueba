import { describe, expect, it } from 'vitest';
import { SEED_PRODUCTS, applyCoupon, buildQuote, describeCoupon, formatEur, priceLabel, validateCouponInput, type ShopCoupon } from '../shop';
import { buildFlywireUrl, flywireDigest, orderStatusFromFlywire, parseFlywireEvent, verifyFlywireDigest } from '../flywire';

const coupon = (over: Partial<ShopCoupon> = {}): ShopCoupon => ({
  id: 'c1', code: 'PRUEBA10', description: '', discountType: 'percent', discountValue: 10, appliesTo: null,
  active: true, validFrom: null, validUntil: null, maxUses: null, ...over,
});
// Catálogo sin reservas: estas pruebas comprueban la suma y los cupones sobre el precio completo
const FULL_PRICE = SEED_PRODUCTS.map((p) => ({ ...p, reservationEur: null }));
const q = (slugs: string[], c?: ShopCoupon, uses = 0, code = c ? c.code : undefined) =>
  buildQuote(FULL_PRICE, slugs, c ? { coupon: c, uses } : null, code);

describe('catálogo', () => {
  it('tiene los 6 productos de idesie.com con sus precios', () => {
    const price = Object.fromEntries(SEED_PRODUCTS.map((p) => [p.slug, p.priceEur]));
    expect(price).toEqual({
      'master-bim-full-time': 15000,
      'master-bim-building-engineering': 15000,
      'master-bim-online': 4500,
      'executive-master-bim': null,
      'titulo-profesional-cualificam': 262.5,
      'curso-revit-gratis': 0,
    });
  });
  it('formatea precios en euros', () => {
    expect(formatEur(1500000).replace(/\s/g, ' ')).toBe('15.000 €');
    expect(formatEur(450000).replace(/\s/g, ' ')).toBe('4.500 €');
    expect(formatEur(26250).replace(/\s/g, ' ')).toBe('262,50 €');
    expect(priceLabel(null)).toBe('A consultar');
    expect(priceLabel(0)).toBe('Gratis');
  });
});

describe('presupuesto', () => {
  it('suma las líneas con el precio real del catálogo', () => {
    const r = q(['master-bim-online', 'titulo-profesional-cualificam']);
    expect(r.ok).toBe(true);
    expect(r.totalCents).toBe(450000 + 26250);
  });
  it('ignora repetidos y rechaza vacío, desconocidos y sin precio', () => {
    expect(q(['master-bim-online', 'master-bim-online']).lines).toHaveLength(1);
    expect(q([]).error).toMatch(/vacío/);
    expect(q(['no-existe']).ok).toBe(false);
    expect(q(['executive-master-bim']).error).toMatch(/solicita información/);
    expect(buildQuote([{ ...SEED_PRODUCTS[2], active: false }], ['master-bim-online']).ok).toBe(false);
  });
  it('un producto gratuito suma 0', () => {
    expect(q(['curso-revit-gratis']).totalCents).toBe(0);
  });
});

describe('cupones', () => {
  it('porcentaje', () => {
    const r = q(['master-bim-online'], coupon());
    expect(r.discountCents).toBe(45000);
    expect(r.totalCents).toBe(405000);
    expect(r.coupon?.code).toBe('PRUEBA10');
  });
  it('importe fijo, sin pasar nunca del total', () => {
    expect(q(['master-bim-online'], coupon({ discountType: 'amount', discountValue: 500 })).totalCents).toBe(400000);
    expect(q(['titulo-profesional-cualificam'], coupon({ discountType: 'amount', discountValue: 999 })).totalCents).toBe(0);
  });
  it('precio especial: deja el producto en ese precio y no sube los baratos', () => {
    const c = coupon({ discountType: 'fixed_price', discountValue: 1100 });
    expect(q(['master-bim-full-time'], c).totalCents).toBe(110000);
    expect(q(['titulo-profesional-cualificam'], c).couponError).toMatch(/no aplica/);
  });
  it('solo descuenta los productos a los que se aplica', () => {
    const c = coupon({ appliesTo: ['master-bim-online'] });
    const r = q(['master-bim-online', 'titulo-profesional-cualificam'], c);
    expect(r.discountCents).toBe(45000);
    expect(q(['titulo-profesional-cualificam'], c).couponError).toMatch(/no se aplica/);
  });
  it('rechaza inactivo, futuro, caducado y agotado, pero el pedido se calcula sin descuento', () => {
    const now = new Date('2026-10-20T12:00:00Z');
    const lines = [{ slug: 'master-bim-online', name: 'x', unitCents: 450000 }];
    const bad = (c: ShopCoupon, uses = 0) => applyCoupon({ coupon: c, uses }, lines, now);
    expect(bad(coupon({ active: false }))).toMatchObject({ ok: false });
    expect(bad(coupon({ validFrom: '2026-11-01T00:00:00Z' }))).toMatchObject({ ok: false });
    expect(bad(coupon({ validUntil: '2026-10-01T00:00:00Z' }))).toMatchObject({ ok: false });
    expect(bad(coupon({ maxUses: 5 }), 5)).toMatchObject({ ok: false });
    expect(bad(coupon({ maxUses: 5 }), 4)).toMatchObject({ ok: true });
    const r = q(['master-bim-online'], coupon({ active: false }));
    expect(r.ok).toBe(true);
    expect(r.totalCents).toBe(450000);
    expect(r.couponError).toBeTruthy();
  });
  it('un código desconocido da error de cupón, no del pedido', () => {
    const r = buildQuote(SEED_PRODUCTS, ['master-bim-online'], null, 'NOEXISTE');
    expect(r.ok).toBe(true);
    expect(r.couponError).toBe('Código no válido.');
  });
  it('describe y valida al crearlos', () => {
    expect(describeCoupon({ discountType: 'percent', discountValue: 10 })).toBe('10 % de descuento');
    expect(validateCouponInput({ code: 'ab', discountType: 'percent', discountValue: 10 })).toMatch(/código/i);
    expect(validateCouponInput({ code: 'OK10', discountType: 'percent', discountValue: 101 })).toMatch(/100/);
    expect(validateCouponInput({ code: 'OK10', discountType: 'amount', discountValue: 0 })).toMatch(/mayor que 0/);
    expect(validateCouponInput({ code: 'OK10', discountType: 'amount', discountValue: 5, validFrom: '2026-02-01', validUntil: '2026-01-01' })).toMatch(/posterior/);
    expect(validateCouponInput({ code: 'OK10', discountType: 'amount', discountValue: 5, maxUses: 0 })).toMatch(/entero/);
    expect(validateCouponInput({ code: 'OK10', discountType: 'percent', discountValue: 10 })).toBeNull();
  });
});

describe('Flywire', () => {
  const base = { totalCents: 450000, firstName: 'Ana', lastName: 'García Ruiz', email: 'ana@mail.com', orderNumber: 'IDE-2026-1001', token: 'tok', siteUrl: 'https://idesie.com' };
  it('construye el enlace con el importe en céntimos y los datos bloqueados', () => {
    const u = new URL(buildFlywireUrl({ ...base, callbacks: false }));
    expect(u.origin + u.pathname).toBe('https://payment.flywire.com/pay/payment');
    expect(u.searchParams.get('recipient')).toBe('IBT');
    expect(u.searchParams.get('amount')).toBe('450000');
    expect(u.searchParams.get('student_last_name')).toBe('García Ruiz');
    expect(u.searchParams.get('read_only')).toContain('amount');
    expect(u.searchParams.get('return_cta')).toBe('https://idesie.com/pedido/tok');
    expect(u.searchParams.has('callback_url')).toBe(false);
  });
  it('pide el aviso del pago solo si hay webhook', () => {
    const u = new URL(buildFlywireUrl({ ...base, callbacks: true }));
    expect(u.searchParams.get('callback_id')).toBe('IDE-2026-1001');
    expect(u.searchParams.get('callback_url')).toBe('https://idesie.com/api/webhooks/flywire');
    expect(u.searchParams.get('callback_version')).toBe('2');
  });
  it('verifica la firma sobre el cuerpo exacto', () => {
    const body = '{"event_type":"guaranteed"}';
    const d = flywireDigest(body, 's3cret');
    expect(verifyFlywireDigest(body, d, 's3cret')).toBe(true);
    expect(verifyFlywireDigest(body + ' ', d, 's3cret')).toBe(false);
    expect(verifyFlywireDigest(body, d, 'otro')).toBe(false);
    expect(verifyFlywireDigest(body, null, 's3cret')).toBe(false);
    expect(verifyFlywireDigest(body, d, '')).toBe(false);
  });
  it('lee el aviso y traduce el estado', () => {
    const e = parseFlywireEvent({ event_type: 'guaranteed', event_date: '2026-10-20T10:00:00Z', data: { status: 'guaranteed', payment_id: 'IBT123', external_reference: 'IDE-2026-1001', amount_to: 450000, currency_to: 'eur' } });
    expect(e).toMatchObject({ status: 'guaranteed', paymentId: 'IBT123', reference: 'IDE-2026-1001', amountToCents: 450000, currencyTo: 'EUR' });
    expect(parseFlywireEvent({ data: {} })).toBeNull();
    expect(parseFlywireEvent(null)).toBeNull();
    expect(orderStatusFromFlywire('guaranteed')).toBe('paid');
    expect(orderStatusFromFlywire('delivered')).toBe('paid');
    expect(orderStatusFromFlywire('processed')).toBeNull();
    expect(orderStatusFromFlywire('initiated')).toBeNull();
    expect(orderStatusFromFlywire('failed')).toBe('failed');
    expect(orderStatusFromFlywire('cancelled')).toBe('cancelled');
    expect(orderStatusFromFlywire('reversed')).toBe('refunded');
  });
});

describe('reserva de plaza', () => {
  const products = SEED_PRODUCTS.map((p) => ({ ...p, id: p.slug }));

  it('los másteres con precio cobran 3.000 € online y recuerdan el precio completo', () => {
    const q = buildQuote(products, ['master-bim-full-time']);
    expect(q.totalCents).toBe(300000);
    expect(q.lines[0]).toMatchObject({ name: 'Reserva de plaza · Máster BIM Full Time', unitCents: 300000, fullCents: 1500000 });
  });

  it('el máster online (4.500 €) también se reserva con 3.000 €', () => {
    expect(buildQuote(products, ['master-bim-online']).totalCents).toBe(300000);
  });

  it('los cursos y títulos se pagan completos', () => {
    const q = buildQuote(products, ['titulo-profesional-cualificam']);
    expect(q.totalCents).toBe(26250);
    expect(q.lines[0].fullCents).toBeUndefined();
  });

  it('un cupón del 10 % descuenta sobre lo que se paga ahora', () => {
    const coupon = { coupon: { id: 'c', code: 'X10', description: '', discountType: 'percent' as const, discountValue: 10, appliesTo: null, active: true, validFrom: null, validUntil: null, maxUses: null }, uses: 0 };
    expect(buildQuote(products, ['master-bim-full-time'], coupon, 'X10').totalCents).toBe(270000);
  });
});

describe('migración de la tienda', () => {
  it('inserta el mismo catálogo que SEED_PRODUCTS', async () => {
    const { readFileSync } = await import('node:fs');
    const sql = readFileSync('migrations/add-shop.sql', 'utf8');
    for (const p of SEED_PRODUCTS) {
      const row = sql.split('\n').find((l) => l.includes(`('${p.slug}'`));
      expect(row, p.slug).toBeTruthy();
      expect(row).toContain(`'${p.name.replace(/'/g, "''")}'`);
      expect(row).toContain(`, ${p.priceEur === null ? 'NULL' : p.priceEur}, `);
      expect(row).toContain(p.summary.replace(/'/g, "''"));
    }
  });
});
