-- Reserva de plaza: los másteres se reservan online con un pago inicial; el resto se acuerda con admisiones.
-- Idempotente.
ALTER TABLE shop_products ADD COLUMN IF NOT EXISTS reservation_eur NUMERIC(10, 2) CHECK (reservation_eur IS NULL OR reservation_eur > 0);
ALTER TABLE shop_order_items ADD COLUMN IF NOT EXISTS full_price_eur NUMERIC(10, 2);

-- Reserva de 3.000 € en los másteres con precio publicado (solo si aún no se ha fijado una)
UPDATE shop_products SET reservation_eur = 3000 WHERE kind = 'master' AND price_eur IS NOT NULL AND reservation_eur IS NULL;
