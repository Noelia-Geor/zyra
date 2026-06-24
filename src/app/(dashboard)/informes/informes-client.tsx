"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Users, Clock, DollarSign, Award } from "lucide-react"
import { Card } from "@/components/ui/card"
import { MobileHeader } from "@/components/layout/mobile-header"
import type { Invoice, Contact, Transaction, TimeEntry } from "@/types"

function fmt(n: number) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
}

function fmtH(mins: number) {
  const h = Math.floor(mins / 60), m = mins % 60
  return `${h}h ${m}m`
}

interface ByContactData {
  contact_id: string | null
  client_name: string
  total: number
  count: number
}

interface Props {
  invoices: Invoice[]
  contacts: Contact[]
  transactions: Transaction[]
  timeEntries: TimeEntry[]
  byContact: ByContactData[]
}

export default function InformesClient({ invoices, contacts, transactions, timeEntries, byContact }: Props) {
  const [period, setPeriod] = useState<"3m" | "6m" | "12m" | "todo">("12m")

  const now = new Date()
  const months = period === "3m" ? 3 : period === "6m" ? 6 : period === "12m" ? 12 : 120
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months + 1, 1).toISOString().split("T")[0]

  const filteredInv = invoices.filter(i => i.issue_date >= cutoff && i.status !== "cancelada" && i.status !== "borrador")
  const filteredTx = transactions.filter(t => t.date >= cutoff)
  const filteredTime = timeEntries.filter(t => t.clock_in >= cutoff && t.duration_mins)

  const totalFact = filteredInv.reduce((s, i) => s + Number(i.subtotal), 0)
  const totalCobrado = filteredInv.filter(i => i.status === "pagada").reduce((s, i) => s + Number(i.subtotal), 0)
  const totalGastos = filteredTx.filter(t => t.type === "gasto").reduce((s, t) => s + Number(t.amount), 0)
  const totalHoras = filteredTime.reduce((s, t) => s + (t.duration_mins ?? 0), 0)
  const tarifaMedia = totalHoras > 0 ? (totalCobrado / (totalHoras / 60)) : 0
  const tasaCobro = totalFact > 0 ? Math.round((totalCobrado / totalFact) * 100) : 0

  // Revenue mensual (últimos 12 meses)
  const monthlyRevenue: Record<string, number> = {}
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    monthlyRevenue[key] = 0
  }
  for (const inv of invoices.filter(i => i.status === "pagada")) {
    const key = inv.issue_date.slice(0, 7)
    if (key in monthlyRevenue) monthlyRevenue[key] += Number(inv.subtotal)
  }

  const monthEntries = Object.entries(monthlyRevenue)
  const maxRevenue = Math.max(...monthEntries.map(([, v]) => v), 1)

  // Top clientes
  const topClients = byContact.slice(0, 8)

  // Categorías de gasto
  const gastosCat: Record<string, number> = {}
  for (const tx of filteredTx.filter(t => t.type === "gasto")) {
    gastosCat[tx.category] = (gastosCat[tx.category] ?? 0) + Number(tx.amount)
  }
  const topGastos = Object.entries(gastosCat).sort((a, b) => b[1] - a[1]).slice(0, 6)

  // Proyectos con más horas
  const projectHours: Record<string, number> = {}
  for (const t of filteredTime) {
    const key = t.project ?? "Sin proyecto"
    projectHours[key] = (projectHours[key] ?? 0) + (t.duration_mins ?? 0)
  }
  const topProjects = Object.entries(projectHours).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const maxHours = Math.max(...topProjects.map(([, v]) => v), 1)

  return (
    <div>
      <MobileHeader title="Informes" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#2D5C44] flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#4E8B6B]" /> Informes
            </h1>
            <p className="text-sm text-[#6B8C7A] mt-0.5">Rentabilidad y análisis de negocio</p>
          </div>
          <div className="flex gap-1.5">
            {(["3m","6m","12m","todo"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${period === p ? "bg-[#4E8B6B] text-white" : "bg-white border border-[#C8DFD2] text-[#4A6355] hover:bg-[#E8F2EC]"}`}>
                {p === "todo" ? "Todo" : p}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Facturado", value: fmt(totalFact), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Cobrado", value: fmt(totalCobrado), icon: TrendingUp, color: "text-[#4E8B6B]", bg: "bg-[#E8F2EC]" },
            { label: "Gastos", value: fmt(totalGastos), icon: BarChart3, color: "text-red-500", bg: "bg-red-50" },
            { label: "Tasa de cobro", value: `${tasaCobro}%`, icon: Award, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Horas trabajadas", value: fmtH(totalHoras), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Tarifa media/h", value: tarifaMedia > 0 ? fmt(tarifaMedia) : "—", icon: Users, color: "text-teal-600", bg: "bg-teal-50" },
          ].map(k => (
            <Card key={k.label} className="p-4 border-[#E8ECEA] bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#6B8C7A]">{k.label}</span>
                <div className={`p-1.5 rounded-lg ${k.bg}`}><k.icon className={`h-3.5 w-3.5 ${k.color}`} /></div>
              </div>
              <p className="text-xl font-bold text-[#2D5C44]">{k.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Gráfico ingresos mensual */}
          <Card className="p-4 border-[#E8ECEA] bg-white">
            <h3 className="font-semibold text-sm text-[#2D5C44] mb-4">Ingresos mensuales (cobrado)</h3>
            <div className="flex items-end gap-1.5 h-32">
              {monthEntries.map(([key, value]) => {
                const height = Math.round((value / maxRevenue) * 100)
                const label = key.slice(5)
                return (
                  <div key={key} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-[#A8CEBA] rounded-t-sm hover:bg-[#4E8B6B] transition-colors cursor-default"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${key}: ${fmt(value)}`}
                    />
                    <span className="text-[9px] text-[#6B8C7A]">{label}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Top clientes */}
          <Card className="p-4 border-[#E8ECEA] bg-white">
            <h3 className="font-semibold text-sm text-[#2D5C44] mb-4 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" /> Top clientes (facturado cobrado)
            </h3>
            {topClients.length === 0 ? (
              <p className="text-sm text-[#6B8C7A]">Sin datos aún</p>
            ) : (
              <div className="space-y-2">
                {topClients.map((c, i) => {
                  const pct = Math.round((c.total / (topClients[0]?.total || 1)) * 100)
                  return (
                    <div key={c.contact_id ?? c.client_name}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="font-medium text-[#2D5C44] truncate flex items-center gap-1">
                          {i < 3 && <span className="text-amber-500">{["🥇","🥈","🥉"][i]}</span>}
                          {c.client_name}
                        </span>
                        <span className="text-[#6B8C7A] shrink-0">{fmt(c.total)}</span>
                      </div>
                      <div className="h-1.5 bg-[#F2F4F3] rounded-full">
                        <div className="h-1.5 bg-[#A8CEBA] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Gastos por categoría */}
          <Card className="p-4 border-[#E8ECEA] bg-white">
            <h3 className="font-semibold text-sm text-[#2D5C44] mb-4">Gastos por categoría</h3>
            {topGastos.length === 0 ? (
              <p className="text-sm text-[#6B8C7A]">Sin gastos en el periodo</p>
            ) : (
              <div className="space-y-2">
                {topGastos.map(([cat, val]) => {
                  const pct = Math.round((val / (topGastos[0]?.[1] || 1)) * 100)
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="font-medium text-[#2D5C44]">{cat}</span>
                        <span className="text-[#6B8C7A]">{fmt(val)}</span>
                      </div>
                      <div className="h-1.5 bg-[#F2F4F3] rounded-full">
                        <div className="h-1.5 bg-red-300 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Horas por proyecto */}
          <Card className="p-4 border-[#E8ECEA] bg-white">
            <h3 className="font-semibold text-sm text-[#2D5C44] mb-4 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-500" /> Horas por proyecto
            </h3>
            {topProjects.length === 0 ? (
              <p className="text-sm text-[#6B8C7A]">Sin fichajes en el periodo</p>
            ) : (
              <div className="flex items-end gap-2 h-24">
                {topProjects.map(([proj, mins]) => {
                  const h = Math.round((mins / maxHours) * 100)
                  return (
                    <div key={proj} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-amber-300 rounded-t-sm hover:bg-amber-400 transition-colors cursor-default"
                        style={{ height: `${Math.max(h, 3)}%` }}
                        title={`${proj}: ${fmtH(mins)}`}
                      />
                      <span className="text-[9px] text-[#6B8C7A] text-center leading-tight w-full truncate">{proj.slice(0, 8)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
