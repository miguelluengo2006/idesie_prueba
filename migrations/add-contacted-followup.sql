-- Dos etapas nuevas en el embudo de leads: «contacted» (Contactado) y «followup» (Seguimiento).
-- Solo amplía la restricción de `status`; no cambia ninguna fila. Se puede ejecutar más de una vez.
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new', 'contacted', 'admission', 'call', 'followup', 'enrolled', 'paid', 'lost'));
