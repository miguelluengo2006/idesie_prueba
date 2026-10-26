import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';
import { parseCohortBody } from '@/lib/cohortsServer';

// GET /api/cohorts - convocatorias del máster, por fecha de inicio
export async function GET(req: NextRequest) {
  const auth = await agencyUser(req);
  if ('error' in auth) return auth.error;

  const { data, error } = await supabaseAdmin
    .from('cohorts')
    .select('id, name, starts_at, capacity, created_at')
    .eq('owner_id', auth.ownerId)
    .order('starts_at', { ascending: true });
  if (error) {
    console.error('Cohorts fetch error:', error);
    return NextResponse.json({ error: 'No se pudieron cargar las convocatorias' }, { status: 500 });
  }
  return NextResponse.json({ cohorts: data || [] });
}

// POST /api/cohorts - nueva convocatoria
export async function POST(req: NextRequest) {
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;

  const parsed = parseCohortBody(await req.json().catch(() => null), { partial: false });
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('cohorts')
    .insert({ owner_id: auth.ownerId, ...parsed.values })
    .select('id, name, starts_at, capacity, created_at')
    .single();
  if (error) {
    console.error('Cohort create error:', error);
    return NextResponse.json({ error: 'No se pudo crear la convocatoria' }, { status: 500 });
  }
  return NextResponse.json({ cohort: data });
}
