import { cache } from "react"
import { auth } from "@clerk/nextjs/server"
import { getUserProfile } from "@/lib/supabase/queries"

// cache() memoiza por request — evita llamadas duplicadas a Supabase
export const getCurrentProfile = cache(async () => {
  const { userId } = await auth()
  if (!userId) return null
  return getUserProfile(userId)
})

export async function requireProfile() {
  const profile = await getCurrentProfile()
  if (!profile) throw new Error("No autenticado")
  return profile
}
