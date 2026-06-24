import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getUserProfile } from "@/lib/supabase/queries"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json([], { status: 401 })

  const profile = await getUserProfile(userId)
  if (!profile) return NextResponse.json([])

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const supabase = createAdminClient()
  const results: any[] = []

  // Contactos
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, name, email, company, type")
    .eq("user_id", profile.id)
    .or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%`)
    .limit(4)

  for (const c of contacts ?? []) {
    results.push({
      id: c.id, type: "contact",
      title: c.name,
      subtitle: [c.company, c.email].filter(Boolean).join(" · "),
      href: "/contactos",
    })
  }

  // Tareas
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, status, priority")
    .eq("user_id", profile.id)
    .ilike("title", `%${q}%`)
    .limit(3)

  for (const t of tasks ?? []) {
    results.push({
      id: t.id, type: "task",
      title: t.title,
      subtitle: `${t.status} · ${t.priority}`,
      href: "/tareas",
    })
  }

  // Facturas
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, number, client_name, total, status")
    .eq("user_id", profile.id)
    .or(`number.ilike.%${q}%,client_name.ilike.%${q}%`)
    .limit(3)

  for (const inv of invoices ?? []) {
    results.push({
      id: inv.id, type: "invoice",
      title: `${inv.number} — ${inv.client_name}`,
      subtitle: `${inv.total}€ · ${inv.status}`,
      href: "/facturacion",
    })
  }

  return NextResponse.json(results)
}
