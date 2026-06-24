import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Política de Privacidad — ZYRA" }

export default function PrivacidadPage() {
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
        <h1 className="text-3xl font-bold text-[#2D5C44] mb-2">Política de Privacidad</h1>
        <p className="text-sm text-[#6B8C7A] mb-10">Última actualización: junio de 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-[#4A6355]">

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">1. Responsable del tratamiento</h2>
            <p>GeorLabs, con correo de contacto <a href="mailto:hola@zyra.app" className="text-[#4E8B6B] hover:underline">hola@zyra.app</a>, es la entidad responsable del tratamiento de tus datos personales a través del servicio ZYRA.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">2. Datos que recopilamos</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed">
              <li><strong>Datos de cuenta:</strong> nombre, correo electrónico y contraseña (gestionados por Clerk).</li>
              <li><strong>Datos de uso:</strong> contactos, facturas, tareas y transacciones que introduces en la app.</li>
              <li><strong>Datos de pago:</strong> gestionados exclusivamente por Stripe. ZYRA no almacena datos de tarjeta.</li>
              <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador y páginas visitadas (logs de servidor).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">3. Finalidad del tratamiento</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed">
              <li>Prestación del servicio ZYRA y sus funcionalidades.</li>
              <li>Gestión de la suscripción y facturación.</li>
              <li>Mejora continua del producto.</li>
              <li>Comunicaciones relacionadas con el servicio (no marketing sin consentimiento).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">4. Base legal</h2>
            <p className="text-sm leading-relaxed">El tratamiento se realiza en base a la ejecución del contrato de servicio (art. 6.1.b RGPD) y al interés legítimo para la mejora del servicio (art. 6.1.f RGPD).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">5. Proveedores y transferencias</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed">
              <li><strong>Supabase</strong> — almacenamiento de datos (servidores en UE).</li>
              <li><strong>Clerk</strong> — autenticación de usuarios.</li>
              <li><strong>Stripe</strong> — procesamiento de pagos.</li>
              <li><strong>Anthropic</strong> — procesamiento de consultas de IA (solo el texto de tu consulta).</li>
            </ul>
            <p className="text-sm mt-2">Todos los proveedores cumplen con el RGPD y disponen de garantías adecuadas.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">6. Conservación de datos</h2>
            <p className="text-sm leading-relaxed">Tus datos se conservan mientras mantengas una cuenta activa. Al eliminar tu cuenta, se borran en un plazo máximo de 30 días, salvo obligación legal de conservación.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">7. Tus derechos</h2>
            <p className="text-sm leading-relaxed mb-2">Conforme al RGPD, tienes derecho a:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Acceso, rectificación y supresión de tus datos.</li>
              <li>Portabilidad de los datos.</li>
              <li>Limitación y oposición al tratamiento.</li>
              <li>Retirar el consentimiento en cualquier momento.</li>
            </ul>
            <p className="text-sm mt-2">Puedes ejercer estos derechos escribiendo a <a href="mailto:hola@zyra.app" className="text-[#4E8B6B] hover:underline">hola@zyra.app</a>. También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">8. Cookies</h2>
            <p className="text-sm leading-relaxed">ZYRA utiliza cookies técnicas necesarias para el funcionamiento del servicio (sesión, autenticación). No utilizamos cookies de seguimiento ni publicidad. Consulta nuestra <Link href="/cookies" className="text-[#4E8B6B] hover:underline">Política de Cookies</Link> para más detalle.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#2D5C44] mb-3">9. Cambios en esta política</h2>
            <p className="text-sm leading-relaxed">Notificaremos cambios significativos por correo electrónico con al menos 30 días de antelación.</p>
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
