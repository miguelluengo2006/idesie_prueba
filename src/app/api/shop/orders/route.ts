import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { agencyUser } from '@/lib/routeAuth';

// GET /api/shop/orders?status= → pedidos con sus líneas
export async function GET(req: NextRequest) {
  const auth = await agencyUser(req);
  if ('error' in auth) return auth.error;
  const status = req.nextUrl.searchParams.get('status');
  let q = supabaseAdmin.from('shop_orders').select('*, shop_order_items(product_name, unit_price_eur)').order('created_at', { ascending: false }).limit(500);
  if (status && ['pending', 'paid', 'failed', 'cancelled', 'refunded'].includes(status)) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    orders: (data || []).map((o) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      createdAt: o.created_at,
      paidAt: o.paid_at,
      buyer: { name: `${o.buyer_first_name} ${o.buyer_last_name}`, email: o.buyer_email, phone: o.buyer_phone },
      subtotalEur: Number(o.subtotal_eur),
      discountEur: Number(o.discount_eur),
      totalEur: Number(o.total_eur),
      couponCode: o.coupon_code,
      providerRef: o.provider_ref,
      providerStatus: o.provider_status,
      notes: o.notes,
      items: (o.shop_order_items || []).map((i: any) => ({ name: i.product_name, priceEur: Number(i.unit_price_eur) })),
    })),
  });
}
