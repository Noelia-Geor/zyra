"use client"

import { useState, useTransition } from "react"
import { Heart, Zap, BookOpen, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { saveWellnessEntry } from "@/app/actions/wellness"
import { MobileHeader } from "@/components/layout/mobile-header"
import { toast } from "sonner"
import type { WellnessEntry } from "@/types"

const energyLevels = [
  { value: 1, emoji: "😴", label: "Agotado" },
  { value: 2, emoji: "😔", label: "Bajo" },
  { value: 3, emoji: "😐", label: "Normal" },
  { value: 4, emoji: "🙂", label: "Bien" },
  { value: 5, emoji: "⚡", label: "Genial" },
]

const moodLevels = [
  { value: 1, emoji: "😞", label: "Mal" },
  { value: 2, emoji: "😕", label: "Regular" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "🙂", label: "Bien" },
  { value: 5, emoji: "😊", label: "Muy bien" },
]

const tips = [
  "Los descansos cortos cada hora mejoran la concentración hasta un 40%.",
  "Celebrar pequeños logros activa el sistema de recompensa del cerebro.",
  "Desconectar a una hora fija reduce el cortisol nocturno.",
  "El movimiento físico, aunque sea caminar 10 minutos, reinicia la energía mental.",
  "Escribir 3 cosas positivas del día reduce el estrés percibido.",
  "Beber agua regularmente mejora el rendimiento cognitivo.",
  "Una sola tarea a la vez es más productivo que el multitasking.",
]

export default function BienestarClient({ initialEntries, userId }: { initialEntries: WellnessEntry[]; userId: string }) {
  const [entries, setEntries] = useState<WellnessEntry[]>(initialEntries)
  const [energy, setEnergy] = useState<number | null>(null)
  const [mood, setMood] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const today      = new Date().toISOString().split("T")[0]
  const todayEntry = entries.find(e => e.date === today)
  const tip        = tips[new Date().getDay() % tips.length]
  const avgEnergy  = entries.length ? Math.round(entries.slice(0, 7).reduce((s, e) => s + e.energy_level, 0) / Math.min(entries.length, 7) * 10) / 10 : null
  const avgMood    = entries.length ? Math.round(entries.slice(0, 7).reduce((s, e) => s + e.mood, 0) / Math.min(entries.length, 7) * 10) / 10 : null

  function handleSave() {
    if (!energy || !mood) return
    startTransition(async () => {
      await saveWellnessEntry({ energy_level: energy, mood, notes })
      setEntries(prev => [{
        id: crypto.randomUUID(), user_id: userId, date: today,
        energy_level: energy, mood, notes: notes || null,
        created_at: new Date().toISOString(),
      }, ...prev.filter(e => e.date !== today)])
      setSaved(true)
      toast.success("Check-in guardado")
    })
  }

  return (
    <div>
      <MobileHeader title="Bienestar" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="mb-5">
          <h1 className="text-xl md:text-2xl font-bold text-[#2D5C44] flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-400" /> Bienestar
          </h1>
          <p className="text-sm text-[#6B8C7A] mt-0.5 capitalize">
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        {/* Stats semana */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <Card className="p-4 border-[#C8DFD2] bg-white">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-medium text-[#6B8C7A]">Energía media (7d)</span>
              </div>
              <div className="flex items-end gap-1.5">
                <span className="text-2xl font-bold text-[#2D5C44]">{avgEnergy}</span>
                <span className="text-sm text-[#6B8C7A] mb-0.5">/ 5</span>
              </div>
            </Card>
            <Card className="p-4 border-[#C8DFD2] bg-white">
              <div className="flex items-center gap-1.5 mb-1">
                <Heart className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-xs font-medium text-[#6B8C7A]">Ánimo medio (7d)</span>
              </div>
              <div className="flex items-end gap-1.5">
                <span className="text-2xl font-bold text-[#2D5C44]">{avgMood}</span>
                <span className="text-sm text-[#6B8C7A] mb-0.5">/ 5</span>
              </div>
            </Card>
          </div>
        )}

        {/* Check-in */}
        {todayEntry && !energy ? (
          <Card className="p-5 mb-5 border-[#C8DFD2] bg-[#E8F2EC]">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-[#2D5C44]">Check-in de hoy completado</p>
                <p className="text-sm text-[#6B8C7A]">
                  Energía: {energyLevels[todayEntry.energy_level - 1]?.emoji} · Ánimo: {moodLevels[todayEntry.mood - 1]?.emoji}
                </p>
              </div>
            </div>
            {todayEntry.notes && <p className="text-sm text-[#4A6355] italic border-t border-[#C8DFD2] pt-3">"{todayEntry.notes}"</p>}
            <button onClick={() => { setEnergy(todayEntry.energy_level); setMood(todayEntry.mood); setNotes(todayEntry.notes ?? ""); setSaved(false) }}
              className="mt-3 text-xs text-[#4E8B6B] underline underline-offset-2 font-medium">
              Editar
            </button>
          </Card>
        ) : saved ? (
          <Card className="p-6 mb-5 text-center border-[#C8DFD2] bg-[#E8F2EC]">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-semibold text-[#2D5C44]">¡Guardado!</p>
            <p className="text-sm text-[#6B8C7A] mt-1">Tu check-in de hoy está anotado.</p>
          </Card>
        ) : (
          <div className="space-y-3 mb-5">
            {/* Energía */}
            <Card className="p-4 md:p-5 border-[#C8DFD2] bg-white">
              <h2 className="font-semibold text-[#2D5C44] mb-1 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> ¿Cómo está tu energía?
              </h2>
              <p className="text-xs text-[#6B8C7A] mb-4">Sé honesto. Sin juicios.</p>
              <div className="flex gap-1.5 md:gap-2">
                {energyLevels.map(e => (
                  <button key={e.value} onClick={() => setEnergy(e.value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 md:py-3 rounded-xl border-2 transition-all ${energy === e.value ? "border-[#4E8B6B] bg-[#E8F2EC] scale-105" : "border-[#C8DFD2] hover:border-[#4E8B6B]"}`}>
                    <span className="text-lg md:text-xl">{e.emoji}</span>
                    <span className="text-[9px] md:text-xs text-[#4A6355] font-medium leading-tight text-center">{e.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Ánimo */}
            <Card className="p-4 md:p-5 border-[#C8DFD2] bg-white">
              <h2 className="font-semibold text-[#2D5C44] mb-1">¿Cómo te sientes?</h2>
              <p className="text-xs text-[#6B8C7A] mb-4">Tu estado de ánimo importa tanto como tu trabajo.</p>
              <div className="flex gap-1.5 md:gap-2">
                {moodLevels.map(m => (
                  <button key={m.value} onClick={() => setMood(m.value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 md:py-3 rounded-xl border-2 transition-all ${mood === m.value ? "border-[#4E8B6B] bg-[#E8F2EC] scale-105" : "border-[#C8DFD2] hover:border-[#4E8B6B]"}`}>
                    <span className="text-lg md:text-xl">{m.emoji}</span>
                    <span className="text-[9px] md:text-xs text-[#4A6355] font-medium leading-tight text-center">{m.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Nota */}
            <Card className="p-4 md:p-5 border-[#C8DFD2] bg-white">
              <h2 className="font-semibold text-[#2D5C44] mb-1 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#4E8B6B]" /> Nota del día
              </h2>
              <p className="text-xs text-[#6B8C7A] mb-3">Opcional. ¿Qué quieres recordar de hoy?</p>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                className="w-full px-3 py-2.5 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B] resize-none"
                placeholder="Hoy me ha costado arrancar pero luego fue bien..." />
            </Card>

            <button onClick={handleSave} disabled={!energy || !mood || isPending}
              className="w-full py-3.5 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {isPending ? "Guardando..." : "Guardar check-in de hoy"}
            </button>
          </div>
        )}

        {/* Historial */}
        {entries.length > 1 && (
          <div>
            <h2 className="font-semibold text-[#2D5C44] mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#4E8B6B]" /> Últimos 7 días
            </h2>
            <div className="space-y-2">
              {entries.slice(0, 7).map(e => (
                <Card key={e.id} className="p-3 flex items-center justify-between border-[#C8DFD2] bg-white">
                  <span className="text-sm text-[#6B8C7A] capitalize">
                    {new Date(e.date + "T12:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-base">{energyLevels[e.energy_level - 1]?.emoji} <span className="text-xs text-[#6B8C7A]">energía</span></span>
                    <span className="text-base">{moodLevels[e.mood - 1]?.emoji} <span className="text-xs text-[#6B8C7A]">ánimo</span></span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Consejo */}
        <Card className="mt-5 p-4 bg-[#E8F2EC] border-[#C8DFD2]">
          <p className="text-xs font-semibold text-[#4E8B6B] mb-1">💡 Consejo del día</p>
          <p className="text-sm text-[#2D5C44]">{tip}</p>
        </Card>
      </div>
    </div>
  )
}
