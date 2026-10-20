import { NextRequest, NextResponse } from 'next/server';
import { flywireSecret, parseFlywireEvent, verifyFlywireDigest } from '@/lib/flywire';
import { processFlywireEvent } from '@/lib/shopServer';

// POST /api/webhooks/flywire — avisos de pago de Flywire (firma X-Flywire-Digest sobre el cuerpo sin tocar).
// Flywire reintenta si no recibe 2xx, así que los duplicados y los pedidos desconocidos también responden 200.
export async function POST(req: NextRequest) {
  const secret = flywireSecret();
  if (!secret) return NextResponse.json({ error: 'Webhook no configurado' }, { status: 503 });

  const raw = await req.text();
  if (!verifyFlywireDigest(raw, req.headers.get('x-flywire-digest'), secret)) {
    return NextResponse.json({ error: 'Firma no válida' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Cuerpo no válido' }, { status: 400 });
  }
  const event = parseFlywireEvent(payload);
  if (!event) return NextResponse.json({ ok: true, outcome: 'ignored' });

  try {
    const outcome = await processFlywireEvent(event, payload);
    return NextResponse.json({ ok: true, outcome });
  } catch (e) {
    console.error('Flywire webhook:', e);
    return NextResponse.json({ error: 'Error al procesar' }, { status: 500 });
  }
}
