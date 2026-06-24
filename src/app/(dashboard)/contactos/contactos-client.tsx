"use client"

import { useState, useTransition } from "react"
import { Users, Plus, Search, Phone, Mail, Building2, X, Trash2, LayoutGrid, List, ChevronRight, ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import { addContact, removeContact } from "@/app/actions/contacts"
import { movePipelineStage } from "@/app/actions/pipeline"
import { MobileHeader } from "@/components/layout/mobile-header"
import { toast } from "sonner"
import type { Contact, PipelineStage } from "@/types"
import { UpgradeModal } from "@/components/ui/upgrade-modal"

type ContactType = Contact["type"]
type ContactStatus = Contact["status"]

const PIPELINE_STAGES: { key: PipelineStage; label: string; color: string; dot: string }[] = [
  { key: "lead",           label: "Lead",         color: "bg-gray-100 text-gray-600",    dot: "bg-gray-400" },
  { key: "contactado",     label: "Contactado",   color: "bg-blue-50 text-blue-700",     dot: "bg-blue-400" },
  { key: "propuesta",      label: "Propuesta",    color: "bg-violet-50 text-violet-700", dot: "bg-violet-400" },
  { key: "negociacion",    label: "Negociación",  color: "bg-amber-50 text-amber-700",   dot: "bg-amber-400" },
  { key: "cerrado_ganado", label: "Cerrado ✓",    color: "bg-[#EAF5EF] text-[#3A6A54]", dot: "bg-[#4E8B6B]" },
  { key: "cerrado_perdido",label: "Perdido",       color: "bg-red-50 text-red-600",       dot: "bg-red-400" },
]

const typeColors: Record<ContactType, string> = {
  cliente:     "bg-[#E8F2EC] text-[#4E8B6B]",
  lead:        "bg-blue-100 text-blue-700",
  proveedor:   "bg-violet-100 text-violet-700",
  colaborador: "bg-orange-100 text-orange-700",
  otro:        "bg-gray-100 text-gray-500",
}

const emptyForm = {
  name: "", email: "", phone: "", company: "",
  type: "cliente" as ContactType,
  status: "activo" as ContactStatus,
  notes: "",
  pipeline_stage: "lead" as PipelineStage,
  pipeline_value: 0,
}

export default function ContactosClient({ initialContacts, userId }: { initialContacts: Contact[]; userId: string }) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<ContactType | "todos">("todos")
  const [view, setView] = useState<"lista" | "pipeline">("lista")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [isPending, startTransition] = useTransition()
  const [upgradeMsg, setUpgradeMsg] = useState("")

  const filtered = contacts.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.company ?? "").toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === "todos" || c.type === filterType
    return matchSearch && matchType
  })

  function handleAdd() {
    if (!form.name.trim()) return
    startTransition(async () => {
      try {
        await addContact(form)
        setContacts(prev => [{
          ...form, id: crypto.randomUUID(), user_id: userId, portal_token: null,
          last_contact: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }, ...prev])
        setForm(emptyForm)
        setShowForm(false)
        toast.success("Contacto añadido")
      } catch (e: any) {
        const msg: string = e.message ?? ""
        if (msg.includes("límite") || msg.includes("Actualiza")) setUpgradeMsg(msg)
        else toast.error(msg)
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await removeContact(id)
      setContacts(prev => prev.filter(c => c.id !== id))
      toast.success("Contacto eliminado")
    })
  }

  function handleMoveStage(contactId: string, newStage: PipelineStage) {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, pipeline_stage: newStage } : c))
    startTransition(async () => {
      try {
        await movePipelineStage(contactId, newStage)
      } catch { toast.error("Error al mover contacto") }
    })
  }

  function getPortalUrl(c: Contact) {
    if (!c.portal_token) return null
    return `${window.location.origin}/p/${c.portal_token}`
  }

  const types: (ContactType | "todos")[] = ["todos", "cliente", "lead", "proveedor", "colaborador"]

  // Pipeline view
  const PipelineView = () => (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {PIPELINE_STAGES.map(stage => {
          const stageContacts = filtered.filter(c => (c.pipeline_stage ?? "lead") === stage.key)
          const totalValue = stageContacts.reduce((s, c) => s + Number(c.pipeline_value ?? 0), 0)
          return (
            <div key={stage.key} className="w-56 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
                  <span className="text-xs font-semibold text-[#2D5C44]">{stage.label}</span>
                </div>
                <span className="text-xs text-[#6B8C7A] bg-[#F2F4F3] px-1.5 py-0.5 rounded-full">{stageContacts.length}</span>
              </div>
              {totalValue > 0 && (
                <p className="text-xs text-[#6B8C7A] mb-2">{totalValue.toLocaleString("es-ES")} €</p>
              )}
              <div className="space-y-2 min-h-[80px]">
                {stageContacts.map(c => (
                  <Card key={c.id} className="p-3 border-[#E8ECEA] bg-white hover:shadow-sm transition-shadow group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#E8F2EC] flex items-center justify-center text-xs font-bold text-[#4E8B6B] shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#2D5C44] truncate">{c.name}</p>
                          {c.company && <p className="text-[10px] text-[#6B8C7A] truncate">{c.company}</p>}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(c.id)} className="opacity-0 group-hover:opacity-100 text-[#C8DFD2] hover:text-red-400 transition-all">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    {c.pipeline_value > 0 && (
                      <p className="text-xs font-semibold text-[#4E8B6B] mb-2">{Number(c.pipeline_value).toLocaleString("es-ES")} €</p>
                    )}
                    {/* Mover a siguiente etapa */}
                    <div className="flex gap-1 flex-wrap">
                      {PIPELINE_STAGES.filter(s => s.key !== stage.key).slice(0, 2).map(s => (
                        <button key={s.key} onClick={() => handleMoveStage(c.id, s.key)}
                          className="text-[9px] px-1.5 py-0.5 bg-[#F2F4F3] hover:bg-[#E8F2EC] text-[#6B7280] rounded transition-colors">
                          → {s.label}
                        </button>
                      ))}
                    </div>
                  </Card>
                ))}
                {stageContacts.length === 0 && (
                  <div className="border-2 border-dashed border-[#E8ECEA] rounded-xl h-16 flex items-center justify-center">
                    <p className="text-[10px] text-[#C8DFD2]">Sin contactos</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div>
      <UpgradeModal open={!!upgradeMsg} onClose={() => setUpgradeMsg("")} message={upgradeMsg} />
      <MobileHeader title="Contactos" />
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#2D5C44] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#4E8B6B]" /> Contactos
            </h1>
            <p className="text-sm text-[#6B8C7A] mt-0.5">{contacts.length} contacto{contacts.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle vista */}
            <div className="flex items-center bg-[#F2F4F3] rounded-xl p-1">
              <button onClick={() => setView("lista")}
                className={`px-2 py-1 rounded-lg transition-colors ${view === "lista" ? "bg-white shadow-sm text-[#2D5C44]" : "text-[#6B7280]"}`}>
                <List className="h-4 w-4" />
              </button>
              <button onClick={() => setView("pipeline")}
                className={`px-2 py-1 rounded-lg transition-colors ${view === "pipeline" ? "bg-white shadow-sm text-[#2D5C44]" : "text-[#6B7280]"}`}>
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-3 py-2 md:px-4 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo contacto</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B8C7A]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o empresa..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B] bg-white placeholder:text-[#6B8C7A]" />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          {types.map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize whitespace-nowrap shrink-0 ${filterType === t ? "bg-[#4E8B6B] text-white" : "bg-white border border-[#C8DFD2] text-[#4A6355] hover:bg-[#E8F2EC]"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Vistas */}
        {view === "pipeline" ? (
          <PipelineView />
        ) : (
          <>
            {filtered.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-[#C8DFD2]">
                <Users className="h-10 w-10 text-[#C8DFD2] mx-auto mb-3" />
                <p className="font-semibold text-[#2D5C44] mb-1">
                  {search || filterType !== "todos" ? "Sin resultados" : "Sin contactos aún"}
                </p>
                <p className="text-sm text-[#6B8C7A] mb-5">
                  {search || filterType !== "todos" ? "Prueba con otros filtros" : "Añade tu primer cliente, lead o colaborador."}
                </p>
                {!search && filterType === "todos" && (
                  <button onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-colors">
                    <Plus className="h-4 w-4" /> Añadir contacto
                  </button>
                )}
              </Card>
            ) : (
              <div className="grid gap-2.5">
                {filtered.map(c => {
                  const stageInfo = PIPELINE_STAGES.find(s => s.key === (c.pipeline_stage ?? "lead"))
                  const portalUrl = c.portal_token ? `/p/${c.portal_token}` : null
                  return (
                    <Card key={c.id} className="p-4 hover:shadow-md transition-all group border-[#C8DFD2] bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#E8F2EC] flex items-center justify-center text-sm font-bold text-[#4E8B6B] shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-[#2D5C44] text-sm">{c.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[c.type]}`}>{c.type}</span>
                              {stageInfo && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageInfo.color}`}>{stageInfo.label}</span>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-3 text-xs text-[#6B8C7A]">
                              {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3 shrink-0" /><span className="truncate max-w-[160px]">{c.email}</span></span>}
                              {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" />{c.phone}</span>}
                              {c.company && <span className="flex items-center gap-1"><Building2 className="h-3 w-3 shrink-0" />{c.company}</span>}
                              {c.pipeline_value > 0 && <span className="font-medium text-[#4E8B6B]">{Number(c.pipeline_value).toLocaleString("es-ES")} €</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {portalUrl && (
                            <a href={portalUrl} target="_blank" rel="noopener noreferrer"
                              className="text-[#6B8C7A] hover:text-[#4E8B6B] p-1 transition-colors opacity-0 group-hover:opacity-100"
                              title="Ver portal del cliente">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button onClick={() => handleDelete(c.id)}
                            className="text-[#C8DFD2] hover:text-red-400 transition-all p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Modal nuevo contacto */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#C8DFD2] sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl">
                <h2 className="font-bold text-[#2D5C44]">Nuevo contacto</h2>
                <button onClick={() => setShowForm(false)} className="text-[#6B8C7A] hover:text-[#2D5C44]"><X className="h-5 w-5" /></button>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Nombre *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus
                    className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]" placeholder="Nombre completo" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Email</label>
                    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email"
                      className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]" placeholder="email@ejemplo.com" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Teléfono</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} type="tel"
                      className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]" placeholder="600 000 000" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Empresa</label>
                  <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]" placeholder="Nombre de la empresa" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Tipo</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ContactType }))}
                      className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B] bg-white">
                      <option value="cliente">Cliente</option>
                      <option value="lead">Lead</option>
                      <option value="proveedor">Proveedor</option>
                      <option value="colaborador">Colaborador</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Etapa pipeline</label>
                    <select value={form.pipeline_stage} onChange={e => setForm(f => ({ ...f, pipeline_stage: e.target.value as PipelineStage }))}
                      className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B] bg-white">
                      {PIPELINE_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Valor estimado (€)</label>
                  <input value={form.pipeline_value || ""} onChange={e => setForm(f => ({ ...f, pipeline_value: parseFloat(e.target.value) || 0 }))} type="number" min="0"
                    className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Notas</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                    className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B] resize-none" placeholder="Notas sobre este contacto..." />
                </div>
              </div>
              <div className="flex gap-3 px-5 py-4 border-t border-[#C8DFD2] bg-[#F2F7F4] rounded-b-2xl">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 text-sm font-medium border border-[#C8DFD2] rounded-xl hover:bg-[#E8F2EC] bg-white text-[#4A6355] transition-colors">Cancelar</button>
                <button onClick={handleAdd} disabled={!form.name.trim() || isPending}
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
