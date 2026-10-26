-- Embudo de admisión y convocatorias.
-- Aditivo e idempotente: se puede ejecutar más de una vez (Supabase → SQL Editor).
--
--   leads.status     pasa de new/contacted/won/lost a las etapas de admisión:
--                    new (nuevo) → admission (admisión) → call (llamada) → enrolled (matriculado) → paid (pagado)
--                    y lost (descartado). Los leads que ya existen se pasan a la etapa equivalente.
--   cohorts          convocatorias del máster: nombre, fecha de inicio y plazas.
--   leads.cohort_id  convocatoria a la que va cada lead (opcional).

CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  starts_at DATE NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0 CHECK (capacity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cohorts_owner_id ON cohorts(owner_id, starts_at);

ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohorts' AND policyname = 'Owners manage their own cohorts') THEN
    CREATE POLICY "Owners manage their own cohorts" ON cohorts FOR ALL TO authenticated
      USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohorts' AND policyname = 'Service role full access cohorts') THEN
    CREATE POLICY "Service role full access cohorts" ON cohorts FOR ALL TO service_role USING (true);
  END IF;
END $$;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_leads_cohort_id ON leads(cohort_id) WHERE cohort_id IS NOT NULL;

-- Quitar la restricción antigua de `status` (el nombre lo puso Postgres, así que se busca por su contenido)
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'leads'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE leads DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

-- Etapas antiguas → nuevas. Solo toca filas con valores antiguos, así que repetirlo no cambia nada.
--   contacted en una llamada (Realizada) → call · contacted en una solicitud (En seguimiento) → admission · won → enrolled
UPDATE leads SET status = 'call' WHERE status = 'contacted' AND kind = 'call';
UPDATE leads SET status = 'admission' WHERE status = 'contacted';
UPDATE leads SET status = 'enrolled' WHERE status = 'won';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_status_check') THEN
    ALTER TABLE leads ADD CONSTRAINT leads_status_check
      CHECK (status IN ('new', 'admission', 'call', 'enrolled', 'paid', 'lost'));
  END IF;
END $$;
