"use server"

import { auth } from "@clerk/nextjs/server"
import { getUserProfile, getNextQuoteNumber, createQuote, updateQuote, deleteQuote, createInvoice, getNextInvoiceNumber } from "@/lib/supabase/queries"
import type { Quote, InvoiceLine } from "@/types"

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

export async function saveQuote(data: {
  id?: string
  contact_id?: string | null
  client_name: string
  client_nif?: string
  client_address?: string
  client_email?: string
  issue_date: string
  valid_until?: string
  lines: InvoiceLine[]
  notes?: string
  status?: Quote['status']
}) {
  const profile = await getProfile()
  const { subtotal, tax_amount, total } = calcTotals(data.lines)
  const lines = data.lines.map(l => ({ ...l, subtotal: +(l.quantity * l.unit_price).toFixed(2) }))

  if (data.id) {
    const { error } = await updateQuote(data.id, profile.id, {
      contact_id: data.contact_id ?? null,
      client_name: data.client_name,
      client_nif: data.client_nif ?? null,
      client_address: data.client_address ?? null,
      client_email: data.client_email ?? null,
      issue_date: data.issue_date,
      valid_until: data.valid_until ?? null,
      lines, subtotal, tax_amount, total,
      notes: data.notes ?? null,
      status: data.status ?? 'borrador',
    })
    if (error) throw new Error(error.message)
    return { success: true }
  }

  const number = await getNextQuoteNumber(profile.id)
  await createQuote({
    user_id: profile.id,
    contact_id: data.contact_id ?? null,
    number,
    client_name: data.client_name,
    client_nif: data.client_nif ?? null,
    client_address: data.client_address ?? null,
    client_email: data.client_email ?? null,
    issue_date: data.issue_date,
    valid_until: data.valid_until ?? null,
    lines, subtotal, tax_amount, total,
    notes: data.notes ?? null,
    status: 'borrador',
    invoice_id: null,
  })
  return { success: true }
}

export async function changeQuoteStatus(id: string, status: Quote['status']) {
  const profile = await getProfile()
  const { error } = await updateQuote(id, profile.id, { status })
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function convertQuoteToInvoice(quote: Quote) {
  const profile = await getProfile()
  const number = await getNextInvoiceNumber(profile.id)
  const invoice = await createInvoice({
    user_id: profile.id,
    contact_id: quote.contact_id,
    number,
    series: 'FAC',
    issuer_name: profile.name ?? null,
    issuer_nif: profile.company_id ?? null,
    issuer_address: null,
    client_name: quote.client_name,
    client_nif: quote.client_nif,
    client_address: quote.client_address,
    client_email: quote.client_email,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: null,
    lines: quote.lines,
    subtotal: quote.subtotal,
    tax_amount: quote.tax_amount,
    total: quote.total,
    notes: quote.notes,
    status: 'borrador',
    is_recurring: false,
    recurrence_interval: null,
    recurrence_next_date: null,
    payment_link: null,
  })
  // Marcar presupuesto como aceptado y enlazarlo
  await updateQuote(quote.id, profile.id, { status: 'aceptado', invoice_id: invoice.id })
  return { invoiceId: invoice.id }
}

export async function removeQuote(id: string) {
  const profile = await getProfile()
  const { error } = await deleteQuote(id, profile.id)
  if (error) throw new Error(error.message)
  return { success: true }
}
