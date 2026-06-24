"use client"

import Link from "next/link";
import { ArrowRight, BarChart3, Users, CheckSquare, Heart, Zap, Shield, Sparkles, ChevronDown, ChevronUp, FileText, Clock, Calculator, TrendingUp } from "lucide-react";
import { useState } from "react";

const features = [
  { icon: Users,       title: "CRM + Pipeline",     desc: "Contactos, leads y clientes. Kanban de ventas para ver dónde está cada oportunidad." },
  { icon: BarChart3,   title: "Finanzas claras",     desc: "Ingresos, gastos y márgenes. Foto exacta de tu negocio cada mes sin hojas de cálculo." },
  { icon: FileText,    title: "Facturación",         desc: "Facturas profesionales, presupuestos y portal cliente. Cobros recurrentes automáticos." },
  { icon: Calculator,  title: "Fiscal integrada",    desc: "Modelo 303 y 130 calculados desde tus facturas. Prepara tu declaración en minutos." },
  { icon: CheckSquare, title: "Tareas y proyectos",  desc: "Vista lista o kanban. Convierte horas fichadas en líneas de factura con un clic." },
  { icon: Heart,       title: "Bienestar integrado", desc: "Registra tu energía y ánimo. Tu negocio va mejor cuando tú estás bien." },
  { icon: Zap,         title: "IA que te conoce",    desc: "Analiza tus datos reales y te da insights accionables. Sin respuestas genéricas." },
  { icon: TrendingUp,  title: "Informes de rentab.", desc: "Clientes más rentables, categorías de gasto, evolución de ingresos. Todo visible." },
  { icon: Clock,       title: "Fichaje de horas",    desc: "Registra el tiempo por proyecto y convierte horas en facturas automáticamente." },
  { icon: Shield,      title: "Datos seguros",       desc: "Cada usuario ve solo sus datos. Cifrado, backups automáticos y RGPD compliant." },
];

const faq = [
  { q: "¿Puedo cancelar cuando quiera?", a: "Sí. No hay permanencia mínima. Cancelas desde Configuración y tu acceso continúa hasta el final del periodo pagado." },
  { q: "¿Mis datos son seguros?", a: "Totalmente. Usamos Supabase con cifrado en tránsito y en reposo, servidores en la UE y cumplimos el RGPD. Tus datos son tuyos." },
  { q: "¿Funciona en móvil?", a: "Sí. ZYRA está optimizada para móvil. Registra gastos con foto, fichaje de horas y acceso a todos los módulos desde el teléfono." },
  { q: "¿Qué pasa con el plan Free?", a: "El plan gratuito incluye 10 contactos, 5 facturas y 10 consultas de IA al mes. Sin tarjeta de crédito. Actualiza cuando lo necesites." },
  { q: "¿ZYRA sustituye a mi gestor?", a: "ZYRA calcula tus impuestos estimados para que vayas preparada, pero no sustituye a un asesor fiscal. La asesoría legal sigue siendo necesaria." },
  { q: "¿Puedo importar mis datos?", a: "Puedes exportar todos tus datos en CSV. El import manual desde Excel o Holded está en el roadmap para Q3 2026." },
];

