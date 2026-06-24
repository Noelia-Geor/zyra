"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BarChart3, CheckSquare, Heart, Video, FileText, Clock, Zap, Lightbulb, ClipboardList, Calendar, Calculator, TrendingUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/context";

interface Permissions {
  dashboard: boolean; contactos: boolean; finanzas: boolean
  tareas: boolean; bienestar: boolean; reuniones: boolean; mejoras: boolean
  facturacion: boolean; fichaje: boolean; flujos: boolean
  presupuestos: boolean; calendario: boolean; fiscal: boolean; informes: boolean
}

export function MobileNav({ permissions }: { permissions: Permissions }) {
  const pathname = usePathname();
  const { t } = useT();

  const allItems = [
    { href: "/dashboard",   label: t.nav.today,    icon: LayoutDashboard, key: "dashboard" },
    { href: "/contactos",   label: t.nav.contacts,  icon: Users,           key: "contactos" },
    { href: "/finanzas",    label: t.nav.finances,  icon: BarChart3,       key: "finanzas" },
    { href: "/tareas",      label: t.nav.tasks,     icon: CheckSquare,     key: "tareas" },
    { href: "/bienestar",   label: t.nav.wellness,  icon: Heart,           key: "bienestar" },
    { href: "/reuniones",   label: "Reuniones",     icon: Video,           key: "reuniones" },
    { href: "/facturacion",  label: "Facturas",     icon: FileText,      key: "facturacion" },
    { href: "/presupuestos", label: "Presup.",      icon: ClipboardList,  key: "presupuestos" },
    { href: "/fichaje",      label: "Fichaje",      icon: Clock,          key: "fichaje" },
    { href: "/calendario",   label: "Calendario",   icon: Calendar,       key: "calendario" },
    { href: "/flujos",       label: "Flujos",       icon: Zap,            key: "flujos" },
    { href: "/mejoras",      label: "Mejoras",      icon: Lightbulb,      key: "mejoras" },
    { href: "/fiscal",       label: "Fiscal",       icon: Calculator,     key: "fiscal" },
    { href: "/informes",     label: "Informes",     icon: TrendingUp,     key: "informes" },
  ];
  const items = allItems.filter(i => permissions[i.key as keyof Permissions]).slice(0, 6);

  function openSearch() {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#C8DFD2] safe-area-pb">
      <div className="flex items-center justify-around px-1 py-1.5">
        {items.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0",
                active ? "text-[#4E8B6B]" : "text-[#6B8C7A]")}>
              <div className={cn("p-1.5 rounded-xl transition-all", active ? "bg-[#E8F2EC]" : "")}>
                <item.icon className="h-[18px] w-[18px]" />
              </div>
              <span className={cn("text-[9px] font-medium truncate max-w-[44px] text-center",
                active ? "text-[#4E8B6B] font-semibold" : "text-[#6B8C7A]")}>
                {item.label}
              </span>
            </Link>
          );
        })}
        {/* Botón búsqueda en móvil */}
        <button onClick={openSearch}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[#6B8C7A]">
          <div className="p-1.5 rounded-xl">
            <Search className="h-[18px] w-[18px]" />
          </div>
          <span className="text-[9px] font-medium">Buscar</span>
        </button>
      </div>
    </nav>
  );
}
