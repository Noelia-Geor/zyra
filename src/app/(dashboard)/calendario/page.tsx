import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getTasks, getMeetings, getInvoices } from "@/lib/supabase/queries"
import CalendarioClient from "./calendario-client"

export default async function CalendarioPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  const profile = await getUserProfile(userId)
  if (!profile) redirect("/dashboard")
  const [tasks, meetings, invoices] = await Promise.all([
    getTasks(profile.id),
    getMeetings(profile.id),
    getInvoices(profile.id),
  ])
  return <CalendarioClient tasks={tasks} meetings={meetings} invoices={invoices} />
}
