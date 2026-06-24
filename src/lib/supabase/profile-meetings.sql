-- Ejecutar en Supabase SQL Editor

-- 1. Añadir columnas al perfil
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS apellidos   TEXT,
  ADD COLUMN IF NOT EXISTS phone       TEXT,
  ADD COLUMN IF NOT EXISTS company_id  TEXT,
  ADD COLUMN IF NOT EXISTS job_title   TEXT;

-- 2. Tabla de reuniones
CREATE TABLE IF NOT EXISTS meetings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  daily_room_url   TEXT,
  daily_room_name  TEXT,
  created_by       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'programada'
                   CHECK (status IN ('programada','en_curso','finalizada','cancelada')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
