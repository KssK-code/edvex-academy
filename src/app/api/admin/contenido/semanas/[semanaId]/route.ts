import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/supabase/verify-admin'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { semanaId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const denied = await verifyAdmin(supabase, user.id)
    if (denied) return denied

    const { videos } = await req.json()
    if (!Array.isArray(videos)) {
      return NextResponse.json({ error: 'videos debe ser un array' }, { status: 400 })
    }

    // Validar estructura de cada video
    for (const v of videos) {
      if (typeof v.titulo !== 'string' || typeof v.url !== 'string' || typeof v.duracion !== 'string') {
        return NextResponse.json({ error: 'Cada video debe tener titulo, url y duracion (strings)' }, { status: 400 })
      }
    }

    const admin = createAdminClient()

    const { error } = await admin
      .from('semanas')
      .update({ videos })
      .eq('id', params.semanaId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
