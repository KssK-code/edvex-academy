'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { Footer } from './footer'
import { useLanguage } from '@/context/LanguageContext'
import type { TKey } from '@/lib/translations'
import type { UserRole } from '@/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: UserRole
  userName: string
  avatarUrl?: string | null
  pageTitle: string
  showFooter?: boolean
}

export function DashboardLayout({
  children,
  role,
  userName,
  avatarUrl,
  pageTitle,
  showFooter = false,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { t } = useLanguage()

  // pageTitle puede ser una clave de traducción ('header.adminPortal') o un string literal
  const translatedTitle = pageTitle.includes('.')
    ? t(pageTitle as TKey)
    : pageTitle

  return (
    <div className="flex min-h-screen" style={{ background: '#0B0D11' }}>
      <Sidebar
        role={role}
        userName={userName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 md:ml-[260px]">
        <Header
          pageTitle={translatedTitle}
          userName={userName}
          avatarUrl={avatarUrl}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
        {showFooter && <Footer />}
      </div>
    </div>
  )
}
