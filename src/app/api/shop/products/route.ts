import { NextRequest, NextResponse } from 'next/server';
import { agencyUser } from '@/lib/routeAuth';
import { getProducts } from '@/lib/shopServer';

// GET /api/shop/products → catálogo completo (también los desactivados)
export async function GET(req: NextRequest) {
  const auth = await agencyUser(req);
  if ('error' in auth) return auth.error;
  try {
    return NextResponse.json({ products: await getProducts({ all: true }) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
