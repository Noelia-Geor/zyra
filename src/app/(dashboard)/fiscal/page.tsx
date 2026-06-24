import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getInvoicesForFiscal, getTransactionsForFiscal } from "@/lib/supabase/queries"
import FiscalClient from "./fiscal-client"

export default async function FiscalPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const profile = await getUserProfile(userId)
  if (!profile) redirect("/sign-in")

  const params = await searchParams
  const year = parseInt(params.year ?? String(new Date().getFullYear()))

  const [invoices, transactions] = await Promise.all([
    getInvoicesForFiscal(profile.id, year),
    getTransactionsForFiscal(profile.id, year),
  ])

  return <FiscalClient invoices={invoices} transactions={transactions} year={year} />
}
