import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getFlows } from "@/lib/supabase/queries"
import FlujoClient from "./flujos-client"

export default async function FlujoPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  const profile = await getUserProfile(userId)
  if (!profile) redirect("/dashboard")
  const flows = await getFlows(profile.id)
  return <FlujoClient initialFlows={flows} userEmail={profile.email} />
}
