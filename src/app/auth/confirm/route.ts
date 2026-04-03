import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function matriculaUnica(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `ALU-${year}-${rand}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | 'recovery' | 'signup' | null

  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://edvexacademy.online'

  if (!token_hash || !type) {
    return NextResponse.redirect(`${base}/login?error=invalid_link`)
  }

  const supabase = await createClient()

  const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash, type })

  if (verifyError) {
    console.error('[auth/confirm] verifyOtp error:', verifyError.message)
    return NextResponse.redirect(`${base}/login?error=confirmation_failed`)
  }

  // Recuperar usuario recién autenticado
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const admin = createAdminClient()

    // Verificar si ya tiene fila en usuarios (registro previo o doble clic)
    const { data: existing } = await admin
      .from('usuarios')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existing) {
      const nombre_completo =
        (user.user_metadata?.nombre_completo as string | undefined)?.trim() ||
        user.email?.split('@')[0] ||
        ''

      const { data: planes } = await admin
        .from('planes_estudio')
        .select('id')
        .eq('activo', true)
        .limit(1)

      const planId = planes?.[0]?.id

      if (planId && user.email) {
        const { error: usuarioError } = await admin.from('usuarios').insert({
          id: user.id,
          email: user.email,
          nombre_completo,
          rol: 'ALUMNO',
          activo: true,
        })

        // Crear alumno solo si el usuario se insertó bien (o ya existía)
        if (!usuarioError || usuarioError.code === '23505') {
          let matricula = matriculaUnica()
          for (let i = 0; i < 10; i++) {
            const { error: alumnoError } = await admin.from('alumnos').insert({
              usuario_id: user.id,
              matricula,
              plan_estudio_id: planId,
              meses_desbloqueados: 0,
              inscripcion_pagada: false,
              modulos_desbloqueados: [],
            })
            if (!alumnoError) break
            if (alumnoError.code === '23505') { matricula = matriculaUnica(); continue }
            break
          }
        }
      }
    }
  }

  // Redirigir al alumno a la página de pago
  return NextResponse.redirect(`${base}/alumno/pagar`)
}
