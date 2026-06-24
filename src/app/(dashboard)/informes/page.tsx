import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getInvoices, getContacts, getTransactions, getTimeEntries, getInvoicesByContact } from "@/lib/supabase/queries"
import InformesClient from "./informes-client"

export default async function InformesPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const profile = await getUserProfile(userId)
  if (!profile) redirect("/sign-in")

  const [invoices, contacts, transactions, timeEntries, byContact] = await Promise.all([
    getInvoices(profile.id),
    getContacts(profile.id),
    getTransactions(profile.id),
    getTimeEntries(profile.id, 500),
    getInvoicesByContact(profile.id),
  ])

  return (
    <InformesClient
      invoices={invoices}
      contacts={contacts}
      transactions={transactions}
      timeEntries={timeEntries}
      byContact={byContact}
    />
  )
}
