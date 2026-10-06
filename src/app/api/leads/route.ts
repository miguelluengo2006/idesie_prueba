import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAgencyPrincipal } from '@/lib/agencyAccess';
import { getEffectiveOwnerId, canWrite } from '@/lib/teamUtils';
import { isValidEmail, sanitizeString } from '@/lib/validation';
import { upsertContacts } from '@/lib/crmServer';

async function authenticate(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// GET /api/leads - list the agency's proposal requests
export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const forbidden = await requireAgencyPrincipal(supabaseAdmin, user.id, req);
  if (forbidden) return forbidden;

  const { ownerId } = await getEffectiveOwnerId(supabaseAdmin, user.id);

  const { data, error } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Leads fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }

  return NextResponse.json({ leads: data || [] });
}

// POST /api/leads - alta manual de un lead (te escribió por teléfono, en una feria, por WhatsApp…)
export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const forbidden = await requireAgencyPrincipal(supabaseAdmin, user.id, req);
  if (forbidden) return forbidden;

  const { ownerId, role } = await getEffectiveOwnerId(supabaseAdmin, user.id);
  if (!canWrite(role)) return NextResponse.json({ error: 'No tienes permiso para añadir leads' }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Datos no válidos' }, { status: 400 });

  const name = sanitizeString(String(body.name || ''), 200);
  const email = String(body.email || '').trim().toLowerCase();
  const phone = sanitizeString(String(body.phone || ''), 25);
  const company = sanitizeString(String(body.company || ''), 200);
  const message = sanitizeString(String(body.message || ''), 4000) || 'Añadido a mano.';

  if (!name) return NextResponse.json({ error: 'Falta el nombre' }, { status: 400 });
  if (email && !isValidEmail(email)) return NextResponse.json({ error: 'El email no es válido' }, { status: 400 });
  if (!email && !phone) return NextResponse.json({ error: 'Pon al menos un email o un teléfono' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('leads')
    .insert({ owner_id: ownerId, name, email, phone: phone || null, company: company || null, message, source: 'manual', kind: 'proposal' })
    .select('*')
    .single();
  if (error) {
    console.error('Lead create error:', error);
    return NextResponse.json({ error: 'No se pudo crear el lead' }, { status: 500 });
  }

  // También entra en Contactos (sin consentimiento: haber hablado con él no es haber aceptado campañas)
  if (email) {
    await upsertContacts(supabaseAdmin, ownerId, [{ email, name, phone, company }], { source: 'lead', consent: false, extraTags: ['Lead'] }).catch((e) =>
      console.error('Lead create: contact not created:', e)
    );
  }
  return NextResponse.json({ lead: data });
}
