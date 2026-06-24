-- Ejecutar en Supabase SQL Editor

-- Perfiles de usuario
create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text not null,
  name text not null,
  business_type text check (business_type in ('coach','consultor','freelancer','agencia','fotografo','terapeuta','otro')),
  plan text not null default 'free' check (plan in ('free','pro','business')),
  ai_credits_used integer not null default 0,
  ai_credits_limit integer not null default 10,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contactos (CRM)
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  company text,
  type text not null default 'cliente' check (type in ('cliente','lead','proveedor','colaborador','otro')),
  status text not null default 'activo' check (status in ('activo','inactivo','potencial')),
  notes text,
  last_contact timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Transacciones (Finanzas)
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  type text not null check (type in ('ingreso','gasto')),
  amount numeric(10,2) not null,
  currency text not null default 'EUR',
  category text not null,
  description text not null,
  date date not null,
  contact_id uuid references contacts(id) on delete set null,
  created_at timestamptz default now()
);

-- Tareas
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'pendiente' check (status in ('pendiente','en_progreso','completada')),
  priority text not null default 'media' check (priority in ('baja','media','alta')),
  due_date date,
  contact_id uuid references contacts(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bienestar
create table if not exists wellness_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  date date not null,
  energy_level integer not null check (energy_level between 1 and 5),
  mood integer not null check (mood between 1 and 5),
  notes text,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- Row Level Security (cada usuario solo ve sus datos)
alter table user_profiles enable row level security;
alter table contacts enable row level security;
alter table transactions enable row level security;
alter table tasks enable row level security;
alter table wellness_entries enable row level security;

-- Políticas RLS
create policy "users_own_profile" on user_profiles for all using (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');
create policy "users_own_contacts" on contacts for all using (user_id = (select id from user_profiles where clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
create policy "users_own_transactions" on transactions for all using (user_id = (select id from user_profiles where clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
create policy "users_own_tasks" on tasks for all using (user_id = (select id from user_profiles where clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
create policy "users_own_wellness" on wellness_entries for all using (user_id = (select id from user_profiles where clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Índices para queries frecuentes
create index if not exists idx_contacts_user_id on contacts(user_id);
create index if not exists idx_transactions_user_id on transactions(user_id);
create index if not exists idx_transactions_date on transactions(date);
create index if not exists idx_tasks_user_id on tasks(user_id);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_wellness_user_date on wellness_entries(user_id, date);
