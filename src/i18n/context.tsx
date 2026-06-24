"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import es from "./es"
import en from "./en"
import type { Translations } from "./es"

type Locale = "es" | "en"

const translations: Record<Locale, Translations> = { es, en }

interface I18nContextValue {
  t: Translations
  locale: Locale
  setLocale: (l: Locale) => void
}

const I18nContext = createContext<I18nContextValue>({
  t: es,
  locale: "es",
  setLocale: () => {},
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es")

  useEffect(() => {
    const saved = localStorage.getItem("zyra-locale") as Locale | null
    if (saved === "es" || saved === "en") setLocaleState(saved)
  }, [])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem("zyra-locale", l)
  }

  return (
    <I18nContext.Provider value={{ t: translations[locale], locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useT() {
  return useContext(I18nContext)
}