const plans = [
  {
    name: "Free", monthlyPrice: 0, annualPrice: 0, period: "", desc: "Para empezar sin compromiso",
    features: ["10 contactos", "5 facturas/mes", "Tareas básicas", "10 consultas IA/mes", "Finanzas básicas"],
    cta: "Empezar gratis", href: "/sign-up", highlight: false,
  },
  {
    name: "Pro", monthlyPrice: 19, annualPrice: 15, period: "/mes", desc: "Para profesionales en serio",
    features: ["Contactos ilimitados", "Facturas ilimitadas", "200 consultas IA/mes", "Pipeline CRM + Kanban", "Portal cliente", "Fiscal (Mod. 303/130)", "Informes de rentabilidad", "Exportar datos"],
    cta: "Empezar Pro", href: "/sign-up", highlight: true,
  },
  {
    name: "Business", monthlyPrice: 39, annualPrice: 31, period: "/mes", desc: "Para equipos pequeños",
    features: ["Todo de Pro", "Hasta 5 usuarios", "1.000 consultas IA/mes", "Automatizaciones", "Gastos con OCR foto", "Soporte prioritario"],
    cta: "Empezar Business", href: "/sign-up", highlight: false,
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#C8DFD2] rounded-2xl bg-white overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="text-sm font-semibold text-[#2D5C44]">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 text-[#6B8C7A] shrink-0" /> : <ChevronDown className="h-4 w-4 text-[#6B8C7A] shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-[#6B8C7A] leading-relaxed border-t border-[#E8F2EC] pt-3">
          {a}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-[#F2F7F4]">
      {/* Nav */}
      <nav className="bg-white border-b border-[#C8DFD2] sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[#4E8B6B] flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="text-lg font-bold text-[#2D5C44] tracking-tight">ZYRA</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-[#4A6355]">
            <a href="#features" className="hover:text-[#2D5C44] transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-[#2D5C44] transition-colors">Precios</a>
            <a href="#faq" className="hover:text-[#2D5C44] transition-colors">FAQ</a>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/sign-in" className="px-4 py-2 text-sm font-medium text-[#4A6355] hover:text-[#2D5C44] transition-colors">
              Entrar
            </Link>
            <Link href="/sign-up" className="px-4 py-2 text-sm font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-colors">
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-[#C8DFD2] rounded-full px-4 py-1.5 text-sm text-[#4E8B6B] font-medium mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          Workspace todo-en-uno para freelancers
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#2D5C44] mb-6 leading-tight">
          Factura, gestiona y crece.<br />
          <span className="text-[#4E8B6B]">Sin caos.</span>
        </h1>
        <p className="text-lg md:text-xl text-[#6B8C7A] mb-10 max-w-2xl mx-auto leading-relaxed">
          CRM, facturación, fiscal, tareas y bienestar en un solo lugar. Para freelancers, consultores y profesionales independientes que quieren más control y menos herramientas.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/sign-up" className="inline-flex items-center px-8 py-3.5 text-base font-semibold bg-[#4E8B6B] text-white rounded-xl hover:bg-[#3D7059] transition-all shadow-sm hover:shadow-md">
            Empezar gratis <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/sign-in" className="inline-flex items-center px-8 py-3.5 text-base font-medium bg-white border border-[#C8DFD2] text-[#4A6355] rounded-xl hover:bg-[#E8F2EC] transition-colors">
            Ya tengo cuenta
          </Link>
        </div>
        <p className="text-sm text-[#6B8C7A] mt-5">Sin tarjeta de crédito · Cancela cuando quieras · RGPD compliant</p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-14 flex-wrap">
          {[
            { num: "14", label: "módulos integrados" },
            { num: "IA", label: "con tus datos reales" },
            { num: "0€", label: "para empezar" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-[#2D5C44]">{s.num}</div>
              <div className="text-xs text-[#6B8C7A] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-[#2D5C44] mb-3">Todo lo que necesitas</h2>
        <p className="text-center text-[#6B8C7A] mb-12">Sin aprender 10 herramientas distintas. Sin exportar a Excel.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {features.map((f) => (
            <div key={f.title} className="p-5 rounded-2xl bg-white border border-[#C8DFD2] hover:shadow-md transition-all group">
              <div className="p-2 bg-[#E8F2EC] rounded-xl w-fit mb-3 group-hover:bg-[#4E8B6B] transition-colors">
                <f.icon className="h-4 w-4 text-[#4E8B6B] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-[#2D5C44] mb-1 text-sm">{f.title}</h3>
              <p className="text-xs text-[#6B8C7A] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* vs competidores */}
      <section className="bg-white border-y border-[#C8DFD2] py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-[#2D5C44] mb-2">¿Por qué ZYRA y no Holded?</h2>
          <p className="text-center text-sm text-[#6B8C7A] mb-10">La misma potencia, sin la complejidad ni el precio.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 text-[#6B8C7A] font-medium">Funcionalidad</th>
                  <th className="text-center py-3 px-4 font-bold text-[#4E8B6B]">ZYRA Pro</th>
                  <th className="text-center py-3 px-4 text-[#6B8C7A]">Holded</th>
                  <th className="text-center py-3 px-4 text-[#6B8C7A]">Notion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8F2EC]">
                {[
                  ["CRM de contactos",      "✓", "✓", "✓"],
                  ["Facturación legal",      "✓", "✓", "✗"],
                  ["Fiscal (303/130)",       "✓", "✓", "✗"],
                  ["IA integrada",           "✓", "✗", "✗"],
                  ["Bienestar / energía",    "✓", "✗", "✗"],
                  ["Portal cliente",         "✓", "✗", "✗"],
                  ["Precio mensual",         "19€", "49€+", "10€"],
                ].map(([feat, zyra, holded, notion]) => (
                  <tr key={feat} className="hover:bg-[#F7FCFA]">
                    <td className="py-3 px-4 text-[#2D5C44]">{feat}</td>
                    <td className="py-3 px-4 text-center font-semibold text-[#4E8B6B]">{zyra}</td>
                    <td className="py-3 px-4 text-center text-[#6B8C7A]">{holded}</td>
                    <td className="py-3 px-4 text-center text-[#6B8C7A]">{notion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#2D5C44] mb-3">Precios simples</h2>
          <p className="text-center text-[#6B8C7A] mb-8">Sin sorpresas. Cambia de plan cuando quieras.</p>

          {/* Toggle mensual/anual */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-sm font-medium ${!annual ? "text-[#2D5C44]" : "text-[#6B8C7A]"}`}>Mensual</span>
            <button
              onClick={() => setAnnual(a => !a)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-[#4E8B6B]" : "bg-[#C8DFD2]"}`}>
              <span className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full shadow transition-transform ${annual ? "translate-x-6" : ""}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-[#2D5C44]" : "text-[#6B8C7A]"}`}>
              Anual <span className="text-[#4E8B6B] font-semibold text-xs ml-1">-20%</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const price = annual && p.annualPrice > 0 ? p.annualPrice : p.monthlyPrice
              return (
                <div key={p.name} className={`p-6 rounded-2xl border-2 relative ${p.highlight ? "border-[#4E8B6B] bg-[#4E8B6B]" : "border-[#C8DFD2] bg-white"}`}>
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#4E8B6B] text-xs font-bold px-3 py-1 rounded-full border border-[#4E8B6B]">
                      Más popular
                    </div>
                  )}
                  <div className={`text-sm font-semibold mb-1 ${p.highlight ? "text-[#A8D4BC]" : "text-[#6B8C7A]"}`}>{p.name}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-4xl font-bold ${p.highlight ? "text-white" : "text-[#2D5C44]"}`}>{price === 0 ? "0€" : `${price}€`}</span>
                    {p.period && <span className={p.highlight ? "text-[#A8D4BC]" : "text-[#6B8C7A]"}>{p.period}</span>}
                  </div>
                  {annual && p.annualPrice > 0 && (
                    <p className={`text-xs mb-1 ${p.highlight ? "text-[#A8D4BC]" : "text-[#4E8B6B]"}`}>
                      Facturado {p.annualPrice * 12}€/año
                    </p>
                  )}
                  <p className={`text-sm mb-6 ${p.highlight ? "text-[#A8D4BC]" : "text-[#6B8C7A]"}`}>{p.desc}</p>
                  <ul className="space-y-2.5 mb-8">
                    {p.features.map((feat) => (
                      <li key={feat} className={`text-sm flex items-center gap-2 ${p.highlight ? "text-white" : "text-[#4A6355]"}`}>
                        <span className={`text-lg leading-none ${p.highlight ? "text-[#A8D4BC]" : "text-[#4E8B6B]"}`}>✓</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link href={p.href} className={`block w-full text-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${p.highlight ? "bg-white text-[#4E8B6B] hover:bg-[#E8F2EC]" : "bg-[#4E8B6B] text-white hover:bg-[#3D7059]"}`}>
                    {p.cta}
                  </Link>
                </div>
              )
            })}
          </div>
          <p className="text-center text-xs text-[#6B8C7A] mt-6">Pago seguro con Stripe · Cancela cuando quieras · Sin permanencia</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white border-y border-[#C8DFD2] py-20">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#2D5C44] mb-3">Preguntas frecuentes</h2>
          <p className="text-center text-[#6B8C7A] mb-10">Todo lo que necesitas saber antes de empezar.</p>
          <div className="space-y-3">
            {faq.map(item => <FaqItem key={item.q} q={item.q} a={item.a} />)}
          </div>
          <p className="text-center text-sm text-[#6B8C7A] mt-8">
            ¿Más preguntas? Escríbenos a <a href="mailto:hola@zyra.app" className="text-[#4E8B6B] hover:underline">hola@zyra.app</a>
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#4E8B6B] py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Empieza hoy, gratis</h2>
          <p className="text-[#A8D4BC] mb-8">Sin tarjeta. Sin complicaciones. Tu negocio organizado en minutos.</p>
          <Link href="/sign-up" className="inline-flex items-center px-8 py-3.5 text-base font-semibold bg-white text-[#4E8B6B] rounded-xl hover:bg-[#E8F2EC] transition-colors">
            Crear mi cuenta gratis <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#C8DFD2] py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-[#4E8B6B] flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">Z</span>
              </div>
              <span className="text-sm font-bold text-[#2D5C44]">ZYRA</span>
            </div>
            <div className="flex gap-6 text-xs text-[#6B8C7A]">
              <Link href="/privacidad" className="hover:text-[#4E8B6B] transition-colors">Política de privacidad</Link>
              <Link href="/terminos" className="hover:text-[#4E8B6B] transition-colors">Términos de uso</Link>
              <Link href="/cookies" className="hover:text-[#4E8B6B] transition-colors">Cookies</Link>
              <Link href="mailto:hola@zyra.app" className="hover:text-[#4E8B6B] transition-colors">hola@zyra.app</Link>
            </div>
          </div>
          <div className="border-t border-[#E8F2EC] pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-[#6B8C7A]">
            <p>© 2026 ZYRA by GeorLabs · Las Palmas de Gran Canaria, España</p>
            <p>Hecho con ♥ para freelancers que merecen mejores herramientas</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
