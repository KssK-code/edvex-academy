'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Opcion { id: string; texto: string; es_correcta: boolean }
interface Pregunta { id: string; numero: number; texto: string; tipo: string; retroalimentacion: string | null; opciones: Opcion[] }
interface Evaluacion { id: string; titulo: string; tipo: string; intentos_max: number; preguntas: Pregunta[] }
interface Semana { id: string; numero: number; titulo: string; contenido: string }
interface Materia {
  id: string; codigo: string; nombre: string; color_hex: string
  descripcion: string; objetivo: string; temario: string[]
  semanas: Semana[]
  evaluaciones: Evaluacion[]
}

const CARD = { background: '#181C26', border: '1px solid #2A2F3E' }

export default function ContenidoDetallePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [materia, setMateria] = useState<Materia | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function cargar() {
      try {
        // 1. Obtener materia base
        const { data: materiaBase, error: matErr } = await supabase
          .from('materias')
          .select('*')
          .eq('id', id)
          .single()

        if (matErr || !materiaBase) { setError('Materia no encontrada'); return }

        // 2. Semanas
        const { data: semanas } = await supabase
          .from('semanas')
          .select('*')
          .eq('materia_id', id)
          .order('numero')

        // 3. Evaluaciones
        const { data: evaluaciones } = await supabase
          .from('evaluaciones')
          .select('*')
          .eq('materia_id', id)

        // 4. Preguntas y opciones por evaluación
        const evaluacionesConPreguntas: Evaluacion[] = await Promise.all(
          ((evaluaciones ?? []) as { id: string; titulo: string; tipo: string; intentos_max: number }[]).map(async (ev) => {
            const { data: preguntas } = await supabase
              .from('preguntas')
              .select('*, opciones(*)')
              .eq('evaluacion_id', ev.id)
              .order('numero')

            return {
              ...ev,
              preguntas: (preguntas ?? []) as Pregunta[],
            }
          })
        )

        setMateria({
          ...(materiaBase as unknown as Materia),
          semanas: (semanas ?? []) as Semana[],
          evaluaciones: evaluacionesConPreguntas,
        })
      } catch {
        setError('Error al cargar la materia')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5B6CFF' }} />
    </div>
  )

  if (error || !materia) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <p className="text-sm" style={{ color: '#EF4444' }}>{error ?? 'Error'}</p>
      <button onClick={() => router.back()} className="text-sm" style={{ color: '#5B6CFF' }}>Regresar</button>
    </div>
  )

  const semanasOrdenadas = [...(materia.semanas ?? [])].sort((a, b) => a.numero - b.numero)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.push('/admin/contenido')}
          className="mt-1 p-2 rounded-lg transition-all flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#94A3B8', border: '1px solid #2A2F3E' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: materia.color_hex || '#5B6CFF' }} />
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(91,108,255,0.15)', color: '#7B8AFF' }}>
              {materia.codigo}
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1" style={{ color: '#F1F5F9' }}>{materia.nombre}</h2>
        </div>
      </div>

      {/* Info */}
      {(materia.descripcion || materia.objetivo) && (
        <div className="rounded-xl p-5 space-y-4" style={CARD}>
          <h3 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Información</h3>
          {materia.descripcion && (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>Descripción</p>
              <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>{materia.descripcion}</p>
            </div>
          )}
          {materia.objetivo && (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>Objetivo</p>
              <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>{materia.objetivo}</p>
            </div>
          )}
        </div>
      )}

      {/* Semanas */}
      {semanasOrdenadas.length > 0 && (
        <div className="rounded-xl p-5 space-y-3" style={CARD}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Temario — Semanas</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
              {semanasOrdenadas.length} semanas
            </span>
          </div>
          <div className="space-y-2">
            {semanasOrdenadas.map(sem => (
              <div key={sem.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: '#0D1017', border: '1px solid #2A2F3E' }}>
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(91,108,255,0.2)', color: '#5B6CFF' }}
                >
                  {sem.numero}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#F1F5F9' }}>{sem.titulo}</p>
                  {sem.contenido && (
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#94A3B8' }}>
                      {sem.contenido.replace(/\*\*(.*?)\*\*/g, '$1').slice(0, 120)}
                      {sem.contenido.length > 120 ? '…' : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluaciones */}
      {(materia.evaluaciones ?? []).length > 0 && materia.evaluaciones.map(ev => (
        <div key={ev.id} className="rounded-xl p-5 space-y-4" style={CARD}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{ev.titulo}</h3>
              <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                {ev.tipo} · {ev.intentos_max} intento{ev.intentos_max !== 1 ? 's' : ''} máx · {(ev.preguntas ?? []).length} preguntas
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
              Evaluación
            </span>
          </div>

          {/* Preguntas */}
          <div className="space-y-4">
            {(ev.preguntas ?? []).sort((a, b) => a.numero - b.numero).map((preg, pi) => (
              <div key={preg.id} className="rounded-lg p-4 space-y-3" style={{ background: '#0D1017', border: '1px solid #2A2F3E' }}>
                <div className="flex items-start gap-3">
                  <span
                    className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(91,108,255,0.2)', color: '#5B6CFF' }}
                  >
                    {pi + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#F1F5F9' }}>{preg.texto}</p>
                    <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(148,163,184,0.1)', color: '#94A3B8' }}>
                      {preg.tipo}
                    </span>
                  </div>
                </div>

                {(preg.opciones ?? []).length > 0 && (
                  <div className="ml-9 space-y-1.5">
                    {preg.opciones.map(op => (
                      <div
                        key={op.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                        style={op.es_correcta
                          ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }
                          : { background: 'rgba(255,255,255,0.03)', border: '1px solid #2A2F3E', color: '#94A3B8' }
                        }
                      >
                        {op.es_correcta && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#10B981' }} />}
                        <span>{op.texto}</span>
                      </div>
                    ))}
                  </div>
                )}

                {preg.retroalimentacion && (
                  <div className="ml-9 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(91,108,255,0.06)', border: '1px solid rgba(91,108,255,0.15)', color: '#94A3B8' }}>
                    <span className="font-semibold" style={{ color: '#7B8AFF' }}>Retroalimentación: </span>
                    {preg.retroalimentacion}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
