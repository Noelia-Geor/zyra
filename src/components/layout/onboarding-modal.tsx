"use client"

import { useState, useTransition, useEffect } from "react"
import { CheckCircle, User, Users, CheckSquare, ArrowRight, Sparkles, X } from "lucide-react"
import { saveProfile } from "@/app/actions/profile"
import { toast } from "sonner"

const STEPS = [
  {
    id: "perfil",
    icon: <User className="h-6 w-6" />,
    title: "¿Cómo te llamas?",
    subtitle: "Tu nombre aparecerá en tus facturas y presupuestos.",
  },
  {
    id: "contacto",
    icon: <Users className="h-6 w-6" />,
    title: "Añade tu primer contacto",
    subtitle: "Un cliente, colaborador o proveedor. Puedes importar más después.",
  },
  {
    id: "tarea",
    icon: <CheckSquare className="h-6 w-6" />,
    title: "¿Qué tienes pendiente hoy?",
    subtitle: "Escribe tu primera tarea. Pequeños pasos, grandes resultados.",
  },
]

export default function OnboardingModal({ userName }: { userName: string }) {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [isPending, start] = useTransition()

  // Formulario perfil
  const [name, setName] = useState(userName ?? "")
  const [apellidos, setApellidos] = useState("")

  // Formulario contacto
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")

  // Formulario tarea
  const [taskTitle, setTaskTitle] = useState("")

  useEffect(() => {
    // Solo mostrar si no se ha completado antes
    const done = localStorage.getItem("zyra_onboarding_done")
    if (!done) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem("zyra_onboarding_done", "1")
    setVisible(false)
  }

  async function handleStep() {
    if (step === 0) {
      if (!name.trim()) { toast.error("Escribe tu nombre"); return }
      start(async () => {
        try {
          await saveProfile({ name, apellidos: apellidos || name })
          setStep(1)
        } catch { setStep(1) } // continuar aunque falle
      })
    } else if (step === 1) {
      if (!contactName.trim()) { setStep(2); return }
      start(async () => {
        try {
          const { createContact } = await import("@/app/actions/contacts")
          await createContact({ name: contactName, email: contactEmail || undefined, type: "cliente", status: "activo" })
        } catch {}
        setStep(2)
      })
    } else if (step === 2) {
      start(async () => {
        try {
          if (taskTitle.trim()) {
            const { createTask } = await import("@/app/actions/tasks")
            await createTask({ title: taskTitle, priority: "media", status: "pendiente" })
          }
        } catch {}
        setCompleted(true)
      })
    }
  }

  function finish() {
    localStorage.setItem("zyra_onboarding_done", "1")
    setVisible(false)
    window.location.reload()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header con progreso */}
        <div className="bg-[#EAF5EF] px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-[#A8CEBA] flex items-center justify-center">
                <span className="text-white text-sm font-bold">Z</span>
              </div>
              <span className="font-bold text-[#2D5C44]">Bienvenida a ZYRA</span>
            </div>
            <button onClick={dismiss} className="text-[#6B8C7A] hover:text-[#2D5C44] p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          {!completed && (
            <div className="flex gap-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-[#A8CEBA]' : 'bg-[#CAE8D8]'}`} />
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          {completed ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-full bg-[#EAF5EF] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-[#A8CEBA]" />
              </div>
              <h2 className="text-xl font-bold text-[#2D5C44] mb-2">¡Todo listo, {name}! ✨</h2>
              <p className="text-sm text-[#6B8C7A] mb-6 leading-relaxed">
                ZYRA está preparada para ti. Explora los módulos, personaliza tu espacio y empieza a gestionar tu negocio con calma.
              </p>
              <button onClick={finish}
                className="w-full py-3.5 bg-[#A8CEBA] text-white rounded-xl font-semibold hover:bg-[#90BBAA] transition-colors">
                Empezar a usar ZYRA
              </button>
            </div>
          ) : (
            <>
              {/* Icono del paso */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-[#EAF5EF] flex items-center justify-center text-[#A8CEBA] shrink-0">
                  {STEPS[step].icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#2D5C44]">{STEPS[step].title}</h2>
                  <p className="text-xs text-[#6B8C7A]">{STEPS[step].subtitle}</p>
                </div>
              </div>

              {/* Contenido del paso */}
              {step === 0 && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#4A6355] mb-1 block">Nombre *</label>
                    <input value={name} onChange={e => setName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full px-3 py-3 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A6355] mb-1 block">Apellidos</label>
                    <input value={apellidos} onChange={e => setApellidos(e.target.value)}
                      placeholder="Tus apellidos"
                      className="w-full px-3 py-3 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]" />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#4A6355] mb-1 block">Nombre del contacto</label>
                    <input value={contactName} onChange={e => setContactName(e.target.value)}
                      placeholder="Nombre o empresa"
                      className="w-full px-3 py-3 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A6355] mb-1 block">Email (opcional)</label>
                    <input value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                      type="email" placeholder="email@empresa.com"
                      className="w-full px-3 py-3 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <label className="text-xs font-semibold text-[#4A6355] mb-1 block">¿Qué tienes pendiente?</label>
                  <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)}
                    placeholder="Ej: Enviar propuesta a cliente X"
                    className="w-full px-3 py-3 text-sm border border-[#CAE8D8] rounded-xl focus:outline-none focus:border-[#A8CEBA]" />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => step === 1 || step === 2 ? setStep(s => s - 1) : dismiss()}
                  className="px-4 py-3 text-sm text-[#6B8C7A] border border-[#CAE8D8] rounded-xl hover:bg-[#F4FAF7] transition-colors">
                  {step === 0 ? "Omitir" : "Atrás"}
                </button>
                <button onClick={handleStep} disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#A8CEBA] text-white rounded-xl font-semibold hover:bg-[#90BBAA] disabled:opacity-50 transition-colors">
                  {step < STEPS.length - 1 ? (
                    <>{isPending ? "Guardando..." : "Siguiente"} <ArrowRight className="h-4 w-4" /></>
                  ) : (
                    <>{isPending ? "Guardando..." : "¡Empezar!"} <CheckCircle className="h-4 w-4" /></>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-[#6B8C7A] mt-3">Paso {step + 1} de {STEPS.length}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
