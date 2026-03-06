'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Award,
  FileText,
  LogOut,
  Settings,
  X,
  User,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ESCUELA_CONFIG } from '@/lib/config'
import type { UserRole } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Alumnos', href: '/admin/alumnos', icon: Users },
    { label: 'Contenido', href: '/admin/contenido', icon: BookOpen },
    { label: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
    { label: 'Configuración', href: '/admin/configuracion', icon: Settings },
  ],
  ALUMNO: [
    { label: 'Mi Progreso', href: '/alumno', icon: LayoutDashboard },
    { label: 'Mis Materias', href: '/alumno/materias', icon: BookOpen },
    { label: 'Calificaciones', href: '/alumno/calificaciones', icon: Award },
    { label: 'Constancia', href: '/alumno/constancia', icon: FileText },
    { label: 'Mi Perfil', href: '/alumno/perfil', icon: User },
  ],
}

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  ALUMNO: 'Alumno',
}

interface SidebarProps {
  role: UserRole
  userName: string
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ role, userName, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const navItems = NAV_ITEMS[role]

  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/alumno') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Overlay en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen flex flex-col transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: '260px',
          background: '#181C26',
          borderRight: '1px solid #2A2F3E',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: '1px solid #2A2F3E' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(91,108,255,0.15)', border: '1px solid rgba(91,108,255,0.3)' }}
            >
              <GraduationCap className="w-5 h-5" style={{ color: '#5B6CFF' }} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight" style={{ color: '#F1F5F9' }}>
                {ESCUELA_CONFIG.nombre}
              </p>
            </div>
          </div>
          {/* Botón cerrar en móvil */}
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg transition-colors"
            style={{ color: '#94A3B8' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  color: active ? '#F1F5F9' : '#94A3B8',
                  background: active ? 'rgba(91,108,255,0.2)' : 'transparent',
                  borderLeft: active ? '3px solid #5B6CFF' : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(91,108,255,0.08)'
                    e.currentTarget.style.color = '#F1F5F9'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#94A3B8'
                  }
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer usuario */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid #2A2F3E' }}>
          <div className="flex items-center gap-3 px-2 mb-3">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 text-xs font-bold"
              style={{ background: '#5B6CFF', color: '#fff' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#F1F5F9' }}>
                {userName}
              </p>
              <span
                className="text-xs px-1.5 py-0.5 rounded font-medium"
                style={{ background: 'rgba(91,108,255,0.2)', color: '#7B8AFF' }}
              >
                {ROLE_LABELS[role]}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ color: '#94A3B8' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
              e.currentTarget.style.color = '#FCA5A5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#94A3B8'
            }}
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
