import { Settings, User, Bell, Shield, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { currentUser } from "@clerk/nextjs/server"
import { auth } from "@clerk/nextjs/server"
import { getUserProfile } from "@/lib/supabase/queries"
import { AI_LIMITS } from "@/types"
import PricingCards from "./pricing-cards"
import { MobileHeader } from "@/components/layout/mobile-header"

export default async function ConfiguracionPage() {
  const { userId } = await auth()
  const user = await currentUser()
  const profile = userId ? await getUserProfile(userId) : null
  const plan = profile?.plan ?? "free"
  const aiUsed = profile?.ai_credits_used ?? 0
  const aiLimit = AI_LIMITS[plan]

  const planLabel: Record<string, string> = { free: "Gratis", pro: "Pro", business: "Business" }
  const planColor: Record<string, string> = {
    free: "bg-[#E8F2EC] text-[#4E8B6B]",
    pro: "bg-violet-100 text-violet-700",
    business: "bg-amber-100 text-amber-700",
  }

  return (
    <div>
      <MobileHeader title="Configuración" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="hidden md:flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5 text-[#4E8B6B]" />
          <h1 className="text-2xl font-bold text-[#2D5C44]">Configuración</h1>
        </div>

        <div className="space-y-4">
          {/* Cuenta */}
          <Card className="p-4 md:p-5 border-[#C8DFD2]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 bg-[#E8F2EC] rounded-lg">
                <User className="h-4 w-4 text-[#4E8B6B]" />
              </div>
              <h2 className="font-semibold text-[#2D5C44]">Tu cuenta</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-[#6B8C7A]">Nombre</span>
                <span className="font-medium text-[#2D5C44] text-right">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-[#6B8C7A] shrink-0">Email</span>
                <span className="font-medium text-[#2D5C44] truncate text-right text-xs md:text-sm">
                  {user?.emailAddresses[0]?.emailAddress}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B8C7A]">Plan</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${planColor[plan]}`}>
                  {planLabel[plan]}
                </span>
              </div>
            </div>
          </Card>

          {/* Uso de IA */}
          <Card className="p-4 md:p-5 border-[#C8DFD2]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 bg-amber-50 rounded-lg">
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
              <h2 className="font-semibold text-[#2D5C44]">Uso de IA este mes</h2>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[#6B8C7A]">{aiUsed} de {aiLimit} consultas</span>
              <span className="font-medium text-[#2D5C44]">{Math.round((aiUsed / aiLimit) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-[#E8F2EC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4E8B6B] rounded-full transition-all"
                style={{ width: `${Math.min(100, (aiUsed / aiLimit) * 100)}%` }}
              />
            </div>
          </Card>

          {/* Planes y pago */}
          <PricingCards currentPlan={plan} />

          {/* Notificaciones */}
          <Card className="p-4 md:p-5 border-[#C8DFD2]">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-[#E8F2EC] rounded-lg">
                <Bell className="h-4 w-4 text-[#4E8B6B]" />
              </div>
              <h2 className="font-semibold text-[#2D5C44]">Notificaciones</h2>
            </div>
            <p className="text-sm text-[#6B8C7A]">Próximamente</p>
          </Card>

          {/* Privacidad */}
          <Card className="p-4 md:p-5 border-[#C8DFD2]">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-[#E8F2EC] rounded-lg">
                <Shield className="h-4 w-4 text-[#4E8B6B]" />
              </div>
              <h2 className="font-semibold text-[#2D5C44]">Privacidad y datos</h2>
            </div>
            <p className="text-sm text-[#6B8C7A]">Tus datos están cifrados y son solo tuyos.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
