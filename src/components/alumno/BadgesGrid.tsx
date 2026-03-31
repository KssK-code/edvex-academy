'use client'

import { useState, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

interface BadgesGridProps {
  logros: Array<{ tipo: string; obtenido_en: string }>
  lang: string
}

const BADGES = [
  {
    tipo: 'primera_semana',
    emoji: '🌱',
    nombre_es: 'Primer paso',
    nombre_en: 'First step',
    desc_es: 'Completaste tu primera semana',
    desc_en: 'You completed your first week',
  },
  {
    tipo: 'materia_completada',
    emoji: '📚',
    nombre_es: 'Materia dominada',
    nombre_en: 'Subject mastered',
    desc_es: 'Completaste todas las semanas de una materia',
    desc_en: 'You completed all weeks of a subject',
  },
  {
    tipo: 'racha_3_dias',
    emoji: '🔥',
    nombre_es: 'Racha de fuego',
    nombre_en: 'On fire',
    desc_es: '3 días seguidos estudiando',
    desc_en: '3 days in a row studying',
  },
  {
    tipo: 'racha_7_dias',
    emoji: '⚡',
    nombre_es: 'Imparable',
    nombre_en: 'Unstoppable',
    desc_es: '7 días seguidos estudiando',
    desc_en: '7 days in a row studying',
  },
  {
    tipo: 'mes_completado',
    emoji: '🏆',
    nombre_es: 'Mes completado',
    nombre_en: 'Month completed',
    desc_es: 'Completaste todas las materias de un mes',
    desc_en: 'You completed all subjects in a month',
  },
  {
    tipo: 'primer_examen',
    emoji: '✏️',
    nombre_es: 'Primer examen',
    nombre_en: 'First exam',
    desc_es: 'Presentaste tu primer examen',
    desc_en: 'You took your first exam',
  },
  {
    tipo: 'examen_perfecto',
    emoji: '⭐',
    nombre_es: 'Examen perfecto',
    nombre_en: 'Perfect score',
    desc_es: 'Obtuviste 100 en un examen',
    desc_en: 'You scored 100 on an exam',
  },
  {
    tipo: 'mitad_carrera',
    emoji: '🎯',
    nombre_es: 'Mitad del camino',
    nombre_en: 'Halfway there',
    desc_es: 'Completaste el 50% de tu plan',
    desc_en: 'You completed 50% of your plan',
  },
]

function formatFecha(iso: string, lang: string) {
  try {
    return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function BadgesGrid({ logros, lang }: BadgesGridProps) {
  const [hoveredTipo, setHoveredTipo] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const logroMap = new Map(logros.map(l => [l.tipo, l.obtenido_en]))
  const obtenidos = logros.length

  useGSAP(() => {
    if (!gridRef.current) return
    const badges = gridRef.current.querySelectorAll('.badge-obtenido')
    if (badges.length === 0) return
    gsap.from(badges, {
      scale: 3,
      opacity: 0,
      rotation: -15,
      duration: 0.6,
      stagger: 0.1,
      ease: 'back.out(1.7)',
    })
  }, { scope: gridRef, dependencies: [logros] })

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-baseline gap-2">
        <h3 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>
          {lang === 'en' ? 'My achievements' : 'Mis logros'}
        </h3>
        <span className="text-xs" style={{ color: '#475569' }}>
          {lang === 'en'
            ? `${obtenidos} of 8 earned`
            : `${obtenidos} de 8 obtenidos`}
        </span>
      </div>

      {/* Grid */}
      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BADGES.map(badge => {
          const obtenido = logroMap.has(badge.tipo)
          const fecha = logroMap.get(badge.tipo)
          const nombre = lang === 'en' ? badge.nombre_en : badge.nombre_es
          const desc = lang === 'en' ? badge.desc_en : badge.desc_es
          const isHovered = hoveredTipo === badge.tipo

          return (
            <div
              key={badge.tipo}
              className={`relative flex flex-col items-center text-center gap-2 rounded-xl p-4 transition-all duration-200 cursor-default select-none${obtenido ? ' badge-obtenido' : ''}`}
              style={{
                background: obtenido ? 'rgba(99,102,241,0.1)' : '#181C26',
                border: obtenido ? '1px solid rgba(99,102,241,0.3)' : '1px solid #2A2F3E',
              }}
              onMouseEnter={() => setHoveredTipo(badge.tipo)}
              onMouseLeave={() => setHoveredTipo(null)}
            >
              {/* Checkmark si obtenido */}
              {obtenido && (
                <span
                  className="absolute top-2 right-2 text-xs leading-none"
                  style={{ color: '#34D399' }}
                >
                  ✓
                </span>
              )}

              {/* Emoji */}
              <span
                className="text-4xl leading-none"
                style={{ filter: obtenido ? 'none' : 'grayscale(1)', opacity: obtenido ? 1 : 0.35 }}
              >
                {badge.emoji}
              </span>

              {/* Nombre */}
              <p
                className="text-xs font-medium leading-tight"
                style={{
                  color: obtenido ? '#E2E8F0' : '#94A3B8',
                  opacity: obtenido ? 1 : 0.45,
                }}
              >
                {nombre}
              </p>

              {/* Tooltip */}
              {isHovered && (
                <div
                  className="absolute bottom-full left-1/2 mb-2 z-10 w-44 rounded-lg px-3 py-2 text-center pointer-events-none"
                  style={{
                    transform: 'translateX(-50%)',
                    background: '#0B0D11',
                    border: '1px solid #2A2F3E',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                  }}
                >
                  <p className="text-xs leading-snug" style={{ color: '#94A3B8' }}>{desc}</p>
                  {obtenido && fecha && (
                    <p className="text-xs mt-1 font-medium" style={{ color: '#34D399' }}>
                      {formatFecha(fecha, lang)}
                    </p>
                  )}
                  {!obtenido && (
                    <p className="text-xs mt-1" style={{ color: '#475569' }}>
                      {lang === 'en' ? 'Not yet earned' : 'Aún no obtenido'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
