import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/supabase/verify-admin'

export async function POST(
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
    const { monto, metodo_pago, referencia } = body

    if (!monto || !metodo_pago) {
      return NextResponse.json({ error: 'Monto y método de pago son requeridos' }, { status: 400 })
    }

    // RPC atómica: SELECT FOR UPDATE + UPDATE + INSERT en una sola transacción.
    // Elimina el race condition (two admins simultáneos) y garantiza que si el
    // INSERT de pago falla, el UPDATE de meses_desbloqueados hace rollback.
    const admin = createAdminClient()
    const { data: nuevoMes, error: rpcError } = await admin.rpc('desbloquear_mes', {
      p_alumno_id:      params.id,
      p_monto:          Number(monto),
      p_metodo_pago:    metodo_pago,
      p_referencia:     referencia ?? null,
      p_registrado_por: user.id,
    })

    if (rpcError) {
      const msg = rpcError.message ?? ''
      if (msg.includes('Alumno no encontrado')) {
        return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
      }
      if (msg.includes('ya tiene todos los meses')) {
        return NextResponse.json({ error: 'El alumno ya tiene todos los meses desbloqueados' }, { status: 400 })
      }
      return NextResponse.json({ error: msg || 'Error al desbloquear mes' }, { status: 500 })
    }

    return NextResponse.json({ success: true, meses_desbloqueados: nuevoMes })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
