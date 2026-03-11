'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, GraduationCap, BookOpen, TrendingUp } from 'lucide-react'
import { ESCUELA_CONFIG } from '@/lib/config'
import { useLanguage } from '@/context/LanguageContext'

interface Perfil {
  id: string
  matricula: string
  meses_desbloqueados: number
  plan_nombre: string
  duracion_meses: number
  nombre_completo: string
  email: string
}

interface MateriaResumen {
  id: string
  codigo: string
  nombre: string
  nombre_en: string
  color_hex: string
}

interface Mes {
  id: string
  numero: number
  titulo: string
  desbloqueado: boolean
  materias: MateriaResumen[]
}

export default function AlumnoDashboard() {
  const router = useRouter()
  const { lang, t } = useLanguage()
  const loc = (es: string, en: string) => lang === 'en' && en ? en : es
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [meses, setMeses] = useState<Mes[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/alumno/perfil').then(r => r.json()),
      fetch('/api/alumno/meses').then(r => r.json()),
    ]).then(([p, m]) => {
      setPerfil(p)
      setMeses(Array.isArray(m) ? m : [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5B6CFF' }} />
    </div>
  )

  if (!perfil) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-sm" style={{ color: '#EF4444' }}>Error al cargar el perfil</p>
    </div>
  )

  const porcentaje = perfil.duracion_meses > 0
    ? Math.round((perfil.meses_desbloqueados / perfil.duracion_meses) * 100)
    : 0

  const materiasDisponibles = meses.filter(m => m.desbloqueado).reduce((t, m) => t + (m.materias?.length ?? 0), 0)

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Card institucional de bienvenida */}
      <div
        className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1E2A5E 0%, #181C26 60%, #0D1017 100%)',
          border: '1px solid rgba(91,108,255,0.3)',
        }}
      >
        {/* Decoración de fondo */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(91,108,255,0.08) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(123,138,255,0.05) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
        />

        <div className="relative flex flex-col gap-4">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl flex-shrink-0"
            style={{ background: 'rgba(91,108,255,0.2)', border: '1px solid rgba(91,108,255,0.4)' }}
          >
            <GraduationCap className="w-7 h-7" style={{ color: '#7B8AFF' }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#5B6CFF' }}>
              {ESCUELA_CONFIG.nombre}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold leading-snug" style={{ color: '#F1F5F9' }}>
              {t('dashboard.welcomeStudent')} {perfil.nombre_completo.split(' ')[0]}
            </h2>
            <p className="text-xs font-mono mt-1" style={{ color: '#64748B' }}>{perfil.matricula}</p>
            <p className="text-sm mt-2 italic" style={{ color: '#94A3B8' }}>
              {t('dashboard.motivational')}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(91,108,255,0.15)' }}>
                  <GraduationCap className="w-4 h-4" style={{ color: '#7B8AFF' }} />
                </div>
                <div>
                  <p className="text-xs leading-none" style={{ color: '#64748B' }}>{t('dashboard.currentPlan')}</p>
                  <p className="text-xs font-semibold mt-0.5 truncate max-w-[120px]" style={{ color: '#F1F5F9' }}>
                    {perfil.plan_nombre}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <TrendingUp className="w-4 h-4" style={{ color: '#10B981' }} />
                </div>
                <div>
                  <p className="text-xs leading-none" style={{ color: '#64748B' }}>{t('dashboard.monthsCompleted')}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: '#F1F5F9' }}>
                    {perfil.meses_desbloqueados} / {perfil.duracion_meses}
                    <span className="font-normal ml-1" style={{ color: '#64748B' }}>({porcentaje}%)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.15)' }}>
                  <BookOpen className="w-4 h-4" style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <p className="text-xs leading-none" style={{ color: '#64748B' }}>{t('dashboard.availableSubjects')}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: '#F1F5F9' }}>
                    {materiasDisponibles}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Porcentaje circular */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-14 h-14 flex-shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
                  stroke="#5B6CFF" strokeWidth="2.5"
                  strokeDasharray={`${porcentaje * 0.974} 97.4`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-bold" style={{ color: '#7B8AFF' }}>{porcentaje}%</span>
            </div>
            <p className="text-xs" style={{ color: '#64748B' }}>{t('dashboard.totalProgress')}</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="relative mt-5">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${porcentaje}%`, background: 'linear-gradient(90deg, #5B6CFF, #7B8AFF)' }}
            />
          </div>
        </div>
      </div>

      {/* Grid de meses */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#94A3B8' }}>
          {t('dashboard.programMonths')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {meses.map((mes) => (
            <div
              key={mes.id}
              onClick={() => mes.desbloqueado && router.push(`/alumno/mes/${mes.numero}`)}
              className="rounded-xl p-4 transition-all duration-200"
              style={{
                background: '#181C26',
                border: mes.desbloqueado ? '1px solid rgba(91,108,255,0.4)' : '1px solid #2A2F3E',
                borderLeft: mes.desbloqueado ? '3px solid #5B6CFF' : '3px solid #2A2F3E',
                opacity: mes.desbloqueado ? 1 : 0.5,
                cursor: mes.desbloqueado ? 'pointer' : 'default',
              }}
              onMouseEnter={e => {
                if (mes.desbloqueado) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(91,108,255,0.08)'
                }
              }}
              onMouseLeave={e => {
                if (mes.desbloqueado) {
                  (e.currentTarget as HTMLElement).style.background = '#181C26'
                }
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-3xl font-bold" style={{ color: mes.desbloqueado ? '#5B6CFF' : '#475569' }}>
                    {mes.numero}
                  </span>
                  <p className="text-xs font-medium mt-0.5" style={{ color: mes.desbloqueado ? '#F1F5F9' : '#94A3B8' }}>
                    {mes.titulo || `Mes ${mes.numero}`}
                  </p>
                </div>
                {!mes.desbloqueado && (
                  <Lock className="w-4 h-4 mt-1" style={{ color: '#475569' }} />
                )}
              </div>

              <div className="space-y-1">
                {(mes.materias ?? []).slice(0, 2).map(mat => (
                  <div key={mat.id} className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: mes.desbloqueado ? (mat.color_hex || '#5B6CFF') : '#475569' }}
                    />
                    <p className="text-xs truncate" style={{ color: '#94A3B8' }}>
                      <span className="font-mono">{mat.codigo}</span> — {loc(mat.nombre, mat.nombre_en)}
                    </p>
                  </div>
                ))}
                {(mes.materias ?? []).length > 2 && (
                  <p className="text-xs" style={{ color: '#475569' }}>
                    +{mes.materias.length - 2} {t('dashboard.moreSubjects')}
                  </p>
                )}
              </div>

              {!mes.desbloqueado && (
                <p className="text-xs mt-3 font-medium" style={{ color: '#475569' }}>{t('dashboard.blocked')}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
