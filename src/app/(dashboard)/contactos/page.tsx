import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getContacts } from "@/lib/supabase/queries"
import ContactosClient from "./contactos-client"

export default async function ContactosPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const profile = await getUserProfile(userId)
  if (!profile) redirect("/dashboard")

  const contacts = await getContacts(profile.id)

  return <ContactosClient initialContacts={contacts} userId={profile.id} />
}
