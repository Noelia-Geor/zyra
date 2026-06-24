-- =============================================
-- ZYRA — Nuevos módulos: Facturación, Fichaje, Flujos
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- ─── FACTURACIÓN ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  contact_id    UUID REFERENCES contacts(id) ON DELETE SET NULL,

  -- Numeración
  number        TEXT NOT NULL,                          -- FAC-2026-001
  series        TEXT NOT NULL DEFAULT 'FAC',

  -- Emisor (snapshot en momento de creación)
  issuer_name   TEXT,
  issuer_nif    TEXT,
  issuer_address TEXT,

  -- Receptor
  client_name   TEXT NOT NULL,
  client_nif    TEXT,
  client_address TEXT,
  client_email  TEXT,

  -- Fechas
  issue_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date      DATE,

  -- Líneas (JSONB array)
  -- [{ description, quantity, unit_price, tax_rate, subtotal }]
  lines         JSONB NOT NULL DEFAULT '[]',

  -- Totales calculados
  subtotal      NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
  total         NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Estado
  status        TEXT NOT NULL DEFAULT 'borrador'
                CHECK (status IN ('borrador','enviada','pagada','vencida','cancelada')),

  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx  ON invoices(status);

-- ─── FICHAJE ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS time_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  clock_in      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clock_out     TIMESTAMPTZ,                            -- NULL = turno en curso
  duration_mins INTEGER,                               -- calculado al hacer clock_out

  notes         TEXT,
  project       TEXT,                                  -- etiqueta libre (proyecto/cliente)

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS time_entries_user_id_idx ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS time_entries_clock_in_idx ON time_entries(clock_in DESC);

-- ─── FLUJOS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS flows (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  flow_key      TEXT NOT NULL,  -- identificador del flujo pregrabado
  enabled       BOOLEAN NOT NULL DEFAULT false,

  -- Configuración específica del flujo (JSON libre)
  -- Ej: { "days_overdue": 15, "custom_message": "...", "send_to": "email" }
  config        JSONB NOT NULL DEFAULT '{}',

  last_run_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, flow_key)
);

CREATE INDEX IF NOT EXISTS flows_user_id_idx ON flows(user_id);

-- ─── Contador de facturas por usuario ──────────────────────────────────────
-- Permite numeración correlativa por usuario
CREATE TABLE IF NOT EXISTS invoice_counters (
  user_id       UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  last_number   INTEGER NOT NULL DEFAULT 0,
  year          INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER
);
