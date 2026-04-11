type FbqFn = (...args: unknown[]) => void

function getFbq(): FbqFn | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as Window & { fbq?: FbqFn }
  return w.fbq
}

export const trackCrearCuenta = () => {
  console.log('META: trackCrearCuenta fired')
  const fbq = getFbq()
  if (!fbq) {
    console.log('META: fbq not found')
    return
  }
  fbq('trackCustom', 'CrearCuenta')
}

export const trackAgendarLlamada = () => {
  console.log('META: trackAgendarLlamada fired')
  const fbq = getFbq()
  if (!fbq) {
    console.log('META: fbq not found')
    return
  }
  fbq('trackCustom', 'AgendarLlamada')
}

export const trackPurchase = (value: number) => {
  const fbq = getFbq()
  if (fbq) fbq('track', 'Purchase', { value, currency: 'USD' })
}
