import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getCurrentProfile } from "@/lib/get-user"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" })

const CREDIT_PACKS = {
  pack_50:  { credits: 50,  price: 199,  label: "Pack 50 consultas IA" },
  pack_200: { credits: 200, price: 599,  label: "Pack 200 consultas IA" },
  pack_500: { credits: 500, price: 1299, label: "Pack 500 consultas IA" },
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { pack } = await req.json() as { pack: keyof typeof CREDIT_PACKS }
  const packData = CREDIT_PACKS[pack]
  if (!packData) return NextResponse.json({ error: "Pack inválido" }, { status: 400 })

  const profile = await getCurrentProfile()
  if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })

  const origin = req.headers.get("origin") || "http://localhost:3000"

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "eur",
        unit_amount: packData.price,
        product_data: {
          name: packData.label,
          description: `${packData.credits} consultas adicionales de IA para ZYRA`,
        },
      },
      quantity: 1,
    }],
    customer_email: profile.email,
    client_reference_id: userId,
    metadata: { clerk_user_id: userId, credits: packData.credits.toString(), type: "credits" },
    success_url: `${origin}/dashboard?credits_added=${packData.credits}`,
    cancel_url: `${origin}/configuracion`,
  })

  return NextResponse.json({ url: session.url })
}
