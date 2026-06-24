-- Ejecutar en Supabase SQL Editor

-- 1. Color de tema en el perfil
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'green';

-- 2. Workspaces (empresa / equipo)
CREATE TABLE IF NOT EXISTS workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  owner_id    UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;

-- 3. Miembros del workspace con permisos
CREATE TABLE IF NOT EXISTS workspace_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  invited_email   TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  permissions     JSONB NOT NULL DEFAULT '{
    "dashboard":true,"contactos":true,"finanzas":false,
    "tareas":true,"bienestar":true,"reuniones":true,"mejoras":true
  }',
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, invited_email)
);
ALTER TABLE workspace_members DISABLE ROW LEVEL SECURITY;
