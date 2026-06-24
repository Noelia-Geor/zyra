import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getInvoices, getContacts, getTimeEntries } from "@/lib/supabase/queries"
import FacturacionClient from "./facturacion-client"

export default async function FacturacionPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  const profile = await getUserProfile(userId)
  if (!profile) redirect("/dashboard")
  const [invoices, contacts, timeEntries] = await Promise.all([
    getInvoices(profile.id),
    getContacts(profile.id),
    getTimeEntries(profile.id, 100),
  ])
  return (
    <FacturacionClient
      initialInvoices={invoices}
      contacts={contacts}
      profile={profile}
      timeEntries={timeEntries}
    />
  )
}
