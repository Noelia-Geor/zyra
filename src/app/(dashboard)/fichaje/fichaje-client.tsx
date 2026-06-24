"use client"

import { useState, useTransition, useEffect, useCallback } from "react"
import { Clock, LogIn, LogOut, Calendar, Timer, Briefcase, TrendingUp, ArrowDownToLine } from "lucide-react"
import { exportTimeEntries } from "@/lib/export"
import { Card } from "@/components/ui/card"
import { MobileHeader } from "@/components/layout/mobile-header"
import { toast } from "sonner"
import { doClockIn, doClockOut } from "@/app/actions/timeclock"
import type { TimeEntry } from "@/types"

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDuration(mins: number | null): string {
  if (!mins) return "—"
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m > 0 ? m + "m" : ""}`
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })
}

function groupByDay(entries: TimeEntry[]) {
  const map = new Map<string, TimeEntry[]>()
  for (const e of entries) {
    const day = e.clock_in.split("T")[0]
    if (!map.has(day)) map.set(day, [])
    map.get(day)!.push(e)
  }
  return Array.from(map.entries())
}

function weekMinutes(entries: TimeEntry[]) {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - now.getDay() + 1)
  monday.setHours(0, 0, 0, 0)
  return entries
    .filter(e => new Date(e.clock_in) >= monday && e.duration_mins)
    .reduce((s, e) => s + (e.duration_mins ?? 0), 0)
}

function monthMinutes(entries: TimeEntry[]) {
  const now = new Date()
  return entries
    .filter(e => {
      const d = new Date(e.clock_in)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && e.duration_mins
    })
    .reduce((s, e) => s + (e.duration_mins ?? 0), 0)
}

// ─── Live elapsed timer ──────────────────────────────────────────────────────

function useElapsed(clockIn: string | null) {
  const [mins, setMins] = useState(0)
  useEffect(() => {
    if (!clockIn) { setMins(0); return }
    const tick = () => setMins(Math.floor((Date.now() - new Date(clockIn).getTime()) / 60000))
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [clockIn])
  return mins
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function FichajeClient({ initialEntries, activeEntry: initialActive }: {
  initialEntries: TimeEntry[]
  activeEntry: TimeEntry | null
}) {
  const [entries, setEntries] = useState(initialEntries)
  const [active, setActive] = useState(initialActive)
  const [project, setProject] = useState("")
  const [isPending, start] = useTransition()
  const elapsed = useElapsed(active?.clock_in ?? null)

  const projects = Array.from(new Set(entries.map(e => e.project).filter(Boolean))) as string[]

  function handleClockIn() {
    start(async () => {
      try {
        const entry = await doClockIn(project || undefined)
        setActive(entry)
        toast.success("Entrada registrada")
      } catch (e: any) { toast.error(e.message) }
    })
  }

  function handleClockOut() {
    if (!active) return
    start(async () => {
      try {
        const updated = await doClockOut(active.id)
        setActive(null)
        setEntries(prev => [updated, ...prev.filter(e => e.id !== updated.id)])
        toast.success(`Salida registrada · ${fmtDuration(updated.duration_mins)}`)
      } catch (e: any) { toast.error(e.message) }
    })
  }

  const days = groupByDay(entries.filter(e => e.clock_out))
  const thisWeek = weekMinutes(entries)
  const thisMonth = monthMinutes(entries)

  return (
    <div>
      <MobileHeader title="Fichaje" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto">

        <div className="hidden md:flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#A8CEBA]" />
            <h1 className="text-2xl font-bold text-[#2D5C44]">Control de fichaje</h1>
          </div>
          <button onClick={() => exportTimeEntries(entries)}
            className="flex items-center gap-2 px-3 py-2 border border-[#CAE8D8] text-[#4A6355] rounded-xl hover:bg-[#EAF5EF] text-sm font-medium transition-colors">
            <ArrowDownToLine className="h-4 w-4" /> Exportar CSV
          </button>
        </div>

        {/* Estado actual */}
        <Card className={`p-6 border-2 mb-5 text-center transition-all ${active ? 'border-[#A8CEBA] bg-[#EAF5EF]' : 'border-[#CAE8D8] bg-white'}`}>
          {active ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#A8CEBA] animate-pulse" />
                <span className="text-sm font-semibold text-[#3A6A54]">Turno en curso</span>
              </div>
              <p className="text-3xl font-bold text-[#2D5C44] mb-1">{fmtDuration(elapsed)}</p>
              <p className="text-xs text-[#6B8C7A] mb-4">Entrada: {fmtTime(active.clock_in)}{active.project ? ` · ${active.project}` : ''}</p>
              <button onClick={handleClockOut} disabled={isPending}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#A8CEBA] text-white rounded-xl hover:bg-[#90BBAA] font-semibold transition-colors disabled:opacity-50">
                <LogOut className="h-4 w-4" /> Registrar salida
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Timer className="h-8 w-8 text-[#CAE8D8]" />
              </div>
              <p className="text-sm text-[#6B8C7A] mb-4">No tienes ningún turno activo</p>
              {/* Proyecto opcional */}
              <div className="flex gap-2 mb-4 max-w-xs mx-auto">
                <input value={project} onChange={e => setProject(e.target.value)}
                  list="projects-list"
                  placeholder="Proyecto / cliente (opcional)"
                  className="flex-1 px-3 py-2 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]" />
                <datalist id="projects-list">
                  {projects.map(p => <option key={p} value={p} />)}
                </datalist>
              </div>
              <button onClick={handleClockIn} disabled={isPending}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#A8CEBA] text-white rounded-xl hover:bg-[#90BBAA] font-semibold transition-colors disabled:opacity-50">
                <LogIn className="h-4 w-4" /> Registrar entrada
              </button>
            </>
          )}
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4 border-[#CAE8D8] bg-white">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-[#A8CEBA]" />
              <span className="text-xs text-[#6B8C7A] font-medium">Esta semana</span>
            </div>
            <p className="text-xl font-bold text-[#2D5C44]">{fmtDuration(thisWeek)}</p>
          </Card>
          <Card className="p-4 border-[#CAE8D8] bg-white">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-[#A8CEBA]" />
              <span className="text-xs text-[#6B8C7A] font-medium">Este mes</span>
            </div>
            <p className="text-xl font-bold text-[#2D5C44]">{fmtDuration(thisMonth)}</p>
          </Card>
        </div>

        {/* Historial */}
        {days.length === 0 ? (
          <Card className="border-[#CAE8D8] bg-white p-8 text-center">
            <Clock className="h-10 w-10 text-[#CAE8D8] mx-auto mb-3" />
            <p className="text-sm text-[#6B8C7A]">Tu historial de fichajes aparecerá aquí.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {days.map(([day, dayEntries]) => {
              const total = dayEntries.reduce((s, e) => s + (e.duration_mins ?? 0), 0)
              return (
                <div key={day}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#4A6355] uppercase tracking-wide">
                      {fmtDate(day)}
                    </span>
                    <span className="text-xs font-bold text-[#A8CEBA]">{fmtDuration(total)}</span>
                  </div>
                  <div className="space-y-2">
                    {dayEntries.map(e => (
                      <Card key={e.id} className="border-[#CAE8D8] bg-white px-4 py-3 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#EAF5EF] flex items-center justify-center shrink-0">
                          <Briefcase className="h-4 w-4 text-[#A8CEBA]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#2D5C44]">
                            {fmtTime(e.clock_in)} — {e.clock_out ? fmtTime(e.clock_out) : '—'}
                          </p>
                          {e.project && <p className="text-xs text-[#6B8C7A] truncate">{e.project}</p>}
                        </div>
                        <span className="text-sm font-semibold text-[#A8CEBA] shrink-0">{fmtDuration(e.duration_mins)}</span>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
