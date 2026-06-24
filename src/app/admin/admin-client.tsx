"use client"

import { useState, useTransition } from "react"
import { Lightbulb, CheckCircle2, Clock, Sparkles, X, ChevronDown, LayoutDashboard, Shield } from "lucide-react"
import { Card } from "@/components/ui/card"
import { setImprovementStatus } from "@/app/actions/admin"
import { toast } from "sonner"
import Link from "next/link"
import type { Improvement } from "@/types"

const categories: Record<Improvement["category"], { label: string; emoji: string }> = {
  procesos:      { label: "Procesos",      emoji: "⚙️" },
  comunicacion:  { label: "Comunicación",  emoji: "💬" },
  herramientas:  { label: "Herramientas",  emoji: "🛠️" },
  ambiente:      { label: "Ambiente",      emoji: "🌱" },
  formacion:     { label: "Formación",     emoji: "📚" },
  otro:          { label: "Otro",          emoji: "💡" },
}

const impacts: Record<Improvement["impact"], { label: string; color: string }> = {
  baja:  { label: "Baja",  color: "text-[#6B8C7A] bg-[#E8F2EC] border-[#C8DFD2]" },
  media: { label: "Media", color: "text-amber-700 bg-amber-50 border-amber-200" },
  alta:  { label: "Alta",  color: "text-red-600 bg-red-50 border-red-200" },
}

const statuses: { value: Improvement["status"]; label: string; color: string; icon: React.ReactNode }[] = [
  { value: "recibida",     label: "Recibida",     color: "bg-blue-50 text-blue-700 border-blue-200",       icon: <Clock className="h-3 w-3" /> },
  { value: "en_revision",  label: "En revisión",  color: "bg-amber-50 text-amber-700 border-amber-200",    icon: <Sparkles className="h-3 w-3" /> },
  { value: "implementada", label: "Implementada", color: "bg-[#E8F2EC] text-[#4E8B6B] border-[#C8DFD2]",  icon: <CheckCircle2 className="h-3 w-3" /> },
  { value: "descartada",   label: "Descartada",   color: "bg-gray-50 text-gray-500 border-gray-200",       icon: <X className="h-3 w-3" /> },
]

