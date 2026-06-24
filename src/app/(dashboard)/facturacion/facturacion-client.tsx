"use client"

import { useState, useTransition } from "react"
import {
  FileText, Plus, Download, Send, CheckCircle, Clock, XCircle,
  AlertCircle, Trash2, ChevronDown, ChevronUp, Eye, Search, ArrowDownToLine,
  Repeat, Copy, Link, TimerIcon
} from "lucide-react"
import { exportInvoices } from "@/lib/export"
import { Card } from "@/components/ui/card"
import { MobileHeader } from "@/components/layout/mobile-header"
import { toast } from "sonner"
import { saveInvoice, changeInvoiceStatus, removeInvoice } from "@/app/actions/invoices"
import type { Invoice, InvoiceLine, Contact, UserProfile, TimeEntry } from "@/types"
import { UpgradeModal } from "@/components/ui/upgrade-modal"

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<Invoice['status'], { label: string; color: string; icon: React.ReactNode }> = {
  borrador:  { label: "Borrador",  color: "bg-gray-100 text-gray-600",        icon: <Clock className="h-3 w-3" /> },
  enviada:   { label: "Enviada",   color: "bg-blue-50 text-blue-600",         icon: <Send className="h-3 w-3" /> },
  pagada:    { label: "Pagada",    color: "bg-[#EAF5EF] text-[#3A6A54]",     icon: <CheckCircle className="h-3 w-3" /> },
  vencida:   { label: "Vencida",   color: "bg-red-50 text-red-600",           icon: <AlertCircle className="h-3 w-3" /> },
  cancelada: { label: "Cancelada", color: "bg-orange-50 text-orange-600",     icon: <XCircle className="h-3 w-3" /> },
}

const EMPTY_LINE: InvoiceLine = { description: "", quantity: 1, unit_price: 0, tax_rate: 21, subtotal: 0 }

function fmt(n: number) { return n.toLocaleString("es-ES", { minimumFractionDigits: 2 }) + " €" }

function calcLines(lines: InvoiceLine[]) {
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unit_price, 0)
  const tax = lines.reduce((s, l) => s + l.quantity * l.unit_price * (l.tax_rate / 100), 0)
  return { subtotal, tax, total: subtotal + tax }
}

// ─── PDF simple via print ────────────────────────────────────────────────────

