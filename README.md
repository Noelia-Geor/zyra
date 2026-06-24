# ZYRA — Workspace todo-en-uno para profesionales independientes

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-green?style=flat&logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-purple?style=flat&logo=stripe)
![Clerk](https://img.shields.io/badge/Clerk-orange?style=flat&logo=clerk)

SaaS para freelancers y profesionales independientes españoles.  
Gestiona clientes, facturas, finanzas y tareas desde un único lugar, con IA integrada y un módulo de bienestar que cruza tu estado personal con el rendimiento de tu negocio.

> 🚧 En desarrollo activo — construido con Claude Code + Next.js 15 App Router.

---

## 🎯 ¿Qué es ZYRA?

ZYRA nace de un problema real: los freelancers españoles usan 5-6 herramientas distintas para gestionar su negocio. Facturación en una, clientes en otra, finanzas en Excel, tareas en Notion, fichaje en papel.

ZYRA lo unifica todo en un workspace inteligente con IA integrada.

---

## 🧩 Módulos

| Módulo | Descripción |
|---|---|
| 📋 **Tareas** | Gestión de tareas y proyectos por cliente |
| 👥 **Contactos** | CRM ligero para clientes y proveedores |
| 🧾 **Facturación** | Facturas y presupuestos con exportación PDF |
| 💰 **Finanzas** | Control de ingresos, gastos y rentabilidad |
| 📅 **Calendario** | Vista unificada de eventos y deadlines |
| 🤝 **Reuniones** | Gestión de reuniones y seguimiento |
| 🏷️ **Presupuestos** | Generación y seguimiento de presupuestos |
| 🕐 **Fichaje** | Control de horas trabajadas por proyecto |
| 📊 **Informes** | Reporting automático de actividad y rentabilidad |
| 🌱 **Bienestar** | Módulo único que cruza estado personal con métricas de negocio |
| 🤖 **IA integrada** | Chat con IA + OCR de recibos con Claude Haiku |
| 🌍 **Fiscal** | Seguimiento de obligaciones fiscales (modelo español) |

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 App Router + TypeScript + Tailwind CSS |
| Auth | Clerk |
| Base de datos | Supabase (PostgreSQL) |
| Pagos | Stripe (suscripciones + webhooks) |
| IA | Claude Haiku (chat + OCR de recibos) |
| i18n | Español / Inglés |
| Deploy | Pendiente (Vercel) |

---

## 🏗️ Arquitectura

```
src/
├── app/
│   ├── (auth)/          # Sign in / Sign up (Clerk)
│   ├── (dashboard)/     # Módulos principales (14 rutas)
│   ├── admin/           # Panel de administración
│   ├── api/             # API routes
│   │   ├── ai/chat/     # Chat con Claude Haiku
│   │   ├── ocr-receipt/ # OCR de recibos con IA
│   │   ├── stripe/      # Checkout + webhooks
│   │   └── webhooks/    # Clerk webhooks
│   └── actions/         # Server Actions (14 módulos)
├── components/
│   ├── dashboard/       # Widgets del dashboard
│   ├── layout/          # Sidebar, header, navegación
│   └── ui/              # Componentes base (shadcn/ui)
├── lib/
│   └── supabase/        # Cliente, queries y esquema SQL
└── i18n/                # Traducciones ES/EN
```

---

## ⚙️ Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/Noelia-Geor/zyra.git
cd zyra

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales

# Ejecutar en desarrollo
npm run dev
```

---

## 🔑 Variables de entorno requeridas

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Anthropic (Claude)
ANTHROPIC_API_KEY=
```

---

## 📋 Estado del proyecto

- [x] Autenticación completa (Clerk)
- [x] Dashboard principal
- [x] Módulo de tareas
- [x] Módulo de contactos/CRM
- [x] Módulo de facturación
- [x] Módulo de finanzas
- [x] Módulo de presupuestos
- [x] Módulo de fichaje
- [x] Módulo de reuniones
- [x] Módulo de bienestar
- [x] Chat con IA (Claude Haiku)
- [x] OCR de recibos
- [x] Integración Stripe (suscripciones)
- [x] i18n ES/EN
- [ ] Deploy en producción
- [ ] Dominio propio
- [ ] Landing page pública

---

## 👤 Autora

**Noelia Soto** — AI Automation Specialist & Technical Founder  
[LinkedIn](https://linkedin.com/in/noeliasotovega) · [GeorLabs](https://georlabs.com) · [Email](mailto:sotoveganoelia@gmail.com)

---

## 📄 Licencia

MIT License
