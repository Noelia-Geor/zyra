import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getMeetings } from "@/lib/supabase/queries"
import ReunionesClient from "./reuniones-client"

export default async function ReunionesPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const profile = await getUserProfile(userId)
  if (!profile) redirect("/sign-in")

  const meetings = await getMeetings(profile.id)
  const hasDailyKey = !!process.env.DAILY_API_KEY

  return <ReunionesClient initialMeetings={meetings} hasDailyKey={hasDailyKey} />
}
