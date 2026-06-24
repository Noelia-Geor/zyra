import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getTransactions } from "@/lib/supabase/queries"
import FinanzasClient from "./finanzas-client"

export default async function FinanzasPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  const profile = await getUserProfile(userId)
  if (!profile) redirect("/dashboard")
  const transactions = await getTransactions(profile.id)
  return <FinanzasClient initialTransactions={transactions} userId={profile.id} />
}
