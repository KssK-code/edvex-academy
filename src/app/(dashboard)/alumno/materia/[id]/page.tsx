'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, PlayCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface Video { titulo: string; titulo_en: string; url: string; url_en: string; duracion: string }
interface Semana {
  id: string; numero: number; titulo: string; titulo_en: string
  contenido: string; contenido_en: string
  url_en: string; videos: Video[]
}
interface Evaluacion {
  id: string; titulo: string; titulo_en: string; tipo: string; intentos_max: number
  intentos_usados: number; aprobada: boolean; calificacion_aprobatoria: number | null
}
interface BibItem { titulo: string; url?: string; tipo?: string }
interface Materia {
  id: string; codigo: string; nombre: string; nombre_en: string; color_hex: string
  descripcion: string; descripcion_en: string; objetivo: string; objetivo_en: string; temario: string[]
  bibliografia: BibItem[]
  semanas: Semana[]
  evaluaciones: Evaluacion[]
}

type Tab = 'contenido' | 'examen' | 'informacion'

const CARD = { background: '#181C26', border: '1px solid #2A2F3E' }
const INPUT_BG = { background: '#0B0D11' }

function renderBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#F1F5F9', fontWeight: 600 }}>{part}</strong>
      : part
  )
}

function renderTexto(texto: string) {
  const paragraphs = texto.split(/\n{2,}/)
  return paragraphs.map((para, pi) => {
    const lines = para.split('\n')
    return (
      <p key={pi} className="text-sm leading-relaxed" style={{ color: '#94A3B8', marginBottom: '0.75em' }}>
        {lines.map((line, li) => (
          <span key={li}>
            {li > 0 && <br />}
            {renderBold(line)}
          </span>
        ))}
      </p>
    )
  })
}

