import { NextResponse, type NextRequest } from 'next/server';
import { GATE_COOKIE, gateEnabled, isGated, verifyGate } from '@/lib/crmGate';

/** El CRM no existe para quien no entre por el enlace secreto: 404 y sin indexar. */
export async function middleware(req: NextRequest) {
  if (!gateEnabled() || !isGated(req.nextUrl.pathname)) return NextResponse.next();

  if (await verifyGate(req.cookies.get(GATE_COOKIE)?.value)) {
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  }

  const res = NextResponse.rewrite(new URL('/_gate-404', req.url), { status: 404 });
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  matcher: ['/auth/:path*', '/portal/:path*', '/api/auth-config', '/api/auth/login', '/api/auth/passkey/:path*'],
};
