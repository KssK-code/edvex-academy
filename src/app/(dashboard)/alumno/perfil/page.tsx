'use client'

import { useState, useEffect } from 'react'
import { Loader2, Eye, EyeOff, User, Lock, GraduationCap, Mail, Phone } from 'lucide-react'
import { ESCUELA_CONFIG } from '@/lib/config'
import { useToast, ToastContainer } from '@/components/ui/toast'

interface Perfil {
  id: string
  matricula: string
  meses_desbloqueados: number
  plan_nombre: string
  duracion_meses: number
  nombre_completo: string
  email: string
  created_at?: string
}

const CARD = { background: '#181C26', border: '1px solid #2A2F3E' }
const INPUT_STYLE = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#F1F5F9',
}

export default function PerfilPage() {
  const { toasts, showToast, removeToast } = useToast()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  // Password form
  const [passForm, setPassForm] = useState({ current: '', nueva: '', confirmar: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNueva, setShowNueva] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [passError, setPassError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/alumno/perfil')
      .then(r => r.json())
      .then(setPerfil)
      .finally(() => setLoading(false))
  }, [])

  async function handleCambiarPassword(e: React.FormEvent) {
    e.preventDefault()
    setPassError(null)

    if (passForm.nueva.length < 6) {
      setPassError('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (passForm.nueva !== passForm.confirmar) {
      setPassError('Las contraseñas nuevas no coinciden.')
      return
    }

    setPassLoading(true)
    try {
      const res = await fetch('/api/alumno/cambiar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.nueva }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPassError(data.error ?? 'Error al cambiar contraseña')
        return
      }
      setPassForm({ current: '', nueva: '', confirmar: '' })
      showToast('✓ Contraseña actualizada correctamente', 'success')
    } catch {
      setPassError('Error inesperado. Intenta de nuevo.')
    } finally {
      setPassLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5B6CFF' }} />
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#F1F5F9' }}>Mi Perfil</h2>
        <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>Tu información personal y configuración de cuenta</p>
      </div>

      {/* Card Información Personal */}
      <div className="rounded-xl overflow-hidden" style={CARD}>
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #2A2F3E' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(91,108,255,0.15)' }}>
            <User className="w-4 h-4" style={{ color: '#7B8AFF' }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Información Personal</h3>
        </div>
        <div className="p-5 space-y-4">
          {perfil ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Nombre completo', value: perfil.nombre_completo },
                { label: 'Correo electrónico', value: perfil.email },
                { label: 'Matrícula', value: perfil.matricula, mono: true },
                { label: 'Plan de estudio', value: perfil.plan_nombre },
                { label: 'Duración del plan', value: `${perfil.duracion_meses} meses` },
              ].map(({ label, value, mono }) => (
                <div key={label}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#64748B' }}>{label}</p>
                  <p
                    className={`text-sm px-3 py-2.5 rounded-lg ${mono ? 'font-mono' : ''}`}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2A2F3E', color: '#F1F5F9' }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#94A3B8' }}>No se pudo cargar el perfil.</p>
          )}
        </div>
      </div>

      {/* Card Cambiar Contraseña */}
      <div className="rounded-xl overflow-hidden" style={CARD}>
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #2A2F3E' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <Lock className="w-4 h-4" style={{ color: '#F59E0B' }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Cambiar Contraseña</h3>
        </div>
        <div className="p-5">
          <form onSubmit={handleCambiarPassword} className="space-y-4">
            {[
              { label: 'Contraseña actual', key: 'current', show: showCurrent, toggle: () => setShowCurrent(v => !v) },
              { label: 'Nueva contraseña', key: 'nueva', show: showNueva, toggle: () => setShowNueva(v => !v) },
              { label: 'Confirmar nueva contraseña', key: 'confirmar', show: showConfirmar, toggle: () => setShowConfirmar(v => !v) },
            ].map(({ label, key, show, toggle }) => (
              <div key={key} className="space-y-1.5">
                <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>{label}</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={passForm[key as keyof typeof passForm]}
                    onChange={e => setPassForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 pr-11 py-3 rounded-lg text-sm outline-none transition-all"
                    style={INPUT_STYLE}
                    onFocus={e => {
                      e.currentTarget.style.border = '1px solid rgba(91,108,255,0.6)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91,108,255,0.1)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                    style={{ color: '#64748B' }}
                  >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            {passError && (
              <div
                className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}
              >
                <span className="mt-px">⚠</span>
                <span>{passError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={passLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: '#5B6CFF', color: '#fff' }}
              onMouseEnter={e => { if (!passLoading) e.currentTarget.style.background = '#7B8AFF' }}
              onMouseLeave={e => { if (!passLoading) e.currentTarget.style.background = '#5B6CFF' }}
            >
              {passLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Cambiando...</> : 'Cambiar contraseña'}
            </button>
          </form>
        </div>
      </div>

      {/* Card Datos de la Escuela */}
      <div className="rounded-xl overflow-hidden" style={CARD}>
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #2A2F3E' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <GraduationCap className="w-4 h-4" style={{ color: '#10B981' }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Datos de la Escuela</h3>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
            <div>
              <p className="text-xs" style={{ color: '#64748B' }}>Institución</p>
              <p className="text-sm font-medium" style={{ color: '#F1F5F9' }}>{ESCUELA_CONFIG.nombre}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
            <div>
              <p className="text-xs" style={{ color: '#64748B' }}>Contacto</p>
              <a
                href={`mailto:${ESCUELA_CONFIG.contactoEmail}`}
                className="text-sm transition-colors"
                style={{ color: '#5B6CFF' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#7B8AFF' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#5B6CFF' }}
              >
                {ESCUELA_CONFIG.contactoEmail}
              </a>
            </div>
          </div>
          {ESCUELA_CONFIG.contactoTelefono && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
              <div>
                <p className="text-xs" style={{ color: '#64748B' }}>Teléfono</p>
                <a
                  href={`tel:${ESCUELA_CONFIG.contactoTelefono}`}
                  className="text-sm transition-colors"
                  style={{ color: '#5B6CFF' }}
                >
                  {ESCUELA_CONFIG.contactoTelefono}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
