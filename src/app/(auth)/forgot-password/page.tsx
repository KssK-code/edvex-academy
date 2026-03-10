'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ESCUELA_CONFIG } from '@/lib/config'
import { EdvexLogo } from '@/components/ui/edvex-logo'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      })
      if (err) {
        setError('Ocurrió un error. Intenta de nuevo.')
        return
      }
      setSent(true)
    } catch {
      setError('Ocurrió un error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md px-4 flex flex-col items-center gap-6">
      <div
        className="w-full rounded-2xl p-8 shadow-2xl"
        style={{ background: '#181C26', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <EdvexLogo size={56} innerFill="#181C26" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-center" style={{ color: '#F1F5F9' }}>
            Recuperar contraseña
          </h1>
          <p className="text-sm font-medium mt-1 text-center" style={{ color: '#1ad9ff' }}>
            {ESCUELA_CONFIG.nombre}
          </p>
          <p className="text-xs mt-3 text-center" style={{ color: '#64748B' }}>
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {sent ? (
          <div className="space-y-5">
            <div
              className="flex flex-col items-center gap-3 rounded-xl px-4 py-6 text-center"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: '#10B981' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#10B981' }}>¡Correo enviado!</p>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#94A3B8' }}>
                  Si el correo <strong style={{ color: '#F1F5F9' }}>{email}</strong> está registrado,
                  recibirás un enlace para restablecer tu contraseña.
                </p>
                <p className="text-xs mt-2" style={{ color: '#64748B' }}>
                  Revisa también tu carpeta de spam.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: '#0055ff', color: '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1ad9ff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0055ff' }}
            >
              Volver al login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94A3B8' }} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F1F5F9' }}
                  onFocus={e => {
                    e.currentTarget.style.border = '1px solid rgba(0,85,255,0.6)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,85,255,0.1)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {error && (
              <div
                className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}
              >
                <span className="mt-px">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: '#0055ff', color: '#fff' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1ad9ff' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0055ff' }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : 'Enviar enlace de recuperación'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm transition-colors"
              style={{ color: '#64748B' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#0055ff' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748B' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver al login
            </button>
          </form>
        )}
      </div>

      <p className="text-xs" style={{ color: '#374151' }}>
        © {new Date().getFullYear()} {ESCUELA_CONFIG.nombre}. Todos los derechos reservados.
      </p>
    </div>
  )
}
