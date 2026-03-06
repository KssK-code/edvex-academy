'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { Footer } from './footer'
import type { UserRole } from '@/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: UserRole
  userName: string
  pageTitle: string
  showFooter?: boolean
}

export function DashboardLayout({
  children,
  role,
  userName,
  pageTitle,
  showFooter = false,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
          pageTitle={pageTitle}
          userName={userName}
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
