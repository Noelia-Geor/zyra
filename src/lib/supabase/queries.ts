import { createAdminClient } from './server'
import type { Contact, Transaction, Task, WellnessEntry, UserProfile, Improvement, Meeting, Workspace, WorkspaceMember, Invoice, TimeEntry, Flow, FlowKey, Quote } from '@/types'

// --- Perfil de usuario ---

export async function getUserProfile(clerkId: string): Promise<UserProfile | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_id', clerkId)
    .single()
  return data
}

export async function createUserProfile(data: {
  clerk_id: string
  email: string
  name: string
}) {
  const supabase = createAdminClient()
  return supabase.from('user_profiles').insert(data).select().single()
}

export async function updateUserProfile(id: string, updates: Partial<Pick<UserProfile, 'name' | 'apellidos' | 'phone' | 'company_id' | 'job_title' | 'avatar_url' | 'theme_color'>>) {
  const supabase = createAdminClient()
  return supabase.from('user_profiles').update(updates).eq('id', id)
}

// --- Reuniones ---

export async function getMeetings(userId: string): Promise<Meeting[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('meetings')
    .select('*')
    .eq('created_by', userId)
    .order('scheduled_at', { ascending: true })
  return data ?? []
}

export async function createMeeting(meeting: Omit<Meeting, 'id' | 'created_at'>) {
  const supabase = createAdminClient()
  return supabase.from('meetings').insert(meeting).select().single()
}

export async function updateMeetingStatus(id: string, status: Meeting['status']) {
  const supabase = createAdminClient()
  return supabase.from('meetings').update({ status }).eq('id', id)
}

export async function deleteMeeting(id: string) {
  const supabase = createAdminClient()
  return supabase.from('meetings').delete().eq('id', id)
}

// --- Contactos ---

export async function getContacts(userId: string): Promise<Contact[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function createContact(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createAdminClient()
  return supabase.from('contacts').insert(contact).select().single()
}

export async function updateContact(id: string, updates: Partial<Contact>) {
  const supabase = createAdminClient()
  return supabase.from('contacts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function deleteContact(id: string) {
  const supabase = createAdminClient()
  return supabase.from('contacts').delete().eq('id', id)
}

// --- Transacciones ---

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  return data ?? []
}

export async function createTransaction(tx: Omit<Transaction, 'id' | 'created_at'>) {
  const supabase = createAdminClient()
  return supabase.from('transactions').insert(tx).select().single()
}

export async function deleteTransaction(id: string) {
  const supabase = createAdminClient()
  return supabase.from('transactions').delete().eq('id', id)
}

// --- Tareas ---

export async function getTasks(userId: string): Promise<Task[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createAdminClient()
  return supabase.from('tasks').insert(task).select().single()
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const supabase = createAdminClient()
  return supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function deleteTask(id: string) {
  const supabase = createAdminClient()
  return supabase.from('tasks').delete().eq('id', id)
}

// --- Bienestar ---

export async function getWellnessEntries(userId: string): Promise<WellnessEntry[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('wellness_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(30)
  return data ?? []
}

export async function upsertWellnessEntry(entry: Omit<WellnessEntry, 'id' | 'created_at'>) {
  const supabase = createAdminClient()
  return supabase
    .from('wellness_entries')
    .upsert(entry, { onConflict: 'user_id,date' })
    .select()
    .single()
}

// --- Mejora continua (anónimas) ---

export async function getImprovements(): Promise<Improvement[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('improvements')
    .select('id, category, area, description, impact, status, created_at')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function createImprovement(improvement: Pick<Improvement, 'category' | 'area' | 'description' | 'impact'>) {
  const supabase = createAdminClient()
  return supabase
    .from('improvements')
    .insert({ ...improvement, status: 'recibida' })
    .select('id, category, area, description, impact, status, created_at')
    .single()
}

// --- Workspace ---

export async function getWorkspaceByOwner(ownerId: string): Promise<Workspace | null> {
  const supabase = createAdminClient()
  const { data } = await supabase.from('workspaces').select('*').eq('owner_id', ownerId).single()
  return data
}

export async function createWorkspace(name: string, ownerId: string): Promise<Workspace> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('workspaces').insert({ name, owner_id: ownerId }).select().single()
  if (error || !data) throw new Error('Error creando workspace')
  return data
}

export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('workspace_members')
    .select('*, user_profiles(name, avatar_url)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true })
  if (!data) return []
  return data.map((m: any) => ({
    ...m,
    profile_name: m.user_profiles?.name ?? null,
    profile_avatar: m.user_profiles?.avatar_url ?? null,
  }))
}

export async function inviteMember(workspaceId: string, email: string, permissions: WorkspaceMember['permissions']): Promise<WorkspaceMember> {
  const supabase = createAdminClient()
  // Link user_id if already registered
  const { data: existing } = await supabase.from('user_profiles').select('id').eq('email', email).single()
  const { data, error } = await supabase
    .from('workspace_members')
    .insert({ workspace_id: workspaceId, invited_email: email, user_id: existing?.id ?? null, status: existing ? 'active' : 'pending', permissions })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Error al invitar')
  return data
}

export async function updateMemberPermissions(memberId: string, permissions: WorkspaceMember['permissions']) {
  const supabase = createAdminClient()
  return supabase.from('workspace_members').update({ permissions }).eq('id', memberId)
}

export async function removeMember(memberId: string) {
  const supabase = createAdminClient()
  return supabase.from('workspace_members').delete().eq('id', memberId)
}

export async function getMemberPermissions(userEmail: string): Promise<WorkspaceMember['permissions'] | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('workspace_members')
    .select('permissions')
    .eq('invited_email', userEmail)
    .eq('status', 'active')
    .single()
  return data?.permissions ?? null
}

export async function updateImprovementStatus(id: string, status: Improvement['status']) {
  const supabase = createAdminClient()
  return supabase.from('improvements').update({ status }).eq('id', id)
}

// --- Facturación ---

export async function getInvoices(userId: string): Promise<Invoice[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Invoice[]
}

export async function getInvoice(id: string, userId: string): Promise<Invoice | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  return data as Invoice | null
}

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('invoices').insert(invoice).select().single()
  if (error || !data) throw new Error(error?.message ?? 'Error creando factura')
  return data as Invoice
}

