import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';
import { sanitizeString } from '@/lib/validation';
import { CAMPAIGN_COLUMNS } from '@/lib/crmServer';

// GET /api/campaigns → campañas del propietario, las más recientes primero
export async function GET(req: NextRequest) {
  const auth = await agencyUser(req);
  if ('error' in auth) return auth.error;

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .select(CAMPAIGN_COLUMNS)
    .eq('owner_id', auth.ownerId)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) {
    console.error('Campaigns fetch error:', error);
    return NextResponse.json({ error: 'No se pudieron cargar las campañas' }, { status: 500 });
  }
  return NextResponse.json({ campaigns: data || [] });
}

// POST /api/campaigns { name? } → crea un borrador vacío
export async function POST(req: NextRequest) {
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;

  const body = await req.json().catch(() => ({}));
  const name = sanitizeString(String(body?.name || ''), 120) || 'Nueva campaña';

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .insert({ owner_id: auth.ownerId, name })
    .select(CAMPAIGN_COLUMNS)
    .single();
  if (error) {
    console.error('Campaign create error:', error);
    return NextResponse.json({ error: 'No se pudo crear la campaña' }, { status: 500 });
  }
  return NextResponse.json({ campaign: data });
}
