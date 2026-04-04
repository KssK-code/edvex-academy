'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, GraduationCap, Zap, Clock, CheckCircle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface Plan {
  id: string
  nombre: string
  duracion_meses: number
  precio_mensual: number
}

const PLAN_META: Record<number, {
  icon: typeof Clock
  accent: string
  accentBg: string
  taglineEs: string
  taglineEn: string
  features_es: string[]
  features_en: string[]
}> = {
  6: {
    icon: Clock,
    accent: '#3B82F6',
    accentBg: 'rgba(59,130,246,0.12)',
    taglineEs: 'Ritmo cómodo, paso a paso',
    taglineEn: 'Comfortable pace, step by step',
    features_es: ['6 meses de contenido', 'Un módulo por mes', 'Ideal si trabajas o estudias'],
    features_en: ['6 months of content', 'One module per month', 'Ideal if you work or study'],
  },
  3: {
    icon: Zap,
    accent: '#F59E0B',
    accentBg: 'rgba(245,158,11,0.12)',
    taglineEs: 'Termina en la mitad del tiempo',
    taglineEn: 'Finish in half the time',
    features_es: ['3 meses de contenido', 'Dos módulos por mes', 'Para quienes quieren terminar rápido'],
    features_en: ['3 months of content', 'Two modules per month', 'For those who want to finish fast'],
  },
}

// Fallback for unknown durations
const DEFAULT_META = {
  icon: GraduationCap,
  accent: '#8B5CF6',
  accentBg: 'rgba(139,92,246,0.12)',
  taglineEs: 'Plan de estudios',
  taglineEn: 'Study plan',
  features_es: [],
  features_en: [],
}

export default function ElegirPlanPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const isEn = lang === 'en'

  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/alumno/planes')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setPlanes(Array.isArray(data) ? data : [])
      })
      .catch(() => setError(isEn ? 'Error loading plans' : 'Error al cargar los planes'))
      .finally(() => setLoading(false))
  }, [isEn])

  async function handleSelect(planId: string) {
    setSelecting(planId)
    setError(null)
    try {
      const res = await fetch('/api/alumno/seleccionar-plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_estudio_id: planId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? (isEn ? 'Error selecting plan' : 'Error al seleccionar el plan'))
        return
      }
      router.push('/alumno/pagar')
    } catch {
      setError(isEn ? 'Unexpected error' : 'Error inesperado')
    } finally {
      setSelecting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5B6CFF' }} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mx-auto"
          style={{ background: 'rgba(91,108,255,0.12)' }}
        >
          <GraduationCap className="w-7 h-7" style={{ color: '#7B8AFF' }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>
          {isEn ? 'Choose your plan' : 'Elige tu plan de estudios'}
        </h1>
        <p className="text-sm" style={{ color: '#94A3B8' }}>
          {isEn
            ? 'Select the plan that best fits your pace. You can start right away.'
            : 'Selecciona la modalidad que mejor se adapte a tu ritmo. Podrás iniciar de inmediato.'}
        </p>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm text-center"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}
        >
          {error}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {planes.map(plan => {
          const meta = PLAN_META[plan.duracion_meses] ?? DEFAULT_META
          const Icon = meta.icon
          const features = isEn ? meta.features_en : meta.features_es
          const tagline = isEn ? meta.taglineEn : meta.taglineEs
          const isSelecting = selecting === plan.id

          return (
            <div
              key={plan.id}
              className="rounded-2xl p-6 flex flex-col gap-5 transition-all"
              style={{
                background: '#181C26',
                border: selecting === plan.id ? `2px solid ${meta.accent}` : '2px solid #2A2F3E',
              }}
            >
              {/* Icon + badge */}
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center justify-center w-11 h-11 rounded-xl"
                  style={{ background: meta.accentBg }}
                >
                  <Icon className="w-5 h-5" style={{ color: meta.accent }} />
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: meta.accentBg, color: meta.accent }}
                >
                  {plan.duracion_meses} {isEn ? 'months' : 'meses'}
                </span>
              </div>

              {/* Name + tagline */}
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#F1F5F9' }}>
                  {plan.nombre}
                </h2>
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                  {tagline}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold" style={{ color: meta.accent }}>
                  ${plan.precio_mensual}
                </span>
                <span className="text-sm" style={{ color: '#64748B' }}>
                  USD / {isEn ? 'month' : 'mes'}
                </span>
              </div>

              {/* Features */}
              {features.length > 0 && (
                <ul className="space-y-2">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: '#CBD5E1' }}>
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: meta.accent }} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {/* Select button */}
              <button
                type="button"
                onClick={() => handleSelect(plan.id)}
                disabled={selecting !== null}
                className="mt-auto w-full flex items-center justify-center gap-2 min-h-[52px] rounded-xl text-base font-semibold touch-manipulation active:opacity-90 transition-all disabled:opacity-50"
                style={{ background: meta.accent, color: '#fff' }}
              >
                {isSelecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEn ? 'Selecting...' : 'Seleccionando...'}
                  </>
                ) : (
                  isEn ? `Choose ${plan.nombre}` : `Elegir ${plan.nombre}`
                )}
              </button>
            </div>
          )
        })}
      </div>

      {planes.length === 0 && !error && (
        <div className="text-center text-sm py-10" style={{ color: '#64748B' }}>
          {isEn ? 'No plans available at the moment.' : 'No hay planes disponibles en este momento.'}
        </div>
      )}
    </div>
  )
}
