import { notFound } from "next/navigation"
import { getContactByPortalToken, getInvoicesForPortal, getQuotesForPortal } from "@/lib/supabase/queries"
import { FileText, ClipboardList, CheckCircle, Clock, AlertCircle, Send, XCircle } from "lucide-react"

function fmt(n: number) {
  return Number(n).toLocaleString("es-ES", { minimumFractionDigits: 2 }) + " €"
}

const INV_STATUS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  enviada:   { label: "Pendiente",  color: "bg-blue-50 text-blue-700",   icon: <Send className="h-3 w-3" /> },
  pagada:    { label: "Pagada",     color: "bg-green-50 text-green-700", icon: <CheckCircle className="h-3 w-3" /> },
  vencida:   { label: "Vencida",    color: "bg-red-50 text-red-700",     icon: <AlertCircle className="h-3 w-3" /> },
  cancelada: { label: "Cancelada",  color: "bg-gray-100 text-gray-500",  icon: <XCircle className="h-3 w-3" /> },
}

const Q_STATUS: Record<string, { label: string; color: string }> = {
  enviado:   { label: "Pendiente", color: "bg-blue-50 text-blue-700" },
  aceptado:  { label: "Aceptado",  color: "bg-green-50 text-green-700" },
  rechazado: { label: "Rechazado", color: "bg-red-50 text-red-700" },
  expirado:  { label: "Expirado",  color: "bg-gray-100 text-gray-500" },
}

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const contact = await getContactByPortalToken(token)
  if (!contact) notFound()

  const [invoices, quotes] = await Promise.all([
    getInvoicesForPortal(contact.id),
    getQuotesForPortal(contact.id),
  ])

  const totalPendiente = invoices.filter(i => i.status === "enviada").reduce((s, i) => s + Number(i.total), 0)

  return (
    <div className="min-h-screen bg-[#F7F8F9]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8ECEA]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#4E8B6B] flex items-center justify-center">
            <span className="text-white text-sm font-bold">Z</span>
          </div>
          <div>
            <p className="text-xs text-[#6B8C7A]">Portal de cliente</p>
            <p className="font-bold text-[#2D5C44]">{contact.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Resumen */}
        {totalPendiente > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              Tienes <strong>{fmt(totalPendiente)}</strong> pendiente de pago.
            </p>
          </div>
        )}

        {/* Facturas */}
        {invoices.length > 0 && (
          <div>
            <h2 className="font-bold text-[#2D5C44] mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#4E8B6B]" /> Facturas
            </h2>
            <div className="space-y-2">
              {invoices.map(inv => {
                const s = INV_STATUS[inv.status] ?? INV_STATUS.enviada
                return (
                  <div key={inv.id} className="bg-white border border-[#E8ECEA] rounded-xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-[#2D5C44]">{inv.number}</p>
                      <p className="text-xs text-[#6B8C7A]">{new Date(inv.issue_date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${s.color}`}>
                        {s.icon}{s.label}
                      </span>
                      <span className="font-bold text-[#2D5C44]">{fmt(Number(inv.total))}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Presupuestos */}
        {quotes.length > 0 && (
          <div>
            <h2 className="font-bold text-[#2D5C44] mb-3 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[#4E8B6B]" /> Presupuestos
            </h2>
            <div className="space-y-2">
              {quotes.map(q => {
                const s = Q_STATUS[q.status] ?? Q_STATUS.enviado
                return (
                  <div key={q.id} className="bg-white border border-[#E8ECEA] rounded-xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-[#2D5C44]">{q.number}</p>
                      <p className="text-xs text-[#6B8C7A]">{new Date(q.issue_date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.color}`}>{s.label}</span>
                      <span className="font-bold text-[#2D5C44]">{fmt(Number(q.total))}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {invoices.length === 0 && quotes.length === 0 && (
          <div className="text-center py-16">
            <Clock className="h-10 w-10 text-[#C8DFD2] mx-auto mb-3" />
            <p className="text-[#6B8C7A]">Aún no hay documentos disponibles.</p>
          </div>
        )}

        <p className="text-xs text-center text-[#6B8C7A]">Portal generado con ZYRA · Uso exclusivo del cliente</p>
      </div>
    </div>
  )
}
