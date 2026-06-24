"use server"

import { auth } from "@clerk/nextjs/server"
import { createImprovement } from "@/lib/supabase/queries"
import type { Improvement } from "@/types"

const categoryLabel: Record<Improvement["category"], string> = {
  procesos:      "Procesos internos",
  comunicacion:  "Comunicación",
  herramientas:  "Herramientas y recursos",
  ambiente:      "Ambiente de trabajo",
  formacion:     "Formación y desarrollo",
  otro:          "Otro",
}

const impactLabel: Record<Improvement["impact"], string> = {
  baja:  "Baja",
  media: "Media",
  alta:  "Alta",
}

export async function submitImprovement(data: Pick<Improvement, "category" | "area" | "description" | "impact">) {
  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")

  // Guarda SIN user_id — totalmente anónimo
  const { data: saved, error } = await createImprovement(data)
  if (error || !saved) throw new Error("Error al guardar la sugerencia")

  // Notifica a dirección por email (si está configurado Resend)
  const directionEmail = process.env.DIRECTION_EMAIL
  const resendKey      = process.env.RESEND_API_KEY
  const fromEmail      = process.env.RESEND_FROM_EMAIL ?? "noreply@zyra.app"

  if (directionEmail && resendKey && resendKey !== "re_REEMPLAZA") {
    const date = new Date(saved.created_at).toLocaleDateString("es-ES", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    })

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `ZYRA Mejora Continua <${fromEmail}>`,
        to: [directionEmail],
        subject: `💡 Nueva sugerencia de mejora — ${categoryLabel[data.category]}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#F2F7F4;border-radius:16px;">
            <div style="background:#4E8B6B;border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;">
              <h1 style="color:white;margin:0;font-size:20px;">💡 Nueva sugerencia de mejora</h1>
              <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">Recibida el ${date}</p>
            </div>

            <div style="background:white;border-radius:12px;padding:20px;margin-bottom:12px;border:1px solid #C8DFD2;">
              <table style="width:100%;font-size:14px;border-collapse:collapse;">
                <tr>
                  <td style="color:#6B8C7A;padding:6px 0;width:120px;">Categoría</td>
                  <td style="color:#2D5C44;font-weight:600;">${categoryLabel[data.category]}</td>
                </tr>
                <tr>
                  <td style="color:#6B8C7A;padding:6px 0;">Área</td>
                  <td style="color:#2D5C44;font-weight:600;">${data.area}</td>
                </tr>
                <tr>
                  <td style="color:#6B8C7A;padding:6px 0;">Impacto estimado</td>
                  <td style="color:#2D5C44;font-weight:600;">${impactLabel[data.impact]}</td>
                </tr>
              </table>
            </div>

            <div style="background:white;border-radius:12px;padding:20px;border:1px solid #C8DFD2;">
              <p style="color:#6B8C7A;font-size:12px;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Descripción de la mejora</p>
              <p style="color:#2D5C44;font-size:15px;line-height:1.6;margin:0;">${data.description}</p>
            </div>

            <p style="text-align:center;color:#6B8C7A;font-size:11px;margin-top:16px;">
              Esta sugerencia fue enviada de forma anónima a través de ZYRA.<br>
              No se almacena ningún dato personal del remitente.
            </p>
          </div>
        `,
      }),
    }).catch(() => {})
  }

  return saved
}
