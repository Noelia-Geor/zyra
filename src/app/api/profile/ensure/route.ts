import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getUserProfile, createUserProfile } from '@/lib/supabase/queries'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const existing = await getUserProfile(userId)
  if (existing) return NextResponse.json({ profile: existing })

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || email.split('@')[0]

  const { data, error } = await createUserProfile({ clerk_id: userId, email, name })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ profile: data })
}
