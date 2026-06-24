-- ─── Pipeline CRM ───────────────────────────────────────────────────────────
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'lead'
  CHECK (pipeline_stage IN ('lead','contactado','propuesta','negociacion','cerrado_ganado','cerrado_perdido'));
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS pipeline_value numeric(12,2) DEFAULT 0;

-- ─── Facturas recurrentes ────────────────────────────────────────────────────
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurrence_interval text
  CHECK (recurrence_interval IN ('mensual','trimestral','anual'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurrence_next_date date;

-- ─── Portal cliente (token público por contacto) ─────────────────────────────
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS portal_token uuid DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS contacts_portal_token_idx ON contacts(portal_token);

-- ─── Recibos / foto de ticket en transacciones ───────────────────────────────
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS receipt_url text;

-- ─── Storage bucket para recibos (ejecutar si no existe) ────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false)
-- ON CONFLICT (id) DO NOTHING;
