import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // Obtener alumno para verificar acceso
    const { data: alumnoData } = await supabase
      .from('alumnos')
      .select('id, meses_desbloqueados')
      .eq('usuario_id', user.id)
      .single()

    if (!alumnoData) return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })

    const alumno = alumnoData as { id: string; meses_desbloqueados: number }

    // Verificar que la materia pertenece a un mes desbloqueado
    const { data: mesData } = await supabase
      .from('materias')
      .select('mes_contenido_id, meses_contenido(numero)')
      .eq('id', params.id)
      .single()

    if (!mesData) return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })

    const mes = mesData as unknown as {
      mes_contenido_id: string
      meses_contenido: { numero: number } | null
    }

    const numeroMes = mes.meses_contenido?.numero ?? 0
    if (numeroMes > alumno.meses_desbloqueados) {
      return NextResponse.json({ error: 'No tienes acceso a esta materia' }, { status: 403 })
    }

    // Obtener materia completa con semanas y evaluaciones
    const { data: materia, error } = await supabase
      .from('materias')
      .select('*, semanas(*), evaluaciones(id, titulo, titulo_en, tipo, intentos_max, activa)')
      .eq('id', params.id)
      .single()

    if (error || !materia) return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })

    const m = materia as unknown as {
      id: string
      codigo: string
      nombre: string
      nombre_en: string
      color_hex: string
      descripcion: string
      descripcion_en: string
      objetivo: string
      temario: string[]
      bibliografia: Record<string, string>[]
      bibliografia_en?: Record<string, string>[]
      semanas: { id: string; numero: number; titulo: string; titulo_en?: string; contenido: string; contenido_en: string; url_en: string; videos: { titulo: string; titulo_en?: string; url: string; url_en?: string; duracion: string }[] }[]
      evaluaciones: { id: string; titulo: string; titulo_en: string; tipo: string; intentos_max: number; activa: boolean }[]
    }

    // Ordenar semanas por número
    const semanas = (m.semanas ?? []).sort((a, b) => a.numero - b.numero)

    // Para cada evaluación activa, obtener intentos usados
    const evaluacionesConIntentos = await Promise.all(
      (m.evaluaciones ?? [])
        .filter(e => e.activa)
        .map(async (ev) => {
          const { count } = await supabase
            .from('intentos_evaluacion')
            .select('id', { count: 'exact', head: true })
            .eq('alumno_id', alumno.id)
            .eq('evaluacion_id', ev.id)

          // Verificar si aprobó
          const { data: aprobado } = await supabase
            .from('intentos_evaluacion')
            .select('calificacion, aprobado')
            .eq('alumno_id', alumno.id)
            .eq('evaluacion_id', ev.id)
            .eq('aprobado', true)
            .limit(1)
            .single()

          return {
            ...ev,
            intentos_usados: count ?? 0,
            aprobada: !!aprobado,
            calificacion_aprobatoria: aprobado?.calificacion ?? null,
          }
        })
    )

    return NextResponse.json({
      ...m,
      semanas,
      evaluaciones: evaluacionesConIntentos,
    })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
