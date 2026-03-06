'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Search, Plus, X, Loader2, Eye } from 'lucide-react'

interface Alumno {
  id: string
  nombre_completo: string
  email: string
  activo: boolean
  matricula: string
  plan_nombre: string
  duracion_meses: number
  meses_desbloqueados: number
  created_at: string
}

interface Plan {
  id: string
  nombre: string
  duracion_meses: number
  precio_mensual: number
}

const INPUT_STYLE = {
  background: '#0B0D11',
  border: '1px solid #2A2F3E',
  color: '#F1F5F9',
}

const CARD_STYLE = {
  background: '#181C26',
  border: '1px solid #2A2F3E',
}

export default function AlumnosPage() {
  const router = useRouter()
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nombre_completo: '',
    email: '',
    password: '',
    plan_estudio_id: '',
  })

  const cargarAlumnos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/alumnos')
      if (!res.ok) throw new Error('Error al cargar alumnos')
      setAlumnos(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar alumnos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarAlumnos()
    fetch('/api/admin/planes')
      .then(r => r.json())
      .then(setPlanes)
      .catch(() => {})
  }, [cargarAlumnos])

  const alumnosFiltrados = alumnos.filter(a =>
    a.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.matricula.toLowerCase().includes(busqueda.toLowerCase())
  )

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error ?? 'Error al crear alumno')
        return
      }
      setModalOpen(false)
      setForm({ nombre_completo: '', email: '', password: '', plan_estudio_id: '' })
      await cargarAlumnos()
    } catch {
      setFormError('Error inesperado. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#F1F5F9' }}>Alumnos</h2>
          <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>
            Gestiona los alumnos registrados en la plataforma
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
          style={{ background: '#5B6CFF', color: '#fff' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#7B8AFF' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#5B6CFF' }}
        >
          <Plus className="w-4 h-4" />
          Nuevo Alumno
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94A3B8' }} />
        <input
          type="text"
          placeholder="Buscar por nombre, email o matrícula..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
          style={{ ...INPUT_STYLE }}
          onFocus={e => { e.currentTarget.style.border = '1px solid #5B6CFF' }}
          onBlur={e => { e.currentTarget.style.border = '1px solid #2A2F3E' }}
        />
      </div>

      {/* Tabla */}
      <div className="rounded-xl overflow-hidden" style={CARD_STYLE}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5B6CFF' }} />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
          </div>
        ) : alumnosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="w-10 h-10" style={{ color: '#2A2F3E' }} />
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {busqueda ? 'No se encontraron resultados' : 'No hay alumnos registrados'}
            </p>
          </div>
        ) : (
          <>
            {/* Cards en móvil */}
            <div className="sm:hidden divide-y" style={{ borderColor: '#2A2F3E' }}>
              {alumnosFiltrados.map(a => (
                <div key={a.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: '#F1F5F9' }}>{a.nombre_completo}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: '#94A3B8' }}>{a.email}</p>
                    </div>
                    <span
                      className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={a.activo
                        ? { background: 'rgba(16,185,129,0.15)', color: '#10B981' }
                        : { background: 'rgba(239,68,68,0.15)', color: '#EF4444' }
                      }
                    >
                      {a.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: '#94A3B8' }}>
                    <span className="font-mono">{a.matricula}</span>
                    <span>·</span>
                    <span>{a.plan_nombre || 'Sin plan'}</span>
                    <span>·</span>
                    <span>{a.meses_desbloqueados}/{a.duracion_meses} meses</span>
                  </div>
                  <button
                    onClick={() => router.push(`/admin/alumnos/${a.id}`)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium"
                    style={{ background: 'rgba(91,108,255,0.1)', color: '#7B8AFF', border: '1px solid rgba(91,108,255,0.2)' }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver detalle
                  </button>
                </div>
              ))}
            </div>

            {/* Tabla en desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #2A2F3E' }}>
                    {['Matrícula', 'Nombre', 'Email', 'Plan', 'Meses', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#94A3B8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alumnosFiltrados.map(a => (
                    <tr
                      key={a.id}
                      style={{ borderBottom: '1px solid rgba(42,47,62,0.5)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(91,108,255,0.04)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: '#94A3B8' }}>{a.matricula}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: '#F1F5F9' }}>{a.nombre_completo}</td>
                      <td className="px-4 py-3" style={{ color: '#94A3B8' }}>{a.email}</td>
                      <td className="px-4 py-3" style={{ color: '#94A3B8' }}>{a.plan_nombre}</td>
                      <td className="px-4 py-3">
                        <span style={{ color: '#F1F5F9' }}>{a.meses_desbloqueados}</span>
                        <span style={{ color: '#94A3B8' }}>/{a.duracion_meses}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={a.activo
                            ? { background: 'rgba(16,185,129,0.15)', color: '#10B981' }
                            : { background: 'rgba(239,68,68,0.15)', color: '#EF4444' }
                          }
                        >
                          {a.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/admin/alumnos/${a.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ background: 'rgba(91,108,255,0.1)', color: '#7B8AFF', border: '1px solid rgba(91,108,255,0.2)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,108,255,0.2)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(91,108,255,0.1)' }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal Nuevo Alumno */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={CARD_STYLE}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: '#F1F5F9' }}>Nuevo Alumno</h3>
              <button
                onClick={() => { setModalOpen(false); setFormError(null) }}
                className="p-1.5 rounded-lg"
                style={{ color: '#94A3B8' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCrear} className="space-y-4">
              {[
                { label: 'Nombre completo', key: 'nombre_completo', type: 'text', placeholder: 'Juan Pérez García' },
                { label: 'Correo electrónico', key: 'email', type: 'email', placeholder: 'alumno@ejemplo.com' },
                { label: 'Contraseña temporal', key: 'password', type: 'password', placeholder: '••••••••' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>{label}</label>
                  <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={INPUT_STYLE}
                    onFocus={e => { e.currentTarget.style.border = '1px solid #5B6CFF' }}
                    onBlur={e => { e.currentTarget.style.border = '1px solid #2A2F3E' }}
                  />
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>Plan de estudio</label>
                <select
                  required
                  value={form.plan_estudio_id}
                  onChange={e => setForm(prev => ({ ...prev, plan_estudio_id: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={INPUT_STYLE}
                >
                  <option value="">Selecciona un plan...</option>
                  {planes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} — {p.duracion_meses} meses
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <div className="rounded-lg px-3 py-2.5 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}>
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setFormError(null) }}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: '1px solid #2A2F3E' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
                  style={{ background: '#5B6CFF', color: '#fff' }}
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Creando...</> : 'Crear Alumno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
