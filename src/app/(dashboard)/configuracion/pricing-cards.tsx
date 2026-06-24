"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Check, CreditCard, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  currentPlan: string
}

const plans = [
  {
    id: "pro",
    name: "Pro",
    price: "19",
    color: "border-violet-300",
    badge: "bg-violet-100 text-violet-700",
    btn: "bg-violet-600 hover:bg-violet-700 text-white",
    features: ["200 consultas IA / mes", "Contactos ilimitados", "Informes financieros", "Soporte prioritario"],
  },
  {
    id: "business",
    name: "Business",
    price: "39",
    color: "border-amber-300",
    badge: "bg-amber-100 text-amber-700",
    btn: "bg-amber-500 hover:bg-amber-600 text-white",
    features: ["1.000 consultas IA / mes", "Hasta 5 usuarios", "Exportación de datos", "Soporte dedicado"],
  },
]

export default function PricingCards({ currentPlan }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  async function checkout(plan: string) {
    setLoading(plan)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert("Error al iniciar el pago. Inténtalo de nuevo.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="p-5 border-[#C8DFD2]">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-1.5 bg-[#E8F2EC] rounded-lg">
          <CreditCard className="h-4 w-4 text-[#4E8B6B]" />
        </div>
        <div>
          <h2 className="font-semibold text-[#2D5C44]">Plan y facturación</h2>
          <p className="text-xs text-[#6B8C7A] mt-0.5">Paga con tarjeta, Apple Pay o Google Pay</p>
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="flex items-center gap-2 mb-5 px-1">
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4 opacity-40" />
        <div className="flex gap-1.5 ml-auto">
          {["VISA", "MC", "AMEX"].map(m => (
            <span key={m} className="text-[9px] font-bold px-1.5 py-0.5 border border-gray-200 rounded text-gray-400">{m}</span>
          ))}
          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-black text-white rounded"> Pay</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 border border-gray-200 rounded text-gray-400">G Pay</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {plans.map(plan => {
          const isCurrent = currentPlan === plan.id
          const isLoading = loading === plan.id

          return (
            <div key={plan.id} className={cn(
              "p-4 rounded-xl border-2 transition-all",
              isCurrent ? plan.color + " opacity-60" : plan.color + " hover:shadow-md"
            )}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-[#2D5C44]">{plan.name}</p>
                {isCurrent && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${plan.badge}`}>Actual</span>
                )}
              </div>
              <p className="text-2xl font-bold text-[#2D5C44] mb-0.5">
                {plan.price}€<span className="text-xs font-normal text-[#6B8C7A]">/mes</span>
              </p>
              <ul className="space-y-1.5 my-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-[#4A6355]">
                    <Check className="h-3 w-3 text-[#4E8B6B] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => !isCurrent && checkout(plan.id)}
                disabled={isCurrent || isLoading}
                className={cn(
                  "mt-2 w-full py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                  isCurrent
                    ? "bg-[#E8F2EC] text-[#6B8C7A] cursor-default"
                    : plan.btn,
                  isLoading && "opacity-70 cursor-wait"
                )}
              >
                {isLoading ? (
                  <><Loader2 className="h-3 w-3 animate-spin" /> Procesando...</>
                ) : isCurrent ? (
                  "Plan actual"
                ) : (
                  "Actualizar →"
                )}
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-[10px] text-[#6B8C7A] text-center mt-3">
        Pago seguro con Stripe · Cancela cuando quieras
      </p>
    </Card>
  )
}
