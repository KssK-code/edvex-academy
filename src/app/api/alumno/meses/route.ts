import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEMO_MATERIA_ID = 'e3f004d8-4451-4a65-9c91-bac3f87d2378' // TUT101 — Tutoría de ingreso I

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // Obtener datos del alumno (incluye inscripcion_pagada para modo demo)
    const { data: alumnoData, error: alumnoError } = await supabase
      .from('alumnos')
      .select('meses_desbloqueados, inscripcion_pagada, planes_estudio(duracion_meses)')
      .eq('usuario_id', user.id)
      .single()

    if (alumnoError || !alumnoData) return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })

    const alumno = alumnoData as unknown as {
      meses_desbloqueados: number
      inscripcion_pagada: boolean
      planes_estudio: { duracion_meses: number } | null
    }

    // Modo demo: alumno sin pago de inscripción y sin meses desbloqueados
    if (!alumno.inscripcion_pagada && alumno.meses_desbloqueados === 0) {
      return NextResponse.json({ demo: true, materia_demo_id: DEMO_MATERIA_ID })
    }

    const duracionMeses = alumno.planes_estudio?.duracion_meses ?? 0

    // Obtener meses con sus materias
    const { data: meses, error: mesesError } = await supabase
      .from('meses_contenido')
      .select('*, materias(id, codigo, nombre, nombre_en, color_hex, descripcion, descripcion_en)')
      .order('numero')
      .lte('numero', duracionMeses)

    if (mesesError) return NextResponse.json({ error: mesesError.message }, { status: 500 })

    const result = (meses ?? []).map((mes: unknown) => {
      const m = mes as {
        id: string
        numero: number
        titulo: string
        materias: { id: string; codigo: string; nombre: string; nombre_en: string; color_hex: string; descripcion: string; descripcion_en: string }[]
      }
      return {
        ...m,
        desbloqueado: m.numero <= alumno.meses_desbloqueados,
      }
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
