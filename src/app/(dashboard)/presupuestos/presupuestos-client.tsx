"use client"

import { useState, useTransition } from "react"
import {
  ClipboardList, Plus, Download, CheckCircle, XCircle, Clock,
  Send, Trash2, ChevronDown, ChevronUp, ArrowRight, FileText, AlertCircle, Search
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { MobileHeader } from "@/components/layout/mobile-header"
import { toast } from "sonner"
import { saveQuote, changeQuoteStatus, convertQuoteToInvoice, removeQuote } from "@/app/actions/quotes"
import type { Quote, InvoiceLine, Contact, UserProfile } from "@/types"
import { useRouter } from "next/navigation"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<Quote['status'], { label: string; color: string; icon: React.ReactNode }> = {
  borrador:  { label: "Borrador",   color: "bg-gray-100 text-gray-600",      icon: <Clock className="h-3 w-3" /> },
  enviado:   { label: "Enviado",    color: "bg-blue-50 text-blue-600",       icon: <Send className="h-3 w-3" /> },
  aceptado:  { label: "Aceptado",   color: "bg-[#EAF5EF] text-[#3A6A54]",   icon: <CheckCircle className="h-3 w-3" /> },
  rechazado: { label: "Rechazado",  color: "bg-red-50 text-red-500",         icon: <XCircle className="h-3 w-3" /> },
  expirado:  { label: "Expirado",   color: "bg-orange-50 text-orange-500",   icon: <AlertCircle className="h-3 w-3" /> },
}

const EMPTY_LINE: InvoiceLine = { description: "", quantity: 1, unit_price: 0, tax_rate: 21, subtotal: 0 }
const fmt = (n: number) => n.toLocaleString("es-ES", { minimumFractionDigits: 2 }) + " €"

function calcLines(lines: InvoiceLine[]) {
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unit_price, 0)
  const tax = lines.reduce((s, l) => s + l.quantity * l.unit_price * (l.tax_rate / 100), 0)
  return { subtotal, tax, total: subtotal + tax }
}

