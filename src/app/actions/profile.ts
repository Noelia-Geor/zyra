"use server"

import { auth } from "@clerk/nextjs/server"
import { getUserProfile } from "@/lib/supabase/queries"
import { createAdminClient } from "@/lib/supabase/server"
import type { UserProfile } from "@/types"

export async function saveProfile(data: Partial<Pick<UserProfile, 'name' | 'apellidos' | 'phone' | 'company_id' | 'job_title' | 'avatar_url' | 'theme_color'>>) {
  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")
  if (!data.name?.trim()) throw new Error("El nombre es obligatorio")

  const profile = await getUserProfile(userId)
  if (!profile) throw new Error("Perfil no encontrado")

  const supabase = createAdminClient()

  // Intenta guardar todo; si falla por columnas inexistentes, guarda solo las básicas
  const full = await supabase.from('user_profiles').update(data).eq('id', profile.id)

  if (full.error) {
    // Fallback: solo campos que siempre existen
    const safe = { name: data.name, avatar_url: data.avatar_url }
    const { error } = await supabase.from('user_profiles').update(safe).eq('id', profile.id)
    if (error) throw new Error("Error al guardar el perfil")

    // Informa al usuario que necesita ejecutar el SQL
    throw new Error("Ejecuta el SQL de perfil en Supabase para guardar todos los campos")
  }
}
