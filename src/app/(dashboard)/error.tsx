"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
        <span className="text-red-500 text-xl">!</span>
      </div>
      <h2 className="text-xl font-bold text-[#2D5C44] mb-2">Algo salió mal</h2>
      <p className="text-sm text-[#6B8C7A] mb-6 max-w-sm">Se produjo un error al cargar esta página. Inténtalo de nuevo.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="px-5 py-2.5 bg-[#4E8B6B] text-white text-sm font-semibold rounded-xl hover:bg-[#3D7059] transition-colors">
          Reintentar
        </button>
        <Link href="/dashboard" className="px-5 py-2.5 border border-[#C8DFD2] text-[#4A6355] text-sm font-medium rounded-xl hover:bg-[#E8F2EC] transition-colors">
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
