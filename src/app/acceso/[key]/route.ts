import { NextResponse } from 'next/server';
import { GATE_COOKIE, gateCookieOptions, gateEnabled, gateKey, safeEqual, signGate } from '@/lib/crmGate';

export const dynamic = 'force-dynamic';

/** Enlace secreto del CRM: con la clave correcta deja la cookie de la puerta y lleva al login; con otra, 404. */
export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!gateEnabled() || !safeEqual(key, gateKey())) return new NextResponse('Not Found', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });

  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const res = NextResponse.redirect(`${base}/auth`, 303);
  res.cookies.set(GATE_COOKIE, await signGate(), gateCookieOptions);
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('Referrer-Policy', 'no-referrer');
  return res;
}
