import { NextRequest, NextResponse } from 'next/server';
import { agencyUser } from '@/lib/routeAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { applyOrderAction, type OrderAction } from '@/lib/shopServer';

// PATCH /api/shop/orders/:id { action: 'mark_paid' | 'cancel' | 'refund' } → ajuste manual (p. ej. si el aviso de Flywire no llegó)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const action = body?.action as OrderAction;
  if (!['mark_paid', 'cancel', 'refund'].includes(action)) return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(auth.userId);
  const res = await applyOrderAction(id, action, user?.email || 'equipo');
  if ('error' in res) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json({ ok: true });
}
