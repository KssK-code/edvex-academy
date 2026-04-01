'use client'

import { Menu } from 'lucide-react'
import { LangToggle } from '@/components/ui/lang-toggle'
import { useLanguage } from '@/context/LanguageContext'

interface HeaderProps {
  pageTitle: string
  userName:  string
  avatarUrl?: string | null
  onMenuToggle: () => void
}

export function Header({ pageTitle, userName, avatarUrl, onMenuToggle }: HeaderProps) {
  const { t } = useLanguage()

  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 h-14"
      style={{
        background:           'rgba(11,13,17,0.8)',
        backdropFilter:       'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom:         '1px solid #2A2F3E',
      }}
    >
      {/* Izquierda: hamburguesa + título */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg transition-colors flex-shrink-0"
          style={{ color: '#94A3B8' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.color      = '#F1F5F9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color      = '#94A3B8'
          }}
          aria-label={t('header.openMenu')}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1
          className="text-base font-semibold truncate"
          style={{ color: '#F1F5F9' }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* Derecha: toggle idioma + nombre + avatar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <LangToggle />
        <span className="hidden sm:block text-sm" style={{ color: '#94A3B8' }}>
          {userName}
        </span>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            style={{ border: '2px solid #2A2F3E' }}
          />
        ) : (
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0"
            style={{ background: '#0055ff', color: '#fff' }}
          >
            {initials}
          </div>
        )}
      </div>
    </header>
  )
}
