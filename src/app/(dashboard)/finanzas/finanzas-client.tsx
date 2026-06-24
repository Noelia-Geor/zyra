"use client"

import { useState, useTransition, useRef } from "react"
import { BarChart3, TrendingUp, TrendingDown, Plus, X, Trash2, Camera, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { addTransaction, removeTransaction } from "@/app/actions/transactions"
import { MobileHeader } from "@/components/layout/mobile-header"
import { toast } from "sonner"
import type { Transaction } from "@/types"

type TxType = "ingreso" | "gasto"

const incomeCategories  = ["Proyecto", "Consultoría", "Servicio", "Producto", "Formación", "Otro"]
const expenseCategories = ["Software", "Marketing", "Material", "Formación", "Transporte", "Oficina", "Otro"]

const categoryColors: Record<string, string> = {
  Proyecto: "bg-blue-100 text-blue-700", Consultoría: "bg-violet-100 text-violet-700",
  Servicio: "bg-[#E8F2EC] text-[#4E8B6B]", Producto: "bg-orange-100 text-orange-700",
  Formación: "bg-pink-100 text-pink-700", Software: "bg-indigo-100 text-indigo-700",
  Marketing: "bg-yellow-100 text-yellow-700", Material: "bg-gray-100 text-gray-700",
  Transporte: "bg-cyan-100 text-cyan-700", Oficina: "bg-rose-100 text-rose-700",
}

const emptyForm = { type: "ingreso" as TxType, amount: "", category: "", description: "", date: new Date().toISOString().split("T")[0] }

export default function FinanzasClient({ initialTransactions, userId }: { initialTransactions: Transaction[]; userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [filter, setFilter] = useState<TxType | "todos">("todos")
  const [isPending, startTransition] = useTransition()
  const [ocrLoading, setOcrLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ingresos = transactions.filter(t => t.type === "ingreso").reduce((s, t) => s + Number(t.amount), 0)
  const gastos   = transactions.filter(t => t.type === "gasto").reduce((s, t) => s + Number(t.amount), 0)
  const balance  = ingresos - gastos
  const margen   = ingresos > 0 ? Math.round((balance / ingresos) * 100) : 0
  const filtered = transactions.filter(t => filter === "todos" || t.type === filter)
  const categories = form.type === "ingreso" ? incomeCategories : expenseCategories

  function fmt(n: number) {
    return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
  }

  function handleAdd() {
    if (!form.description.trim() || !form.amount || !form.category) return
    startTransition(async () => {
      await addTransaction({ ...form, amount: parseFloat(form.amount) })
      setTransactions(prev => [{
        id: crypto.randomUUID(), user_id: userId, currency: "EUR", contact_id: null, receipt_url: null,
        type: form.type, amount: parseFloat(form.amount),
        category: form.category, description: form.description, date: form.date,
        created_at: new Date().toISOString(),
      }, ...prev])
      setForm(emptyForm)
      setShowForm(false)
      toast.success("Movimiento registrado")
    })
  }

  async function handleOcr(file: File) {
    setOcrLoading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1]
        const mediaType = file.type || "image/jpeg"
        const res = await fetch("/api/ocr-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mediaType }),
        })
        const data = await res.json()
        if (data.error) { toast.error("No se pudo leer el ticket"); return }
        setForm(f => ({
          ...f,
          type: "gasto",
          amount: data.amount ? String(data.amount) : f.amount,
          description: data.description || f.description,
          category: data.category || f.category,
          date: data.date || f.date,
        }))
        setShowForm(true)
        toast.success("Ticket escaneado")
      }
      reader.readAsDataURL(file)
    } finally {
      setOcrLoading(false)
    }
  }

  function handleDelete(id: string) {
    setTransactions(prev => prev.filter(t => t.id !== id))
    startTransition(async () => { await removeTransaction(id) })
    toast.success("Movimiento eliminado")
  }

  return (
    <div>
      <MobileHeader title="Finanzas" />
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#2D5C44] flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#4E8B6B]" /> Finanzas
            </h1>
            <p className="text-sm text-[#6B8C7A] mt-0.5">Mes actual</p>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleOcr(f); e.target.value = "" }} />
            <button onClick={() => fileInputRef.current?.click()} disabled={ocrLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-[#C8DFD2] rounded-xl bg-white hover:bg-[#E8F2EC] transition-colors disabled:opacity-50"
              title="Escanear ticket con IA">
              {ocrLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              <span className="hidden sm:inline">Ticket IA</span>
            </button>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-3 py-2 md:px-4 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Registrar</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>

        {/* KPIs — 2 col en móvil, 4 en desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <Card className="p-3 md:p-4 border-[#C8DFD2] bg-white">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-[#4E8B6B]" />
              <span className="text-xs font-medium text-[#6B8C7A]">Ingresos</span>
            </div>
            <p className="text-lg md:text-xl font-bold text-[#4E8B6B]">{fmt(ingresos)}</p>
          </Card>
          <Card className="p-3 md:p-4 border-[#C8DFD2] bg-white">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingDown className="h-3.5 w-3.5 text-red-400" />
              <span className="text-xs font-medium text-[#6B8C7A]">Gastos</span>
            </div>
            <p className="text-lg md:text-xl font-bold text-red-500">{fmt(gastos)}</p>
          </Card>
          <Card className={`p-3 md:p-4 border-[#C8DFD2] ${balance >= 0 ? "bg-[#E8F2EC]" : "bg-red-50"}`}>
            <div className="flex items-center gap-1.5 mb-2">
              <BarChart3 className="h-3.5 w-3.5 text-[#6B8C7A]" />
              <span className="text-xs font-medium text-[#6B8C7A]">Balance</span>
            </div>
            <p className={`text-lg md:text-xl font-bold ${balance >= 0 ? "text-[#2D5C44]" : "text-red-600"}`}>
              {balance >= 0 ? "+" : ""}{fmt(balance)}
            </p>
          </Card>
          <Card className="p-3 md:p-4 border-[#C8DFD2] bg-white">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-violet-500" />
              <span className="text-xs font-medium text-[#6B8C7A]">Margen</span>
            </div>
            <p className="text-lg md:text-xl font-bold text-violet-600">{margen}%</p>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          {(["todos", "ingreso", "gasto"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === f ? "bg-[#4E8B6B] text-white" : "bg-white border border-[#C8DFD2] text-[#4A6355] hover:bg-[#E8F2EC]"}`}>
              {f === "todos" ? "Todos" : f === "ingreso" ? "Ingresos" : "Gastos"}
            </button>
          ))}
        </div>

        {/* Movimientos */}
        {filtered.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-[#C8DFD2]">
            <BarChart3 className="h-10 w-10 text-[#C8DFD2] mx-auto mb-3" />
            <p className="font-semibold text-[#2D5C44] mb-1">Sin movimientos aún</p>
            <p className="text-sm text-[#6B8C7A] mb-5">Registra tu primer ingreso o gasto.</p>
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-colors">
              <Plus className="h-4 w-4" /> Registrar movimiento
            </button>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(t => (
              <Card key={t.id} className="p-3 md:p-4 flex items-center justify-between group hover:shadow-md transition-all border-[#C8DFD2] bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shrink-0 ${t.type === "ingreso" ? "bg-[#E8F2EC]" : "bg-red-100"}`}>
                    {t.type === "ingreso" ? <TrendingUp className="h-4 w-4 text-[#4E8B6B]" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#2D5C44] truncate">{t.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${categoryColors[t.category] ?? "bg-[#E8F2EC] text-[#4E8B6B]"}`}>{t.category}</span>
                      <span className="text-xs text-[#6B8C7A]">{new Date(t.date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-bold text-sm md:text-base ${t.type === "ingreso" ? "text-[#4E8B6B]" : "text-red-500"}`}>
                    {t.type === "ingreso" ? "+" : "-"}{fmt(Number(t.amount))}
                  </span>
                  <button onClick={() => handleDelete(t.id)}
                    className="text-[#C8DFD2] hover:text-red-400 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#C8DFD2] sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl">
                <h2 className="font-bold text-[#2D5C44]">Registrar movimiento</h2>
                <button onClick={() => setShowForm(false)} className="text-[#6B8C7A] hover:text-[#2D5C44]"><X className="h-5 w-5" /></button>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div className="flex rounded-xl border border-[#C8DFD2] overflow-hidden">
                  {(["ingreso", "gasto"] as TxType[]).map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t, category: "" }))}
                      className={`flex-1 py-3 text-sm font-semibold transition-colors ${form.type === t ? (t === "ingreso" ? "bg-[#4E8B6B] text-white" : "bg-red-500 text-white") : "text-[#6B8C7A] hover:bg-[#E8F2EC]"}`}>
                      {t === "ingreso" ? "💰 Ingreso" : "💸 Gasto"}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Descripción *</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} autoFocus
                    className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]" placeholder="Proyecto web, suscripción software..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Importe (€) *</label>
                    <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]" placeholder="0,00" min="0" step="0.01" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Fecha</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Categoría *</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(c => (
                      <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${form.category === c ? "bg-[#4E8B6B] text-white border-[#4E8B6B]" : "border-[#C8DFD2] text-[#4A6355] hover:bg-[#E8F2EC]"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 px-5 py-4 border-t border-[#C8DFD2] bg-[#F2F7F4] rounded-b-2xl">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 text-sm font-medium border border-[#C8DFD2] rounded-xl hover:bg-[#E8F2EC] bg-white text-[#4A6355] transition-colors">Cancelar</button>
                <button onClick={handleAdd} disabled={!form.description || !form.amount || !form.category || isPending}
                  className="flex-1 py-3 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] disabled:opacity-40 transition-colors">
                  {isPending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