export default function MateriaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { lang, t } = useLanguage()
  const loc = (es: string, en: string) => lang === 'en' && en ? en : es

  const [materia, setMateria] = useState<Materia | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('contenido')
  const [semanaAbierta, setSemanaAbierta] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/alumno/materia/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('No tienes acceso a esta materia')
        return r.json()
      })
      .then(data => {
        setMateria(data)
        if (data.semanas?.length > 0) setSemanaAbierta(data.semanas[0].id)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5B6CFF' }} />
    </div>
  )

  if (error || !materia) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <p className="text-sm" style={{ color: '#EF4444' }}>{error ?? 'Materia no encontrada'}</p>
      <button onClick={() => router.back()} className="text-sm" style={{ color: '#5B6CFF' }}>Regresar</button>
    </div>
  )

  const tabs: { key: Tab; label: string }[] = [
    { key: 'contenido', label: t('subjects.tabContent') },
    { key: 'examen', label: t('subjects.tabExam') },
    { key: 'informacion', label: t('subjects.tabInfo') },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="mt-1 p-2 rounded-lg transition-all flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#94A3B8', border: '1px solid #2A2F3E' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(91,108,255,0.15)', color: '#7B8AFF' }}>
              {materia.codigo}
            </span>
            <div className="w-2 h-2 rounded-full" style={{ background: materia.color_hex || '#5B6CFF' }} />
          </div>
          <h2 className="text-xl font-bold mt-1" style={{ color: '#F1F5F9' }}>{loc(materia.nombre, materia.nombre_en)}</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto" style={{ borderBottom: '1px solid #2A2F3E' }}>
        <div className="flex min-w-max">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-4 py-2.5 text-sm font-medium transition-all relative whitespace-nowrap"
              style={{ color: tab === t.key ? '#F1F5F9' : '#94A3B8' }}
            >
              {t.label}
              {tab === t.key && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: '#5B6CFF' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Contenido */}
      {tab === 'contenido' && (
        <div className="space-y-2">
          {materia.semanas.length === 0 ? (
            <div className="flex items-center justify-center py-12 rounded-xl" style={CARD}>
              <p className="text-sm" style={{ color: '#94A3B8' }}>{t('subjects.noWeeks')}</p>
            </div>
          ) : (
            materia.semanas.map(semana => {
              const abierta = semanaAbierta === semana.id
              return (
                <div key={semana.id} className="rounded-xl overflow-hidden" style={CARD}>
                  <button
                    onClick={() => setSemanaAbierta(abierta ? null : semana.id)}
                    className="w-full flex items-center justify-between px-3 sm:px-5 py-3.5 transition-all text-left"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0"
                        style={{ background: abierta ? 'rgba(91,108,255,0.2)' : 'rgba(255,255,255,0.06)', color: abierta ? '#5B6CFF' : '#94A3B8' }}
                      >
                        {semana.numero}
                      </span>
                      <span className="text-sm font-medium" style={{ color: '#F1F5F9' }}>{loc(semana.titulo, semana.titulo_en)}</span>
                    </div>
                    {abierta
                      ? <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
                      : <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
                    }
                  </button>

                  {abierta && (
                    <div className="px-3 sm:px-5 pb-4 sm:pb-5 space-y-4" style={{ borderTop: '1px solid #2A2F3E' }}>
                      {/* Contenido */}
                      {(lang === 'en' ? (semana.contenido_en || semana.contenido) : semana.contenido) && (
                        <div className="pt-4 space-y-1">
                          {renderTexto(loc(semana.contenido, semana.contenido_en))}
                        </div>
                      )}

                      {/* Videos */}
                      {(semana.videos?.length > 0 || (lang === 'en' && semana.url_en)) && (
                        <div className="space-y-2 pt-2">
                          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>{t('subjects.videos')}</p>

                          {/* Recurso en inglés (solo cuando lang === 'en' y url_en existe) */}
                          {lang === 'en' && semana.url_en && (
                            <a
                              href={semana.url_en}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                              style={{ ...INPUT_BG, border: '1px solid rgba(91,108,255,0.3)' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#5B6CFF' }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(91,108,255,0.3)' }}
                            >
                              <PlayCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#7B8AFF' }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: '#F1F5F9' }}>{semana.titulo} — English Version</p>
                                <p className="text-xs mt-0.5" style={{ color: '#7B8AFF' }}>EN</p>
                              </div>
                            </a>
                          )}

                          {semana.videos.map((v, i) => (
                            <a
                              key={i}
                              href={loc(v.url, v.url_en)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                              style={{ ...INPUT_BG, border: '1px solid #2A2F3E' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#5B6CFF' }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2A2F3E' }}
                            >
                              <PlayCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#5B6CFF' }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: '#F1F5F9' }}>{loc(v.titulo, v.titulo_en)}</p>
                                {v.duracion && <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{v.duracion}</p>}
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Tab: Examen */}
      {tab === 'examen' && (
        <div className="space-y-4">
          {materia.evaluaciones.length === 0 ? (
            <div className="flex items-center justify-center py-12 rounded-xl" style={CARD}>
              <p className="text-sm" style={{ color: '#94A3B8' }}>{t('subjects.noExams')}</p>
            </div>
          ) : (
            materia.evaluaciones.map(ev => {
              const intentosRestantes = ev.intentos_max - ev.intentos_usados
              return (
                <div key={ev.id} className="rounded-xl p-5 space-y-4" style={CARD}>
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: '#F1F5F9' }}>{loc(ev.titulo, ev.titulo_en)}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: '#94A3B8' }}>
                      <span>{t('subjects.attemptsLabel')} {ev.intentos_usados}/{ev.intentos_max}</span>
                    </div>
                  </div>

                  {ev.aprobada ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <span className="text-lg">✓</span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#10B981' }}>{t('subjects.alreadyPassed')}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                          {t('subjects.gradeLabel')} <strong style={{ color: '#10B981' }}>{ev.calificacion_aprobatoria}</strong>
                        </p>
                      </div>
                    </div>
                  ) : intentosRestantes <= 0 ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <span className="text-lg">✗</span>
                      <p className="text-sm font-semibold" style={{ color: '#EF4444' }}>{t('subjects.noAttemptsLeft')}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => router.push(`/alumno/evaluacion/${ev.id}`)}
                      className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
                      style={{ background: '#5B6CFF', color: '#fff' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#7B8AFF' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#5B6CFF' }}
                    >
                      {t('subjects.takeExam')} ({intentosRestantes} {intentosRestantes !== 1 ? t('subjects.attemptPlural') : t('subjects.attemptSingular')} {intentosRestantes !== 1 ? t('subjects.availablePlural') : t('subjects.availableSingular')})
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Tab: Información */}
      {tab === 'informacion' && (
        <div className="space-y-4">
          {/* Descripción / Objetivo */}
          {(materia.descripcion || materia.objetivo) && (
            <div className="rounded-xl p-5 space-y-2" style={CARD}>
              <h3 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{t('subjects.descriptionLabel')}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                {loc(materia.descripcion || materia.objetivo, materia.descripcion_en)}
              </p>
            </div>
          )}
          {/* Objetivo (solo si es distinto de descripción) */}
          {materia.objetivo && materia.objetivo !== materia.descripcion && (
            <div className="rounded-xl p-5 space-y-2" style={CARD}>
              <h3 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{t('subjects.objectiveLabel')}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{loc(materia.objetivo, materia.objetivo_en)}</p>
            </div>
          )}

          {/* Temario */}
          {materia.temario?.length > 0 && (
            <div className="rounded-xl p-5 space-y-3" style={CARD}>
              <h3 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{t('subjects.syllabus')}</h3>
              <ol className="space-y-2">
                {materia.temario.map((tema, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold" style={{ background: 'rgba(91,108,255,0.15)', color: '#5B6CFF' }}>
                      {i + 1}
                    </span>
                    <span style={{ color: '#94A3B8' }}>{tema}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Bibliografía */}
          {materia.bibliografia?.length > 0 && (
            <div className="rounded-xl p-5 space-y-3" style={CARD}>
              <h3 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{t('subjects.bibliography')}</h3>
              <ul className="space-y-2">
                {materia.bibliografia.map((bib, i) => {
                  const etiqueta = bib.tipo ? `${bib.titulo} (${bib.tipo})` : bib.titulo
                  return (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#5B6CFF' }} />
                      {bib.url ? (
                        <a
                          href={bib.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm transition-colors"
                          style={{ color: '#5B6CFF' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#7B8AFF' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#5B6CFF' }}
                        >
                          {etiqueta}
                        </a>
                      ) : (
                        <span className="text-sm" style={{ color: '#94A3B8' }}>{etiqueta}</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
