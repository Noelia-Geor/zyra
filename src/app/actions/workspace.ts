"use server"

import { auth } from "@clerk/nextjs/server"
import {
  getUserProfile, getWorkspaceByOwner, createWorkspace,
  inviteMember, updateMemberPermissions, removeMember
} from "@/lib/supabase/queries"
import type { WorkspaceMember } from "@/types"

async function getProfileOrThrow() {
  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")
  const profile = await getUserProfile(userId)
  if (!profile) throw new Error("Perfil no encontrado")
  return profile
}

export async function getOrCreateWorkspace() {
  const profile = await getProfileOrThrow()
  let ws = await getWorkspaceByOwner(profile.id)
  if (!ws) ws = await createWorkspace(profile.name || "Mi equipo", profile.id)
  return ws
}

export async function inviteTeamMember(email: string, permissions: WorkspaceMember["permissions"]) {
  const profile = await getProfileOrThrow()
  const ws = await getWorkspaceByOwner(profile.id)
  if (!ws) throw new Error("Workspace no encontrado")
  if (email === profile.email) throw new Error("No puedes invitarte a ti mismo")
  return inviteMember(ws.id, email, permissions)
}

export async function updatePermissions(memberId: string, permissions: WorkspaceMember["permissions"]) {
  await getProfileOrThrow()
  const { error } = await updateMemberPermissions(memberId, permissions)
  if (error) throw new Error("Error al actualizar permisos")
}

export async function removeTeamMember(memberId: string) {
  await getProfileOrThrow()
  await removeMember(memberId)
}
