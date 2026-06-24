'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createContact, deleteContact, updateContact, getContacts } from '@/lib/supabase/queries'
import { getUserProfile } from '@/lib/supabase/queries'
import { checkContactLimit } from '@/lib/plan-gates'

async function getUserId() {
  const { userId } = await auth()
  if (!userId) throw new Error('No autenticado')
  const profile = await getUserProfile(userId)
  if (!profile) throw new Error('Perfil no encontrado')
  return profile.id
}

export async function fetchContacts() {
  const userId = await getUserId()
  return getContacts(userId)
}

export async function addContact(formData: {
  name: string
  email: string
  phone: string
  company: string
  type: 'cliente' | 'lead' | 'proveedor' | 'colaborador' | 'otro'
  status: 'activo' | 'inactivo' | 'potencial'
  notes: string
}) {
  const userId = await getUserId()
  await checkContactLimit(userId)
  const { error } = await createContact({
    ...formData, user_id: userId, last_contact: null,
    pipeline_stage: (formData as any).pipeline_stage ?? 'lead',
    pipeline_value: (formData as any).pipeline_value ?? 0,
    portal_token: null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/contactos')
}

export async function removeContact(id: string) {
  await getUserId()
  const { error } = await deleteContact(id)
  if (error) throw new Error(error.message)
  revalidatePath('/contactos')
}

export async function editContact(id: string, updates: Parameters<typeof updateContact>[1]) {
  await getUserId()
  const { error } = await updateContact(id, updates)
  if (error) throw new Error(error.message)
  revalidatePath('/contactos')
}
