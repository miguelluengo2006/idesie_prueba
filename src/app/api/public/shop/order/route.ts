import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, reportSuspicious } from '@/lib/security';
import { checkRateLimit } from '@/lib/validation';
import { siteUrlFrom } from '@/lib/crmServer';
import { createOrder } from '@/lib/shopServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { ORDER_STATUS_LABEL, type OrderStatus } from '@/lib/shop';

// POST /api/public/shop/order → registra el pedido (pendiente) y devuelve la URL de pago de Flywire
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!checkRateLimit(`shop-order:${ip}`, 6, 60_000).allowed) {
    await reportSuspicious({ ip, kind: 'rate_limited', path: req.nextUrl?.pathname, userAgent: req.headers.get('user-agent') });
    return NextResponse.json({ error: 'Demasiados intentos. Espera un momento.' }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Petición no válida' }, { status: 400 });
  // Trampa para bots: se finge éxito sin crear nada
  if (typeof body.website === 'string' && body.website.trim()) return NextResponse.json({ ok: true, paymentUrl: null, number: 'IDE-0' });

  try {
    const res = await createOrder(
      {
        slugs: Array.isArray(body.slugs) ? body.slugs.filter((s: unknown) => typeof s === 'string') : [],
        couponCode: typeof body.coupon === 'string' ? body.coupon : undefined,
        buyer: {
          firstName: String(body.firstName ?? ''),
          lastName: String(body.lastName ?? ''),
          email: String(body.email ?? ''),
          phone: body.phone ? String(body.phone) : undefined,
        },
        acceptedTerms: body.acceptedTerms === true,
        marketing: body.marketing === true,
      },
      siteUrlFrom(req)
    );
    if ('error' in res) return NextResponse.json({ error: res.error }, { status: res.status });
    return NextResponse.json({ ok: true, number: res.number, token: res.token, free: res.free, totalCents: res.totalCents, paymentUrl: res.paymentUrl });
  } catch (e) {
    console.error('Shop order:', e);
    return NextResponse.json({ error: 'No se pudo registrar el pedido. Inténtalo de nuevo.' }, { status: 500 });
  }
}

// GET /api/public/shop/order?token= → estado del pedido para la página de vuelta del pago
export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!checkRateLimit(`shop-status:${ip}`, 60, 60_000).allowed) return NextResponse.json({ error: 'Demasiadas consultas' }, { status: 429 });
  const token = req.nextUrl.searchParams.get('token') || '';
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  const { data: order } = await supabaseAdmin
    .from('shop_orders')
    .select('id, number, status, total_eur, buyer_first_name, created_at')
    .eq('public_token', token)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  const { data: items } = await supabaseAdmin.from('shop_order_items').select('product_name, unit_price_eur').eq('order_id', order.id);
  return NextResponse.json({
    number: order.number,
    status: order.status,
    statusLabel: ORDER_STATUS_LABEL[order.status as OrderStatus] ?? order.status,
    totalEur: Number(order.total_eur),
    firstName: order.buyer_first_name,
    items: (items || []).map((i) => ({ name: i.product_name, priceEur: Number(i.unit_price_eur) })),
  });
}
