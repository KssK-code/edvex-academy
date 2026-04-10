type FbqFn = (...args: unknown[]) => void

function getFbq(): FbqFn | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as Window & { fbq?: FbqFn }
  return w.fbq
}

export const trackCrearCuenta = () => {
  const fbq = getFbq()
  if (fbq) fbq('trackCustom', 'CrearCuenta')
}

export const trackAgendarLlamada = () => {
  const fbq = getFbq()
  if (fbq) fbq('trackCustom', 'AgendarLlamada')
}

export const trackPurchase = (value: number) => {
  const fbq = getFbq()
  if (fbq) fbq('track', 'Purchase', { value, currency: 'USD' })
}
