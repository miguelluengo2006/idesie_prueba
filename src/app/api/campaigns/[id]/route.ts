import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';
import { isValidUUID, sanitizeString } from '@/lib/validation';
import { normalizeTags } from '@/lib/contacts';
import { MAX_BODY_LENGTH, MAX_SUBJECT_LENGTH } from '@/lib/campaigns';
import { CAMPAIGN_COLUMNS } from '@/lib/crmServer';

async function ownCampaign(id: string, ownerId: string) {
  const { data } = await supabaseAdmin.from('campaigns').select(CAMPAIGN_COLUMNS).eq('id', id).eq('owner_id', ownerId).maybeSingle();
  return data;
}

// GET /api/campaigns/[id] → la campaña y los envíos que han fallado (para ver qué pasó)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Campaña no válida' }, { status: 400 });
  const auth = await agencyUser(req);
  if ('error' in auth) return auth.error;

  const campaign = await ownCampaign(id, auth.ownerId);
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });

  const { data: failures } = await supabaseAdmin
    .from('campaign_sends')
    .select('email, error')
    .eq('campaign_id', id)
    .eq('status', 'failed')
    .limit(100);
  return NextResponse.json({ campaign, failures: failures || [] });
}

// PATCH /api/campaigns/[id] { name?, subject?, body?, audience_tags? } — solo mientras es borrador
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Campaña no válida' }, { status: 400 });
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;

  const campaign = await ownCampaign(id, auth.ownerId);
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
  if (campaign.status !== 'draft') {
    return NextResponse.json({ error: 'Una campaña ya enviada no se puede editar. Duplícala para hacer otra.' }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Datos no válidos' }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updates.name = sanitizeString(String(body.name || ''), 120) || 'Campaña sin nombre';
  if (body.subject !== undefined) updates.subject = String(body.subject || '').replace(/[\r\n]+/g, ' ').slice(0, MAX_SUBJECT_LENGTH).trim();
  // El texto del email no pasa por sanitizeString: se escapa al convertirlo a HTML (src/lib/campaigns.ts)
  if (body.body !== undefined) updates.body = String(body.body || '').slice(0, MAX_BODY_LENGTH);
  if (body.audience_tags !== undefined) updates.audience_tags = normalizeTags(body.audience_tags);
  if (body.exclude_campaign_ids !== undefined) {
    const asked = Array.isArray(body.exclude_campaign_ids) ? body.exclude_campaign_ids.filter((v: unknown): v is string => typeof v === 'string' && isValidUUID(v) && v !== id) : [];
    // Solo campañas del propio propietario: nunca se confía en un id que venga del navegador
    const { data: own } = asked.length
      ? await supabaseAdmin.from('campaigns').select('id').eq('owner_id', auth.ownerId).in('id', asked.slice(0, 100))
      : { data: [] as { id: string }[] };
    updates.exclude_campaign_ids = (own || []).map((c) => c.id);
  }

  const { data, error } = await supabaseAdmin.from('campaigns').update(updates).eq('id', id).eq('owner_id', auth.ownerId).select(CAMPAIGN_COLUMNS).single();
  if (error) {
    console.error('Campaign update error:', error);
    return NextResponse.json({ error: 'No se pudo guardar la campaña' }, { status: 500 });
  }
  return NextResponse.json({ campaign: data });
}

// DELETE /api/campaigns/[id] — borradores y enviadas (no una que se está enviando)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Campaña no válida' }, { status: 400 });
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;

  const campaign = await ownCampaign(id, auth.ownerId);
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
  if (campaign.status === 'sending') {
    return NextResponse.json({ error: 'Se está enviando: espera a que termine.' }, { status: 409 });
  }

  const { error } = await supabaseAdmin.from('campaigns').delete().eq('id', id).eq('owner_id', auth.ownerId);
  if (error) {
    console.error('Campaign delete error:', error);
    return NextResponse.json({ error: 'No se pudo borrar la campaña' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
