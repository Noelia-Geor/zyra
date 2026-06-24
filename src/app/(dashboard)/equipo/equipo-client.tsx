"use client"

import { useState, useTransition } from "react"
import { Users, Plus, X, Trash2, Mail, Shield, Eye, EyeOff, Check, Crown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { MobileHeader } from "@/components/layout/mobile-header"
import { getOrCreateWorkspace, inviteTeamMember, updatePermissions, removeTeamMember } from "@/app/actions/workspace"
import { toast } from "sonner"
import type { WorkspaceMember, Workspace } from "@/types"

const MODULE_LABELS: Record<keyof WorkspaceMember["permissions"], string> = {
  dashboard:   "Dashboard",
  contactos:   "Contactos",
  finanzas:    "Finanzas",
  tareas:      "Tareas",
  bienestar:   "Bienestar",
  reuniones:   "Reuniones",
  mejoras:     "Mejoras",
  facturacion:  "Facturación",
  presupuestos: "Presupuestos",
  fichaje:      "Fichaje",
  calendario:   "Calendario",
  flujos:       "Flujos",
  fiscal:       "Fiscal",
  informes:     "Informes",
}

const DEFAULT_PERMS: WorkspaceMember["permissions"] = {
  dashboard: true, contactos: true, finanzas: false,
  tareas: true, bienestar: true, reuniones: true, mejoras: true,
  facturacion: false, presupuestos: false, fichaje: true, calendario: true, flujos: false,
  fiscal: false, informes: false,
}

function PermToggle({
  label, enabled, onChange
}: { label: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!enabled)}
      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl border transition-all text-sm ${
        enabled
          ? "bg-[var(--brand-light,#E8F2EC)] border-[var(--brand-border,#C8DFD2)] text-[var(--brand,#4E8B6B)]"
          : "bg-white border-[#E5E7EB] text-gray-400"
      }`}>
      <span className="font-medium">{label}</span>
      {enabled
        ? <Eye className="h-4 w-4" />
        : <EyeOff className="h-4 w-4" />}
    </button>
  )
}

function MemberCard({
  member, onUpdatePerms, onRemove
}: {
  member: WorkspaceMember
  onUpdatePerms: (id: string, perms: WorkspaceMember["permissions"]) => void
  onRemove: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [perms, setPerms]       = useState(member.permissions)
  const [isPending, startTransition] = useTransition()
  const initials = (member.profile_name || member.invited_email).substring(0, 2).toUpperCase()

  function togglePerm(key: keyof WorkspaceMember["permissions"], val: boolean) {
    const newPerms = { ...perms, [key]: val }
    setPerms(newPerms)
    startTransition(async () => {
      try {
        await updatePermissions(member.id, newPerms)
        onUpdatePerms(member.id, newPerms)
        toast.success("Permisos actualizados")
      } catch { toast.error("Error al guardar") }
    })
  }

  return (
    <Card className="border-[#C8DFD2] bg-white overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white"
          style={{ background: "var(--brand, #4E8B6B)" }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#2D5C44] truncate">
            {member.profile_name || "Pendiente de registro"}
          </p>
          <p className="text-xs text-[#6B8C7A] truncate">{member.invited_email}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
            member.status === "active"
              ? "bg-[var(--brand-light,#E8F2EC)] text-[var(--brand,#4E8B6B)] border-[var(--brand-border,#C8DFD2)]"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}>
            {member.status === "active" ? "Activo" : "Invitado"}
          </span>
          <button onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-[#F2F7F4] text-[#6B8C7A] transition-colors">
            <Shield className="h-4 w-4" />
          </button>
          <button onClick={() => onRemove(member.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-[#C8DFD2] hover:text-red-400 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#C8DFD2] bg-[#F9FCFA] px-4 py-3">
          <p className="text-xs font-semibold text-[#4A6355] mb-3 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Módulos visibles para esta persona
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(MODULE_LABELS) as (keyof WorkspaceMember["permissions"])[]).map(key => (
              <PermToggle key={key} label={MODULE_LABELS[key]}
                enabled={perms[key]} onChange={v => togglePerm(key, v)} />
            ))}
          </div>
          {isPending && <p className="text-xs text-[#6B8C7A] mt-2 text-center">Guardando...</p>}
        </div>
      )}
    </Card>
  )
}

export default function EquipoClient({
  profile, workspace: initialWs, initialMembers,
}: {
  profile: { id: string; name: string; email: string }
  workspace: Workspace | null
  initialMembers: WorkspaceMember[]
}) {
  const [workspace, setWorkspace] = useState<Workspace | null>(initialWs)
  const [members, setMembers]     = useState<WorkspaceMember[]>(initialMembers)
  const [showForm, setShowForm]   = useState(false)
  const [email, setEmail]         = useState("")
  const [perms, setPerms]         = useState<WorkspaceMember["permissions"]>(DEFAULT_PERMS)
  const [isPending, startTransition] = useTransition()

  function handleInvite() {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Introduce un email válido"); return
    }
    startTransition(async () => {
      try {
        // Asegura que existe el workspace
        if (!workspace) {
          const ws = await getOrCreateWorkspace()
          setWorkspace(ws)
        }
        const member = await inviteTeamMember(email.trim().toLowerCase(), perms)
        setMembers(prev => [...prev, member])
        setEmail("")
        setPerms(DEFAULT_PERMS)
        setShowForm(false)
        toast.success("Invitación enviada")
      } catch (e: any) {
        toast.error(e.message)
      }
    })
  }

  function handleRemove(id: string) {
    setMembers(prev => prev.filter(m => m.id !== id))
    startTransition(async () => { await removeTeamMember(id) })
    toast.success("Miembro eliminado")
  }

  function handleUpdatePerms(id: string, newPerms: WorkspaceMember["permissions"]) {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, permissions: newPerms } : m))
  }

  return (
    <div>
      <MobileHeader title="Equipo" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#2D5C44] flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: "var(--brand,#4E8B6B)" }} /> Mi equipo
            </h1>
            <p className="text-sm text-[#6B8C7A] mt-0.5">
              {members.length} miembro{members.length !== 1 ? "s" : ""} en el workspace
            </p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 md:px-4 text-sm font-semibold text-white rounded-xl transition-colors shadow-sm"
            style={{ background: "var(--brand,#4E8B6B)" }}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Invitar persona</span>
            <span className="sm:hidden">Invitar</span>
          </button>
        </div>

        {/* Aviso privacidad */}
        <div className="flex items-start gap-3 p-4 rounded-2xl border mb-5"
          style={{ background: "var(--brand-light,#E8F2EC)", borderColor: "var(--brand-border,#C8DFD2)" }}>
          <Shield className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "var(--brand,#4E8B6B)" }} />
          <div>
            <p className="text-sm font-semibold text-[#2D5C44]">Datos completamente aislados</p>
            <p className="text-xs text-[#6B8C7A] mt-0.5">
              Cada persona solo ve sus propios datos. Ningún compañero puede ver ni acceder a la información de otro.
              Tú controlas qué módulos puede ver cada uno.
            </p>
          </div>
        </div>

        {/* Tú (dueño) */}
        <Card className="p-4 border-[#C8DFD2] bg-white mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: "var(--brand,#4E8B6B)" }}>
              {profile.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#2D5C44] flex items-center gap-1.5">
                {profile.name}
                <Crown className="h-3.5 w-3.5 text-amber-500" />
              </p>
              <p className="text-xs text-[#6B8C7A]">{profile.email}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
              style={{ background: "var(--brand-light,#E8F2EC)", color: "var(--brand,#4E8B6B)", borderColor: "var(--brand-border,#C8DFD2)" }}>
              Propietario
            </span>
          </div>
        </Card>

        {/* Miembros */}
        {members.length === 0 ? (
          <Card className="p-10 text-center border-dashed border-[#C8DFD2]">
            <Users className="h-10 w-10 text-[#C8DFD2] mx-auto mb-3" />
            <p className="font-semibold text-[#2D5C44] mb-1">Sin miembros aún</p>
            <p className="text-sm text-[#6B8C7A] mb-4">Invita a tu equipo y controla qué puede ver cada persona.</p>
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors"
              style={{ background: "var(--brand,#4E8B6B)" }}>
              <Plus className="h-4 w-4" /> Invitar persona
            </button>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {members.map(m => (
              <MemberCard key={m.id} member={m}
                onUpdatePerms={handleUpdatePerms}
                onRemove={handleRemove} />
            ))}
          </div>
        )}

        {/* Modal invitar */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#C8DFD2] sticky top-0 bg-white rounded-t-3xl">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" style={{ color: "var(--brand,#4E8B6B)" }} />
                  <h2 className="font-bold text-[#2D5C44]">Invitar persona al equipo</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="text-[#6B8C7A]"><X className="h-5 w-5" /></button>
              </div>

              <div className="px-5 py-4 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-[#4A6355] mb-1.5 block">Email *</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" autoFocus
                    className="w-full px-3 py-3 text-sm border border-[#C8DFD2] rounded-xl focus:outline-none"
                    style={{ "--tw-ring-color": "var(--brand,#4E8B6B)" } as any}
                    placeholder="compañero@empresa.com" />
                  <p className="text-xs text-[#6B8C7A] mt-1">
                    Si aún no tiene cuenta, podrá registrarse y entrará automáticamente al workspace.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#4A6355] mb-3 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" /> ¿Qué puede ver esta persona?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(MODULE_LABELS) as (keyof WorkspaceMember["permissions"])[]).map(key => (
                      <PermToggle key={key} label={MODULE_LABELS[key]}
                        enabled={perms[key]}
                        onChange={v => setPerms(p => ({ ...p, [key]: v }))} />
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-[#F2F7F4] rounded-xl">
                  <Shield className="h-4 w-4 text-[#6B8C7A] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#6B8C7A]">
                    Los módulos desactivados no aparecerán en el menú de esa persona.
                    Sus datos estarán siempre separados de los tuyos.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 px-5 py-4 border-t border-[#C8DFD2] bg-[#F2F7F4] rounded-b-2xl">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-3 text-sm font-medium border border-[#C8DFD2] rounded-xl bg-white text-[#4A6355] transition-colors hover:bg-[#E8F2EC]">
                  Cancelar
                </button>
                <button onClick={handleInvite} disabled={!email.trim() || isPending}
                  className="flex-1 py-3 text-sm font-semibold text-white rounded-xl disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                  style={{ background: "var(--brand,#4E8B6B)" }}>
                  {isPending ? "Enviando..." : <><Check className="h-4 w-4" /> Invitar</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
