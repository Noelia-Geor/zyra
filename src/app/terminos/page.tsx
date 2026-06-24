import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Términos de Uso — ZYRA" }

export default function TerminosPage() {
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
        <h1 className="text-3xl font-bold text-[#2D5C44] mb-2">Términos de Uso</h1>
        <p className="text-sm text-[#6B8C7A] mb-10">Última actualización: junio de 2026</p>

        <div className="space-y-8 text-[#4A6355]">

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">1. Aceptación</h2>
            <p className="text-sm leading-relaxed">Al crear una cuenta en ZYRA, aceptas estos Términos de Uso y nuestra <Link href="/privacidad" className="text-[#4E8B6B] hover:underline">Política de Privacidad</Link>. Si no estás de acuerdo, no uses el servicio.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">2. El servicio</h2>
            <p className="text-sm leading-relaxed">ZYRA es una plataforma de gestión profesional para freelancers y profesionales independientes. GeorLabs se reserva el derecho de modificar, suspender o interrumpir el servicio con previo aviso.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">3. Cuenta de usuario</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed">
              <li>Eres responsable de mantener la seguridad de tus credenciales.</li>
              <li>Debes tener al menos 18 años para usar ZYRA.</li>
              <li>Una cuenta es para uso personal. El plan Business permite hasta 5 usuarios.</li>
              <li>Prohibido usar la cuenta para actividades ilegales o que dañen a terceros.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">4. Planes y pagos</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed">
              <li>Los planes de pago se facturan mensualmente por adelantado vía Stripe.</li>
              <li>Puedes cancelar en cualquier momento; el acceso continúa hasta el fin del periodo pagado.</li>
              <li>No se realizan reembolsos por periodos parciales salvo error de facturación.</li>
              <li>GeorLabs puede cambiar los precios con 30 días de preaviso.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">5. Propiedad intelectual</h2>
            <p className="text-sm leading-relaxed">El software, diseño y marca ZYRA son propiedad de GeorLabs. Los datos que introduces son tuyos; ZYRA los procesa para prestarte el servicio.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">6. Limitación de responsabilidad</h2>
            <p className="text-sm leading-relaxed">ZYRA se proporciona "tal cual". GeorLabs no garantiza disponibilidad ininterrumpida ni se responsabiliza de pérdidas derivadas del uso del servicio más allá de lo exigible por ley. El módulo fiscal es orientativo y no sustituye asesoramiento profesional.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">7. Cancelación y eliminación de cuenta</h2>
            <p className="text-sm leading-relaxed">Puedes eliminar tu cuenta en cualquier momento desde Configuración. GeorLabs puede suspender cuentas que incumplan estos términos.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">8. Ley aplicable</h2>
            <p className="text-sm leading-relaxed">Estos términos se rigen por la legislación española. Cualquier disputa se someterá a los tribunales competentes de Las Palmas de Gran Canaria, salvo que la normativa de consumo prevea otro fuero.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">9. Contacto</h2>
            <p className="text-sm leading-relaxed">Para cualquier consulta: <a href="mailto:hola@zyra.app" className="text-[#4E8B6B] hover:underline">hola@zyra.app</a></p>
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
