'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Loader2, Lock } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface Perfil {
  id: string
  inscripcion_pagada: boolean
  modulos_desbloqueados: number[]
}

type TipoPago = 'inscripcion' | 'modulo_estandar' | 'modulo_acelerado' | 'certificacion'

const OPCIONES: {
  id: string
  tipo: TipoPago
  amount: number
  currency: string
  titleKey: 'payment.inscription' | 'payment.moduloEstandar' | 'payment.moduloAcelerado' | 'payment.certificacion'
  descKey: 'payment.inscriptionDesc' | 'payment.moduloEstandarDesc' | 'payment.moduloAceleradoDesc' | 'payment.certificacionDesc'
  moduloNumero: number | 'inscripcion' | 'certificacion'
}[] = [
  {
    id: 'inscripcion',
    tipo: 'inscripcion',
    amount: 50,
    currency: 'USD',
    titleKey: 'payment.inscription',
    descKey: 'payment.inscriptionDesc',
    moduloNumero: 'inscripcion',
  },
  {
    id: 'modulo-estandar',
    tipo: 'modulo_estandar',
    amount: 150,
    currency: 'USD',
    titleKey: 'payment.moduloEstandar',
    descKey: 'payment.moduloEstandarDesc',
    moduloNumero: 1,
  },
  {
    id: 'modulo-acelerado',
    tipo: 'modulo_acelerado',
    amount: 300,
    currency: 'USD',
    titleKey: 'payment.moduloAcelerado',
    descKey: 'payment.moduloAceleradoDesc',
    moduloNumero: 2,
  },
  {
    id: 'certificacion',
    tipo: 'certificacion',
    amount: 450,
    currency: 'USD',
    titleKey: 'payment.certificacion',
    descKey: 'payment.certificacionDesc',
    moduloNumero: 'certificacion',
  },
]

export default function PagarPage() {
  const { t } = useLanguage()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/alumno/perfil')
      .then(r => r.json())
      .then(p => setPerfil(p))
      .finally(() => setLoading(false))
  }, [])

  async function handlePay(opcion: (typeof OPCIONES)[number]) {
    if (!perfil) return
    if (opcion.id === 'inscripcion' && perfil.inscripcion_pagada) {
      return
    }
    if (opcion.id === 'certificacion' && (perfil.modulos_desbloqueados?.length ?? 0) < 6) {
      return
    }
    setPayingId(opcion.id)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: opcion.tipo,
          alumnoId: perfil.id,
          moduloNumero: opcion.moduloNumero,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear pago')
      if (data.url) window.location.href = data.url
      else throw new Error(t('payment.errorCheckout'))
    } catch (e) {
      console.error(e)
      alert(t('payment.errorCheckout'))
    } finally {
      setPayingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5B6CFF' }} />
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="text-sm" style={{ color: '#EF4444' }}>
        {t('profile.noProfile')}
      </div>
    )
  }

  const inscripcionPagada = perfil.inscripcion_pagada === true
  const tieneSeisModulos = (perfil.modulos_desbloqueados?.length ?? 0) >= 6

  // Mostrar siempre las 4 opciones; aplicar candado según estado
  const opcionesConCandado = OPCIONES.map((opcion) => {
    const esInscripcion = opcion.id === 'inscripcion'
    const esModulo = opcion.id === 'modulo-estandar' || opcion.id === 'modulo-acelerado'
    const esCertificacion = opcion.id === 'certificacion'

    let bloqueada = false
    let mensajeCandado: string | null = null

    if (esInscripcion) {
      bloqueada = perfil.inscripcion_pagada
    } else if (esModulo) {
      if (!inscripcionPagada) {
        bloqueada = true
        mensajeCandado = t('payment.payInscriptionFirst')
      }
    } else if (esCertificacion) {
      if (!tieneSeisModulos) {
        bloqueada = true
        mensajeCandado = t('payment.needSixModules')
      }
    }

    return { ...opcion, bloqueada, mensajeCandado }
  })

  return (
    <div className="max-w-2xl space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#F1F5F9' }}>
          {t('payment.title')}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
          {t('payment.subtitle')}
        </p>
      </div>

      <div className="grid gap-4">
        {opcionesConCandado.map((opcion) => {
          const disabled = opcion.bloqueada
          const isPaying = payingId === opcion.id

          return (
            <div
              key={opcion.id}
              className="rounded-xl p-4 flex flex-col gap-4 min-w-0 sm:flex-row sm:items-center sm:gap-4"
              style={{
                background: opcion.bloqueada ? 'rgba(24,28,38,0.7)' : '#181C26',
                border: '1px solid #2A2F3E',
                opacity: opcion.bloqueada ? 0.85 : 1,
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  {opcion.bloqueada && <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#64748B' }} />}
                  <p className="font-medium text-sm sm:text-base break-words" style={{ color: opcion.bloqueada ? '#94A3B8' : '#F1F5F9' }}>
                    {t(opcion.titleKey)}
                  </p>
                </div>
                <p className="text-xs mt-1 break-words leading-relaxed" style={{ color: '#64748B' }}>
                  {opcion.mensajeCandado ?? t(opcion.descKey)}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0 w-full sm:w-auto">
                <span className="text-lg font-semibold text-center sm:text-left" style={{ color: '#7B8AFF' }}>
                  ${opcion.amount} {opcion.currency}
                </span>
                <button
                  type="button"
                  onClick={() => handlePay(opcion)}
                  disabled={disabled || isPaying}
                  className="flex items-center justify-center gap-2 px-4 min-h-[48px] rounded-lg text-base font-medium touch-manipulation active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto sm:min-w-[140px]"
                  style={{
                    background: disabled ? '#374151' : '#5B6CFF',
                    color: '#fff',
                  }}
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('payment.redirecting')}
                    </>
                  ) : (
                    <>
                      {disabled ? <Lock className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                      {t('payment.pay')}
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
