"use client"

import { useState } from "react"
import { Calculator, TrendingUp, FileText, Download, ChevronDown, ChevronUp, Info } from "lucide-react"
import { Card } from "@/components/ui/card"
import { MobileHeader } from "@/components/layout/mobile-header"
import type { Invoice, Transaction } from "@/types"

// Trimestres y sus rangos de meses
const QUARTERS = [
  { q: 1, label: "1T (Ene–Mar)", months: [1,2,3] },
  { q: 2, label: "2T (Abr–Jun)", months: [4,5,6] },
  { q: 3, label: "3T (Jul–Sep)", months: [7,8,9] },
  { q: 4, label: "4T (Oct–Dic)", months: [10,11,12] },
]

function fmt(n: number) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
}

function getQuarter(dateStr: string) {
  return Math.ceil((new Date(dateStr).getMonth() + 1) / 3)
}

interface FiscalData {
  q: number
  label: string
  invoiceCount: number
  baseImponible: number     // subtotal sin IVA
  ivaRepercutido: number    // IVA cobrado a clientes
  ivaTypes: Record<number, { base: number; iva: number }>
  ingresosBrutos: number    // total facturado (con IVA)
  gastos: number            // gastos del periodo
  rendimientoNeto: number   // ingresosBrutos - gastos (aprox)
  modelo303: number         // IVA a ingresar (simplificado: IVA repercutido - IVA soportado estimado)
  modelo130: number         // 20% del rendimiento neto positivo
}

function calcFiscalData(invoices: Invoice[], transactions: Transaction[], months: number[], year: number): FiscalData {
  const quarterInvoices = invoices.filter(inv => {
    const d = new Date(inv.issue_date)
    return d.getFullYear() === year && months.includes(d.getMonth() + 1)
  })

  const quarterTransactions = transactions.filter(tx => {
    const d = new Date(tx.date)
    return d.getFullYear() === year && months.includes(d.getMonth() + 1)
  })

  const baseImponible = quarterInvoices.reduce((s, inv) => s + Number(inv.subtotal), 0)
  const ivaRepercutido = quarterInvoices.reduce((s, inv) => s + Number(inv.tax_amount), 0)

  const ivaTypes: Record<number, { base: number; iva: number }> = { 21: { base: 0, iva: 0 }, 10: { base: 0, iva: 0 }, 4: { base: 0, iva: 0 }, 0: { base: 0, iva: 0 } }
  for (const inv of quarterInvoices) {
    for (const line of inv.lines) {
      const rate = line.tax_rate ?? 21
      const base = line.quantity * line.unit_price
      if (!ivaTypes[rate]) ivaTypes[rate] = { base: 0, iva: 0 }
      ivaTypes[rate].base += base
      ivaTypes[rate].iva += base * (rate / 100)
    }
  }

  const gastos = quarterTransactions.filter(t => t.type === "gasto").reduce((s, t) => s + Number(t.amount), 0)
  const ingresosTx = quarterTransactions.filter(t => t.type === "ingreso").reduce((s, t) => s + Number(t.amount), 0)
  const ingresosBrutos = baseImponible > 0 ? baseImponible : ingresosTx
  const rendimientoNeto = Math.max(0, ingresosBrutos - gastos)

  // IVA soportado estimado: 21% de gastos (simplificado)
  const ivaSoportado = gastos * 0.21
  const modelo303 = Math.max(0, ivaRepercutido - ivaSoportado)
  const modelo130 = rendimientoNeto * 0.20

  return {
    q: 0, label: "", invoiceCount: quarterInvoices.length,
    baseImponible, ivaRepercutido, ivaTypes,
    ingresosBrutos, gastos, rendimientoNeto,
    modelo303, modelo130,
  }
}

