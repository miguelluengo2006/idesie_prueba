import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';
import { CONTACT_COLUMNS } from '@/lib/crmServer';
import { isValidUUID, sanitizeString } from '@/lib/validation';
import { normalizeTags } from '@/lib/contacts';

async function ownContact(id: string, ownerId: string) {
  const { data } = await supabaseAdmin
    .from('contacts')
    .select('id, owner_id, subscribed, unsubscribed_at')
    .eq('id', id)
    .maybeSingle();
  return data && data.owner_id === ownerId ? data : null;
}

// PATCH /api/contacts/[id]  { name?, phone?, company?, tags?, notes?, subscribed? }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Contacto no válido' }, { status: 400 });

  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;

  const existing = await ownContact(id, auth.ownerId);
  if (!existing) return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Datos no válidos' }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updates.name = sanitizeString(String(body.name || ''), 200) || null;
  if (body.phone !== undefined) updates.phone = sanitizeString(String(body.phone || ''), 25) || null;
  if (body.company !== undefined) updates.company = sanitizeString(String(body.company || ''), 200) || null;
  if (body.notes !== undefined) updates.notes = sanitizeString(String(body.notes || ''), 4000) || null;
  if (body.tags !== undefined) updates.tags = normalizeTags(body.tags);

  if (body.subscribed !== undefined) {
    if (body.subscribed === true) {
      // Quien se dio de baja pidió no recibir más: solo él puede volver a suscribirse (formulario de la web)
      if (existing.unsubscribed_at) {
        return NextResponse.json({ error: 'Este contacto se dio de baja: no se le puede volver a suscribir.' }, { status: 409 });
      }
      if (!existing.subscribed) {
        updates.subscribed = true;
        updates.consent_at = new Date().toISOString();
      }
    } else {
      updates.subscribed = false;
    }
  }

  const { data, error } = await supabaseAdmin.from('contacts').update(updates).eq('id', id).select(CONTACT_COLUMNS).single();
  if (error) {
    console.error('Contact update error:', error);
    return NextResponse.json({ error: 'No se pudo guardar el contacto' }, { status: 500 });
  }
  return NextResponse.json({ contact: data });
}

// DELETE /api/contacts/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Contacto no válido' }, { status: 400 });

  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;

  if (!(await ownContact(id, auth.ownerId))) return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });

  const { error } = await supabaseAdmin.from('contacts').delete().eq('id', id).eq('owner_id', auth.ownerId);
  if (error) {
    console.error('Contact delete error:', error);
    return NextResponse.json({ error: 'No se pudo borrar el contacto' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
