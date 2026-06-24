"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, CheckSquare, Video, FileText, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { MobileHeader } from "@/components/layout/mobile-header"
import Link from "next/link"
import type { Task, Meeting, Invoice } from "@/types"

// ─── Types ───────────────────────────────────────────────────────────────────

type CalEvent = {
  date: string       // YYYY-MM-DD
  type: 'task' | 'meeting' | 'invoice'
  label: string
  color: string
  href: string
  priority?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAYS_ES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  // 0=Sun → convert to Mon=0
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

function pad(n: number) { return String(n).padStart(2, '0') }
function toDateStr(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CalendarioClient({ tasks, meetings, invoices }: {
  tasks: Task[]; meetings: Meeting[]; invoices: Invoice[]
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(today.toISOString().split('T')[0])

  // Build event map
  const eventMap = useMemo(() => {
    const map = new Map<string, CalEvent[]>()

    function add(date: string, ev: CalEvent) {
      if (!date) return
      const key = date.split('T')[0]
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ev)
    }

    for (const t of tasks) {
      if (t.due_date && t.status !== 'completada') {
        add(t.due_date, {
          date: t.due_date, type: 'task',
          label: t.title,
          color: t.priority === 'alta' ? 'bg-red-400' : t.priority === 'media' ? 'bg-amber-400' : 'bg-[#A8CEBA]',
          href: '/tareas', priority: t.priority,
        })
      }
    }

    for (const m of meetings) {
      if (m.status !== 'cancelada') {
        const date = m.scheduled_at.split('T')[0]
        add(date, { date, type: 'meeting', label: m.title, color: 'bg-blue-400', href: '/reuniones' })
      }
    }

    for (const inv of invoices) {
      if (inv.due_date && (inv.status === 'enviada' || inv.status === 'vencida')) {
        add(inv.due_date, {
          date: inv.due_date, type: 'invoice',
          label: `Factura ${inv.number} · ${inv.client_name}`,
          color: inv.status === 'vencida' ? 'bg-red-500' : 'bg-violet-400',
          href: '/facturacion',
        })
      }
    }

    return map
  }, [tasks, meetings, invoices])

  const daysInMonth  = getDaysInMonth(year, month)
  const firstDayOff  = getFirstDayOfMonth(year, month)
  const todayStr     = today.toISOString().split('T')[0]

  function prevMonth() { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const selectedEvents = selectedDay ? (eventMap.get(selectedDay) ?? []) : []

  // Legend
  const legend = [
    { color: 'bg-[#A8CEBA]', label: 'Tarea' },
    { color: 'bg-blue-400',  label: 'Reunión' },
    { color: 'bg-violet-400',label: 'Factura' },
    { color: 'bg-red-400',   label: 'Urgente/Vencido' },
  ]

  return (
    <div>
      <MobileHeader title="Calendario" />
      <div className="p-4 md:p-6 max-w-3xl mx-auto">

        <div className="hidden md:flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-[#A8CEBA]" />
          <h1 className="text-2xl font-bold text-[#2D5C44]">Calendario</h1>
        </div>

        <Card className="border-[#CAE8D8] bg-white p-4 mb-4">
          {/* Header mes */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-[#EAF5EF] rounded-xl transition-colors text-[#6B8C7A]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="text-base font-bold text-[#2D5C44]">{MONTHS_ES[month]} {year}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-[#EAF5EF] rounded-xl transition-colors text-[#6B8C7A]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Cabecera días */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_ES.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-[#6B8C7A] py-1">{d}</div>
            ))}
          </div>

          {/* Grid días */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Celdas vacías al inicio */}
            {Array.from({ length: firstDayOff }).map((_, i) => <div key={`e${i}`} />)}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = toDateStr(year, month, day)
              const events = eventMap.get(dateStr) ?? []
              const isToday = dateStr === todayStr
              const isSelected = dateStr === selectedDay
              const isPast = dateStr < todayStr

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(dateStr)}
                  className={`
                    relative flex flex-col items-center py-1.5 px-0.5 rounded-xl transition-all min-h-[48px]
                    ${isSelected ? 'bg-[#A8CEBA] text-white' : isToday ? 'bg-[#EAF5EF] text-[#2D5C44]' : 'hover:bg-[#F4FAF7] text-[#2D5C44]'}
                    ${isPast && !isToday && !isSelected ? 'opacity-50' : ''}
                  `}
                >
                  <span className={`text-xs font-semibold mb-0.5 ${isSelected ? 'text-white' : ''}`}>{day}</span>
                  {/* Dots */}
                  {events.length > 0 && (
                    <div className="flex gap-0.5 flex-wrap justify-center max-w-[32px]">
                      {events.slice(0, 3).map((ev, idx) => (
                        <span key={idx} className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white/80' : ev.color}`} />
                      ))}
                      {events.length > 3 && <span className={`text-[8px] ${isSelected ? 'text-white' : 'text-[#6B8C7A]'}`}>+{events.length - 3}</span>}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Leyenda */}
          <div className="flex gap-3 mt-4 flex-wrap justify-center">
            {legend.map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-[#6B8C7A]">
                <span className={`h-2 w-2 rounded-full ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>
        </Card>

        {/* Eventos del día seleccionado */}
        {selectedDay && (
          <div>
            <h3 className="text-sm font-bold text-[#2D5C44] mb-3">
              {new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>

            {selectedEvents.length === 0 ? (
              <Card className="border-[#CAE8D8] bg-white p-6 text-center">
                <Calendar className="h-8 w-8 text-[#CAE8D8] mx-auto mb-2" />
                <p className="text-sm text-[#6B8C7A]">Sin eventos este día</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((ev, i) => (
                  <Link key={i} href={ev.href}>
                    <Card className="border-[#CAE8D8] bg-white p-3 flex items-center gap-3 hover:shadow-sm transition-all">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        ev.type === 'task' ? 'bg-[#EAF5EF]' : ev.type === 'meeting' ? 'bg-blue-50' : 'bg-violet-50'
                      }`}>
                        {ev.type === 'task'    && <CheckSquare className="h-4 w-4 text-[#A8CEBA]" />}
                        {ev.type === 'meeting' && <Video className="h-4 w-4 text-blue-400" />}
                        {ev.type === 'invoice' && <FileText className="h-4 w-4 text-violet-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2D5C44] truncate">{ev.label}</p>
                        <p className="text-xs text-[#6B8C7A] capitalize">
                          {ev.type === 'task' ? 'Tarea' : ev.type === 'meeting' ? 'Reunión' : 'Factura vence'}
                          {ev.priority === 'alta' && ' · Prioridad alta'}
                        </p>
                      </div>
                      <span className={`h-2 w-2 rounded-full shrink-0 ${ev.color}`} />
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
