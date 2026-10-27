-- «No repetir»: cada campaña puede excluir a quienes ya recibieron otras campañas.
-- Guarda los ids de esas campañas; al empezar el envío se deja fuera a quien las recibió.
-- Se puede ejecutar más de una vez. Requiere migrations/add-crm.sql.
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS exclude_campaign_ids UUID[] NOT NULL DEFAULT '{}';
