'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { getTasks, createTask, updateTask, deleteTask, getUserProfile } from '@/lib/supabase/queries'

async function getUserId() {
  const { userId } = await auth()
  if (!userId) throw new Error('No autenticado')
  const profile = await getUserProfile(userId)
  if (!profile) throw new Error('Perfil no encontrado')
  return profile.id
}

export async function fetchTasks() {
  const userId = await getUserId()
  return getTasks(userId)
}

export async function addTask(formData: {
  title: string
  description: string
  priority: 'baja' | 'media' | 'alta'
  due_date: string
}) {
  const userId = await getUserId()
  const { error } = await createTask({
    ...formData,
    user_id: userId,
    status: 'pendiente',
    contact_id: null,
    due_date: formData.due_date || null,
    description: formData.description || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/tareas')
  revalidatePath('/dashboard')
}

export async function changeTaskStatus(id: string, status: 'pendiente' | 'en_progreso' | 'completada') {
  await getUserId()
  const { error } = await updateTask(id, { status })
  if (error) throw new Error(error.message)
  revalidatePath('/tareas')
  revalidatePath('/dashboard')
}

export async function removeTask(id: string) {
  await getUserId()
  const { error } = await deleteTask(id)
  if (error) throw new Error(error.message)
  revalidatePath('/tareas')
}
