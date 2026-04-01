/**
 * POST /api/stripe/webhook
 * Recibe eventos de Stripe (checkout.session.completed) y actualiza alumnos en Supabase.
 * Firma verificada con STRIPE_WEBHOOK_SECRET.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET no configurado')
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 500 })
  }

  let event: Stripe.Event
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') || ''

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Firma inválida'
    console.error('[Stripe Webhook]', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const { alumnoId, moduloNumero } = session.metadata || {}

  if (!alumnoId) {
    console.error('[Stripe Webhook] metadata.alumnoId faltante')
    return NextResponse.json({ error: 'Metadata incompleta' }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (moduloNumero === 'inscripcion') {
    const { error } = await supabase
      .from('alumnos')
      .update({ inscripcion_pagada: true, demo_activa: false })
      .eq('id', alumnoId)

    if (error) {
      console.error('[Stripe Webhook] Error actualizando inscripcion_pagada', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else if (moduloNumero === 'certificacion') {
    // Pago de certificación: solo registrar éxito (opcional: columna certificacion_pagada)
    // Sin actualización en BD por ahora.
  } else {
    // módulo numérico: agregar a modulos_desbloqueados
    const num = parseInt(moduloNumero, 10)
    if (Number.isNaN(num) || num < 1) {
      console.error('[Stripe Webhook] moduloNumero inválido:', moduloNumero)
      return NextResponse.json({ error: 'moduloNumero inválido' }, { status: 400 })
    }

    const { data: alumno } = await supabase
      .from('alumnos')
      .select('modulos_desbloqueados')
      .eq('id', alumnoId)
      .single()

    const current = Array.isArray(alumno?.modulos_desbloqueados)
      ? (alumno.modulos_desbloqueados as number[])
      : []
    const next = current.includes(num) ? current : [...current, num].sort((a, b) => a - b)

    const { error } = await supabase
      .from('alumnos')
      .update({ modulos_desbloqueados: next })
      .eq('id', alumnoId)

    if (error) {
      console.error('[Stripe Webhook] Error actualizando modulos_desbloqueados', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