function StatusBadge({ status }: { status: Improvement["status"] }) {
  const s = statuses.find(s => s.value === status)!
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${s.color}`}>
      {s.icon} {s.label}
    </span>
  )
}

function StatusDropdown({ id, current, onChange }: { id: string; current: Improvement["status"]; onChange: (s: Improvement["status"]) => void }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function select(value: Improvement["status"]) {
    setOpen(false)
    if (value === current) return
    startTransition(async () => {
      try {
        await setImprovementStatus(id, value)
        onChange(value)
        toast.success("Estado actualizado")
      } catch {
        toast.error("Error al actualizar")
      }
    })
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} disabled={isPending}
        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border border-[#C8DFD2] bg-white hover:bg-[#E8F2EC] text-[#4A6355] font-medium transition-colors disabled:opacity-50">
        {isPending ? "Guardando..." : "Cambiar estado"}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-[#C8DFD2] z-20 w-44 py-1 overflow-hidden">
            {statuses.map(s => (
              <button key={s.value} onClick={() => select(s.value)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-[#F2F7F4] transition-colors ${s.value === current ? "bg-[#F2F7F4]" : ""}`}>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-xs ${s.color}`}>
                  {s.icon}
                </span>
                {s.label}
                {s.value === current && <span className="ml-auto text-[#4E8B6B]">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminClient({ improvements: initial }: { improvements: Improvement[] }) {
  const [items, setItems] = useState<Improvement[]>(initial)
  const [filter, setFilter] = useState<Improvement["status"] | "todas">("todas")

  const counts = {
    todas:       items.length,
    recibida:    items.filter(i => i.status === "recibida").length,
    en_revision: items.filter(i => i.status === "en_revision").length,
    implementada:items.filter(i => i.status === "implementada").length,
    descartada:  items.filter(i => i.status === "descartada").length,
  }

  const filtered = filter === "todas" ? items : items.filter(i => i.status === filter)

  function updateStatus(id: string, status: Improvement["status"]) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }

  const altaImpact = items.filter(i => i.impact === "alta" && i.status === "recibida").length

  return (
    <div className="min-h-screen bg-[#F2F7F4]">
      {/* Top bar */}
      <header className="bg-white border-b border-[#C8DFD2] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-[#4E8B6B] flex items-center justify-center">
              <span className="text-white text-xs font-bold">Z</span>
            </div>
            <span className="font-bold text-[#2D5C44]">ZYRA</span>
            <span className="text-[#C8DFD2] mx-1">·</span>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#4E8B6B]">
              <Shield className="h-3.5 w-3.5" /> Panel Admin
            </div>
          </div>
          <Link href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-[#6B8C7A] hover:text-[#2D5C44] transition-colors">
            <LayoutDashboard className="h-3.5 w-3.5" /> Volver al dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">

        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2D5C44] flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-amber-500" /> Sugerencias de mejora
          </h1>
          <p className="text-sm text-[#6B8C7A] mt-1">
            Propuestas anónimas de los usuarios de ZYRA para mejorar la plataforma.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total recibidas", value: counts.todas,        color: "text-[#2D5C44]", bg: "bg-white" },
            { label: "Pendientes",      value: counts.recibida,     color: "text-blue-600",  bg: "bg-blue-50" },
            { label: "En revisión",     value: counts.en_revision,  color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Implementadas",   value: counts.implementada, color: "text-[#4E8B6B]", bg: "bg-[#E8F2EC]" },
          ].map(k => (
            <Card key={k.label} className={`p-4 border-[#C8DFD2] ${k.bg}`}>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-[#6B8C7A] mt-0.5">{k.label}</p>
            </Card>
          ))}
        </div>

        {/* Alerta impacto alto */}
        {altaImpact > 0 && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl mb-5">
            <span className="text-xl">🔴</span>
            <p className="text-sm text-red-700 font-medium">
              {altaImpact} sugerencia{altaImpact !== 1 ? "s" : ""} de impacto <strong>alto</strong> sin revisar
            </p>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {([
            { value: "todas",        label: "Todas" },
            { value: "recibida",     label: "Recibidas" },
            { value: "en_revision",  label: "En revisión" },
            { value: "implementada", label: "Implementadas" },
            { value: "descartada",   label: "Descartadas" },
          ] as const).map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${filter === f.value ? "bg-[#4E8B6B] text-white" : "bg-white border border-[#C8DFD2] text-[#4A6355] hover:bg-[#E8F2EC]"}`}>
              {f.label} <span className="ml-1 opacity-70">
                {f.value === "todas" ? counts.todas : counts[f.value as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-[#C8DFD2]">
            <Lightbulb className="h-10 w-10 text-[#C8DFD2] mx-auto mb-3" />
            <p className="font-semibold text-[#2D5C44]">Sin sugerencias en esta categoría</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => {
              const cat = categories[item.category]
              const imp = impacts[item.impact]
              return (
                <Card key={item.id} className="p-4 md:p-5 border-[#C8DFD2] bg-white hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="text-sm font-semibold text-[#2D5C44]">{cat.label}</span>
                      <span className="text-xs text-[#6B8C7A] bg-[#F2F7F4] px-2 py-0.5 rounded-full">{item.area}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${imp.color}`}>
                        Impacto {imp.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={item.status} />
                      <StatusDropdown id={item.id} current={item.status} onChange={s => updateStatus(item.id, s)} />
                    </div>
                  </div>

                  <p className="text-sm text-[#2D5C44] leading-relaxed bg-[#F2F7F4] rounded-xl p-3">
                    {item.description}
                  </p>

                  <p className="text-xs text-[#6B8C7A] mt-2">
                    Recibida el {new Date(item.created_at).toLocaleDateString("es-ES", {
                      day: "numeric", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
