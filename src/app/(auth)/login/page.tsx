'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ROLE_REDIRECTS, APP_NAME } from '@/lib/constants'
import { ESCUELA_CONFIG } from '@/lib/config'
import { EdvexLogo } from '@/components/ui/edvex-logo'
import { LangToggle } from '@/components/ui/lang-toggle'
import { useLanguage } from '@/context/LanguageContext'

export default function LoginPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { t }        = useLanguage()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  // Mostrar error proveniente de query param (ej: ?error=setup_failed desde /auth/confirm)
  useEffect(() => {
    const param = searchParams.get('error')
    if (param === 'setup_failed') {
      setError(t('auth.errSetupFailed'))
    }
  }, [searchParams, t])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        if (authError.message.toLowerCase().includes('email not confirmed')) {
          setError(t('auth.errEmailNotConfirmed'))
        } else {
          setError(t('auth.errInvalidCreds'))
        }
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError(t('auth.errNoUser'))
        return
      }

      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single()

      if (userError || !usuario) {
        setError(t('auth.errNoProfile'))
        return
      }

      const redirect = ROLE_REDIRECTS[usuario.rol] ?? '/login'
      router.push(redirect)
    } catch {
      setError(t('auth.errUnexpected'))
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
        {/* Toggle de idioma */}
        <div className="flex justify-end mb-4">
          <LangToggle />
        </div>

        {/* Header */}
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
            {t('auth.tagline')}
          </p>
          <div className="w-10 h-px mt-4" style={{ background: 'rgba(0,85,255,0.4)' }} />
          <p className="text-sm mt-4" style={{ color: '#94A3B8' }}>
            {t('auth.continueText')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#94A3B8' }}>
              {t('auth.email')}
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
                placeholder={t('auth.emailPlaceholder')}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border:     '1px solid rgba(255,255,255,0.1)',
                  color:      '#F1F5F9',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border     = '1px solid rgba(0,85,255,0.6)'
                  e.currentTarget.style.boxShadow  = '0 0 0 3px rgba(0,85,255,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border    = '1px solid rgba(255,255,255,0.1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#94A3B8' }}>
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94A3B8' }} />
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border:     '1px solid rgba(255,255,255,0.1)',
                  color:      '#F1F5F9',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border    = '1px solid rgba(0,85,255,0.6)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,85,255,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border    = '1px solid rgba(255,255,255,0.1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border:     '1px solid rgba(239,68,68,0.25)',
                color:      '#FCA5A5',
              }}
            >
              <span className="mt-px">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
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
                {t('auth.signingIn')}
              </>
            ) : (
              t('auth.signIn')
            )}
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => router.push('/forgot-password')}
              className="text-sm transition-colors"
              style={{ color: '#94A3B8' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0055ff' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8' }}
            >
              {t('auth.forgotPassword')}
            </button>
          </div>
        </form>

        {/* Footer del card */}
        <div className="mt-6 space-y-2 text-center">
          <p className="text-xs" style={{ color: '#475569' }}>
            {t('auth.contactAdmin')}
          </p>
          <p className="text-xs" style={{ color: '#374151' }}>
            {t('auth.platformDesc')}
          </p>
        </div>
      </div>

      {/* Copyright fuera del card */}
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
