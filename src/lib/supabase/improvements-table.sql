-- Ejecutar en Supabase SQL Editor
CREATE TABLE IF NOT EXISTS improvements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT NOT NULL CHECK (category IN ('procesos','comunicacion','herramientas','ambiente','formacion','otro')),
  area        TEXT NOT NULL,
  description TEXT NOT NULL,
  impact      TEXT NOT NULL CHECK (impact IN ('baja','media','alta')),
  status      TEXT NOT NULL DEFAULT 'recibida' CHECK (status IN ('recibida','en_revision','implementada','descartada')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
  -- NO se guarda user_id intencionalmente para garantizar anonimato
);

-- Sin RLS (tabla pública de sugerencias anónimas, acceso solo via service role)
ALTER TABLE improvements DISABLE ROW LEVEL SECURITY;
