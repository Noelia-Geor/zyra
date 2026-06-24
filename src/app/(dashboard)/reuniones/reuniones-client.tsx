"use client"

import { useState, useTransition } from "react"
import { Video, Plus, X, Calendar, Clock, Trash2, ExternalLink, Users, Info } from "lucide-react"
import { Card } from "@/components/ui/card"
import { MobileHeader } from "@/components/layout/mobile-header"
import { scheduleMeeting, cancelMeeting, removeMeeting } from "@/app/actions/meetings"
import { toast } from "sonner"
import type { Meeting } from "@/types"

const statusConfig: Record<Meeting["status"], { label: string; color: string }> = {
  programada:  { label: "Programada",  color: "bg-blue-50 text-blue-700 border-blue-200" },
  en_curso:    { label: "En curso",    color: "bg-[#E8F2EC] text-[#4E8B6B] border-[#C8DFD2]" },
  finalizada:  { label: "Finalizada",  color: "bg-gray-50 text-gray-500 border-gray-200" },
  cancelada:   { label: "Cancelada",   color: "bg-red-50 text-red-400 border-red-200" },
}

const emptyForm = {
  title: "",
  description: "",
  date: "",
  time: "",
  duration_minutes: 60,
}

// Sala de video embebida con Daily.co
function VideoRoom({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-[#4E8B6B]" />
          <span className="text-white text-sm font-medium">Reunión en curso — ZYRA</span>
        </div>
        <button onClick={onClose}
          className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
          <X className="h-3.5 w-3.5" /> Salir
        </button>
      </div>
      <iframe src={url} allow="camera;microphone;fullscreen;display-capture;autoplay"
        className="flex-1 w-full border-0" />
    </div>
  )
}

export default function ReunionesClient({ initialMeetings, hasDailyKey }: { initialMeetings: Meeting[]; hasDailyKey: boolean }) {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [activeRoom, setActiveRoom] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const upcoming = meetings.filter(m => m.status === "programada" &&
    new Date(m.scheduled_at) > new Date()).sort((a, b) =>
    new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

  const past = meetings.filter(m => m.status !== "programada" ||
    new Date(m.scheduled_at) <= new Date())

  function handleSchedule() {
    if (!form.title.trim() || !form.date || !form.time) return
    startTransition(async () => {
      try {
        const scheduled_at = new Date(`${form.date}T${form.time}`).toISOString()
        const meeting = await scheduleMeeting({
          title: form.title,
          description: form.description || undefined,
          scheduled_at,
          duration_minutes: form.duration_minutes,
        })
        setMeetings(prev => [meeting, ...prev])
        setForm(emptyForm)
        setShowForm(false)
        toast.success(hasDailyKey ? "Reunión creada con sala de vídeo" : "Reunión agendada")
      } catch (e: any) {
        toast.error(e.message)
      }
    })
  }

  function handleDelete(id: string) {
    setMeetings(prev => prev.filter(m => m.id !== id))
    startTransition(async () => { await removeMeeting(id) })
    toast.success("Reunión eliminada")
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("es-ES", {
      weekday: "long", day: "numeric", month: "long",
    })
  }
  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <>
      {activeRoom && (
        <VideoRoom url={activeRoom} onClose={() => setActiveRoom(null)} />
      )}

      <div>
        <MobileHeader title="Reuniones" />
        <div className="p-4 md:p-6 max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#2D5C44] flex items-center gap-2">
                <Video className="h-5 w-5 text-[#4E8B6B]" /> Reuniones
              </h1>
              <p className="text-sm text-[#6B8C7A] mt-0.5">
                {upcoming.length} próxima{upcoming.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-3 py-2 md:px-4 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Agendar reunión</span>
              <span className="sm:hidden">Nueva</span>
            </button>
          </div>

          {/* Banner Daily.co si no está configurado */}
          {!hasDailyKey && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-5">
              <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Videollamadas no activadas</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Para activar salas de vídeo, crea una cuenta gratuita en{" "}
                  <a href="https://www.daily.co" target="_blank" rel="noopener" className="underline font-medium">daily.co</a>
                  {" "}y añade tu API key en el fichero .env.local como <code className="bg-amber-100 px-1 rounded">DAILY_API_KEY</code>.
                </p>
              </div>
            </div>
          )}

          {/* Próximas reuniones */}
          <h2 className="font-bold text-[#2D5C44] mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#4E8B6B]" /> Próximas
          </h2>

          {upcoming.length === 0 ? (
            <Card className="p-10 text-center border-dashed border-[#C8DFD2] mb-6">
              <Video className="h-10 w-10 text-[#C8DFD2] mx-auto mb-3" />
              <p className="font-semibold text-[#2D5C44] mb-1">Sin reuniones programadas</p>
              <p className="text-sm text-[#6B8C7A] mb-4">Agenda tu próxima reunión de equipo.</p>
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-colors">
                <Plus className="h-4 w-4" /> Agendar reunión
              </button>
            </Card>
          ) : (
            <div className="space-y-3 mb-6">
              {upcoming.map(m => (
                <Card key={m.id} className="p-4 border-[#C8DFD2] bg-white hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-[#2D5C44] text-sm">{m.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusConfig[m.status].color}`}>
                          {statusConfig[m.status].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#6B8C7A] flex-wrap">
                        <span className="flex items-center gap-1 capitalize">
                          <Calendar className="h-3 w-3" /> {formatDate(m.scheduled_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatTime(m.scheduled_at)} · {m.duration_minutes} min
                        </span>
                      </div>
                      {m.description && <p className="text-xs text-[#6B8C7A] mt-1">{m.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {m.daily_room_url ? (
                        <button onClick={() => setActiveRoom(m.daily_room_url!)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-colors">
                          <Video className="h-3.5 w-3.5" /> Unirse
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-[#6B8C7A] px-2 py-1.5 border border-[#C8DFD2] rounded-xl">
                          <Users className="h-3.5 w-3.5" /> Sin sala
                        </span>
                      )}
                      <button onClick={() => handleDelete(m.id)}
                        className="p-1.5 text-[#C8DFD2] hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Historial */}
          {past.length > 0 && (
            <>
              <h2 className="font-bold text-[#2D5C44] mb-3 text-sm text-[#6B8C7A]">Historial</h2>
              <div className="space-y-2">
                {past.slice(0, 5).map(m => (
                  <Card key={m.id} className="p-3 border-[#C8DFD2] bg-white opacity-60">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#2D5C44]">{m.title}</p>
                        <p className="text-xs text-[#6B8C7A]">
                          {formatDate(m.scheduled_at)} · {formatTime(m.scheduled_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusConfig[m.status].color}`}>
                          {statusConfig[m.status].label}
                        </span>
                        {m.daily_room_url && (
                          <a href={m.daily_room_url} target="_blank" rel="noopener"
                            className="text-[#6B8C7A] hover:text-[#4E8B6B] transition-colors">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal agendar */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#C8DFD2] sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-[#4E8B6B]" />
                <h2 className="font-bold text-[#2D5C44]">Agendar reunión</h2>
              </div>
              <button onClick={() => setShowForm(false)} className="text-[#6B8C7A] hover:text-[#2D5C44]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Título *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus
                  className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]"
                  placeholder="Revisión semanal, Kickoff proyecto..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Descripción</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                  className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B] resize-none"
                  placeholder="Orden del día, contexto..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Fecha *</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Hora *</label>
                  <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#4A6355] mb-2 block">Duración</label>
                <div className="flex gap-2">
                  {[30, 60, 90, 120].map(min => (
                    <button key={min} onClick={() => setForm(f => ({ ...f, duration_minutes: min }))}
                      className={`flex-1 py-2.5 text-xs font-medium rounded-xl border-2 transition-all ${form.duration_minutes === min ? "border-[#4E8B6B] bg-[#E8F2EC] text-[#2D5C44]" : "border-[#C8DFD2] text-[#6B8C7A]"}`}>
                      {min < 60 ? `${min}min` : `${min / 60}h`}
                    </button>
                  ))}
                </div>
              </div>

              {hasDailyKey && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-[#E8F2EC] rounded-xl">
                  <Video className="h-4 w-4 text-[#4E8B6B] shrink-0" />
                  <p className="text-xs text-[#4A6355]">Se creará automáticamente una sala de vídeo con Daily.co</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-[#C8DFD2] bg-[#F2F7F4] rounded-b-2xl">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 text-sm font-medium border border-[#C8DFD2] rounded-xl hover:bg-[#E8F2EC] bg-white text-[#4A6355] transition-colors">
                Cancelar
              </button>
              <button onClick={handleSchedule}
                disabled={!form.title.trim() || !form.date || !form.time || isPending}
                className="flex-1 py-3 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] disabled:opacity-40 transition-colors">
                {isPending ? "Creando..." : "Agendar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