export async function updateInvoice(id: string, userId: string, updates: Partial<Invoice>) {
  const supabase = createAdminClient()
  return supabase.from('invoices').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId)
}

export async function deleteInvoice(id: string, userId: string) {
  const supabase = createAdminClient()
  return supabase.from('invoices').delete().eq('id', id).eq('user_id', userId)
}

export async function getNextInvoiceNumber(userId: string): Promise<string> {
  const supabase = createAdminClient()
  const year = new Date().getFullYear()
  // Upsert counter
  const { data } = await supabase
    .from('invoice_counters')
    .select('last_number, year')
    .eq('user_id', userId)
    .single()
  let next = 1
  if (data) {
    next = data.year === year ? data.last_number + 1 : 1
  }
  await supabase
    .from('invoice_counters')
    .upsert({ user_id: userId, last_number: next, year }, { onConflict: 'user_id' })
  return `FAC-${year}-${String(next).padStart(3, '0')}`
}

// --- Fichaje ---

export async function getTimeEntries(userId: string, limit = 50): Promise<TimeEntry[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .order('clock_in', { ascending: false })
    .limit(limit)
  return (data ?? []) as TimeEntry[]
}

export async function getActiveTimeEntry(userId: string): Promise<TimeEntry | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .is('clock_out', null)
    .single()
  return data as TimeEntry | null
}

export async function clockIn(userId: string, project?: string, notes?: string): Promise<TimeEntry> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('time_entries')
    .insert({ user_id: userId, project: project ?? null, notes: notes ?? null })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Error al fichar entrada')
  return data as TimeEntry
}

export async function clockOut(entryId: string, userId: string): Promise<TimeEntry> {
  const supabase = createAdminClient()
  const now = new Date().toISOString()
  // Get entry to calculate duration
  const { data: entry } = await supabase.from('time_entries').select('clock_in').eq('id', entryId).single()
  const durationMins = entry
    ? Math.round((new Date(now).getTime() - new Date(entry.clock_in).getTime()) / 60000)
    : null
  const { data, error } = await supabase
    .from('time_entries')
    .update({ clock_out: now, duration_mins: durationMins })
    .eq('id', entryId)
    .eq('user_id', userId)
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Error al fichar salida')
  return data as TimeEntry
}

