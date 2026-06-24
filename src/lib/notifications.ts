import { createAdminClient } from "@/lib/supabase/server"

export interface AppNotification {
  id: string
  type: "invoice_overdue" | "task_due" | "lead_followup" | "invoice_pending"
  title: string
  desc: string
  href: string
  urgent: boolean
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]

  const notifications: AppNotification[] = []

  // Facturas vencidas (estado enviada y due_date pasado)
  const { data: overdueInvoices } = await supabase
    .from("invoices")
    .select("id, number, client_name, total, due_date")
    .eq("user_id", userId)
    .eq("status", "enviada")
    .lt("due_date", today)
    .limit(5)

  for (const inv of overdueInvoices ?? []) {
    notifications.push({
      id: `inv-overdue-${inv.id}`,
      type: "invoice_overdue",
      title: `Factura vencida — ${inv.client_name}`,
      desc: `${inv.number} · ${inv.total}€ · venció el ${new Date(inv.due_date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`,
      href: "/facturacion",
      urgent: true,
    })
  }

  // Tareas que vencen hoy o mañana
  const { data: dueTasks } = await supabase
    .from("tasks")
    .select("id, title, due_date, status")
    .eq("user_id", userId)
    .in("status", ["pendiente", "en_progreso"])
    .lte("due_date", tomorrow)
    .gte("due_date", today)
    .limit(5)

  for (const task of dueTasks ?? []) {
    const isToday = task.due_date === today
    notifications.push({
      id: `task-due-${task.id}`,
      type: "task_due",
      title: isToday ? `Tarea para hoy — ${task.title}` : `Tarea para mañana — ${task.title}`,
      desc: isToday ? "Vence hoy" : "Vence mañana",
      href: "/tareas",
      urgent: isToday,
    })
  }

  // Leads sin contactar en 7+ días
  const { data: coldLeads } = await supabase
    .from("contacts")
    .select("id, name, last_contact, pipeline_stage")
    .eq("user_id", userId)
    .eq("type", "lead")
    .eq("status", "potencial")
    .or(`last_contact.lt.${sevenDaysAgo},last_contact.is.null`)
    .limit(3)

  for (const lead of coldLeads ?? []) {
    notifications.push({
      id: `lead-cold-${lead.id}`,
      type: "lead_followup",
      title: `Seguimiento pendiente — ${lead.name}`,
      desc: lead.last_contact
        ? `Sin contacto desde hace más de 7 días`
        : `Lead sin contacto registrado`,
      href: "/contactos",
      urgent: false,
    })
  }

  return notifications
}
