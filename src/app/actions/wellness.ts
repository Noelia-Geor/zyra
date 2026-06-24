'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { getWellnessEntries, upsertWellnessEntry, getUserProfile } from '@/lib/supabase/queries'

async function getUserId() {
  const { userId } = await auth()
  if (!userId) throw new Error('No autenticado')
  const profile = await getUserProfile(userId)
  if (!profile) throw new Error('Perfil no encontrado')
  return profile.id
}

export async function fetchWellnessEntries() {
  const userId = await getUserId()
  return getWellnessEntries(userId)
}

export async function saveWellnessEntry(data: {
  energy_level: number
  mood: number
  notes: string
}) {
  const userId = await getUserId()
  const today = new Date().toISOString().split('T')[0]
  const { error } = await upsertWellnessEntry({
    user_id: userId,
    date: today,
    energy_level: data.energy_level,
    mood: data.mood,
    notes: data.notes || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/bienestar')
  revalidatePath('/dashboard')
}
