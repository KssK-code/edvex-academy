'use client'

import { useLanguage } from '@/context/LanguageContext'

/**
 * Toggle ES / EN reutilizable.
 * Mismo estilo que el toggle de la landing page.
 */
export function LangToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div
      style={{
        display:      'flex',
        background:   'rgba(255,255,255,.06)',
        borderRadius: 20,
        padding:      3,
        border:       '1px solid rgba(26,217,255,.12)',
        flexShrink:   0,
      }}
      role="group"
      aria-label="Seleccionar idioma"
    >
      {(['es', 'en'] as const).map((l) => {
        const active = lang === l
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className="touch-manipulation active:opacity-90"
            style={{
              minHeight:    44,
              minWidth:     44,
              padding:      '0 14px',
              borderRadius: 16,
              fontSize:     '.75rem',
              fontWeight:   700,
              letterSpacing:'1px',
              border:       'none',
              cursor:       'pointer',
              transition:   'all .2s',
              background:   active
                ? 'linear-gradient(130deg, #1ad9ff 0%, #0055ff 100%)'
                : 'transparent',
              color:   active ? '#fff' : '#8a9bbf',
            }}
            aria-pressed={active}
          >
            {l.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
