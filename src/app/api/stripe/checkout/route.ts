/**
 * POST /api/stripe/checkout
 * Crea una sesión de Stripe Checkout para pagos EDVEX.
 * Body: { tipo, moduloNumero }
 * tipo: 'inscripcion' | 'modulo_estandar' | 'modulo_acelerado' | 'certificacion'
 * El alumnoId se obtiene exclusivamente de la sesión autenticada — nunca del body.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

const PRICE_IDS: Record<string, string> = {
  inscripcion: process.env.STRIPE_PRICE_INSCRIPCION!,
  modulo_estandar: process.env.STRIPE_PRICE_MODULO_ESTANDAR!,
  modulo_acelerado: process.env.STRIPE_PRICE_MODULO_ACELERADO!,
  certificacion: process.env.STRIPE_PRICE_CERTIFICACION!,
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar sesión autenticada
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Obtener el alumnoId real desde la BD (nunca confiar en el body)
    const admin = createAdminClient()
    const { data: alumnoRow, error: alumnoError } = await admin
      .from('alumnos')
      .select('id, inscripcion_pagada, certificacion_pagada')
      .eq('usuario_id', user.id)
      .single()

    if (alumnoError || !alumnoRow) {
      console.error('[Stripe Checkout] alumno no encontrado para usuario', user.id)
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 403 })
    }

    const alumnoId = alumnoRow.id

    // 3. Validar body (alumnoId del body es ignorado completamente)
    const body = await req.json()
    const { tipo, moduloNumero } = body as { tipo?: string; moduloNumero?: string }

    // 3b. Protección backend contra doble pago de inscripción o certificación
    if (tipo === 'inscripcion' && alumnoRow.inscripcion_pagada) {
      return NextResponse.json({ error: 'La inscripción ya fue pagada' }, { status: 409 })
    }
    if (tipo === 'certificacion' && alumnoRow.certificacion_pagada) {
      return NextResponse.json({ error: 'La certificación ya fue pagada' }, { status: 409 })
    }

    if (!tipo || moduloNumero === undefined) {
      return NextResponse.json(
        { error: 'Faltan tipo o moduloNumero' },
        { status: 400 }
      )
    }

    const priceId = PRICE_IDS[tipo]
    if (!priceId) {
      return NextResponse.json({ error: 'Tipo de pago no válido' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const successQuery =
      tipo === 'inscripcion'
        ? 'pago=exitoso&inscripcion=1'
        : 'pago=exitoso'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/alumno?${successQuery}`,
      cancel_url: `${baseUrl}/alumno?pago=cancelado`,
      metadata: {
        alumnoId,
        moduloNumero: String(moduloNumero),
        priceId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[Stripe Checkout]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al crear sesión' },
      { status: 500 }
    )
  }
}
