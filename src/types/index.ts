export type Plan = 'free' | 'pro' | 'business'

export type BusinessType =
  | 'coach'
  | 'consultor'
  | 'freelancer'
  | 'agencia'
  | 'fotografo'
  | 'terapeuta'
  | 'otro'

export interface UserProfile {
  id: string
  clerk_id: string
  email: string
  name: string
  apellidos: string | null
  phone: string | null
  company_id: string | null       // número de identificación empresa (NIF/CIF)
  job_title: string | null
  avatar_url: string | null
  theme_color: ThemeColor | null
  business_type: BusinessType | null
  plan: Plan
  ai_credits_used: number
  ai_credits_limit: number
  created_at: string
}

export interface Meeting {
  id: string
  title: string
  description: string | null
  scheduled_at: string            // ISO datetime
  duration_minutes: number
  daily_room_url: string | null
  daily_room_name: string | null
  created_by: string              // user_profiles.id
  status: 'programada' | 'en_curso' | 'finalizada' | 'cancelada'
  created_at: string
}

export type PipelineStage = 'lead' | 'contactado' | 'propuesta' | 'negociacion' | 'cerrado_ganado' | 'cerrado_perdido'

export interface Contact {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  type: 'cliente' | 'lead' | 'proveedor' | 'colaborador' | 'otro'
  status: 'activo' | 'inactivo' | 'potencial'
  notes: string | null
  last_contact: string | null
  pipeline_stage: PipelineStage
  pipeline_value: number
  portal_token: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'ingreso' | 'gasto'
  amount: number
  currency: 'EUR'
  category: string
  description: string
  date: string
  contact_id: string | null
  receipt_url: string | null
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  status: 'pendiente' | 'en_progreso' | 'completada'
  priority: 'baja' | 'media' | 'alta'
  due_date: string | null
  contact_id: string | null
  created_at: string
  updated_at: string
}

export interface WellnessEntry {
  id: string
  user_id: string
  date: string
  energy_level: number // 1-5
  mood: number // 1-5
  notes: string | null
  created_at: string
}

export type ThemeColor = 'green' | 'lavender' | 'blue' | 'rose' | 'amber' | 'teal' | 'beige' | 'gray' | 'mono'

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string | null
  invited_email: string
  role: 'owner' | 'admin' | 'member'
  permissions: {
    dashboard: boolean
    contactos: boolean
    finanzas: boolean
    tareas: boolean
    bienestar: boolean
    reuniones: boolean
    mejoras: boolean
    facturacion: boolean
    presupuestos: boolean
    fichaje: boolean
    calendario: boolean
    flujos: boolean
    fiscal: boolean
    informes: boolean
  }
  status: 'pending' | 'active'
  created_at: string
  // joined from user_profiles
  profile_name?: string | null
  profile_avatar?: string | null
}

export interface Workspace {
  id: string
  name: string
  owner_id: string
  created_at: string
}

export interface Improvement {
  id: string
  category: 'procesos' | 'comunicacion' | 'herramientas' | 'ambiente' | 'formacion' | 'otro'
  area: string
  description: string
  impact: 'baja' | 'media' | 'alta'
  status: 'recibida' | 'en_revision' | 'implementada' | 'descartada'
  created_at: string
}

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
}

// Límites de IA por plan
export const AI_LIMITS: Record<Plan, number> = {
  free: 10,
  pro: 200,
  business: 1000,
}

// ─── FACTURACIÓN ────────────────────────────────────────────────────────────

export interface InvoiceLine {
  description: string
  quantity:    number
  unit_price:  number
  tax_rate:    number   // porcentaje, ej: 21
  subtotal:    number   // quantity * unit_price
}

export interface Invoice {
  id:                   string
  user_id:              string
  contact_id:           string | null
  number:               string
  series:               string
  issuer_name:          string | null
  issuer_nif:           string | null
  issuer_address:       string | null
  client_name:          string
  client_nif:           string | null
  client_address:       string | null
  client_email:         string | null
  issue_date:           string
  due_date:             string | null
  lines:                InvoiceLine[]
  subtotal:             number
  tax_amount:           number
  total:                number
  status:               'borrador' | 'enviada' | 'pagada' | 'vencida' | 'cancelada'
  notes:                string | null
  is_recurring:         boolean
  recurrence_interval:  string | null
  recurrence_next_date: string | null
  payment_link:         string | null
  created_at:           string
  updated_at:           string
}

// ─── PRESUPUESTOS ───────────────────────────────────────────────────────────

export interface Quote {
  id:             string
  user_id:        string
  contact_id:     string | null
  number:         string
  client_name:    string
  client_nif:     string | null
  client_address: string | null
  client_email:   string | null
  issue_date:     string
  valid_until:    string | null
  lines:          InvoiceLine[]
  subtotal:       number
  tax_amount:     number
  total:          number
  status:         'borrador' | 'enviado' | 'aceptado' | 'rechazado' | 'expirado'
  notes:          string | null
  invoice_id:     string | null
  created_at:     string
  updated_at:     string
}

// ─── FICHAJE ────────────────────────────────────────────────────────────────

export interface TimeEntry {
  id:            string
  user_id:       string
  clock_in:      string   // ISO
  clock_out:     string | null
  duration_mins: number | null
  notes:         string | null
  project:       string | null
  created_at:    string
}

// ─── FLUJOS ─────────────────────────────────────────────────────────────────

export type FlowKey =
  | 'welcome_email'
  | 'invoice_reminder'
  | 'contact_followup'
  | 'weekly_summary'
  | 'monthly_report'
  | 'task_overdue'
  | 'birthday_greeting'

export interface Flow {
  id:          string
  user_id:     string
  flow_key:    FlowKey
  enabled:     boolean
  config:      Record<string, unknown>
  last_run_at: string | null
  created_at:  string
  updated_at:  string
}
