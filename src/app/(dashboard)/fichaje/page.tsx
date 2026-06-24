import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getTimeEntries, getActiveTimeEntry } from "@/lib/supabase/queries"
import FichajeClient from "./fichaje-client"

export default async function FichajePage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  const profile = await getUserProfile(userId)
  if (!profile) redirect("/dashboard")
  const [entries, activeEntry] = await Promise.all([
    getTimeEntries(profile.id),
    getActiveTimeEntry(profile.id),
  ])
  return <FichajeClient initialEntries={entries} activeEntry={activeEntry} />
}
