import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/supabase/verify-admin'

type UsuariosData = { nombre_completo: string; email: string; activo: boolean }
type AlumnoRow = {
  id: string
  matricula: string
  meses_desbloqueados: number
  created_at: string
  usuario_id: string
  plan_estudio_id: string
  usuarios: UsuariosData | UsuariosData[] | null
  planes_estudio: { id: string; nombre: string; duracion_meses: number; precio_mensual: number } | null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const denied = await verifyAdmin(supabase, user.id)
    if (denied) return denied

    // Usar service role para bypass de RLS en el join con usuarios
    const admin = createAdminClient()

    const { data: alumno, error } = await admin
      .from('alumnos')
      .select(`
        *,
        usuarios (nombre_completo, email, activo),
        planes_estudio (id, nombre, duracion_meses, precio_mensual)
      `)
      .eq('id', params.id)
      .single()

    if (error || !alumno) return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })

    const a = alumno as unknown as AlumnoRow

    const { data: pagos } = await admin
      .from('pagos')
      .select('*')
      .eq('alumno_id', params.id)
      .order('created_at', { ascending: false })

    const { data: calificaciones } = await admin
      .from('calificaciones')
      .select('*, materias (nombre, codigo)')
      .eq('alumno_id', params.id)

    const usuariosData = Array.isArray(a.usuarios) ? a.usuarios[0] : a.usuarios

    return NextResponse.json({
      id: a.id,
      matricula: a.matricula,
      meses_desbloqueados: a.meses_desbloqueados,
      created_at: a.created_at,
      usuario: {
        id: a.usuario_id,
        nombre_completo: usuariosData?.nombre_completo ?? '',
        email: usuariosData?.email ?? '',
        activo: usuariosData?.activo ?? true,
      },
      plan: {
        id: a.planes_estudio?.id ?? a.plan_estudio_id,
        nombre: a.planes_estudio?.nombre ?? '',
        duracion_meses: a.planes_estudio?.duracion_meses ?? 0,
        precio_mensual: a.planes_estudio?.precio_mensual ?? 0,
      },
      pagos: pagos ?? [],
      calificaciones: calificaciones ?? [],
    })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const denied = await verifyAdmin(supabase, user.id)
    if (denied) return denied

    const body = await request.json()

    const { data: alumno, error: fetchError } = await supabase
      .from('alumnos')
      .select('usuario_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !alumno) return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })

    const { error } = await supabase
      .from('usuarios')
      .update({ activo: body.activo })
      .eq('id', (alumno as { usuario_id: string }).usuario_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const denied = await verifyAdmin(supabase, user.id)
    if (denied) return denied

    const { data: alumno, error: fetchError } = await supabase
      .from('alumnos')
      .select('usuario_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !alumno) return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })

    const { error } = await supabase
      .from('usuarios')
      .update({ activo: false })
      .eq('id', (alumno as { usuario_id: string }).usuario_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
