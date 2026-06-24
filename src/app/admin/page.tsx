import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getImprovements } from "@/lib/supabase/queries"
import AdminClient from "./admin-client"

export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress
  if (email !== process.env.ADMIN_EMAIL) redirect("/dashboard")

  const improvements = await getImprovements()

  return <AdminClient improvements={improvements} />
}
