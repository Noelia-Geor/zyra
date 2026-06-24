"use client"

import { Zap, X, Check } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
  open: boolean
  onClose: () => void
  message: string
}

const proFeatures = [
  "Contactos ilimitados",
  "Facturas ilimitadas",
  "200 consultas de IA / mes",
  "Pipeline CRM + Kanban",
  "Portal cliente",
  "Informes de rentabilidad",
  "Fiscalidad (Modelo 303/130)",
]

export function UpgradeModal({ open, onClose, message }: Props) {
  const router = useRouter()

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-violet-600 to-violet-800 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 fill-yellow-300 text-yellow-300" />
            <span className="text-sm font-semibold text-violet-200">Plan gratuito</span>
          </div>
          <h2 className="text-xl font-bold mb-1">Límite alcanzado</h2>
          <p className="text-sm text-violet-200 leading-relaxed">{message}</p>
        </div>

        {/* Features */}
        <div className="p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Con Pro obtienes</p>
          <ul className="space-y-2 mb-5">
            {proFeatures.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-violet-600 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between mb-4 p-3 bg-violet-50 rounded-xl">
            <div>
              <p className="text-xs text-violet-600 font-medium">Plan Pro</p>
              <p className="text-2xl font-bold text-violet-700">19€<span className="text-sm font-normal text-violet-500">/mes</span></p>
            </div>
            <p className="text-xs text-violet-500 text-right">Cancela<br/>cuando quieras</p>
          </div>

          <button
            onClick={() => { onClose(); router.push("/configuracion?upgrade=1") }}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors text-sm">
            Actualizar a Pro →
          </button>
          <button onClick={onClose} className="w-full py-2 mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Seguir con el plan gratuito
          </button>
        </div>
      </div>
    </div>
  )
}
