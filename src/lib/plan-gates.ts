import type { Plan } from "@/types"
import { createAdminClient } from "@/lib/supabase/server"

export const PLAN_LIMITS = {
  free: {
    contacts: 10,
    invoices: 5,
    ai_credits: 10,
  },
  pro: {
    contacts: Infinity,
    invoices: Infinity,
    ai_credits: 200,
  },
  business: {
    contacts: Infinity,
    invoices: Infinity,
    ai_credits: 1000,
  },
} satisfies Record<Plan, { contacts: number; invoices: number; ai_credits: number }>

export const PLAN_UPGRADE_MSG = {
  contacts: "Has alcanzado el límite de 10 contactos del plan gratuito. Actualiza a Pro para contactos ilimitados.",
  invoices: "Has alcanzado el límite de 5 facturas del plan gratuito. Actualiza a Pro para facturas ilimitadas.",
  ai_credits: "Has agotado tus consultas de IA del mes. Actualiza tu plan para obtener más.",
}

export async function checkContactLimit(userId: string): Promise<void> {
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("plan")
    .eq("id", userId)
    .single()

  const plan = (profile?.plan ?? "free") as Plan
  const limit = PLAN_LIMITS[plan].contacts
  if (limit === Infinity) return

  const { count } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)

  if ((count ?? 0) >= limit) {
    throw new Error(PLAN_UPGRADE_MSG.contacts)
  }
}

export async function checkInvoiceLimit(userId: string): Promise<void> {
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("plan")
    .eq("id", userId)
    .single()

  const plan = (profile?.plan ?? "free") as Plan
  const limit = PLAN_LIMITS[plan].invoices
  if (limit === Infinity) return

  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)

  if ((count ?? 0) >= limit) {
    throw new Error(PLAN_UPGRADE_MSG.invoices)
  }
}
