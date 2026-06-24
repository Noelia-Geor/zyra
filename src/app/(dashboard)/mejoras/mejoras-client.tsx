"use client"

import { useState, useTransition } from "react"
import { Lightbulb, Plus, X, CheckCircle2, Clock, Sparkles, Send, Shield } from "lucide-react"
import { Card } from "@/components/ui/card"
import { submitImprovement } from "@/app/actions/improvements"
import { MobileHeader } from "@/components/layout/mobile-header"
import { toast } from "sonner"
import type { Improvement } from "@/types"

const categories: { value: Improvement["category"]; label: string; emoji: string }[] = [
  { value: "procesos",     label: "Procesos",      emoji: "⚙️" },
  { value: "comunicacion", label: "Comunicación",  emoji: "💬" },
  { value: "herramientas", label: "Herramientas",  emoji: "🛠️" },
  { value: "ambiente",     label: "Ambiente",      emoji: "🌱" },
  { value: "formacion",    label: "Formación",     emoji: "📚" },
  { value: "otro",         label: "Otro",          emoji: "💡" },
]

const impacts: { value: Improvement["impact"]; label: string; color: string }[] = [
  { value: "baja",  label: "Baja",  color: "text-[#6B8C7A] bg-[#E8F2EC] border-[#C8DFD2]" },
  { value: "media", label: "Media", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { value: "alta",  label: "Alta",  color: "text-red-600 bg-red-50 border-red-200" },
]

const statusConfig: Record<Improvement["status"], { label: string; color: string; icon: React.ReactNode }> = {
  recibida:     { label: "Recibida",     color: "bg-blue-50 text-blue-700 border-blue-200",        icon: <Clock className="h-3 w-3" /> },
  en_revision:  { label: "En revisión",  color: "bg-amber-50 text-amber-700 border-amber-200",     icon: <Sparkles className="h-3 w-3" /> },
  implementada: { label: "Implementada", color: "bg-[#E8F2EC] text-[#4E8B6B] border-[#C8DFD2]",   icon: <CheckCircle2 className="h-3 w-3" /> },
  descartada:   { label: "Descartada",   color: "bg-gray-50 text-gray-500 border-gray-200",        icon: <X className="h-3 w-3" /> },
}

const emptyForm = {
  category: "" as Improvement["category"] | "",
  area: "",
  description: "",
  impact: "" as Improvement["impact"] | "",
}

export default function MejorasClient({ initialItems }: { initialItems: Improvement[] }) {
  const [items, setItems]     = useState<Improvement[]>(initialItems)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState(emptyForm)
  const [sent, setSent]       = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!form.category || !form.area.trim() || !form.description.trim() || !form.impact) return
    startTransition(async () => {
      try {
        const saved = await submitImprovement({
          category:    form.category as Improvement["category"],
          area:        form.area,
          description: form.description,
          impact:      form.impact as Improvement["impact"],
        })
        setItems(prev => [saved, ...prev])
        setForm(emptyForm)
        setSent(true)
        toast.success("Sugerencia enviada a dirección")
      } catch {
        toast.error("Error al enviar. Inténtalo de nuevo.")
      }
    })
  }

  return (
    <div>
      <MobileHeader title="Mejora continua" />
      <div className="p-4 md:p-6 max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#2D5C44] flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" /> Mejora Continua
            </h1>
            <p className="text-sm text-[#6B8C7A] mt-0.5">Tus sugerencias llegan directo a dirección</p>
          </div>
          <button onClick={() => { setSent(false); setShowForm(true) }}
            className="flex items-center gap-2 px-3 py-2 md:px-4 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-colors shadow-sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva sugerencia</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>

        {/* Banner anonimato */}
        <div className="flex items-start gap-3 p-4 bg-[#E8F2EC] rounded-2xl border border-[#C8DFD2] mb-6">
          <Shield className="h-5 w-5 text-[#4E8B6B] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#2D5C44]">100% confidencial</p>
            <p className="text-xs text-[#6B8C7A] mt-0.5">
              Tus sugerencias se envían sin ningún dato personal. Dirección recibe el contenido pero nunca sabe quién lo envió.
            </p>
          </div>
        </div>

        {/* Lista de sugerencias */}
        {items.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-[#C8DFD2]">
            <Lightbulb className="h-10 w-10 text-[#C8DFD2] mx-auto mb-3" />
            <p className="font-semibold text-[#2D5C44] mb-1">Sin sugerencias aún</p>
            <p className="text-sm text-[#6B8C7A] mb-5">¿Ves algo que se podría mejorar? Compártelo.</p>
            <button onClick={() => { setSent(false); setShowForm(true) }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-colors">
              <Plus className="h-4 w-4" /> Enviar sugerencia
            </button>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const cat    = categories.find(c => c.value === item.category)
              const imp    = impacts.find(i => i.value === item.impact)
              const status = statusConfig[item.status]
              return (
                <Card key={item.id} className="p-4 border-[#C8DFD2] bg-white hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat?.emoji}</span>
                      <div>
                        <span className="text-xs font-semibold text-[#4E8B6B]">{cat?.label}</span>
                        <span className="text-xs text-[#6B8C7A] mx-1.5">·</span>
                        <span className="text-xs text-[#6B8C7A]">{item.area}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-[#2D5C44] leading-relaxed mb-2">{item.description}</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${imp?.color}`}>
                      Impacto {imp?.label}
                    </span>
                    <span className="text-xs text-[#6B8C7A]">
                      {new Date(item.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Modal formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[94vh] overflow-y-auto">

              {/* Header modal */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#C8DFD2] sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <h2 className="font-bold text-[#2D5C44]">Nueva sugerencia</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="text-[#6B8C7A] hover:text-[#2D5C44]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {sent ? (
                <div className="px-5 py-10 text-center">
                  <div className="w-16 h-16 bg-[#E8F2EC] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-[#4E8B6B]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#2D5C44] mb-2">¡Sugerencia enviada!</h3>
                  <p className="text-sm text-[#6B8C7A] mb-1">Dirección ha sido notificada.</p>
                  <p className="text-xs text-[#6B8C7A] mb-6">Tu identidad permanece completamente anónima.</p>
                  <button onClick={() => { setSent(false); setForm(emptyForm); setShowForm(false) }}
                    className="px-6 py-2.5 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-colors">
                    Cerrar
                  </button>
                </div>
              ) : (
                <>
                  <div className="px-5 py-4 space-y-5">
                    {/* Aviso anonimato */}
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-[#E8F2EC] rounded-xl">
                      <Shield className="h-4 w-4 text-[#4E8B6B] shrink-0" />
                      <p className="text-xs text-[#4A6355]">Esta sugerencia llegará a dirección sin ningún dato tuyo.</p>
                    </div>

                    {/* Categoría */}
                    <div>
                      <label className="text-xs font-semibold text-[#4A6355] mb-2 block">¿Qué área quieres mejorar? *</label>
                      <div className="grid grid-cols-3 gap-2">
                        {categories.map(c => (
                          <button key={c.value} onClick={() => setForm(f => ({ ...f, category: c.value }))}
                            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all text-xs font-medium ${form.category === c.value ? "border-[#4E8B6B] bg-[#E8F2EC] text-[#2D5C44]" : "border-[#C8DFD2] text-[#6B8C7A] hover:border-[#4E8B6B]"}`}>
                            <span className="text-lg">{c.emoji}</span>
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Área específica */}
                    <div>
                      <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Área o departamento específico *</label>
                      <input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                        className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]"
                        placeholder="Ej: Atención al cliente, Logística, RRHH..." />
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">¿Qué mejorarías y cómo? *</label>
                      <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4}
                        className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B] resize-none"
                        placeholder="Describe el problema que ves y cómo lo mejorarías. Cuanto más concreto, mejor." />
                    </div>

                    {/* Impacto estimado */}
                    <div>
                      <label className="text-xs font-semibold text-[#4A6355] mb-2 block">Impacto estimado *</label>
                      <div className="flex gap-2">
                        {impacts.map(i => (
                          <button key={i.value} onClick={() => setForm(f => ({ ...f, impact: i.value }))}
                            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border-2 transition-all ${form.impact === i.value ? `${i.color} border-current` : "border-[#C8DFD2] text-[#6B8C7A] hover:border-[#4E8B6B]"}`}>
                            {i.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex gap-3 px-5 py-4 border-t border-[#C8DFD2] bg-[#F2F7F4] rounded-b-2xl">
                    <button onClick={() => setShowForm(false)}
                      className="flex-1 py-3 text-sm font-medium border border-[#C8DFD2] rounded-xl hover:bg-[#E8F2EC] bg-white text-[#4A6355] transition-colors">
                      Cancelar
                    </button>
                    <button onClick={handleSubmit}
                      disabled={!form.category || !form.area.trim() || !form.description.trim() || !form.impact || isPending}
                      className="flex-1 py-3 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
                      {isPending ? "Enviando..." : <><Send className="h-3.5 w-3.5" /> Enviar a dirección</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
