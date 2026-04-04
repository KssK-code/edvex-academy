'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

const MSGS_ES = [
  '¡Sigue así, vas excelente!',
  'Un paso más cerca de tu certificado.',
  '¡Eso es dedicación!',
  'Tu esfuerzo vale la pena.',
  '¡Semana dominada!',
]
const MSGS_EN = [
  'Keep it up, you\'re doing great!',
  'One step closer to your certificate.',
  'That\'s dedication!',
  'Your effort is worth it.',
  'Week mastered!',
]

interface ReadingProgressProps {
  semanaId: string
  alumnoId: string
  lang: string
  onCompletada?: () => void
  yaCompletada?: boolean
}

/** Encuentra el ancestro con más “room” de scroll (p. ej. main del dashboard), no el primero con overflow. */
function findBestScrollContainer(start: HTMLElement | null): HTMLElement | null {
  let el = start?.parentElement ?? null
  let best: HTMLElement | null = null
  let bestRoom = 0
  while (el && el !== document.body) {
    const { overflowY } = window.getComputedStyle(el)
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      const room = el.scrollHeight - el.clientHeight
      if (room > bestRoom) {
        bestRoom = room
        best = el
      }
    }
    el = el.parentElement
  }
  return bestRoom > 0 ? best : null
}

export default function ReadingProgress({
  semanaId,
  alumnoId,
  lang,
  onCompletada,
  yaCompletada = false,
}: ReadingProgressProps) {
  const [scrollPct, setScrollPct] = useState(0)
  const [completada, setCompletada] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [mostrarResumen, setMostrarResumen] = useState(false)
  const [minLectura, setMinLectura] = useState(1)
  const [mensaje, setMensaje] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const btnRef = useRef<HTMLButtonElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const resumenRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const mountedAt = useRef(Date.now())
  const yaCompletadaRef = useRef(yaCompletada)
  yaCompletadaRef.current = yaCompletada

  // Solo cuando cambia semana o alumno: limpiar UI y leer progreso real en BD (evita stale Semana 1 → 2)
  useEffect(() => {
    let cancelled = false
    setMostrarResumen(false)
    setCargando(false)
    setErrorMsg(null)
    setScrollPct(0)
    mountedAt.current = Date.now()
    setCompletada(false)

    if (!alumnoId) {
      setCompletada(yaCompletadaRef.current)
      return
    }

    ;(async () => {
      try {
        const res = await fetch(
          `/api/alumno/progreso/semana?semana_id=${encodeURIComponent(semanaId)}`
        )
        const data = (await res.json()) as { completada?: boolean }
        if (cancelled) return
        if (res.ok && typeof data.completada === 'boolean') {
          setCompletada(data.completada)
        } else {
          setCompletada(yaCompletadaRef.current)
        }
      } catch {
        if (!cancelled) setCompletada(yaCompletadaRef.current)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [semanaId, alumnoId])

  // Misma semana: el padre puede actualizar el Set antes/después del fetch; mantener coherencia
  useEffect(() => {
    if (yaCompletada) setCompletada(true)
  }, [yaCompletada])

  // Badge verde entra con back.out cuando completada cambia a true
  useGSAP(() => {
    if (completada && badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 0 },
        { scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
      )
    }
  }, { dependencies: [completada] })

  // Card de resumen: entra desde y:20 opacity:0, sale después de 3s
  useGSAP(() => {
    if (mostrarResumen && resumenRef.current) {
      gsap.fromTo(
        resumenRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.4, ease: 'power2.out',
          onComplete: () => {
            gsap.to(resumenRef.current, {
              opacity: 0, y: -10, duration: 0.35, ease: 'power2.in',
              delay: 3,
              onComplete: () => {
                setMostrarResumen(false)
                setCompletada(true)
                onCompletada?.()
              },
            })
          },
        }
      )
    }
  }, { dependencies: [mostrarResumen] })

  const calcularScroll = useCallback(() => {
    const root = rootRef.current
    const container = findBestScrollContainer(root)
    if (container) {
      const scrollable = container.scrollHeight - container.clientHeight
      if (scrollable <= 0) {
        setScrollPct(100)
        return
      }
      const pct = Math.min(100, (container.scrollTop / scrollable) * 100)
      setScrollPct(Math.round(pct))
      return
    }
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    if (docHeight <= 0) {
      setScrollPct(100)
      return
    }
    const pct = Math.min(100, (window.scrollY / docHeight) * 100)
    setScrollPct(Math.round(pct))
  }, [])

  // Barra superior: escuchar el contenedor de scroll real (main u otro) + window por si acaso
  useEffect(() => {
    const root = rootRef.current
    const container = findBestScrollContainer(root)

    const targets: (HTMLElement | Window)[] = []
    if (container) targets.push(container)
    targets.push(window)

    const onScroll = () => { calcularScroll() }

    targets.forEach(t => t.addEventListener('scroll', onScroll, { passive: true }))

    // DOM listo y tras posible cambio de layout (móvil)
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(calcularScroll)
    })

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => calcularScroll()) : null
    if (ro && container) ro.observe(container)
    if (ro && root) ro.observe(root)

    calcularScroll()

    return () => {
      cancelAnimationFrame(raf)
      targets.forEach(t => t.removeEventListener('scroll', onScroll))
      ro?.disconnect()
    }
  }, [semanaId, calcularScroll])

  const marcarLeido = async () => {
    if (cargando || completada) return
    setErrorMsg(null)
    setCargando(true)
    try {
      const resp = await fetch('/api/alumno/progreso/semana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        body: JSON.stringify({ semana_id: semanaId }),
      })

      if (!resp.ok) {
        let detail = ''
        try {
          const j = await resp.json()
          if (j?.error && typeof j.error === 'string') detail = j.error
        } catch { /* ignore */ }
        setErrorMsg(
          lang === 'en'
            ? (detail || 'Could not save progress. Please try again.')
            : (detail || 'No se pudo guardar el progreso. Intenta de nuevo.')
        )
        setCargando(false)
        return
      }

      const segundos = Math.round((Date.now() - mountedAt.current) / 1000)
      const mins = Math.max(1, Math.ceil(segundos / 60))
      setMinLectura(mins)

      const msgs = lang === 'en' ? MSGS_EN : MSGS_ES
      setMensaje(msgs[Math.floor(Math.random() * msgs.length)])

      if (btnRef.current) {
        gsap.timeline()
          .to(btnRef.current, { scale: 1.05, duration: 0.15, ease: 'power2.out' })
          .to(btnRef.current, { scale: 1, duration: 0.15, ease: 'power2.in' })
      }

      setMostrarResumen(true)
    } catch {
      setErrorMsg(
        lang === 'en'
          ? 'Network error. Check your connection and try again.'
          : 'Error de red. Revisa tu conexión e intenta de nuevo.'
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <div ref={rootRef} className="reading-progress-root">
      {errorMsg && (
        <div
          role="alert"
          className="fixed left-3 right-3 z-[10000] rounded-xl px-4 py-3 text-sm shadow-lg"
          style={{
            top: 'max(12px, env(safe-area-inset-top))',
            background: 'rgba(127,29,29,0.95)',
            border: '1px solid rgba(248,113,113,0.4)',
            color: '#FECACA',
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="min-h-[44px] min-w-[44px] shrink-0 rounded-lg text-lg leading-none flex items-center justify-center touch-manipulation active:opacity-70"
              style={{ color: '#FECACA' }}
              aria-label={lang === 'en' ? 'Dismiss' : 'Cerrar'}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Barra de progreso de lectura (opcional, no bloquea el CTA) */}
      <div className="sticky top-0 z-[5] -mx-1 mb-3 pt-1 -mt-1">
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: '#2A2F3E' }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-150"
            style={{
              width: `${scrollPct}%`,
              background: '#6366F1',
            }}
          />
        </div>
      </div>

      {mostrarResumen && (
        <div
          ref={resumenRef}
          style={{
            position: 'fixed',
            bottom: 'max(1.5rem, env(safe-area-inset-bottom))',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            minWidth: '260px',
            maxWidth: 'min(90vw, 400px)',
          }}
        >
          <div
            className="rounded-2xl px-5 py-4 shadow-2xl flex flex-col gap-1"
            style={{
              background: '#0F1629',
              border: '1px solid rgba(99,102,241,0.4)',
              boxShadow: '0 8px 40px rgba(99,102,241,0.25)',
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#86EFAC' }} />
              <span className="text-sm font-bold" style={{ color: '#F1F5F9' }}>
                {lang === 'en' ? 'Week completed!' : '¡Semana completada!'}
              </span>
            </div>
            <p className="text-xs" style={{ color: '#94A3B8' }}>
              {lang === 'en'
                ? `📖 ${minLectura} min reading today`
                : `📖 ${minLectura} min de lectura hoy`}
            </p>
            <p className="text-xs font-medium" style={{ color: '#818CF8' }}>
              {mensaje}
            </p>
          </div>
        </div>
      )}

      {/* CTA al final del contenido: siempre visible al hacer scroll hasta aquí (móvil y desktop) */}
      {!mostrarResumen && (
        <div
          className="mt-6 pt-5 space-y-3"
          style={{ borderTop: '1px solid #2A2F3E' }}
        >
          <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
            {lang === 'en'
              ? 'When you have finished reading this week, confirm below to save your progress.'
              : 'Cuando hayas terminado de leer esta semana, confirma abajo para guardar tu progreso.'}
          </p>
          {completada ? (
            <div
              ref={badgeRef}
              className="flex items-center justify-center gap-2 px-5 min-h-[52px] rounded-2xl text-base font-semibold w-full"
              style={{ background: '#166534', color: '#86EFAC', border: '1px solid #15803D' }}
            >
              <CheckCircle className="w-5 h-5" />
              {lang === 'en' ? 'Week completed' : 'Semana completada'}
            </div>
          ) : (
            <button
              ref={btnRef}
              type="button"
              onClick={marcarLeido}
              disabled={cargando}
              className="flex items-center justify-center gap-2 px-4 min-h-[52px] w-full rounded-2xl text-base font-semibold touch-manipulation transition-opacity disabled:opacity-70 active:opacity-90"
              style={{ background: '#6366F1', color: '#fff', border: 'none', cursor: cargando ? 'not-allowed' : 'pointer' }}
            >
              {cargando ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span aria-hidden>✓</span>
              )}
              {lang === 'en' ? 'Complete and unlock next subject' : 'Completar y desbloquear siguiente materia'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
