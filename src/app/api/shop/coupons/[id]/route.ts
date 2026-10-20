import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';
import { couponFromRow, couponRowFromBody } from '@/lib/shopServer';

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/shop/coupons/:id → editar o activar/desactivar
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;
  const { id } = await params;
  const v = couponRowFromBody(await req.json().catch(() => null), true);
  if ('error' in v) return NextResponse.json({ error: v.error }, { status: 400 });
  if (!Object.keys(v.row).length) return NextResponse.json({ error: 'Nada que cambiar' }, { status: 400 });
  const { data, error } = await supabaseAdmin.from('shop_coupons').update(v.row).eq('id', id).select('*').maybeSingle();
  if (error) return NextResponse.json({ error: error.code === '23505' ? 'Ya existe un cupón con ese código.' : error.message }, { status: error.code === '23505' ? 409 : 500 });
  if (!data) return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 });
  return NextResponse.json({ coupon: couponFromRow(data) });
}

// DELETE /api/shop/coupons/:id → solo si ningún pedido lo ha usado (si no, se desactiva para conservar el histórico)
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;
  const { id } = await params;
  const { count } = await supabaseAdmin.from('shop_orders').select('id', { count: 'exact', head: true }).eq('coupon_id', id);
  if (count) return NextResponse.json({ error: 'Este cupón ya se ha usado en pedidos: desactívalo en lugar de borrarlo.' }, { status: 409 });
  const { error } = await supabaseAdmin.from('shop_coupons').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
