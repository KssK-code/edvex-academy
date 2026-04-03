import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/supabase/verify-admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: { alumnoId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const denied = await verifyAdmin(supabase, user.id)
    if (denied) return denied

    const admin = createAdminClient()

    const { data: documentos, error } = await admin
      .from('documentos_alumno')
      .select('*')
      .eq('alumno_id', params.alumnoId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Generar URLs firmadas para cada documento (válidas 24 horas)
    const docs = await Promise.all(
      (documentos ?? []).map(async (doc) => {
        const ext = doc.nombre_archivo.split('.').pop()?.toLowerCase() ?? 'pdf'
        const storagePath = `${params.alumnoId}/${doc.tipo}.${ext}`
        const { data: signed } = await admin.storage
          .from('documentos')
          .createSignedUrl(storagePath, 86400)
        return { ...doc, signed_url: signed?.signedUrl ?? null }
      })
    )

    return NextResponse.json(docs)
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { alumnoId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const denied = await verifyAdmin(supabase, user.id)
    if (denied) return denied

    const { documentoId, estado, comentario } = await req.json()
    if (!documentoId || !estado) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const estadosValidos = ['pendiente', 'aprobado', 'rechazado']
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { error } = await admin
      .from('documentos_alumno')
      .update({
        estado,
        comentario_admin: comentario ?? null,
        revisado_en: new Date().toISOString(),
      })
      .eq('id', documentoId)
      .eq('alumno_id', params.alumnoId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
