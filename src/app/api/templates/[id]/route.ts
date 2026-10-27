import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';
import { isValidUUID } from '@/lib/validation';

// DELETE /api/templates/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Plantilla no válida' }, { status: 400 });
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;

  const { error } = await supabaseAdmin.from('email_templates').delete().eq('id', id).eq('owner_id', auth.ownerId);
  if (error) {
    console.error('Template delete error:', error);
    return NextResponse.json({ error: 'No se pudo borrar la plantilla' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
