import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getTasks } from "@/lib/supabase/queries"
import TareasClient from "./tareas-client"

export default async function TareasPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  const profile = await getUserProfile(userId)
  if (!profile) redirect("/dashboard")
  const tasks = await getTasks(profile.id)
  return <TareasClient initialTasks={tasks} userId={profile.id} />
}
