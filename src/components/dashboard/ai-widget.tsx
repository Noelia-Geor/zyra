"use client"

import { useState, useTransition } from "react"
import { Zap, Send, Loader2, ShoppingBag, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface Props {
  context: {
    tasks: number; pendingTasks: number; contacts: number
    activeContacts: number; monthIncome: number; monthExpenses: number
    todayEnergy: number | null; todayMood: number | null
  }
  aiCreditsUsed: number
  aiCreditsLimit: number
}

const quickQuestions = [
  "¿Cómo va mi negocio este mes?",
  "¿Qué debería priorizar hoy?",
  "Analiza mi situación financiera",
  "Dame un consejo de productividad",
]

const creditPacks = [
  { id: "pack_50",  label: "50 consultas",  price: "1,99€",  popular: false },
  { id: "pack_200", label: "200 consultas", price: "5,99€",  popular: true  },
  { id: "pack_500", label: "500 consultas", price: "12,99€", popular: false },
]

export default function AiWidget({ context, aiCreditsUsed, aiCreditsLimit }: Props) {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([])
  const [input, setInput] = useState("")
  const [isPending, startTransition] = useTransition()
  const [showPacks, setShowPacks] = useState(false)
  const [buyingPack, setBuyingPack] = useState<string | null>(null)
  const [localUsed, setLocalUsed] = useState(aiCreditsUsed)

  const remaining = aiCreditsLimit - localUsed
  const isLow = remaining > 0 && remaining <= 3
  const isEmpty = remaining <= 0

  function ask(question: string) {
    if (!question.trim() || isPending || isEmpty) return
    setMessages(prev => [...prev, { role: "user", text: question }])
    setInput("")

    startTransition(async () => {
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question, context }),
        })
        const data = await res.json()
        if (data.error) {
          toast.error(data.error)
          setMessages(prev => [...prev, { role: "ai", text: "No pude procesar tu consulta." }])
        } else {
          setMessages(prev => [...prev, { role: "ai", text: data.response }])
          setLocalUsed(prev => prev + 1)
        }
      } catch {
        toast.error("Error de conexión. Inténtalo de nuevo.")
      }
    })
  }

  async function buyPack(packId: string) {
    setBuyingPack(packId)
    try {
      const res = await fetch("/api/stripe/credits-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: packId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error("Error al procesar el pago")
    } catch {
      toast.error("Error de conexión")
    } finally {
      setBuyingPack(null)
    }
  }

  return (
    <Card className="p-4 h-full flex flex-col min-h-80 border-[#C8DFD2]">
      {/* Header créditos */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span className={`text-xs font-medium ${isLow ? "text-amber-600" : isEmpty ? "text-red-500" : "text-[#6B8C7A]"}`}>
            {isEmpty ? "Sin consultas" : `${remaining} consulta${remaining !== 1 ? "s" : ""} restante${remaining !== 1 ? "s" : ""}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-[#E8F2EC] rounded-full overflow-hidden">
            <div className="h-full bg-[#4E8B6B] rounded-full transition-all"
              style={{ width: `${Math.max(0, (remaining / aiCreditsLimit) * 100)}%` }} />
          </div>
          <button onClick={() => setShowPacks(!showPacks)}
            className="p-1 rounded-lg hover:bg-[#E8F2EC] text-[#6B8C7A] hover:text-[#4E8B6B] transition-colors"
            title="Comprar más consultas">
            <ShoppingBag className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Panel de packs */}
      {showPacks && (
        <div className="mb-3 p-3 rounded-xl bg-[#F2F7F4] border border-[#C8DFD2]">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-semibold text-[#2D5C44]">Packs de consultas IA</p>
            <button onClick={() => setShowPacks(false)} className="text-[#6B8C7A] hover:text-[#2D5C44]">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1.5">
            {creditPacks.map(pack => (
              <button key={pack.id} onClick={() => buyPack(pack.id)} disabled={buyingPack === pack.id}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-[#C8DFD2] hover:border-[#4E8B6B] hover:bg-[#E8F2EC] transition-all text-left disabled:opacity-50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#2D5C44]">{pack.label}</span>
                  {pack.popular && <span className="text-[9px] bg-[#4E8B6B] text-white px-1.5 py-0.5 rounded-full font-medium">Popular</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#4E8B6B]">{pack.price}</span>
                  {buyingPack === pack.id && <Loader2 className="h-3 w-3 animate-spin text-[#4E8B6B]" />}
                </div>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[#6B8C7A] text-center mt-2">Pago seguro con Stripe · Se añaden al instante</p>
        </div>
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-32">
        {messages.length === 0 && !isEmpty ? (
          <div className="space-y-2">
            <p className="text-xs text-[#6B8C7A] mb-3">Pregúntame sobre tu negocio:</p>
            {quickQuestions.map(q => (
              <button key={q} onClick={() => ask(q)}
                className="w-full text-left text-xs p-2.5 rounded-xl border border-[#C8DFD2] hover:border-[#4E8B6B] hover:bg-[#E8F2EC] text-[#4A6355] transition-colors">
                {q}
              </button>
            ))}
          </div>
        ) : messages.length === 0 && isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-4">
            <Zap className="h-8 w-8 text-[#C8DFD2] mb-2" />
            <p className="text-sm font-medium text-[#2D5C44] mb-1">Sin consultas disponibles</p>
            <p className="text-xs text-[#6B8C7A] mb-3">Compra un pack para seguir usando la IA</p>
            <button onClick={() => setShowPacks(true)}
              className="text-xs font-semibold bg-[#4E8B6B] text-white px-4 py-2 rounded-xl hover:bg-[#3D7059] transition-colors">
              Ver packs →
            </button>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-[#4E8B6B] text-white rounded-br-sm"
                  : "bg-[#F2F7F4] text-[#2D5C44] border border-[#C8DFD2] rounded-bl-sm"
              }`}>
                {m.role === "ai" && <Zap className="h-3 w-3 text-amber-500 mb-1" />}
                {m.text}
              </div>
            </div>
          ))
        )}
        {isPending && (
          <div className="flex justify-start">
            <div className="bg-[#F2F7F4] border border-[#C8DFD2] px-3 py-2 rounded-xl rounded-bl-sm">
              <Loader2 className="h-3 w-3 text-[#4E8B6B] animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Aviso créditos bajos */}
      {isLow && !showPacks && (
        <div className="mb-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <p className="text-xs text-amber-700">Solo te quedan {remaining} consulta{remaining !== 1 ? "s" : ""}</p>
          <button onClick={() => setShowPacks(true)} className="text-xs font-semibold text-amber-700 underline">Comprar más</button>
        </div>
      )}

      {/* Input */}
      {!isEmpty && (
        <div className="flex gap-2 border-t border-[#C8DFD2] pt-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && ask(input)}
            placeholder="Pregunta algo..."
            className="flex-1 text-xs px-3 py-2 border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B] bg-white text-[#2D5C44] placeholder:text-[#6B8C7A]"
          />
          <button onClick={() => ask(input)} disabled={!input.trim() || isPending}
            className="p-2 bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] disabled:opacity-40 transition-colors">
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </Card>
  )
}
