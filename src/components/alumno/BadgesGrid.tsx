'use client'

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
  },
  {
    tipo: 'materia_completada',
    emoji: '📚',
    nombre_es: 'Materia dominada',
    nombre_en: 'Subject mastered',
  },
  {
    tipo: 'racha_3_dias',
    emoji: '🔥',
    nombre_es: 'Racha de fuego',
    nombre_en: 'On fire',
  },
  {
    tipo: 'racha_7_dias',
    emoji: '⚡',
    nombre_es: 'Imparable',
    nombre_en: 'Unstoppable',
  },
  {
    tipo: 'mes_completado',
    emoji: '🏆',
    nombre_es: 'Mes completado',
    nombre_en: 'Month completed',
  },
  {
    tipo: 'primer_examen',
    emoji: '✏️',
    nombre_es: 'Primer examen',
    nombre_en: 'First exam',
  },
  {
    tipo: 'examen_perfecto',
    emoji: '⭐',
    nombre_es: 'Examen perfecto',
    nombre_en: 'Perfect score',
  },
  {
    tipo: 'mitad_carrera',
    emoji: '🎯',
    nombre_es: 'Mitad del camino',
    nombre_en: 'Halfway there',
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
  const logroMap = new Map(logros.map(l => [l.tipo, l.obtenido_en]))
  const obtenidos = logros.length

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BADGES.map(badge => {
          const obtenido = logroMap.has(badge.tipo)
          const fecha = logroMap.get(badge.tipo)
          const nombre = lang === 'en' ? badge.nombre_en : badge.nombre_es

          return (
            <div
              key={badge.tipo}
              className="relative flex flex-col items-center text-center gap-2 rounded-xl p-4 cursor-default select-none"
              style={{
                background: obtenido ? 'rgba(99,102,241,0.1)' : '#181C26',
                border: obtenido ? '1px solid rgba(99,102,241,0.3)' : '1px solid #2A2F3E',
              }}
            >
              {obtenido && (
                <span
                  className="absolute top-2 right-2 text-xs leading-none"
                  style={{ color: '#34D399' }}
                  aria-hidden
                >
                  ✓
                </span>
              )}

              <span
                className="text-4xl leading-none"
                style={{ filter: obtenido ? 'none' : 'grayscale(1)', opacity: obtenido ? 1 : 0.35 }}
                aria-hidden
              >
                {badge.emoji}
              </span>

              <p
                className="text-xs font-medium leading-tight"
                style={{
                  color: obtenido ? '#E2E8F0' : '#94A3B8',
                  opacity: obtenido ? 1 : 0.45,
                }}
              >
                {nombre}
              </p>

              <p className="text-[11px] leading-tight" style={{ color: obtenido ? '#34D399' : '#475569' }}>
                {obtenido && fecha
                  ? formatFecha(fecha, lang)
                  : (lang === 'en' ? 'Not earned' : 'No obtenido')}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
