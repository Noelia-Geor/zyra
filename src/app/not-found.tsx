import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F2F7F4] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="h-16 w-16 rounded-2xl bg-[#4E8B6B] flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-2xl">Z</span>
        </div>
        <h1 className="text-6xl font-bold text-[#2D5C44] mb-3">404</h1>
        <p className="text-lg text-[#6B8C7A] mb-8">Esta página no existe.</p>
        <Link href="/dashboard" className="inline-flex items-center px-6 py-3 bg-[#4E8B6B] text-white font-semibold rounded-xl hover:bg-[#3D7059] transition-colors">
          Volver al dashboard
        </Link>
      </div>
    </div>
  )
}
