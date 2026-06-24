import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getImprovements } from "@/lib/supabase/queries"
import MejorasClient from "./mejoras-client"

export default async function MejorasPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const items = await getImprovements()

  return <MejorasClient initialItems={items} />
}
