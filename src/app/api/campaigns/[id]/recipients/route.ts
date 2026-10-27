import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';
import { isValidUUID } from '@/lib/validation';
import { fetchAllRows } from '@/lib/crmServer';

const SEND_COLUMNS =
  'id, email, name, status, error, sent_at, delivered_at, opened_at, clicked_at, bounced_at, complained_at, open_count, click_count, bounce_reason';

// GET /api/campaigns/[id]/recipients → una fila por destinatario con su seguimiento (entregado, abierto, clic, rebote)
//   y, de quien ha pulsado, los enlaces que ha visitado.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Campaña no válida' }, { status: 400 });
  const auth = await agencyUser(req);
  if ('error' in auth) return auth.error;

  const { data: campaign } = await supabaseAdmin.from('campaigns').select('id').eq('id', id).eq('owner_id', auth.ownerId).maybeSingle();
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });

  try {
    const sends = await fetchAllRows<Record<string, unknown> & { id: string }>((from, to) =>
      supabaseAdmin.from('campaign_sends').select(SEND_COLUMNS).eq('campaign_id', id).order('email').range(from, to)
    );
    const clicks = await fetchAllRows<{ send_id: string; url: string | null }>((from, to) =>
      supabaseAdmin.from('email_events').select('send_id, url').eq('campaign_id', id).eq('type', 'clicked').order('occurred_at').range(from, to)
    );
    const linksBySend = new Map<string, string[]>();
    for (const c of clicks) {
      if (!c.url) continue;
      const list = linksBySend.get(c.send_id) || [];
      if (!list.includes(c.url)) list.push(c.url);
      linksBySend.set(c.send_id, list);
    }
    return NextResponse.json({ recipients: sends.map((s) => ({ ...s, links: linksBySend.get(s.id) || [] })) });
  } catch (error) {
    console.error('Campaign recipients error:', error);
    return NextResponse.json({ error: 'No se pudo cargar el seguimiento. ¿Has ejecutado migrations/add-email-tracking.sql?' }, { status: 500 });
  }
}
