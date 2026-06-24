import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/supabase/queries"
import PerfilClient from "./perfil-client"

export default async function PerfilPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const profile = await getUserProfile(userId)
  if (!profile) redirect("/sign-in")

  return <PerfilClient profile={profile} />
}
