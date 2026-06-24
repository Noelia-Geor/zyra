"use client"

import { useState, useEffect, useTransition } from "react"
import { Search, X, Users, CheckSquare, FileText, BarChart3, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: string
  type: "contact" | "task" | "invoice"
  title: string
  subtitle: string
  href: string
}

const TYPE_CONFIG = {
  contact: { icon: Users,      label: "Contacto",  color: "text-blue-500",  bg: "bg-blue-50"  },
  task:    { icon: CheckSquare, label: "Tarea",     color: "text-amber-500", bg: "bg-amber-50" },
  invoice: { icon: FileText,   label: "Factura",   color: "text-[#4E8B6B]", bg: "bg-[#E8F2EC]" },
}

const QUICK_LINKS = [
  { label: "Dashboard",    href: "/dashboard",   icon: BarChart3 },
  { label: "Contactos",    href: "/contactos",   icon: Users },
  { label: "Facturación",  href: "/facturacion", icon: FileText },
  { label: "Tareas",       href: "/tareas",      icon: CheckSquare },
]

export function GlobalSearch() {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState(0)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Cmd+K / Ctrl+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Buscar cuando cambia query
  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return }
    const timeout = setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
          if (res.ok) setResults(await res.json())
        } catch { setResults([]) }
      })
    }, 200)
    return () => clearTimeout(timeout)
  }, [query])

  // Navegación con teclado
  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      const total = results.length || QUICK_LINKS.length
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => (s + 1) % total) }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => (s - 1 + total) % total) }
      if (e.key === "Enter") {
        e.preventDefault()
        const item = results[selected]
        if (item) { router.push(item.href); setOpen(false); setQuery("") }
        else if (!query.trim()) { router.push(QUICK_LINKS[selected]?.href ?? "/dashboard"); setOpen(false) }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, results, selected, query, router])

  // Reset selected on results change
  useEffect(() => { setSelected(0) }, [results])

  function navigate(href: string) {
    router.push(href)
    setOpen(false)
    setQuery("")
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-start justify-center pt-[15vh] px-4"
      onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#C8DFD2]">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E8F2EC]">
          <Search className="h-4 w-4 text-[#6B8C7A] shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar contactos, tareas, facturas..."
            className="flex-1 text-sm outline-none text-[#2D5C44] placeholder-[#6B8C7A] bg-transparent"
          />
          {isPending && (
            <div className="h-3.5 w-3.5 border-2 border-[#4E8B6B] border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          <button onClick={() => setOpen(false)} className="text-[#6B8C7A] hover:text-[#2D5C44]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto">
          {query.length >= 2 ? (
            results.length === 0 && !isPending ? (
              <div className="px-4 py-8 text-center text-sm text-[#6B8C7A]">
                Sin resultados para "{query}"
              </div>
            ) : (
              <div className="py-1">
                {results.map((r, i) => {
                  const cfg = TYPE_CONFIG[r.type]
                  const Icon = cfg.icon
                  return (
                    <button key={r.id} onClick={() => navigate(r.href)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === selected ? "bg-[#F2F7F4]" : "hover:bg-[#F7FCFA]"}`}>
                      <div className={`p-1.5 rounded-lg shrink-0 ${cfg.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2D5C44] truncate">{r.title}</p>
                        <p className="text-xs text-[#6B8C7A] truncate">{r.subtitle}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    </button>
                  )
                })}
              </div>
            )
          ) : (
            <div className="py-2">
              <p className="px-4 py-2 text-[10px] font-semibold text-[#6B8C7A] uppercase tracking-wider">Accesos rápidos</p>
              {QUICK_LINKS.map((l, i) => {
                const Icon = l.icon
                return (
                  <button key={l.href} onClick={() => navigate(l.href)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === selected ? "bg-[#F2F7F4]" : "hover:bg-[#F7FCFA]"}`}>
                    <div className="p-1.5 bg-[#E8F2EC] rounded-lg shrink-0">
                      <Icon className="h-3.5 w-3.5 text-[#4E8B6B]" />
                    </div>
                    <span className="text-sm text-[#2D5C44]">{l.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#C8DFD2] ml-auto" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-[#E8F2EC] flex items-center gap-3 text-[10px] text-[#6B8C7A]">
          <span><kbd className="bg-[#F0F0F0] px-1 rounded">↑↓</kbd> Navegar</span>
          <span><kbd className="bg-[#F0F0F0] px-1 rounded">↵</kbd> Abrir</span>
          <span><kbd className="bg-[#F0F0F0] px-1 rounded">Esc</kbd> Cerrar</span>
          <span className="ml-auto"><kbd className="bg-[#F0F0F0] px-1 rounded">⌘K</kbd></span>
        </div>
      </div>
    </div>
  )
}

// Botón que activa la búsqueda — para el sidebar
export function SearchTrigger() {
  function open() {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))
  }
  return (
    <button onClick={open}
      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#6B8C7A] bg-[#F2F7F4] hover:bg-[#E8F2EC] rounded-xl transition-colors border border-[#C8DFD2]">
      <Search className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 text-left text-xs">Buscar...</span>
      <kbd className="text-[9px] bg-white px-1.5 py-0.5 rounded border border-[#C8DFD2] font-mono">⌘K</kbd>
    </button>
  )
}
