import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getQuotes, getContacts } from "@/lib/supabase/queries"
import PresupuestosClient from "./presupuestos-client"

export default async function PresupuestosPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  const profile = await getUserProfile(userId)
  if (!profile) redirect("/dashboard")
  const [quotes, contacts] = await Promise.all([
    getQuotes(profile.id),
    getContacts(profile.id),
  ])
  return <PresupuestosClient initialQuotes={quotes} contacts={contacts} profile={profile} />
}
