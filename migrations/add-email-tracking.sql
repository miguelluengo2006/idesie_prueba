-- Seguimiento de los emails de las campañas (entregado, abierto, clic, rebote) y plantillas guardadas.
-- Se puede ejecutar más de una vez. Requiere haber ejecutado antes migrations/add-crm.sql.
--
--   campaign_sends  gana el id del email en Resend y las marcas de tiempo de cada evento.
--   email_events    una fila por aviso que manda Resend (webhook): permite saber qué enlace pulsó cada persona
--                   y descartar avisos repetidos (svix_id es único).
--   email_templates plantillas de email guardadas por el propietario, para reutilizarlas en campañas.

ALTER TABLE campaign_sends
  ADD COLUMN IF NOT EXISTS resend_id TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS complained_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS open_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS click_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bounce_reason TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_campaign_sends_resend_id ON campaign_sends(resend_id) WHERE resend_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id UUID NOT NULL REFERENCES campaign_sends(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  url TEXT,
  svix_id TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_email_events_svix_id ON email_events(svix_id);
CREATE INDEX IF NOT EXISTS idx_email_events_send ON email_events(send_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_campaign ON email_events(campaign_id, type);

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_owner ON email_templates(owner_id, updated_at DESC);

ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Owners manage their own email templates') THEN
    CREATE POLICY "Owners manage their own email templates" ON email_templates FOR ALL TO authenticated
      USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_events' AND policyname = 'Owners read their own email events') THEN
    CREATE POLICY "Owners read their own email events" ON email_events FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND c.owner_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_events' AND policyname = 'Service role full access email_events') THEN
    CREATE POLICY "Service role full access email_events" ON email_events FOR ALL TO service_role USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Service role full access email_templates') THEN
    CREATE POLICY "Service role full access email_templates" ON email_templates FOR ALL TO service_role USING (true);
  END IF;
END $$;
