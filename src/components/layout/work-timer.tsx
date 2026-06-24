"use client"

import { useEffect, useRef, useState } from "react"
import { Coffee, Play, SkipForward, Wind, Droplets, Footprints, Eye } from "lucide-react"

const WORK_LIMIT_MS = 2 * 60 * 60 * 1000  // 2 horas
const IDLE_RESET_MS = 5 * 60 * 1000        // 5 min inactividad = ya descansó
const TICK_MS       = 10_000
const SNOOZE_MS     = 15 * 60 * 1000
const BREAK_SECS    = 5 * 60               // 5 min de descanso

const KEY_START  = "zyra_work_start"
const KEY_LAST   = "zyra_work_last"
const KEY_SNOOZE = "zyra_work_snooze"

const tips = [
  { icon: Wind,      title: "Respira profundo",    desc: "Inhala 4 seg · aguanta 4 · exhala 4. Repite 3 veces." },
  { icon: Droplets,  title: "Bebe agua",            desc: "Hidratarte mejora la concentración hasta un 30%." },
  { icon: Footprints,title: "Levántate y muévete",  desc: "Camina un minuto. Activa la circulación." },
  { icon: Eye,       title: "Descansa la vista",    desc: "Mira algo lejano durante 20 segundos. Relaja los ojos." },
]

function pad(n: number) { return String(n).padStart(2, "0") }

export function WorkTimer() {
  const [phase, setPhase] = useState<"hidden" | "prompt" | "break">("hidden")
  const [elapsed, setElapsed]       = useState(0)
  const [breakLeft, setBreakLeft]   = useState(BREAK_SECS)
  const [tipIndex]                  = useState(() => Math.floor(Math.random() * tips.length))

  const workInterval  = useRef<ReturnType<typeof setInterval> | null>(null)
  const breakInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  function recordActivity() {
    const last    = parseInt(localStorage.getItem(KEY_LAST) ?? "0")
    const idleGap = Date.now() - last

    if (idleGap > IDLE_RESET_MS && last > 0) {
      localStorage.setItem(KEY_START, String(Date.now()))
      localStorage.removeItem(KEY_SNOOZE)
    }
    localStorage.setItem(KEY_LAST, String(Date.now()))
    if (!localStorage.getItem(KEY_START)) {
      localStorage.setItem(KEY_START, String(Date.now()))
    }
  }

  function checkWork() {
    const start  = parseInt(localStorage.getItem(KEY_START) ?? "0")
    const last   = parseInt(localStorage.getItem(KEY_LAST)  ?? "0")
    const snooze = parseInt(localStorage.getItem(KEY_SNOOZE) ?? "0")
    if (!start || !last) return
    if (Date.now() - last > IDLE_RESET_MS) return

    const worked = Date.now() - start
    setElapsed(worked)

    if (worked >= WORK_LIMIT_MS && Date.now() > snooze && phase === "hidden") {
      setPhase("prompt")
    }
  }

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"]
    events.forEach(e => window.addEventListener(e, recordActivity, { passive: true }))
    recordActivity()
    workInterval.current = setInterval(checkWork, TICK_MS)
    return () => {
      events.forEach(e => window.removeEventListener(e, recordActivity))
      if (workInterval.current)  clearInterval(workInterval.current)
      if (breakInterval.current) clearInterval(breakInterval.current)
    }
  }, [])

  // Inicia el descanso con cuenta atrás
  function startBreak() {
    setPhase("break")
    setBreakLeft(BREAK_SECS)
    breakInterval.current = setInterval(() => {
      setBreakLeft(prev => {
        if (prev <= 1) {
          clearInterval(breakInterval.current!)
          resetWork()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Cuenta el descanso como hecho (sea iniciado o no) y vuelve a trabajar
  function resetWork() {
    if (breakInterval.current) clearInterval(breakInterval.current)
    localStorage.setItem(KEY_START, String(Date.now()))
    localStorage.setItem(KEY_LAST,  String(Date.now()))
    localStorage.removeItem(KEY_SNOOZE)
    setPhase("hidden")
    setElapsed(0)
    setBreakLeft(BREAK_SECS)
  }

  function snooze() {
    localStorage.setItem(KEY_SNOOZE, String(Date.now() + SNOOZE_MS))
    setPhase("hidden")
  }

  if (phase === "hidden") return null

  const hoursW = Math.floor(elapsed / 3_600_000)
  const minsW  = Math.floor((elapsed % 3_600_000) / 60_000)
  const tip    = tips[tipIndex]
  const TipIcon = tip.icon

  const breakMins = Math.floor(breakLeft / 60)
  const breakSecs = breakLeft % 60
  const breakPct  = ((BREAK_SECS - breakLeft) / BREAK_SECS) * 100

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#F2F7F4]/95 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-[#C8DFD2] overflow-hidden">

        {/* Header verde */}
        <div className="bg-[#4E8B6B] px-6 py-5 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Coffee className="h-7 w-7 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">
            {phase === "break" ? "Estás descansando" : "Hora de descansar"}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            {phase === "break"
              ? "Desconecta unos minutos. Volverás con más energía."
              : `Llevas ${hoursW}h${minsW > 0 ? ` ${minsW}min` : ""} trabajando sin parar`}
          </p>
        </div>

        <div className="px-6 py-5">

          {/* Cuenta atrás (solo durante el descanso) */}
          {phase === "break" && (
            <div className="mb-5 text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-2">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#E8F2EC" strokeWidth="8" />
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#4E8B6B" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - breakPct / 100)}`}
                    strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <span className="absolute text-2xl font-bold text-[#2D5C44]">
                  {pad(breakMins)}:{pad(breakSecs)}
                </span>
              </div>
              <p className="text-xs text-[#6B8C7A]">
                {breakLeft === 0 ? "¡Descanso completado!" : "minutos de descanso"}
              </p>
            </div>
          )}

          {/* Consejo de bienestar */}
          <div className="flex items-start gap-3 p-4 bg-[#F2F7F4] rounded-2xl mb-5">
            <div className="p-2 bg-[#E8F2EC] rounded-xl shrink-0">
              <TipIcon className="h-4 w-4 text-[#4E8B6B]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2D5C44]">{tip.title}</p>
              <p className="text-xs text-[#6B8C7A] mt-0.5">{tip.desc}</p>
            </div>
          </div>

          {/* Botones */}
          {phase === "prompt" ? (
            <div className="space-y-2.5">
              <button onClick={startBreak}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-colors">
                <Play className="h-4 w-4" /> Iniciar descanso (5 min)
              </button>
              <button onClick={resetWork}
                className="w-full py-3 text-sm font-medium border border-[#C8DFD2] text-[#4A6355] rounded-xl hover:bg-[#E8F2EC] transition-colors">
                Reanudar trabajo
              </button>
              <button onClick={snooze}
                className="w-full py-2.5 text-xs text-[#6B8C7A] hover:text-[#2D5C44] transition-colors">
                Posponer 15 minutos
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <button onClick={resetWork}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-colors">
                <SkipForward className="h-4 w-4" /> Reanudar trabajo
              </button>
              <p className="text-center text-xs text-[#6B8C7A]">
                El trabajo se reanuda automáticamente al terminar el contador
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
