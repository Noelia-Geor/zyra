import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getUserProfile } from "@/lib/supabase/queries"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" })

const PRICES: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO!,
  business: process.env.STRIPE_PRICE_BUSINESS!,
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { plan } = await req.json()
  if (!PRICES[plan]) return NextResponse.json({ error: "Plan inválido" }, { status: 400 })

  const profile = await getUserProfile(userId)
  if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })

  const origin = req.headers.get("origin") || "http://localhost:3000"

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card", "paypal"],
    line_items: [{ price: PRICES[plan], quantity: 1 }],
    customer_email: profile.email,
    client_reference_id: userId,
    metadata: { clerk_user_id: userId, plan },
    success_url: `${origin}/configuracion?success=1&plan=${plan}`,
    cancel_url: `${origin}/configuracion?canceled=1`,
    payment_method_options: {
      card: {
        request_three_d_secure: "automatic",
      },
    },
    // Apple Pay y Google Pay se activan automáticamente con Stripe cuando el navegador los soporta
    wallet_options: {
      apple_pay: { enabled: true },
      google_pay: { enabled: true },
    } as any,
  })

  return NextResponse.json({ url: session.url })
}
