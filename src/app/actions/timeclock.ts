"use server"

import { auth } from "@clerk/nextjs/server"
import { getUserProfile, clockIn, clockOut, getActiveTimeEntry } from "@/lib/supabase/queries"

async function getProfile() {
  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")
  const profile = await getUserProfile(userId)
  if (!profile) throw new Error("Perfil no encontrado")
  return profile
}

export async function doClockIn(project?: string, notes?: string) {
  const profile = await getProfile()
  // Prevent double clock-in
  const active = await getActiveTimeEntry(profile.id)
  if (active) throw new Error("Ya tienes un turno activo")
  return clockIn(profile.id, project, notes)
}

export async function doClockOut(entryId: string) {
  const profile = await getProfile()
  return clockOut(entryId, profile.id)
}
