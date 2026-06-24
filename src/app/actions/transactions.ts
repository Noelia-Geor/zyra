'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { getTransactions, createTransaction, deleteTransaction, getUserProfile } from '@/lib/supabase/queries'

async function getUserId() {
  const { userId } = await auth()
  if (!userId) throw new Error('No autenticado')
  const profile = await getUserProfile(userId)
  if (!profile) throw new Error('Perfil no encontrado')
  return profile.id
}

export async function fetchTransactions() {
  const userId = await getUserId()
  return getTransactions(userId)
}

export async function addTransaction(formData: {
  type: 'ingreso' | 'gasto'
  amount: number
  category: string
  description: string
  date: string
}) {
  const userId = await getUserId()
  const { error } = await createTransaction({
    ...formData,
    user_id: userId,
    currency: 'EUR',
    contact_id: null,
    receipt_url: null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/finanzas')
  revalidatePath('/dashboard')
}

export async function removeTransaction(id: string) {
  await getUserId()
  const { error } = await deleteTransaction(id)
  if (error) throw new Error(error.message)
  revalidatePath('/finanzas')
}
