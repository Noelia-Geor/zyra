import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Política de Cookies — ZYRA" }

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#F2F7F4]">
      <nav className="bg-white border-b border-[#C8DFD2] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-[#6B8C7A] hover:text-[#2D5C44] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-[#4E8B6B] flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">Z</span>
            </div>
            <span className="text-sm font-bold text-[#2D5C44]">ZYRA</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#2D5C44] mb-2">Política de Cookies</h1>
        <p className="text-sm text-[#6B8C7A] mb-10">Última actualización: junio de 2026</p>

        <div className="space-y-8 text-[#4A6355]">

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">¿Qué son las cookies?</h2>
            <p className="text-sm leading-relaxed">Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten que el sitio recuerde tus preferencias y mantenga tu sesión activa.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">Cookies que usamos</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#E8F2EC]">
                    <th className="text-left p-3 text-[#2D5C44] font-semibold rounded-tl-lg">Nombre</th>
                    <th className="text-left p-3 text-[#2D5C44] font-semibold">Tipo</th>
                    <th className="text-left p-3 text-[#2D5C44] font-semibold rounded-tr-lg">Propósito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8F2EC]">
                  <tr className="bg-white">
                    <td className="p-3 font-mono text-xs">__clerk_db_jwt</td>
                    <td className="p-3"><span className="bg-[#E8F2EC] text-[#4E8B6B] text-xs px-2 py-0.5 rounded-full font-medium">Necesaria</span></td>
                    <td className="p-3">Sesión de autenticación (Clerk)</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-3 font-mono text-xs">zyra_theme</td>
                    <td className="p-3"><span className="bg-[#E8F2EC] text-[#4E8B6B] text-xs px-2 py-0.5 rounded-full font-medium">Necesaria</span></td>
                    <td className="p-3">Preferencia de tema de color</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-3 font-mono text-xs">__stripe_mid</td>
                    <td className="p-3"><span className="bg-[#E8F2EC] text-[#4E8B6B] text-xs px-2 py-0.5 rounded-full font-medium">Necesaria</span></td>
                    <td className="p-3">Seguridad en el proceso de pago (Stripe)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">Cookies de terceros</h2>
            <p className="text-sm leading-relaxed">ZYRA no usa cookies de publicidad ni de seguimiento. Los servicios de terceros integrados (Clerk, Stripe) pueden instalar sus propias cookies necesarias para su funcionamiento. Consulta sus políticas para más detalle.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">¿Puedo desactivar las cookies?</h2>
            <p className="text-sm leading-relaxed">Puedes configurar tu navegador para rechazar cookies, pero ten en cuenta que las cookies necesarias son imprescindibles para el funcionamiento de ZYRA — sin ellas no podrás iniciar sesión ni usar la aplicación.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">Contacto</h2>
            <p className="text-sm leading-relaxed">Para cualquier consulta sobre cookies: <a href="mailto:hola@zyra.app" className="text-[#4E8B6B] hover:underline">hola@zyra.app</a></p>
          </section>

        </div>
      </main>

      <footer className="bg-white border-t border-[#C8DFD2] py-6 px-6 mt-12">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 text-xs text-[#6B8C7A] justify-center">
          <Link href="/privacidad" className="hover:text-[#4E8B6B]">Privacidad</Link>
          <Link href="/terminos" className="hover:text-[#4E8B6B]">Términos</Link>
          <Link href="/cookies" className="hover:text-[#4E8B6B]">Cookies</Link>
          <Link href="mailto:hola@zyra.app" className="hover:text-[#4E8B6B]">hola@zyra.app</Link>
        </div>
      </footer>
    </div>
  )
}
