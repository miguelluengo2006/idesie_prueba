import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';
import { fetchAllRows, upsertContacts, type ContactInput } from '@/lib/crmServer';

// POST /api/contacts/sync-leads — crea contactos a partir de los leads que ya tienes (los que tienen email).
// Entran SIN consentimiento: haber pedido información no es haber aceptado recibir campañas. Se les puede
// escribir uno a uno desde Leads, pero no entran en un envío masivo hasta que se suscriban.
export async function POST(req: NextRequest) {
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;

  try {
    const leads = await fetchAllRows<{ name: string; email: string | null; phone: string | null; company: string | null; status: string }>(
      (from, to) =>
        supabaseAdmin
          .from('leads')
          .select('name, email, phone, company, status')
          .eq('owner_id', auth.ownerId)
          .neq('email', '')
          .not('email', 'is', null)
          .order('created_at', { ascending: false })
          .order('id')
          .range(from, to)
    );

    const inputs: ContactInput[] = leads.map((l) => ({
      email: l.email || '',
      name: l.name,
      phone: l.phone,
      company: l.company,
      tags: l.status === 'enrolled' || l.status === 'paid' ? ['Lead', 'Matriculado'] : ['Lead'],
    }));
    const result = await upsertContacts(supabaseAdmin, auth.ownerId, inputs, { source: 'lead', consent: false });
    return NextResponse.json({ ...result, leads: leads.length });
  } catch (error) {
    console.error('Sync leads → contacts error:', error);
    return NextResponse.json({ error: 'No se pudieron importar los leads' }, { status: 500 });
  }
}
