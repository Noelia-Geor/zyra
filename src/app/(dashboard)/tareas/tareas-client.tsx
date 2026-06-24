"use client"

import { useState, useTransition } from "react"
import { CheckSquare, Plus, X, CheckCircle2, Clock, Circle, Trash2, LayoutGrid, List } from "lucide-react"
import { Card } from "@/components/ui/card"
import { addTask, changeTaskStatus, removeTask } from "@/app/actions/tasks"
import { MobileHeader } from "@/components/layout/mobile-header"
import { toast } from "sonner"
import type { Task } from "@/types"

type Status = Task["status"]
type Priority = Task["priority"]

const priorityConfig: Record<Priority, { label: string; color: string; dot: string }> = {
  alta:  { label: "Alta",  color: "text-red-600 bg-red-50 border-red-200",         dot: "bg-red-400" },
  media: { label: "Media", color: "text-amber-600 bg-amber-50 border-amber-200",    dot: "bg-amber-400" },
  baja:  { label: "Baja",  color: "text-[#6B8C7A] bg-[#E8F2EC] border-[#C8DFD2]", dot: "bg-[#C8DFD2]" },
}

const COLUMNS: { id: Status; label: string; color: string; bg: string; border: string }[] = [
  { id: "pendiente",   label: "Pendiente",   color: "text-gray-600",   bg: "bg-gray-50",   border: "border-gray-200" },
  { id: "en_progreso", label: "En progreso", color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200" },
  { id: "completada",  label: "Completada",  color: "text-[#4E8B6B]", bg: "bg-[#E8F2EC]", border: "border-[#C8DFD2]" },
]

const emptyForm = { title: "", description: "", priority: "media" as Priority, due_date: "" }

export default function TareasClient({ initialTasks, userId }: { initialTasks: Task[]; userId: string }) {
  const [tasks, setTasks]       = useState<Task[]>(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [view, setView]         = useState<"lista" | "kanban">("lista")
  const [filter, setFilter]     = useState<Status | "todas">("todas")
  const [isPending, startTransition] = useTransition()

  const pendientes  = tasks.filter(t => t.status === "pendiente").length
  const enProgreso  = tasks.filter(t => t.status === "en_progreso").length
  const completadas = tasks.filter(t => t.status === "completada").length
  const filtered    = tasks.filter(t => filter === "todas" || t.status === filter)

  function handleAdd() {
    if (!form.title.trim()) return
    startTransition(async () => {
      await addTask(form)
      setTasks(prev => [{
        ...form, id: crypto.randomUUID(), user_id: userId,
        status: "pendiente" as Status, contact_id: null,
        due_date: form.due_date || null, description: form.description || null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }, ...prev])
      setForm(emptyForm)
      setShowForm(false)
      toast.success("Tarea añadida")
    })
  }

  function handleMoveStatus(id: string, newStatus: Status) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
    startTransition(async () => { await changeTaskStatus(id, newStatus) })
  }

  function handleCycleStatus(id: string) {
    const next: Record<Status, Status> = { pendiente: "en_progreso", en_progreso: "completada", completada: "pendiente" }
    const task = tasks.find(t => t.id === id)
    if (!task) return
    handleMoveStatus(id, next[task.status])
  }

  function handleDelete(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
    startTransition(async () => { await removeTask(id) })
    toast.success("Tarea eliminada")
  }

  const StatusIcon = ({ status }: { status: Status }) => {
    if (status === "completada")  return <CheckCircle2 className="h-5 w-5 text-[#4E8B6B]" />
    if (status === "en_progreso") return <Clock className="h-5 w-5 text-amber-500" />
    return <Circle className="h-5 w-5 text-[#C8DFD2]" />
  }

  const filterLabels: Record<string, string> = {
    todas: "Todas", pendiente: "Pendientes", en_progreso: "En progreso", completada: "Completadas"
  }

  const TaskCard = ({ t, showMove = false }: { t: Task; showMove?: boolean }) => (
    <Card className={`p-3 group transition-all border-[#C8DFD2] bg-white ${t.status === "completada" ? "opacity-50" : "hover:shadow-md"}`}>
      <div className="flex items-start gap-3">
        <button onClick={() => handleCycleStatus(t.id)} className="mt-0.5 shrink-0 hover:scale-110 transition-transform">
          <StatusIcon status={t.status} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-semibold ${t.status === "completada" ? "line-through text-[#6B8C7A]" : "text-[#2D5C44]"}`}>{t.title}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityConfig[t.priority].color}`}>
              {priorityConfig[t.priority].label}
            </span>
          </div>
          {t.description && <p className="text-xs text-[#6B8C7A] mt-0.5 truncate">{t.description}</p>}
          {t.due_date && (
            <p className="text-xs text-[#6B8C7A] mt-1">
              Vence: {new Date(t.due_date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
            </p>
          )}
          {showMove && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {COLUMNS.filter(c => c.id !== t.status).map(c => (
                <button key={c.id} onClick={() => handleMoveStatus(t.id, c.id)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${c.color} ${c.bg} ${c.border} hover:opacity-80 transition-opacity`}>
                  → {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => handleDelete(t.id)}
          className="text-[#C8DFD2] hover:text-red-400 transition-all shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Card>
  )

  return (
    <div>
      <MobileHeader title="Tareas" />
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#2D5C44] flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-[#4E8B6B]" /> Tareas
            </h1>
            <div className="flex gap-3 mt-1 text-xs text-[#6B8C7A]">
              <span><strong className="text-[#2D5C44]">{pendientes}</strong> pendientes</span>
              <span><strong className="text-amber-600">{enProgreso}</strong> en progreso</span>
              <span><strong className="text-[#4E8B6B]">{completadas}</strong> hechas</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle vista */}
            <div className="flex bg-[#E8F2EC] rounded-lg p-0.5">
              <button onClick={() => setView("lista")}
                className={`p-1.5 rounded-md transition-colors ${view === "lista" ? "bg-white shadow-sm text-[#4E8B6B]" : "text-[#6B8C7A] hover:text-[#4E8B6B]"}`}>
                <List className="h-4 w-4" />
              </button>
              <button onClick={() => setView("kanban")}
                className={`p-1.5 rounded-md transition-colors ${view === "kanban" ? "bg-white shadow-sm text-[#4E8B6B]" : "text-[#6B8C7A] hover:text-[#4E8B6B]"}`}>
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-3 py-2 md:px-4 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva tarea</span>
              <span className="sm:hidden">Nueva</span>
            </button>
          </div>
        </div>

        {/* Barra de progreso */}
        {tasks.length > 0 && (
          <div className="mb-5">
            <div className="flex justify-between text-xs text-[#6B8C7A] mb-1.5">
              <span>Progreso</span>
              <span>{completadas}/{tasks.length} completadas</span>
            </div>
            <div className="h-2 bg-[#E8F2EC] rounded-full overflow-hidden">
              <div className="h-full bg-[#4E8B6B] rounded-full transition-all"
                style={{ width: `${tasks.length ? (completadas / tasks.length) * 100 : 0}%` }} />
            </div>
          </div>
        )}

        {/* ── VISTA LISTA ── */}
        {view === "lista" && (
          <>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
              {(["todas", "pendiente", "en_progreso", "completada"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${filter === f ? "bg-[#4E8B6B] text-white" : "bg-white border border-[#C8DFD2] text-[#4A6355] hover:bg-[#E8F2EC]"}`}>
                  {filterLabels[f]}
                </button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-[#C8DFD2]">
                <CheckSquare className="h-10 w-10 text-[#C8DFD2] mx-auto mb-3" />
                <p className="font-semibold text-[#2D5C44] mb-1">
                  {filter === "todas" ? "Sin tareas aún" : "Sin tareas aquí"}
                </p>
                {filter === "todas" && (
                  <>
                    <p className="text-sm text-[#6B8C7A] mb-5">Empieza organizando tu día.</p>
                    <button onClick={() => setShowForm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-colors">
                      <Plus className="h-4 w-4" /> Nueva tarea
                    </button>
                  </>
                )}
              </Card>
            ) : (
              <div className="space-y-2">
                {filtered.map(t => <TaskCard key={t.id} t={t} />)}
              </div>
            )}
          </>
        )}

        {/* ── VISTA KANBAN ── */}
        {view === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map(col => {
              const colTasks = tasks.filter(t => t.status === col.id)
              return (
                <div key={col.id} className={`rounded-2xl border ${col.border} ${col.bg} p-3`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.bg} ${col.border} border ${col.color}`}>
                        {colTasks.length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 min-h-[80px]">
                    {colTasks.length === 0 ? (
                      <div className="text-center py-6 text-xs text-gray-400">Sin tareas</div>
                    ) : (
                      colTasks.map(t => <TaskCard key={t.id} t={t} showMove />)
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal nueva tarea */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#C8DFD2] sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl">
                <h2 className="font-bold text-[#2D5C44]">Nueva tarea</h2>
                <button onClick={() => setShowForm(false)} className="text-[#6B8C7A] hover:text-[#2D5C44]"><X className="h-5 w-5" /></button>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">¿Qué hay que hacer? *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus
                    onKeyDown={e => e.key === "Enter" && handleAdd()}
                    className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]" placeholder="Llamar a cliente, enviar propuesta..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Descripción</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                    className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B] resize-none" placeholder="Detalles opcionales..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Prioridad</label>
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                      className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B] bg-white">
                      <option value="alta">🔴 Alta</option>
                      <option value="media">🟡 Media</option>
                      <option value="baja">⚪ Baja</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Fecha límite</label>
                    <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                      className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 px-5 py-4 border-t border-[#C8DFD2] bg-[#F2F7F4] rounded-b-2xl">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 text-sm font-medium border border-[#C8DFD2] rounded-xl hover:bg-[#E8F2EC] bg-white text-[#4A6355] transition-colors">Cancelar</button>
                <button onClick={handleAdd} disabled={!form.title.trim() || isPending}
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
