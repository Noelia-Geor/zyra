import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getWellnessEntries } from "@/lib/supabase/queries"
import BienestarClient from "./bienestar-client"

export default async function BienestarPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  const profile = await getUserProfile(userId)
  if (!profile) redirect("/dashboard")
  const entries = await getWellnessEntries(profile.id)
  return <BienestarClient initialEntries={entries} userId={profile.id} />
}
