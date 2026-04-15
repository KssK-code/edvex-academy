'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react'
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

interface MesesResponse {
  meses: Mes[]
  inscripcion_pagada?: boolean
  meses_desbloqueados?: number
}

const CARD = { background: '#181C26', border: '1px solid #2A2F3E' }

export default function MesPage() {
  const router = useRouter()
  const params = useParams()
  const numero = Number(params.numero)
  const { lang, t } = useLanguage()
  const loc = (es: string, en: string) => lang === 'en' && en ? en : es

  const [mes, setMes] = useState<Mes | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/alumno/meses')
      .then(r => r.json())
      .then((data: Mes[] | MesesResponse) => {
        const mesesData = Array.isArray(data) ? data : (Array.isArray(data?.meses) ? data.meses : [])
        if (!Array.isArray(mesesData) || mesesData.length === 0) { setError('Error al cargar meses'); return }
        const found = mesesData.find(m => m.numero === numero)
        if (!found) { setError('Mes no encontrado'); return }
        if (!found.desbloqueado) { router.replace('/alumno'); return }
        setMes(found)
      })
      .catch(() => setError('Error al cargar el mes'))
      .finally(() => setLoading(false))
  }, [numero, router])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5B6CFF' }} />
    </div>
  )

  if (error || !mes) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <p className="text-sm" style={{ color: '#EF4444' }}>{error ?? 'Mes no encontrado'}</p>
      <button type="button" onClick={() => router.push('/alumno')} className="text-base min-h-[48px] px-4 rounded-xl touch-manipulation" style={{ color: '#5B6CFF' }}>Regresar</button>
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push('/alumno')}
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl touch-manipulation active:opacity-80"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#94A3B8', border: '1px solid #2A2F3E' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#F1F5F9' }}>
            {t('subjects.monthLabel')} {mes.numero}{mes.titulo ? ` — ${mes.titulo}` : ''}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>
            {lang === 'en'
              ? `${mes.materias.length} subject${mes.materias.length !== 1 ? 's' : ''}`
              : `${mes.materias.length} materia${mes.materias.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Grid de materias */}
      {mes.materias.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3" style={CARD}>
          <BookOpen className="w-10 h-10" style={{ color: '#2A2F3E' }} />
          <p className="text-sm" style={{ color: '#94A3B8' }}>No hay materias en este mes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mes.materias.map(mat => (
            <div
              key={mat.id}
              className="rounded-xl overflow-hidden flex"
              style={CARD}
            >
              {/* Franja de color */}
              <div
                className="w-1.5 flex-shrink-0"
                style={{ background: mat.color_hex || '#5B6CFF' }}
              />
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(91,108,255,0.15)', color: '#7B8AFF' }}>
                      {mat.codigo}
                    </span>
                    <h3 className="text-sm font-semibold mt-2" style={{ color: '#F1F5F9' }}>{loc(mat.nombre, mat.nombre_en)}</h3>
                  </div>
                </div>
                {mat.descripcion && (
                  <p className="text-xs mb-4 line-clamp-2" style={{ color: '#94A3B8' }}>{loc(mat.descripcion, mat.descripcion_en)}</p>
                )}
                <button
                  type="button"
                  onClick={() => router.push(`/alumno/materia/${mat.id}`)}
                  className="flex items-center gap-2 px-4 min-h-[48px] rounded-xl text-base font-semibold touch-manipulation active:opacity-90 w-full justify-center"
                  style={{ background: '#5B6CFF', color: '#fff' }}
                >
                  <BookOpen className="w-4 h-4" />
                  {t('subjects.study')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
