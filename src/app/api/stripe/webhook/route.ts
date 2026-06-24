import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" })

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const clerkUserId = session.metadata?.clerk_user_id
    const type = session.metadata?.type

    if (!clerkUserId) return NextResponse.json({ received: true })

    if (type === "credits") {
      // Pack de créditos — suma al límite extra del usuario
      const credits = parseInt(session.metadata?.credits ?? "0")
      if (credits > 0) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("ai_credits_limit")
          .eq("clerk_id", clerkUserId)
          .single()

        if (profile) {
          await supabase
            .from("user_profiles")
            .update({ ai_credits_limit: (profile.ai_credits_limit ?? 10) + credits })
            .eq("clerk_id", clerkUserId)
        }
      }
    } else {
      // Cambio de plan
      const plan = session.metadata?.plan as "pro" | "business" | undefined
      if (plan) {
        await supabase
          .from("user_profiles")
          .update({
            plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq("clerk_id", clerkUserId)
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription
    await supabase
      .from("user_profiles")
      .update({ plan: "free", stripe_subscription_id: null })
      .eq("stripe_subscription_id", sub.id)
  }

  return NextResponse.json({ received: true })
}
