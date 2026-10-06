import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';
import { CONTACT_COLUMNS, fetchAllRows, upsertContacts, type ContactInput } from '@/lib/crmServer';
import { isValidEmail } from '@/lib/validation';
import { normalizeEmail } from '@/lib/contacts';

/** Máximo de contactos por importación (el navegador manda el CSV ya leído). */
const MAX_IMPORT = 5000;

// GET /api/contacts            → todos los contactos del propietario
// GET /api/contacts?summary=1  → solo los números para el resumen del panel
export async function GET(req: NextRequest) {
  const auth = await agencyUser(req);
  if ('error' in auth) return auth.error;

  try {
    if (req.nextUrl.searchParams.get('summary')) {
      const count = async (filter: (q: any) => any) => {
        const { count: n, error } = await filter(
          supabaseAdmin.from('contacts').select('id', { count: 'exact', head: true }).eq('owner_id', auth.ownerId)
        );
        if (error) throw new Error(error.message);
        return n || 0;
      };
      const [total, subscribed, unsubscribed] = await Promise.all([
        count((q) => q),
        count((q) => q.eq('subscribed', true).is('unsubscribed_at', null)),
        count((q) => q.not('unsubscribed_at', 'is', null)),
      ]);
      const { data: last } = await supabaseAdmin
        .from('campaigns')
        .select('id, name, status, total, sent_count, failed_count, sent_at')
        .eq('owner_id', auth.ownerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return NextResponse.json({ total, subscribed, unsubscribed, noConsent: total - subscribed - unsubscribed, lastCampaign: last || null });
    }

    const contacts = await fetchAllRows((from, to) =>
      supabaseAdmin
        .from('contacts')
        .select(CONTACT_COLUMNS)
        .eq('owner_id', auth.ownerId)
        .order('created_at', { ascending: false })
        .order('id')
        .range(from, to)
    );
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Contacts fetch error:', error);
    return NextResponse.json({ error: 'No se pudieron cargar los contactos' }, { status: 500 });
  }
}

// POST /api/contacts  { contacts: [{ email, name?, phone?, company?, tags? }], consent?: boolean, tags?: string[], source?: 'manual'|'import' }
// Alta de uno o importación de muchos. `consent: true` = quien los da de alta confirma que han aceptado recibir emails.
export async function POST(req: NextRequest) {
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Datos no válidos' }, { status: 400 });
  }

  const list: ContactInput[] = Array.isArray(body?.contacts) ? body.contacts : [];
  if (list.length === 0) return NextResponse.json({ error: 'No hay contactos que añadir' }, { status: 400 });
  if (list.length > MAX_IMPORT) {
    return NextResponse.json({ error: `Importa como máximo ${MAX_IMPORT} contactos de una vez` }, { status: 400 });
  }
  // Alta individual: se avisa con un error claro en vez de ignorar el email malo
  if (list.length === 1 && !isValidEmail(normalizeEmail(String(list[0]?.email || '')))) {
    return NextResponse.json({ error: 'Introduce un email válido' }, { status: 400 });
  }

  try {
    const result = await upsertContacts(supabaseAdmin, auth.ownerId, list, {
      source: body.source === 'import' ? 'import' : 'manual',
      consent: body.consent === true,
      extraTags: Array.isArray(body.tags) ? body.tags : [],
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Contacts upsert error:', error);
    return NextResponse.json({ error: 'No se pudieron guardar los contactos' }, { status: 500 });
  }
}
