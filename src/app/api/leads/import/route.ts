import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';
import { fetchAllRows, upsertContacts } from '@/lib/crmServer';
import { isLeadStatus } from '@/lib/admissions';
import { identityKeys } from '@/lib/leadsImport';
import { isValidEmail, isValidUUID, sanitizeString } from '@/lib/validation';

const MAX_ROWS = 2000;
const CHUNK = 200;

// POST /api/leads/import - sube leads de Facebook (filas ya leídas del CSV de Meta).
// Se ignoran los que ya existen (mismo email o mismo teléfono) y los repetidos dentro del propio archivo.
// Entran en Contactos sin consentimiento para campañas: haber rellenado un formulario de anuncio no es aceptar emails.
export async function POST(req: NextRequest) {
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.rows)) return NextResponse.json({ error: 'Datos no válidos' }, { status: 400 });
  if (body.rows.length === 0) return NextResponse.json({ error: 'El archivo no tiene leads' }, { status: 400 });
  if (body.rows.length > MAX_ROWS) return NextResponse.json({ error: `Máximo ${MAX_ROWS} leads por importación. Divide el archivo.` }, { status: 400 });

  const status = body.status === undefined ? 'new' : body.status;
  if (!isLeadStatus(status)) return NextResponse.json({ error: 'Etapa no válida' }, { status: 400 });

  let cohortId: string | null = null;
  if (body.cohort_id) {
    if (typeof body.cohort_id !== 'string' || !isValidUUID(body.cohort_id)) return NextResponse.json({ error: 'Convocatoria no válida' }, { status: 400 });
    const { data: cohort } = await supabaseAdmin.from('cohorts').select('id').eq('id', body.cohort_id).eq('owner_id', auth.ownerId).maybeSingle();
    if (!cohort) return NextResponse.json({ error: 'Convocatoria no encontrada' }, { status: 404 });
    cohortId = cohort.id;
  }

  try {
    const existing = await fetchAllRows<{ email: string | null; phone: string | null }>((from, to) =>
      supabaseAdmin.from('leads').select('email, phone').eq('owner_id', auth.ownerId).order('created_at', { ascending: false }).order('id').range(from, to)
    );
    const seen = new Set<string>(existing.flatMap(identityKeys));

    const toInsert: Record<string, unknown>[] = [];
    const contacts: { email: string; name: string; phone: string; company: string }[] = [];
    let duplicates = 0;
    let invalid = 0;

    for (const r of body.rows) {
      const email = String(r?.email || '').trim().toLowerCase();
      const phone = sanitizeString(String(r?.phone || ''), 25);
      if ((!email && !phone) || (email && !isValidEmail(email))) {
        invalid += 1;
        continue;
      }
      const keys = identityKeys({ email, phone });
      if (keys.some((k) => seen.has(k))) {
        duplicates += 1;
        continue;
      }
      keys.forEach((k) => seen.add(k));

      const name = sanitizeString(String(r.name || ''), 200) || email || phone;
      const company = sanitizeString(String(r.company || ''), 200);
      const extra = Array.isArray(r.extra) ? r.extra.slice(0, 20).map((e: unknown) => sanitizeString(String(e), 300)).filter(Boolean) : [];
      const campaign = sanitizeString(String(r.campaign || ''), 200);
      const created = typeof r.createdAt === 'string' && !Number.isNaN(Date.parse(r.createdAt)) ? new Date(r.createdAt).toISOString() : null;

      const utm: Record<string, string> = { utm_source: 'facebook' };
      if (campaign) utm.utm_campaign = campaign;
      const adset = sanitizeString(String(r.adset || ''), 200);
      const ad = sanitizeString(String(r.ad || ''), 200);
      if (adset) utm.utm_term = adset;
      if (ad) utm.utm_content = ad;

      const form = sanitizeString(String(r.form || ''), 200);
      const platform = sanitizeString(String(r.platform || ''), 40);
      const message = [form ? `Formulario de Meta: ${form}` : 'Lead de Facebook', platform ? `Plataforma: ${platform}` : '', ...extra].filter(Boolean).join('\n');

      toInsert.push({
        owner_id: auth.ownerId,
        name,
        email,
        phone: phone || null,
        company: company || null,
        message,
        source: 'facebook',
        kind: 'proposal',
        status,
        cohort_id: cohortId,
        answers: { utm },
        ...(created ? { created_at: created } : {}),
      });
      if (email) contacts.push({ email, name, phone, company });
    }

    for (let i = 0; i < toInsert.length; i += CHUNK) {
      const { error } = await supabaseAdmin.from('leads').insert(toInsert.slice(i, i + CHUNK));
      if (error) {
        console.error('Lead import error:', error);
        return NextResponse.json({ error: `Se importaron ${i} de ${toInsert.length} leads y falló el resto. Vuelve a subir el archivo: los ya importados se ignorarán.` }, { status: 500 });
      }
    }

    if (contacts.length > 0) {
      await upsertContacts(supabaseAdmin, auth.ownerId, contacts, { source: 'lead', consent: false, extraTags: ['Lead', 'Facebook'] }).catch((e) =>
        console.error('Lead import: contacts not created:', e)
      );
    }

    return NextResponse.json({ created: toInsert.length, duplicates, invalid });
  } catch (error) {
    console.error('Lead import error:', error);
    return NextResponse.json({ error: 'No se pudo importar el archivo' }, { status: 500 });
  }
}
