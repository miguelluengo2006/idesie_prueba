import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';
import { isValidUUID } from '@/lib/validation';
import { parseCohortBody } from '@/lib/cohortsServer';

// PATCH /api/cohorts/[id] - cambia nombre, fecha de inicio o plazas
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Convocatoria no válida' }, { status: 400 });
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;

  const parsed = parseCohortBody(await req.json().catch(() => null), { partial: true });
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('cohorts')
    .update({ ...parsed.values, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('owner_id', auth.ownerId)
    .select('id, name, starts_at, capacity, created_at')
    .maybeSingle();
  if (error) {
    console.error('Cohort update error:', error);
    return NextResponse.json({ error: 'No se pudo guardar' }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Convocatoria no encontrada' }, { status: 404 });
  return NextResponse.json({ cohort: data });
}

// DELETE /api/cohorts/[id] - los leads asignados se quedan sin convocatoria (no se borran)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Convocatoria no válida' }, { status: 400 });
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;

  const { error } = await supabaseAdmin.from('cohorts').delete().eq('id', id).eq('owner_id', auth.ownerId);
  if (error) {
    console.error('Cohort delete error:', error);
    return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
