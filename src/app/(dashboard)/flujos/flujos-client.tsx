"use client"

import { useState, useTransition } from "react"
import {
  Zap, Mail, Bell, Calendar, BarChart2, CheckCircle,
  Clock, Users, ToggleLeft, ToggleRight, Info, ChevronDown, ChevronUp
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { MobileHeader } from "@/components/layout/mobile-header"
import { toast } from "sonner"
import { toggleFlow } from "@/app/actions/flows"
import type { Flow, FlowKey } from "@/types"

// ─── Catálogo de flujos ──────────────────────────────────────────────────────

interface FlowDef {
  key: FlowKey
  title: string
  description: string
  icon: React.ReactNode
  category: string
  configFields?: { key: string; label: string; type: 'number' | 'text' | 'email'; placeholder: string; defaultValue: string }[]
}

const FLOW_CATALOG: FlowDef[] = [
  {
    key: "welcome_email",
    category: "Contactos",
    icon: <Mail className="h-5 w-5" />,
    title: "Bienvenida a nuevos contactos",
    description: "Cuando añadas un nuevo contacto, ZYRA le enviará automáticamente un email de bienvenida personalizado con tu nombre.",
    configFields: [],
  },
  {
    key: "invoice_reminder",
    category: "Facturación",
    icon: <Bell className="h-5 w-5" />,
    title: "Recordatorio de facturas sin pagar",
    description: "Si una factura lleva más de X días enviada sin que la marquen como pagada, recibirás un aviso por email.",
    configFields: [
      { key: "days_overdue", label: "Avisar después de (días)", type: "number", placeholder: "15", defaultValue: "15" },
    ],
  },
  {
    key: "contact_followup",
    category: "Contactos",
    icon: <Users className="h-5 w-5" />,
    title: "Seguimiento de contactos inactivos",
    description: "Si un contacto lleva X días sin actividad, ZYRA te recordará que tienes que ponerte en contacto.",
    configFields: [
      { key: "days_inactive", label: "Días sin actividad", type: "number", placeholder: "30", defaultValue: "30" },
    ],
  },
  {
    key: "weekly_summary",
    category: "Resúmenes",
    icon: <Calendar className="h-5 w-5" />,
    title: "Resumen semanal cada lunes",
    description: "Cada lunes a las 9:00 recibirás un email con tus tareas pendientes, contactos activos y facturas por cobrar de la semana.",
    configFields: [],
  },
  {
    key: "monthly_report",
    category: "Resúmenes",
    icon: <BarChart2 className="h-5 w-5" />,
    title: "Informe mensual de actividad",
    description: "El primer día de cada mes recibirás un resumen de tus ingresos, gastos, tareas completadas y horas trabajadas del mes anterior.",
    configFields: [],
  },
  {
    key: "task_overdue",
    category: "Tareas",
    icon: <CheckCircle className="h-5 w-5" />,
    title: "Aviso de tareas vencidas",
    description: "Si tienes tareas con fecha de vencimiento pasada y sin completar, recibirás un recordatorio diario hasta que las resuelvas.",
    configFields: [],
  },
  {
    key: "birthday_greeting",
    category: "Contactos",
    icon: <Clock className="h-5 w-5" />,
    title: "Recordatorio de cumpleaños",
    description: "Próximamente — ZYRA te avisará cuando un contacto cumpla años para que no se te olvide felicitarle.",
    configFields: [],
  },
]

const CATEGORIES = Array.from(new Set(FLOW_CATALOG.map(f => f.category)))

// ─── FlowCard ────────────────────────────────────────────────────────────────

function FlowCard({ def, flow, onToggle }: {
  def: FlowDef
  flow: Flow | undefined
  onToggle: (key: FlowKey, enabled: boolean, config: Record<string, unknown>) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [config, setConfig] = useState<Record<string, string>>(() => {
    const saved = flow?.config as Record<string, string> | undefined
    const defaults: Record<string, string> = {}
    def.configFields?.forEach(f => { defaults[f.key] = String(saved?.[f.key] ?? f.defaultValue) })
    return defaults
  })
  const [isPending, start] = useTransition()

  const enabled = flow?.enabled ?? false
  const isComing = def.key === "birthday_greeting"

  function handleToggle() {
    if (isComing) { toast.info("Este flujo estará disponible próximamente"); return }
    const numConfig: Record<string, unknown> = {}
    def.configFields?.forEach(f => {
      numConfig[f.key] = f.type === "number" ? Number(config[f.key]) : config[f.key]
    })
    start(async () => {
      try {
        await toggleFlow(def.key, !enabled, numConfig)
        onToggle(def.key, !enabled, numConfig)
        toast.success(enabled ? "Flujo desactivado" : "Flujo activado ✓")
      } catch (e: any) { toast.error(e.message) }
    })
  }

  return (
    <Card className={`border-2 transition-all ${enabled ? 'border-[#A8CEBA] bg-[#F4FAF7]' : 'border-[#CAE8D8] bg-white'} ${isComing ? 'opacity-60' : ''}`}>
      <div className="p-4 flex items-start gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${enabled ? 'bg-[#A8CEBA] text-white' : 'bg-[#EAF5EF] text-[#A8CEBA]'}`}>
          {def.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-[#2D5C44]">{def.title}</h3>
            {isComing && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">Próximamente</span>
            )}
            {enabled && !isComing && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAF5EF] text-[#3A6A54] font-medium">Activo</span>
            )}
          </div>
          <p className="text-xs text-[#6B8C7A] mt-0.5 leading-relaxed">{def.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {def.configFields && def.configFields.length > 0 && (
            <button onClick={() => setExpanded(e => !e)}
              className="text-[#6B8C7A] hover:text-[#2D5C44] p-1">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
          <button onClick={handleToggle} disabled={isPending} className="shrink-0">
            {enabled
              ? <ToggleRight className="h-7 w-7 text-[#A8CEBA]" />
              : <ToggleLeft className="h-7 w-7 text-[#CAE8D8]" />}
          </button>
        </div>
      </div>

      {expanded && def.configFields && def.configFields.length > 0 && (
        <div className="px-4 pb-4 border-t border-[#CAE8D8] pt-3">
          <div className="flex flex-wrap gap-3">
            {def.configFields.map(field => (
              <div key={field.key} className="flex-1 min-w-[140px]">
                <label className="text-xs font-semibold text-[#4A6355] mb-1 block">{field.label}</label>
                <input
                  type={field.type}
                  value={config[field.key] ?? field.defaultValue}
                  onChange={e => setConfig(c => ({ ...c, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-[#6B8C7A] mt-2 flex items-center gap-1">
            <Info className="h-3 w-3" /> Los cambios se aplican al activar el flujo.
          </p>
        </div>
      )}
    </Card>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function FlujoClient({ initialFlows, userEmail }: {
  initialFlows: Flow[]
  userEmail: string
}) {
  const [flows, setFlows] = useState<Map<FlowKey, Flow>>(() => {
    const m = new Map<FlowKey, Flow>()
    initialFlows.forEach(f => m.set(f.flow_key as FlowKey, f))
    return m
  })

  function handleToggle(key: FlowKey, enabled: boolean, config: Record<string, unknown>) {
    setFlows(prev => {
      const next = new Map(prev)
      const existing = next.get(key)
      next.set(key, {
        ...(existing ?? { id: "", user_id: "", flow_key: key, last_run_at: null, created_at: "", updated_at: "" }),
        flow_key: key, enabled, config,
      })
      return next
    })
  }

  const activeCount = Array.from(flows.values()).filter(f => f.enabled).length

  return (
    <div>
      <MobileHeader title="Flujos automáticos" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto">

        <div className="hidden md:flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-[#A8CEBA]" />
          <h1 className="text-2xl font-bold text-[#2D5C44]">Flujos automáticos</h1>
        </div>

        {/* Banner explicativo */}
        <div className="flex items-start gap-3 p-4 bg-[#EAF5EF] border border-[#CAE8D8] rounded-2xl mb-6">
          <Zap className="h-5 w-5 text-[#A8CEBA] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#2D5C44] mb-1">ZYRA trabaja por ti</p>
            <p className="text-xs text-[#4A6355] leading-relaxed">
              Activa los flujos que necesites y ZYRA se encargará de las tareas repetitivas: emails automáticos, recordatorios y resúmenes. Sin tecnicismos, solo actívalos.
            </p>
            {activeCount > 0 && (
              <p className="text-xs font-semibold text-[#A8CEBA] mt-2">{activeCount} flujo{activeCount !== 1 ? 's' : ''} activo{activeCount !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>

        {/* Flujos por categoría */}
        {CATEGORIES.map(cat => (
          <div key={cat} className="mb-6">
            <h2 className="text-xs font-bold text-[#6B8C7A] uppercase tracking-widest mb-3">{cat}</h2>
            <div className="space-y-3">
              {FLOW_CATALOG.filter(f => f.category === cat).map(def => (
                <FlowCard
                  key={def.key}
                  def={def}
                  flow={flows.get(def.key)}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
        ))}

        <p className="text-xs text-center text-[#6B8C7A] mt-4">
          Los flujos se envían a <strong>{userEmail}</strong>. Puedes cambiarlo en tu perfil.
        </p>
      </div>
    </div>
  )
}
