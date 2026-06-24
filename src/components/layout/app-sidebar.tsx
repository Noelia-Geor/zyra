"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard, Users, BarChart3, CheckSquare,
  Heart, Settings, ChevronLeft, ChevronRight, LogOut, Lightbulb, ShieldCheck, Video, UserCircle,
  FileText, Clock, Zap, ClipboardList, Calendar, Calculator, TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/context";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { SearchTrigger } from "@/components/layout/global-search";
import type { AppNotification } from "@/lib/notifications";

interface Permissions {
  dashboard: boolean; contactos: boolean; finanzas: boolean
  tareas: boolean; bienestar: boolean; reuniones: boolean; mejoras: boolean
  facturacion: boolean; fichaje: boolean; flujos: boolean
  presupuestos: boolean; calendario: boolean; fiscal: boolean; informes: boolean
}

export function AppSidebar({ permissions, notifications = [] }: { permissions: Permissions; notifications?: AppNotification[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { t, locale, setLocale } = useT();
  const [collapsed, setCollapsed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const NAV_GROUPS = [
    {
      key: "principal",
      label: "Principal",
      items: [
        { href: "/dashboard", label: t.nav.today,   icon: LayoutDashboard, key: "dashboard" },
        { href: "/contactos", label: t.nav.contacts, icon: Users,           key: "contactos" },
        { href: "/tareas",    label: t.nav.tasks,    icon: CheckSquare,     key: "tareas" },
        { href: "/bienestar", label: t.nav.wellness, icon: Heart,           key: "bienestar" },
      ],
    },
    {
      key: "negocio",
      label: "Negocio",
      items: [
        { href: "/facturacion",  label: "Facturación",  icon: FileText,      key: "facturacion" },
        { href: "/presupuestos", label: "Presupuestos", icon: ClipboardList, key: "presupuestos" },
        { href: "/finanzas",     label: t.nav.finances, icon: BarChart3,     key: "finanzas" },
        { href: "/fiscal",       label: "Fiscal",       icon: Calculator,    key: "fiscal" },
        { href: "/informes",     label: "Informes",     icon: TrendingUp,    key: "informes" },
      ],
    },
    {
      key: "gestion",
      label: "Gestión",
      items: [
        { href: "/fichaje",    label: "Fichaje",    icon: Clock,     key: "fichaje" },
        { href: "/calendario", label: "Calendario", icon: Calendar,  key: "calendario" },
        { href: "/reuniones",  label: "Reuniones",  icon: Video,     key: "reuniones" },
        { href: "/flujos",     label: "Flujos",     icon: Zap,       key: "flujos" },
        { href: "/mejoras",    label: "Mejoras",    icon: Lightbulb, key: "mejoras" },
      ],
    },
  ]

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ principal: true, negocio: false, gestion: false })

  // Abrir automáticamente el grupo que contiene la ruta activa
  useEffect(() => {
    NAV_GROUPS.forEach(g => {
      if (g.items.some(i => pathname === i.href || pathname.startsWith(i.href + "/"))) {
        setOpenGroups(prev => ({ ...prev, [g.key]: true }))
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  function toggleGroup(key: string) {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const isAdmin = email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const name = user?.fullName || user?.firstName || email.split("@")[0] || "Usuario";
  const initials = name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/");
  }

  return (
    <aside className={cn(
      "flex flex-col bg-white border-r border-[#E8ECEA] transition-all duration-200 shadow-sm",
      collapsed ? "w-16" : "w-56"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center h-14 px-4 border-b border-[#C8DFD2]",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#4E8B6B] flex items-center justify-center">
              <span className="text-white text-xs font-bold">Z</span>
            </div>
            <span className="text-base font-bold tracking-tight text-[#2D5C44]">ZYRA</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          {!collapsed && <NotificationsBell notifications={notifications} />}
          <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-[#6B8C7A] hover:text-[#2D5C44] hover:bg-[#E8F2EC] transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      {!collapsed && (
        <div className="px-3 pt-2 pb-1">
          <SearchTrigger />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-1">
        {NAV_GROUPS.map(group => {
          const visibleItems = group.items.filter(i => permissions[i.key as keyof Permissions])
          if (visibleItems.length === 0) return null
          const isOpen = openGroups[group.key]
          const hasActive = visibleItems.some(i => pathname === i.href || pathname.startsWith(i.href + "/"))

          if (collapsed) {
            // En modo colapsado: solo iconos sin grupos
            return visibleItems.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link key={item.href} href={item.href}
                  className={cn("flex justify-center px-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                    active ? "bg-[#EAF5EF] text-[#2D5C44]" : "text-[#4A5568] hover:bg-[#F2F4F3] hover:text-[#1A1D1B]")}
                  title={item.label}>
                  <item.icon className="h-4 w-4 shrink-0" />
                </Link>
              )
            })
          }

          return (
            <div key={group.key}>
              {/* Cabecera de grupo */}
              <button onClick={() => toggleGroup(group.key)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors",
                  hasActive ? "text-[#4E8B6B]" : "text-[#9DB5AA] hover:text-[#6B8C7A]"
                )}>
                <span>{group.label}</span>
                <ChevronRight className={cn("h-3 w-3 transition-transform", isOpen && "rotate-90")} />
              </button>

              {/* Items */}
              {isOpen && (
                <div className="mt-0.5 space-y-0.5">
                  {visibleItems.map(item => {
                    const active = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <Link key={item.href} href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                          active ? "bg-[#EAF5EF] text-[#2D5C44] font-semibold" : "text-[#4A5568] hover:bg-[#F2F4F3] hover:text-[#1A1D1B]"
                        )}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className={cn(
        "p-3 border-t border-[#C8DFD2] space-y-0.5",
        collapsed && "flex flex-col items-center gap-1"
      )}>
        {/* Language switcher */}
        {!collapsed ? (
          <div className="flex items-center gap-1 px-3 py-1.5 mb-1">
            <span className="text-xs text-[#6B8C7A] mr-1">{t.settings.language}:</span>
            <button
              onClick={() => setLocale("es")}
              className={cn(
                "text-xs px-2 py-0.5 rounded-lg font-medium transition-colors",
                locale === "es"
                  ? "bg-[#4E8B6B] text-white"
                  : "text-[#6B8C7A] hover:text-[#2D5C44] hover:bg-[#E8F2EC]"
              )}
            >ES</button>
            <button
              onClick={() => setLocale("en")}
              className={cn(
                "text-xs px-2 py-0.5 rounded-lg font-medium transition-colors",
                locale === "en"
                  ? "bg-[#4E8B6B] text-white"
                  : "text-[#6B8C7A] hover:text-[#2D5C44] hover:bg-[#E8F2EC]"
              )}
            >EN</button>
          </div>
        ) : (
          <button
            onClick={() => setLocale(locale === "es" ? "en" : "es")}
            className="text-xs px-2 py-1 rounded-lg text-[#6B8C7A] hover:text-[#2D5C44] hover:bg-[#E8F2EC] font-medium transition-colors"
            title={locale === "es" ? "Switch to English" : "Cambiar a Español"}
          >
            {locale.toUpperCase()}
          </button>
        )}

        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#4A6355] hover:bg-[#E8F2EC] hover:text-[#2D5C44] transition-colors",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Panel Admin" : undefined}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Panel Admin</span>}
          </Link>
        )}

        <Link
          href="/equipo"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#4A6355] hover:bg-[#E8F2EC] hover:text-[#2D5C44] transition-colors",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Mi equipo" : undefined}
        >
          <Users className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Mi equipo</span>}
        </Link>


        <Link
          href="/configuracion"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#4A6355] hover:bg-[#E8F2EC] hover:text-[#2D5C44] transition-colors",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? t.nav.settings : undefined}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t.nav.settings}</span>}
        </Link>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6B8C7A] hover:bg-[#F2F4F3] hover:text-[#4A5568] transition-colors disabled:opacity-50",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? t.nav.signOut : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{signingOut ? t.nav.signingOut : t.nav.signOut}</span>}
        </button>

        {/* User card */}
        {!collapsed ? (
          <Link href="/perfil" className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl bg-[#F2F7F4] hover:bg-[#E8F2EC] transition-colors cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-[#4E8B6B] text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#2D5C44] truncate">{name}</p>
              <p className="text-[10px] text-[#6B8C7A] truncate">{email}</p>
            </div>
          </Link>
        ) : (
          <Link href="/perfil" className="h-8 w-8 rounded-full bg-[#4E8B6B] text-white text-xs font-semibold flex items-center justify-center mt-1 hover:opacity-80 transition-opacity">
            {initials}
          </Link>
        )}
      </div>
    </aside>
  );
}
