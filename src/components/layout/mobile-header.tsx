"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { useT } from "@/i18n/context";

export function MobileHeader({ title }: { title?: string }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { t, locale, setLocale } = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const name = user?.firstName || "Usuario";
  const initials = (user?.fullName || name).split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white border-b border-[#C8DFD2] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-[#4E8B6B] flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">Z</span>
        </div>
        <span className="font-bold text-[#2D5C44] text-sm">{title || "ZYRA"}</span>
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="h-8 w-8 rounded-full bg-[#4E8B6B] text-white text-xs font-semibold flex items-center justify-center"
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-14 right-4 z-50 bg-white rounded-2xl shadow-xl border border-[#C8DFD2] p-2 min-w-44">
            <div className="px-3 py-2 mb-1">
              <p className="text-xs font-semibold text-[#2D5C44]">{name}</p>
              <p className="text-[10px] text-[#6B8C7A] truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
            </div>
            <div className="h-px bg-[#C8DFD2] my-1" />
            {/* Language */}
            <div className="flex items-center gap-1 px-3 py-2">
              <span className="text-xs text-[#6B8C7A] flex-1">{t.settings.language}</span>
              <button onClick={() => setLocale("es")} className={`text-xs px-2 py-0.5 rounded-lg font-medium ${locale === "es" ? "bg-[#4E8B6B] text-white" : "text-[#6B8C7A]"}`}>ES</button>
              <button onClick={() => setLocale("en")} className={`text-xs px-2 py-0.5 rounded-lg font-medium ${locale === "en" ? "bg-[#4E8B6B] text-white" : "text-[#6B8C7A]"}`}>EN</button>
            </div>
            <div className="h-px bg-[#C8DFD2] my-1" />
            <Link href="/configuracion" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#4A6355] hover:bg-[#E8F2EC] transition-colors">
              <Settings className="h-4 w-4" /> {t.nav.settings}
            </Link>
            <button onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-50 transition-colors">
              <LogOut className="h-4 w-4" /> {t.nav.signOut}
            </button>
          </div>
        </>
      )}
    </header>
  );
}
