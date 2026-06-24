"use server"

import { auth } from "@clerk/nextjs/server"
import { getUserProfile } from "@/lib/supabase/queries"
import {
  getInvoices, createInvoice, updateInvoice, deleteInvoice, getNextInvoiceNumber
} from "@/lib/supabase/queries"
import type { Invoice, InvoiceLine } from "@/types"
import { checkInvoiceLimit } from "@/lib/plan-gates"

async function getProfile() {
  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")
  const profile = await getUserProfile(userId)
  if (!profile) throw new Error("Perfil no encontrado")
  return profile
}

function calcTotals(lines: InvoiceLine[]) {
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unit_price, 0)
  const tax_amount = lines.reduce((s, l) => s + l.quantity * l.unit_price * (l.tax_rate / 100), 0)
  return { subtotal: +subtotal.toFixed(2), tax_amount: +tax_amount.toFixed(2), total: +(subtotal + tax_amount).toFixed(2) }
}

export async function saveInvoice(data: {
  id?: string
  contact_id?: string | null
  client_name: string
  client_nif?: string
  client_address?: string
  client_email?: string
  issue_date: string
  due_date?: string
  lines: InvoiceLine[]
  notes?: string
  status?: Invoice['status']
  is_recurring?: boolean
  recurrence_interval?: string | null
}) {
  const profile = await getProfile()
  const { subtotal, tax_amount, total } = calcTotals(data.lines)

  const lines = data.lines.map(l => ({
    ...l,
    subtotal: +(l.quantity * l.unit_price).toFixed(2),
  }))

  if (data.id) {
    const { error } = await updateInvoice(data.id, profile.id, {
      contact_id: data.contact_id ?? null,
      client_name: data.client_name,
      client_nif: data.client_nif ?? null,
      client_address: data.client_address ?? null,
      client_email: data.client_email ?? null,
      issue_date: data.issue_date,
      due_date: data.due_date ?? null,
      lines,
      subtotal,
      tax_amount,
      total,
      notes: data.notes ?? null,
      status: data.status ?? 'borrador',
    })
    if (error) throw new Error(error.message)
    return { success: true }
  }

  await checkInvoiceLimit(profile.id)
  const number = await getNextInvoiceNumber(profile.id)
  await createInvoice({
    user_id: profile.id,
    contact_id: data.contact_id ?? null,
    number,
    series: 'FAC',
    issuer_name: profile.name ?? null,
    issuer_nif: profile.company_id ?? null,
    issuer_address: null,
    client_name: data.client_name,
    client_nif: data.client_nif ?? null,
    client_address: data.client_address ?? null,
    client_email: data.client_email ?? null,
    issue_date: data.issue_date,
    due_date: data.due_date ?? null,
    lines,
    subtotal,
    tax_amount,
    total,
    notes: data.notes ?? null,
    status: 'borrador',
    is_recurring: data.is_recurring ?? false,
    recurrence_interval: data.recurrence_interval ?? null,
    recurrence_next_date: null,
    payment_link: null,
  })
  return { success: true }
}

export async function changeInvoiceStatus(id: string, status: Invoice['status']) {
  const profile = await getProfile()
  const { error } = await updateInvoice(id, profile.id, { status })
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function removeInvoice(id: string) {
  const profile = await getProfile()
  const { error } = await deleteInvoice(id, profile.id)
  if (error) throw new Error(error.message)
  return { success: true }
}
