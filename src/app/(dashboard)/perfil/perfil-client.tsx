"use client"

import { useState, useTransition, useRef } from "react"
import { User, Mail, Phone, Building2, Briefcase, Camera, Check, AlertCircle, Palette } from "lucide-react"
import { Card } from "@/components/ui/card"
import { MobileHeader } from "@/components/layout/mobile-header"
import { saveProfile } from "@/app/actions/profile"
import { toast } from "sonner"
import { THEMES } from "@/lib/themes"
import { applyTheme } from "@/components/layout/theme-provider"
import type { UserProfile, ThemeColor } from "@/types"

export default function PerfilClient({ profile }: { profile: UserProfile }) {
  const [form, setForm] = useState({
    name:        profile.name ?? "",
    apellidos:   profile.apellidos ?? "",
    phone:       profile.phone ?? "",
    company_id:  profile.company_id ?? "",
    job_title:   profile.job_title ?? "",
    avatar_url:  profile.avatar_url ?? "",
    theme_color: (profile.theme_color ?? "green") as ThemeColor,
  })
  const [saved, setSaved]       = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const initials = [form.name[0], form.apellidos[0]].filter(Boolean).join("").toUpperCase() || "?"

  function handleSave() {
    if (!form.name.trim()) { toast.error("El nombre es obligatorio"); return }
    startTransition(async () => {
      try {
        await saveProfile(form)
        setSaved(true)
        toast.success("Perfil guardado")
        setTimeout(() => setSaved(false), 3000)
      } catch (e: any) {
        toast.error(e.message)
      }
    })
  }

  // Avatar: convierte a base64 para preview (en prod usaríamos Supabase Storage)
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error("La imagen no puede superar 2 MB"); return }
    const reader = new FileReader()
    reader.onload = () => setForm(f => ({ ...f, avatar_url: reader.result as string }))
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <MobileHeader title="Mi perfil" />
      <div className="p-4 md:p-6 max-w-xl mx-auto">

        <div className="hidden md:flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-[#4E8B6B]" />
          <h1 className="text-2xl font-bold text-[#2D5C44]">Mi perfil</h1>
        </div>

        {/* Avatar */}
        <Card className="p-6 border-[#C8DFD2] bg-white mb-4 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#E8F2EC] flex items-center justify-center overflow-hidden border-4 border-[#C8DFD2]">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-[#4E8B6B]">{initials}</span>
              )}
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#4E8B6B] text-white rounded-full flex items-center justify-center hover:bg-[#3D7059] transition-colors shadow-md">
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#2D5C44]">{form.name} {form.apellidos}</p>
            <p className="text-sm text-[#6B8C7A]">{profile.email}</p>
            {form.job_title && <p className="text-xs text-[#4E8B6B] mt-0.5">{form.job_title}</p>}
          </div>
        </Card>

        {/* Formulario */}
        <Card className="p-5 border-[#C8DFD2] bg-white space-y-4">

          {/* Nombre + Apellidos — obligatorios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#4A6355] mb-1.5 flex items-center gap-1">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]"
                placeholder="Tu nombre" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#4A6355] mb-1.5 flex items-center gap-1">
                Apellidos <span className="text-red-400">*</span>
              </label>
              <input value={form.apellidos} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))}
                className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]"
                placeholder="Tus apellidos" />
            </div>
          </div>

          {/* Email (solo lectura) */}
          <div>
            <label className="text-xs font-semibold text-[#4A6355] mb-1.5 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Correo electrónico
            </label>
            <div className="flex items-center gap-2 px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl bg-[#F2F7F4] text-[#6B8C7A]">
              {profile.email}
              <Check className="h-3.5 w-3.5 text-[#4E8B6B] ml-auto" />
            </div>
            <p className="text-xs text-[#6B8C7A] mt-1">El email se gestiona desde tu cuenta de autenticación</p>
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-xs font-semibold text-[#4A6355] mb-1.5 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Teléfono
            </label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} type="tel"
              className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]"
              placeholder="+34 600 000 000" />
          </div>

          {/* NIF/CIF empresa */}
          <div>
            <label className="text-xs font-semibold text-[#4A6355] mb-1.5 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> NIF / CIF de la empresa
            </label>
            <input value={form.company_id} onChange={e => setForm(f => ({ ...f, company_id: e.target.value }))}
              className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]"
              placeholder="B12345678" />
            <p className="text-xs text-[#6B8C7A] mt-1">Número de identificación fiscal de tu empresa u organización</p>
          </div>

          {/* Cargo / puesto */}
          <div>
            <label className="text-xs font-semibold text-[#4A6355] mb-1.5 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Cargo o puesto
            </label>
            <input value={form.job_title} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))}
              className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none focus:border-[#4E8B6B]"
              placeholder="Diseñadora UX, CEO, Consultora..." />
          </div>

          {/* Color de tema */}
          <div>
            <label className="text-xs font-semibold text-[#4A6355] mb-2 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" /> Color de tu plataforma
            </label>
            <p className="text-xs text-[#6B8C7A] mb-3">Elige el tono que más te inspire. Solo lo verás tú.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.entries(THEMES) as [ThemeColor, typeof THEMES[ThemeColor]][]).map(([key, theme]) => (
                <button key={key} onClick={() => { setForm(f => ({ ...f, theme_color: key })); applyTheme(key) }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all ${
                    form.theme_color === key
                      ? "border-current shadow-sm scale-[1.02]"
                      : "border-[#C8DFD2] hover:border-gray-300"
                  }`}
                  style={form.theme_color === key ? { borderColor: theme.brand } : {}}>
                  <span className="w-5 h-5 rounded-full shrink-0 ring-2 ring-offset-1"
                    style={{ backgroundColor: theme.preview, ringColor: form.theme_color === key ? theme.brand : "transparent" }} />
                  <span className="text-xs font-medium text-[#2D5C44]">{theme.label}</span>
                  {form.theme_color === key && (
                    <Check className="h-3 w-3 ml-auto shrink-0" style={{ color: theme.brand }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Aviso campos obligatorios */}
          {(!form.name.trim() || !form.apellidos.trim()) && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">Nombre y apellidos son obligatorios</p>
            </div>
          )}

          {/* Botón guardar */}
          <button onClick={handleSave}
            disabled={!form.name.trim() || !form.apellidos.trim() || isPending}
            className="w-full py-3.5 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
            {isPending ? "Guardando..." : saved ? <><Check className="h-4 w-4" /> Guardado</> : "Guardar perfil"}
          </button>
        </Card>
      </div>
    </div>
  )
}
