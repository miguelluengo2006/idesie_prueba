import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';
import { couponFromRow, couponRowFromBody } from '@/lib/shopServer';

// GET /api/shop/coupons → cupones con su número de usos (pagados + pendientes de menos de 24 h)
export async function GET(req: NextRequest) {
  const auth = await agencyUser(req);
  if ('error' in auth) return auth.error;
  const { data, error } = await supabaseAdmin.from('shop_coupons').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const coupons = await Promise.all(
    (data || []).map(async (r) => {
      const { data: uses } = await supabaseAdmin.rpc('shop_coupon_uses', { p_coupon: r.id });
      return { ...couponFromRow(r), uses: Number(uses) || 0, createdAt: r.created_at };
    })
  );
  return NextResponse.json({ coupons });
}

// POST /api/shop/coupons → crear cupón
export async function POST(req: NextRequest) {
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;
  const body = await req.json().catch(() => null);
  const v = couponRowFromBody(body);
  if ('error' in v) return NextResponse.json({ error: v.error }, { status: 400 });
  const { data, error } = await supabaseAdmin.from('shop_coupons').insert(v.row).select('*').single();
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Ya existe un cupón con ese código.' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ coupon: couponFromRow(data) }, { status: 201 });
}
