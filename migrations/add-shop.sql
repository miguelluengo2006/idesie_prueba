-- Tienda: catálogo, cupones, pedidos y eventos de pago (Flywire).
-- Idempotente: se puede ejecutar más de una vez (Supabase → SQL Editor). Solo el servidor accede, con la clave de servicio.

-- 1) Catálogo (precios en euros con IVA incluido; NULL = a consultar, 0 = gratuito)
CREATE TABLE IF NOT EXISTS shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('master', 'curso')),
  category TEXT,
  summary TEXT NOT NULL DEFAULT '',
  price_eur NUMERIC(10, 2) CHECK (price_eur IS NULL OR price_eur >= 0),
  duration TEXT,
  modality TEXT,
  certification TEXT,
  program_href TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catálogo real de idesie.com. «DO NOTHING»: si ya editaste un precio en el panel, no se pisa.
INSERT INTO shop_products (slug, name, kind, category, summary, price_eur, duration, modality, certification, program_href, featured, active, sort_order) VALUES
  ('master-bim-full-time', 'Máster BIM Full Time', 'master', 'BIM', 'Trabajas por la mañana, te formas por la tarde y sales siendo BIM Manager, con prácticas remuneradas desde el primer mes.', 15000, '16 meses', 'Learning by Working · presencial en Madrid', 'Título propio IDESIE + certificación CUALIFICAM', '/masters/mbim', true, true, 10),
  ('master-bim-building-engineering', 'Máster BIM & Building Engineering', 'master', 'BIM', 'Especialízate en instalaciones (MEP) con metodología BIM: hidráulica, eléctrica, térmica, PCI y renovables.', 15000, '16 meses', 'Learning by Working · presencial en Madrid', 'Título propio IDESIE', '/masters/mbbe', true, true, 20),
  ('master-bim-online', 'Máster BIM Online', 'master', 'BIM', 'Fórmate como BIM Manager desde donde estés, con los mismos mentores y la misma bolsa de empleo que el máster presencial.', 4500, '12 meses', '100 % online · flexible', 'Título de Máster BIM de IDESIE', '/masters/mbim-online', true, true, 30),
  ('executive-master-bim', 'Executive Master BIM', 'master', 'BIM', 'Máster BIM en formato ejecutivo: clases en viernes por la tarde y sábados, 12 meses.', NULL, '12 meses', 'Fines de semana · viernes tarde y sábados', 'Título propio IDESIE', NULL, false, true, 40),
  ('titulo-profesional-cualificam', 'Título Profesional CUALIFICAM', 'curso', 'BIM', 'Obtén el título profesional CUALIFICAM.', 262.5, NULL, NULL, 'CUALIFICAM', NULL, false, true, 50),
  ('curso-revit-gratis', 'Curso de Revit Gratis · Iniciación', 'curso', 'Programación', 'Primer contacto con Revit en 8 horas. Gratuito y 100 % online.', 0, '8 horas', '100 % online · gratuito', 'Certificado de participación', NULL, false, true, 60)
ON CONFLICT (slug) DO NOTHING;

-- 2) Cupones creados desde el panel
CREATE TABLE IF NOT EXISTS shop_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (code ~ '^[A-Z0-9_-]{3,40}$'),
  description TEXT NOT NULL DEFAULT '',
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'amount', 'fixed_price')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  applies_to TEXT[],
  active BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses >= 1),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (discount_type <> 'percent' OR discount_value <= 100)
);

-- 3) Pedidos
CREATE SEQUENCE IF NOT EXISTS shop_order_seq START 1001;

CREATE TABLE IF NOT EXISTS shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE DEFAULT ('IDE-' || to_char(NOW(), 'YYYY') || '-' || nextval('shop_order_seq')),
  public_token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  buyer_first_name TEXT NOT NULL,
  buyer_last_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  subtotal_eur NUMERIC(10, 2) NOT NULL CHECK (subtotal_eur >= 0),
  discount_eur NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_eur >= 0),
  total_eur NUMERIC(10, 2) NOT NULL CHECK (total_eur >= 0),
  coupon_id UUID REFERENCES shop_coupons(id) ON DELETE SET NULL,
  coupon_code TEXT,
  currency TEXT NOT NULL DEFAULT 'EUR',
  provider TEXT NOT NULL DEFAULT 'flywire',
  provider_ref TEXT,
  provider_status TEXT,
  paid_at TIMESTAMPTZ,
  terms_accepted_at TIMESTAMPTZ,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shop_orders_email ON shop_orders(lower(buyer_email));
CREATE INDEX IF NOT EXISTS idx_shop_orders_coupon ON shop_orders(coupon_id) WHERE coupon_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS shop_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES shop_products(id) ON DELETE SET NULL,
  product_slug TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price_eur NUMERIC(10, 2) NOT NULL CHECK (unit_price_eur >= 0)
);
CREATE INDEX IF NOT EXISTS idx_shop_order_items_order ON shop_order_items(order_id);

-- 4) Cada aviso de la pasarela, tal como llegó (auditoría y para no procesar dos veces el mismo)
CREATE TABLE IF NOT EXISTS shop_payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES shop_orders(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'flywire',
  dedupe_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  provider_ref TEXT,
  amount_cents BIGINT,
  outcome TEXT NOT NULL DEFAULT 'recorded',
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shop_payment_events_order ON shop_payment_events(order_id);

-- 5) Usos de un cupón: pedidos pagados + pendientes de las últimas 24 h (pasado ese tiempo el uso se libera)
CREATE OR REPLACE FUNCTION shop_coupon_uses(p_coupon UUID) RETURNS INTEGER
LANGUAGE sql STABLE AS $$
  SELECT COUNT(*)::INTEGER FROM shop_orders
  WHERE coupon_id = p_coupon
    AND (status = 'paid' OR (status = 'pending' AND created_at > NOW() - INTERVAL '24 hours'));
$$;

-- 6) Solo el servidor (clave de servicio) toca estas tablas
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_payment_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON shop_products, shop_coupons, shop_orders, shop_order_items, shop_payment_events FROM anon, authenticated;
GRANT ALL ON shop_products, shop_coupons, shop_orders, shop_order_items, shop_payment_events TO service_role;
REVOKE ALL ON FUNCTION shop_coupon_uses(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION shop_coupon_uses(UUID) TO service_role;
GRANT USAGE, SELECT ON SEQUENCE shop_order_seq TO service_role;
