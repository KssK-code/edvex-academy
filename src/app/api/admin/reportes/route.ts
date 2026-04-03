import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/supabase/verify-admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const denied = await verifyAdmin(supabase, user.id)
    if (denied) return denied

    // Usar service role para todas las queries de datos (bypass RLS)
    const admin = createAdminClient()

    // Total alumnos
    const { count: totalAlumnos } = await admin
      .from('alumnos')
      .select('*', { count: 'exact', head: true })

    // Alumnos activos (join con usuarios)
    const { data: alumnosData } = await admin
      .from('alumnos')
      .select('meses_desbloqueados, usuarios(activo)')

    type AlumnoR = { meses_desbloqueados: number; usuarios: { activo: boolean } | null }
    const alumnosList = (alumnosData ?? []) as unknown as AlumnoR[]
    const alumnosActivos = alumnosList.filter(a => a.usuarios?.activo !== false).length
    const promMeses = alumnosList.length > 0
      ? alumnosList.reduce((s, a) => s + (a.meses_desbloqueados ?? 0), 0) / alumnosList.length
      : 0

    // Total ingresos
    const { data: pagosData } = await admin.from('pagos').select('monto, alumno_id, metodo_pago, created_at, alumnos(usuarios(nombre_completo))')
    type PagoR = { monto: number; alumno_id: string; metodo_pago: string; created_at: string; alumnos: { usuarios: { nombre_completo: string } | null } | null }
    const pagosList = (pagosData ?? []) as unknown as PagoR[]
    const totalIngresos = pagosList.reduce((s, p) => s + (p.monto ?? 0), 0)

    // Pagos recientes (últimos 20)
    const pagosRecientes = pagosList
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)
      .map(p => ({
        alumno: p.alumnos?.usuarios?.nombre_completo ?? '—',
        monto: p.monto,
        metodo_pago: p.metodo_pago,
        created_at: p.created_at,
      }))

    // Rendimiento por materia
    const { data: califs } = await admin
      .from('calificaciones')
      .select('materia_id, aprobada, materias(codigo, nombre)')

    type CalifR = { materia_id: string; aprobada: boolean; materias: { codigo: string; nombre: string } | null }
    const califsList = (califs ?? []) as unknown as CalifR[]

    const materiaMap = new Map<string, { codigo: string; nombre: string; aprobados: number; reprobados: number }>()
    for (const c of califsList) {
      if (!c.materia_id) continue
      if (!materiaMap.has(c.materia_id)) {
        materiaMap.set(c.materia_id, {
          codigo: c.materias?.codigo ?? '',
          nombre: c.materias?.nombre ?? '',
          aprobados: 0,
          reprobados: 0,
        })
      }
      const entry = materiaMap.get(c.materia_id)!
      if (c.aprobada) entry.aprobados++
      else entry.reprobados++
    }

    const rendimientoMaterias = Array.from(materiaMap.entries()).map(([id, v]) => {
      const total = v.aprobados + v.reprobados
      return {
        materia_id: id,
        codigo: v.codigo,
        nombre: v.nombre,
        total_cursaron: total,
        aprobados: v.aprobados,
        reprobados: v.reprobados,
        porcentaje_aprobacion: total > 0 ? Math.round((v.aprobados / total) * 100) : 0,
      }
    }).sort((a, b) => b.total_cursaron - a.total_cursaron)

    return NextResponse.json({
      stats: {
        total_alumnos: totalAlumnos ?? 0,
        alumnos_activos: alumnosActivos,
        total_ingresos: totalIngresos,
        promedio_meses: Math.round(promMeses * 10) / 10,
      },
      rendimiento_materias: rendimientoMaterias,
      pagos_recientes: pagosRecientes,
    })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
