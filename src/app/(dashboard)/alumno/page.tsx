'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
import { trackPurchase } from '@/lib/metaPixel'

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
  desbloqueada?: boolean
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
  // demo state removed — TUT card logic uses perfil.meses_desbloqueados === 0
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

  // Función reutilizable de carga — no toca loading para que el reload post-pago sea silencioso
  const cargarDatos = useCallback(async () => {
    const [p, m, c] = await Promise.all([
      fetch('/api/alumno/perfil').then(r => r.json()),
      fetch('/api/alumno/meses').then(r => r.json()),
      fetch('/api/alumno/calificaciones').then(r => r.json()),
    ])
    setPerfil(p)
    // Meses API always returns { meses: [...], inscripcion_pagada, meses_desbloqueados }
    if (m && Array.isArray(m.meses)) {
      setMeses(m.meses)
    } else {
      setMeses(Array.isArray(m) ? m : [])
    }
    setMateriasAcreditadas(c?.resumen?.materias_acreditadas ?? 0)
  }, [])

  // Carga inicial — muestra spinner hasta que resuelve
  useEffect(() => {
    cargarDatos().finally(() => setLoading(false))
  }, [cargarDatos])

  // Detectar retorno desde Stripe y recargar datos tras pago exitoso
  useEffect(() => {
    const pago = searchParams.get('pago')
    if (pago === 'exitoso') {
      if (searchParams.get('inscripcion') === '1') {
        trackPurchase(50)
      }
      showToast(t('payment.successToast'), 'success')
      router.replace('/alumno', { scroll: false })
      // Esperar 2 s para que el webhook de Stripe procese antes de recargar
      const timer = setTimeout(() => { cargarDatos() }, 2000)
      return () => clearTimeout(timer)
    } else if (pago === 'cancelado') {
      showToast(t('payment.cancelToast'), 'info')
      router.replace('/alumno', { scroll: false })
    }
  }, [searchParams, router, showToast, t, cargarDatos])

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
    <div className="space-y-3 md:space-y-8 max-w-5xl">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Banner: Inscripción pendiente */}
      {perfil.inscripcion_pagada === false && perfil.meses_desbloqueados === 0 && (
        <FadeIn delay={0}>
          {/* Móvil: fila pago + fila asesoría (secundaria) */}
          <div className="md:hidden space-y-2">
            <div
              className="flex items-center gap-2 rounded-xl px-2.5 h-12 max-h-12 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.14) 0%, rgba(239,68,68,0.1) 100%)',
                border: '1px solid rgba(245,158,11,0.35)',
              }}
            >
              <Bell className="w-3.5 h-3.5 shrink-0" style={{ color: '#F59E0B' }} aria-hidden />
              <p className="text-[11px] leading-tight truncate flex-1 min-w-0 font-medium" style={{ color: '#FCD34D' }}>
                {lang === 'en'
                  ? 'Pay your enrollment ($50) to get started'
                  : 'Paga tu inscripción ($50) para comenzar'}
              </p>
              <Link
                href="/alumno/pagar"
                className="shrink-0 flex items-center gap-1 px-2.5 h-8 rounded-lg text-xs font-semibold touch-manipulation active:opacity-90 whitespace-nowrap"
                style={{ background: '#F59E0B', color: '#0B0D11' }}
              >
                <CreditCard className="w-3 h-3" />
                {lang === 'en' ? 'Pay' : 'Pagar'}
              </Link>
            </div>
            <a
              href="https://cal.com/soluciones-academicas/asesoria-edvex-academy-30-min"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-1.5 min-h-9 rounded-lg px-2 text-xs font-medium touch-manipulation active:opacity-90"
              style={{
                color: '#7B8AFF',
                background: 'transparent',
                border: '1px solid rgba(91,108,255,0.28)',
              }}
            >
              {lang === 'en'
                ? '📅 Schedule a call →'
                : '📅 Agendar asesoría gratis →'}
            </a>
          </div>

          <div
            className="hidden md:flex rounded-2xl p-5 flex-col sm:flex-row sm:items-center gap-4"
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
              <p className="font-semibold text-sm leading-snug break-words" style={{ color: '#FCD34D' }}>
                ¡Bienvenido a EDVEX Academy!
              </p>
              <p className="text-xs mt-1 leading-relaxed break-words" style={{ color: '#94A3B8' }}>
                Tu siguiente paso es pagar tu inscripción para comenzar. Al confirmar tu pago,{' '}
                <strong style={{ color: '#CBD5E1' }}>Control Escolar te contactará por WhatsApp</strong>{' '}
                para darte la bienvenida, solicitarte tus documentos y resolver cualquier duda.
              </p>
            </div>

            <div className="flex flex-col items-stretch sm:items-end gap-3 flex-shrink-0">
              <Link
                href="/alumno/pagar"
                className="flex items-center justify-center gap-2 px-5 min-h-[48px] rounded-xl text-sm font-semibold touch-manipulation active:opacity-90 w-full sm:w-auto"
                style={{ background: '#F59E0B', color: '#0B0D11' }}
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
                  className="flex items-center justify-center gap-2 px-5 min-h-[48px] rounded-xl text-sm font-medium touch-manipulation active:opacity-90 w-full sm:w-auto text-center"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(91,108,255,0.4)',
                    color: '#7B8AFF',
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

      {/* Banner: Inscripción confirmada pero sin módulos (meses=0 + pagado) */}
      {perfil.inscripcion_pagada && perfil.meses_desbloqueados === 0 && (
        <FadeIn delay={0}>
          <div
            className="md:hidden flex items-center gap-2 rounded-xl px-2.5 h-12 max-h-12 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(91,108,255,0.1) 100%)',
              border: '1px solid rgba(16,185,129,0.35)',
            }}
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" style={{ color: '#10B981' }} aria-hidden />
            <p className="text-[11px] leading-tight truncate flex-1 min-w-0 font-medium" style={{ color: '#6EE7B7' }}>
              {lang === 'en'
                ? 'Confirmed — buy your first module to study.'
                : 'Confirmado — compra tu primer módulo para estudiar.'}
            </p>
            <Link
              href="/alumno/pagar"
              className="shrink-0 flex items-center gap-1 px-2 h-8 rounded-lg text-[11px] font-semibold touch-manipulation active:opacity-90 whitespace-nowrap"
              style={{ background: '#10B981', color: '#fff' }}
            >
              <CreditCard className="w-3 h-3" />
              {lang === 'en' ? 'Buy' : 'Comprar'}
            </Link>
          </div>

          <div
            className="hidden md:flex rounded-2xl p-5 flex-col sm:flex-row sm:items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(91,108,255,0.08) 100%)',
              border: '1px solid rgba(16,185,129,0.35)',
            }}
          >
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)' }}
            >
              <GraduationCap className="w-5 h-5" style={{ color: '#10B981' }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-snug" style={{ color: '#6EE7B7' }}>
                {lang === 'en' ? '✅ Enrollment confirmed!' : '✅ ¡Inscripción confirmada!'}
              </p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: '#94A3B8' }}>
                {lang === 'en'
                  ? 'Purchase your first module to start studying. The Tutorial subject is available for free while you wait.'
                  : 'Compra tu primer módulo para comenzar a estudiar. La materia Tutorial está disponible gratis mientras tanto.'}
              </p>
            </div>

            <Link
              href="/alumno/pagar"
              className="flex items-center justify-center gap-2 px-5 min-h-[48px] rounded-xl text-sm font-semibold whitespace-nowrap flex-shrink-0 touch-manipulation active:opacity-90 w-full sm:w-auto"
              style={{ background: '#10B981', color: '#fff' }}
            >
              <CreditCard className="w-4 h-4" />
              {lang === 'en' ? 'Buy first module →' : 'Comprar primer módulo →'}
            </Link>
          </div>
        </FadeIn>
      )}

      {/* SECCIÓN 1 — Header de bienvenida */}
      <FadeIn delay={perfil.inscripcion_pagada === false && perfil.meses_desbloqueados === 0 ? 100 : 0}>
        <div className="space-y-1 md:space-y-1.5 pt-0 md:pt-0">
          <SplitTitle
            text={`${saludo}, ${primerNombre}`}
            className="text-xl md:text-4xl font-bold leading-tight"
            style={{ color: '#F1F5F9' }}
          />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs md:block md:text-sm">
            <p className="font-mono inline md:block" style={{ color: '#475569' }}>
              <span className="md:hidden">{lang === 'en' ? 'ID:' : 'Mat.:'}</span>
              <span className="hidden md:inline">{lang === 'en' ? 'Student ID:' : 'Matrícula:'}</span>{' '}
              <span style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                {matriculaDisplay ?? perfil.matricula}
              </span>
            </p>
            {diasRacha > 0 && (
              <>
                <span className="text-[#334155] md:hidden" aria-hidden>·</span>
                <StreakTracker diasRacha={diasRacha} lang={lang} className="md:mt-1.5" />
              </>
            )}
          </div>
        </div>
      </FadeIn>

      {/* SECCIÓN 2 — 3 tarjetas de stats */}
      <FadeIn delay={perfil.inscripcion_pagada === false && perfil.meses_desbloqueados === 0 ? 200 : 100}>
        <div className="grid grid-cols-3 gap-1.5 md:gap-3">
          {/* Tarjeta 1: Progreso general */}
          <div
            className="rounded-lg md:rounded-xl p-2 md:p-5 flex flex-col justify-center min-h-0 h-[76px] md:h-auto md:space-y-3 bg-[#141821] md:bg-[#181C26]"
            style={{ border: '1px solid #2A2F3E' }}
          >
            <div className="hidden md:flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#64748B' }}>
                {lang === 'en' ? 'Overall progress' : 'Avance total'}
              </p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(91,108,255,0.12)' }}>
                <TrendingUp className="w-3.5 h-3.5" style={{ color: '#7B8AFF' }} />
              </div>
            </div>
            <p className="md:hidden text-[9px] font-semibold uppercase tracking-wide text-center leading-tight px-0.5" style={{ color: '#64748B' }}>
              {lang === 'en' ? 'Progress' : 'Avance'}
            </p>
            <p className="text-xl md:text-2xl font-bold text-center md:text-left leading-none md:leading-normal" style={{ color: '#F1F5F9' }}>
              <span ref={porcentajeRef}>0</span>
              <span className="text-[10px] md:text-sm font-normal md:ml-0.5" style={{ color: '#475569' }}>%</span>
            </p>
            <div className="hidden md:block h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${porcentaje}%`, background: 'linear-gradient(90deg, #5B6CFF, #7B8AFF)' }}
              />
            </div>
          </div>

          {/* Tarjeta 2: Mes en curso */}
          <div
            className="rounded-lg md:rounded-xl p-2 md:p-5 flex flex-col justify-center min-h-0 h-[76px] md:h-auto md:space-y-3 bg-[#141821] md:bg-[#181C26]"
            style={{ border: '1px solid #2A2F3E' }}
          >
            <div className="hidden md:flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#64748B' }}>
                {lang === 'en' ? 'Current month' : 'Mes en curso'}
              </p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)' }}>
                <BookOpen className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
              </div>
            </div>
            <p className="md:hidden text-[9px] font-semibold uppercase tracking-wide text-center leading-tight px-0.5" style={{ color: '#64748B' }}>
              {lang === 'en' ? 'Month' : 'Mes'}
            </p>
            <p className="text-xl md:text-2xl font-bold text-center md:text-left leading-none md:leading-normal" style={{ color: '#F1F5F9' }}>
              {mesActivo}
              <span className="text-[10px] md:text-sm font-normal md:ml-1.5" style={{ color: '#475569' }}>
                /{perfil.duracion_meses}
              </span>
            </p>
            <p className="hidden md:block text-xs truncate" style={{ color: '#475569' }}>
              {perfil.plan_nombre}
            </p>
          </div>

          {/* Tarjeta 3: Materias acreditadas */}
          <div
            className="rounded-lg md:rounded-xl p-2 md:p-5 flex flex-col justify-center min-h-0 h-[76px] md:h-auto md:space-y-3 bg-[#141821] md:bg-[#181C26]"
            style={{ border: '1px solid #2A2F3E' }}
          >
            <div className="hidden md:flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#64748B' }}>
                {lang === 'en' ? 'Subjects passed' : 'Materias acreditadas'}
              </p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
                <GraduationCap className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
              </div>
            </div>
            <p className="md:hidden text-[9px] font-semibold uppercase tracking-wide text-center leading-tight px-0.5" style={{ color: '#64748B' }}>
              {lang === 'en' ? 'Passed' : 'Aprobadas'}
            </p>
            <p className="text-xl md:text-2xl font-bold text-center md:text-left leading-none md:leading-normal" style={{ color: '#F1F5F9' }}>{materiasAcreditadas}</p>
            <p className="hidden md:block text-xs" style={{ color: '#475569' }}>
              {lang === 'en' ? 'subjects approved' : 'materias aprobadas'}
            </p>
          </div>
        </div>
      </FadeIn>

      {/* SECCIÓN 3 — Botón continuar estudiando */}
      {(
        <FadeIn delay={perfil.inscripcion_pagada === false && perfil.meses_desbloqueados === 0 ? 300 : 200}>
          <div>
            {mesActivo > 0 && (
              <button
                type="button"
                ref={btnContinuarRef}
                onClick={() => router.push(`/alumno/mes/${mesActivo}`)}
                className="flex items-center gap-1.5 px-4 min-h-10 md:px-6 md:min-h-[48px] rounded-lg md:rounded-xl font-semibold text-xs md:text-sm touch-manipulation active:opacity-90"
                style={{ background: '#5B6CFF', color: '#fff' }}
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
              >
                {lang === 'en' ? 'Continue studying' : 'Continuar estudiando'}
                <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
            )}
          </div>
        </FadeIn>
      )}

      {/* SECCIÓN 4a — Card de materia Tutorial (siempre visible cuando no hay meses desbloqueados) */}
      {perfil.meses_desbloqueados === 0 && (
        <FadeIn delay={200}>
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 md:gap-3">
              <p className="text-[10px] md:text-xs font-semibold tracking-widest uppercase" style={{ color: '#475569' }}>
                {lang === 'en' ? 'Free tutorial' : 'Tutorial gratuito'}
              </p>
              <div className="flex-1 h-px" style={{ background: '#2A2F3E' }} />
            </div>
            <div
              className="rounded-lg md:rounded-xl p-3 gap-2 md:p-5 md:gap-4 flex flex-col sm:flex-row sm:items-center"
              style={{ background: '#181C26', border: '1px solid rgba(91,108,255,0.3)' }}
            >
              <div className="flex-1 min-w-0 space-y-0.5 md:space-y-1">
                <p className="text-[10px] md:text-xs font-mono" style={{ color: '#5B6CFF' }}>TUT101</p>
                <p className="text-sm md:text-base font-bold leading-snug" style={{ color: '#F1F5F9' }}>
                  {lang === 'en' ? 'University Entry Tutoring I' : 'Tutoría de ingreso I'}
                </p>
                <p className="text-xs md:text-sm leading-snug line-clamp-2 md:line-clamp-none" style={{ color: '#64748B' }}>
                  {lang === 'en'
                    ? 'Get familiar with the platform, your study plan and virtual high school methodology.'
                    : 'Familiarízate con la plataforma, tu plan de estudio y la metodología del bachillerato virtual.'}
                </p>
              </div>
              <Link
                href="/alumno/materia/e3f004d8-4451-4a65-9c91-bac3f87d2378"
                className="flex items-center justify-center gap-1.5 px-3 min-h-9 md:px-5 md:min-h-[48px] rounded-lg md:rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap flex-shrink-0 touch-manipulation active:opacity-90 w-full sm:w-auto"
                style={{ background: 'rgba(91,108,255,0.15)', color: '#7B8AFF', border: '1px solid rgba(91,108,255,0.35)' }}
              >
                <span className="md:hidden">{lang === 'en' ? 'Explore →' : 'Explorar →'}</span>
                <span className="hidden md:inline">{lang === 'en' ? 'Explore subject →' : 'Explorar materia →'}</span>
              </Link>
            </div>
          </div>
        </FadeIn>
      )}

      {/* SECCIÓN 4b — Grid de meses */}
      {meses.length > 0 && (
        <FadeIn delay={perfil.inscripcion_pagada === false && perfil.meses_desbloqueados === 0 ? 400 : 300}>
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 md:gap-3">
              <p className="text-[10px] md:text-xs font-semibold tracking-widest uppercase" style={{ color: '#475569' }}>
                {t('dashboard.programMonths')}
              </p>
              <div className="flex-1 h-px" style={{ background: '#2A2F3E' }} />
            </div>
            <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
              {meses.map((mes) => (
                <button
                  key={mes.id}
                  type="button"
                  disabled={!mes.desbloqueado}
                  onClick={() => {
                    if (mes.desbloqueado) router.push(`/alumno/mes/${mes.numero}`)
                  }}
                  className="mes-card rounded-lg md:rounded-xl p-2.5 md:p-4 text-left w-full min-h-[72px] md:min-h-[100px] touch-manipulation md:transition-all md:duration-200 disabled:cursor-not-allowed active:opacity-95 bg-[#141821] md:bg-[#181C26]"
                  style={{
                    border: mes.desbloqueado ? '1px solid rgba(91,108,255,0.35)' : '1px solid #2A2F3E',
                    opacity: mes.desbloqueado ? 1 : 0.5,
                  }}
                >
                  <div className="flex items-start justify-between gap-1.5 md:gap-2">
                    <div className="space-y-0 min-w-0">
                      <span
                        className="text-xl md:text-3xl font-bold leading-none block"
                        style={{ color: mes.desbloqueado ? '#5B6CFF' : '#475569' }}
                      >
                        {mes.numero}
                      </span>
                      <p
                        className="text-xs md:text-sm font-semibold break-words leading-tight mt-0.5 md:mt-0"
                        style={{ color: mes.desbloqueado ? '#F1F5F9' : '#64748B' }}
                      >
                        {mes.titulo || `Mes ${mes.numero}`}
                      </p>
                      <p className="text-[10px] md:text-xs leading-tight mt-0.5" style={{ color: '#475569' }}>
                        {(mes.materias ?? []).length}{' '}
                        {lang === 'en' ? (
                          <>
                            <span className="md:hidden">subj.</span>
                            <span className="hidden md:inline">subjects</span>
                          </>
                        ) : (
                          <>
                            <span className="md:hidden">mat.</span>
                            <span className="hidden md:inline">materias</span>
                          </>
                        )}
                      </p>
                    </div>
                    {!mes.desbloqueado && (
                      <Lock className="w-3 h-3 md:w-4 md:h-4 mt-0.5 flex-shrink-0" style={{ color: '#475569' }} aria-hidden />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      {/* SECCIÓN 5 — Logros (sin animación: evita solapamientos en móvil) */}
      <BadgesGrid logros={logros} lang={lang} />
    </div>
  )
}
