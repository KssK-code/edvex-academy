'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Loader2, BookOpen, TrendingUp, ChevronRight, GraduationCap, Bell, CreditCard } from 'lucide-react'
import { useToast, ToastContainer } from '@/components/ui/toast'
import { useLanguage } from '@/context/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import BadgesGrid from '@/components/alumno/BadgesGrid'
import StreakTracker from '@/components/alumno/StreakTracker'
import FadeIn from '@/components/ui/FadeIn'
import SplitTitle from '@/components/ui/SplitTitle'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

interface Perfil {
  id: string
  matricula: string
  meses_desbloqueados: number
  inscripcion_pagada: boolean
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
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [meses, setMeses] = useState<Mes[]>([])
  const [materiasAcreditadas, setMateriasAcreditadas] = useState(0)
  const [logros, setLogros] = useState<Array<{ tipo: string; obtenido_en: string; metadata?: Record<string, unknown> }>>([])
  const [loading, setLoading] = useState(true)
  const [matriculaDisplay, setMatriculaDisplay] = useState<string | null>(null)
  const porcentajeRef = useRef<HTMLSpanElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const btnContinuarRef = useRef<HTMLButtonElement>(null)

  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  // Scramble effect en matrícula
  useEffect(() => {
    if (!perfil) return
    const target = perfil.matricula
    const arr = target.split('').map(ch =>
      SCRAMBLE_CHARS.includes(ch) ? SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)] : ch
    )
    setMatriculaDisplay(arr.join(''))
    const interval = setInterval(() => {
      let resolved = false
      for (let i = 0; i < target.length; i++) {
        if (arr[i] !== target[i]) {
          arr[i] = target[i]
          resolved = true
          break
        }
      }
      setMatriculaDisplay(arr.join(''))
      if (!resolved) clearInterval(interval)
    }, 80)
    return () => clearInterval(interval)
  }, [perfil]) // eslint-disable-line react-hooks/exhaustive-deps

  // Botón magnético: handlers
  const handleMagneticMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnContinuarRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    gsap.to(btn, { x: dx * 8, y: dy * 4, duration: 0.2, ease: 'power2.out' })
  }
  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(btnContinuarRef.current, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' })
    e.currentTarget.style.background = '#5B6CFF'
  }

  // Contador animado del porcentaje
  useGSAP(() => {
    if (!porcentajeRef.current || !perfil) return
    const target = perfil.duracion_meses > 0
      ? Math.round((perfil.meses_desbloqueados / perfil.duracion_meses) * 100)
      : 0
    const obj = { val: 0 }
    gsap.to(obj, {
      val: target,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => {
        if (porcentajeRef.current) {
          porcentajeRef.current.textContent = Math.round(obj.val).toString()
        }
      },
    })
  }, { dependencies: [perfil] })

  // ScrollTrigger: cards de meses entran al hacer scroll
  useGSAP(() => {
    if (!gridRef.current || meses.length === 0) return
    const cards = gridRef.current.querySelectorAll('.mes-card')
    gsap.from(cards, {
      opacity: 0,
      y: 30,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: gridRef.current,
        start: 'top 85%',
      },
    })
  }, { dependencies: [meses], scope: gridRef })

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
        .select('tipo, obtenido_en, metadata')
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

      {/* Banner: Inscripción pendiente */}
      {perfil.inscripcion_pagada === false && (
        <FadeIn delay={0}>
          <div
            className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(239,68,68,0.08) 100%)',
              border: '1px solid rgba(245,158,11,0.35)',
            }}
          >
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)' }}
            >
              <Bell className="w-5 h-5" style={{ color: '#F59E0B' }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-snug" style={{ color: '#FCD34D' }}>
                ¡Bienvenido a EDVEX Academy!
              </p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: '#94A3B8' }}>
                Tu siguiente paso es pagar tu inscripción para comenzar. Al confirmar tu pago,{' '}
                <strong style={{ color: '#CBD5E1' }}>Control Escolar te contactará por WhatsApp</strong>{' '}
                para darte la bienvenida, solicitarte tus documentos y resolver cualquier duda.
              </p>
            </div>

            <div className="flex flex-col items-stretch sm:items-end gap-3 flex-shrink-0">
              <Link
                href="/alumno/pagar"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: '#F59E0B', color: '#0B0D11' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FBBF24' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F59E0B' }}
              >
                <CreditCard className="w-4 h-4" />
                Pagar inscripción ($50 USD)
              </Link>

              <div className="flex items-center gap-2">
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                <span className="text-xs" style={{ color: '#475569', whiteSpace: 'nowrap' }}>— o si prefieres —</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <a
                  href="https://cal.com/soluciones-academicas/asesoria-edvex-academy-30-min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all w-full sm:w-auto"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(91,108,255,0.4)',
                    color: '#7B8AFF',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(91,108,255,0.1)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = '#7B8AFF'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(91,108,255,0.4)'
                  }}
                >
                  📅 Hablar con un asesor antes de pagar
                </a>
                <p className="text-xs text-center" style={{ color: '#475569' }}>
                  Agenda una videollamada de 30 min gratis con nuestro equipo
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {/* SECCIÓN 1 — Header de bienvenida */}
      <FadeIn delay={perfil.inscripcion_pagada === false ? 100 : 0}>
        <div className="space-y-1.5">
          <SplitTitle
            text={`${saludo}, ${primerNombre}`}
            className="text-2xl sm:text-4xl font-bold"
            style={{ color: '#F1F5F9' }}
          />
          <p className="text-sm font-mono" style={{ color: '#475569' }}>
            {lang === 'en' ? 'Student ID:' : 'Matrícula:'}{' '}
            <span style={{ color: '#64748B', letterSpacing: '0.05em' }}>
              {matriculaDisplay ?? perfil.matricula}
            </span>
          </p>
          <StreakTracker diasRacha={diasRacha} lang={lang} />
        </div>
      </FadeIn>

      {/* SECCIÓN 2 — 3 tarjetas de stats */}
      <FadeIn delay={perfil.inscripcion_pagada === false ? 200 : 100}>
        <div className="grid grid-cols-3 gap-3">
          {/* Tarjeta 1: Progreso general */}
          <div className="rounded-xl p-3 sm:p-5 space-y-3" style={{ background: '#181C26', border: '1px solid #2A2F3E' }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#64748B' }}>
                {lang === 'en' ? 'Overall progress' : 'Avance total'}
              </p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(91,108,255,0.12)' }}>
                <TrendingUp className="w-3.5 h-3.5" style={{ color: '#7B8AFF' }} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: '#F1F5F9' }}><span ref={porcentajeRef}>0</span><span className="text-sm font-normal ml-0.5" style={{ color: '#475569' }}>%</span></p>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${porcentaje}%`, background: 'linear-gradient(90deg, #5B6CFF, #7B8AFF)' }}
              />
            </div>
          </div>

          {/* Tarjeta 2: Mes en curso */}
          <div className="rounded-xl p-3 sm:p-5 space-y-3" style={{ background: '#181C26', border: '1px solid #2A2F3E' }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#64748B' }}>
                {lang === 'en' ? 'Current month' : 'Mes en curso'}
              </p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)' }}>
                <BookOpen className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: '#F1F5F9' }}>
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
          <div className="rounded-xl p-3 sm:p-5 space-y-3" style={{ background: '#181C26', border: '1px solid #2A2F3E' }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#64748B' }}>
                {lang === 'en' ? 'Subjects passed' : 'Materias acreditadas'}
              </p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
                <GraduationCap className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: '#F1F5F9' }}>{materiasAcreditadas}</p>
            <p className="text-xs" style={{ color: '#475569' }}>
              {lang === 'en' ? 'subjects approved' : 'materias aprobadas'}
            </p>
          </div>
        </div>
      </FadeIn>

      {/* SECCIÓN 3 — Botón continuar estudiando */}
      <FadeIn delay={perfil.inscripcion_pagada === false ? 300 : 200}>
        <div>
          {mesActivo > 0 && (
            <button
              ref={btnContinuarRef}
              onClick={() => router.push(`/alumno/mes/${mesActivo}`)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ background: '#5B6CFF', color: '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#7B8AFF' }}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              {lang === 'en' ? 'Continue studying' : 'Continuar estudiando'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </FadeIn>

      {/* SECCIÓN 4 — Grid de meses */}
      <FadeIn delay={perfil.inscripcion_pagada === false ? 400 : 300}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#475569' }}>
              {t('dashboard.programMonths')}
            </p>
            <div className="flex-1 h-px" style={{ background: '#2A2F3E' }} />
          </div>
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {meses.map((mes) => (
              <div
                key={mes.id}
                onClick={() => mes.desbloqueado && router.push(`/alumno/mes/${mes.numero}`)}
                className="mes-card rounded-xl p-4 transition-all duration-200"
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
      </FadeIn>

      {/* SECCIÓN 5 — Logros */}
      <FadeIn delay={perfil.inscripcion_pagada === false ? 500 : 400}>
        <BadgesGrid logros={logros} lang={lang} />
      </FadeIn>
    </div>
  )
}
