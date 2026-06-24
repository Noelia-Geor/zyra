import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getTasks, getTransactions, getContacts, getWellnessEntries, getActiveTimeEntry } from "@/lib/supabase/queries"
import Link from "next/link"
import { CheckSquare, Users, TrendingUp, Heart, Plus, ArrowRight, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AiWidget from "@/components/dashboard/ai-widget"
import FichajeWidget from "@/components/dashboard/fichaje-widget"
import { MobileHeader } from "@/components/layout/mobile-header"

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const profile = await getUserProfile(userId)
  if (!profile) redirect("/sign-in")

  const [tasks, transactions, contacts, wellness, activeTimeEntry] = await Promise.all([
    getTasks(profile.id),
    getTransactions(profile.id),
    getContacts(profile.id),
    getWellnessEntries(profile.id),
    getActiveTimeEntry(profile.id),
  ])

  const firstName = user?.firstName || profile.name.split(" ")[0] || "ahí"
  const today = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })

  const pendingTasks = tasks.filter(t => t.status === "pendiente").length
  const inProgressTasks = tasks.filter(t => t.status === "en_progreso").length
  const activeContacts = contacts.filter(c => c.status === "activo").length
  const todayWellness = wellness.find(w => w.date === new Date().toISOString().split("T")[0])

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  const monthTransactions = transactions.filter(t => t.date >= monthStart)
  const monthIncome = monthTransactions.filter(t => t.type === "ingreso").reduce((s, t) => s + Number(t.amount), 0)
  const monthExpenses = monthTransactions.filter(t => t.type === "gasto").reduce((s, t) => s + Number(t.amount), 0)

  const recentTasks = tasks.filter(t => t.status !== "completada").slice(0, 3)
  const recentContacts = contacts.slice(0, 3)

  const energyEmoji = todayWellness ? ["😴", "😔", "😐", "🙂", "⚡"][todayWellness.energy_level - 1] : null

  const stats = [
    { label: "Tareas pendientes", value: pendingTasks.toString(), sub: inProgressTasks > 0 ? `${inProgressTasks} en progreso` : "sin empezar", icon: CheckSquare, href: "/tareas", color: "text-[#4E8B6B]", bg: "bg-[#E8F2EC]" },
    { label: "Contactos activos", value: activeContacts.toString(), sub: `${contacts.length} en total`, icon: Users, href: "/contactos", color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Ingresos del mes", value: monthIncome > 0 ? monthIncome.toLocaleString("es-ES", { maximumFractionDigits: 0 }) + " €" : "0 €", sub: monthExpenses > 0 ? `-${monthExpenses.toLocaleString("es-ES", { maximumFractionDigits: 0 })} € gastos` : "sin gastos", icon: TrendingUp, href: "/finanzas", color: "text-violet-500", bg: "bg-violet-50" },
    { label: "Energía de hoy", value: energyEmoji ?? "—", sub: todayWellness ? `Ánimo: ${["😞", "😕", "😐", "🙂", "😊"][todayWellness.mood - 1]}` : "Sin registrar", icon: Heart, href: "/bienestar", color: "text-rose-400", bg: "bg-rose-50" },
  ]

  return (
    <div>
    <MobileHeader title="Hoy" />
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm text-[#6B8C7A] capitalize mb-1">{today}</p>
        <h1 className="text-3xl font-bold text-[#2D5C44]">Hola, {firstName} 👋</h1>
        <p className="text-[#6B8C7A] mt-1">
          {pendingTasks === 0 && activeContacts === 0
            ? "Empieza añadiendo tus primeros datos."
            : `Tienes ${pendingTasks} tarea${pendingTasks !== 1 ? "s" : ""} pendiente${pendingTasks !== 1 ? "s" : ""} y ${activeContacts} contacto${activeContacts !== 1 ? "s" : ""} activo${activeContacts !== 1 ? "s" : ""}.`}
        </p>
      </div>

      {/* Fichaje widget */}
      <FichajeWidget activeEntry={activeTimeEntry} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map(s => (
          <Link key={s.label} href={s.href}>
            <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-[#E8ECEA] bg-white shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[#6B8C7A]">{s.label}</span>
                <div className={`p-1.5 rounded-lg ${s.bg}`}>
                  <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#2D5C44] mb-0.5">{s.value}</p>
              <p className="text-xs text-[#6B8C7A]">{s.sub}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Tareas de hoy */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#2D5C44]">Tareas pendientes</h2>
            <Link href="/tareas" className="text-xs text-[#6B8C7A] hover:text-[#4E8B6B] flex items-center gap-1 transition-colors">Ver todas <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {recentTasks.length === 0 ? (
            <Card className="p-6 border-dashed border-[#C8DFD2] text-center bg-white">
              <CheckSquare className="h-8 w-8 text-[#C8DFD2] mx-auto mb-2" />
              <p className="text-sm text-[#6B8C7A] mb-3">Sin tareas pendientes</p>
              <Link href="/tareas" className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#4E8B6B] text-white px-3 py-1.5 rounded-lg hover:bg-[#3D7059] transition-colors">
                <Plus className="h-3 w-3" /> Nueva tarea
              </Link>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentTasks.map(t => (
                <Card key={t.id} className="p-3 flex items-center gap-3 border-[#C8DFD2] bg-white">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${t.priority === "alta" ? "bg-red-400" : t.priority === "media" ? "bg-amber-400" : "bg-[#C8DFD2]"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2D5C44] truncate">{t.title}</p>
                    {t.due_date && <p className="text-xs text-[#6B8C7A]">Vence: {new Date(t.due_date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</p>}
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0 bg-[#E8F2EC] text-[#4E8B6B] border-0">
                    {t.status === "en_progreso" ? "En progreso" : "Pendiente"}
                  </Badge>
                </Card>
              ))}
              <Link href="/tareas" className="flex items-center justify-center gap-1.5 p-2 text-xs text-[#6B8C7A] hover:text-[#4E8B6B] hover:bg-[#E8F2EC] rounded-lg transition-colors">
                <Plus className="h-3 w-3" /> Añadir tarea
              </Link>
            </div>
          )}

          {/* Contactos recientes */}
          <div className="flex items-center justify-between mt-2">
            <h2 className="font-bold text-[#2D5C44]">Contactos recientes</h2>
            <Link href="/contactos" className="text-xs text-[#6B8C7A] hover:text-[#4E8B6B] flex items-center gap-1 transition-colors">Ver todos <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {recentContacts.length === 0 ? (
            <Card className="p-6 border-dashed border-[#C8DFD2] text-center bg-white">
              <Users className="h-8 w-8 text-[#C8DFD2] mx-auto mb-2" />
              <p className="text-sm text-[#6B8C7A] mb-3">Sin contactos aún</p>
              <Link href="/contactos" className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#4E8B6B] text-white px-3 py-1.5 rounded-lg hover:bg-[#3D7059] transition-colors">
                <Plus className="h-3 w-3" /> Añadir contacto
              </Link>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentContacts.map(c => (
                <Card key={c.id} className="p-3 flex items-center gap-3 border-[#C8DFD2] bg-white">
                  <div className="w-8 h-8 rounded-full bg-[#E8F2EC] flex items-center justify-center text-xs font-bold text-[#4E8B6B] shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2D5C44] truncate">{c.name}</p>
                    <p className="text-xs text-[#6B8C7A]">{c.company || c.email || c.type}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.type === "cliente" ? "bg-[#E8F2EC] text-[#4E8B6B]" : "bg-teal-50 text-teal-700"}`}>{c.type}</span>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* IA Widget */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-amber-500" />
            <h2 className="font-bold text-[#2D5C44]">Tu IA personal</h2>
          </div>
          <AiWidget
            context={{
              tasks: tasks.length,
              pendingTasks,
              contacts: contacts.length,
              activeContacts,
              monthIncome,
              monthExpenses,
              todayEnergy: todayWellness?.energy_level ?? null,
              todayMood: todayWellness?.mood ?? null,
            }}
            aiCreditsUsed={profile.ai_credits_used}
            aiCreditsLimit={profile.ai_credits_limit}
          />
        </div>
      </div>
    </div>
    </div>
  )
}
