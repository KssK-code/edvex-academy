'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { getT, type Lang, type TKey } from '@/lib/translations'

// ── TIPOS ──────────────────────────────────────────────────────────────────────
interface LanguageContextValue {
  lang:    Lang
  setLang: (lang: Lang) => void
  t:       (key: TKey) => string
}

// ── CONTEXTO ───────────────────────────────────────────────────────────────────
const LanguageContext = createContext<LanguageContextValue | null>(null)

// ── PROVIDER ───────────────────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es')

  // Cargar preferencia guardada (solo en el cliente)
  useEffect(() => {
    const saved = localStorage.getItem('edvex-lang')
    if (saved === 'es' || saved === 'en') {
      setLangState(saved)
    }
  }, [])

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('edvex-lang', newLang)
    // Sincronizar atributo lang del documento
    document.documentElement.lang = newLang
  }, [])

  const t = useCallback(
    (key: TKey) => getT(lang)(key),
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// ── HOOK ───────────────────────────────────────────────────────────────────────
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage() debe usarse dentro de <LanguageProvider>')
  }
  return ctx
}
