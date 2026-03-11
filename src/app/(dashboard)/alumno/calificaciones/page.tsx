'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

type Estado = 'Acreditada' | 'No acreditada' | 'Pendiente'

interface MateriaCalif {
  materia_id: string
  codigo: string
  nombre_materia: string
  mes_numero: number
  estado: Estado
}

interface Resumen {
  total_materias_plan: number
  materias_acreditadas: number
  materias_no_acreditadas: number
  materias_pendientes: number
}

const CARD = { background: '#181C26', border: '1px solid #2A2F3E' }

const BADGE: Record<Estado, React.CSSProperties> = {
  'Acreditada': { background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' },
  'No acreditada': { background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' },
  'Pendiente': { background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' },
}

export default function CalificacionesPage() {
  const { t } = useLanguage()

  const estadoLabel: Record<Estado, string> = {
    'Acreditada':    t('grades.acreditadaBadge'),
    'No acreditada': t('grades.noAcreditadaBadge'),
    'Pendiente':     t('grades.pending'),
  }

  const [materias, setMaterias] = useState<MateriaCalif[]>([])
  const [resumen, setResumen] = useState<Resumen | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/alumno/calificaciones')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setMaterias(data.materias ?? [])
        setResumen(data.resumen)
      })
      .catch(() => setError('Error al cargar calificaciones'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5B6CFF' }} />
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#F1F5F9' }}>{t('grades.title')}</h2>
        <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>
          {t('grades.subtitle')}
        </p>
      </div>

      {error ? (
        <div className="rounded-xl p-6 text-center" style={CARD}>
          <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
        </div>
      ) : (
        <>
          {/* Resumen */}
          {resumen && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl p-5 flex items-center gap-4" style={CARD}>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <CheckCircle className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#10B981' }}>
                    {resumen.materias_acreditadas}
                  </p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{t('grades.acreditada')}</p>
                </div>
              </div>

              <div className="rounded-xl p-5 flex items-center gap-4" style={CARD}>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <XCircle className="w-5 h-5" style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#EF4444' }}>
                    {resumen.materias_no_acreditadas}
                  </p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{t('grades.noAcreditada')}</p>
                </div>
              </div>

              <div className="rounded-xl p-5 flex items-center gap-4" style={CARD}>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.15)' }}>
                  <Clock className="w-5 h-5" style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>
                    {resumen.materias_pendientes}
                  </p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{t('grades.pendientes')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabla */}
          {materias.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl" style={CARD}>
              <Clock className="w-10 h-10" style={{ color: '#2A2F3E' }} />
              <p className="text-sm" style={{ color: '#94A3B8' }}>{t('grades.noData')}</p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden" style={CARD}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2A2F3E' }}>
                      {[t('grades.monthCol'), t('grades.codeCol'), t('grades.subjectCol'), t('grades.statusCol')].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#94A3B8' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {materias
                      .sort((a, b) => a.mes_numero - b.mes_numero)
                      .map(m => (
                        <tr
                          key={m.materia_id}
                          style={{ borderBottom: '1px solid rgba(42,47,62,0.5)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(91,108,255,0.04)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                        >
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium px-2 py-0.5 rounded"
                              style={{ background: 'rgba(91,108,255,0.15)', color: '#7B8AFF' }}>
                              {t('grades.monthCol')} {m.mes_numero}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: '#94A3B8' }}>{m.codigo}</td>
                          <td className="px-4 py-3 font-medium" style={{ color: '#F1F5F9' }}>{m.nombre_materia}</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={BADGE[m.estado]}>
                              {estadoLabel[m.estado]}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
