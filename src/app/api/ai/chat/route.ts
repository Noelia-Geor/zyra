import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getUserProfile } from "@/lib/supabase/queries"
import { createAdminClient } from "@/lib/supabase/server"
import { AI_LIMITS } from "@/types"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const profile = await getUserProfile(userId)
  if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })

  const limit = AI_LIMITS[profile.plan]
  if (profile.ai_credits_used >= limit) {
    return NextResponse.json({ error: "Límite de consultas alcanzado" }, { status: 429 })
  }

  const { message, context } = await req.json()

  const systemPrompt = `Eres el asistente de IA personal de ZYRA, un workspace para profesionales independientes.
Tienes acceso al contexto actual del usuario:

- Tareas totales: ${context.tasks} | Pendientes: ${context.pendingTasks}
- Contactos totales: ${context.contacts} | Activos: ${context.activeContacts}
- Ingresos este mes: ${context.monthIncome}€ | Gastos: ${context.monthExpenses}€
- Balance: ${context.monthIncome - context.monthExpenses}€
- Energía hoy: ${context.todayEnergy ? `${context.todayEnergy}/5` : "no registrada"}
- Ánimo hoy: ${context.todayMood ? `${context.todayMood}/5` : "no registrado"}

Responde en español. Sé directo, útil y conciso (máximo 3-4 líneas).
Basa tus respuestas en los datos reales del usuario, no en generalidades.
Tono: cercano y profesional, como un buen socio de negocio.`

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    // Incrementar contador de créditos
    const supabase = createAdminClient()
    await supabase
      .from("user_profiles")
      .update({ ai_credits_used: profile.ai_credits_used + 1 })
      .eq("id", profile.id)

    return NextResponse.json({ response: text })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
