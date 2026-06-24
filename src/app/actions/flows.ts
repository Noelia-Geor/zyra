"use server"

import { auth } from "@clerk/nextjs/server"
import { getUserProfile, upsertFlow } from "@/lib/supabase/queries"
import type { FlowKey } from "@/types"

async function getProfile() {
  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")
  const profile = await getUserProfile(userId)
  if (!profile) throw new Error("Perfil no encontrado")
  return profile
}

export async function toggleFlow(flowKey: FlowKey, enabled: boolean, config: Record<string, unknown> = {}) {
  const profile = await getProfile()
  const { error } = await upsertFlow(profile.id, flowKey, enabled, config)
  if (error) throw new Error((error as any).message)
  return { success: true }
}

export async function saveFlowConfig(flowKey: FlowKey, config: Record<string, unknown>) {
  const profile = await getProfile()
  // Get current enabled state first
  const { data } = await (await import("@/lib/supabase/server")).createAdminClient()
    .from('flows')
    .select('enabled')
    .eq('user_id', profile.id)
    .eq('flow_key', flowKey)
    .single()
  const enabled = data?.enabled ?? false
  const { error } = await upsertFlow(profile.id, flowKey, enabled, config)
  if (error) throw new Error((error as any).message)
  return { success: true }
}
