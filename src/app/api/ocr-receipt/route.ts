import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import Anthropic from "@anthropic-ai/sdk"

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: "API key no configurada" }, { status: 500 })

  try {
    const { imageBase64, mediaType } = await req.json()

    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType ?? "image/jpeg", data: imageBase64 },
          },
          {
            type: "text",
            text: `Extrae los datos de este ticket/recibo. Responde SOLO con JSON válido:
{
  "amount": número (importe total sin IVA si aparece, o total),
  "description": "descripción del gasto en 3-5 palabras",
  "category": "una de: Software|Marketing|Material|Formación|Transporte|Oficina|Otro",
  "date": "YYYY-MM-DD o null si no aparece"
}
Si no puedes leer el importe, pon amount: null.`
          }
        ],
      }],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: "No se pudo extraer datos" }, { status: 422 })

    const extracted = JSON.parse(jsonMatch[0])
    return NextResponse.json(extracted)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
