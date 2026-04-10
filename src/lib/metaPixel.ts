export const trackCrearCuenta = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', 'CrearCuenta')
  }
}

export const trackAgendarLlamada = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', 'AgendarLlamada')
  }
}

export const trackPurchase = (value: number) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Purchase', { value, currency: 'USD' })
  }
}