function printInvoice(inv: Invoice, profile: UserProfile) {
  const { subtotal, tax, total } = calcLines(inv.lines)
  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Factura ${inv.number}</title>
<style>
  body { font-family: Arial, sans-serif; color: #222; margin: 40px; font-size: 13px; }
  h1 { color: #3A6A54; font-size: 22px; margin-bottom: 4px; }
  .meta { color: #666; font-size: 12px; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
  .label { font-weight: 600; font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #EAF5EF; padding: 8px 10px; text-align: left; font-size: 12px; }
  td { padding: 8px 10px; border-bottom: 1px solid #eee; }
  .right { text-align: right; }
  .totals { margin-left: auto; width: 240px; }
  .total-row { display: flex; justify-content: space-between; padding: 4px 0; }
  .total-final { font-weight: 700; font-size: 16px; border-top: 2px solid #3A6A54; margin-top: 8px; padding-top: 8px; }
  @media print { body { margin: 20px; } }
</style></head><body>
<h1>${inv.number}</h1>
<div class="meta">Fecha emisión: ${inv.issue_date}${inv.due_date ? ' · Vencimiento: ' + inv.due_date : ''}</div>
<div class="grid">
  <div>
    <div class="label">Emisor</div>
    <strong>${profile.name ?? '—'}</strong><br/>
    ${profile.company_id ? 'NIF/CIF: ' + profile.company_id + '<br/>' : ''}
  </div>
  <div>
    <div class="label">Cliente</div>
    <strong>${inv.client_name}</strong><br/>
    ${inv.client_nif ? 'NIF/CIF: ' + inv.client_nif + '<br/>' : ''}
    ${inv.client_address ? inv.client_address + '<br/>' : ''}
    ${inv.client_email ? inv.client_email : ''}
  </div>
</div>
<table>
  <thead><tr><th>Descripción</th><th class="right">Cantidad</th><th class="right">Precio unit.</th><th class="right">IVA %</th><th class="right">Subtotal</th></tr></thead>
  <tbody>
    ${inv.lines.map(l => `<tr><td>${l.description}</td><td class="right">${l.quantity}</td><td class="right">${fmt(l.unit_price)}</td><td class="right">${l.tax_rate}%</td><td class="right">${fmt(l.quantity * l.unit_price)}</td></tr>`).join('')}
  </tbody>
</table>
<div class="totals">
  <div class="total-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
  <div class="total-row"><span>IVA</span><span>${fmt(tax)}</span></div>
  <div class="total-row total-final"><span>TOTAL</span><span>${fmt(total)}</span></div>
</div>
${inv.notes ? '<p style="margin-top:24px;color:#666;font-size:12px;"><strong>Notas:</strong> ' + inv.notes + '</p>' : ''}
</body></html>`
  const w = window.open("", "_blank")
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.print()
}

// ─── Invoice Form ────────────────────────────────────────────────────────────

type FormData = {
  id?: string
  client_name: string; client_nif: string; client_address: string; client_email: string
  issue_date: string; due_date: string; notes: string; status: Invoice['status']
  lines: InvoiceLine[]
  is_recurring: boolean
  recurrence_interval: string
}

function InvoiceForm({ initial, contacts, timeEntries, onClose, onSaved }: {
  initial?: Invoice
  contacts: Contact[]
  timeEntries: TimeEntry[]
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<FormData>({
    id: initial?.id,
    client_name: initial?.client_name ?? "",
    client_nif: initial?.client_nif ?? "",
    client_address: initial?.client_address ?? "",
    client_email: initial?.client_email ?? "",
    issue_date: initial?.issue_date ?? new Date().toISOString().split("T")[0],
    due_date: initial?.due_date ?? "",
    notes: initial?.notes ?? "",
    status: initial?.status ?? "borrador",
    lines: initial?.lines?.length ? initial.lines : [{ ...EMPTY_LINE }],
    is_recurring: initial?.is_recurring ?? false,
    recurrence_interval: initial?.recurrence_interval ?? "mensual",
  })
  const [showTimeImport, setShowTimeImport] = useState(false)
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])
  const [isPending, start] = useTransition()

  const { subtotal, tax, total } = calcLines(form.lines)

  function setLine(i: number, field: keyof InvoiceLine, val: string | number) {
    setForm(f => {
      const lines = [...f.lines]
      lines[i] = { ...lines[i], [field]: typeof val === "string" ? val : Number(val) }
      return { ...f, lines }
    })
  }

  function addLine() { setForm(f => ({ ...f, lines: [...f.lines, { ...EMPTY_LINE }] })) }
  function removeLine(i: number) {
    setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }))
  }

  function importFromTime() {
    const entries = timeEntries.filter(e => selectedEntries.includes(e.id) && e.duration_mins)
    if (entries.length === 0) return
    const lines: InvoiceLine[] = entries.map(e => ({
      description: e.project ? `${e.project} · ${new Date(e.clock_in).toLocaleDateString("es-ES")}` : `Trabajo · ${new Date(e.clock_in).toLocaleDateString("es-ES")}`,
      quantity: parseFloat(((e.duration_mins ?? 0) / 60).toFixed(2)),
      unit_price: 50,
      tax_rate: 21,
      subtotal: 0,
    }))
    setForm(f => ({ ...f, lines: [...f.lines.filter(l => l.description), ...lines] }))
    setSelectedEntries([])
    setShowTimeImport(false)
    toast.success(`${lines.length} entrada${lines.length !== 1 ? "s" : ""} importada${lines.length !== 1 ? "s" : ""}`)
  }

  function fillFromContact(id: string) {
    const c = contacts.find(c => c.id === id)
    if (!c) return
    setForm(f => ({
      ...f,
      client_name: c.name,
      client_email: c.email ?? "",
    }))
  }

  function handleSave() {
    if (!form.client_name.trim()) { toast.error("El nombre del cliente es obligatorio"); return }
    if (form.lines.length === 0) { toast.error("Añade al menos una línea"); return }
    start(async () => {
      try {
        await saveInvoice({
          id: form.id,
          client_name: form.client_name,
          client_nif: form.client_nif,
          client_address: form.client_address,
          client_email: form.client_email,
          issue_date: form.issue_date,
          due_date: form.due_date || undefined,
          lines: form.lines,
          notes: form.notes,
          status: form.status,
          is_recurring: form.is_recurring,
          recurrence_interval: form.is_recurring ? form.recurrence_interval : null,
        })
        toast.success(form.id ? "Factura actualizada" : "Factura creada")
        onSaved()
      } catch (e: any) {
        toast.error(e.message)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-[#CAE8D8] flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-[#2D5C44]">{form.id ? "Editar factura" : "Nueva factura"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-5">

          {/* Rellenar desde contacto */}
          {contacts.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Rellenar desde contacto</label>
              <select onChange={e => fillFromContact(e.target.value)} defaultValue=""
                className="w-full px-3 py-2.5 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]">
                <option value="">— Selecciona un contacto —</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
              </select>
            </div>
          )}

          {/* Datos cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#4A6355] mb-1 block">Nombre cliente *</label>
              <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]"
                placeholder="Empresa S.L." />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#4A6355] mb-1 block">NIF / CIF cliente</label>
              <input value={form.client_nif} onChange={e => setForm(f => ({ ...f, client_nif: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]"
                placeholder="B12345678" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#4A6355] mb-1 block">Email cliente</label>
              <input value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
                type="email"
                className="w-full px-3 py-2.5 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]"
                placeholder="cliente@empresa.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#4A6355] mb-1 block">Dirección cliente</label>
              <input value={form.client_address} onChange={e => setForm(f => ({ ...f, client_address: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]"
                placeholder="Calle Mayor 1, Madrid" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#4A6355] mb-1 block">Fecha emisión</label>
              <input value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))}
                type="date"
                className="w-full px-3 py-2.5 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#4A6355] mb-1 block">Fecha vencimiento</label>
              <input value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                type="date"
                className="w-full px-3 py-2.5 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]" />
            </div>
          </div>

          {/* Líneas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#4A6355]">Líneas de factura</label>
              <button onClick={addLine}
                className="text-xs text-[#A8CEBA] font-semibold hover:text-[#3A6A54] flex items-center gap-1">
                <Plus className="h-3 w-3" /> Añadir línea
              </button>
            </div>
            <div className="space-y-2">
              {form.lines.map((line, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center bg-[#F4FAF7] rounded-xl p-2">
                  <div className="col-span-5">
                    <input value={line.description} onChange={e => setLine(i, "description", e.target.value)}
                      placeholder="Descripción del servicio"
                      className="w-full px-2 py-1.5 text-sm border border-[#CAE8D8] rounded-lg focus:outline-none bg-white" />
                  </div>
                  <div className="col-span-2">
                    <input value={line.quantity} onChange={e => setLine(i, "quantity", e.target.value)}
                      type="number" min="0" step="0.01" placeholder="Cant."
                      className="w-full px-2 py-1.5 text-sm border border-[#CAE8D8] rounded-lg focus:outline-none bg-white" />
                  </div>
                  <div className="col-span-2">
                    <input value={line.unit_price} onChange={e => setLine(i, "unit_price", e.target.value)}
                      type="number" min="0" step="0.01" placeholder="€"
                      className="w-full px-2 py-1.5 text-sm border border-[#CAE8D8] rounded-lg focus:outline-none bg-white" />
                  </div>
                  <div className="col-span-2">
                    <select value={line.tax_rate} onChange={e => setLine(i, "tax_rate", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-[#CAE8D8] rounded-lg focus:outline-none bg-white">
                      <option value={0}>0%</option>
                      <option value={4}>4%</option>
                      <option value={10}>10%</option>
                      <option value={21}>21%</option>
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {form.lines.length > 1 && (
                      <button onClick={() => removeLine(i)} className="text-red-300 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="bg-[#F4FAF7] rounded-xl p-4 space-y-1.5">
            <div className="flex justify-between text-sm text-[#4A6355]">
              <span>Subtotal</span><span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#4A6355]">
              <span>IVA</span><span>{fmt(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-[#2D5C44] border-t border-[#CAE8D8] pt-2 mt-2">
              <span>TOTAL</span><span>{fmt(total)}</span>
            </div>
          </div>

          {/* Importar desde fichaje */}
          {timeEntries.filter(e => e.duration_mins).length > 0 && (
            <div>
              <button type="button" onClick={() => setShowTimeImport(v => !v)}
                className="flex items-center gap-2 text-xs text-[#4A6355] font-medium hover:text-[#2D5C44] border border-[#CAE8D8] px-3 py-2 rounded-lg bg-white transition-colors">
                <TimerIcon className="h-3.5 w-3.5" /> Importar horas de fichaje
              </button>
              {showTimeImport && (
                <div className="mt-2 border border-[#CAE8D8] rounded-xl overflow-hidden">
                  <div className="bg-[#F4FAF7] px-3 py-2 text-xs font-semibold text-[#4A6355]">Selecciona entradas a importar</div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-[#CAE8D8]">
                    {timeEntries.filter(e => e.duration_mins).slice(0, 30).map(e => {
                      const h = Math.floor((e.duration_mins ?? 0) / 60), m = (e.duration_mins ?? 0) % 60
                      return (
                        <label key={e.id} className="flex items-center gap-2 px-3 py-2 hover:bg-[#F4FAF7] cursor-pointer">
                          <input type="checkbox" checked={selectedEntries.includes(e.id)}
                            onChange={ev => setSelectedEntries(prev => ev.target.checked ? [...prev, e.id] : prev.filter(id => id !== e.id))} />
                          <span className="text-xs text-[#2D5C44]">{new Date(e.clock_in).toLocaleDateString("es-ES")} · {e.project ?? "Sin proyecto"}</span>
                          <span className="text-xs text-[#6B8C7A] ml-auto">{h}h {m}m</span>
                        </label>
                      )
                    })}
                  </div>
                  <div className="px-3 py-2 bg-[#F4FAF7] flex justify-end">
                    <button type="button" onClick={importFromTime} disabled={selectedEntries.length === 0}
                      className="text-xs px-3 py-1.5 bg-[#A8CEBA] text-white rounded-lg hover:bg-[#90BBAA] disabled:opacity-40 transition-colors">
                      Importar {selectedEntries.length > 0 ? `(${selectedEntries.length})` : ""}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recurrente */}
          <div className="flex items-center justify-between p-3 border border-[#CAE8D8] rounded-xl">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-[#6B8C7A]" />
              <span className="text-sm font-medium text-[#2D5C44]">Factura recurrente</span>
            </div>
            <div className="flex items-center gap-2">
              {form.is_recurring && (
                <select value={form.recurrence_interval} onChange={e => setForm(f => ({ ...f, recurrence_interval: e.target.value }))}
                  className="text-xs border border-[#CAE8D8] rounded-lg px-2 py-1 bg-white focus:outline-none">
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="anual">Anual</option>
                </select>
              )}
              <button type="button" onClick={() => setForm(f => ({ ...f, is_recurring: !f.is_recurring }))}
                className={`w-10 h-5 rounded-full transition-colors relative ${form.is_recurring ? "bg-[#A8CEBA]" : "bg-gray-200"}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_recurring ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="text-xs font-semibold text-[#4A6355] mb-1 block">Notas (opcional)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2.5 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA] resize-none"
              placeholder="Condiciones de pago, observaciones..." />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 text-sm font-medium text-[#4A6355] border border-[#CAE8D8] rounded-xl hover:bg-[#F4FAF7] transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={isPending}
              className="flex-1 py-3 text-sm font-semibold bg-[#A8CEBA] text-white rounded-xl hover:bg-[#90BBAA] disabled:opacity-50 transition-colors">
              {isPending ? "Guardando..." : form.id ? "Guardar cambios" : "Crear factura"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Invoice Card ────────────────────────────────────────────────────────────

function InvoiceCard({ inv, profile, contacts, timeEntries, onRefresh }: {
  inv: Invoice; profile: UserProfile; contacts: Contact[]; timeEntries: TimeEntry[]; onRefresh: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [isPending, start] = useTransition()
  const s = STATUS_MAP[inv.status]

  function handleStatus(status: Invoice['status']) {
    start(async () => {
      try {
        await changeInvoiceStatus(inv.id, status)
        toast.success("Estado actualizado")
        onRefresh()
      } catch (e: any) { toast.error(e.message) }
    })
  }

  function handleDelete() {
    if (!confirm("¿Eliminar esta factura? Esta acción no se puede deshacer.")) return
    start(async () => {
      try {
        await removeInvoice(inv.id)
        toast.success("Factura eliminada")
        onRefresh()
      } catch (e: any) { toast.error(e.message) }
    })
  }

  return (
    <>
      {editing && (
        <InvoiceForm
          initial={inv}
          contacts={contacts}
          timeEntries={timeEntries}
          onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); onRefresh() }}
        />
      )}
      <Card className="border-[#CAE8D8] bg-white overflow-hidden">
        <div className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#EAF5EF] flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-[#A8CEBA]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-[#2D5C44]">{inv.number}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                {s.icon}{s.label}
              </span>
              {inv.is_recurring && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-600">
                  <Repeat className="h-2.5 w-2.5" />{inv.recurrence_interval}
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B8C7A] truncate">{inv.client_name} · {inv.issue_date}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-sm text-[#2D5C44]">{fmt(inv.total)}</p>
            {inv.due_date && (
              <p className="text-xs text-[#6B8C7A]">Vence {inv.due_date}</p>
            )}
          </div>
          <button onClick={() => setExpanded(e => !e)} className="text-[#6B8C7A] hover:text-[#2D5C44] ml-1">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {expanded && (
          <div className="px-4 pb-4 border-t border-[#CAE8D8] pt-3 space-y-3">
            {/* Líneas */}
            <div className="text-xs space-y-1">
              {inv.lines.map((l, i) => (
                <div key={i} className="flex justify-between text-[#4A6355]">
                  <span>{l.description} × {l.quantity}</span>
                  <span>{fmt(l.quantity * l.unit_price)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-[#2D5C44] border-t border-[#CAE8D8] pt-1 mt-1">
                <span>Total</span><span>{fmt(inv.total)}</span>
              </div>
            </div>

            {/* Cambiar estado */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_MAP) as Invoice['status'][])
                .filter(s => s !== inv.status)
                .map(st => (
                  <button key={st} onClick={() => handleStatus(st)} disabled={isPending}
                    className="text-xs px-3 py-1.5 rounded-lg border border-[#CAE8D8] text-[#4A6355] hover:bg-[#EAF5EF] transition-colors disabled:opacity-50">
                    → {STATUS_MAP[st].label}
                  </button>
                ))}
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#EAF5EF] text-[#3A6A54] hover:bg-[#CAE8D8] transition-colors">
                <Eye className="h-3.5 w-3.5" /> Ver / Editar
              </button>
              <button onClick={() => printInvoice(inv, profile)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#EAF5EF] text-[#3A6A54] hover:bg-[#CAE8D8] transition-colors">
                <Download className="h-3.5 w-3.5" /> PDF / Imprimir
              </button>
              {(() => {
                const contact = contacts.find(c => c.id === inv.contact_id)
                const token = contact?.portal_token
                if (!token) return null
                const portalUrl = `${window.location.origin}/p/${token}`
                return (
                  <div className="flex items-center gap-1">
                    <a href={portalUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                      <Link className="h-3.5 w-3.5" /> Portal cliente
                    </a>
                    <button
                      onClick={() => { navigator.clipboard.writeText(portalUrl); toast.success("Enlace copiado") }}
                      className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Copiar enlace">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })()}
              <button onClick={handleDelete} disabled={isPending}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors ml-auto disabled:opacity-50">
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function FacturacionClient({ initialInvoices, contacts, profile, timeEntries }: {
  initialInvoices: Invoice[]
  contacts: Contact[]
  profile: UserProfile
  timeEntries: TimeEntry[]
}) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<Invoice['status'] | 'todas'>("todas")
  const [upgradeMsg, setUpgradeMsg] = useState("")

  async function refresh() {
    const res = await fetch("/facturacion", { cache: "no-store" })
    // Use router refresh instead
    window.location.reload()
  }

  const filtered = invoices.filter(inv => {
    const matchSearch = search === "" || inv.client_name.toLowerCase().includes(search.toLowerCase()) || inv.number.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "todas" || inv.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalPendiente = invoices.filter(i => i.status === 'enviada' || i.status === 'vencida').reduce((s, i) => s + i.total, 0)
  const totalCobrado   = invoices.filter(i => i.status === 'pagada').reduce((s, i) => s + i.total, 0)
  const totalVencidas  = invoices.filter(i => i.status === 'vencida').length

  return (
    <div>
      <UpgradeModal open={!!upgradeMsg} onClose={() => setUpgradeMsg("")} message={upgradeMsg} />
      <MobileHeader title="Facturación" />
      {showForm && (
        <InvoiceForm
          contacts={contacts}
          timeEntries={timeEntries}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); refresh() }}
        />
      )}

      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#A8CEBA]" />
            <h1 className="text-2xl font-bold text-[#2D5C44]">Facturación</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportInvoices(invoices)}
              className="flex items-center gap-2 px-3 py-2.5 border border-[#CAE8D8] text-[#4A6355] rounded-xl hover:bg-[#EAF5EF] text-sm font-medium transition-colors">
              <ArrowDownToLine className="h-4 w-4" /> Exportar CSV
            </button>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#A8CEBA] text-white rounded-xl hover:bg-[#90BBAA] transition-colors text-sm font-semibold">
              <Plus className="h-4 w-4" /> Nueva factura
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <Card className="p-3 border-[#CAE8D8] bg-white text-center">
            <p className="text-xs text-[#6B8C7A] mb-1">Por cobrar</p>
            <p className="font-bold text-[#2D5C44] text-sm">{fmt(totalPendiente)}</p>
          </Card>
          <Card className="p-3 border-[#CAE8D8] bg-white text-center">
            <p className="text-xs text-[#6B8C7A] mb-1">Cobrado</p>
            <p className="font-bold text-[#3A6A54] text-sm">{fmt(totalCobrado)}</p>
          </Card>
          <Card className={`p-3 border-[#CAE8D8] text-center ${totalVencidas > 0 ? 'bg-red-50' : 'bg-white'}`}>
            <p className="text-xs text-[#6B8C7A] mb-1">Vencidas</p>
            <p className={`font-bold text-sm ${totalVencidas > 0 ? 'text-red-600' : 'text-[#2D5C44]'}`}>{totalVencidas}</p>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B8C7A]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar factura o cliente..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none bg-white">
            <option value="todas">Todas</option>
            {(Object.keys(STATUS_MAP) as Invoice['status'][]).map(s => (
              <option key={s} value={s}>{STATUS_MAP[s].label}</option>
            ))}
          </select>
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <Card className="border-[#CAE8D8] bg-white p-10 text-center">
            <FileText className="h-10 w-10 text-[#CAE8D8] mx-auto mb-3" />
            <p className="text-sm text-[#6B8C7A]">
              {invoices.length === 0 ? "Aún no tienes facturas. ¡Crea la primera!" : "No hay facturas con ese filtro."}
            </p>
            {invoices.length === 0 && (
              <button onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-[#A8CEBA] text-white rounded-xl text-sm font-semibold hover:bg-[#90BBAA] transition-colors">
                + Nueva factura
              </button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(inv => (
              <InvoiceCard key={inv.id} inv={inv} profile={profile} contacts={contacts} timeEntries={timeEntries} onRefresh={refresh} />
            ))}
          </div>
        )}
      </div>

      {/* FAB mobile */}
      <button onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 md:hidden h-14 w-14 bg-[#A8CEBA] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#90BBAA] transition-colors z-40">
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
