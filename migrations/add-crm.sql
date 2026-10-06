-- CRM básico: contactos y campañas de email.
-- Aditivo e idempotente: se puede ejecutar más de una vez (Supabase → SQL Editor).
--
--   contacts        la agenda de contactos (alumnos, empresas, leads…). Solo se les escribe en campañas si
--                   `subscribed` = true (consentimiento) y `unsubscribed_at` es nulo.
--   campaigns       cada envío de email: asunto, texto, audiencia (etiquetas) y estado.
--   campaign_sends  una fila por destinatario de una campaña (pendiente / enviado / fallido), para poder
--                   enviar por lotes, reanudar y ver qué falló.

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  company TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  -- manual | import | lead | web
  source TEXT NOT NULL DEFAULT 'manual',
  -- Consentimiento para recibir emails comerciales
  subscribed BOOLEAN NOT NULL DEFAULT FALSE,
  consent_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  -- Token del enlace de baja de cada email (público, no adivinable)
  unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Un contacto por email y propietario. El email se guarda siempre en minúsculas (lo comprueba el CHECK)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_email_lowercase') THEN
    ALTER TABLE contacts ADD CONSTRAINT contacts_email_lowercase CHECK (email = lower(email));
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS uq_contacts_owner_email ON contacts(owner_id, email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_contacts_unsubscribe_token ON contacts(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING GIN (tags);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  -- Etiquetas de la audiencia; vacío = todos los suscritos
  audience_tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent')),
  total INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_owner_id ON campaigns(owner_id, created_at DESC);

CREATE TABLE IF NOT EXISTS campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'skipped')),
  error TEXT,
  claimed_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_campaign_sends_email ON campaign_sends(campaign_id, email);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_status ON campaign_sends(campaign_id, status);

-- Seguridad a nivel de fila: cada persona solo ve lo suyo; el servidor (service_role) lo ve todo
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Owners manage their own contacts') THEN
    CREATE POLICY "Owners manage their own contacts" ON contacts FOR ALL TO authenticated
      USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Owners manage their own campaigns') THEN
    CREATE POLICY "Owners manage their own campaigns" ON campaigns FOR ALL TO authenticated
      USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaign_sends' AND policyname = 'Owners read their own campaign sends') THEN
    CREATE POLICY "Owners read their own campaign sends" ON campaign_sends FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND c.owner_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Service role full access contacts') THEN
    CREATE POLICY "Service role full access contacts" ON contacts FOR ALL TO service_role USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Service role full access campaigns') THEN
    CREATE POLICY "Service role full access campaigns" ON campaigns FOR ALL TO service_role USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaign_sends' AND policyname = 'Service role full access campaign_sends') THEN
    CREATE POLICY "Service role full access campaign_sends" ON campaign_sends FOR ALL TO service_role USING (true);
  END IF;
END $$;
