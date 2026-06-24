"use server"

import { auth } from "@clerk/nextjs/server"
import { getUserProfile, createMeeting, updateMeetingStatus, deleteMeeting } from "@/lib/supabase/queries"

export async function scheduleMeeting(data: {
  title: string
  description?: string
  scheduled_at: string
  duration_minutes: number
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")

  const profile = await getUserProfile(userId)
  if (!profile) throw new Error("Perfil no encontrado")

  // Crear sala en Daily.co (si hay API key configurada)
  let daily_room_url: string | null = null
  let daily_room_name: string | null = null

  const dailyKey = process.env.DAILY_API_KEY
  if (dailyKey) {
    const roomName = `zyra-${Date.now()}`
    const exp = Math.floor(new Date(data.scheduled_at).getTime() / 1000) + data.duration_minutes * 60 + 3600

    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${dailyKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          exp,
          enable_chat: true,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    })

    if (res.ok) {
      const room = await res.json()
      daily_room_url  = room.url
      daily_room_name = room.name
    }
  }

  const { data: meeting, error } = await createMeeting({
    title:            data.title,
    description:      data.description || null,
    scheduled_at:     data.scheduled_at,
    duration_minutes: data.duration_minutes,
    daily_room_url,
    daily_room_name,
    created_by:       profile.id,
    status:           "programada",
  })

  if (error || !meeting) throw new Error("Error al crear la reunión")
  return meeting
}

export async function cancelMeeting(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")
  await updateMeetingStatus(id, "cancelada")
}

export async function removeMeeting(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")
  await deleteMeeting(id)
}
