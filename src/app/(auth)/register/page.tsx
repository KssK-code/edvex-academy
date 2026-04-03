'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME } from '@/lib/constants'
import { ESCUELA_CONFIG } from '@/lib/config'
import { EdvexLogo } from '@/components/ui/edvex-logo'
import { LangToggle } from '@/components/ui/lang-toggle'
import { useLanguage } from '@/context/LanguageContext'

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#F1F5F9',
}
const focusStyle = {
  border: '1px solid rgba(0,85,255,0.6)',
  boxShadow: '0 0 0 3px rgba(0,85,255,0.1)',
}
const blurStyle = {
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: 'none',
}

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useLanguage()

  const [nombreCompleto, setNombreCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError(t('register.errShortPassword'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('register.errPasswordMismatch'))
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { nombre_completo: nombreCompleto.trim() } },
      })

      if (signUpError) {
        if (signUpError.message.includes('already') || signUpError.message.includes('registered')) {
          setError(t('register.errEmailExists'))
        } else {
          setError(signUpError.message)
        }
        return
      }

      // Sin sesión = verificación de email activa → mostrar mensaje de éxito
      if (!signUpData.session) {
        setEmailSent(true)
        return
      }

      const res = await fetch('/api/auth/register-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_completo: nombreCompleto.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t('register.errRegister'))
        return
      }

      router.push('/alumno')
    } catch {
      setError(t('register.errRegister'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md px-3 sm:px-4 flex flex-col items-center gap-6">
      <div
        className="w-full rounded-2xl p-6 sm:p-8 shadow-2xl"
        style={{ background: '#181C26', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex justify-end mb-4">
          <LangToggle />
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <EdvexLogo size={56} innerFill="#181C26" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-center" style={{ color: '#F1F5F9' }}>
            {APP_NAME}
          </h1>
          <p className="text-sm font-medium mt-1 text-center" style={{ color: '#1ad9ff' }}>
            {ESCUELA_CONFIG.nombre}
          </p>
          <p className="text-xs mt-1.5 text-center italic" style={{ color: '#64748B' }}>
            {t('register.subtitle')}
          </p>
          <div className="w-10 h-px mt-4" style={{ background: 'rgba(0,85,255,0.4)' }} />
          <p className="text-sm mt-4" style={{ color: '#94A3B8' }}>
            {t('register.title')}
          </p>
        </div>

        {emailSent ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              ✉️
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-bold" style={{ color: '#10B981' }}>
                {t('register.emailConfirmTitle')}
              </p>
              <p className="text-sm" style={{ color: '#94A3B8', lineHeight: 1.6 }}>
                {t('register.emailConfirmDesc')}
              </p>
            </div>
            <Link
              href="/login"
              className="mt-2 text-sm font-medium transition-colors"
              style={{ color: '#0055ff' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#1ad9ff' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#0055ff' }}
            >
              {t('register.signInLink')} →
            </Link>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="nombre" className="block text-sm font-medium" style={{ color: '#94A3B8' }}>
              {t('register.fullName')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94A3B8' }} />
              <input
                id="nombre"
                type="text"
                required
                autoComplete="name"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                placeholder={t('register.fullNamePlaceholder')}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#94A3B8' }}>
              {t('register.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94A3B8' }} />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('register.emailPlaceholder')}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#94A3B8' }}>
              {t('register.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94A3B8' }} />
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('register.passwordPlaceholder')}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: '#94A3B8' }}>
              {t('register.confirmPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94A3B8' }} />
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('register.confirmPlaceholder')}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
              />
            </div>
          </div>

          {error && (
            <div
              className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#FCA5A5',
              }}
            >
              <span className="mt-px">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: '#0055ff', color: '#ffffff' }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#1ad9ff' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#0055ff' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('register.submitting')}
              </>
            ) : (
              t('register.submit')
            )}
          </button>

          <div className="text-center pt-1">
            <span className="text-sm" style={{ color: '#94A3B8' }}>{t('register.haveAccount')} </span>
            <Link
              href="/login"
              className="text-sm font-medium transition-colors"
              style={{ color: '#0055ff' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#1ad9ff' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#0055ff' }}
            >
              {t('register.signInLink')}
            </Link>
          </div>
        </form>
        )}

        <div className="mt-6 space-y-2 text-center">
          <p className="text-xs" style={{ color: '#475569' }}>
            {t('auth.contactAdmin')}
          </p>
          <p className="text-xs" style={{ color: '#374151' }}>
            {t('auth.platformDesc')}
          </p>
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs" style={{ color: '#374151' }}>
          © 2026 {ESCUELA_CONFIG.nombre}. Todos los derechos reservados.
        </p>
        <a
          href={`mailto:${ESCUELA_CONFIG.contactoEmail}`}
          className="text-xs transition-colors"
          style={{ color: '#475569' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#1ad9ff' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#475569' }}
        >
          {ESCUELA_CONFIG.contactoEmail}
        </a>
      </div>
    </div>
  )
}
