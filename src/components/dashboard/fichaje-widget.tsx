"use client"

import { useState, useEffect, useTransition } from "react"
import { Clock, LogIn, LogOut, Timer } from "lucide-react"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { doClockIn, doClockOut } from "@/app/actions/timeclock"
import type { TimeEntry } from "@/types"
import Link from "next/link"

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

function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m > 0 ? m + "m" : ""}`
}

export default function FichajeWidget({ activeEntry: initial }: { activeEntry: TimeEntry | null }) {
  const [active, setActive] = useState(initial)
  const [isPending, start] = useTransition()
  const elapsed = useElapsed(active?.clock_in ?? null)

  function handleClockIn() {
    start(async () => {
      try {
        const entry = await doClockIn()
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
        toast.success(`Salida registrada · ${fmtDuration(updated.duration_mins ?? 0)}`)
      } catch (e: any) { toast.error(e.message) }
    })
  }

  return (
    <Card className={`p-4 border-2 transition-all ${active ? 'border-[#A8CEBA] bg-[#EAF5EF]' : 'border-[#CAE8D8] bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#A8CEBA]" />
          <h2 className="font-bold text-[#2D5C44] text-sm">Fichaje</h2>
        </div>
        <Link href="/fichaje" className="text-xs text-[#6B8C7A] hover:text-[#A8CEBA] transition-colors">Ver historial →</Link>
      </div>

      {active ? (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="h-2 w-2 rounded-full bg-[#A8CEBA] animate-pulse" />
              <span className="text-xs font-semibold text-[#3A6A54]">Turno activo</span>
            </div>
            <p className="text-2xl font-bold text-[#2D5C44]">{fmtDuration(elapsed)}</p>
            <p className="text-xs text-[#6B8C7A]">
              Entrada: {new Date(active.clock_in).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
              {active.project ? ` · ${active.project}` : ""}
            </p>
          </div>
          <button onClick={handleClockOut} disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border-2 border-[#A8CEBA] text-[#3A6A54] rounded-xl hover:bg-[#CAE8D8] font-semibold text-sm transition-colors disabled:opacity-50 shrink-0">
            <LogOut className="h-4 w-4" /> Salida
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Timer className="h-3.5 w-3.5 text-[#CAE8D8]" />
              <span className="text-xs text-[#6B8C7A]">Sin turno activo</span>
            </div>
            <p className="text-sm text-[#4A6355]">¿Empezamos el día?</p>
          </div>
          <button onClick={handleClockIn} disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#A8CEBA] text-white rounded-xl hover:bg-[#90BBAA] font-semibold text-sm transition-colors disabled:opacity-50 shrink-0">
            <LogIn className="h-4 w-4" /> Entrada
          </button>
        </div>
      )}
    </Card>
  )
}
