import { auth } from "@clerk/nextjs/server";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { WorkTimer } from "@/components/layout/work-timer";
import { GlobalSearch } from "@/components/layout/global-search";
import { ThemeProvider } from "@/components/layout/theme-provider";
import OnboardingModal from "@/components/layout/onboarding-modal";
import { getUserProfile, createUserProfile, getMemberPermissions } from "@/lib/supabase/queries";
import { getNotifications } from "@/lib/notifications";
import { currentUser } from "@clerk/nextjs/server";
import type { ThemeColor } from "@/types";

const DEFAULT_PERMISSIONS = {
  dashboard: true, contactos: true, finanzas: true,
  tareas: true, bienestar: true, reuniones: true, mejoras: true,
  facturacion: true, fichaje: true, flujos: true,
  presupuestos: true, calendario: true, fiscal: true, informes: true,
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  let profile = userId ? await getUserProfile(userId) : null

  if (userId && !profile) {
    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress ?? ''
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || email.split('@')[0]
    const { data } = await createUserProfile({ clerk_id: userId, email, name })
    profile = data

    // Si fue invitado a un workspace, activar su membresía
    if (email) {
      const supabase = (await import("@/lib/supabase/server")).createAdminClient()
      await supabase.from("workspace_members")
        .update({ user_id: data?.id, status: "active" })
        .eq("invited_email", email)
        .eq("status", "pending")
    }
  }

  // Permisos: si es miembro de un workspace, usa los suyos; si no, acceso total
  const userEmail = profile?.email ?? ""
  const memberPerms = userEmail ? await getMemberPermissions(userEmail) : null
  const permissions = memberPerms ?? DEFAULT_PERMISSIONS

  const themeColor: ThemeColor = (profile?.theme_color as ThemeColor) ?? "green"
  const notifications = profile ? await getNotifications(profile.id) : []

  return (
    <div className="flex h-screen bg-[#F7F8F9]">
      <ThemeProvider color={themeColor} />

      {/* Sidebar — solo desktop */}
      <div className="hidden md:flex">
        <AppSidebar permissions={permissions} notifications={notifications} />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Nav inferior — solo móvil */}
      <MobileNav permissions={permissions} />

      {/* Búsqueda global Cmd+K */}
      <GlobalSearch />

      {/* Temporizador de descanso */}
      <WorkTimer />

      {/* Onboarding primera vez */}
      <OnboardingModal userName={profile?.name ?? ""} />
    </div>
  );
}
