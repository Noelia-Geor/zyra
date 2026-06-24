"use server"

import { auth } from "@clerk/nextjs/server"
import { getUserProfile, updateContactPipeline } from "@/lib/supabase/queries"
import { revalidatePath } from "next/cache"

export async function movePipelineStage(contactId: string, stage: string, value?: number) {
  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")
  const profile = await getUserProfile(userId)
  if (!profile) throw new Error("Perfil no encontrado")
  await updateContactPipeline(contactId, profile.id, stage, value)
  revalidatePath("/contactos")
}
