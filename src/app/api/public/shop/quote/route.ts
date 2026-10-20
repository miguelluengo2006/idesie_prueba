import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/security';
import { checkRateLimit } from '@/lib/validation';
import { quoteFor } from '@/lib/shopServer';

// POST /api/public/shop/quote { slugs, coupon? } → importes calculados con los precios de la base de datos
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!checkRateLimit(`shop-quote:${ip}`, 40, 60_000).allowed) {
    return NextResponse.json({ error: 'Demasiados intentos. Espera un momento.' }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.slugs)) return NextResponse.json({ error: 'Petición no válida' }, { status: 400 });
  try {
    const quote = await quoteFor(body.slugs.filter((s: unknown) => typeof s === 'string').slice(0, 20), typeof body.coupon === 'string' ? body.coupon : undefined);
    return NextResponse.json(quote);
  } catch (e) {
    console.error('Shop quote:', e);
    return NextResponse.json({ error: 'No se pudo calcular el pedido.' }, { status: 500 });
  }
}
