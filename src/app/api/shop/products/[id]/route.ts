import { NextRequest, NextResponse } from 'next/server';
import { agencyUser } from '@/lib/routeAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sanitizeString } from '@/lib/validation';
import { productFromRow } from '@/lib/shopServer';

// PATCH /api/shop/products/:id → precio, visibilidad, destacado y textos. priceEur null = «consultar».
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await agencyUser(req, { write: true });
  if ('error' in auth) return auth.error;
  const { id } = await params;
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== 'object') return NextResponse.json({ error: 'Petición no válida' }, { status: 400 });
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if ('priceEur' in b) {
    if (b.priceEur === null || b.priceEur === '') row.price_eur = null;
    else {
      const n = Number(b.priceEur);
      if (!Number.isFinite(n) || n < 0 || n > 100000) return NextResponse.json({ error: 'Precio no válido' }, { status: 400 });
      row.price_eur = Math.round(n * 100) / 100;
    }
  }
  if ('reservationEur' in b) {
    if (b.reservationEur === null || b.reservationEur === '') row.reservation_eur = null;
    else {
      const n = Number(b.reservationEur);
      if (!Number.isFinite(n) || n <= 0 || n > 100000) return NextResponse.json({ error: 'Reserva no válida' }, { status: 400 });
      row.reservation_eur = Math.round(n * 100) / 100;
    }
  }
  if ('active' in b) row.active = b.active === true;
  if ('featured' in b) row.featured = b.featured === true;
  if ('name' in b) {
    const name = sanitizeString(String(b.name), 120);
    if (!name) return NextResponse.json({ error: 'El nombre no puede estar vacío' }, { status: 400 });
    row.name = name;
  }
  if ('summary' in b) row.summary = sanitizeString(String(b.summary), 400);
  if (Object.keys(row).length === 1) return NextResponse.json({ error: 'Nada que cambiar' }, { status: 400 });
  const { data, error } = await supabaseAdmin.from('shop_products').update(row).eq('id', id).select('*').maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  return NextResponse.json({ product: productFromRow(data) });
}
