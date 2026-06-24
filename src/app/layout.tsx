import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";
import { I18nProvider } from "@/i18n/context";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZYRA — Tu negocio, ordenado",
  description: "El workspace todo-en-uno para profesionales independientes. CRM, finanzas, tareas y bienestar en un solo lugar.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ZYRA",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-152.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4E8B6B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={esES}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <body className="min-h-full" suppressHydrationWarning>
          {/* Aplica el tema guardado antes del primer render para evitar flash */}
          <script dangerouslySetInnerHTML={{ __html: `
            (function(){
              try {
                var t = localStorage.getItem('zyra_theme') || 'green';
                var themes = {
                  green:    { brand:'#A8CEBA', hover:'#90BBAA', light:'#EAF5EF', lighter:'#F4FAF7', border:'#CAE8D8' },
                  lavender: { brand:'#C0B8DC', hover:'#A8A0CC', light:'#F0EDF8', lighter:'#F8F5FC', border:'#DCDAF0' },
                  blue:     { brand:'#A8C8DC', hover:'#90B4CC', light:'#E8F3F9', lighter:'#F2F8FC', border:'#C8DFEE' },
                  rose:     { brand:'#DCC0C8', hover:'#C8AABA', light:'#FAEFF2', lighter:'#FDF5F7', border:'#EEDCE2' },
                  amber:    { brand:'#DEC8A8', hover:'#CCB490', light:'#FAF3E8', lighter:'#FDF9F2', border:'#EEE0C8' },
                  teal:     { brand:'#A8CECE', hover:'#90BCBC', light:'#E5F3F3', lighter:'#F0F9F9', border:'#C8E4E4' },
                  beige:    { brand:'#DDD0BC', hover:'#CCBCA8', light:'#FAF5EC', lighter:'#FDF9F3', border:'#EEE4D2' },
                  gray:     { brand:'#BEC8D0', hover:'#A8B4BC', light:'#EDF1F4', lighter:'#F4F7F9', border:'#D4DCE4' },
                  mono:     { brand:'#1A1D1B', hover:'#2D2D2D', light:'#F2F2F2', lighter:'#F8F8F8', border:'#D4D4D4' },
                };
                var c = themes[t] || themes.green;
                var s = document.createElement('style');
                s.id = 'zyra-theme-init';
                s.textContent = ':root{--brand:'+c.brand+';--brand-hover:'+c.hover+';--brand-light:'+c.light+';--brand-lighter:'+c.lighter+';--brand-border:'+c.border+';--background:#F7F8F9;--border:#E8ECEA;--primary:'+c.brand+';}';
                document.head.appendChild(s);
              } catch(e){}
            })();
          ` }} />
          <I18nProvider>
            {children}
            <Toaster position="bottom-center" richColors closeButton />
          </I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
