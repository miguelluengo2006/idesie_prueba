import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';
import { isValidUUID } from '@/lib/validation';
import { resolveLeadMailer, sendLeadMail, mailerFor } from '@/lib/leadMailer';
import { CAMPAIGN_COLUMNS, CONTACT_COLUMNS, fetchAllRows, siteUrlFrom } from '@/lib/crmServer';
import { campaignProblems, renderCampaignEmail, unsubscribeUrl } from '@/lib/campaigns';
import { inAudience, type Contact } from '@/lib/contacts';

// Cada llamada envía un lote y devuelve el progreso; el panel la repite hasta que no quedan pendientes.
// Así un envío grande no depende de que una sola petición dure minutos y, si se corta, se reanuda donde iba.
export const maxDuration = 60;

const BATCH = 25;
/** Margen para terminar bien antes de que la función se corte */
const DEADLINE_MS = 45_000;
/** Un envío «en curso» más viejo que esto se considera abandonado y vuelve a la cola */
const STALE_CLAIM_MS = 5 * 60_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// POST /api/campaigns/[id]/send
//   { test: true }  → manda una prueba a tu propio correo (no toca a ningún contacto ni cambia la campaña)
//   {}              → envía (o continúa enviando) la campaña a su audiencia, un lote por llamada
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Campaña no válida' }, { status: 400 });
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;

  const body = await req.json().catch(() => ({}));
  const { data: campaign } = await supabaseAdmin.from('campaigns').select(CAMPAIGN_COLUMNS).eq('id', id).eq('owner_id', auth.ownerId).maybeSingle();
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });

  const mailer = await resolveLeadMailer(supabaseAdmin, auth.ownerId).catch(() => null);
  if (!mailer) {
    return NextResponse.json(
      { error: 'Falta configurar el email de envío. Hazlo en Ajustes → Email y vuelve a intentarlo.' },
      { status: 400 }
    );
  }
  const siteUrl = siteUrlFrom(req);

  /* ── Prueba ── */
  if (body?.test === true) {
    const problems = campaignProblems(campaign, 1);
    const blocking = problems.filter((p) => !p.startsWith('No hay destinatarios'));
    if (blocking.length) return NextResponse.json({ error: blocking.join(' ') }, { status: 400 });

    const to = mailer.to.split(',')[0].trim();
    const mail = renderCampaignEmail({
      subject: campaign.subject,
      body: campaign.body,
      recipient: { email: to, name: 'Nombre de prueba', company: 'Empresa de prueba' },
      unsubscribeUrl: unsubscribeUrl(siteUrl, 'prueba'),
    });
    try {
      await sendLeadMail(mailerFor(mailer, to), { ...mail, subject: `[Prueba] ${mail.subject}` });
    } catch (error: any) {
      console.error('Campaign test send failed:', error);
      return NextResponse.json({ error: `No se pudo enviar la prueba: ${error?.message || 'error de envío'}` }, { status: 502 });
    }
    return NextResponse.json({ test: true, to });
  }

  /* ── Envío real ── */
  if (campaign.status === 'sent') return NextResponse.json({ error: 'Esta campaña ya se envió.' }, { status: 409 });

  try {
    // Primera llamada: fotografía de la audiencia (a quién se le manda) y paso a «enviando»
    if (campaign.status === 'draft') {
      const contacts = await fetchAllRows<Contact>((from, to) =>
        supabaseAdmin.from('contacts').select(CONTACT_COLUMNS).eq('owner_id', auth.ownerId).order('id').range(from, to)
      );
      const recipients = contacts.filter((c) => inAudience(c, campaign.audience_tags || []));
      const problems = campaignProblems(campaign, recipients.length);
      if (problems.length) return NextResponse.json({ error: problems.join(' ') }, { status: 400 });

      for (let i = 0; i < recipients.length; i += 500) {
        const rows = recipients.slice(i, i + 500).map((c) => ({ campaign_id: id, contact_id: c.id, email: c.email, name: c.name }));
        const { error } = await supabaseAdmin.from('campaign_sends').upsert(rows, { onConflict: 'campaign_id,email', ignoreDuplicates: true });
        if (error) throw new Error(error.message);
      }
      await supabaseAdmin
        .from('campaigns')
        .update({ status: 'sending', total: recipients.length, sent_count: 0, failed_count: 0, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('status', 'draft');
    }

    // Envíos abandonados (la petición anterior se cortó) vuelven a la cola
    await supabaseAdmin
      .from('campaign_sends')
      .update({ status: 'pending', claimed_at: null })
      .eq('campaign_id', id)
      .eq('status', 'sending')
      .lt('claimed_at', new Date(Date.now() - STALE_CLAIM_MS).toISOString());

    const { data: queue } = await supabaseAdmin
      .from('campaign_sends')
      .select('id')
      .eq('campaign_id', id)
      .eq('status', 'pending')
      .order('id')
      .limit(BATCH);

    // Se «reclaman» los del lote: si dos llamadas coinciden, cada destinatario lo procesa solo una
    const { data: claimed } = queue?.length
      ? await supabaseAdmin
          .from('campaign_sends')
          .update({ status: 'sending', claimed_at: new Date().toISOString() })
          .in('id', queue.map((q) => q.id))
          .eq('status', 'pending')
          .select('id, contact_id, email, name')
      : { data: [] as { id: string; contact_id: string | null; email: string; name: string | null }[] };

    const contactIds = (claimed || []).map((c) => c.contact_id).filter((v): v is string => !!v);
    const { data: contactRows } = contactIds.length
      ? await supabaseAdmin
          .from('contacts')
          .select('id, company, unsubscribe_token, subscribed, unsubscribed_at')
          .eq('owner_id', auth.ownerId)
          .in('id', contactIds)
      : { data: [] as any[] };
    const contactById = new Map((contactRows || []).map((c) => [c.id, c]));

    const started = Date.now();
    const throttle = mailer.provider === 'resend' ? 550 : 0; // Resend admite ~2 envíos por segundo
    const now = () => new Date().toISOString();

    for (const send of claimed || []) {
      // Sin tiempo: lo que falte vuelve a la cola para la siguiente llamada
      if (Date.now() - started > DEADLINE_MS) {
        await supabaseAdmin.from('campaign_sends').update({ status: 'pending', claimed_at: null }).eq('id', send.id);
        continue;
      }
      const contact = send.contact_id ? contactById.get(send.contact_id) : null;
      // Si desde que empezó el envío se dio de baja (o lo borraron), no se le escribe
      if (!contact || !contact.subscribed || contact.unsubscribed_at) {
        await supabaseAdmin.from('campaign_sends').update({ status: 'skipped', claimed_at: null }).eq('id', send.id);
        continue;
      }
      const link = unsubscribeUrl(siteUrl, contact.unsubscribe_token);
      const mail = renderCampaignEmail({
        subject: campaign.subject,
        body: campaign.body,
        recipient: { email: send.email, name: send.name, company: contact.company },
        unsubscribeUrl: link,
      });
      try {
        const resendId = await sendLeadMail(mailerFor(mailer, send.email), {
          ...mail,
          headers: { 'List-Unsubscribe': `<${link}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
        });
        await supabaseAdmin.from('campaign_sends').update({ status: 'sent', sent_at: now(), claimed_at: null, error: null, resend_id: resendId }).eq('id', send.id);
      } catch (error: any) {
        console.error('Campaign send failed:', send.email, error?.message);
        await supabaseAdmin
          .from('campaign_sends')
          .update({ status: 'failed', claimed_at: null, error: String(error?.message || 'error de envío').slice(0, 300) })
          .eq('id', send.id);
      }
      if (throttle) await sleep(throttle);
    }

    // Recuento real y cierre si ya no queda nadie
    const count = async (status: string) => {
      const { count: n } = await supabaseAdmin.from('campaign_sends').select('id', { count: 'exact', head: true }).eq('campaign_id', id).eq('status', status);
      return n || 0;
    };
    const [sent, failed, pending, sending] = await Promise.all([count('sent'), count('failed'), count('pending'), count('sending')]);
    const done = pending + sending === 0;
    await supabaseAdmin
      .from('campaigns')
      .update({ sent_count: sent, failed_count: failed, updated_at: now(), ...(done ? { status: 'sent', sent_at: now() } : {}) })
      .eq('id', id);

    return NextResponse.json({ status: done ? 'sent' : 'sending', total: campaign.total || sent + failed + pending + sending, sent, failed, pending: pending + sending });
  } catch (error) {
    console.error('Campaign send error:', error);
    return NextResponse.json({ error: 'No se pudo enviar la campaña. Inténtalo de nuevo: continuará donde se quedó.' }, { status: 500 });
  }
}
