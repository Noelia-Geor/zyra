import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createUserProfile, getUserProfile } from '@/lib/supabase/queries'

export async function POST(req: Request) {
  const body = await req.json()
  const { type, data } = body

  if (type === 'user.created') {
    const clerkId = data.id
    const email = data.email_addresses?.[0]?.email_address ?? ''
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || email.split('@')[0]

    const existing = await getUserProfile(clerkId)
    if (!existing) {
      await createUserProfile({ clerk_id: clerkId, email, name })
    }
  }

  return NextResponse.json({ ok: true })
}
