"use client"

import { useEffect } from "react"
import { THEMES, getThemeCss } from "@/lib/themes"
import type { ThemeColor } from "@/types"

export function ThemeProvider({ color }: { color: ThemeColor | null }) {
  useEffect(() => {
    const theme = color ?? "green"
    applyTheme(theme)
    localStorage.setItem("zyra_theme", theme)
  }, [color])

  return null
}

export function applyTheme(theme: ThemeColor) {
  const t = THEMES[theme]

  const css = `
    :root {
      ${getThemeCss(theme)}
    }

    /* ── Botones primarios (todos los brand colors usados en código) ── */
    [class*="bg-\\[#4E8B6B\\]"],
    [class*="bg-\\[#7DB89A\\]"],
    [class*="bg-\\[#A8CEBA\\]"],
    [class*="bg-\\[#C0B8DC\\]"],
    [class*="bg-\\[#A8C8DC\\]"],
    [class*="bg-\\[#DCC0C8\\]"],
    [class*="bg-\\[#DEC8A8\\]"],
    [class*="bg-\\[#A8CECE\\]"],
    [class*="bg-\\[#DDD0BC\\]"],
    [class*="bg-\\[#BEC8D0\\]"],
    [class*="bg-\\[#7ABABA\\]"],
    [class*="bg-\\[#A99DC8\\]"],
    [class*="bg-\\[#7AAFC8\\]"],
    [class*="bg-\\[#C89AAA\\]"],
    [class*="bg-\\[#CDB48A\\]"],
    [class*="bg-\\[#C4A882\\]"],
    [class*="bg-\\[#9AABB8\\]"],
    [class*="bg-\\[#1A1D1B\\]"] {
      background-color: ${t.brand} !important;
    }

    /* ── Hover botones ── */
    [class*="hover\\:bg-\\[#3D7059\\]"]:hover,
    [class*="hover\\:bg-\\[#68A485\\]"]:hover,
    [class*="hover\\:bg-\\[#90BBAA\\]"]:hover,
    [class*="hover\\:bg-\\[#A8A0CC\\]"]:hover,
    [class*="hover\\:bg-\\[#90B4CC\\]"]:hover,
    [class*="hover\\:bg-\\[#C8AABA\\]"]:hover,
    [class*="hover\\:bg-\\[#CCB490\\]"]:hover,
    [class*="hover\\:bg-\\[#90BCBC\\]"]:hover,
    [class*="hover\\:bg-\\[#CCBCA8\\]"]:hover,
    [class*="hover\\:bg-\\[#A8B4BC\\]"]:hover,
    [class*="hover\\:bg-\\[#62A5A5\\]"]:hover,
    [class*="hover\\:bg-\\[#9589B8\\]"]:hover,
    [class*="hover\\:bg-\\[#649BB8\\]"]:hover,
    [class*="hover\\:bg-\\[#B88698\\]"]:hover,
    [class*="hover\\:bg-\\[#BCA075\\]"]:hover,
    [class*="hover\\:bg-\\[#B0956E\\]"]:hover,
    [class*="hover\\:bg-\\[#8298A8\\]"]:hover,
    [class*="hover\\:bg-\\[#2D2D2D\\]"]:hover {
      background-color: ${t.brandHover} !important;
    }

    /* ── Texto color brand → siempre legible (mezcla 55% brand + 45% negro) ── */
    [class*="text-\\[#4E8B6B\\]"],
    [class*="text-\\[#7DB89A\\]"],
    [class*="text-\\[#A8CEBA\\]"],
    [class*="text-\\[#C0B8DC\\]"],
    [class*="text-\\[#A8C8DC\\]"],
    [class*="text-\\[#DCC0C8\\]"],
    [class*="text-\\[#DEC8A8\\]"],
    [class*="text-\\[#A8CECE\\]"],
    [class*="text-\\[#DDD0BC\\]"],
    [class*="text-\\[#BEC8D0\\]"],
    [class*="text-\\[#7ABABA\\]"],
    [class*="text-\\[#A99DC8\\]"],
    [class*="text-\\[#7AAFC8\\]"],
    [class*="text-\\[#C89AAA\\]"],
    [class*="text-\\[#CDB48A\\]"],
    [class*="text-\\[#C4A882\\]"],
    [class*="text-\\[#9AABB8\\]"] {
      color: color-mix(in srgb, ${t.brand} 55%, #1a1a1a 45%) !important;
    }

    /* ── Bordes ── */
    [class*="border-\\[#C8DFD2\\]"],
    [class*="border-\\[#C2E0D0\\]"],
    [class*="border-\\[#CAE8D8\\]"],
    [class*="border-\\[#DCDAF0\\]"],
    [class*="border-\\[#C8DFEE\\]"],
    [class*="border-\\[#EEDCE2\\]"],
    [class*="border-\\[#EEE0C8\\]"],
    [class*="border-\\[#C8E4E4\\]"],
    [class*="border-\\[#EEE4D2\\]"],
    [class*="border-\\[#D4DCE4\\]"],
    [class*="border-\\[#B8DEDE\\]"],
    [class*="border-\\[#D5CCEA\\]"],
    [class*="border-\\[#BAD8EA\\]"],
    [class*="border-\\[#EAC8D5\\]"],
    [class*="border-\\[#EAD8B8\\]"],
    [class*="border-\\[#E8D8C0\\]"],
    [class*="border-\\[#C8D8E2\\]"] {
      border-color: ${t.brandBorder} !important;
    }

    /* ── Fondos claros ── */
    [class*="bg-\\[#E8F2EC\\]"],
    [class*="bg-\\[#E8F5EF\\]"],
    [class*="bg-\\[#EAF5EF\\]"],
    [class*="bg-\\[#F0EDF8\\]"],
    [class*="bg-\\[#E8F3F9\\]"],
    [class*="bg-\\[#FAEFF2\\]"],
    [class*="bg-\\[#FAF3E8\\]"],
    [class*="bg-\\[#E5F3F3\\]"],
    [class*="bg-\\[#FAF5EC\\]"],
    [class*="bg-\\[#EDF1F4\\]"],
    [class*="bg-\\[#E3F3F3\\]"],
    [class*="bg-\\[#EEE9F7\\]"],
    [class*="bg-\\[#E5F1F8\\]"],
    [class*="bg-\\[#FAEFF3\\]"],
    [class*="bg-\\[#FAF2E5\\]"],
    [class*="bg-\\[#F7F0E6\\]"],
    [class*="bg-\\[#EAF0F4\\]"] {
      background-color: ${t.brandLight} !important;
    }

    /* ── Fondos página / muy claros → siempre neutro ── */
    [class*="bg-\\[#F4FAF7\\]"],
    [class*="bg-\\[#F8F5FC\\]"],
    [class*="bg-\\[#F2F8FC\\]"],
    [class*="bg-\\[#FDF5F7\\]"],
    [class*="bg-\\[#FDF9F2\\]"],
    [class*="bg-\\[#F0F9F9\\]"],
    [class*="bg-\\[#FDF9F3\\]"],
    [class*="bg-\\[#F4F7F9\\]"],
    [class*="bg-\\[#F2F7F4\\]"],
    [class*="bg-\\[#F2FAF6\\]"],
    [class*="bg-\\[#EFF8F8\\]"],
    [class*="bg-\\[#F6F3FB\\]"],
    [class*="bg-\\[#F0F7FB\\]"],
    [class*="bg-\\[#FDF5F8\\]"],
    [class*="bg-\\[#FDF8F0\\]"],
    [class*="bg-\\[#FBF7F1\\]"],
    [class*="bg-\\[#F3F6F8\\]"] {
      background-color: #F7F8F9 !important;
    }

    /* ── Texto oscuro → siempre legible ── */
    [class*="text-\\[#2D5C44\\]"],
    [class*="text-\\[#3A6A54\\]"],
    [class*="text-\\[#4A6355\\]"] {
      color: #1A1D1B !important;
    }

    /* ── Texto medio → gris neutro ── */
    [class*="text-\\[#6B8C7A\\]"],
    [class*="text-\\[#8AAA98\\]"] {
      color: #6B7280 !important;
    }

    /* ── Ring / focus ── */
    [class*="focus\\:border-\\[#4E8B6B\\]"]:focus,
    [class*="focus\\:border-\\[#7DB89A\\]"]:focus,
    [class*="focus\\:border-\\[#A8CEBA\\]"]:focus {
      border-color: ${t.brand} !important;
    }
  `

  let el = document.getElementById("zyra-theme")
  if (!el) {
    el = document.createElement("style")
    el.id = "zyra-theme"
    document.head.appendChild(el)
  }
  el.textContent = css
}
