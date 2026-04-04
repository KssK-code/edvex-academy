'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2, User, Phone, Eye, EyeOff, Clock, Zap } from 'lucide-react'
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

interface PlanOption {
  id: string
  nombre: string
  duracion_meses: number
  precio_mensual: number
}

export default function RegisterPage() {
  const router = useRouter()
  const { t, lang } = useLanguage()
  const isEn = lang === 'en'

  const [nombreCompleto, setNombreCompleto] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [planes, setPlanes] = useState<PlanOption[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Cargar planes activos
  useEffect(() => {
    fetch('/api/alumno/planes')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPlanes(data)
          // Pre-seleccionar el plan de 6 meses (Estándar)
          const estandar = data.find((p: PlanOption) => p.duracion_meses === 6)
          if (estandar) setSelectedPlan(estandar.id)
          else setSelectedPlan(data[0].id)
        }
      })
      .catch(() => { /* silencioso — el selector mostrará vacío */ })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validar formato de email
    const emailTrimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError(t('register.errInvalidEmail'))
      return
    }

    // Validar contraseña: mínimo 8 chars, al menos una letra y un número
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError(t('register.errShortPassword'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('register.errPasswordMismatch'))
      return
    }

    // Validar plan seleccionado
    if (!selectedPlan) {
      setError(isEn ? 'Please select a study plan' : 'Selecciona un plan de estudios')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      // 1. Crear cuenta en Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: emailTrimmed,
        password,
        options: { data: { nombre_completo: nombreCompleto.trim(), telefono: telefono.trim() || null } },
      })

      if (signUpError) {
        if (signUpError.message.includes('already') || signUpError.message.includes('registered')) {
          setError(t('register.errEmailExists'))
        } else {
          setError(signUpError.message)
        }
        setLoading(false)
        return
      }

      if (!signUpData.user) {
        setError(t('register.errRegister'))
        setLoading(false)
        return
      }

      // 2. En iOS Safari, signUp puede retornar user sin session si las cookies
      //    aún no se establecieron. Esperar a que la sesión esté lista.
      if (!signUpData.session) {
        // Reintentar getSession hasta 3 veces con delay para que las cookies se propaguen
        let sessionReady = false
        for (let i = 0; i < 3; i++) {
          await new Promise(r => setTimeout(r, 500))
          const { data: { session } } = await supabase.auth.getSession()
          if (session) { sessionReady = true; break }
        }
        if (!sessionReady) {
          setError(isEn
            ? 'Account created but session could not start. Please log in manually.'
            : 'Cuenta creada pero la sesión no pudo iniciarse. Por favor inicia sesión manualmente.')
          setLoading(false)
          return
        }
      }

      // 3. Crear perfil en la BD con el plan seleccionado
      let registerRes: Response
      try {
        registerRes = await fetch('/api/auth/register-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre_completo: nombreCompleto.trim(),
            telefono: telefono.trim() || null,
            plan_estudio_id: selectedPlan,
          }),
        })
      } catch {
        // Fetch puede fallar por problemas de red en móvil
        setError(isEn ? 'Network error. Please try again.' : 'Error de red. Intenta de nuevo.')
        setLoading(false)
        return
      }

      // 4. Parsear respuesta de forma segura
      let registerData: { error?: string } = {}
      try {
        registerData = await registerRes.json()
      } catch {
        // Si no es JSON (ej. error 500 HTML), ignorar el body
      }

      if (!registerRes.ok && registerRes.status !== 409) {
        setError(registerData.error || t('register.errRegister'))
        setLoading(false)
        return
      }

      // 5. Éxito — redirigir al dashboard
      router.push('/alumno')
    } catch (err) {
      console.error('[Register] Error inesperado:', err)
      setError(t('register.errRegister'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md px-3 sm:px-4 flex flex-col items-center gap-6">
      <div
        className="w-full rounded-2xl p-5 sm:p-8 shadow-2xl"
        style={{ background: '#181C26', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex justify-end mb-4">
          <LangToggle />
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="mb-3">
            <EdvexLogo size={48} innerFill="#181C26" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-center" style={{ color: '#F1F5F9' }}>
            {APP_NAME}
          </h1>
          <p className="text-sm font-medium mt-1 text-center" style={{ color: '#1ad9ff' }}>
            {ESCUELA_CONFIG.nombre}
          </p>
          <div className="w-10 h-px mt-3" style={{ background: 'rgba(0,85,255,0.4)' }} />
          <p className="text-sm mt-3" style={{ color: '#94A3B8' }}>
            {t('register.title')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-1">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
              />
            </div>
          </div>

          {/* Teléfono */}
          <div className="space-y-1">
            <label htmlFor="telefono" className="block text-sm font-medium" style={{ color: '#94A3B8' }}>
              {t('register.phone')} <span style={{ color: '#475569' }}>{t('register.phoneOptional')}</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94A3B8' }} />
              <input
                id="telefono"
                type="tel"
                autoComplete="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder={t('register.phonePlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
              />
            </div>
          </div>

          {/* Plan de estudios */}
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>
              {isEn ? 'Study plan' : 'Plan de estudios'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {planes.map(plan => {
                const is6 = plan.duracion_meses === 6
                const selected = selectedPlan === plan.id
                const Icon = is6 ? Clock : Zap
                const accent = is6 ? '#3B82F6' : '#F59E0B'
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className="rounded-xl p-3 text-left transition-all"
                    style={{
                      background: selected ? `${accent}15` : 'rgba(255,255,255,0.02)',
                      border: selected ? `2px solid ${accent}` : '2px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
                      <span className="text-xs font-bold" style={{ color: selected ? '#F1F5F9' : '#94A3B8' }}>
                        {is6
                          ? (isEn ? 'Standard' : 'Estándar')
                          : 'Express'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold" style={{ color: selected ? '#F1F5F9' : '#64748B' }}>
                      {plan.duracion_meses} {isEn ? 'months' : 'meses'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
                      ${is6 ? '150' : '300'} USD/{isEn ? 'mo' : 'mes'}
                    </p>
                  </button>
                )
              })}
            </div>
            {planes.length === 0 && (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#475569' }} />
              </div>
            )}
          </div>

          {/* Contraseña */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#94A3B8' }}>
              {t('register.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94A3B8' }} />
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('register.passwordPlaceholder')}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5" style={{ color: '#64748B' }}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: '#94A3B8' }}>
              {t('register.confirmPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94A3B8' }} />
              <input
                id="confirmPassword"
                type={showConfirmPw ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('register.confirmPlaceholder')}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
              />
              <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5" style={{ color: '#64748B' }}>
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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
            disabled={loading || planes.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
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

        <div className="mt-5 space-y-1.5 text-center">
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
          onMouseLeave={(e) => { e.currentTarget.style.color = '#0055ff' }}
        >
          {ESCUELA_CONFIG.contactoEmail}
        </a>
      </div>
    </div>
  )
}
