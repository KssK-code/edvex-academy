'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Loader2, BookOpen, TrendingUp, ChevronRight, GraduationCap } from 'lucide-react'
import { useToast, ToastContainer } from '@/components/ui/toast'
import { useLanguage } from '@/context/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import BadgesGrid from '@/components/alumno/BadgesGrid'
import StreakTracker from '@/components/alumno/StreakTracker'

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
  const searchParams = useSearchParams()
  const { lang, t } = useLanguage()
  const { toasts, showToast, removeToast } = useToast()
  const loc = (es: string, en: string) => lang === 'en' && en ? en : es
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [meses, setMeses] = useState<Mes[]>([])
  const [materiasAcreditadas, setMateriasAcreditadas] = useState(0)
  const [logros, setLogros] = useState<Array<{ tipo: string; obtenido_en: string; metadata?: Record<string, unknown> }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const pago = searchParams.get('pago')
    if (pago === 'exitoso') {
      showToast(t('payment.successToast'), 'success')
      router.replace('/alumno', { scroll: false })
    } else if (pago === 'cancelado') {
      showToast(t('payment.cancelToast'), 'info')
      router.replace('/alumno', { scroll: false })
    }
  }, [searchParams, router, showToast, t])

  useEffect(() => {
    Promise.all([
      fetch('/api/alumno/perfil').then(r => r.json()),
      fetch('/api/alumno/meses').then(r => r.json()),
      fetch('/api/alumno/calificaciones').then(r => r.json()),
    ]).then(([p, m, c]) => {
      setPerfil(p)
      setMeses(Array.isArray(m) ? m : [])
      setMateriasAcreditadas(c?.resumen?.materias_acreditadas ?? 0)
    }).finally(() => setLoading(false))
  }, [])

  // Cargar logros una vez que perfil está disponible
  useEffect(() => {
    if (!perfil) return
    const supabase = createClient()
    ;(async () => {
      const { data } = await supabase
        .from('logros_alumno')
        .select('tipo, obtenido_en')
        .eq('alumno_id', perfil.id)
      if (data) setLogros(data as Array<{ tipo: string; obtenido_en: string; metadata?: Record<string, unknown> }>)
    })()
  }, [perfil])

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

  const hora = new Date().getHours()
  const saludo = hora < 12
    ? (lang === 'en' ? 'Good morning' : 'Buenos días')
    : hora < 19
    ? (lang === 'en' ? 'Good afternoon' : 'Buenas tardes')
    : (lang === 'en' ? 'Good evening' : 'Buenas noches')

  const primerNombre = perfil.nombre_completo.split(' ')[0]
  const mesActivo = perfil.meses_desbloqueados
  const rachaLogro = logros.find(l => l.tipo === 'racha_actual')
  const diasRacha = (rachaLogro?.metadata?.dias as number | undefined) ?? 0

  return (
    <div className="space-y-8 max-w-5xl">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* SECCIÓN 1 — Header de bienvenida */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#F1F5F9' }}>
          {saludo}, {primerNombre}
        </h1>
        <p className="text-sm" style={{ color: '#475569' }}>
          {lang === 'en' ? 'Student ID:' : 'Matrícula:'} {perfil.matricula}
        </p>
        <StreakTracker diasRacha={diasRacha} lang={lang} />
      </div>

      {/* SECCIÓN 2 — 3 tarjetas de stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tarjeta 1: Progreso general */}
        <div className="rounded-xl p-5 space-y-3" style={{ background: '#181C26', border: '1px solid #2A2F3E' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#64748B' }}>
              {lang === 'en' ? 'Overall progress' : 'Avance total'}
            </p>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(91,108,255,0.12)' }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: '#7B8AFF' }} />
            </div>
          </div>
          <p className="text-4xl font-bold" style={{ color: '#F1F5F9' }}>{porcentaje}<span className="text-xl font-normal ml-0.5" style={{ color: '#475569' }}>%</span></p>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${porcentaje}%`, background: 'linear-gradient(90deg, #5B6CFF, #7B8AFF)' }}
            />
          </div>
        </div>

        {/* Tarjeta 2: Mes en curso */}
        <div className="rounded-xl p-5 space-y-3" style={{ background: '#181C26', border: '1px solid #2A2F3E' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#64748B' }}>
              {lang === 'en' ? 'Current month' : 'Mes en curso'}
            </p>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)' }}>
              <BookOpen className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
            </div>
          </div>
          <p className="text-4xl font-bold" style={{ color: '#F1F5F9' }}>
            {mesActivo}
            <span className="text-sm font-normal ml-1.5" style={{ color: '#475569' }}>
              / {perfil.duracion_meses}
            </span>
          </p>
          <p className="text-xs" style={{ color: '#475569' }}>
            {perfil.plan_nombre}
          </p>
        </div>

        {/* Tarjeta 3: Materias acreditadas */}
        <div className="rounded-xl p-5 space-y-3" style={{ background: '#181C26', border: '1px solid #2A2F3E' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#64748B' }}>
              {lang === 'en' ? 'Subjects passed' : 'Materias acreditadas'}
            </p>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
              <GraduationCap className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
            </div>
          </div>
          <p className="text-4xl font-bold" style={{ color: '#F1F5F9' }}>{materiasAcreditadas}</p>
          <p className="text-xs" style={{ color: '#475569' }}>
            {lang === 'en' ? 'subjects approved' : 'materias aprobadas'}
          </p>
        </div>
      </div>

      {/* SECCIÓN 3 — Botón continuar estudiando */}
      {mesActivo > 0 && (
        <div>
          <button
            onClick={() => router.push(`/alumno/mes/${mesActivo}`)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: '#5B6CFF', color: '#fff' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#7B8AFF' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#5B6CFF' }}
          >
            {lang === 'en' ? 'Continue studying' : 'Continuar estudiando'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECCIÓN 4 — Grid de meses */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold" style={{ color: '#64748B' }}>
          {t('dashboard.programMonths')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {meses.map((mes) => (
            <div
              key={mes.id}
              onClick={() => mes.desbloqueado && router.push(`/alumno/mes/${mes.numero}`)}
              className="rounded-xl p-4 transition-all duration-200"
              style={{
                background: '#181C26',
                border: mes.desbloqueado ? '1px solid rgba(91,108,255,0.35)' : '1px solid #2A2F3E',
                opacity: mes.desbloqueado ? 1 : 0.5,
                cursor: mes.desbloqueado ? 'pointer' : 'default',
              }}
              onMouseEnter={e => {
                if (mes.desbloqueado) (e.currentTarget as HTMLElement).style.background = 'rgba(91,108,255,0.07)'
              }}
              onMouseLeave={e => {
                if (mes.desbloqueado) (e.currentTarget as HTMLElement).style.background = '#181C26'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span
                    className="text-3xl font-bold leading-none"
                    style={{ color: mes.desbloqueado ? '#5B6CFF' : '#475569' }}
                  >
                    {mes.numero}
                  </span>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: mes.desbloqueado ? '#F1F5F9' : '#64748B' }}
                  >
                    {mes.titulo || `Mes ${mes.numero}`}
                  </p>
                  <p className="text-xs" style={{ color: '#475569' }}>
                    {(mes.materias ?? []).length} {lang === 'en' ? 'subjects' : 'materias'}
                  </p>
                </div>
                {!mes.desbloqueado && (
                  <Lock className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#475569' }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 5 — Logros */}
      <BadgesGrid logros={logros} lang={lang} />
    </div>
  )
}