function printQuote(q: Quote, profile: UserProfile) {
  const { subtotal, tax, total } = calcLines(q.lines)
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>Presupuesto ${q.number}</title>
  <style>
    body{font-family:Arial,sans-serif;color:#222;margin:40px;font-size:13px}
    h1{color:#3A6A54;font-size:22px;margin-bottom:4px}
    .meta{color:#666;font-size:12px;margin-bottom:24px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}
    .label{font-weight:600;font-size:11px;color:#888;text-transform:uppercase;margin-bottom:4px}
    table{width:100%;border-collapse:collapse;margin-bottom:16px}
    th{background:#EAF5EF;padding:8px 10px;text-align:left;font-size:12px}
    td{padding:8px 10px;border-bottom:1px solid #eee}
    .right{text-align:right}
    .totals{margin-left:auto;width:240px}
    .total-row{display:flex;justify-content:space-between;padding:4px 0}
    .total-final{font-weight:700;font-size:16px;border-top:2px solid #3A6A54;margin-top:8px;padding-top:8px}
    .badge{display:inline-block;padding:3px 10px;background:#EAF5EF;color:#3A6A54;border-radius:20px;font-size:11px;font-weight:600;margin-bottom:8px}
  </style></head><body>
  <div class="badge">PRESUPUESTO</div>
  <h1>${q.number}</h1>
  <div class="meta">Fecha: ${q.issue_date}${q.valid_until ? ' · Válido hasta: ' + q.valid_until : ''}</div>
  <div class="grid">
    <div><div class="label">Emisor</div><strong>${profile.name ?? '—'}</strong><br/>${profile.company_id ? 'NIF/CIF: ' + profile.company_id : ''}</div>
    <div><div class="label">Cliente</div><strong>${q.client_name}</strong><br/>${q.client_nif ? 'NIF/CIF: ' + q.client_nif + '<br/>' : ''}${q.client_email ?? ''}</div>
  </div>
  <table>
    <thead><tr><th>Descripción</th><th class="right">Cant.</th><th class="right">Precio unit.</th><th class="right">IVA</th><th class="right">Subtotal</th></tr></thead>
    <tbody>${q.lines.map(l => `<tr><td>${l.description}</td><td class="right">${l.quantity}</td><td class="right">${fmt(l.unit_price)}</td><td class="right">${l.tax_rate}%</td><td class="right">${fmt(l.quantity * l.unit_price)}</td></tr>`).join('')}</tbody>
  </table>
  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
    <div class="total-row"><span>IVA</span><span>${fmt(tax)}</span></div>
    <div class="total-row total-final"><span>TOTAL</span><span>${fmt(total)}</span></div>
  </div>
  ${q.notes ? '<p style="margin-top:24px;color:#666;font-size:12px"><strong>Notas:</strong> ' + q.notes + '</p>' : ''}
  </body></html>`
  const w = window.open("", "_blank")
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.print()
}

// ─── Quote Form ───────────────────────────────────────────────────────────────

function QuoteForm({ initial, contacts, onClose, onSaved }: {
  initial?: Quote; contacts: Contact[]; onClose: () => void; onSaved: () => void
}) {
  const [form, setForm] = useState({
    id: initial?.id,
    client_name: initial?.client_name ?? "",
    client_nif: initial?.client_nif ?? "",
    client_address: initial?.client_address ?? "",
    client_email: initial?.client_email ?? "",
    issue_date: initial?.issue_date ?? new Date().toISOString().split("T")[0],
    valid_until: initial?.valid_until ?? "",
    notes: initial?.notes ?? "",
    lines: initial?.lines?.length ? initial.lines : [{ ...EMPTY_LINE }],
  })
  const [isPending, start] = useTransition()
  const { subtotal, tax, total } = calcLines(form.lines)

  function setLine(i: number, field: keyof InvoiceLine, val: string | number) {
    setForm(f => { const lines = [...f.lines]; lines[i] = { ...lines[i], [field]: typeof val === "string" ? val : Number(val) }; return { ...f, lines } })
  }

  function fillFromContact(id: string) {
    const c = contacts.find(c => c.id === id)
    if (c) setForm(f => ({ ...f, client_name: c.name, client_email: c.email ?? "" }))
  }

  function handleSave() {
    if (!form.client_name.trim()) { toast.error("El nombre del cliente es obligatorio"); return }
    start(async () => {
      try {
        await saveQuote(form)
        toast.success(form.id ? "Presupuesto actualizado" : "Presupuesto creado")
        onSaved()
      } catch (e: any) { toast.error(e.message) }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-[#CAE8D8] flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-[#2D5C44]">{form.id ? "Editar presupuesto" : "Nuevo presupuesto"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-5 space-y-4">
          {contacts.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-[#4A6355] mb-1 block">Rellenar desde contacto</label>
              <select onChange={e => fillFromContact(e.target.value)} defaultValue=""
                className="w-full px-3 py-2.5 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none">
                <option value="">— Selecciona un contacto —</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Nombre cliente *", key: "client_name", placeholder: "Empresa S.L." },
              { label: "NIF / CIF", key: "client_nif", placeholder: "B12345678" },
              { label: "Email cliente", key: "client_email", placeholder: "cliente@empresa.com" },
              { label: "Dirección", key: "client_address", placeholder: "Calle Mayor 1, Madrid" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-[#4A6355] mb-1 block">{label}</label>
                <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]" />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-[#4A6355] mb-1 block">Fecha emisión</label>
              <input type="date" value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#4A6355] mb-1 block">Válido hasta</label>
              <input type="date" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]" />
            </div>
          </div>

          {/* Líneas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#4A6355]">Líneas</label>
              <button onClick={() => setForm(f => ({ ...f, lines: [...f.lines, { ...EMPTY_LINE }] }))}
                className="text-xs text-[#A8CEBA] font-semibold hover:text-[#3A6A54] flex items-center gap-1">
                <Plus className="h-3 w-3" /> Añadir
              </button>
            </div>
            <div className="space-y-2">
              {form.lines.map((line, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center bg-[#F4FAF7] rounded-xl p-2">
                  <div className="col-span-5">
                    <input value={line.description} onChange={e => setLine(i, "description", e.target.value)}
                      placeholder="Descripción" className="w-full px-2 py-1.5 text-sm border border-[#CAE8D8] rounded-lg bg-white focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <input value={line.quantity} onChange={e => setLine(i, "quantity", e.target.value)}
                      type="number" min="0" step="0.01" placeholder="Cant."
                      className="w-full px-2 py-1.5 text-sm border border-[#CAE8D8] rounded-lg bg-white focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <input value={line.unit_price} onChange={e => setLine(i, "unit_price", e.target.value)}
                      type="number" min="0" step="0.01" placeholder="€"
                      className="w-full px-2 py-1.5 text-sm border border-[#CAE8D8] rounded-lg bg-white focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <select value={line.tax_rate} onChange={e => setLine(i, "tax_rate", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-[#CAE8D8] rounded-lg bg-white focus:outline-none">
                      <option value={0}>0%</option><option value={4}>4%</option><option value={10}>10%</option><option value={21}>21%</option>
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {form.lines.length > 1 && (
                      <button onClick={() => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }))}
                        className="text-red-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="bg-[#F4FAF7] rounded-xl p-4 space-y-1.5">
            <div className="flex justify-between text-sm text-[#4A6355]"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="flex justify-between text-sm text-[#4A6355]"><span>IVA</span><span>{fmt(tax)}</span></div>
            <div className="flex justify-between font-bold text-base text-[#2D5C44] border-t border-[#CAE8D8] pt-2 mt-2"><span>TOTAL</span><span>{fmt(total)}</span></div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#4A6355] mb-1 block">Notas</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full px-3 py-2.5 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none resize-none"
              placeholder="Condiciones, notas de pago..." />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 text-sm font-medium text-[#4A6355] border border-[#CAE8D8] rounded-xl hover:bg-[#F4FAF7]">Cancelar</button>
            <button onClick={handleSave} disabled={isPending}
              className="flex-1 py-3 text-sm font-semibold bg-[#A8CEBA] text-white rounded-xl hover:bg-[#90BBAA] disabled:opacity-50 transition-colors">
              {isPending ? "Guardando..." : form.id ? "Guardar cambios" : "Crear presupuesto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Quote Card ───────────────────────────────────────────────────────────────

function QuoteCard({ q, profile, contacts, onRefresh }: {
  q: Quote; profile: UserProfile; contacts: Contact[]; onRefresh: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [isPending, start] = useTransition()
  const router = useRouter()
  const s = STATUS_MAP[q.status]
  const isExpired = q.valid_until && new Date(q.valid_until) < new Date() && q.status === 'enviado'

  function handleStatus(status: Quote['status']) {
    start(async () => {
      try { await changeQuoteStatus(q.id, status); toast.success("Estado actualizado"); onRefresh() }
      catch (e: any) { toast.error(e.message) }
    })
  }

  function handleConvert() {
    if (!confirm("¿Convertir este presupuesto en factura? Se creará automáticamente una nueva factura.")) return
    start(async () => {
      try {
        await convertQuoteToInvoice(q)
        toast.success("¡Factura creada a partir del presupuesto!")
        router.push("/facturacion")
      } catch (e: any) { toast.error(e.message) }
    })
  }

  function handleDelete() {
    if (!confirm("¿Eliminar este presupuesto?")) return
    start(async () => {
      try { await removeQuote(q.id); toast.success("Presupuesto eliminado"); onRefresh() }
      catch (e: any) { toast.error(e.message) }
    })
  }

  return (
    <>
      {editing && <QuoteForm initial={q} contacts={contacts} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); onRefresh() }} />}
      <Card className="border-[#CAE8D8] bg-white overflow-hidden">
        <div className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#EAF5EF] flex items-center justify-center shrink-0">
            <ClipboardList className="h-5 w-5 text-[#A8CEBA]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-[#2D5C44]">{q.number}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isExpired ? 'bg-orange-50 text-orange-500' : s.color}`}>
                {isExpired ? <AlertCircle className="h-3 w-3" /> : s.icon}
                {isExpired ? 'Expirado' : s.label}
              </span>
              {q.invoice_id && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAF5EF] text-[#3A6A54] font-medium flex items-center gap-1">
                  <FileText className="h-2.5 w-2.5" /> Facturado
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B8C7A] truncate">{q.client_name} · {q.issue_date}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-sm text-[#2D5C44]">{fmt(q.total)}</p>
            {q.valid_until && <p className="text-xs text-[#6B8C7A]">Válido hasta {q.valid_until}</p>}
          </div>
          <button onClick={() => setExpanded(e => !e)} className="text-[#6B8C7A] ml-1">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {expanded && (
          <div className="px-4 pb-4 border-t border-[#CAE8D8] pt-3 space-y-3">
            <div className="text-xs space-y-1">
              {q.lines.map((l, i) => (
                <div key={i} className="flex justify-between text-[#4A6355]">
                  <span>{l.description} × {l.quantity}</span><span>{fmt(l.quantity * l.unit_price)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-[#2D5C44] border-t border-[#CAE8D8] pt-1 mt-1">
                <span>Total</span><span>{fmt(q.total)}</span>
              </div>
            </div>

            {/* Cambiar estado */}
            {!q.invoice_id && (
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_MAP) as Quote['status'][]).filter(st => st !== q.status).map(st => (
                  <button key={st} onClick={() => handleStatus(st)} disabled={isPending}
                    className="text-xs px-3 py-1.5 rounded-lg border border-[#CAE8D8] text-[#4A6355] hover:bg-[#EAF5EF] transition-colors disabled:opacity-50">
                    → {STATUS_MAP[st].label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#EAF5EF] text-[#3A6A54] hover:bg-[#CAE8D8] transition-colors">
                Ver / Editar
              </button>
              <button onClick={() => printQuote(q, profile)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#EAF5EF] text-[#3A6A54] hover:bg-[#CAE8D8] transition-colors">
                <Download className="h-3.5 w-3.5" /> PDF
              </button>
              {!q.invoice_id && (q.status === 'aceptado' || q.status === 'enviado') && (
                <button onClick={handleConvert} disabled={isPending}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#A8CEBA] text-white hover:bg-[#90BBAA] transition-colors disabled:opacity-50 font-semibold">
                  <ArrowRight className="h-3.5 w-3.5" /> Convertir a factura
                </button>
              )}
              <button onClick={handleDelete} disabled={isPending}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors ml-auto disabled:opacity-50">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PresupuestosClient({ initialQuotes, contacts, profile }: {
  initialQuotes: Quote[]; contacts: Contact[]; profile: UserProfile
}) {
  const [quotes, setQuotes] = useState(initialQuotes)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<Quote['status'] | 'todos'>('todos')

  function refresh() { window.location.reload() }

  const filtered = quotes.filter(q => {
    const matchSearch = search === "" || q.client_name.toLowerCase().includes(search.toLowerCase()) || q.number.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "todos" || q.status === filterStatus
    return matchSearch && matchStatus
  })

  const pendientes = quotes.filter(q => q.status === 'enviado').length
  const aceptados  = quotes.filter(q => q.status === 'aceptado').reduce((s, q) => s + q.total, 0)
  const tasa       = quotes.length > 0
    ? Math.round((quotes.filter(q => q.status === 'aceptado').length / quotes.filter(q => q.status !== 'borrador').length) * 100) || 0
    : 0

  return (
    <div>
      <MobileHeader title="Presupuestos" />
      {showForm && <QuoteForm contacts={contacts} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); refresh() }} />}

      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="hidden md:flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#A8CEBA]" />
            <h1 className="text-2xl font-bold text-[#2D5C44]">Presupuestos</h1>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#A8CEBA] text-white rounded-xl hover:bg-[#90BBAA] text-sm font-semibold transition-colors">
            <Plus className="h-4 w-4" /> Nuevo presupuesto
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <Card className="p-3 border-[#CAE8D8] bg-white text-center">
            <p className="text-xs text-[#6B8C7A] mb-1">Enviados</p>
            <p className="font-bold text-[#2D5C44] text-lg">{pendientes}</p>
          </Card>
          <Card className="p-3 border-[#CAE8D8] bg-white text-center">
            <p className="text-xs text-[#6B8C7A] mb-1">Importe aceptado</p>
            <p className="font-bold text-[#3A6A54] text-sm">{fmt(aceptados)}</p>
          </Card>
          <Card className="p-3 border-[#CAE8D8] bg-white text-center">
            <p className="text-xs text-[#6B8C7A] mb-1">Tasa de éxito</p>
            <p className="font-bold text-[#2D5C44] text-lg">{tasa}%</p>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B8C7A]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none bg-white">
            <option value="todos">Todos</option>
            {(Object.keys(STATUS_MAP) as Quote['status'][]).map(s => <option key={s} value={s}>{STATUS_MAP[s].label}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <Card className="border-[#CAE8D8] bg-white p-10 text-center">
            <ClipboardList className="h-10 w-10 text-[#CAE8D8] mx-auto mb-3" />
            <p className="text-sm text-[#6B8C7A]">{quotes.length === 0 ? "Aún no tienes presupuestos. ¡Crea el primero!" : "No hay presupuestos con ese filtro."}</p>
            {quotes.length === 0 && (
              <button onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-[#A8CEBA] text-white rounded-xl text-sm font-semibold hover:bg-[#90BBAA] transition-colors">
                + Nuevo presupuesto
              </button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(q => <QuoteCard key={q.id} q={q} profile={profile} contacts={contacts} onRefresh={refresh} />)}
          </div>
        )}
      </div>

      <button onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 md:hidden h-14 w-14 bg-[#A8CEBA] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#90BBAA] z-40">
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
