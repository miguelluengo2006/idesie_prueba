import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { parseResendEvent, resendWebhookSecret, verifyResendSignature } from '@/lib/resendWebhook';

// POST /api/webhooks/resend — avisos de Resend sobre cada email de campaña: entregado, abierto, clic, rebote, queja.
// Resend reintenta si no recibe 2xx, así que los duplicados y los emails que no son de campañas también responden 200.
export async function POST(req: NextRequest) {
  const secret = resendWebhookSecret();
  if (!secret) return NextResponse.json({ error: 'Webhook no configurado' }, { status: 503 });

  const raw = await req.text();
  const svixId = req.headers.get('svix-id');
  const valid = verifyResendSignature(
    raw,
    { id: svixId, timestamp: req.headers.get('svix-timestamp'), signature: req.headers.get('svix-signature') },
    secret
  );
  if (!valid || !svixId) return NextResponse.json({ error: 'Firma no válida' }, { status: 401 });

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Cuerpo no válido' }, { status: 400 });
  }
  const event = parseResendEvent(payload);
  if (!event) return NextResponse.json({ ok: true, outcome: 'ignored' });

  try {
    const { data: send } = await supabaseAdmin
      .from('campaign_sends')
      .select('id, campaign_id, contact_id, delivered_at, opened_at, clicked_at, bounced_at, complained_at')
      .eq('resend_id', event.emailId)
      .maybeSingle();
    // Avisos de leads, invitaciones… (no son de campañas): no hay nada que registrar
    if (!send) return NextResponse.json({ ok: true, outcome: 'unknown-email' });

    const { error: insertError } = await supabaseAdmin.from('email_events').insert({
      send_id: send.id,
      campaign_id: send.campaign_id,
      type: event.type,
      url: event.url ?? null,
      svix_id: svixId,
      occurred_at: event.at,
    });
    if (insertError) {
      if (insertError.code === '23505') return NextResponse.json({ ok: true, outcome: 'duplicate' });
      throw new Error(insertError.message);
    }

    const countOf = async (type: string) => {
      const { count } = await supabaseAdmin
        .from('email_events')
        .select('id', { count: 'exact', head: true })
        .eq('send_id', send.id)
        .eq('type', type);
      return count || 0;
    };

    const updates: Record<string, unknown> = {};
    // Los avisos pueden llegar desordenados: cada marca guarda la primera vez que ocurrió
    if (event.type === 'delivered' && !send.delivered_at) updates.delivered_at = event.at;
    if (event.type === 'opened') {
      if (!send.opened_at) updates.opened_at = event.at;
      updates.open_count = await countOf('opened');
    }
    if (event.type === 'clicked') {
      if (!send.clicked_at) updates.clicked_at = event.at;
      // Quien pulsa un enlace, evidentemente lo ha abierto (aunque su cliente bloquee la imagen de seguimiento)
      if (!send.opened_at) updates.opened_at = event.at;
      updates.click_count = await countOf('clicked');
    }
    if (event.type === 'bounced' && !send.bounced_at) {
      updates.bounced_at = event.at;
      updates.bounce_reason = event.reason ?? null;
    }
    if (event.type === 'complained' && !send.complained_at) updates.complained_at = event.at;
    if (event.type === 'failed') {
      updates.status = 'failed';
      updates.error = (event.reason || 'Resend no pudo enviarlo').slice(0, 300);
    }

    if (Object.keys(updates).length) {
      const { error } = await supabaseAdmin.from('campaign_sends').update(updates).eq('id', send.id);
      if (error) throw new Error(error.message);
    }

    // Una queja de spam equivale a darse de baja: no se le vuelve a escribir
    if (event.type === 'complained' && send.contact_id) {
      const now = new Date().toISOString();
      await supabaseAdmin
        .from('contacts')
        .update({ subscribed: false, unsubscribed_at: now, updated_at: now })
        .eq('id', send.contact_id)
        .is('unsubscribed_at', null);
    }

    return NextResponse.json({ ok: true, outcome: event.type });
  } catch (e) {
    console.error('Resend webhook:', e);
    return NextResponse.json({ error: 'Error al procesar' }, { status: 500 });
  }
}
