import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';
import { sanitizeString } from '@/lib/validation';
import { MAX_BODY_LENGTH, MAX_SUBJECT_LENGTH } from '@/lib/campaigns';
import { MAX_TEMPLATES, MAX_TEMPLATE_NAME, TEMPLATE_COLUMNS } from '@/lib/campaignTemplates';

// GET /api/templates → plantillas guardadas del propietario, la más reciente primero
export async function GET(req: NextRequest) {
  const auth = await agencyUser(req);
  if ('error' in auth) return auth.error;

  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .select(TEMPLATE_COLUMNS)
    .eq('owner_id', auth.ownerId)
    .order('updated_at', { ascending: false })
    .limit(MAX_TEMPLATES);
  if (error) {
    console.error('Templates fetch error:', error);
    return NextResponse.json({ error: 'No se pudieron cargar las plantillas. ¿Has ejecutado migrations/add-email-tracking.sql?' }, { status: 500 });
  }
  return NextResponse.json({ templates: data || [] });
}

// POST /api/templates { name, subject?, body } → guarda una plantilla
export async function POST(req: NextRequest) {
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;

  const payload = await req.json().catch(() => null);
  const name = sanitizeString(String(payload?.name || ''), MAX_TEMPLATE_NAME);
  const body = String(payload?.body || '').slice(0, MAX_BODY_LENGTH);
  if (!name) return NextResponse.json({ error: 'Ponle un nombre a la plantilla.' }, { status: 400 });
  if (!body.trim()) return NextResponse.json({ error: 'La plantilla está vacía.' }, { status: 400 });

  const { count } = await supabaseAdmin.from('email_templates').select('id', { count: 'exact', head: true }).eq('owner_id', auth.ownerId);
  if ((count || 0) >= MAX_TEMPLATES) {
    return NextResponse.json({ error: `Has llegado al máximo de ${MAX_TEMPLATES} plantillas. Borra alguna.` }, { status: 409 });
  }

  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .insert({
      owner_id: auth.ownerId,
      name,
      subject: String(payload?.subject || '').replace(/[\r\n]+/g, ' ').slice(0, MAX_SUBJECT_LENGTH).trim(),
      body,
    })
    .select(TEMPLATE_COLUMNS)
    .single();
  if (error) {
    console.error('Template create error:', error);
    return NextResponse.json({ error: 'No se pudo guardar la plantilla' }, { status: 500 });
  }
  return NextResponse.json({ template: data });
}
