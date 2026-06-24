"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X, AlertTriangle, Clock, Users, FileText } from "lucide-react"

interface Notification {
  id: string
  type: "invoice_overdue" | "task_due" | "lead_followup" | "invoice_pending"
  title: string
  desc: string
  href: string
  urgent: boolean
}

interface Props {
  notifications: Notification[]
}

const iconMap = {
  invoice_overdue: FileText,
  invoice_pending: FileText,
  task_due: Clock,
  lead_followup: Users,
}

export function NotificationsBell({ notifications }: Props) {
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const ref = useRef<HTMLDivElement>(null)

  const visible = notifications.filter(n => !dismissed.has(n.id))
  const urgent  = visible.filter(n => n.urgent).length

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function dismiss(id: string) {
    setDismissed(prev => new Set([...prev, id]))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-[#E8F2EC] transition-colors text-[#4E8B6B]">
        <Bell className="h-5 w-5" />
        {urgent > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {urgent > 9 ? "9+" : urgent}
          </span>
        )}
        {urgent === 0 && visible.length > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-amber-400 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-[#C8DFD2] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8F2EC]">
            <h3 className="font-semibold text-sm text-[#2D5C44]">Notificaciones</h3>
            {visible.length > 0 && (
              <button onClick={() => setDismissed(new Set(notifications.map(n => n.id)))}
                className="text-xs text-[#6B8C7A] hover:text-[#4E8B6B] transition-colors">
                Marcar todo como leído
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#F0F7F3]">
            {visible.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 text-[#C8DFD2] mx-auto mb-2" />
                <p className="text-sm text-[#6B8C7A]">Sin notificaciones pendientes</p>
              </div>
            ) : (
              visible.map(n => {
                const Icon = iconMap[n.type]
                return (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-[#F7FCFA] group ${n.urgent ? "border-l-2 border-l-red-400" : ""}`}>
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${n.urgent ? "bg-red-50" : "bg-[#E8F2EC]"}`}>
                      {n.urgent
                        ? <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        : <Icon className="h-3.5 w-3.5 text-[#4E8B6B]" />
                      }
                    </div>
                    <a href={n.href} className="flex-1 min-w-0" onClick={() => setOpen(false)}>
                      <p className="text-xs font-semibold text-[#2D5C44] leading-tight">{n.title}</p>
                      <p className="text-xs text-[#6B8C7A] mt-0.5 leading-snug">{n.desc}</p>
                    </a>
                    <button onClick={() => dismiss(n.id)}
                      className="text-[#C8DFD2] hover:text-[#6B8C7A] opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
