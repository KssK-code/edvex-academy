'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  GraduationCap, Clock, Monitor, Award, Shield,
  CheckCircle, ChevronRight, Mail, Phone, ArrowRight,
} from 'lucide-react'
import { ESCUELA_CONFIG } from '@/lib/config'

interface Plan {
  id: string
  nombre: string
  duracion_meses: number
  precio_mensual: number
}

const FALLBACK_PLANES: Plan[] = [
  { id: '1', nombre: 'Plan Completo', duracion_meses: 24, precio_mensual: 800 },
  { id: '2', nombre: 'Plan Acelerado', duracion_meses: 6, precio_mensual: 1500 },
  { id: '3', nombre: 'Plan Intensivo', duracion_meses: 3, precio_mensual: 2500 },
]

const POPULAR_INDEX = 0

function ScrollLink({ to, children, className, style }: {
  to: string; children: React.ReactNode; className?: string; style?: React.CSSProperties
}) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    document.getElementById(to)?.scrollIntoView({ behavior: 'smooth' })
  }
  return <button onClick={handleClick} className={className} style={style}>{children}</button>
}

export default function LandingPage() {
  const router = useRouter()
  const [planes, setPlanes] = useState<Plan[]>(FALLBACK_PLANES)
  const [visible, setVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setVisible(true)
    fetch('/api/admin/planes')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setPlanes(data) })
      .catch(() => {})
  }, [])

  const ventajas = [
    { icon: Clock, titulo: 'Flexibilidad Total', desc: 'Estudia a tu propio ritmo, las 24 horas. Sin horarios fijos ni clases presenciales.' },
    { icon: Monitor, titulo: '100% En Línea', desc: 'Solo necesitas internet. Desde tu computadora, tablet o celular, donde estés.' },
    { icon: Award, titulo: 'Validez Oficial', desc: 'Programa de bachillerato con reconocimiento oficial. Tu esfuerzo tiene valor real.' },
    { icon: Shield, titulo: 'Evaluación Automática', desc: 'Exámenes en línea con resultados inmediatos. Avanza a tu propio paso.' },
  ]

  const pasos = [
    { num: '01', titulo: 'Inscríbete', desc: 'Elige tu plan y regístrate con nuestro equipo de atención.' },
    { num: '02', titulo: 'Estudia', desc: 'Accede al contenido de tus materias las 24 horas del día.' },
    { num: '03', titulo: 'Evalúate', desc: 'Presenta tus exámenes en línea cuando estés listo.' },
    { num: '04', titulo: 'Certifícate', desc: 'Obtén tu constancia al completar tu programa.' },
  ]

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="min-h-screen" style={{ background: '#0B0D11', color: '#F1F5F9' }}>

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-10 py-4"
        style={{ background: 'rgba(11,13,17,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
            style={{ background: 'rgba(91,108,255,0.15)', border: '1px solid rgba(91,108,255,0.3)' }}
          >
            <GraduationCap className="w-5 h-5" style={{ color: '#5B6CFF' }} />
          </div>
          <span className="font-bold text-sm sm:text-base leading-tight hidden sm:block" style={{ color: '#F1F5F9' }}>
            {ESCUELA_CONFIG.nombre}
          </span>
          <span className="font-bold text-xs leading-tight block sm:hidden" style={{ color: '#F1F5F9' }}>
            BV Jalisco
          </span>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all"
          style={{ background: '#5B6CFF', color: '#fff' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#7B8AFF' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#5B6CFF' }}
        >
          Ingresar
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </nav>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-5 pt-20"
        style={{ background: 'linear-gradient(135deg, #0B0D11 0%, #0F1628 45%, #1E2A5E 100%)' }}
      >
        {/* Decoraciones */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(91,108,255,0.12) 0%, transparent 70%)', transform: 'translate(30%, -20%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(30,42,94,0.5) 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} />
          <div className="absolute top-1/2 left-1/2 w-px h-[300px] -translate-x-1/2 -translate-y-1/2 rotate-45"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(91,108,255,0.15), transparent)' }} />
        </div>

        <div
          className={`relative text-center max-w-4xl mx-auto transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'rgba(91,108,255,0.15)', border: '1px solid rgba(91,108,255,0.3)', color: '#7B8AFF' }}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            {ESCUELA_CONFIG.nombre}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black leading-tight tracking-tight mb-5 sm:mb-6">
            Tu bachillerato,
            <br />
            <span style={{ background: 'linear-gradient(90deg, #5B6CFF, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              a tu ritmo
            </span>
          </h1>

          <p className="text-sm sm:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed" style={{ color: '#94A3B8' }}>
            Educación media superior 100% en línea. Estudia desde cualquier lugar,
            las <strong style={{ color: '#F1F5F9' }}>24 horas del día</strong>, los <strong style={{ color: '#F1F5F9' }}>7 días de la semana</strong>.
          </p>

          <div className="flex flex-col items-stretch sm:flex-row sm:items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <ScrollLink
              to="planes"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all shadow-lg"
              style={{ background: '#5B6CFF', color: '#fff', boxShadow: '0 0 30px rgba(91,108,255,0.4)' }}
            >
              Conoce nuestros planes
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </ScrollLink>
            <ScrollLink
              to="como-funciona"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm sm:text-base font-medium transition-all"
              style={{ color: '#94A3B8', border: '1px solid #2A2F3E' }}
            >
              ¿Cómo funciona?
            </ScrollLink>
          </div>

          {/* Stats rápidos */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-14">
            {[
              { valor: '100%', label: 'En línea' },
              { valor: '24/7', label: 'Disponible' },
              { valor: '12+', label: 'Materias por semestre' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black" style={{ color: '#5B6CFF' }}>{s.valor}</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, transparent, rgba(91,108,255,0.6))' }} />
        </div>
      </section>

      {/* ── VENTAJAS ── */}
      <section id="ventajas" style={{ background: '#0D0F14' }} className="py-14 sm:py-20 px-4 sm:px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#5B6CFF' }}>
              Nuestras ventajas
            </p>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: '#F1F5F9' }}>
              ¿Por qué estudiar con nosotros?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ventajas.map(({ icon: Icon, titulo, desc }) => (
              <div
                key={titulo}
                className="group rounded-2xl p-6 transition-all duration-300"
                style={{ background: '#181C26', border: '1px solid #2A2F3E' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.border = '1px solid rgba(91,108,255,0.4)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(91,108,255,0.12)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.border = '1px solid #2A2F3E'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(91,108,255,0.15)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#5B6CFF' }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#F1F5F9' }}>{titulo}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" style={{ background: '#0B0D11' }} className="py-14 sm:py-20 px-4 sm:px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#5B6CFF' }}>
              Proceso simple
            </p>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: '#F1F5F9' }}>
              ¿Cómo funciona?
            </h2>
          </div>

          <div className="relative">
            {/* Línea conectora (solo desktop) */}
            <div
              className="absolute top-8 left-[12.5%] right-[12.5%] h-px hidden lg:block"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(91,108,255,0.3), rgba(91,108,255,0.3), transparent)' }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pasos.map((paso, i) => (
                <div key={paso.num} className="flex flex-col items-center text-center">
                  <div
                    className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-xl font-black"
                    style={{
                      background: i === 0 ? '#5B6CFF' : 'rgba(91,108,255,0.1)',
                      color: i === 0 ? '#fff' : '#5B6CFF',
                      border: i === 0 ? 'none' : '1px solid rgba(91,108,255,0.25)',
                      boxShadow: i === 0 ? '0 0 24px rgba(91,108,255,0.4)' : 'none',
                    }}
                  >
                    {paso.num}
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#F1F5F9' }}>{paso.titulo}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{paso.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANES ── */}
      <section id="planes" style={{ background: '#0D0F14' }} className="py-14 sm:py-20 px-4 sm:px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#5B6CFF' }}>
              Inversión en tu futuro
            </p>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: '#F1F5F9' }}>
              Nuestros Planes de Estudio
            </h2>
            <p className="text-sm mt-3" style={{ color: '#64748B' }}>
              Elige el plan que se adapte mejor a tu ritmo de vida
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {planes.map((plan, i) => {
              const isPopular = i === POPULAR_INDEX
              const materiasEst = Math.round(plan.duracion_meses * 2)
              const ritmos = ['Ritmo regular', 'Ritmo acelerado', 'Ritmo intensivo']
              const ritmo = ritmos[i] ?? 'Ritmo personalizado'

              return (
                <div
                  key={plan.id}
                  className="relative rounded-2xl p-5 sm:p-6 flex flex-col transition-all duration-300"
                  style={{
                    background: isPopular ? 'linear-gradient(145deg, #1a1f35, #0f1628)' : '#181C26',
                    border: isPopular ? '1.5px solid rgba(91,108,255,0.6)' : '1px solid #2A2F3E',
                    boxShadow: isPopular ? '0 0 40px rgba(91,108,255,0.15)' : 'none',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'
                    if (!isPopular) (e.currentTarget as HTMLElement).style.border = '1px solid rgba(91,108,255,0.3)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                    if (!isPopular) (e.currentTarget as HTMLElement).style.border = '1px solid #2A2F3E'
                  }}
                >
                  {isPopular && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: '#5B6CFF', color: '#fff' }}
                    >
                      Popular
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="text-lg font-bold" style={{ color: '#F1F5F9' }}>{plan.nombre}</h3>
                    <p className="text-xs mt-1" style={{ color: '#64748B' }}>{plan.duracion_meses} meses · {ritmo}</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-black" style={{ color: isPopular ? '#7B8AFF' : '#F1F5F9' }}>
                      {fmt(plan.precio_mensual)}
                    </span>
                    <span className="text-sm ml-1" style={{ color: '#64748B' }}>/mes</span>
                  </div>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {[
                      `${materiasEst} materias aprox.`,
                      `${plan.duracion_meses} meses de programa`,
                      ritmo,
                      'Acceso 24/7 al contenido',
                      'Evaluaciones en línea',
                      'Constancia al finalizar',
                    ].map(item => (
                      <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#94A3B8' }}>
                        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: isPopular ? '#5B6CFF' : '#10B981' }} />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={`mailto:${ESCUELA_CONFIG.contactoEmail}?subject=Solicitud de inscripción — ${plan.nombre}`}
                    className="block w-full text-center py-3 rounded-xl text-sm font-bold transition-all"
                    style={isPopular
                      ? { background: '#5B6CFF', color: '#fff' }
                      : { background: 'rgba(91,108,255,0.1)', color: '#7B8AFF', border: '1px solid rgba(91,108,255,0.25)' }
                    }
                    onMouseEnter={e => {
                      if (isPopular) e.currentTarget.style.background = '#7B8AFF'
                      else e.currentTarget.style.background = 'rgba(91,108,255,0.18)'
                    }}
                    onMouseLeave={e => {
                      if (isPopular) e.currentTarget.style.background = '#5B6CFF'
                      else e.currentTarget.style.background = 'rgba(91,108,255,0.1)'
                    }}
                  >
                    Contáctanos para inscribirte
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto" style={{ background: '#0B0D11' }} className="py-14 sm:py-20 px-4 sm:px-5">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#5B6CFF' }}>
            Estamos aquí
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#F1F5F9' }}>
            ¿Tienes preguntas?
          </h2>
          <p className="text-base mb-10" style={{ color: '#64748B' }}>
            Escríbenos y te atendemos en menos de 24 horas.
          </p>

          <div className="flex flex-col items-center gap-4">
            <a
              href={`mailto:${ESCUELA_CONFIG.contactoEmail}`}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl text-base font-semibold transition-all"
              style={{ background: '#181C26', border: '1px solid #2A2F3E', color: '#F1F5F9' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(91,108,255,0.5)'
                ;(e.currentTarget as HTMLElement).style.color = '#7B8AFF'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.border = '1px solid #2A2F3E'
                ;(e.currentTarget as HTMLElement).style.color = '#F1F5F9'
              }}
            >
              <Mail className="w-5 h-5" style={{ color: '#5B6CFF' }} />
              {ESCUELA_CONFIG.contactoEmail}
            </a>

            {ESCUELA_CONFIG.contactoTelefono && (
              <a
                href={`tel:${ESCUELA_CONFIG.contactoTelefono}`}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl text-base font-semibold transition-all"
                style={{ background: '#181C26', border: '1px solid #2A2F3E', color: '#F1F5F9' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.border = '1px solid rgba(91,108,255,0.5)'
                  ;(e.currentTarget as HTMLElement).style.color = '#7B8AFF'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.border = '1px solid #2A2F3E'
                  ;(e.currentTarget as HTMLElement).style.color = '#F1F5F9'
                }}
              >
                <Phone className="w-5 h-5" style={{ color: '#5B6CFF' }} />
                {ESCUELA_CONFIG.contactoTelefono}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="py-8 px-5 text-center space-y-3"
        style={{ background: '#080A0E', borderTop: '1px solid #2A2F3E' }}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: 'rgba(91,108,255,0.15)', border: '1px solid rgba(91,108,255,0.2)' }}
          >
            <GraduationCap className="w-4 h-4" style={{ color: '#5B6CFF' }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: '#475569' }}>{ESCUELA_CONFIG.nombre}</span>
        </div>
        <p className="text-xs" style={{ color: '#374151' }}>
          © {new Date().getFullYear()} {ESCUELA_CONFIG.nombre}. Todos los derechos reservados.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => router.push('/login')}
            className="text-xs transition-colors"
            style={{ color: '#374151' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#7B8AFF' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#374151' }}
          >
            Iniciar Sesión
          </button>
        </div>
      </footer>

    </div>
  )
}