// --- Flujos ---

export async function getFlows(userId: string): Promise<Flow[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('flows')
    .select('*')
    .eq('user_id', userId)
  return (data ?? []) as Flow[]
}

// --- Presupuestos ---

export async function getQuotes(userId: string): Promise<Quote[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('quotes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Quote[]
}

export async function createQuote(quote: Omit<Quote, 'id' | 'created_at' | 'updated_at'>): Promise<Quote> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('quotes').insert(quote).select().single()
  if (error || !data) throw new Error(error?.message ?? 'Error creando presupuesto')
  return data as Quote
}

export async function updateQuote(id: string, userId: string, updates: Partial<Quote>) {
  const supabase = createAdminClient()
  return supabase.from('quotes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId)
}

export async function deleteQuote(id: string, userId: string) {
  const supabase = createAdminClient()
  return supabase.from('quotes').delete().eq('id', id).eq('user_id', userId)
}

export async function getNextQuoteNumber(userId: string): Promise<string> {
  const supabase = createAdminClient()
  const year = new Date().getFullYear()
  const { data } = await supabase.from('quote_counters').select('last_number, year').eq('user_id', userId).single()
  let next = 1
  if (data) { next = data.year === year ? data.last_number + 1 : 1 }
  await supabase.from('quote_counters').upsert({ user_id: userId, last_number: next, year }, { onConflict: 'user_id' })
  return `PRE-${year}-${String(next).padStart(3, '0')}`
}

export async function upsertFlow(userId: string, flowKey: FlowKey, enabled: boolean, config: Record<string, unknown>) {
  const supabase = createAdminClient()
  return supabase
    .from('flows')
    .upsert({ user_id: userId, flow_key: flowKey, enabled, config, updated_at: new Date().toISOString() }, { onConflict: 'user_id,flow_key' })
}

// --- Pipeline CRM ---

export async function updateContactPipeline(id: string, userId: string, stage: string, value?: number) {
  const supabase = createAdminClient()
  return supabase
    .from('contacts')
    .update({ pipeline_stage: stage, pipeline_value: value ?? 0, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
}

// --- Resumen fiscal ---

export async function getInvoicesForFiscal(userId: string, year: number): Promise<Invoice[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .gte('issue_date', `${year}-01-01`)
    .lte('issue_date', `${year}-12-31`)
    .neq('status', 'cancelada')
    .neq('status', 'borrador')
    .order('issue_date', { ascending: true })
  return (data ?? []) as Invoice[]
}

export async function getTransactionsForFiscal(userId: string, year: number): Promise<Transaction[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
    .order('date', { ascending: true })
  return data ?? []
}

// --- Informe rentabilidad ---

export async function getInvoicesByContact(userId: string): Promise<{ contact_id: string | null; client_name: string; total: number; count: number }[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('invoices')
    .select('contact_id, client_name, total')
    .eq('user_id', userId)
    .eq('status', 'pagada')
  if (!data) return []
  const map = new Map<string, { client_name: string; total: number; count: number }>()
  for (const inv of data) {
    const key = inv.contact_id ?? inv.client_name
    const existing = map.get(key)
    if (existing) { existing.total += Number(inv.total); existing.count++ }
    else map.set(key, { client_name: inv.client_name, total: Number(inv.total), count: 1 })
  }
  return Array.from(map.entries()).map(([contact_id, v]) => ({ contact_id, ...v })).sort((a, b) => b.total - a.total)
}

// --- Portal cliente (público, sin auth) ---

export async function getContactByPortalToken(token: string): Promise<Contact | null> {
  const supabase = createAdminClient()
  const { data } = await supabase.from('contacts').select('*').eq('portal_token', token).single()
  return data as Contact | null
}

export async function getInvoicesForPortal(contactId: string): Promise<Invoice[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('contact_id', contactId)
    .neq('status', 'borrador')
    .order('issue_date', { ascending: false })
  return (data ?? []) as Invoice[]
}

export async function getQuotesForPortal(contactId: string): Promise<Quote[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('quotes')
    .select('*')
    .eq('contact_id', contactId)
    .neq('status', 'borrador')
    .order('issue_date', { ascending: false })
  return (data ?? []) as Quote[]
}
