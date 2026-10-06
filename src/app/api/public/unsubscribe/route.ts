import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getClientIp } from '@/lib/security';
import { checkRateLimit, isValidUUID } from '@/lib/validation';

/** a***@dominio.com: se confirma a quién se da de baja sin enseñar el email entero. */
function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  return `${user.slice(0, 1)}${'*'.repeat(Math.max(2, Math.min(user.length - 1, 6)))}@${domain}`;
}

function tokenOf(req: NextRequest, bodyToken?: unknown): string | null {
  const t = typeof bodyToken === 'string' ? bodyToken : req.nextUrl.searchParams.get('t');
  return t && isValidUUID(t) ? t : null;
}

// GET /api/public/unsubscribe?t=<token> → a quién corresponde el enlace (para la página de baja)
export async function GET(req: NextRequest) {
  if (!checkRateLimit(`unsub-get:${getClientIp(req.headers)}`, 30, 60_000).allowed) {
    return NextResponse.json({ error: 'Demasiados intentos' }, { status: 429 });
  }
  const token = tokenOf(req);
  if (!token) return NextResponse.json({ error: 'Enlace no válido' }, { status: 400 });

  const { data } = await supabaseAdmin.from('contacts').select('email, unsubscribed_at').eq('unsubscribe_token', token).maybeSingle();
  if (!data) return NextResponse.json({ error: 'Enlace no válido' }, { status: 404 });
  return NextResponse.json({ email: maskEmail(data.email), unsubscribed: !!data.unsubscribed_at });
}

// POST /api/public/unsubscribe  { t } (o ?t= para la baja con un clic de los clientes de correo)
export async function POST(req: NextRequest) {
  if (!checkRateLimit(`unsub-post:${getClientIp(req.headers)}`, 10, 60_000).allowed) {
    return NextResponse.json({ error: 'Demasiados intentos' }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const token = tokenOf(req, body?.t);
  if (!token) return NextResponse.json({ error: 'Enlace no válido' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('contacts')
    .update({ subscribed: false, unsubscribed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)
    .is('unsubscribed_at', null)
    .select('id')
    .maybeSingle();
  if (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'No se pudo completar la baja. Inténtalo de nuevo.' }, { status: 500 });
  }
  // Si ya estaba de baja también es un éxito: el resultado que quería es el mismo
  if (!data) {
    const { data: existing } = await supabaseAdmin.from('contacts').select('id').eq('unsubscribe_token', token).maybeSingle();
    if (!existing) return NextResponse.json({ error: 'Enlace no válido' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
