-- =============================================
-- ZYRA — Tabla de Presupuestos
-- Ejecutar en Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS quotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,

  number          TEXT NOT NULL,          -- PRE-2026-001
  client_name     TEXT NOT NULL,
  client_nif      TEXT,
  client_address  TEXT,
  client_email    TEXT,

  issue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until     DATE,                   -- fecha de validez

  lines           JSONB NOT NULL DEFAULT '[]',
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,

  status          TEXT NOT NULL DEFAULT 'borrador'
                  CHECK (status IN ('borrador','enviado','aceptado','rechazado','expirado')),

  notes           TEXT,
  -- Si se convirtió a factura, guardamos el ID
  invoice_id      UUID REFERENCES invoices(id) ON DELETE SET NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quotes_user_id_idx ON quotes(user_id);

-- Contador de presupuestos (igual que facturas)
CREATE TABLE IF NOT EXISTS quote_counters (
  user_id     UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  last_number INTEGER NOT NULL DEFAULT 0,
  year        INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER
);
