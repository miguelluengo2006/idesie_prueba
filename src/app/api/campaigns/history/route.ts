import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';
import { fetchAllRows } from '@/lib/crmServer';
import type { ReceivedMap } from '@/lib/campaigns';

// GET /api/campaigns/history → qué campañas se han enviado y a quién, para no repetir:
//   { campaigns: [{ id, name, sent_at, sent_count }], received: { email: [{ c: idCampaña, at }] } }
export async function GET(req: NextRequest) {
  const auth = await agencyUser(req);
  if ('error' in auth) return auth.error;

  const { data: campaigns, error } = await supabaseAdmin
    .from('campaigns')
    .select('id, name, sent_at, sent_count, status, created_at')
    .eq('owner_id', auth.ownerId)
    .in('status', ['sending', 'sent'])
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) {
    console.error('Campaign history error:', error);
    return NextResponse.json({ error: 'No se pudo cargar el historial de envíos' }, { status: 500 });
  }
  if (!campaigns?.length) return NextResponse.json({ campaigns: [], received: {} });

  try {
    const ids = campaigns.map((c) => c.id);
    const sends = await fetchAllRows<{ email: string; campaign_id: string; sent_at: string | null }>((from, to) =>
      supabaseAdmin.from('campaign_sends').select('email, campaign_id, sent_at').in('campaign_id', ids).eq('status', 'sent').order('id').range(from, to)
    );
    const received: ReceivedMap = {};
    for (const s of sends) (received[s.email.toLowerCase()] ||= []).push({ c: s.campaign_id, at: s.sent_at });
    return NextResponse.json({
      campaigns: campaigns.map(({ id, name, sent_at, sent_count }) => ({ id, name, sent_at, sent_count })),
      received,
    });
  } catch (e) {
    console.error('Campaign history error:', e);
    return NextResponse.json({ error: 'No se pudo cargar el historial de envíos' }, { status: 500 });
  }
}
