import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getWorkspaceByOwner, getWorkspaceMembers } from "@/lib/supabase/queries"
import EquipoClient from "./equipo-client"

export default async function EquipoPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const profile = await getUserProfile(userId)
  if (!profile) redirect("/sign-in")

  // Solo el dueño del workspace puede gestionar el equipo
  let workspace = await getWorkspaceByOwner(profile.id)
  let members = workspace ? await getWorkspaceMembers(workspace.id) : []

  return (
    <EquipoClient
      profile={{ id: profile.id, name: profile.name, email: profile.email }}
      workspace={workspace}
      initialMembers={members}
    />
  )
}
