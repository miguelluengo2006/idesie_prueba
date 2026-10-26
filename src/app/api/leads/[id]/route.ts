import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAgencyPrincipal } from '@/lib/agencyAccess';
import { getEffectiveOwnerId, canWrite } from '@/lib/teamUtils';
import { isValidUUID, sanitizeString } from '@/lib/validation';
import { isLeadStatus } from '@/lib/admissions';

async function authenticate(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// PATCH /api/leads/[id] - update status/notes/cohort
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });

  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const forbidden = await requireAgencyPrincipal(supabaseAdmin, user.id, req);
  if (forbidden) return forbidden;

  const { ownerId, role } = await getEffectiveOwnerId(supabaseAdmin, user.id);
  if (!canWrite(role)) {
    return NextResponse.json({ error: 'You do not have permission to manage leads' }, { status: 403 });
  }

  const { data: existing } = await supabaseAdmin
    .from('leads')
    .select('id, owner_id')
    .eq('id', id)
    .maybeSingle();

  if (!existing || existing.owner_id !== ownerId) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const updates: Record<string, any> = {};

  if (body.status !== undefined) {
    if (!isLeadStatus(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    updates.status = body.status;
  }

  // Convocatoria: un id de una convocatoria propia, o null para quitarla
  if (body.cohort_id !== undefined) {
    if (body.cohort_id === null) {
      updates.cohort_id = null;
    } else {
      if (typeof body.cohort_id !== 'string' || !isValidUUID(body.cohort_id)) {
        return NextResponse.json({ error: 'Convocatoria no válida' }, { status: 400 });
      }
      const { data: cohort } = await supabaseAdmin.from('cohorts').select('id').eq('id', body.cohort_id).eq('owner_id', ownerId).maybeSingle();
      if (!cohort) return NextResponse.json({ error: 'Convocatoria no encontrada' }, { status: 404 });
      updates.cohort_id = body.cohort_id;
    }
  }

  if (body.notes !== undefined) {
    updates.notes = body.notes ? sanitizeString(body.notes, 4000) : null;
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Lead update error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }

  return NextResponse.json({ lead: data });
}

// DELETE /api/leads/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });

  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const forbidden = await requireAgencyPrincipal(supabaseAdmin, user.id, req);
  if (forbidden) return forbidden;

  const { ownerId, role } = await getEffectiveOwnerId(supabaseAdmin, user.id);
  if (!canWrite(role)) {
    return NextResponse.json({ error: 'You do not have permission to manage leads' }, { status: 403 });
  }

  const { data: existing } = await supabaseAdmin
    .from('leads')
    .select('id, owner_id')
    .eq('id', id)
    .maybeSingle();

  if (!existing || existing.owner_id !== ownerId) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  const { error } = await supabaseAdmin.from('leads').delete().eq('id', id);
  if (error) {
    console.error('Lead delete error:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
