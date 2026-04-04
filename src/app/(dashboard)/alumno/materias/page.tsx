'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, BookOpen } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface MateriaResumen {
  id: string
  codigo: string
  nombre: string
  nombre_en: string
  color_hex: string
  descripcion: string
  descripcion_en: string
}

interface Mes {
  id: string
  numero: number
  titulo: string
  desbloqueado: boolean
  materias: MateriaResumen[]
}

const CARD = { background: '#181C26', border: '1px solid #2A2F3E' }

export default function MateriasPage() {
  const router = useRouter()
  const { lang, t } = useLanguage()
  const loc = (es: string, en: string) => lang === 'en' && en ? en : es
  const [meses, setMeses] = useState<Mes[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/alumno/meses')
      .then(r => r.json())
      .then(data => setMeses(Array.isArray(data) ? data : []))
      .catch(() => setError('Error al cargar las materias'))
      .finally(() => setLoading(false))
  }, [])

  const todasLasMaterias = meses.flatMap(mes =>
    (mes.materias ?? []).map(mat => ({ ...mat, mes_numero: mes.numero, mes_titulo: mes.titulo, desbloqueado: mes.desbloqueado }))
  )

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5B6CFF' }} />
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#F1F5F9' }}>{t('subjects.mySubjectsTitle')}</h2>
        <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>
          {t('subjects.mySubjectsSubtitle')}
        </p>
      </div>

      {error ? (
        <div className="flex items-center justify-center py-12 rounded-xl" style={CARD}>
          <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
        </div>
      ) : todasLasMaterias.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl" style={CARD}>
          <BookOpen className="w-10 h-10" style={{ color: '#2A2F3E' }} />
          <p className="text-sm" style={{ color: '#94A3B8' }}>{t('subjects.noSubjects')}</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={CARD}>
          <div className="overflow-x-auto -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr style={{ borderBottom: '1px solid #2A2F3E' }}>
                  {['', t('subjects.codeCol'), t('subjects.subjectCol'), t('subjects.monthCol'), t('subjects.statusCol'), t('subjects.actionCol')].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#94A3B8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todasLasMaterias.map(mat => (
                  <tr
                    key={mat.id}
                    style={{ borderBottom: '1px solid rgba(42,47,62,0.5)' }}
                  >
                    <td className="px-4 py-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: mat.color_hex || '#5B6CFF' }} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#94A3B8' }}>{mat.codigo}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: '#F1F5F9' }}>{loc(mat.nombre, mat.nombre_en)}</td>
                    <td className="px-4 py-3" style={{ color: '#94A3B8' }}>
                      {t('subjects.monthLabel')} {mat.mes_numero}{mat.mes_titulo ? ` — ${mat.mes_titulo}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={mat.desbloqueado
                          ? { background: 'rgba(16,185,129,0.15)', color: '#10B981' }
                          : { background: 'rgba(71,85,105,0.2)', color: '#64748B' }
                        }
                      >
                        {mat.desbloqueado ? t('subjects.available') : t('subjects.locked')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {mat.desbloqueado ? (
                        <button
                          type="button"
                          onClick={() => router.push(`/alumno/materia/${mat.id}`)}
                          className="flex items-center justify-center gap-2 px-4 min-h-[48px] rounded-xl text-sm font-medium touch-manipulation active:opacity-90 whitespace-nowrap"
                          style={{ background: 'rgba(91,108,255,0.1)', color: '#7B8AFF', border: '1px solid rgba(91,108,255,0.2)' }}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          {t('subjects.study')}
                        </button>
                      ) : (
                        <span className="text-xs" style={{ color: '#475569' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
