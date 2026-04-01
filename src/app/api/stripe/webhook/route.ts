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
  const { alumnoId, moduloNumero, priceId } = session.metadata || {}

  if (!alumnoId) {
    console.error('[Stripe Webhook] metadata.alumnoId faltante')
    return NextResponse.json({ error: 'Metadata incompleta' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const PRICE_MODULO_ACELERADO = process.env.STRIPE_PRICE_MODULO_ACELERADO! // +2 meses

  if (moduloNumero === 'inscripcion') {
    // Pago de inscripción: activar cuenta + desbloquear Mes 1 + salir de demo
    const { error } = await supabase
      .from('alumnos')
      .update({ inscripcion_pagada: true, demo_activa: false, meses_desbloqueados: 1 })
      .eq('id', alumnoId)

    if (error) {
      console.error('[Stripe Webhook] Error actualizando inscripcion_pagada', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    console.log(`[Stripe Webhook] Inscripción pagada — alumno ${alumnoId} → meses_desbloqueados = 1`)

  } else if (moduloNumero === 'certificacion') {
    // Pago de certificación: solo registrar éxito (opcional: columna certificacion_pagada)
    // Sin actualización en BD por ahora.

  } else {
    // Módulo estándar (+1 mes) o acelerado (+2 meses)
    const incremento = priceId === PRICE_MODULO_ACELERADO ? 2 : 1

    const num = parseInt(moduloNumero, 10)
    if (Number.isNaN(num) || num < 1) {
      console.error('[Stripe Webhook] moduloNumero inválido:', moduloNumero)
      return NextResponse.json({ error: 'moduloNumero inválido' }, { status: 400 })
    }

    const { data: alumno } = await supabase
      .from('alumnos')
      .select('modulos_desbloqueados, meses_desbloqueados')
      .eq('id', alumnoId)
      .single()

    const currentModulos = Array.isArray(alumno?.modulos_desbloqueados)
      ? (alumno.modulos_desbloqueados as number[])
      : []
    const nextModulos = currentModulos.includes(num)
      ? currentModulos
      : [...currentModulos, num].sort((a, b) => a - b)

    const currentMeses = (alumno?.meses_desbloqueados as number) ?? 0
    const nextMeses = currentMeses + incremento

    const { error } = await supabase
      .from('alumnos')
      .update({ modulos_desbloqueados: nextModulos, meses_desbloqueados: nextMeses })
      .eq('id', alumnoId)

    if (error) {
      console.error('[Stripe Webhook] Error actualizando módulo', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    console.log(`[Stripe Webhook] Módulo ${num} pagado (${priceId === PRICE_MODULO_ACELERADO ? 'acelerado +2' : 'estándar +1'}) — alumno ${alumnoId} → meses_desbloqueados = ${nextMeses}`)
  }

  return NextResponse.json({ received: true })
}
