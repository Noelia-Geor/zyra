"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { updateImprovementStatus } from "@/lib/supabase/queries"
import type { Improvement } from "@/types"

async function assertAdmin() {
  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress
  if (email !== process.env.ADMIN_EMAIL) throw new Error("Acceso denegado")
}

export async function setImprovementStatus(id: string, status: Improvement["status"]) {
  await assertAdmin()
  const { error } = await updateImprovementStatus(id, status)
  if (error) throw new Error("Error al actualizar")
}