function exportFiscalCSV(year: number, data: FiscalData[]) {
  const BOM = "﻿"
  const rows = [
    ["Trimestre", "Base Imponible", "IVA Repercutido", "Gastos", "Rdto Neto", "Modelo 303", "Modelo 130"],
    ...data.map(d => [
      d.label,
      d.baseImponible.toFixed(2),
      d.ivaRepercutido.toFixed(2),
      d.gastos.toFixed(2),
      d.rendimientoNeto.toFixed(2),
      d.modelo303.toFixed(2),
      d.modelo130.toFixed(2),
    ])
  ]
  const csv = BOM + rows.map(r => r.join(";")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = `fiscal_${year}.csv`; a.click()
  URL.revokeObjectURL(url)
}

export default function FiscalClient({ invoices, transactions, year }: { invoices: Invoice[]; transactions: Transaction[]; year: number }) {
  const [expandedQ, setExpandedQ] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState(year)

  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2]

  const quarterData: FiscalData[] = QUARTERS.map(q => ({
    ...calcFiscalData(invoices, transactions, q.months, selectedYear),
    q: q.q,
    label: q.label,
  }))

  const totalBase = quarterData.reduce((s, d) => s + d.baseImponible, 0)
  const totalIVA = quarterData.reduce((s, d) => s + d.ivaRepercutido, 0)
  const totalGastos = quarterData.reduce((s, d) => s + d.gastos, 0)
  const total303 = quarterData.reduce((s, d) => s + d.modelo303, 0)
  const total130 = quarterData.reduce((s, d) => s + d.modelo130, 0)

  return (
    <div>
      <MobileHeader title="Fiscal" />
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#2D5C44] flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#4E8B6B]" /> Resumen Fiscal
            </h1>
            <p className="text-sm text-[#6B8C7A] mt-0.5">Modelos 303 (IVA) y 130 (IRPF) estimados</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-[#C8DFD2] rounded-xl bg-white focus:outline-none focus:border-[#4E8B6B]"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
              onClick={() => exportFiscalCSV(selectedYear, quarterData)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-[#C8DFD2] rounded-xl bg-white hover:bg-[#E8F2EC] transition-colors"
            >
              <Download className="h-4 w-4" /> Exportar
            </button>
          </div>
        </div>

        {/* Aviso simplificación */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Cálculo estimado basado en tus facturas y gastos registrados. IVA soportado estimado al 21% de gastos. Consulta siempre con tu gestor para presentación oficial.</span>
        </div>

        {/* KPIs anuales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Base imponible", value: fmt(totalBase), icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "IVA repercutido", value: fmt(totalIVA), icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "A pagar M.303", value: fmt(total303), icon: Calculator, color: "text-red-500", bg: "bg-red-50" },
            { label: "A pagar M.130", value: fmt(total130), icon: Calculator, color: "text-orange-500", bg: "bg-orange-50" },
          ].map(k => (
            <Card key={k.label} className="p-4 border-[#E8ECEA] bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#6B8C7A]">{k.label}</span>
                <div className={`p-1.5 rounded-lg ${k.bg}`}><k.icon className={`h-3.5 w-3.5 ${k.color}`} /></div>
              </div>
              <p className="text-lg font-bold text-[#2D5C44]">{k.value}</p>
            </Card>
          ))}
        </div>

        {/* Tabla por trimestres */}
        <div className="space-y-3">
          <h2 className="font-bold text-[#2D5C44]">Desglose trimestral</h2>
          {quarterData.map(d => {
            const isExpanded = expandedQ === d.q
            const isPast = d.q < Math.ceil((new Date().getMonth() + 1) / 3) || selectedYear < currentYear
            return (
              <Card key={d.q} className="border-[#E8ECEA] bg-white overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-[#F7F8F9] transition-colors"
                  onClick={() => setExpandedQ(isExpanded ? null : d.q)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isPast && d.invoiceCount > 0 ? "bg-[#4E8B6B]" : d.invoiceCount > 0 ? "bg-amber-400" : "bg-gray-200"}`} />
                    <span className="font-semibold text-sm">{d.label}</span>
                    <span className="text-xs text-[#6B8C7A]">{d.invoiceCount} factura{d.invoiceCount !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-[#6B8C7A]">M.303</p>
                      <p className="font-bold text-red-600">{fmt(d.modelo303)}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-[#6B8C7A]">M.130</p>
                      <p className="font-bold text-orange-600">{fmt(d.modelo130)}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-[#6B8C7A]" /> : <ChevronDown className="h-4 w-4 text-[#6B8C7A]" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-[#E8ECEA] pt-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div><p className="text-xs text-[#6B8C7A] mb-1">Base imponible</p><p className="font-semibold">{fmt(d.baseImponible)}</p></div>
                      <div><p className="text-xs text-[#6B8C7A] mb-1">IVA repercutido</p><p className="font-semibold">{fmt(d.ivaRepercutido)}</p></div>
                      <div><p className="text-xs text-[#6B8C7A] mb-1">Gastos deducibles</p><p className="font-semibold">{fmt(d.gastos)}</p></div>
                      <div><p className="text-xs text-[#6B8C7A] mb-1">Rendimiento neto</p><p className="font-semibold">{fmt(d.rendimientoNeto)}</p></div>
                      <div><p className="text-xs text-[#6B8C7A] mb-1">Modelo 303 (IVA)</p><p className="font-bold text-red-600">{fmt(d.modelo303)}</p></div>
                      <div><p className="text-xs text-[#6B8C7A] mb-1">Modelo 130 (IRPF)</p><p className="font-bold text-orange-600">{fmt(d.modelo130)}</p></div>
                    </div>

                    {/* Desglose por tipo de IVA */}
                    {Object.entries(d.ivaTypes).filter(([, v]) => v.base > 0).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#6B8C7A] mb-2">Desglose IVA</p>
                        <div className="space-y-1">
                          {Object.entries(d.ivaTypes).filter(([, v]) => v.base > 0).map(([rate, v]) => (
                            <div key={rate} className="flex justify-between text-xs py-1 border-b border-[#F2F4F3]">
                              <span>IVA {rate}%</span>
                              <span>Base: {fmt(v.base)} · IVA: {fmt(v.iva)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Resumen anual */}
        <Card className="p-4 border-[#E8ECEA] bg-white">
          <h3 className="font-bold text-sm mb-3 text-[#2D5C44]">Resumen anual {selectedYear}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div><p className="text-xs text-[#6B8C7A]">Total facturado (base)</p><p className="font-bold">{fmt(totalBase)}</p></div>
            <div><p className="text-xs text-[#6B8C7A]">Total IVA cobrado</p><p className="font-bold">{fmt(totalIVA)}</p></div>
            <div><p className="text-xs text-[#6B8C7A]">Total gastos</p><p className="font-bold">{fmt(totalGastos)}</p></div>
            <div><p className="text-xs text-[#6B8C7A]">Total Modelo 303</p><p className="font-bold text-red-600">{fmt(total303)}</p></div>
            <div><p className="text-xs text-[#6B8C7A]">Total Modelo 130</p><p className="font-bold text-orange-600">{fmt(total130)}</p></div>
            <div><p className="text-xs text-[#6B8C7A]">Carga fiscal total</p><p className="font-bold text-red-700">{fmt(total303 + total130)}</p></div>
          </div>
        </Card>
      </div>
    </div>
  )
}
